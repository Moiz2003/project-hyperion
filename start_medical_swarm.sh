#!/usr/bin/env bash
# start_medical_swarm.sh
# Launches a 3-agent medical AI swarm inside the 'rocm' container on AMD MI300X (192GB VRAM).
# Agents share the GPU via separate vLLM processes, each capped by --gpu-memory-utilization.
#
# Role      Port  Model                                         VRAM budget
# Drafter   8000  TheBloke/Meditron-70B-AWQ                     ~58 GB (0.30)
# Vision    8001  OpenGVLab/InternVL-Chat-V1-5-AWQ              ~35 GB (0.18)
# Critic    8002  casperhansen/llama-3-70b-instruct-awq         ~58 GB (0.30)
#                                                  Total  ≈ 151 GB / 192 GB

set -euo pipefail

CONTAINER_NAME="rocm"
IMAGE_NAME="rocm"
SESSION="medical_swarm"

DRAFTER_MODEL="TheBloke/Meditron-70B-AWQ"
VISION_MODEL="OpenGVLab/InternVL-Chat-V1-5-AWQ"
CRITIC_MODEL="casperhansen/llama-3-70b-instruct-awq"

# ── 1. Recreate container with all three ports exposed ────────────────────────
echo "[1/4] Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm   "$CONTAINER_NAME" 2>/dev/null || true

echo "[2/4] Starting rocm container (ports 8000/8001/8002)..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --device /dev/kfd \
  --device /dev/dri \
  --group-add video \
  --cap-add CAP_SYS_PTRACE \
  --security-opt seccomp=unconfined \
  --security-opt apparmor=unconfined \
  --shm-size=16g \
  -p 8000:8000 \
  -p 8001:8001 \
  -p 8002:8002 \
  -p 8888:8888 \
  -v /shared-docker:/shared-docker \
  -e ROCM_PATH=/opt/rocm \
  -e LD_LIBRARY_PATH=/opt/rocm/lib:/usr/local/lib: \
  -e "PYTORCH_ROCM_ARCH=gfx90a;gfx942;gfx950;gfx1100;gfx1101;gfx1200;gfx1201;gfx1150;gfx1151" \
  -e "AITER_ROCM_ARCH=gfx942;gfx950" \
  -e "MORI_GPU_ARCHS=gfx942;gfx950" \
  -e HSA_NO_SCRATCH_RECLAIM=1 \
  -e TOKENIZERS_PARALLELISM=false \
  -e SAFETENSORS_FAST_GPU=1 \
  -e HIP_FORCE_DEV_KERNARG=1 \
  -e "KINETO_CONFIG=/app/libkineto.conf" \
  "$IMAGE_NAME" sleep infinity

echo "    Waiting for container to be ready..."
sleep 5

# ── 2. Ensure latest transformers/accelerate and tmux ────────────────────────
echo "[3/4] Installing dependencies inside container..."
docker exec "$CONTAINER_NAME" bash -c "
  pip install -q --upgrade pip &&
  pip install -q git+https://github.com/huggingface/transformers.git &&
  pip install -q git+https://github.com/huggingface/accelerate.git &&
  which tmux >/dev/null 2>&1 || (apt-get update -qq && apt-get install -y -q tmux)
"

# ── 3. Write LLaMA-2 chat template (required by Meditron / any LLaMA-2 model) ─
TEMPLATE=/shared-docker/llama2_chat_template.jinja
docker exec "$CONTAINER_NAME" bash -c "cat > $TEMPLATE << 'JINJA'
{% if messages[0]['role'] == 'system' %}{% set loop_messages = messages[1:] %}{% set system_message = messages[0]['content'] %}{% else %}{% set loop_messages = messages %}{% set system_message = false %}{% endif %}{% for message in loop_messages %}{% if (message['role'] == 'user') != (loop.index0 % 2 == 0) %}{{ raise_exception('Conversation roles must alternate user/assistant/user/assistant/...') }}{% endif %}{% if loop.index0 == 0 and system_message != false %}{% set content = '<<SYS>>\n' + system_message + '\n<</SYS>>\n\n' + message['content'] %}{% else %}{% set content = message['content'] %}{% endif %}{% if message['role'] == 'user' %}{{ bos_token + '[INST] ' + content.strip() + ' [/INST]' }}{% elif message['role'] == 'assistant' %}{{ ' ' + content.strip() + ' ' + eos_token }}{% else %}{{ raise_exception('Only user and assistant roles are supported!') }}{% endif %}{% endfor %}
JINJA"

# ── 4. Launch swarm via tmux (sequential — avoids GPU memory profiling race) ──
echo "[4/4] Starting tmux session '$SESSION' with 3 vLLM servers (sequential)..."
docker exec "$CONTAINER_NAME" tmux kill-session -t "$SESSION" 2>/dev/null || true
docker exec "$CONTAINER_NAME" bash -c "rm -f /shared-docker/drafter.log /shared-docker/vision.log /shared-docker/critic.log"

# Create all three windows up front (idle)
docker exec "$CONTAINER_NAME" tmux new-session -d -s "$SESSION" -n critic
docker exec "$CONTAINER_NAME" tmux new-window  -t "$SESSION" -n vision
docker exec "$CONTAINER_NAME" tmux new-window  -t "$SESSION" -n drafter

_wait_ready() {
  local name=$1 logfile=$2
  echo "    Waiting for $name..."
  docker exec "$CONTAINER_NAME" bash -c "
    until grep -q 'Application startup complete' $logfile 2>/dev/null; do
      if grep -qE 'Error|Traceback' $logfile 2>/dev/null; then
        echo 'ERROR in $name:' && tail -5 $logfile; exit 1
      fi
      sleep 5
    done
  "
  docker exec "$CONTAINER_NAME" bash -c "grep -E 'GiB|startup complete' $logfile | tail -4"
}

# Start Critic first (largest model, stable baseline)
docker exec "$CONTAINER_NAME" \
  tmux send-keys -t "${SESSION}:critic" \
    "vllm serve $CRITIC_MODEL \
      --port 8002 --host 0.0.0.0 \
      --quantization awq \
      --gpu-memory-utilization 0.35 \
      --max-model-len 8192 \
      --dtype half \
      --trust-remote-code 2>&1 | tee /shared-docker/critic.log" Enter
_wait_ready "Critic" /shared-docker/critic.log

# Start Vision second
docker exec "$CONTAINER_NAME" \
  tmux send-keys -t "${SESSION}:vision" \
    "vllm serve $VISION_MODEL \
      --port 8001 --host 0.0.0.0 \
      --quantization awq \
      --gpu-memory-utilization 0.25 \
      --max-model-len 4096 \
      --dtype half \
      --trust-remote-code 2>&1 | tee /shared-docker/vision.log" Enter
_wait_ready "Vision" /shared-docker/vision.log

# Start Drafter last
docker exec "$CONTAINER_NAME" \
  tmux send-keys -t "${SESSION}:drafter" \
    "vllm serve $DRAFTER_MODEL \
      --port 8000 --host 0.0.0.0\
      --quantization awq \
      --gpu-memory-utilization 0.30 \
      --max-model-len 4096 \
      --dtype half \
      --trust-remote-code \
      --chat-template $TEMPLATE 2>&1 | tee /shared-docker/drafter.log" Enter
_wait_ready "Drafter" /shared-docker/drafter.log

cat <<EOF

Medical swarm is launching. Models download on first run — this may take several minutes.

Attach to logs:
  docker exec -it rocm tmux attach -t medical_swarm
  (Ctrl+B then 0/1/2 to switch windows)

Health checks (once ready):
  curl http://localhost:8000/health   # Drafter
  curl http://localhost:8001/health   # Vision
  curl http://localhost:8002/health   # Critic

EOF

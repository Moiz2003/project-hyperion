<div align="center">
  <table border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" valign="middle">
        <img src="client/public/hyperion-logo-icon.svg" width="100" alt="Hyperion Icon" />
      </td>
      <td align="left" valign="middle" style="padding-left: 20px;">
        <h1 style="border-bottom: none; margin: 0; padding: 0; line-height: 1;">HYPERION</h1>
        <p style="margin: 5px 0 0 0; padding: 0; color: #00D9FF; font-weight: bold; letter-spacing: 2px; font-size: 14px; text-transform: uppercase;">Clinical AI Engine</p>
      </td>
    </tr>
  </table>
  <br/>
  <p><strong>Radiology, Redefined by Consensus.</strong></p>
  <p>An enterprise-grade, adversarial AI swarm running on AMD Instinct™ accelerators, designed to extract, draft, and aggressively verify clinical findings in milliseconds—completely offline.</p>
</div>

---

## ⚡ The Core Problem

Standard medical AI relies on single, massive transformer models. When you force one model to simultaneously extract visual geometry (pixels) and synthesize clinical knowledge (text), the cognitive load causes **Hallucinations**. In a clinical setting, a hallucination isn't a bug; it's a critical liability.

## 🛡️ The Hyperion Solution

Hyperion abandons single-model frailty. Instead, it utilizes a localized **Adversarial Swarm Architecture** optimized for **AMD ROCm**. Three independent 70B-class agents handle distinct cognitive loads, verifying each other's outputs with mathematical precision before a final report is ever generated. Zero patient data ever leaves the room.

---

## 🧠 Swarm Architecture

The Hyperion Engine operates on a 3-Node localized network, powered by **vLLM** on **AMD MI300X**.

```mermaid
graph TD
    A[Raw X-Ray / MRI Scan] -->|Input| B(Node 1: Edge Vision)
    B -->|Geometry via InternVL-Chat-V1.5| C{Node 2: The Drafter}
    C -->|Synthesizes Preliminary Findings via Meditron-70B| D(Node 3: The Critic)
    D -->|Adversarial Audit: Compares Draft to Raw Pixels| C
    D -->|100% Consensus Reached| E[Verified Diagnostic Report]
    
    classDef vision fill:#0e7490,stroke:#22d3ee,stroke-width:2px,color:#fff
    classDef drafter fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff
    classDef critic fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef output fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    
    class B vision
    class C drafter
    class D critic
    class E output
```

### 1. Edge Vision (InternVL-Chat-V1.5)
A high-resolution multimodal agent dedicated entirely to geometry extraction. It doesn't diagnose; it maps pixel variances natively on AMD hardware using AWQ quantization for maximum throughput.

### 2. Drafter Node (Meditron-70B)
Takes the raw structural data from the Vision Node and cross-references it against a massive clinical knowledge base to write a preliminary impression. Powered by the world-class Meditron-70B model.

### 3. Critic Override (Llama-3-70B)
An independent auditor checks the draft against the raw data, violently rejecting hallucinations. Using Llama-3-70B's superior reasoning, a report is only finalized when the network reaches 100% consensus.

---

## 🏢 Dual-Market Functionality

Hyperion ships with two distinct operational modes, easily toggled from the React HUD.

| Mode | Target Market | Functionality |
| :--- | :--- | :--- |
| **Clinical Diagnostic** | Hospitals & Clinics | Provides instantaneous, deterministic, and perfectly verified diagnostic reports for immediate clinical review. |
| **Edu: Discovery** | Academic Residencies | Interactive masking of results. Residents must type their findings first. Features a "Request Hint" pedagogical nudge powered by the Critic Node. |

---

## 🛠️ Technology Stack

* **Frontend:** React, Tailwind CSS v4, Framer Motion (Physics-based cinematic UI).
* **Backend Orchestration:** Node.js, Express, Multer (File Handling).
* **AI Engine:** **vLLM (ROCm Optimized)** running AWQ-quantized 70B models.
* **Hardware:** **AMD Instinct™ MI300X (192GB VRAM)** for massive parallel inference.
* **Design System:** Deep-Space Glassmorphism, Custom SVG animated iconography.

---

## 🚀 Enterprise Installation Guide

Follow these steps to ignite the Hyperion Swarm on AMD hardware.

### Prerequisites
1. **Hardware:** AMD GPU with ROCm support (MI300X recommended, 128GB+ VRAM required).
2. **Software:** Docker, AMD GPU Drivers (ROCm 6.0+).
3. **Environment:** Node.js (v18+) for the orchestrator and HUD.

### Step 1: Ignite the Model Swarm
The swarm is automated via Docker. Run the following script to launch three vLLM instances (Drafter, Vision, Critic):
```bash
chmod +x start_medical_swarm.sh
./start_medical_swarm.sh
```
*Note: This will download approximately 150GB of model weights on the first run.*

### Step 2: Clone & Setup the HUD
```bash
# Clone the repository
git clone https://github.com/project-hyperion/core.git
cd project-hyperion

# Install Backend & Frontend Dependencies
cd server && npm install
cd ../client && npm install
```

### Step 3: Configure Environment Variables
Ensure your `/server/.env` points to the local vLLM nodes:
```bash
# /server/.env
PORT=3000
LOCAL_DRAFTER_URL=http://localhost:8000/v1
LOCAL_VISION_URL=http://localhost:8001/v1
LOCAL_CRITIC_URL=http://localhost:8002/v1

DRAFTER_MODEL=TheBloke/Meditron-70B-AWQ
VISION_MODEL=OpenGVLab/InternVL-Chat-V1-5-AWQ
CRITIC_MODEL=casperhansen/llama-3-70b-instruct-awq
```

### Step 4: Launch the React HUD
Start the orchestrator and the frontend:

**Terminal 1 (Backend):** `cd server && npm run dev`
**Terminal 2 (Frontend):** `cd client && npm run dev`

Open `http://localhost:5173`. Welcome to the Engine Room.

---

## ⚖️ Legal & Medical Disclaimer

> [!WARNING]
> **Diagnostic Augmentation Only:** Hyperion is an assistive tool, not an autonomous diagnostic agent. A licensed medical practitioner must always review the 'Verified Consensus Report' before initiating patient treatment. The creators are not liable for clinical misdiagnoses.

**Privacy Note:** Hyperion operates on a "Zero Data Retention" architecture. No Protected Health Information (PHI) is permanently stored or transmitted outside the ROCm container.

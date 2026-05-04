import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';

// Setup Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Setup CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));

app.use(express.json());

// Setup Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const deepseek = new OpenAI({ 
  baseURL: 'https://api.deepseek.com', 
  apiKey: process.env.DEEPSEEK_API_KEY 
});

// ==========================================
// AI Agent Stubs
// ==========================================

const runVisionAgent = async (imageBuffer) => {
  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt: 'You are an expert radiologist. Analyze this X-ray and describe the key findings concisely.',
        images: [base64Image],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const json = await response.json();
    return json.response;
  } catch (err) {
    console.error('Vision Agent Error (Ollama):', err.message);
    throw new Error('Vision inference failed. Ensure Ollama is running locally with the LLaVA model.');
  }
};

const runDrafterAgent = async (findings) => {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: "You are an expert radiologist. Write a brief, professional medical impression based on the provided raw visual findings. Keep it under 2 sentences." },
      { role: 'user', content: `Raw findings from Vision Agent: ${findings}` }
    ]
  });
  return response.choices[0].message.content.trim();
};

const runCriticAgent = async (draft, findings) => {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: "You are an aggressive auditing AI. Review the drafted medical report against the raw visual findings. Correct any hallucinations. Output ONLY the final verified medical report string." },
      { role: 'user', content: `Raw findings: ${findings}. Drafted Report: ${draft}` }
    ]
  });
  return response.choices[0].message.content.trim();
};

// ==========================================
// Routes
// ==========================================

app.post('/api/analyze-scan', upload.single('xray_image'), async (req, res) => {
  try {
    const startTime = Date.now();
    
    const file = req.file;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'No image uploaded.' });
    }

    // 1. Vision Agent (Analysis)
    const rawFindings = await runVisionAgent(file.buffer);

    // 2. Drafter Agent (Drafting)
    const draftReport = await runDrafterAgent(rawFindings);

    // 3. Critic Agent (Verification)
    const verifiedReport = await runCriticAgent(draftReport, rawFindings);

    const endTime = Date.now();
    const processingLatencyMs = endTime - startTime;
    const processingLatencySec = (processingLatencyMs / 1000).toFixed(1);

    // Orchestration Output
    return res.json({
      status: "success",
      processing_latency: `${processingLatencySec}s`,
      data: {
        raw_findings: rawFindings,
        verified_report: verifiedReport,
        critic_interventions: 1,
        urgency_flag: "High",
        recommended_dept: "Pulmonology / ER"
      }
    });

  } catch (error) {
    console.error("Error processing scan:", error);
    return res.status(500).json({ status: 'error', message: error.message || 'Internal server error during analysis.' });
  }
});

// ==========================================
// Server Start
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Project Hyperion API running on http://localhost:${PORT}`);
});

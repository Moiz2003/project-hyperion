import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DATA_DIR = path.join(__dirname, 'test_data');
const RESULTS_LOG = path.join(__dirname, 'test_results.log');
const API_URL = 'http://localhost:3000/api/analyze-scan';

// Helper to wait 2 seconds
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('🤖 Initializing QA Automation: Project Hyperion Swarm Batch Test\n');
  
  if (!fs.existsSync(TEST_DATA_DIR)) {
    console.error(`❌ Test data directory not found at ${TEST_DATA_DIR}. Please create it and add .png/.jpg files.`);
    process.exit(1);
  }

  const files = fs.readdirSync(TEST_DATA_DIR).filter(file => file.endsWith('.png') || file.endsWith('.jpg'));

  if (files.length === 0) {
    console.log('⚠️ No image files found in test_data directory.');
    return;
  }

  console.log(`📂 Found ${files.length} test image(s). Beginning batch execution...\n`);
  
  // Initialize log file
  fs.appendFileSync(RESULTS_LOG, `\n--- NEW BATCH TEST RUN: ${new Date().toISOString()} ---\n\n`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`⏳ Testing Image ${i + 1} of ${files.length} (${file})...`);
    
    const filePath = path.join(TEST_DATA_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create FormData using native fetch approaches (Blob)
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.endsWith('.png') ? 'image/png' : 'image/jpeg' });
    formData.append('xray_image', blob, file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      
      if (json.status === 'success') {
        const { verified_report, urgency_flag } = json.data;
        
        console.log(`✅ Success | Latency: ${json.processing_latency} | Urgency: ${urgency_flag}`);
        
        const logEntry = `[${file}]\nURGENCY: ${urgency_flag}\nREPORT: ${verified_report}\n--------------------------------------------------\n`;
        
        fs.appendFileSync(RESULTS_LOG, logEntry);
      } else {
        throw new Error(json.message || 'Unknown API error');
      }

    } catch (err) {
      console.error(`❌ Failed to process ${file}:`, err.message);
      fs.appendFileSync(RESULTS_LOG, `[${file}]\nERROR: ${err.message}\n--------------------------------------------------\n`);
    }

    // Apply rate-limit delay if not the last image
    if (i < files.length - 1) {
      console.log(`⏸️  Applying 2-second rate-limit delay...`);
      await delay(2000);
    }
  }

  console.log('\n🎉 Batch testing complete! Check test_results.log for full reports.');
}

runTests();

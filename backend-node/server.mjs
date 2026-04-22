/**
 * CodeShield Node.js Backend
 * Uses OpenRouter (for Gemini/GPT) + real ArmorClaw IAP audit logging.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── OpenClaw Execution ───────────────────────────────────────────────────────
function runOpenClaw(prompt) {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';

    const cmdArgs = [
      'openclaw.mjs',
      'agent',
      '--agent', 'main',
      '--model', 'google/gemini-3-flash-preview',
      '--message', prompt,
      '--json'
    ];

    const child = spawn('node', cmdArgs, {
      cwd: '/home/anshumandutta/openclaw-armoriq',
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDlK--d6TtwG_1YywocZBVGE1SAPdSKBJ8'
      }
    });

    child.stdout.on('data', data => output += data.toString());
    child.stderr.on('data', data => errorOutput += data.toString());

    child.on('close', () => {
      try {
        const startIdx = output.lastIndexOf('{');
        if (startIdx !== -1) {
          resolve(JSON.parse(output.substring(startIdx)));
        } else {
          resolve({ raw_output: output, stderr: errorOutput });
        }
      } catch (err) {
        resolve({ error: err.message, raw_output: output, stderr: errorOutput });
      }
    });
  });
}

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY       = process.env.OPEN_ROUTER_API_KEY || process.env.GEMINI_API_KEY; 
const ARMORCLAW_KEY  = process.env.ARMORCLAW_API_KEY || 'ak_live_accd8b2681104d6fb231c4127074357cbe8722f49cac151edc7c6dd59bb10689';
const IAP_URL       = 'https://customer-api.armoriq.ai';
const AGENT_ID      = 'codeshield-agent-001';
const USER_ID       = 'chain.chapter.dao@gmail.com';

const ALLOWED_DIRS = [
  '/home/anshumandutta',
];

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const logs = [];

// ─── ArmorClaw IAP Audit Logging ─────────────────────────────────────────────
async function logAudit(toolName, resourcePath, intent, allowed = true, reason = 'Allowed by CodeShield policy') {
  try {
    const payload = {
      api_key:    ARMORCLAW_KEY,
      agent_id:   AGENT_ID,
      user_id:    USER_ID,
      tool_name:  toolName,
      resource:   resourcePath,
      intent,
      allowed,
      reason,
      timestamp:  new Date().toISOString(),
      context_id: 'default',
    };

    const res = await fetch(`${IAP_URL}/iap/audit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[ArmorClaw ✅] Audit logged — tool=${toolName} resource=${resourcePath} audit_id=${data?.audit_id ?? 'n/a'}`);
    } else {
      console.warn(`[ArmorClaw ⚠️] Audit failed (${res.status})`);
    }
    return data;
  } catch (err) {
    console.error(`[ArmorClaw ❌] Network error: ${err.message}`);
    return null;
  }
}

// ─── Security: Path Whitelist ────────────────────────────────────────────────
function isPathAllowed(filePath) {
  const abs = path.resolve(filePath);
  return ALLOWED_DIRS.some(base => abs.startsWith(path.resolve(base)));
}

// ─── AI: Analyze Code (via OpenRouter) ──────────────────────────────────────
async function analyzeWithAI(code) {
  const prompt = `You are an expert code reviewer and debugger. Analyze this code carefully.

Return ONLY valid JSON (no markdown fences) in exactly this format:
{
  "bugs": ["describe bug 1", "describe bug 2"],
  "fixed_code": "the complete corrected code here",
  "quality_score": 85,
  "explanation": "summary of what was fixed"
}

Code to analyze:
\`\`\`
${code}
\`\`\``;

  console.log(`[AI 🚀] Delegating analysis to OpenRouter...`);
  const MODELS = [
    'google/gemini-2.0-flash-001',
    'google/gemini-pro-1.5',
    'openai/gpt-4o-mini'
  ];

  const API_KEY = process.env.OPEN_ROUTER_API_KEY;
  if (!API_KEY) {
    throw new Error('OPEN_ROUTER_API_KEY is missing in .env');
  }

  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://codeshield.app',
          'X-Title': 'CodeShield'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn(`[OpenRouter ⚠️] ${model} failed: ${data.error?.message || response.statusText}`);
        continue;
      }

      const text = data.choices[0].message.content.trim();
      const parsed = JSON.parse(text);
      console.log(`[AI ✅] Analysis complete using model: ${model}`);
      return parsed;
    } catch (err) {
      console.error(`[AI ❌] Error with ${model}:`, err.message);
      continue;
    }
  }
  
  throw new Error('All AI models failed on OpenRouter. Check your API key and balance.');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'Node.js + ArmorClaw + OpenRouter' });
});

app.post('/analyze_code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Missing code' });

    await logAudit('analyze_code', 'code-snippet', `Analyzing code snippet`);
    const result = await analyzeWithAI(code);
    await logAudit('analyze_code_complete', 'code-snippet', `Analysis finished`);

    logs.push({ id: logs.length + 1, timestamp: new Date().toISOString(), type: 'code_analysis', input: code.slice(0, 100), result });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[analyze_code]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/analyze_project', async (req, res) => {
  try {
    const projectPath = req.body.path;
    if (!projectPath || !isPathAllowed(projectPath)) {
      return res.status(403).json({ success: false, error: 'Invalid or forbidden path' });
    }

    await logAudit('list_files', projectPath, `Scanning project`);
    
    const steps = [];
    const modifiedFiles = [];
    const items = fs.readdirSync(projectPath).filter(f => /\.(py|js|ts|jsx|tsx)$/.test(f));

    for (const file of items) {
      const fullPath = path.join(projectPath, file);
      await logAudit('read_file', fullPath, `Reading file`);
      
      const code = fs.readFileSync(fullPath, 'utf-8');
      if (!code.trim()) continue;

      try {
        const analysis = await analyzeWithAI(code);
        const hasBugs = analysis.bugs?.length > 0 && !analysis.bugs[0].toLowerCase().includes('no bug');
        
        if (hasBugs) {
          await logAudit('write_file', fullPath, `Fixing bugs`);
          fs.writeFileSync(fullPath, analysis.fixed_code, 'utf-8');
          modifiedFiles.push({ file, bugs: analysis.bugs });
          steps.push(`✅ Fixed ${file}`);
        } else {
          steps.push(`✅ ${file} (Clean)`);
        }
      } catch (err) {
        steps.push(`❌ ${file} failed: ${err.message}`);
      }
    }

    await logAudit('project_complete', projectPath, `Analyzed ${items.length} files`);
    res.json({ success: true, steps, modified_files: modifiedFiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/logs', (_req, res) => res.json({ success: true, data: logs.slice(-50) }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  CodeShield Node.js Backend`);
  console.log(`✅  Running on http://0.0.0.0:${PORT}`);
  console.log(`🤖  AI: OpenRouter (Multi-model fallback)`);
  console.log(`🔐  ArmorClaw: Active\n`);
});

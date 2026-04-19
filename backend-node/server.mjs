/**
 * CodeShield Node.js Backend
 * Uses Gemini AI + real ArmorClaw IAP audit logging.
 * Every file read/write/code analysis is logged to the ArmorIQ dashboard.
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY;
const ARMORCLAW_KEY    = process.env.ARMORCLAW_API_KEY || 'ak_live_accd8b2681104d6fb231c4127074357cbe8722f49cac151edc7c6dd59bb10689';
const IAP_URL          = 'https://customer-api.armoriq.ai';
const AGENT_ID         = 'codeshield-agent-001';
const USER_ID          = 'chain.chapter.dao@gmail.com';

// Model fallback chain — tries each in order if previous returns 503/429
const MODEL_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

const ALLOWED_DIRS = [
  '/home/anshumandutta',
  path.resolve(__dirname, '../user/project'),
];

// ─── Gemini Client ──────────────────────────────────────────────────────────
const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}

    if (res.ok) {
      console.log(`[ArmorClaw ✅] Audit logged — tool=${toolName} resource=${resourcePath} audit_id=${data?.audit_id ?? 'n/a'}`);
    } else {
      console.warn(`[ArmorClaw ⚠️]  Audit failed (${res.status}): ${text}`);
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

// ─── Gemini: Analyze Code (with retry + model fallback) ─────────────────────
async function analyzeWithGemini(code) {
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

  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await genai.models.generateContent({ model, contents: prompt });
        let text = result.text.trim()
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```$/m, '')
          .trim();
        const parsed = JSON.parse(text);
        if (model !== MODEL_CHAIN[0]) console.log(`[Gemini] Used fallback model: ${model}`);
        return parsed;
      } catch (err) {
        const is503 = err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand');
        const is429 = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota');
        if ((is503 || is429) && attempt < 3) {
          const delay = attempt * 2000; // 2s, 4s backoff
          console.warn(`[Gemini ⚠️] ${model} attempt ${attempt} failed (${is503 ? '503' : '429'}), retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        if (is503 || is429) {
          console.warn(`[Gemini] ${model} exhausted, trying next model...`);
          break; // try next model in chain
        }
        throw err; // real error, bubble up
      }
    }
  }
  throw new Error('All Gemini models are currently busy. Please try again in a minute.');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status:       'ok',
    service:      'CodeShield',
    engine:       'Node.js + ArmorClaw',
    armorclaw:    'active',
    iap_endpoint: IAP_URL,
  });
});

// Code Mode ───────────────────────────────────────────────────────────────────
app.post('/analyze_code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Missing code' });

    // 🛡️ Log intent to ArmorClaw BEFORE analysis
    await logAudit(
      'analyze_code',
      'in-memory:code-snippet',
      `AI analysis of ${code.length}-char code snippet`,
    );

    const result = await analyzeWithGemini(code);

    // 🛡️ Log completion to ArmorClaw
    await logAudit(
      'analyze_code_complete',
      'in-memory:code-snippet',
      `Analysis complete — ${result.bugs?.length ?? 0} bugs found, score=${result.quality_score}`,
    );

    logs.push({ id: logs.length + 1, timestamp: new Date().toISOString(), type: 'code_analysis', input: code.slice(0, 100), result });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[analyze_code]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Project Mode ────────────────────────────────────────────────────────────────
app.post('/analyze_project', async (req, res) => {
  try {
    const projectPath = req.body.path;
    if (!projectPath) return res.status(400).json({ success: false, error: 'Missing path' });

    // 🛡️ Security whitelist check
    if (!isPathAllowed(projectPath)) {
      await logAudit('list_files', projectPath, 'Attempted access to blocked directory', false, 'Path outside allowed directories');
      return res.status(403).json({ success: false, error: `Path '${projectPath}' is outside allowed directories` });
    }

    // 🛡️ Log directory scan intent
    await logAudit('list_files', projectPath, `Scanning project directory for code analysis`);

    const steps = [];
    const modifiedFiles = [];

    steps.push(`Listing files in ${projectPath}`);

    let allEntries;
    try {
      allEntries = fs.readdirSync(projectPath);
    } catch (err) {
      return res.status(400).json({ success: false, error: `Cannot read directory: ${err.message}` });
    }

    const codeFiles = allEntries.filter(f => /\.(py|js|ts|jsx|tsx|java|cpp|c|go)$/.test(f));
    steps.push(`Found ${codeFiles.length} code files`);

    for (const file of codeFiles) {
      const fullPath = path.join(projectPath, file);

      // 🛡️ Log file read intent to ArmorClaw
      await logAudit('read_file', fullPath, `Reading ${file} for bug detection`);

      let code;
      try {
        code = fs.readFileSync(fullPath, 'utf-8');
      } catch (err) {
        steps.push(`Failed to read ${file}: ${err.message}`);
        continue;
      }

      if (!code.trim()) continue;

      steps.push(`Analyzing ${file}...`);
      let analysis;
      try {
        analysis = await analyzeWithGemini(code);
      } catch (err) {
        steps.push(`Analysis failed for ${file}: ${err.message}`);
        continue;
      }

      const hasBugs = analysis.bugs?.length > 0 && !analysis.bugs[0].toLowerCase().includes('no obvious bugs');
      if (hasBugs) {
        // 🛡️ Log file write intent to ArmorClaw
        await logAudit('write_file', fullPath, `Writing fixed version of ${file} — ${analysis.bugs.length} bugs patched`);

        fs.writeFileSync(fullPath, analysis.fixed_code, 'utf-8');
        steps.push(`✅ Fixed ${file} (${analysis.bugs.length} bug(s))`);
        modifiedFiles.push({ file, bugs_fixed: analysis.bugs, quality_score: analysis.quality_score });
      } else {
        steps.push(`✅ ${file} — no bugs found`);
      }
    }

    const summary = `Analyzed ${codeFiles.length} files, fixed ${modifiedFiles.length} files`;
    steps.push(summary);

    // 🛡️ Final audit log
    await logAudit('project_analysis_complete', projectPath, summary);

    logs.push({ id: logs.length + 1, timestamp: new Date().toISOString(), type: 'project_analysis', input: projectPath, result: { steps, modifiedFiles } });
    res.json({ success: true, steps, modified_files: modifiedFiles, summary });
  } catch (err) {
    console.error('[analyze_project]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/logs', (_req, res) => {
  res.json({ success: true, data: logs.slice(-50) });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  CodeShield Node.js Backend`);
  console.log(`✅  Running on http://0.0.0.0:${PORT}`);
  console.log(`🤖  AI Model: ${MODEL_CHAIN[0]} (+ ${MODEL_CHAIN.length - 1} fallbacks)`);
  console.log(`🔐  ArmorClaw IAP: ${IAP_URL}`);
  console.log(`👤  Agent: ${AGENT_ID} (${USER_ID})\n`);
});

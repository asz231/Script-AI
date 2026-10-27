/**
 * Script AI — Backend Server
 * Secure bridge between Frontend and n8n
 * 
 * NEVER expose n8n secrets or API keys to the frontend.
 * All credentials must be set as environment variables.
 */

'use strict';

const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const url     = require('url');

// Auto-load .env file if present (zero external dependencies)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      });
    } catch (err) {
      console.warn('[Env] Failed to read .env file:', err.message);
    }
  }
}
loadEnv();

// ==========================================================================
// CONFIGURATION — Load from environment variables
// ==========================================================================
const CONFIG = {
  PORT: process.env.PORT || 3000,

  // n8n Webhook URLs (loads from .env with fallback to 'My workflow 2')
  N8N_ANALYZE_WEBHOOK: process.env.N8N_ANALYZE_WEBHOOK || 'http://localhost:5678/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat',
  N8N_IDEAS_WEBHOOK:   process.env.N8N_IDEAS_WEBHOOK   || 'http://localhost:5678/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat',
  N8N_SCRIPT_WEBHOOK:  process.env.N8N_SCRIPT_WEBHOOK  || 'http://localhost:5678/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat',

  // Rate limiting (simple in-memory)
  RATE_LIMIT_WINDOW_MS:  60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQS:   20,        // per IP per window

  // Allowed origins (CORS)
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
};

// ==========================================================================
// MIME TYPES
// ==========================================================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ==========================================================================
// SIMPLE IN-MEMORY RATE LIMITER
// ==========================================================================
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > CONFIG.RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (record.count >= CONFIG.RATE_LIMIT_MAX_REQS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((val, key) => {
    if (now - val.windowStart > CONFIG.RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

// ==========================================================================
// CORS HELPERS
// ==========================================================================
function setCORSHeaders(res, origin) {
  // Allow any local network origin (Wi-Fi/Mobile 192.168.x.x, 10.x.x.x, localhost, etc.)
  const isAllowed = !origin || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1') || 
    origin.includes('192.168.') || 
    origin.includes('10.') || 
    origin.includes('172.') || 
    origin.includes('github.io') ||
    CONFIG.ALLOWED_ORIGINS.includes(origin);

  const allowedOrigin = isAllowed ? (origin || '*') : (CONFIG.ALLOWED_ORIGINS[0] || '*');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');
  res.setHeader('Vary', 'Origin');
}

// ==========================================================================
// REQUEST BODY PARSER
// ==========================================================================
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 100_000) { // 100KB limit
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ==========================================================================
// INPUT VALIDATION
// ==========================================================================
function validateAnalyzeRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('طلب غير صالح');
  }
  if (!body.channel_url || typeof body.channel_url !== 'string') {
    throw new Error('رابط القناة مطلوب');
  }
  if (body.channel_url.length > 200) {
    throw new Error('رابط القناة طويل جداً');
  }
  // Basic YouTube URL check
  const ytPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//;
  if (!ytPattern.test(body.channel_url) && !body.channel_url.startsWith('@')) {
    throw new Error('يجب أن يكون الرابط من YouTube');
  }
}

function validateScriptRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('طلب غير صالح');
  }
  if (!body.idea || typeof body.idea !== 'object') {
    throw new Error('الفكرة مطلوبة');
  }
}

// ==========================================================================
// N8N PROXY — Forward requests to n8n webhooks securely
// ==========================================================================
function proxyToN8n(webhookUrl, requestBody) {
  return new Promise((resolve, reject) => {
    if (!webhookUrl) {
      reject(new Error('N8N_WEBHOOK غير مُعيَّن في إعدادات الخادم. أضف متغير البيئة المناسب.'));
      return;
    }

    const bodyStr = JSON.stringify(requestBody);
    const parsedUrl = new url.URL(webhookUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port:     parsedUrl.port || (isHttps ? 443 : 80),
      path:     parsedUrl.pathname + parsedUrl.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    // Timeout: 55 seconds
    const req = lib.request(options, (n8nRes) => {
      let data = '';
      n8nRes.on('data', chunk => { data += chunk; });
      n8nRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve({ raw: data });
        }
      });
    });

    req.setTimeout(55_000, () => {
      req.destroy();
      reject(new Error('انتهت مهلة الاتصال بـ n8n'));
    });

    req.on('error', err => reject(new Error('خطأ في الاتصال بـ n8n: ' + err.message)));
    req.write(bodyStr);
    req.end();
  });
}

// Helper to normalize n8n response format (handles both array and object responses from LangChain chatTrigger)
function formatN8nResponse(result) {
  let item = Array.isArray(result) ? (result[0] || {}) : result;
  if (!item || typeof item !== 'object') {
    return { output: String(item || '') };
  }
  const textOutput = item.output || item.text || item.message || item.response || (item.data && item.data.output);
  return {
    output: textOutput || (item.raw ? item.raw : JSON.stringify(item)),
    ...item
  };
}

// ==========================================================================
// API ROUTE HANDLERS
// ==========================================================================

async function handleAnalyze(req, res, body) {
  validateAnalyzeRequest(body);

  const sessionId = body.session_id || body.sessionId || ('ses_' + Date.now());

  // Formatted for both n8n LangChain chatTrigger (chatInput/sessionId) and standard webhooks
  const n8nPayload = {
    chatInput: `أنا يوتيوبر ورابط قناتي هو: ${body.channel_url}. أريدك أن تحلل قناتي وتقترح أفضل أفكار محتوى مخصصة مع تحليل الأداء.`,
    sessionId: sessionId,
    channel_url: body.channel_url,
    user_id:     body.user_id     || 'anonymous',
    platform:    body.platform    || 'youtube',
    session_id:  sessionId,
  };

  const rawResult = await proxyToN8n(CONFIG.N8N_ANALYZE_WEBHOOK, n8nPayload);
  const formatted = formatN8nResponse(rawResult);
  sendJSON(res, 200, { success: true, ...formatted });
}

async function handleIdeas(req, res, body) {
  if (!body || typeof body !== 'object') throw new Error('طلب غير صالح');

  const sessionId = body.session_id || body.sessionId || ('ses_' + Date.now());
  const channelName = body.channel_data?.name || body.channel_data?.handle || '';

  const n8nPayload = {
    chatInput: `اقترح لي أفكار محتوى جديدة ومبتكرة ${channelName ? 'لقناة ' + channelName : ''} مبنية على التحليل مع الهوك وسبب النجاح.`,
    sessionId: sessionId,
    channel_data: body.channel_data || {},
    user_id:      body.user_id      || 'anonymous',
    session_id:   sessionId,
  };

  const rawResult = await proxyToN8n(CONFIG.N8N_IDEAS_WEBHOOK || CONFIG.N8N_ANALYZE_WEBHOOK, n8nPayload);
  const formatted = formatN8nResponse(rawResult);
  sendJSON(res, 200, { success: true, ...formatted });
}

async function handleScript(req, res, body) {
  validateScriptRequest(body);

  const sessionId = body.session_id || body.sessionId || ('ses_' + Date.now());
  const idea = body.idea || {};
  const tone = body.tone || 'عفوي';
  const length = body.length || 'متوسط';

  const n8nPayload = {
    chatInput: `اكتب لي السكريبت الكامل لهذه الفكرة:
العنوان: ${idea.title || 'فكرة المحتوى'}
الموضوع: ${idea.topic || ''}
الهوك: ${idea.hook || ''}
النبرة: ${tone}
الطول: ${length}
يرجى تقسيم السكريبت بوضوح إلى: الهوك (Hook)، المقدمة (Introduction)، المحتوى الرئيسي (Main Content)، النداء للتفاعل (CTA)، والخاتمة (Ending).`,
    sessionId: sessionId,
    idea:         idea,
    tone:         tone,
    length:       length,
    channel_data: body.channel_data || {},
    user_id:      body.user_id      || 'anonymous',
    session_id:   sessionId,
  };

  const rawResult = await proxyToN8n(CONFIG.N8N_SCRIPT_WEBHOOK || CONFIG.N8N_ANALYZE_WEBHOOK, n8nPayload);
  const formatted = formatN8nResponse(rawResult);
  sendJSON(res, 200, { success: true, ...formatted });
}

async function handleChat(req, res, body) {
  if (!body || typeof body !== 'object') throw new Error('طلب غير صالح');
  const chatInput = body.chatInput || body.message || body.text;
  if (!chatInput) throw new Error('نص الرسالة مطلوب');

  const sessionId = body.sessionId || body.session_id || ('ses_' + Date.now());

  const n8nPayload = {
    chatInput: chatInput,
    sessionId: sessionId,
    user_id: body.user_id || 'anonymous',
  };

  const rawResult = await proxyToN8n(CONFIG.N8N_ANALYZE_WEBHOOK, n8nPayload);
  const formatted = formatN8nResponse(rawResult);
  sendJSON(res, 200, { success: true, ...formatted });
}

// ==========================================================================
// STATIC FILE SERVER
// ==========================================================================
function serveStaticFile(reqPath, res) {
  let filePath = path.join(__dirname, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    sendJSON(res, 403, { error: 'Forbidden' });
    return;
  }

  // Map / to index.html, /ai to ai.html
  if (reqPath === '/' || reqPath === '') filePath = path.join(__dirname, 'index.html');
  if (reqPath === '/ai' || reqPath === '/ai/') filePath = path.join(__dirname, 'ai.html');

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try with .html extension
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        pipeFile(htmlPath, res);
      });
      return;
    }
    pipeFile(filePath, res);
  });
}

function pipeFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });

  fs.createReadStream(filePath).pipe(res);
}

// ==========================================================================
// RESPONSE HELPERS
// ==========================================================================
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

// ==========================================================================
// MAIN REQUEST HANDLER
// ==========================================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl  = url.parse(req.url);
  const pathname   = parsedUrl.pathname;
  const origin     = req.headers.origin || '';
  const ip         = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  // Set security headers
  res.setHeader('X-Powered-By', 'Script AI');
  setCORSHeaders(res, origin);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    // Rate limit API routes
    if (!checkRateLimit(ip)) {
      sendJSON(res, 429, { error: 'لقد تجاوزت الحد المسموح به. حاول لاحقاً.' });
      return;
    }

    if (pathname === '/api/health') {
      sendJSON(res, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        n8n_analyze_configured: !!CONFIG.N8N_ANALYZE_WEBHOOK,
        n8n_script_configured:  !!CONFIG.N8N_SCRIPT_WEBHOOK,
      });
      return;
    }

    if (req.method !== 'POST') {
      sendJSON(res, 405, { error: 'Method Not Allowed' });
      return;
    }

    try {
      const body = await parseBody(req);

      if (pathname === '/api/analyze') {
        await handleAnalyze(req, res, body);
      } else if (pathname === '/api/ideas') {
        await handleIdeas(req, res, body);
      } else if (pathname === '/api/script') {
        await handleScript(req, res, body);
      } else if (pathname === '/api/chat') {
        await handleChat(req, res, body);
      } else {
        sendJSON(res, 404, { error: 'API endpoint not found' });
      }

    } catch (err) {
      console.error(`[API Error] ${pathname}:`, err.message);
      const status = err.message.includes('مطلوب') ? 400 : 500;
      sendJSON(res, status, { error: err.message || 'خطأ في الخادم' });
    }

    return;
  }

  // Static files
  serveStaticFile(pathname, res);
});

// ==========================================================================
// START SERVER
// ==========================================================================
server.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═════════════════════════════════════════════════════╗');
  console.log('║           Script AI — Backend Server                ║');
  console.log(`║   Laptop: http://localhost:${CONFIG.PORT}                         ║`);
  console.log(`║   Mobile: http://192.168.1.9:${CONFIG.PORT}/ai.html               ║`);
  console.log('╠═════════════════════════════════════════════════════╣');
  console.log(`║  N8N Analyze : ${CONFIG.N8N_ANALYZE_WEBHOOK ? '✅ Configured' : '❌ Not Set'}      ║`);
  console.log(`║  N8N Script  : ${CONFIG.N8N_SCRIPT_WEBHOOK  ? '✅ Configured' : '❌ Not Set'}      ║`);
  console.log('╚═════════════════════════════════════════════════════╝');
  console.log('');
});

server.on('error', (err) => {
  console.error('[Server Error]', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${CONFIG.PORT} is already in use. Try: set PORT=3001`);
    process.exit(1);
  }
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });

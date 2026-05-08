import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';

const root = process.cwd();
loadEnv();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');

  if (url.pathname === '/api/notices') {
    await handleNotices(response);
    return;
  }

  if (url.pathname === '/api/assistant' && request.method === 'POST') {
    await handleAssistant(request, response);
    return;
  }

  const clean = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^[/\\]+/, '');
  const file = join(root, clean);

  if (!existsSync(file)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
    return;
  }

  response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(4180, '127.0.0.1', () => {
  console.log('Alerta Salud Web: http://127.0.0.1:4180');
});

function loadEnv() {
  const envFile = join(root, '.env');
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/i);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

async function handleNotices(response) {
  try {
    const cdc = await fetch('https://wwwnc.cdc.gov/travel/rss/notices.xml', {
      headers: { 'User-Agent': 'AlertaSaludWeb/2.0' }
    });
    const xml = await cdc.text();
    const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)]
      .slice(0, 8)
      .map(([, item]) => ({
        title: decodeXml(readTag(item, 'title')),
        link: decodeXml(readTag(item, 'link')),
        date: formatDate(readTag(item, 'pubDate')),
        source: 'CDC Travel Health Notices'
      }))
      .filter((item) => item.title && item.link);
    sendJson(response, 200, { items: items.length ? items : fallbackNotices() });
  } catch {
    sendJson(response, 200, { items: fallbackNotices() });
  }
}

async function handleAssistant(request, response) {
  const body = await readBody(request);
  const { message, context } = JSON.parse(body || '{}');
  const prompt = String(message || '').trim();
  const key = process.env.OPENAI_API_KEY;

  if (!prompt) {
    sendJson(response, 400, { error: 'Pregunta vacía' });
    return;
  }

  if (!key) {
    sendJson(response, 200, {
      mode: 'demo',
      answer: fallbackAnswer(prompt)
    });
    return;
  }

  try {
    const openai = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.2',
        store: false,
        instructions: [
          'Eres un asistente ciudadano de salud pública para una web de alertas tempranas.',
          'Responde en español claro, con tono sereno, práctico y no alarmista.',
          'No diagnostiques. No sustituyas a profesionales sanitarios.',
          'Ante señales de alarma recomienda contactar con urgencias o servicios sanitarios.',
          'Usa este contexto de la plataforma cuando sea útil: ' + JSON.stringify(context || {})
        ].join('\n'),
        input: prompt
      })
    });
    const result = await openai.json();
    if (!openai.ok) throw new Error(result.error?.message || 'OpenAI error');
    sendJson(response, 200, { mode: 'openai', answer: result.output_text || 'No he podido generar una respuesta.' });
  } catch (error) {
    sendJson(response, 200, {
      mode: 'fallback',
      answer: `${fallbackAnswer(prompt)}\n\nNota técnica: no se pudo conectar con OpenAI en este momento.`
    });
  }
}

function fallbackAnswer(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('respirar') || lower.includes('pecho') || lower.includes('confusión') || lower.includes('urgencia')) {
    return 'Si hay dificultad para respirar, dolor en pecho, confusión, empeoramiento rápido o fiebre persistente, busca atención sanitaria urgente. Ten preparada la duración de síntomas, medicación y posibles contactos de riesgo.';
  }
  if (lower.includes('brote') || lower.includes('zona')) {
    return 'Si estás cerca de una zona de riesgo, reduce exposición, revisa alertas oficiales, usa medidas preventivas y consulta si perteneces a un grupo vulnerable o aparecen síntomas compatibles.';
  }
  if (lower.includes('trabajo') || lower.includes('empresa')) {
    return 'En el trabajo conviene comunicar síntomas, evitar acudir si hay fiebre o exposición relevante, ventilar espacios, reforzar higiene y seguir el protocolo interno de prevención.';
  }
  return 'Puedo ayudarte con prevención, síntomas, derivación a centros, brotes recientes y protocolos laborales. Esta orientación no sustituye una valoración médica.';
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function decodeXml(value) {
  return String(value || '')
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'fecha oficial';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fallbackNotices() {
  return [
    {
      title: 'Global Dengue',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      date: '16 abr 2026',
      source: 'CDC Travel Health Notices'
    },
    {
      title: 'Global Polio',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      date: '09 mar 2026',
      source: 'CDC Travel Health Notices'
    },
    {
      title: 'Chikungunya in Suriname',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      date: '17 feb 2026',
      source: 'CDC Travel Health Notices'
    },
    {
      title: 'Chikungunya in Bolivia',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      date: '11 feb 2026',
      source: 'CDC Travel Health Notices'
    }
  ];
}

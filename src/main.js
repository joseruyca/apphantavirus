const appData = {
  hotspots: [
    { id: 'global', label: 'Global', risk: 'medio', headline: 'Vigilancia internacional activa', detail: 'Avisos CDC/OMS y seguimiento de eventos sanitarios emergentes.', x: 52, y: 42 },
    { id: 'espana', label: 'España', risk: 'bajo', headline: 'Sin foco crítico configurado', detail: 'Consulta fuentes autonómicas y nacionales antes de viajar o reportar exposición.', x: 48, y: 34 },
    { id: 'bolivia', label: 'Bolivia', risk: 'medio', headline: 'Aviso sanitario internacional', detail: 'Zona incluida como ejemplo de vigilancia por avisos internacionales recientes.', x: 36, y: 66 },
    { id: 'suriname', label: 'Suriname', risk: 'medio', headline: 'Seguimiento de arbovirosis', detail: 'Área marcada por avisos de viaje y vigilancia epidemiológica internacional.', x: 42, y: 56 }
  ],
  riskQuestions: [
    ['exposure', 'He limpiado polvo, almacenes, graneros o zonas con roedores', 4],
    ['zone', 'He estado en una zona con aviso o brote reciente', 3],
    ['fever', 'Tengo fiebre, escalofríos o dolor muscular', 2],
    ['stomach', 'Tengo dolor abdominal, diarrea, vómitos o malestar intenso', 2],
    ['breath', 'Me cuesta respirar o noto presión en el pecho', 6],
    ['vulnerable', 'Soy mayor, embarazada o inmunodeprimido/a', 3]
  ],
  protocols: [
    ['Primeros 10 minutos', 'Aléjate de la exposición, ventila si es seguro y evita levantar polvo.'],
    ['Datos clave', 'Anota fecha, lugar, síntomas, duración, contactos y posible exposición a roedores.'],
    ['Cuándo consultar', 'Dificultad respiratoria, dolor en pecho, confusión, fiebre persistente o empeoramiento rápido.'],
    ['Trabajo', 'Comunica riesgo sin alarmar, refuerza higiene, ventila y registra incidencias.']
  ],
  sources: [
    ['CDC Travel Health Notices', 'https://wwwnc.cdc.gov/travel/notices/'],
    ['OMS Disease Outbreak News', 'https://www.who.int/emergencies/disease-outbreak-news'],
    ['Comunidad de Madrid Salud Pública', 'https://www.comunidad.madrid/salud/alertas-salud-publica']
  ]
};

const state = {
  view: 'inicio',
  selectedHotspot: 'global',
  answers: new Set(),
  messages: [
    ['bot', 'Hola. Soy tu asistente. Puedo responder dudas generales y, si hablas de salud, te orientaré con prudencia.']
  ],
  input: '',
  aiStatus: 'Listo'
};

const root = document.getElementById('root');

function icon(name) {
  const paths = {
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4v-9.5Z"/>',
    radar: '<circle cx="12" cy="12" r="8"/><path d="M12 12V4"/><path d="m12 12 6 4"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    pulse: '<path d="M3 13h4l2-6 4 12 2-6h6"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    empty: '<circle cx="12" cy="12" r="9"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    link: '<path d="M14 3h7v7"/><path d="m10 14 11-11"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function score() {
  return appData.riskQuestions.reduce((sum, [, , points], index) => sum + (state.answers.has(index) ? points : 0), 0);
}

function riskLabel() {
  const value = score();
  if (value >= 9) return ['Prioridad alta', 'Contacta con servicios sanitarios si hay síntomas o exposición relevante.', 'high'];
  if (value >= 4) return ['Vigilancia recomendada', 'Reduce exposición, registra síntomas y revisa evolución.', 'mid'];
  return ['Sin alarma inmediata', 'Mantén prevención y consulta fuentes oficiales si cambia tu situación.', 'low'];
}

function render() {
  root.innerHTML = `
    <div class="shell">
      <aside class="nav">
        <div class="brand"><span>H</span><strong>HantaWatch</strong></div>
        ${nav('inicio', 'home', 'Inicio')}
        ${nav('radar', 'radar', 'Radar')}
        ${nav('riesgo', 'pulse', 'Riesgo')}
        ${nav('protocolo', 'shield', 'Protocolo')}
        ${nav('ia', 'bot', 'IA')}
      </aside>
      <main class="main">
        ${page()}
      </main>
    </div>
  `;
  bind();
}

function nav(view, iconName, label) {
  return `<button class="${state.view === view ? 'active' : ''}" data-view="${view}">${icon(iconName)}<span>${label}</span></button>`;
}

function page() {
  if (state.view === 'radar') return radarPage();
  if (state.view === 'riesgo') return riskPage();
  if (state.view === 'protocolo') return protocolPage();
  if (state.view === 'ia') return aiPage();
  return homePage();
}

function homePage() {
  const [label, text, level] = riskLabel();
  return `
    <section class="hero">
      <div class="hero-copy">
        <p>Inteligencia ciudadana de brotes</p>
        <h1>No busques veinte enlaces. Mira tu riesgo, actúa y pregunta.</h1>
        <span>Radar de focos, evaluador personal, protocolo de actuación y asistente IA en una sola web-app.</span>
        <div class="hero-actions">
          <button data-view="riesgo">Evaluar mi riesgo</button>
          <button data-view="radar">Ver radar</button>
        </div>
      </div>
      <article class="risk-card ${level}">
        <span>Tu estado</span>
        <strong>${label}</strong>
        <p>${text}</p>
      </article>
    </section>
    <section class="value-grid">
      <article><b>1</b><strong>Te orienta</strong><span>Convierte síntomas y exposición en pasos concretos.</span></article>
      <article><b>2</b><strong>Te resume</strong><span>Fuentes oficiales sin navegar entre páginas dispersas.</span></article>
      <article><b>3</b><strong>Te prepara</strong><span>Qué contar al médico, al trabajo o a tu familia.</span></article>
    </section>
  `;
}

function radarPage() {
  const selected = appData.hotspots.find((item) => item.id === state.selectedHotspot) || appData.hotspots[0];
  return `
    <section class="page-head">
      <div><p>Radar sanitario</p><h1>Focos y vigilancia</h1></div>
      <select data-hotspot-select>${appData.hotspots.map((item) => `<option value="${item.id}" ${item.id === selected.id ? 'selected' : ''}>${item.label}</option>`).join('')}</select>
    </section>
    <section class="radar-layout">
      <div class="radar-map">
        <div class="map-texture"></div>
        ${appData.hotspots.map((item) => `<button class="hotspot ${item.risk} ${item.id === selected.id ? 'selected' : ''}" style="left:${item.x}%;top:${item.y}%" data-hotspot="${item.id}"><i></i><span>${item.label}</span></button>`).join('')}
      </div>
      <aside class="insight">
        <span class="pill ${selected.risk}">${selected.risk}</span>
        <h2>${selected.headline}</h2>
        <p>${selected.detail}</p>
        <button data-view="protocolo">Qué hago ahora</button>
      </aside>
    </section>
    <section class="source-row">${appData.sources.map(([name, link]) => `<a href="${link}" target="_blank" rel="noreferrer">${name}${icon('link')}</a>`).join('')}</section>
  `;
}

function riskPage() {
  const [label, text, level] = riskLabel();
  return `
    <section class="page-head">
      <div><p>Evaluador personal</p><h1>¿Qué significa para mí?</h1></div>
      <strong class="score">${score()} pts</strong>
    </section>
    <section class="risk-result ${level}">
      <span>Resultado</span>
      <strong>${label}</strong>
      <p>${text}</p>
    </section>
    <section class="question-list">
      ${appData.riskQuestions.map(([id, label], index) => `<button class="${state.answers.has(index) ? 'checked' : ''}" data-answer="${index}">${icon(state.answers.has(index) ? 'check' : 'empty')}<span>${label}</span></button>`).join('')}
    </section>
    <section class="next-steps">
      <article><b>Ahora</b><span>${score() >= 9 ? 'Busca orientación sanitaria si hay síntomas.' : 'Evita exposición y observa evolución.'}</span></article>
      <article><b>Prepara</b><span>Fecha, lugar, síntomas, duración y posible contacto con roedores.</span></article>
      <article><b>Consulta</b><span>Usa fuentes oficiales o pregunta al asistente si tienes dudas.</span></article>
    </section>
  `;
}

function protocolPage() {
  return `
    <section class="page-head">
      <div><p>Acción clara</p><h1>Protocolo útil</h1></div>
    </section>
    <section class="protocol-timeline">
      ${appData.protocols.map(([title, text], index) => `<article><b>${index + 1}</b><div><strong>${title}</strong><span>${text}</span></div></article>`).join('')}
    </section>
  `;
}

function aiPage() {
  return `
    <section class="assistant">
      <header><div>${icon('bot')}</div><h1>Asistente IA</h1><p>Pregunta cualquier cosa. Si es salud, responderá con prudencia y señales de alarma.</p></header>
      <div class="chips">
        <button data-prompt="Me duele el estómago, ¿qué debería vigilar?">Dolor de estómago</button>
        <button data-prompt="Explícame qué es una API en una frase">Pregunta general</button>
        <button data-prompt="¿Qué hago si limpié una zona con roedores?">Exposición</button>
      </div>
      <div class="chat">${state.messages.map(([role, text]) => `<div class="bubble ${role}">${esc(text)}</div>`).join('')}</div>
      <form class="composer" data-form>
        <textarea rows="1" placeholder="Escribe aquí" aria-label="Mensaje para la IA">${esc(state.input)}</textarea>
        <button type="submit">${icon('arrow')}</button>
      </form>
      <small>${state.aiStatus}</small>
    </section>
  `;
}

function bind() {
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    render();
  }));
  document.querySelectorAll('[data-hotspot]').forEach((button) => button.addEventListener('click', () => {
    state.selectedHotspot = button.dataset.hotspot;
    render();
  }));
  const hotspotSelect = document.querySelector('[data-hotspot-select]');
  if (hotspotSelect) hotspotSelect.addEventListener('change', (event) => {
    state.selectedHotspot = event.target.value;
    render();
  });
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.answer);
    state.answers.has(index) ? state.answers.delete(index) : state.answers.add(index);
    render();
  }));
  document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
    state.input = button.dataset.prompt;
    render();
  }));
  const input = document.querySelector('.composer textarea');
  if (input) input.addEventListener('input', (event) => {
    state.input = event.target.value;
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  });
  const form = document.querySelector('[data-form]');
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });
}

async function sendMessage() {
  const prompt = state.input.trim();
  if (!prompt) return;
  state.messages.push(['user', prompt], ['bot', 'Pensando...']);
  state.input = '';
  state.aiStatus = 'Consultando IA';
  render();
  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, context: { score: score(), hotspot: state.selectedHotspot } })
    });
    const result = await response.json();
    state.messages[state.messages.length - 1] = ['bot', result.answer || fallback(prompt)];
    state.aiStatus = result.mode === 'openai' ? 'IA conectada' : 'Modo respuesta local';
  } catch {
    state.messages[state.messages.length - 1] = ['bot', fallback(prompt)];
    state.aiStatus = 'Modo respuesta local';
  }
  render();
}

function fallback(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('api')) return 'Una API es una forma ordenada para que dos aplicaciones se comuniquen y compartan datos o funciones.';
  if (lower.includes('estómago') || lower.includes('estomago') || lower.includes('tripa')) return 'Vigila intensidad, fiebre, vómitos persistentes, sangre en heces, deshidratación o dolor fuerte localizado. Si aparece algo de eso, consulta con un centro sanitario.';
  if (lower.includes('roedor') || lower.includes('ratón') || lower.includes('raton')) return 'Evita levantar polvo, ventila, usa protección y anota lugar y fecha de exposición. Consulta si aparecen fiebre, malestar intenso o dificultad respiratoria.';
  return 'Puedo ayudarte. Dame un poco más de contexto y te respondo de forma más concreta.';
}

render();

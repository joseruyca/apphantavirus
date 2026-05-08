const data = {
  alerts: [
    {
      id: 'madrid',
      level: 'alto',
      title: 'Alerta rápida de salud pública',
      place: 'Comunidad de Madrid',
      source: 'Comunidad de Madrid',
      updated: 'Fuente oficial',
      link: 'https://www.comunidad.madrid/salud/alertas-salud-publica',
      action: 'Si hay sospecha de brote o exposición, consulta canales oficiales y contacta con servicios sanitarios ante síntomas de alarma.'
    },
    {
      id: 'cdc',
      level: 'medio',
      title: 'Avisos internacionales para viajeros',
      place: 'Global',
      source: 'CDC Travel Health Notices',
      updated: 'Actualización automática',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      action: 'Antes de viajar, revisa avisos por destino y aplica medidas de prevención recomendadas.'
    },
    {
      id: 'who',
      level: 'medio',
      title: 'Disease Outbreak News',
      place: 'Global',
      source: 'OMS',
      updated: 'Consulta oficial',
      link: 'https://www.who.int/emergencies/disease-outbreak-news',
      action: 'Consulta brotes confirmados o eventos de interés internacional publicados por la OMS.'
    }
  ],
  countries: [
    { id: 'global', name: 'Global', center: [20, 0], zoom: 2, zones: [
      ['Avisos CDC activos', [12, -60], 1500000, 'medio'],
      ['Vigilancia OMS', [5, 25], 1800000, 'medio'],
      ['Seguimiento respiratorio', [45, 12], 900000, 'bajo']
    ] },
    { id: 'espana', name: 'España', center: [40.4168, -3.7038], zoom: 6, zones: [
      ['Madrid · fuente regional', [40.4168, -3.7038], 90000, 'alto'],
      ['Seguimiento norte', [43.26, -2.93], 120000, 'medio'],
      ['Vigilancia mediterránea', [39.47, -0.37], 100000, 'bajo']
    ] },
    { id: 'bolivia', name: 'Bolivia', center: [-16.29, -63.59], zoom: 5, zones: [
      ['Chikungunya · aviso CDC', [-17.78, -63.18], 260000, 'medio'],
      ['Vigilancia amazónica', [-14.83, -64.9], 320000, 'bajo']
    ] },
    { id: 'suriname', name: 'Suriname', center: [4.13, -55.91], zoom: 6, zones: [
      ['Chikungunya · aviso CDC', [5.85, -55.2], 160000, 'medio'],
      ['Seguimiento interior', [4.4, -56.1], 180000, 'bajo']
    ] }
  ],
  prevention: [
    'Activar ubicación aproximada',
    'Revisar vacunas y medicación',
    'Guardar centro de salud habitual',
    'Ventilar espacios compartidos',
    'Lavado de manos o gel',
    'Evitar contactos vulnerables si hay fiebre'
  ],
  symptoms: [
    ['fever', 'Fiebre o escalofríos', 2],
    ['breath', 'Dificultad para respirar', 5],
    ['chest', 'Dolor en pecho o confusión', 5],
    ['vomit', 'Vómitos o diarrea intensa', 3],
    ['contact', 'Contacto con caso confirmado', 2],
    ['risk', 'Estancia en zona de riesgo', 1]
  ],
  centers: [
    ['Centro de Salud Norte', 'Atención primaria', '0.9 km', '18 min', true],
    ['Hospital General', 'Urgencias 24 h', '2.7 km', '42 min', true],
    ['Punto de Vacunación', 'Cita previa', '1.4 km', 'Mañana', false]
  ],
  lessons: [
    ['Señales tempranas de brote', '8 min', 'Aprende a reconocer patrones, aumento de síntomas y cuándo reportar una posible alerta.'],
    ['Medidas en el trabajo', '10 min', 'Ventilación, higiene, comunicación interna y protección de personas vulnerables.'],
    ['Comunicación a ciudadanía', '7 min', 'Mensajes breves, claros y sin alarmismo para personas no técnicas.'],
    ['Derivación segura', '9 min', 'Cuándo recomendar urgencias, atención primaria o vigilancia en casa.']
  ],
  sources: [
    ['Madrid Salud Pública', 'https://www.comunidad.madrid/salud/alertas-salud-publica'],
    ['CDC Travel Notices', 'https://wwwnc.cdc.gov/travel/notices/'],
    ['OMS Disease Outbreak News', 'https://www.who.int/emergencies/disease-outbreak-news']
  ]
};

const state = {
  view: 'inicio',
  healthTab: 'prevencion',
  selectedAlert: 'madrid',
  selectedCountry: 'global',
  selectedLesson: 0,
  checks: new Set([0, 2]),
  symptoms: new Set(),
  lessonsDone: new Set([0]),
  notices: [],
  noticesUpdatedAt: null,
  locationEnabled: false,
  userLocation: null,
  chatInput: '',
  messages: [
    ['bot', 'Hola. Dime qué ocurre y te oriento con pasos claros. Si hay dificultad para respirar, dolor en pecho o confusión, busca atención urgente.']
  ],
  aiStatus: 'Asistente disponible'
};

const root = document.getElementById('root');
let mapInstance;

function icon(name) {
  const paths = {
    logo: '<path d="M12 3v18M3 12h18"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4v-9.5Z"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    health: '<path d="M3 13h4l2-6 4 12 2-6h6"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    hospital: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M9 21v-6h6v6"/><path d="M12 7v5M9.5 9.5h5"/>',
    course: '<path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10v5c3 3 7 3 10 0v-5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    empty: '<circle cx="12" cy="12" r="9"/>',
    pin: '<path d="M12 21s7-5.2 7-12A7 7 0 0 0 5 9c0 6.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/>',
    external: '<path d="M14 3h7v7"/><path d="m10 14 11-11"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function render() {
  root.innerHTML = `
    <div class="app">
      <aside class="rail">
        <button class="rail-brand" data-view="inicio">${icon('logo')}</button>
        <nav>${nav('inicio', 'home', 'Inicio')}${nav('alertas', 'bell', 'Alertas')}${nav('mapa', 'map', 'Mapa')}${nav('salud', 'health', 'Plan')}${nav('ia', 'bot', 'IA')}</nav>
      </aside>
      <main class="screen">
        <header class="top">
          <div><span>Alerta Salud</span><h1>${title()}</h1></div>
          <button class="locate" data-location>${icon('pin')}${state.locationEnabled ? 'Activa' : 'Ubicación'}</button>
        </header>
        ${page()}
      </main>
    </div>
  `;
  bindEvents();
  afterRender();
}

function nav(view, iconName, label) {
  return `<button class="${state.view === view ? 'active' : ''}" data-view="${view}">${icon(iconName)}<span>${label}</span></button>`;
}

function title() {
  return {
    inicio: 'Panel',
    alertas: 'Alertas',
    mapa: 'Mapa de riesgo',
    salud: 'Plan',
    ia: 'Asistente'
  }[state.view];
}

function page() {
  if (state.view === 'alertas') return alertsPage();
  if (state.view === 'mapa') return mapPage();
  if (state.view === 'salud') return healthPage();
  if (state.view === 'ia') return aiPage();
  return homePage();
}

function homePage() {
  const progress = Math.round((state.checks.size / data.prevention.length) * 100);
  return `
    <section class="home-hero">
      <span>Vigilancia sanitaria</span>
      <strong>Qué está pasando y qué debes hacer</strong>
      <p>La web resume fuentes oficiales, muestra zonas de riesgo, crea un plan personal y te deja preguntar a la IA.</p>
      <div class="hero-status">
        <b>Actualizado</b>
        <b>${data.alerts.length} fuentes oficiales</b>
        <b>${progress}% plan listo</b>
      </div>
      <div><button data-view="alertas">Ver alertas</button><button data-view="mapa">Abrir mapa</button></div>
    </section>
    <section class="quick-grid">
      ${metric('Alertas', data.alerts.length, 'bell')}
      ${metric('Prevención', `${progress}%`, 'shield')}
      ${metric('Centros', data.centers.length, 'hospital')}
    </section>
    <section class="card compact">
      <div class="card-head"><h2>Avisos actualizados</h2><button data-refresh-notices>${icon('refresh')}</button></div>
      <p class="hint">${state.noticesUpdatedAt ? `Última revisión ${state.noticesUpdatedAt}` : 'Cargando fuentes...'}</p>
      <div class="notice-strip">${noticeCards()}</div>
    </section>
    <section class="card compact">
      <div class="card-head"><h2>Por qué usarla</h2></div>
      <div class="action-list">
        <button data-view="mapa">${icon('map')} Ver zonas afectadas</button>
        <button data-view="salud" data-health="plan">${icon('shield')} Recibir plan personal</button>
        <button data-view="ia">${icon('bot')} Preguntar cualquier duda</button>
      </div>
    </section>
    <section class="card calm-card">
      <strong>Señales de alarma</strong>
      <p>Dificultad para respirar, dolor en pecho, confusión, empeoramiento rápido o fiebre persistente requieren atención sanitaria.</p>
      <button data-view="salud" data-health="sintomas">Evaluar síntomas</button>
    </section>
  `;
}

function metric(label, value, iconName) {
  return `<article class="metric">${icon(iconName)}<span>${label}</span><strong>${value}</strong></article>`;
}

function noticeCards() {
  const items = state.notices.length ? state.notices : [{ title: 'Fuentes oficiales disponibles', source: 'Madrid, CDC y OMS', link: '#' }];
  return items.slice(0, 4).map((item) => `
    <a class="notice-mini" href="${item.link}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.source || 'Fuente oficial')}</span>
    </a>
  `).join('');
}

function alertsPage() {
  const selected = data.alerts.find((alert) => alert.id === state.selectedAlert) || data.alerts[0];
  return `
    <section class="alert-list">
      ${data.alerts.map((alert) => `
        <button class="alert-item ${state.selectedAlert === alert.id ? 'selected' : ''}" data-alert="${alert.id}">
          <span class="level ${alert.level}">${alert.level}</span>
          <strong>${alert.title}</strong>
          <small>${alert.place} · ${alert.source}</small>
        </button>
      `).join('')}
    </section>
    <section class="card">
      <div class="card-head"><h2>${selected.title}</h2><a href="${selected.link}" target="_blank" rel="noreferrer">${icon('external')}</a></div>
      <p>${selected.action}</p>
      <div class="detail-grid">
        <span><b>Zona</b>${selected.place}</span>
        <span><b>Fuente</b>${selected.source}</span>
        <span><b>Estado</b>${selected.updated}</span>
      </div>
    </section>
    <section class="card compact">
      <div class="card-head"><h2>Fuentes</h2></div>
      ${data.sources.map(([name, link]) => `<a class="source-line" href="${link}" target="_blank" rel="noreferrer">${name}${icon('external')}</a>`).join('')}
    </section>
  `;
}

function mapPage() {
  const selected = data.countries.find((country) => country.id === state.selectedCountry) || data.countries[0];
  return `
    <section class="risk-board">
      <div class="map-toolbar">
        <div><strong>${selected.name}</strong><span>Zonas afectadas y fuentes de vigilancia</span></div>
        <select data-country aria-label="Seleccionar país">
          ${data.countries.map((country) => `<option value="${country.id}" ${country.id === state.selectedCountry ? 'selected' : ''}>${country.name}</option>`).join('')}
        </select>
      </div>
      <div class="world-map" aria-label="Mapa global de riesgo">
        <div class="world-grid"></div>
        ${selected.zones.map(([label, coords, radius, level]) => riskZone(label, coords, radius, level, selected)).join('')}
      </div>
      <div class="risk-list">
        ${selected.zones.map(([label, , , level]) => `<article><span class="risk-dot ${level}"></span><div><strong>${label}</strong><small>Nivel ${level} · revisar fuente oficial</small></div></article>`).join('')}
      </div>
      <div class="card compact">
        <div class="card-head"><h2>Para qué sirve</h2></div>
        <p>Google te enseña páginas. Esta vista cruza país, fuentes oficiales y acciones recomendadas para que entiendas si debes prevenir, consultar o vigilar.</p>
      </div>
    </section>
  `;
}

function riskZone(label, coords, radius, level, country) {
  const [lat, lon] = coords;
  const x = country.id === 'global' ? ((lon + 180) / 360) * 100 : 50 + (lon - country.center[1]) * 8;
  const y = country.id === 'global' ? ((90 - lat) / 180) * 100 : 50 - (lat - country.center[0]) * 8;
  const size = Math.max(34, Math.min(120, radius / (country.id === 'global' ? 26000 : 3500)));
  return `<button class="risk-zone ${level}" style="left:${x}%;top:${y}%;--size:${size}px" title="${label}"><span></span><b>${label}</b></button>`;
}

function healthPage() {
  return `
    <div class="segmented">
      ${healthTab('plan', 'Plan')}
      ${healthTab('sintomas', 'Síntomas')}
      ${healthTab('centros', 'Centros')}
      ${healthTab('trabajo', 'Trabajo')}
    </div>
    ${healthContent()}
  `;
}

function healthTab(tab, label) {
  return `<button class="${state.healthTab === tab ? 'active' : ''}" data-health="${tab}">${label}</button>`;
}

function healthContent() {
  if (state.healthTab === 'sintomas') return symptomsPanel();
  if (state.healthTab === 'centros') return centersPanel();
  if (state.healthTab === 'trabajo') return workPanel();
  return planPanel();
}

function planPanel() {
  const progress = Math.round((state.checks.size / data.prevention.length) * 100);
  return `
    <section class="card">
      <div class="progress"><div><span>Plan personal</span><strong>${progress}% listo</strong></div><i style="--value:${progress}%"></i></div>
      <p class="hint">Marca solo lo que ya tienes resuelto. El objetivo es saber qué te falta antes de que haya un brote cerca.</p>
      <div class="check-list">
        ${data.prevention.map((item, index) => `<button class="${state.checks.has(index) ? 'done' : ''}" data-check="${index}">${icon(state.checks.has(index) ? 'check' : 'empty')}<span>${item}</span></button>`).join('')}
      </div>
    </section>
  `;
}

function symptomsPanel() {
  const score = data.symptoms.reduce((sum, [id, , points]) => sum + (state.symptoms.has(id) ? points : 0), 0);
  const status = score >= 8 ? ['Urgencia recomendada', 'Busca atención sanitaria urgente.'] : score >= 4 ? ['Consulta prioritaria', 'Contacta con atención primaria.'] : ['Vigilancia en casa', 'Observa evolución y evita exposición.'];
  return `
    <section class="card">
      <div class="triage ${score >= 8 ? 'urgent' : ''}"><span>Resultado</span><strong>${status[0]}</strong><p>${status[1]}</p></div>
      <div class="symptom-list">
        ${data.symptoms.map(([id, label]) => `<button class="${state.symptoms.has(id) ? 'selected' : ''}" data-symptom="${id}">${label}</button>`).join('')}
      </div>
    </section>
  `;
}

function centersPanel() {
  return `
    <section class="card center-list">
      ${data.centers.map(([name, type, distance, wait, open]) => `
        <article>
          ${icon('hospital')}
          <div><strong>${name}</strong><span>${type} · ${distance}</span></div>
          <b class="${open ? 'open' : 'closed'}">${open ? wait : 'Cita'}</b>
        </article>
      `).join('')}
    </section>
  `;
}

function workPanel() {
  const percent = Math.round((state.lessonsDone.size / data.lessons.length) * 100);
  const lesson = data.lessons[state.selectedLesson] || data.lessons[0];
  return `
    <section class="card">
      <div class="course-summary"><span>Modo trabajo</span><strong>${percent}% preparado</strong><p>Guía práctica para saber qué hacer en un puesto con atención al público.</p></div>
      <article class="lesson-detail">
        <span>Paso ${state.selectedLesson + 1}</span>
        <strong>${lesson[0]}</strong>
        <p>${lesson[2]}</p>
        <button data-lesson="${state.selectedLesson}">${state.lessonsDone.has(state.selectedLesson) ? 'Marcar pendiente' : 'Hecho'}</button>
      </article>
      <div class="lesson-list">
        ${data.lessons.map(([title, time], index) => `<button class="${state.lessonsDone.has(index) ? 'done' : ''} ${state.selectedLesson === index ? 'selected' : ''}" data-select-lesson="${index}">${icon(state.lessonsDone.has(index) ? 'check' : 'course')}<span>${title}</span><small>${time}</small></button>`).join('')}
      </div>
    </section>
  `;
}

function aiPage() {
  return `
    <section class="card chat-card">
      <div class="assistant-head">${icon('bot')}<div><span>Asistente ciudadano</span><strong>Pregunta en lenguaje natural</strong></div></div>
      <p class="assistant-note">Responde solo sobre alertas sanitarias, brotes, prevención, síntomas, centros y protocolos laborales.</p>
      <div class="quick-prompts">
        <button data-prompt="Tengo fiebre y estoy en una zona de riesgo">Tengo fiebre</button>
        <button data-prompt="¿Cuándo debo ir a urgencias?">Urgencias</button>
        <button data-prompt="¿Qué hago en el trabajo si hay un brote?">Trabajo</button>
      </div>
      <div class="chat">${state.messages.map(([role, text]) => `<div class="bubble ${role}">${escapeHtml(text)}</div>`).join('')}</div>
      <form class="composer" data-chat-form>
        <textarea rows="1" placeholder="Escribe tu pregunta" aria-label="Pregunta para el asistente">${escapeHtml(state.chatInput)}</textarea>
        <button type="submit" data-send>${icon('arrow')}</button>
      </form>
      <p class="hint">${state.aiStatus}</p>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((item) => item.addEventListener('click', (event) => {
    event.preventDefault();
    state.view = item.dataset.view;
    if (item.dataset.health) state.healthTab = item.dataset.health;
    render();
  }));
  document.querySelectorAll('[data-health]').forEach((item) => item.addEventListener('click', () => {
    state.view = 'salud';
    state.healthTab = item.dataset.health;
    render();
  }));
  document.querySelectorAll('[data-alert]').forEach((item) => item.addEventListener('click', () => {
    state.selectedAlert = item.dataset.alert;
    render();
  }));
  document.querySelectorAll('[data-check]').forEach((item) => item.addEventListener('click', () => {
    const index = Number(item.dataset.check);
    state.checks.has(index) ? state.checks.delete(index) : state.checks.add(index);
    render();
  }));
  document.querySelectorAll('[data-symptom]').forEach((item) => item.addEventListener('click', () => {
    const id = item.dataset.symptom;
    state.symptoms.has(id) ? state.symptoms.delete(id) : state.symptoms.add(id);
    render();
  }));
  document.querySelectorAll('[data-lesson]').forEach((item) => item.addEventListener('click', () => {
    const index = Number(item.dataset.lesson);
    state.lessonsDone.has(index) ? state.lessonsDone.delete(index) : state.lessonsDone.add(index);
    render();
  }));
  document.querySelectorAll('[data-select-lesson]').forEach((item) => item.addEventListener('click', () => {
    state.selectedLesson = Number(item.dataset.selectLesson);
    render();
  }));
  const country = document.querySelector('[data-country]');
  if (country) country.addEventListener('change', (event) => {
    state.selectedCountry = event.target.value;
    render();
  });
  document.querySelectorAll('[data-prompt]').forEach((item) => item.addEventListener('click', () => {
    state.chatInput = item.dataset.prompt;
    render();
  }));
  const input = document.querySelector('.composer textarea');
  if (input) input.addEventListener('input', (event) => {
    state.chatInput = event.target.value;
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 110)}px`;
  });
  const form = document.querySelector('[data-chat-form]');
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });
  document.querySelectorAll('[data-location]').forEach((item) => item.addEventListener('click', requestLocation));
  const refresh = document.querySelector('[data-refresh-notices]');
  if (refresh) refresh.addEventListener('click', () => loadNotices(true));
}

function afterRender() {
  return;
}

function requestLocation() {
  if (!navigator.geolocation) {
    alert('Tu navegador no permite geolocalización.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.locationEnabled = true;
      state.userLocation = [position.coords.latitude, position.coords.longitude];
      state.view = 'mapa';
      render();
    },
    () => alert('No se pudo obtener la ubicación. Puedes usar el mapa manualmente.'),
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 }
  );
}

async function sendMessage() {
  const prompt = state.chatInput.trim();
  if (!prompt) return;
  state.messages.push(['user', prompt], ['bot', 'Consultando...']);
  state.chatInput = '';
  render();
  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, context: { symptoms: [...state.symptoms], selectedAlert: state.selectedAlert } })
    });
    const result = await response.json();
    state.messages[state.messages.length - 1] = ['bot', result.answer || fallbackAnswer(prompt)];
    state.aiStatus = 'Respuesta orientativa';
  } catch {
    state.messages[state.messages.length - 1] = ['bot', fallbackAnswer(prompt)];
    state.aiStatus = 'Respuesta orientativa';
  }
  render();
}

function fallbackAnswer(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('api')) {
    return 'Una API es una forma ordenada para que dos aplicaciones se comuniquen y compartan datos o funciones.';
  }
  if (lower.includes('hola') || lower.includes('buenas')) {
    return 'Hola. Puedo ayudarte con dudas generales y, si el tema es sanitario, responderé con prudencia y señales de alarma.';
  }
  if (lower.includes('respirar') || lower.includes('pecho') || lower.includes('urgencia')) {
    return 'Si hay dificultad para respirar, dolor en pecho, confusión o empeoramiento rápido, busca atención sanitaria urgente.';
  }
  if (lower.includes('tripa') || lower.includes('barriga') || lower.includes('estómago') || lower.includes('estomago') || lower.includes('diarrea') || lower.includes('vómit') || lower.includes('vomit')) {
    return 'El dolor de tripa puede tener muchas causas. Vigila intensidad, fiebre, vómitos persistentes, diarrea con sangre, deshidratación o dolor fuerte localizado. Si aparece alguna de esas señales, consulta con un centro sanitario.';
  }
  if (lower.includes('brote') || lower.includes('zona')) {
    return 'Reduce exposición, revisa fuentes oficiales y consulta si aparecen síntomas o perteneces a un grupo vulnerable.';
  }
  return 'Puedo ayudarte con esa duda. Si quieres una respuesta más precisa, dame un poco más de contexto.';
}

async function loadNotices(manual = false) {
  try {
    const response = await fetch(`/api/notices?ts=${Date.now()}`);
    const result = await response.json();
    state.notices = result.items || [];
    state.noticesUpdatedAt = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    if (manual) alert('No se pudieron actualizar los avisos.');
  }
  render();
}

render();
loadNotices();
setInterval(() => loadNotices(), 5 * 60 * 1000);

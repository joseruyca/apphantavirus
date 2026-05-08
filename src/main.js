const data = {
  alerts: [
    {
      id: 'madrid-alertas',
      level: 'alto',
      title: 'Sistema de Alerta Rápida en Salud Pública',
      zone: 'Comunidad de Madrid',
      distance: 'Fuente regional',
      cases: '24/7',
      updated: 'Consulta oficial',
      source: 'Comunidad de Madrid',
      link: 'https://www.comunidad.madrid/salud/alertas-salud-publica',
      action: 'Ante una sospecha de alerta de salud pública, los canales regionales indican notificación urgente a vigilancia epidemiológica o 061 fuera de horario.'
    },
    {
      id: 'cdc-travel',
      level: 'medio',
      title: 'Avisos internacionales de salud para viajeros',
      zone: 'Global',
      distance: 'Feed oficial',
      cases: 'RSS',
      updated: 'Actualizable en vivo',
      source: 'CDC Travel Health Notices',
      link: 'https://wwwnc.cdc.gov/travel/notices/',
      action: 'Revisa avisos por país o enfermedad antes de viajar y aplica las medidas preventivas indicadas por la fuente oficial.'
    },
    {
      id: 'who-don',
      level: 'medio',
      title: 'Disease Outbreak News',
      zone: 'Global',
      distance: 'OMS',
      cases: 'DON',
      updated: 'Consulta oficial',
      source: 'World Health Organization',
      link: 'https://www.who.int/emergencies/disease-outbreak-news',
      action: 'Consulta eventos confirmados o potenciales de interés internacional publicados por la OMS.'
    }
  ],
  centers: [
    ['Centro de Salud Norte', 'Atención primaria', '0.9 km', '18 min', true],
    ['Hospital General', 'Urgencias 24 h', '2.7 km', '42 min', true],
    ['Punto Municipal de Vacunación', 'Cita previa', '1.4 km', 'Mañana', false],
    ['Unidad Móvil Sanitaria', 'Campaña en zona de riesgo', '2.1 km', '25 min', true]
  ],
  prevention: [
    'Permitir ubicación aproximada para recibir avisos cercanos',
    'Actualizar calendario de vacunas y medicación crónica',
    'Guardar centro de salud, urgencias y contacto familiar',
    'Lavar manos o usar gel tras transporte, compras o trabajo',
    'Ventilar espacios compartidos 10 minutos, 3 veces al día',
    'Evitar visitas vulnerables si hay fiebre, tos fuerte o diarrea',
    'Revisar alertas oficiales antes de acudir a eventos masivos'
  ],
  symptoms: [
    ['fever', 'Fiebre o escalofríos', 2],
    ['breath', 'Dificultad para respirar', 5],
    ['chest', 'Dolor en pecho o confusión', 5],
    ['rash', 'Erupción, manchas o lesiones', 2],
    ['vomit', 'Vómitos o diarrea intensa', 3],
    ['contact', 'Contacto con caso confirmado', 2],
    ['riskzone', 'Estancia en zona de riesgo', 1],
    ['elder', 'Persona mayor, embarazo o inmunosupresión', 3]
  ],
  lessons: [
    ['Detección de señales tempranas', '8 min', true],
    ['Comunicación clara con ciudadanía', '10 min', true],
    ['Medidas en centros de trabajo', '12 min', false],
    ['Registro y derivación segura', '9 min', false],
    ['Uso responsable del asistente IA', '7 min', false]
  ],
  aiTopics: [
    'brotes recientes',
    'síntomas de alarma',
    'medidas de prevención',
    'derivación a centros',
    'protocolos laborales',
    'mensajes ciudadanos'
  ],
  photos: [
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=85'
  ],
  officialSources: [
    ['Comunidad de Madrid: Alertas en Salud Pública', 'Sistema regional de alerta rápida y protocolos.', 'https://www.comunidad.madrid/salud/alertas-salud-publica'],
    ['Comunidad de Madrid: Vigilancia Epidemiológica', 'Informes, boletines y vigilancia de EDO y brotes.', 'https://www.comunidad.madrid/salud/vigilancia-epidemiologica'],
    ['CDC Travel Health Notices', 'Avisos internacionales de salud para viajeros.', 'https://wwwnc.cdc.gov/travel/notices/'],
    ['WHO Disease Outbreak News', 'Noticias de brotes de la Organización Mundial de la Salud.', 'https://www.who.int/emergencies/disease-outbreak-news']
  ]
};

const state = {
  view: 'panel',
  checks: new Set([0, 2, 3]),
  symptoms: new Set(['fever']),
  selectedAlert: 'madrid-alertas',
  locationEnabled: false,
  userLocation: null,
  notices: [],
  noticesStatus: 'Cargando avisos oficiales...',
  noticesUpdatedAt: null,
  chatInput: '',
  messages: [
    ['bot', 'Hola. Puedo orientarte sobre alertas cercanas, síntomas, prevención, centros de salud y protocolos laborales. Cuéntame qué necesitas.']
  ],
  aiStatus: 'Asistente disponible'
};

const root = document.getElementById('root');
let mapInstance;

function icon(name) {
  const paths = {
    logo: '<path d="M12 3v18M3 12h18"/>',
    dashboard: '<path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    pulse: '<path d="M3 13h4l2-6 4 12 2-6h6"/>',
    hospital: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M9 21v-6h6v6"/><path d="M12 7v5M9.5 9.5h5"/>',
    course: '<path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10v5c3 3 7 3 10 0v-5"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    empty: '<circle cx="12" cy="12" r="9"/>',
    location: '<path d="m12 2 7 19-7-4-7 4 7-19Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>',
    external: '<path d="M14 3h7v7"/><path d="m10 14 11-11"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.dashboard}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function render() {
  root.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <a class="brand" href="#" data-view="panel"><span>${icon('logo')}</span><strong>Alerta Salud</strong></a>
        <nav class="nav">
          ${nav('panel', 'dashboard', 'Panel')}
          ${nav('alertas', 'bell', 'Alertas')}
          ${nav('mapa', 'map', 'Mapa real')}
          ${nav('prevencion', 'shield', 'Prevención')}
          ${nav('sintomas', 'pulse', 'Síntomas')}
          ${nav('centros', 'hospital', 'Centros')}
          ${nav('curso', 'course', 'Curso rápido')}
          ${nav('ia', 'bot', 'Asistente IA')}
        </nav>
        <div class="sidebar-note">
          <span>Datos</span>
          <strong>Fuentes oficiales + demo local</strong>
          <small>${state.noticesStatus}</small>
        </div>
      </aside>
      <main class="workspace">
        ${topbar()}
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

function topbar() {
  return `
    <header class="topbar">
      <div><p>Plataforma web ciudadana y profesional</p><h1>${pageTitle()}</h1></div>
      <div class="top-actions">
        <label class="search">${icon('search')}<input placeholder="Buscar brote, síntoma o zona" /></label>
        <button class="location-button" data-location>${icon('location')}${state.locationEnabled ? 'Ubicación activa' : 'Activar ubicación'}</button>
      </div>
    </header>
  `;
}

function pageTitle() {
  return {
    panel: 'Vista general',
    alertas: 'Alertas tempranas',
    mapa: 'Mapa real de riesgo',
    prevencion: 'Guía de prevención',
    sintomas: 'Reconocimiento de síntomas',
    centros: 'Centros de salud',
    curso: 'Curso rápido para trabajadores',
    ia: 'Asistente IA'
  }[state.view];
}

function page() {
  if (state.view === 'alertas') return alertsPage();
  if (state.view === 'mapa') return mapPage();
  if (state.view === 'prevencion') return preventionPage();
  if (state.view === 'sintomas') return symptomsPage();
  if (state.view === 'centros') return centersPage();
  if (state.view === 'curso') return coursePage();
  if (state.view === 'ia') return aiPage();
  return dashboardPage();
}

function dashboardPage() {
  const completed = Math.round((state.checks.size / data.prevention.length) * 100);
  const high = data.alerts.filter((alert) => alert.level === 'alto').length;
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="eyebrow">alerta temprana geolocalizada</span>
        <h2>Brotes, zonas de riesgo, prevención y asistencia ciudadana en una sola web.</h2>
        <p>Mapa real, fuentes oficiales, checklist, triaje, centros, formación y asistente IA conectado mediante backend seguro.</p>
        <div class="hero-actions">
          <button data-view="alertas">Revisar alertas ${icon('arrow')}</button>
          <button class="ghost" data-view="mapa">Abrir mapa real</button>
        </div>
      </div>
      <div class="photo-board">
        ${data.photos.map((photo, index) => `<img src="${photo}" alt="Equipo sanitario real ${index + 1}" loading="lazy" />`).join('')}
      </div>
    </section>
    <section class="kpi-grid">
      ${kpi('Fuentes oficiales', data.officialSources.length, 'Madrid, CDC y OMS', 'bell')}
      ${kpi('Prevención', `${completed}%`, 'Checklist ciudadano', 'shield')}
      ${kpi('Centros abiertos', data.centers.filter((center) => center[4]).length, 'Con tiempo estimado', 'hospital')}
      ${kpi('Avisos vivos', state.notices.length || '...', 'CDC RSS si hay conexión', 'map')}
    </section>
    <section class="two-column">
      <div class="panel">
        <div class="panel-head"><h3>Alertas y fuentes principales</h3><button data-view="alertas">Ver todo</button></div>
        <div class="stack">${data.alerts.map(alertCard).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Avisos oficiales en vivo</h3>
            <p class="panel-subtitle">${state.noticesUpdatedAt ? `Última revisión: ${state.noticesUpdatedAt}` : 'Preparando sincronización automática'}</p>
          </div>
          <button data-refresh-notices>${icon('clock')}Actualizar</button>
        </div>
        <span class="badge live-badge">${state.noticesStatus}</span>
        <div class="notice-list">${officialNotices()}</div>
      </div>
    </section>
  `;
}

function alertsPage() {
  return `
    <section class="page-grid">
      <div class="panel wide">
        <div class="panel-head"><h3>Fuentes oficiales y alertas</h3><span class="badge">no inventa datos clínicos</span></div>
        <div class="alert-table">
          ${data.alerts.map((alert) => `
            <button class="alert-row ${state.selectedAlert === alert.id ? 'selected' : ''}" data-alert="${alert.id}">
              <span class="level ${alert.level}">${alert.level}</span>
              <strong>${alert.title}</strong>
              <span>${alert.zone}</span>
              <span>${alert.distance}</span>
              <span>${alert.cases}</span>
            </button>`).join('')}
        </div>
        <div class="source-grid">${data.officialSources.map(sourceCard).join('')}</div>
      </div>
      <aside class="panel detail-panel">${alertDetail()}</aside>
    </section>
  `;
}

function alertDetail() {
  const alert = data.alerts.find((item) => item.id === state.selectedAlert) || data.alerts[0];
  return `
    <span class="level ${alert.level}">${alert.level}</span>
    <h3>${alert.title}</h3>
    <p>${alert.zone}</p>
    <dl>
      <div><dt>Distancia</dt><dd>${alert.distance}</dd></div>
      <div><dt>Estado</dt><dd>${alert.cases}</dd></div>
      <div><dt>Fuente</dt><dd>${alert.source}</dd></div>
      <div><dt>Actualización</dt><dd>${alert.updated}</dd></div>
    </dl>
    <div class="recommendation"><strong>Recomendación</strong><span>${alert.action}</span></div>
    <a class="external-link" href="${alert.link}" target="_blank" rel="noreferrer">Abrir fuente oficial ${icon('external')}</a>
  `;
}

function mapPage() {
  return `
    <section class="map-page">
      <div id="realMap" class="real-map" aria-label="Mapa real con OpenStreetMap"></div>
      <div class="panel">
        <h3>Mapa real</h3>
        <p class="muted">Usa OpenStreetMap. Si activas ubicación, el navegador pedirá permiso y centrará el mapa en tu zona aproximada.</p>
        <div class="filters">
          <button class="active">Fuentes oficiales</button>
          <button>Centros sanitarios</button>
          <button>Zonas de ejemplo</button>
          <button>Avisos internacionales</button>
        </div>
        <div class="legend">
          <span><i class="red"></i>Alerta o fuente prioritaria</span>
          <span><i class="amber"></i>Aviso internacional</span>
          <span><i class="green"></i>Centro o prevención</span>
        </div>
      </div>
    </section>
  `;
}

function preventionPage() {
  const completed = Math.round((state.checks.size / data.prevention.length) * 100);
  return `
    <section class="two-column">
      <div class="panel">
        <div class="progress-hero">${icon('shield')}<div><span>Guía interactiva</span><strong>${completed}% completado</strong></div><div class="ring" style="--value:${completed}%"></div></div>
        <div class="checklist">
          ${data.prevention.map((item, index) => `<button data-check="${index}" class="${state.checks.has(index) ? 'checked' : ''}">${icon(state.checks.has(index) ? 'check' : 'empty')}<span>${item}</span></button>`).join('')}
        </div>
      </div>
      <div class="panel visual-panel">
        <img src="${data.photos[1]}" alt="Profesional sanitario revisando información preventiva" loading="lazy" />
        <h3>Plan preventivo recomendado</h3>
        <div class="timeline">
          <article><span>Hoy</span><strong>Activar ubicación y revisar zonas</strong><p>Recibe avisos cuando exista un riesgo cercano.</p></article>
          <article><span>Esta semana</span><strong>Actualizar vacunas y contacto médico</strong><p>Reduce riesgo en personas vulnerables y acelera la derivación.</p></article>
          <article><span>Siempre</span><strong>Higiene, ventilación y reporte</strong><p>Pequeñas acciones constantes reducen transmisión comunitaria.</p></article>
        </div>
      </div>
    </section>
  `;
}

function symptomsPage() {
  const score = data.symptoms.reduce((sum, [id, , points]) => sum + (state.symptoms.has(id) ? points : 0), 0);
  const label = score >= 8 ? 'Urgencia recomendada' : score >= 4 ? 'Consulta prioritaria' : 'Vigilancia en casa';
  const text = score >= 8
    ? 'Busca atención inmediata o llama a urgencias. La combinación marcada incluye señales de alarma.'
    : score >= 4
      ? 'Contacta con atención primaria y evita exposición hasta recibir orientación.'
      : 'Observa evolución, hidrátate y revisa nuevas señales durante las próximas 24-48 horas.';
  return `
    <section class="two-column">
      <div class="panel">
        <div class="triage ${score >= 8 ? 'urgent' : ''}">${icon('pulse')}<span>Resultado orientativo</span><strong>${label}</strong><p>${text}</p></div>
        <div class="symptom-grid">
          ${data.symptoms.map(([id, label]) => `<button data-symptom="${id}" class="${state.symptoms.has(id) ? 'selected' : ''}">${label}</button>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Derivación automática</h3>
        <div class="derivation">
          <article><strong>1. Evaluar síntomas</strong><span>La web calcula prioridad según señales marcadas.</span></article>
          <article><strong>2. Recomendar centro</strong><span>Muestra centros cercanos y tiempos estimados.</span></article>
          <article><strong>3. Preparar mensaje</strong><span>Resume síntomas para llamada o cita médica.</span></article>
        </div>
        <button class="primary" data-view="centros">Ver centros recomendados</button>
      </div>
    </section>
  `;
}

function centersPage() {
  return `
    <section class="panel">
      <div class="panel-head"><h3>Centros de salud y derivación</h3><button>Exportar resumen</button></div>
      <div class="centers-grid">
        ${data.centers.map(([name, type, distance, wait, open]) => `
          <article class="center-card">
            <div>${icon('hospital')}</div><h3>${name}</h3><p>${type}</p>
            <dl><div><dt>Distancia</dt><dd>${distance}</dd></div><div><dt>Espera</dt><dd>${wait}</dd></div></dl>
            <span class="${open ? 'open' : 'closed'}">${open ? 'Abierto' : 'Cita previa'}</span>
          </article>`).join('')}
      </div>
    </section>
  `;
}

function coursePage() {
  return `
    <section class="two-column">
      <div class="panel">
        <div class="course-head">${icon('course')}<div><span>Curso rápido</span><strong>Trabajadores preparados en menos de 1 hora</strong></div></div>
        <div class="lesson-list">
          ${data.lessons.map(([title, time, done]) => `<article><div class="${done ? 'done' : ''}">${icon(done ? 'check' : 'clock')}</div><strong>${title}</strong><span>${time}</span></article>`).join('')}
        </div>
      </div>
      <div class="panel visual-panel">
        <img src="${data.photos[2]}" alt="Formación sanitaria para trabajadores" loading="lazy" />
        <h3>Certificado interno</h3>
        <p class="muted">Pensado para limpieza, hostelería, educación, recepción, transporte y atención al público.</p>
        <div class="score-card"><strong>40%</strong><span>avance del curso</span></div>
        <button class="primary">Continuar curso</button>
      </div>
    </section>
  `;
}

function aiPage() {
  return `
    <section class="two-column ai-layout">
      <div class="panel chat-panel">
        <div class="ai-title">${icon('bot')}<div><span>Asistente ciudadano</span><strong>Respuestas claras para actuar sin perder tiempo</strong></div></div>
        <div class="quick-prompts">
          <button data-prompt="Tengo fiebre y estoy en una zona de riesgo">Tengo fiebre</button>
          <button data-prompt="¿Cuándo debo acudir a urgencias?">Urgencias</button>
          <button data-prompt="¿Qué medidas debo tomar en el trabajo?">Trabajo</button>
        </div>
        <div class="chat">${state.messages.map(([role, text]) => `<div class="bubble ${role}">${escapeHtml(text)}</div>`).join('')}</div>
        <label class="composer"><input value="${escapeHtml(state.chatInput)}" placeholder="Escribe tu pregunta" aria-label="Pregunta para el asistente" /><button data-send>${icon('arrow')}Enviar</button></label>
        <p class="ai-status">${escapeHtml(state.aiStatus)}</p>
      </div>
      <aside class="panel integration-panel">
        <span class="badge">Uso responsable</span>
        <h3>Orientación, no diagnóstico</h3>
        <p>El asistente ayuda a entender pasos preventivos y señales de alarma. No sustituye a un profesional sanitario.</p>
        <div class="setup-steps">
          <article><strong>1</strong><span>Busca ayuda urgente si hay dificultad respiratoria, dolor en pecho o confusión.</span></article>
          <article><strong>2</strong><span>Ten a mano edad, síntomas, duración, medicación y contactos de riesgo.</span></article>
          <article><strong>3</strong><span>Consulta fuentes oficiales antes de tomar decisiones importantes.</span></article>
          <article><strong>4</strong><span>Evita compartir datos personales innecesarios.</span></article>
        </div>
      </aside>
    </section>
  `;
}

function kpi(label, value, hint, iconName) {
  return `<article class="kpi">${icon(iconName)}<span>${label}</span><strong>${value}</strong><small>${hint}</small></article>`;
}

function alertCard(alert) {
  return `<article class="alert-card"><span class="level ${alert.level}">${alert.level}</span><div><strong>${alert.title}</strong><p>${alert.zone} · ${alert.distance}</p></div><small>${alert.source}</small></article>`;
}

function sourceCard([title, description, link]) {
  return `<a class="source-card" href="${link}" target="_blank" rel="noreferrer"><strong>${title}</strong><span>${description}</span>${icon('external')}</a>`;
}

function officialNotices() {
  if (!state.notices.length) {
    return `<article class="notice-card"><strong>${state.noticesStatus}</strong><span>Si no hay conexión, usa los enlaces oficiales de Madrid, CDC y OMS.</span></article>`;
  }
  return state.notices.slice(0, 5).map((notice) => `
    <a class="notice-card" href="${notice.link}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(notice.title)}</strong><span>${escapeHtml(notice.source)} · ${escapeHtml(notice.date)}</span>
    </a>
  `).join('');
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      state.view = item.dataset.view;
      render();
    });
  });
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
  const location = document.querySelector('[data-location]');
  if (location) location.addEventListener('click', requestLocation);
  const refresh = document.querySelector('[data-refresh-notices]');
  if (refresh) refresh.addEventListener('click', () => loadNotices({ manual: true }));
  const input = document.querySelector('.composer input');
  if (input) input.addEventListener('input', (event) => {
    state.chatInput = event.target.value;
  });
  document.querySelectorAll('[data-prompt]').forEach((item) => item.addEventListener('click', () => {
    state.chatInput = item.dataset.prompt;
    render();
  }));
  const send = document.querySelector('[data-send]');
  if (send) send.addEventListener('click', sendMessage);
}

function afterRender() {
  if (state.view === 'mapa') initMap();
}

function initMap() {
  const node = document.getElementById('realMap');
  if (!node || !window.L) return;
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  const center = state.userLocation || [40.4168, -3.7038];
  mapInstance = L.map(node, { scrollWheelZoom: true }).setView(center, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);
  L.marker([40.4168, -3.7038]).addTo(mapInstance).bindPopup('Madrid · referencia regional');
  L.circle([40.43, -3.70], { radius: 1800, color: '#d94b4b', fillColor: '#d94b4b', fillOpacity: 0.22 }).addTo(mapInstance).bindPopup('Zona de ejemplo: riesgo alto');
  L.circle([40.39, -3.68], { radius: 1500, color: '#d88a16', fillColor: '#d88a16', fillOpacity: 0.2 }).addTo(mapInstance).bindPopup('Zona de ejemplo: seguimiento');
  data.centers.forEach((centerData, index) => {
    L.marker([40.407 + index * 0.012, -3.71 + index * 0.018]).addTo(mapInstance).bindPopup(centerData[0]);
  });
  if (state.userLocation) {
    L.marker(state.userLocation).addTo(mapInstance).bindPopup('Tu ubicación aproximada');
  }
  setTimeout(() => mapInstance?.invalidateSize(), 150);
}

function requestLocation() {
  if (!navigator.geolocation) {
    state.locationEnabled = false;
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
    () => {
      state.locationEnabled = false;
      alert('No se pudo obtener la ubicación. Puedes seguir usando el mapa manualmente.');
      render();
    },
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 }
  );
}

async function sendMessage() {
  const prompt = state.chatInput.trim();
  if (!prompt) return;
  state.messages.push(['user', prompt]);
  state.messages.push(['bot', 'Consultando asistente...']);
  state.chatInput = '';
  render();
  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        context: {
          selectedAlert: data.alerts.find((alert) => alert.id === state.selectedAlert),
          symptoms: [...state.symptoms],
          officialSources: data.officialSources.map(([title, , link]) => ({ title, link }))
        }
      })
    });
    const result = await response.json();
    state.messages[state.messages.length - 1] = ['bot', result.answer || buildAiAnswer(prompt)];
    state.aiStatus = result.mode === 'openai' ? 'Respuesta generada' : 'Respuesta orientativa';
  } catch {
    state.messages[state.messages.length - 1] = ['bot', buildAiAnswer(prompt)];
    state.aiStatus = 'Respuesta orientativa';
  }
  render();
}

function buildAiAnswer(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('urgencia') || lower.includes('respirar') || lower.includes('pecho')) {
    return 'Si hay dificultad para respirar, dolor en pecho, confusión, labios azulados o empeoramiento rápido, busca atención urgente. También puedo ayudarte a preparar la información para el centro de salud.';
  }
  if (lower.includes('trabajo') || lower.includes('empresa')) {
    return 'Para el trabajo: comunica síntomas, evita acudir si hay fiebre o contacto de riesgo, ventila espacios, refuerza higiene y registra incidencias sin compartir datos sensibles innecesarios.';
  }
  if (lower.includes('zona') || lower.includes('brote')) {
    return 'En zona de riesgo: reduce exposición, revisa alertas actualizadas, usa medidas preventivas y contacta con atención sanitaria si aparecen síntomas compatibles o perteneces a un grupo vulnerable.';
  }
  return 'Puedo orientarte con prevención, síntomas, brotes, centros de salud y protocolos laborales. Esta respuesta no sustituye la valoración médica; ante señales de alarma, contacta con un servicio sanitario.';
}

async function loadNotices(options = {}) {
  if (options.manual) {
    state.noticesStatus = 'Actualizando avisos...';
    render();
  }
  try {
    const response = await fetch(`/api/notices?ts=${Date.now()}`);
    const result = await response.json();
    state.notices = result.items || [];
    state.noticesStatus = state.notices.length ? 'Avisos CDC cargados' : 'Fuentes oficiales disponibles';
    state.noticesUpdatedAt = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    state.noticesStatus = 'Sin conexión al feed oficial';
    state.noticesUpdatedAt = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  render();
}

render();
loadNotices();
setInterval(() => loadNotices(), 5 * 60 * 1000);

const fallbackNotices = [
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

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

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

    response.status(200).json({ items: items.length ? items : fallbackNotices });
  } catch {
    response.status(200).json({ items: fallbackNotices });
  }
}

function readTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
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

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'fecha oficial';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

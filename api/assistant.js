export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const prompt = String(request.body?.message || '').trim();
  const context = request.body?.context || {};
  const key = process.env.OPENAI_API_KEY;

  if (!prompt) {
    response.status(400).json({ error: 'Pregunta vacía' });
    return;
  }

  if (!key) {
    response.status(200).json({
      mode: 'demo',
      answer: fallbackAnswer(prompt)
    });
    return;
  }

  try {
    const openai = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
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
          `Contexto de la plataforma: ${JSON.stringify(context)}`
        ].join('\n'),
        input: prompt
      })
    });

    const result = await openai.json();
    if (!openai.ok) throw new Error(result.error?.message || 'OpenAI error');

    response.status(200).json({
      mode: 'openai',
      answer: result.output_text || 'No he podido generar una respuesta.'
    });
  } catch {
    response.status(200).json({
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

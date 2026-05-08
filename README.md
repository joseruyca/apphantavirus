# Alerta Salud Web

Web de alertas tempranas por geolocalización, prevención, triaje, centros de salud, formación rápida y asistente IA.

## Cómo verla

1. Abre una terminal en esta carpeta.
2. Ejecuta:

```powershell
npm run dev
```

3. Entra en:

```text
http://127.0.0.1:4180
```

## Cómo pasar la API de OpenAI

No pegues la API key dentro de `index.html`, `src/main.js` ni ningún archivo público.

Haz esto:

1. Entra en https://platform.openai.com/home
2. Crea una API key.
3. Duplica `.env.example` y renómbralo a `.env`.
4. Pega tu clave:

```text
OPENAI_API_KEY=tu_clave_real
OPENAI_MODEL=gpt-5.2
```

5. Reinicia la web con:

```powershell
npm run dev
```

El navegador llama a `/api/assistant`, y el servidor local llama a OpenAI. Así la clave no queda expuesta en la web.

## Datos reales y fuentes

La web incluye:

- Mapa real con OpenStreetMap.
- Geolocalización real del navegador, si el usuario acepta permisos.
- Feed oficial de CDC Travel Health Notices mediante `https://wwwnc.cdc.gov/travel/rss/notices.xml`.
- Enlaces a Comunidad de Madrid, Vigilancia Epidemiológica, CDC y OMS.
- Actualización automática de avisos cada 5 minutos mientras la web está abierta.
- Botón manual "Actualizar" en el panel de avisos.

Los círculos de riesgo y centros incluidos en el mapa son ejemplos visuales hasta conectar una base de datos oficial/local con coordenadas verificadas.

Para actualización 24/7 aunque nadie tenga la web abierta, el siguiente paso sería desplegar el backend en un servidor y añadir una tarea programada que sincronice fuentes oficiales cada pocos minutos.

## Fuentes oficiales incluidas

- Comunidad de Madrid: https://www.comunidad.madrid/salud/alertas-salud-publica
- Vigilancia Epidemiológica Comunidad de Madrid: https://www.comunidad.madrid/salud/vigilancia-epidemiologica
- CDC Travel Health Notices: https://wwwnc.cdc.gov/travel/notices/
- WHO Disease Outbreak News: https://www.who.int/emergencies/disease-outbreak-news

## Siguiente paso profesional

Para producción real haría falta:

- Base de datos de alertas con latitud, longitud, nivel, vigencia y fuente.
- Panel admin para publicar alertas verificadas.
- Backend con autenticación y registros.
- Política legal, privacidad, cookies y aviso sanitario.
- Integración con APIs oficiales locales si están disponibles.

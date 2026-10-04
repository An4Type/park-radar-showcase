# Park Radar showcase

A one-page site that shows the live Park Radar PWA inside a phone frame and lets viewers switch between the original and annotated parking-camera frames from the Detection API.

## Connect the backend

The page fetches `GET /api/detection` from `park-radar-ai-show-case`. Local development works out of the box when that API is running on port 3000.

Before deploying, edit `public/config.js` with the public URLs:

```js
window.PARK_RADAR_CONFIG = Object.freeze({
  appUrl: 'https://your-pwa.example/',
  detectionUrl: 'https://your-detection-api.example/api/detection',
});
```

Set `CORS_ORIGINS=https://your-showcase.workers.dev` on the backend to restrict browser access to the deployed showcase. The backend permits every origin by default, which makes local development work without extra configuration.

- Deploy: `npx wrangler deploy` (Cloudflare Workers static assets)
- Local preview: `npx wrangler dev`

## Kraków (Polish) deployment

`wrangler.krakow.jsonc` deploys the same page as `park-radar-krakow-demo`, in Polish and embedding `https://park-radar-krakow.maksym782.workers.dev/`. Its build step, `scripts/build-krakow.mjs`, copies `public/` to `dist/krakow/` and writes a `config.js` with `locale: 'pl'` and the Kraków URLs.

- Deploy: `npx wrangler deploy -c wrangler.krakow.jsonc`
- Local preview: `npx wrangler dev -c wrangler.krakow.jsonc`

// Builds the Polish Kraków showcase into dist/krakow: a copy of public/ with
// its own config.js. Run by `wrangler deploy -c wrangler.krakow.jsonc`.
import { cp, rm, writeFile } from 'node:fs/promises';

const outDir = new URL('../dist/krakow/', import.meta.url);

const config = {
  locale: 'pl',
  appUrl: 'https://park-radar-krakow.maksym782.workers.dev/',
  detectionUrl: 'https://parkradar.makssm.com/showcase/api/detection',
};

await rm(outDir, { recursive: true, force: true });
await cp(new URL('../public/', import.meta.url), outDir, { recursive: true });
await writeFile(
  new URL('config.js', outDir),
  `window.PARK_RADAR_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
);

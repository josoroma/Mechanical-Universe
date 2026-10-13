import {readFileSync, writeFileSync} from 'node:fs';

const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');

// Embed the collection theme so every generated page also works offline.
export function writeThemedHtml(file, html) {
  if (!html.includes('</head>') || html.includes('data-collection-theme')) {
    throw new Error(`No se puede integrar el tema en ${file}`);
  }
  writeFileSync(file, html.replace('</head>', `<style data-collection-theme="luma">\n${css}\n</style></head>`));
}

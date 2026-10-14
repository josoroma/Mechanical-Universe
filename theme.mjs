import {readFileSync, writeFileSync} from 'node:fs';

export const DEFAULT_THEME = 'dark';

const css = ['theme.css', 'machine-materials.css']
  .map(file => readFileSync(new URL(`./${file}`, import.meta.url), 'utf8'))
  .join('\n');
const playback = readFileSync(new URL('./playback.js', import.meta.url), 'utf8');

// Embed the collection theme so every generated page also works offline.
export function writeThemedHtml(file, html) {
  if (!html.includes('</head>') || html.includes('data-collection-theme')) {
    throw new Error(`No se puede integrar el tema en ${file}`);
  }
  const recovery = html.includes('MechanicalPlayback.bind(') ? `<script data-playback-lifecycle>\n${playback}\n</script>` : '';
  writeFileSync(file, html.replace('</head>', `<style data-collection-theme="luma">\n${css}\n</style>${recovery}</head>`));
}

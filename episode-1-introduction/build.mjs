import {DEFAULT_THEME, writeThemedHtml} from '../theme.mjs';
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";
import * as M from "./mechanism.mjs";
import { instrument } from "./instrument.mjs";
import { auditPose } from "./audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const source = (name) => readFileSync(join(HERE, name), "utf8");
const strip = (text) => text.replace(/^import .*;\n/gm, "").replace(/^export /gm, "");
const bundle = (name, namespace, exports, preface = "") => `const ${namespace}=(()=>{${preface}\n${strip(source(name))}\nreturn {${Object.keys(exports).join(",")}};})();\n`;
const runtime = (bundle("kit/iso-kit.mjs", "K", K)
  + bundle("kit/lathe.mjs", "G", G, "const {cameraOf,iso,pathOf}=K;")
  + bundle("model.mjs", "O", O)
  + bundle("mechanism.mjs", "M", M)
  + strip(source("live.js"))).replace(/<\/script/gi, "<\\/script");
const fixed = instrument();
if (process.argv.includes("--audit")) {
  for (const [mode, eccentricity] of [[0, 0.094], [1, 0.094], [2, 0.45]]) auditPose(mode, 0.22, eccentricity);
}
const icon = `<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11"/><ellipse cx="15" cy="15" rx="5" ry="13" transform="rotate(45 15 15)"/><path d="M2 15h26M15 2v26"/><circle cx="15" cy="15" r="2"/></svg>`;
const eraButtons = O.ERAS.map((era, i) => `<button class="era-button" type="button" data-mode="${i}" aria-pressed="${i === 0}"><span class="era-number">0${i + 1}</span><span><span class="era-name">${era.name}</span><span class="era-subtitle">${["La Tierra en el centro", "La Tierra es un planeta", "La gravedad explica el movimiento"][i]}</span></span><span class="era-date">${era.year}</span></button>`).join("");
const planetButtons = O.PLANETS.map((planet) => `<button type="button" class="planet-button" data-planet="${planet.id}" aria-pressed="${planet.id === "mars"}"><span class="legend-dot" aria-hidden="true"></span>${planet.name}</button>`).join("");
const [cx, cy] = K.iso([0, 0, -119], M.PROJECTION);
const svg = `<svg class="iso-svg drawing" viewBox="0 0 ${M.VIEW_WIDTH} ${M.VIEW_HEIGHT}" role="img" aria-labelledby="instrument-title instrument-description"><title id="instrument-title">Gran planetario mecánico</title><desc id="instrument-description">Un planetario mecánico de latón sobre una base de nogal. Los brazos que sostienen los planetas muestran tres modelos: la Tierra inmóvil con Marte en un epiciclo, órbitas circulares alrededor del Sol y órbitas elípticas explicadas por la gravedad de Newton.</desc><ellipse class="shadow" cx="${cx}" cy="${cy}" rx="305" ry="111"/>${fixed.svg}<g id="orbit-layer">${M.orbitTracks(0)}</g><g id="area-layer" style="display:none">${M.areaSectors(0.22, 0.094)}</g><g id="mechanism-layer"></g></svg>`;
const body = `<div class="page">
<header class="masthead"><a class="wordmark" href="../index.html" aria-label="El universo mecánico, índice de episodios">${icon}<span>El universo mecánico</span></a><div class="masthead-right"><span class="folio">Comprender el mundo a través del movimiento</span><button type="button" class="theme-toggle" id="theme" aria-label="Cambiar al tema claro"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15 13.6A7 7 0 0 1 6.4 5a7 7 0 1 0 8.6 8.6Z"/></svg></button></div></header>
<main><section class="intro" aria-labelledby="page-title"><div><p class="eyebrow">Episodio 01 <span>·</span> Introducción</p><h1 id="page-title">Un universo<br><em>en movimiento.</em></h1></div><p class="intro-copy">Tres formas de mirar el cielo.<br>Un cambio extraordinario de perspectiva.<br><strong>Pon el mecanismo en marcha. Sigue la idea.</strong></p></section>
<div class="era-selector" role="group" aria-label="Elige un modelo histórico">${eraButtons}</div>
<section class="exhibit iso-plate" aria-label="Gran planetario mecánico interactivo"><div class="exhibit-main"><div class="stage" tabindex="0" role="group" aria-label="Planetario mecánico interactivo"><div class="stage-corners"><span class="corner">Fig. 01 / El planetario</span><span class="corner" id="center-label">La Tierra en el centro</span></div>${svg}<div class="stage-bottom"><span class="stage-status"><span class="live-dot"></span><span id="stage-state">El mecanismo está en marcha</span></span><span class="keyboard-hint"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> modelos <span>·</span> <kbd>espacio</kbd> reproducir/pausar</span></div></div>
<aside class="story" aria-label="Explicación y mediciones en tiempo real"><div class="story-top"><p class="tag" id="era-tag"></p><div class="year" id="era-year"></div><h2 id="era-heading"></h2></div><p class="story-description" id="era-description"></p><div class="principle"><p class="meta-label" id="principle-label"></p><div class="equation" id="equation"></div></div><div class="readings"><div class="metric"><p class="meta-label" id="metric-1-label"></p><strong id="metric-1"></strong></div><div class="metric"><p class="meta-label" id="metric-2-label"></p><strong id="metric-2"></strong></div></div>
<div class="eccentricity" id="eccentricity-panel" hidden><label for="eccentricity">Excentricidad de Marte <output id="ecc-value" for="eccentricity">0,094</output></label><input type="range" id="eccentricity" min="0" max="0.45" value="0.094" step="0.001"><p class="small-note" id="ecc-note"></p><label class="area-toggle"><input type="checkbox" id="areas" checked>Mostrar áreas barridas en tiempos iguales</label></div><div class="story-footer" id="discovery"></div></aside></div>
<div class="playback" role="group" aria-label="Controles de reproducción"><button type="button" class="play" id="play" aria-label="Pausar el movimiento orbital"><svg id="pause-icon" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1h2v10H1ZM7 1h2v10H7Z"/></svg><svg id="play-icon" viewBox="0 0 10 12" style="display:none" aria-hidden="true"><path d="M1 1 10 6 1 11Z"/></svg><span id="play-label">Pausar</span></button><button class="reset" type="button" id="reset" aria-label="Restablecer el tiempo del modelo y la excentricidad de Marte"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6.5A6.5 6.5 0 1 1 3.5 11M4.5 2v5h5"/></svg></button><div class="scrub"><label class="sr-only" for="time">Tiempo del modelo en años terrestres</label><input type="range" id="time" min="0" max="8" step="0.001" value="0.22"><output for="time" class="model-time" id="model-time">0,22 años</output></div><label class="speed" for="speed"><span>Velocidad</span><select id="speed" aria-label="Velocidad de reproducción"><option value="0.5">½×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div>
<div class="readout-row"><span class="readout" data-readout></span><span class="area-key" id="area-key" hidden>Dos intervalos de 0,12 años · áreas iguales</span></div></section>
<div class="planet-legend" role="group" aria-label="Selecciona un planeta para ver sus mediciones en tiempo real">${planetButtons}<span class="control-note">Selecciona un planeta para conocer su movimiento.</span></div>
<div class="caption"><p><strong>De describir el cielo a explicar sus movimientos.</strong> <span id="historical-note"></span></p><div class="scale-note">Distancias comprimidas · esferas ampliadas<br>Los brazos están a distintas alturas para separar los mecanismos<br>Tiempo en años terrestres · ua = unidad astronómica</div></div></main>
<footer class="footer"><div><span class="source-label">Para saber más</span><div class="source-links"><a href="https://science.nasa.gov/earth/earth-observatory/planetary-motion/" target="_blank" rel="noreferrer">NASA · historia del movimiento planetario ↗</a><a href="https://science.nasa.gov/solar-system/orbits-and-keplers-laws/" target="_blank" rel="noreferrer">NASA · leyes de Kepler ↗</a><a href="https://catalogue.museogalileo.it/multimedia/CopernicanSystemBis.html" target="_blank" rel="noreferrer">Museo Galileo · modelos históricos ↗</a><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">NASA · datos de los planetas ↗</a></div></div><span class="end-mark">El mundo se vuelve comprensible.</span></footer><p class="sr-only" id="announcement" role="status" aria-live="polite"></p></div>`;
const css = K.ISO_CSS + "\n" + source("styles.css");
for (const [name, theme] of [["index.html", DEFAULT_THEME], ["episode-1-dark.html", "dark"]]) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Episodio 1 de El universo mecánico: explora los modelos ptolemaico, copernicano y newtoniano con un gran planetario mecánico interactivo."><title>Introducción — El universo mecánico</title><style>${css}</style></head><body class="iso" data-theme="${theme}">${body}<script type="module">${runtime}</script></body></html>`;
  writeThemedHtml(join(HERE, name), html);
  console.log(`wrote ${name} · ${fixed.count} fixed solids · standalone ${theme} theme`);
}

import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as M from "./mechanism.mjs";

const stage = document.querySelector(".stage");
const mechanism = document.querySelector("#mechanism-layer");
const tracks = document.querySelector("#orbit-layer");
const sectors = document.querySelector("#area-layer");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (selector) => document.querySelector(selector);
const state = { mode: 0, shownMode: 0, time: 0.22, targetTime: 0.22, playing: !reduced.matches, speed: 1, eccentricity: 0.094, targetE: 0.094, selected: "mars", areas: true, opacity: 1, fadeTarget: 1, visible: true };
const nodes = new Map();
let frame = 0;
let last = 0;
let lastPaint = 0;
let lastReadout = 0;
let trackKey = "";
const scaleTime = 0.065;

function paintMechanism() {
  const items = M.mechanismItems(state.shownMode, state.time, state.eccentricity);
  const names = new Set(items.map((item) => item.name));
  for (const [name, entry] of nodes) if (!names.has(name)) { entry.node.remove(); nodes.delete(name); }
  items.forEach((item, index) => {
    let entry = nodes.get(item.name);
    if (!entry) {
      const node = document.createElementNS("http://www.w3.org/2000/svg", "g");
      node.dataset.piece = item.name;
      node.innerHTML = item.svg;
      entry = { node, paths: [...node.querySelectorAll("path")], old: item.svg };
      nodes.set(item.name, entry);
    } else if (item.carrier) {
      entry.node.querySelector(".planet-object").setAttribute("transform", K.translateAlong(M.PROJECTION, [item.carrier.x, item.carrier.y, item.carrier.z]));
    } else if (entry.old !== item.svg) {
      const paths = [...item.svg.matchAll(/\sd="([^"]*)"/g)].map((match) => match[1]);
      if (paths.length !== entry.paths.length) {
        entry.node.innerHTML = item.svg;
        entry.paths = [...entry.node.querySelectorAll("path")];
      } else paths.forEach((d, i) => { if (entry.paths[i].getAttribute("d") !== d) entry.paths[i].setAttribute("d", d); });
      entry.old = item.svg;
    }
    if (mechanism.children[index] !== entry.node) mechanism.insertBefore(entry.node, mechanism.children[index] ?? null);
  });
  const nextTrackKey = `${state.shownMode}:${state.eccentricity.toFixed(4)}`;
  if (trackKey !== nextTrackKey) { tracks.innerHTML = M.orbitTracks(state.shownMode, state.eccentricity); trackKey = nextTrackKey; }
  sectors.style.display = state.shownMode === 2 && state.areas ? "" : "none";
  if (state.shownMode === 2 && state.areas) {
    const areaPaths = [...M.areaSectors(state.time, state.eccentricity).matchAll(/\sd="([^"]*)"/g)].map((match) => match[1]);
    [...sectors.children].forEach((node, i) => node.setAttribute("d", areaPaths[i]));
  }
  mechanism.style.opacity = state.opacity;
  tracks.style.opacity = state.opacity;
  sectors.style.opacity = state.opacity;
}

function announce(text) { $("#announcement").textContent = text; }
function updateReadout() {
  const era = O.ERAS[state.shownMode];
  const data = O.telemetry(state.shownMode, state.time, state.selected, state.eccentricity);
  $("#metric-1-label").textContent = data.firstLabel;
  $("#metric-1").textContent = data.firstValue;
  $("#metric-2-label").textContent = data.secondLabel;
  $("#metric-2").textContent = data.secondValue;
  $("[data-readout]").textContent = data.readout;
  $("#model-time").textContent = `${O.formatNumber(state.time)} años`;
  $("#time").value = state.time;
  $("#time").setAttribute("aria-valuetext", `${O.formatNumber(state.time)} años terrestres`);
  $("#ecc-value").textContent = O.formatNumber(state.eccentricity, 3);
  $("#eccentricity").setAttribute("aria-valuetext", O.formatNumber(state.eccentricity, 3));
  $("#ecc-note").textContent = Math.abs(state.targetE - 0.094) < 0.0001 ? "Excentricidad natural aproximada de Marte." : "Órbita de demostración; no representa al Marte actual.";
  $("#stage-state").textContent = reduced.matches ? "Exploración manual" : state.playing ? "El mecanismo está en marcha" : "El mecanismo está en pausa";
  $("#play-label").textContent = reduced.matches ? "Sin animación" : state.playing ? "Pausar" : "Reproducir";
  $("#play").setAttribute("aria-label", reduced.matches ? "Animación automática desactivada por la preferencia de movimiento reducido" : state.playing ? "Pausar el movimiento orbital" : "Reproducir el movimiento orbital");
  $("#play").disabled = reduced.matches;
  $("#pause-icon").style.display = state.playing ? "" : "none";
  $("#play-icon").style.display = state.playing ? "none" : "";
  stage.setAttribute("aria-label", `Planetario mecánico: modelo ${era.name.toLowerCase()}. ${state.shownMode === 2 ? "El Sol en uno de los focos" : `${era.center} en el centro`}. Usa las teclas 1, 2 y 3 para cambiar de modelo; la barra espaciadora para reproducir o pausar; y las flechas para avanzar o retroceder en el tiempo del modelo.`);
}

function eraCopy() {
  const era = O.ERAS[state.shownMode];
  $("#era-tag").textContent = era.tag;
  $("#era-year").textContent = era.year;
  $("#era-heading").textContent = era.heading;
  $("#era-description").textContent = era.description;
  $("#principle-label").textContent = era.principle;
  $("#equation").textContent = era.equation;
  $("#discovery").textContent = era.discovery;
  $("#historical-note").textContent = era.note;
  $("#center-label").textContent = state.shownMode === 2 ? "El Sol en uno de los focos" : `${era.center} en el centro`;
  $("#eccentricity-panel").hidden = state.shownMode !== 2;
  $("#area-key").hidden = state.shownMode !== 2 || !state.areas;
  document.body.dataset.era = era.id;
  document.querySelectorAll("[data-planet]").forEach((button) => {
    button.disabled = state.shownMode === 0 && !["mars", "earth"].includes(button.dataset.planet);
    button.setAttribute("aria-pressed", String(button.dataset.planet === state.selected));
  });
  updateReadout();
}

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  if (mode === 0 && !["earth", "mars"].includes(state.selected)) state.selected = "mars";
  document.querySelectorAll("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.mode) === mode)));
  if (reduced.matches || !state.visible) { state.shownMode = mode; state.opacity = state.fadeTarget = 1; eraCopy(); }
  else state.fadeTarget = 0;
  announce(`Modelo ${O.ERAS[mode].name.toLowerCase()} seleccionado. ${O.ERAS[mode].discovery}.`);
  run();
}

function setTime(time) {
  state.playing = false;
  state.targetTime = Math.max(0, Math.min(8, time));
  if (reduced.matches || !state.visible) state.time = state.targetTime;
  updateReadout();
  run();
}

function tick(now) {
  frame = 0;
  if (!state.visible || document.hidden) { last = 0; return; }
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = reduced.matches;
  if (state.playing && !calm) { state.targetTime = Math.min(8, state.targetTime + dt * scaleTime * state.speed); state.time = state.targetTime; if (state.time === 8) state.playing = false; }
  else state.time = calm ? state.targetTime : state.time + (state.targetTime - state.time) * (1 - Math.exp(-dt / 0.12));
  state.eccentricity = calm ? state.targetE : state.eccentricity + (state.targetE - state.eccentricity) * (1 - Math.exp(-dt / 0.23));
  state.opacity += (state.fadeTarget - state.opacity) * (1 - Math.exp(-dt / 0.1));
  if (state.fadeTarget === 0 && state.opacity < 0.025) { state.shownMode = state.mode; state.fadeTarget = 1; eraCopy(); }
  if (now - lastPaint > 30 || calm) { paintMechanism(); lastPaint = now; }
  if (now - lastReadout > 100 || calm) { updateReadout(); lastReadout = now; }
  const moving = state.playing && !calm || Math.abs(state.time - state.targetTime) > 0.00001 || Math.abs(state.eccentricity - state.targetE) > 0.00001 || Math.abs(state.opacity - state.fadeTarget) > 0.001 || state.mode !== state.shownMode;
  if (moving) frame = requestAnimationFrame(tick);
  else { state.opacity = state.fadeTarget; state.time = state.targetTime; state.eccentricity = state.targetE; paintMechanism(); updateReadout(); last = 0; }
}
function run() { if (!frame && state.visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } }

document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(Number(button.dataset.mode))));
$("#play").addEventListener("click", () => { if (state.targetTime === 8) state.time = state.targetTime = 0; state.playing = !state.playing && !reduced.matches; updateReadout(); announce(state.playing ? "Movimiento orbital en marcha" : "Movimiento orbital en pausa"); run(); });
$("#time").addEventListener("input", (event) => setTime(Number(event.target.value)));
$("#time").addEventListener("change", () => announce(`Tiempo del modelo: ${O.formatNumber(state.targetTime)} años`));
$("#speed").addEventListener("change", (event) => { state.speed = Number(event.target.value); run(); });
$("#reset").addEventListener("click", () => { setTime(0.22); state.targetE = 0.094; $("#eccentricity").value = 0.094; announce("Se han restablecido el tiempo del modelo y la excentricidad de Marte"); });
$("#eccentricity").addEventListener("input", (event) => { state.targetE = Number(event.target.value); if (!state.visible) { state.eccentricity = state.targetE; updateReadout(); } run(); });
$("#areas").addEventListener("change", (event) => { state.areas = event.target.checked; $("#area-key").hidden = !state.areas; run(); });
$("#theme").addEventListener("click", () => { const dark = document.body.dataset.theme !== "dark"; document.body.dataset.theme = dark ? "dark" : "light"; $("#theme").setAttribute("aria-label", dark ? "Cambiar al tema claro" : "Cambiar al tema oscuro"); announce(dark ? "Tema oscuro" : "Tema claro"); });
function selectPlanet(id) {
  if (!O.PLANETS.some((planet) => planet.id === id) || state.shownMode === 0 && !["earth", "mars"].includes(id)) return;
  state.selected = id;
  eraCopy();
  announce(`Planeta seleccionado para las mediciones en tiempo real: ${O.planetById(id).name}`);
  run();
}
document.querySelectorAll("[data-planet]").forEach((button) => button.addEventListener("click", () => selectPlanet(button.dataset.planet)));
stage.addEventListener("click", (event) => { const body = event.target.closest("[data-body]"); if (body) selectPlanet(body.dataset.body); });
stage.addEventListener("keydown", (event) => {
  if (["1", "2", "3"].includes(event.key)) { event.preventDefault(); setMode(Number(event.key) - 1); }
  else if (event.key === " " || event.key === "Enter") { event.preventDefault(); $("#play").click(); }
  else if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); setTime(state.targetTime + (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 0.25 : 0.025)); }
  else if (event.key === "Home") { event.preventDefault(); setTime(0); }
  else if (event.key === "End") { event.preventDefault(); setTime(8); }
  else if (event.key === "Escape") { state.playing = false; updateReadout(); run(); }
});
new IntersectionObserver((entries) => { state.visible = entries[entries.length - 1].isIntersecting; if (state.visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
document.addEventListener("visibilitychange", () => { if (!document.hidden) run(); });
reduced.addEventListener("change", () => { if (reduced.matches) { state.playing = false; state.shownMode = state.mode; state.opacity = state.fadeTarget = 1; state.time = state.targetTime; eraCopy(); } run(); });
window.orrery = { state, setMode, setTime, selectPlanet, snapshot: () => ({ ...state, readings: O.telemetry(state.shownMode, state.time, state.selected, state.eccentricity), positions: O.bodyPositions(state.shownMode, state.time, state.eccentricity) }) };
$("#theme").setAttribute("aria-label", document.body.dataset.theme === "dark" ? "Cambiar al tema claro" : "Cambiar al tema oscuro");
eraCopy();
paintMechanism();
run();

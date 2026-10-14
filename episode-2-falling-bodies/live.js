import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";

const state = { ...O.DEFAULTS };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const byId = (id) => document.getElementById(id);
const nodes = Object.fromEntries(["machine", "play", "play-label", "play-icon", "pause-icon", "time", "model-time", "angle", "angle-value", "height", "height-value", "mass", "mass-value", "acceleration", "ramp-duration", "ramp-settings", "drop-settings", "experiment-tag", "experiment-heading", "experiment-description", "equation", "principle-label", "metric-a", "metric-b", "metric-a-label", "metric-b-label", "discovery", "readout", "result-note", "center-label", "stage-state", "marks", "drop-legend", "legend-mass", "drop-result", "announcement", "theme", "speed"].map((id) => [id, byId(id)]));
const stage = document.querySelector(".stage");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const markButtons = [...document.querySelectorAll("[data-mark]")];
let playing = !reduced.matches;
let touched = false;
let visible = true;
let frameId = 0;
let previous = null;
let hold = 0;
let ballRefs = {};
let restCenters = {};
let lastReadout = -1;
const number = O.formatNumber;
const set = (id, text) => { nodes[id].textContent = text; };
function rebuild() {
  const rest = { ...state, progress: 0 };
  nodes.machine.innerHTML = S.svgParts(S.scene(rest), PAINT_ORDER);
  ballRefs = Object.fromEntries(["ramp", "a", "b"].map((key) => [key, byId(`ball-${key}`)]));
  restCenters = { ramp: S.rampPosition(state.angle, 0), a: S.dropPosition(state.height, 0, "a"), b: S.dropPosition(state.height, 0, "b") };
}
function draw(snap) {
  const positions = { ramp: S.rampPosition(state.angle, snap.ramp.distance), a: S.dropPosition(state.height, snap.a.distance, "a"), b: S.dropPosition(state.height, snap.b.distance, "b") };
  for (const key of ["ramp", "a", "b"]) {
    const delta = positions[key].map((value, i) => value - restCenters[key][i]);
    ballRefs[key].setAttribute("transform", K.translateAlong(S.PROJECTION, delta));
  }
}
function explain() {
  const ramp = state.mode === "ramp";
  nodes["ramp-settings"].hidden = !ramp;
  nodes["drop-settings"].hidden = ramp;
  nodes.marks.hidden = !ramp;
  nodes["drop-legend"].hidden = ramp;
  modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode)));
  set("experiment-tag", ramp ? "01 · Plano inclinado" : "02 · Caída simultánea");
  nodes["experiment-heading"].innerHTML = ramp ? "Doble tiempo.<br>Cuádruple distancia." : state.air ? "El aire cambia<br>la caída." : "Distintas masas.<br>Una misma gravedad.";
  set("experiment-description", ramp ? "Un plano poco inclinado vuelve más lento el movimiento y permite medirlo. La esfera parte del reposo y recorre distancias cada vez mayores en tiempos iguales." : state.air ? "El aire frena las dos esferas. Como tienen el mismo tamaño, esa resistencia afecta más a la de menor masa. Compara sus tiempos de llegada." : "Suelta dos esferas desde la misma altura. Aunque sus masas sean distintas, en el vacío tienen la misma aceleración y llegan a la vez.");
  set("principle-label", ramp ? "Distancia recorrida" : state.air ? "Fuerza durante la caída" : "Caída desde el reposo");
  set("equation", ramp ? "s = ½at²" : state.air ? "F = mg − ½ρCᴅAv²" : "s = ½gt²");
  set("metric-a-label", ramp ? "Recorrido" : "Llegada de A");
  set("metric-b-label", ramp ? "Rapidez" : "Llegada de B");
  set("center-label", ramp ? "El plano inclinado" : state.air ? "Caída con aire" : "Caída en el vacío");
  nodes.time.setAttribute("aria-label", ramp ? "Avance de la esfera por el plano inclinado" : "Avance de la caída simultánea");
  document.querySelector(".exhibit").dataset.mode = state.mode;
}
function readings(snap) {
  const ramp = state.mode === "ramp";
  nodes.time.value = state.progress;
  set("model-time", `${number(snap.time)} s`);
  nodes.time.setAttribute("aria-valuetext", `${number(snap.time)} segundos de ${number(snap.duration)}`);
  set("angle-value", `${number(state.angle, 0)}°`);
  set("height-value", `${number(state.height)} m`);
  set("mass-value", `${number(state.mass)} kg`);
  nodes.angle.setAttribute("aria-valuetext", `${number(state.angle, 0)} grados`);
  nodes.height.setAttribute("aria-valuetext", `${number(state.height)} metros`);
  nodes.mass.setAttribute("aria-valuetext", `${number(state.mass)} kilogramos`);
  set("acceleration", `${number(snap.ramp.acceleration)} m/s²`);
  set("ramp-duration", `${number(snap.ramp.duration)} s`);
  set("metric-a", ramp ? `${number(snap.ramp.distance)} m` : `${number(snap.a.impact, 3)} s`);
  set("metric-b", ramp ? `${number(snap.ramp.velocity)} m/s` : `${number(snap.b.impact, 3)} s`);
  set("legend-mass", `${number(state.mass)} kg`);
  const difference = `${number(Math.abs(snap.difference) * 1000, 1)} ms`;
  const equal = Math.abs(snap.difference) < 1e-9;
  set("drop-result", equal ? "Llegan a la vez." : `B llega ${difference} antes que A.`);
  set("discovery", ramp ? "En el doble de tiempo, la distancia se multiplica por cuatro." : equal ? "La masa cambia el peso, pero no la aceleración en el vacío." : `Diferencia entre llegadas: ${difference}. El aire hace que importe la masa.`);
  if (!ramp && state.air && equal) set("discovery", "Con igual masa y tamaño, el aire frena ambas esferas por igual.");
  set("readout", ramp ? `g = 9,80665 m/s² · Longitud: 2,50 m · a = ${number(snap.ramp.acceleration)} m/s²` : `A: ${number(snap.a.distance)} m · B: ${number(snap.b.distance)} m · Altura: ${number(state.height)} m`);
  set("result-note", ramp ? "Rodadura sin deslizamiento" : equal ? "Diferencia de llegada: 0,0 ms" : `Diferencia de llegada: ${difference}`);
  const status = reduced.matches ? "Exploración manual · movimiento reducido" : playing ? state.progress >= 1 ? "Experimento completado" : "Experimento en marcha" : state.progress >= 1 ? "Experimento completado" : state.progress > 0 ? "Tiempo detenido" : "Preparado para soltar";
  set("stage-state", status);
  set("play-label", reduced.matches ? "Avanzar" : playing ? "Pausar" : state.progress >= 1 ? "Repetir" : state.progress > 0 ? "Continuar" : "Soltar");
  nodes.play.setAttribute("aria-label", reduced.matches ? "Avanzar un paso sin animación" : playing ? "Pausar el experimento" : state.progress >= 1 ? "Repetir el experimento" : "Poner el experimento en marcha");
  nodes["play-icon"].style.display = playing && !reduced.matches ? "none" : "block";
  nodes["pause-icon"].style.display = playing && !reduced.matches ? "block" : "none";
  markButtons.forEach((button) => button.setAttribute("aria-pressed", String(Math.abs(state.progress - Number(button.dataset.mark) / 5) < 0.006)));
  stage.dataset.progress = state.progress.toFixed(5);
  stage.dataset.mode = state.mode;
  stage.dataset.playing = String(playing);
}
function render() {
  const snap = O.snapshot(state);
  draw(snap);
  readings(snap);
}
function schedule() {
  if (!frameId && playing && visible && !document.hidden && !reduced.matches) frameId = requestAnimationFrame(tick);
}
function tick(now) {
  frameId = 0;
  if (!playing || !visible || document.hidden || reduced.matches) { previous = null; return; }
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.08);
  previous = now;
  if (state.progress < 1) state.progress = Math.min(1, state.progress + dt * state.speed / O.snapshot(state).duration);
  else if (touched) { playing = false; previous = null; set("announcement", "Experimento completado."); }
  else {
    hold += dt;
    if (hold > 1.8) { state.progress = 0; state.mode = state.mode === "ramp" ? "drop" : "ramp"; hold = 0; explain(); }
  }
  draw(O.snapshot(state));
  if (now - lastReadout > 50 || !playing) { readings(O.snapshot(state)); lastReadout = now; }
  schedule();
}
function interact() { touched = true; hold = 0; }
function pause() { playing = false; previous = null; if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
function select(mode) {
  interact(); pause(); state.mode = mode; state.progress = 0; explain(); render(); set("announcement", mode === "ramp" ? "Plano inclinado seleccionado." : "Caída simultánea seleccionada.");
}
function toggle() {
  interact();
  if (reduced.matches) { pause(); state.progress = state.progress >= 1 ? 0 : Math.min(1, (Math.floor(state.progress * 5 + 0.001) + 1) / 5); render(); return; }
  if (playing) pause();
  else { if (state.progress >= 1) state.progress = 0; playing = true; previous = null; schedule(); }
  render();
}
modeButtons.forEach((button) => button.addEventListener("click", () => select(button.dataset.mode)));
markButtons.forEach((button) => button.addEventListener("click", () => { interact(); pause(); state.progress = Number(button.dataset.mark) / 5; render(); set("announcement", `Instante ${button.dataset.mark} de cinco. Recorrido: ${number(O.snapshot(state).ramp.distance)} metros.`); }));
nodes.play.addEventListener("click", toggle);
byId("reset").addEventListener("click", () => { interact(); pause(); state.progress = 0; render(); set("announcement", "El experimento vuelve a su posición inicial."); });
nodes.time.addEventListener("input", () => { interact(); pause(); state.progress = Number(nodes.time.value); render(); });
for (const key of ["angle", "height", "mass"]) nodes[key].addEventListener("input", () => { interact(); pause(); state[key] = Number(nodes[key].value); state.progress = 0; if (key !== "mass") rebuild(); render(); });
document.querySelectorAll("[name=medium]").forEach((input) => input.addEventListener("change", () => { interact(); pause(); state.air = input.value === "air"; state.progress = 0; explain(); render(); }));
nodes.speed.addEventListener("change", () => { interact(); state.speed = Number(nodes.speed.value); });
stage.addEventListener("keydown", (event) => {
  if (event.key === "1" || event.key === "2") { event.preventDefault(); select(event.key === "1" ? "ramp" : "drop"); }
  if (event.key === " ") { event.preventDefault(); toggle(); }
  if (event.key.toLowerCase() === "r") { event.preventDefault(); byId("reset").click(); }
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); interact(); pause(); state.progress = event.key === "Home" ? 0 : event.key === "End" ? 1 : O.clamp(state.progress + (event.key === "ArrowRight" ? 0.05 : -0.05)); render(); }
});
function themeLabel() { nodes.theme.setAttribute("aria-label", document.body.dataset.theme === "dark" ? "Cambiar al tema claro" : "Cambiar al tema oscuro"); }
nodes.theme.addEventListener("click", () => { document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark"; themeLabel(); });
document.addEventListener("visibilitychange", () => { previous = null; if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = null; if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); }, { threshold: 0.05 }).observe(stage);
reduced.addEventListener("change", () => { pause(); render(); });
rebuild(); explain(); render(); themeLabel(); schedule();

MechanicalPlayback.bind({stop:()=>{if(frameId)cancelAnimationFrame(frameId);frameId=0;previous=null;},refresh:()=>{visible=MechanicalPlayback.inView(stage);},resume:()=>{render();schedule();}});

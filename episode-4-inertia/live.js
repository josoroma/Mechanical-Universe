import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";

const state = { ...O.DEFAULTS };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const byId = (id) => document.getElementById(id);
const stage = document.querySelector(".stage");
const machine = byId("machine"), world = byId("world");
const parts = new Map([...machine.querySelectorAll("[data-part]")].map((node) => [node.dataset.part, node]));
const cartRefs = [...parts].filter(([name]) => name.startsWith("cart.")).map(([, node]) => node);
const spokeRefs = [...machine.querySelectorAll("[data-spokes]")];
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const frameButtons = [...document.querySelectorAll("[data-frame]")];
const phaseButtons = [...document.querySelectorAll("[data-phase]")];
const number = O.formatNumber;
const set = (id, text) => { byId(id).textContent = text; };
let playing = !reduced.matches, touched = false, visible = true;
let frameId = 0, previous = null, hold = 0, viewMix = 0, lastReadout = -1, lastPhase = "";
const modeNames = { rest: "En reposo", uniform: "Velocidad constante", maneuver: "Arrancar y frenar" };
const phases = {
  rest: ["01 · En reposo", "Una esfera.<br>En equilibrio.", "El carro está detenido. El péndulo comienza vertical, sin oscilar. La tensión de la varilla compensa su peso.", "El reposo es un caso de velocidad constante: velocidad cero.", "Reposo · equilibrio"],
  uniform: ["02 · Velocidad constante", "El movimiento<br>se comparte.", "El carro y el péndulo avanzan juntos. Si la esfera comienza en equilibrio, permanece vertical: la velocidad constante no la inclina.", "La velocidad constante no se detecta con este experimento interior.", "Movimiento uniforme"],
  accelerating: ["03 · Arranque", "El soporte<br>se adelanta.", "El carro gana velocidad. La esfera tiende a conservar su movimiento anterior: el péndulo se inclina hacia atrás y empieza a oscilar.", "El péndulo responde al cambio de velocidad, no a la velocidad por sí sola.", "Aceleración hacia delante"],
  coasting: ["03 · Marcha uniforme", "La aceleración cesa.<br>La oscilación sigue.", "El carro ya no gana velocidad. El péndulo conserva la oscilación que adquirió al arrancar; el amortiguamiento la reduce poco a poco.", "Moverse a velocidad constante no elimina una oscilación previa.", "Sin aceleración · con oscilación"],
  braking: ["03 · Frenado", "El carro frena.<br>La esfera continúa.", "El soporte reduce su velocidad. La esfera tiende a seguir avanzando: ahora el equilibrio se inclina hacia delante, mientras el péndulo sigue oscilando.", "Frenar también es acelerar: cambia la velocidad en sentido contrario.", "Aceleración hacia atrás"],
  stopped: ["03 · Carro detenido", "El viaje termina.<br>El péndulo aún oscila.", "El carro vuelve al reposo. La esfera todavía se mueve respecto al soporte; el amortiguamiento va disipando la oscilación hasta recuperar la vertical.", "Aceleración cero no significa que el péndulo deba estar inmóvil.", "Reposo · oscilación amortiguada"]
};
function explain(snap) {
  if (lastPhase !== snap.phase) {
    lastPhase = snap.phase;
    const [tag, heading, description, discovery, result] = phases[snap.phase];
    set("experiment-tag", tag); byId("experiment-heading").innerHTML = heading;
    set("experiment-description", description); set("discovery", discovery); set("result-note", result);
  }
  modeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
  frameButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.frame === state.frame)));
  byId("velocity-settings").hidden = state.mode !== "uniform";
  byId("acceleration-settings").hidden = state.mode !== "maneuver";
  set("center-label", modeNames[state.mode]);
  set("frame-hint", state.frame === "ground" ? "El carro pasa ante ti" : "El suelo pasa bajo el carro");
}
function draw(snap) {
  const delta = K.translateAlong(S.PROJECTION, [snap.position * S.SCALE, 0, 0]);
  for (const ref of cartRefs) ref.setAttribute("transform", delta);
  for (const ref of spokeRefs) ref.setAttribute("d", S.wheelSpokes(Number(ref.dataset.spokes), -snap.position * S.SCALE / S.WHEEL_RADIUS));
  parts.get("pendulum.rod").innerHTML = S.rodPart(state, snap).svg;
  const bob = S.bobPart(state, snap);
  // The sphere's shading is cached; only its projection offset changes.
  parts.get("pendulum.bob").firstElementChild.setAttribute("transform", K.translateAlong(S.PROJECTION, bob.at));
  world.setAttribute("transform", K.translateAlong(S.PROJECTION, [-viewMix * S.cartCenter(snap), 0, 0]));
}
function readings(snap) {
  explain(snap);
  byId("time").value = state.progress;
  set("model-time", `${number(snap.time)} s`);
  byId("time").setAttribute("aria-valuetext", `${number(snap.time)} segundos de seis`);
  set("metric-a", `${number(snap.velocity)} m/s`);
  set("metric-b", `${number(snap.angle * 180 / Math.PI, 1)}°`);
  set("current-acceleration", `${number(snap.acceleration)} m/s²`);
  set("equilibrium-note", `Inclinación de equilibrio: ${number(snap.equilibrium * 180 / Math.PI, 1)}°`);
  set("readout", `Desplazamiento respecto al suelo: ${number(snap.position)} m · Tiempo: ${number(snap.time)} s`);
  for (const key of ["velocity", "acceleration", "length"]) {
    const unit = key === "acceleration" ? "m/s²" : key === "length" ? "m" : "m/s";
    set(`${key}-value`, `${number(state[key])} ${unit}`);
    byId(key).setAttribute("aria-valuetext", `${number(state[key])} ${key === "acceleration" ? "metros por segundo al cuadrado" : key === "length" ? "metros" : "metros por segundo"}`);
  }
  set("play-label", reduced.matches ? "Avanzar" : playing ? "Pausar" : state.progress >= 1 ? "Repetir" : state.progress > 0 ? "Continuar" : "Iniciar");
  byId("play").setAttribute("aria-label", reduced.matches ? "Avanzar medio segundo sin animación" : playing ? "Pausar el experimento" : state.progress >= 1 ? "Repetir el experimento" : "Poner el experimento en marcha");
  byId("play-icon").style.display = playing && !reduced.matches ? "none" : "block";
  byId("pause-icon").style.display = playing && !reduced.matches ? "block" : "none";
  set("stage-state", reduced.matches ? "Exploración manual · movimiento reducido" : playing ? state.progress >= 1 ? "Experimento completado" : "Experimento en marcha" : state.progress >= 1 ? "Experimento completado" : state.progress > 0 ? "Tiempo detenido" : "Listo para comenzar");
  phaseButtons.forEach((b) => b.setAttribute("aria-pressed", String(state.mode === "maneuver" && Math.abs(snap.time - Number(b.dataset.phase)) < 0.02)));
  Object.assign(stage.dataset, { progress: state.progress.toFixed(5), mode: state.mode, frame: state.frame, playing: String(playing), angle: snap.angle.toFixed(7), acceleration: String(snap.acceleration) });
}
function render() { const snap = O.snapshot(state); draw(snap); readings(snap); }
const targetMix = () => state.frame === "cart" ? 1 : 0;
function schedule() {
  if (!frameId && visible && !document.hidden && !reduced.matches && (playing || Math.abs(viewMix - targetMix()) > 0.0001)) frameId = requestAnimationFrame(tick);
}
function tick(now) {
  frameId = 0;
  if (!visible || document.hidden || reduced.matches) { previous = null; return; }
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.08);
  previous = now;
  viewMix += (targetMix() - viewMix) * (1 - Math.exp(-10 * dt));
  if (Math.abs(viewMix - targetMix()) < 0.0001) viewMix = targetMix();
  if (playing) {
    if (state.progress < 1) state.progress = Math.min(1, state.progress + dt * state.speed / O.DURATION);
    else if (touched) { playing = false; set("announcement", "Experimento completado."); }
    else {
      hold += dt;
      if (hold > 0.8) { hold = 0; state.progress = 0; state.mode = ({ uniform: "maneuver", maneuver: "rest", rest: "uniform" })[state.mode]; }
    }
  }
  const snap = O.snapshot(state); draw(snap);
  if (now - lastReadout > 50 || !playing) { readings(snap); lastReadout = now; }
  if (!playing && viewMix === targetMix()) previous = null;
  schedule();
}
function interact() { touched = true; hold = 0; }
function pause() { playing = false; previous = null; if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
function select(mode) {
  interact(); pause(); state.mode = mode; state.progress = 0; render(); schedule();
  set("announcement", `Experimento seleccionado: ${modeNames[mode]}.`);
}
function toggle() {
  interact();
  if (reduced.matches) { pause(); state.progress = state.progress >= 1 ? 0 : Math.min(1, state.progress + 0.5 / O.DURATION); render(); return; }
  if (playing) pause(); else { if (state.progress >= 1) state.progress = 0; playing = true; previous = null; }
  render(); schedule();
}
modeButtons.forEach((button) => button.addEventListener("click", () => select(button.dataset.mode)));
frameButtons.forEach((button) => button.addEventListener("click", () => {
  interact(); state.frame = button.dataset.frame;
  if (reduced.matches) viewMix = targetMix();
  render(); schedule(); set("announcement", state.frame === "cart" ? "Observando a bordo del carro." : "Observando desde el suelo.");
}));
phaseButtons.forEach((button) => button.addEventListener("click", () => {
  interact(); pause(); state.mode = "maneuver"; state.progress = Number(button.dataset.phase) / O.DURATION; render(); schedule();
  set("announcement", `${button.textContent.trim()}. Ángulo del péndulo: ${number(O.snapshot(state).angle * 180 / Math.PI, 1)} grados.`);
}));
byId("play").addEventListener("click", toggle);
byId("reset").addEventListener("click", () => { interact(); pause(); state.progress = 0; render(); schedule(); set("announcement", "El experimento vuelve al comienzo."); });
byId("time").addEventListener("input", () => { interact(); pause(); state.progress = Number(byId("time").value); render(); schedule(); });
for (const key of ["velocity", "acceleration", "length"]) byId(key).addEventListener("input", () => { interact(); pause(); state[key] = Number(byId(key).value); state.progress = 0; render(); schedule(); });
byId("speed").addEventListener("change", () => { interact(); state.speed = Number(byId("speed").value); });
stage.addEventListener("keydown", (event) => {
  if (["1", "2", "3"].includes(event.key)) { event.preventDefault(); select(({ 1: "rest", 2: "uniform", 3: "maneuver" })[event.key]); }
  if (event.key === " ") { event.preventDefault(); toggle(); }
  if (event.key.toLowerCase() === "r") { event.preventDefault(); byId("reset").click(); }
  if (event.key.toLowerCase() === "v") { event.preventDefault(); frameButtons.find((b) => b.dataset.frame !== state.frame).click(); }
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault(); interact(); pause(); state.progress = event.key === "Home" ? 0 : event.key === "End" ? 1 : O.clamp(state.progress + (event.key === "ArrowRight" ? 0.05 : -0.05)); render(); schedule();
  }
});
let drag = null;
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  interact(); pause(); drag = { x: event.clientX, y: event.clientY, progress: state.progress, moving: false };
  stage.focus({ preventScroll: true }); render(); schedule();
});
stage.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
  if (!drag.moving && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 7) { drag = null; return; }
  if (!drag.moving && Math.abs(dx) > 4) { drag.moving = true; stage.setPointerCapture(event.pointerId); }
  if (drag.moving) { state.progress = O.clamp(drag.progress + dx / (stage.clientWidth * 0.75)); render(); }
});
const endDrag = () => { drag = null; };
stage.addEventListener("pointerup", endDrag); stage.addEventListener("pointercancel", endDrag); stage.addEventListener("lostpointercapture", endDrag);
function themeLabel() { byId("theme").setAttribute("aria-label", document.body.dataset.theme === "dark" ? "Cambiar al tema claro" : "Cambiar al tema oscuro"); }
byId("theme").addEventListener("click", () => { interact(); document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark"; themeLabel(); });
document.addEventListener("visibilitychange", () => { previous = null; if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = null; if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); }, { threshold: 0.05 }).observe(stage);
reduced.addEventListener("change", () => { pause(); viewMix = targetMix(); render(); });
render(); themeLabel(); schedule();

MechanicalPlayback.bind({stop:()=>{if(frameId)cancelAnimationFrame(frameId);frameId=0;previous=null;},refresh:()=>{visible=MechanicalPlayback.inView(stage);},resume:()=>{render();schedule();}});

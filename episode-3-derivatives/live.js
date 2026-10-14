import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";

const state = { ...O.DEFAULTS };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const byId = (id) => document.getElementById(id);
const nodes = Object.fromEntries(["machine", "play", "play-label", "play-icon", "pause-icon", "position", "position-value", "increment", "increment-value", "increment-hint", "increment-note", "halve", "experiment-tag", "experiment-heading", "experiment-description", "equation", "principle-label", "metric-a", "metric-a-label", "metric-b", "function-equation", "difference", "difference-label", "discovery", "readout", "result-note", "center-label", "stage-state", "table-caption", "table-limit", "theme", "speed", "reset", "announcement"].map((id) => [id, byId(id)]));
const stage = document.querySelector(".stage");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const profileButtons = [...document.querySelectorAll("[data-profile]")];
const number = O.formatNumber;
const measurement = (value) => number(value, value !== 0 && Math.abs(value) < 0.00005 ? 6 : 4);
const set = (id, text) => { if (nodes[id].textContent !== text) nodes[id].textContent = text; };
let playing = !reduced.matches, touring = !reduced.matches, targetX = state.x, direction = 1, visible = false, frameId = 0, previous = null, lastReading = 0, tourTime = 0, tourPart = 0;
let rest, moving, bar, stem, marker, rollers, drag = null, lastPose = "";
function rebuild() {
  nodes.machine.innerHTML = S.svgParts(S.scene(state), PAINT_ORDER);
  rest = O.snapshot(state);
  moving = [...nodes.machine.querySelectorAll("[data-part]")].filter((el) => /^(carriage\.|dial\.|point.first$|follower.shaft$)/.test(el.dataset.part));
  bar = nodes.machine.querySelector('[data-part="rule"]');
  stem = nodes.machine.querySelector('[data-part="follower.stem"]');
  marker = nodes.machine.querySelector('[data-part="point.second"]');
  rollers = [nodes.machine.querySelector('[data-part="roller.first"]'), nodes.machine.querySelector('[data-part="roller.second"]')];
  lastPose = "";
}
function draw(snap) {
  const key = `${state.profile}/${state.mode}/${snap.x.toFixed(6)}/${snap.h.toFixed(4)}`;
  if (key === lastPose) return;
  lastPose = key;
  const dx = (snap.x - rest.x) * S.SCALE, dz = (snap.y - rest.y) * S.SCALE;
  for (const el of moving) el.setAttribute("transform", K.translateAlong(S.PROJECTION, [dx, 0, el.dataset.part.startsWith("carriage.") ? 0 : dz]));
  bar.innerHTML = S.barPart(state).svg;
  stem.innerHTML = S.stemPart(state).svg;
  if (marker) { marker.innerHTML = S.markerPart(state).svg; marker.style.display = state.mode === "secant" ? "" : "none"; }
  rollers.forEach((el, i) => {
    const before = S.rollerPosition(state.profile, rest.x + (i ? rest.h : 0), Boolean(i));
    const after = S.rollerPosition(state.profile, snap.x + (i ? snap.h : 0), Boolean(i));
    el.setAttribute("transform", K.translateAlong(S.PROJECTION, after.map((v, j) => v - before[j])));
    el.style.display = i && state.mode === "tangent" ? "none" : "";
  });
}
function explain() {
  const secant = state.mode === "secant";
  modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode)));
  profileButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.profile === state.profile)));
  set("experiment-tag", secant ? "01 · La secante" : "02 · La tangente");
  nodes["experiment-heading"].innerHTML = secant ? "Dos puntos.<br>Una pendiente." : "Un punto.<br>Todo un instante.";
  set("experiment-description", secant ? "La regla compara dos alturas. Su inclinación representa cuánto cambia la función por cada unidad de avance." : "La regla reproduce la inclinación local del perfil. Esa pendiente es la derivada: la razón de cambio en el punto elegido.");
  set("principle-label", secant ? "Pendiente media" : "Pendiente instantánea");
  set("equation", secant ? "m = Δf / Δx" : O.PROFILES[state.profile].derivative);
  set("function-equation", O.PROFILES[state.profile].formula);
  set("metric-a-label", secant ? "Secante · m" : "Tangente · m");
  set("center-label", secant ? "Cambio medio" : "Cambio instantáneo");
  set("increment-note", secant ? "Cuanto menor sea Δx, más se aproxima la secante a la tangente." : "La tangente usa la derivada exacta. Vuelve a la secante para explorar el acercamiento.");
  nodes.increment.disabled = !secant;
  nodes.halve.disabled = !secant;
  document.querySelector(".exhibit").dataset.mode = state.mode;
  byId("second-key").hidden = !secant;
}
function readings(snap) {
  const secant = state.mode === "secant";
  nodes.position.value = targetX;
  nodes.increment.value = snap.h;
  set("position-value", `x = ${number(snap.x)}`);
  nodes.position.setAttribute("aria-valuetext", `x igual a ${number(snap.x)}`);
  set("increment-value", number(snap.h));
  nodes.increment.setAttribute("aria-valuetext", `Incremento de ${number(snap.h)}`);
  nodes.halve.disabled = !secant || snap.h <= 0.020001;
  set("increment-hint", !secant ? "Medición instantánea" : snap.h <= 0.020001 ? "Prueba ahora la tangente" : "Acerca el segundo punto");
  set("metric-a", measurement(snap.slope));
  set("metric-b", measurement(snap.derivative));
  set("difference", measurement(secant ? snap.error : 0));
  set("difference-label", secant ? "Diferencia con la derivada" : "Coincide con la derivada");
  set("readout", `x = ${number(snap.x)} · f(x) = ${number(snap.y, 4)}${secant ? ` · Δf = ${number(snap.deltaY, 4)}` : ` · f′(x) = ${number(snap.derivative, 4)}`}`);
  set("result-note", `Ángulo de la regla: ${number(snap.angle * 180 / Math.PI, 1)}°`);
  const sign = Math.abs(snap.derivative) < 0.0005 ? 0 : Math.sign(snap.derivative);
  set("discovery", sign < 0 ? "El perfil baja: la derivada es negativa, aunque la altura sea positiva." : sign > 0 ? "El perfil sube: la derivada es positiva. Su valor mide la inclinación." : state.profile === "cubic" ? "La derivada es cero, pero la cúbica sigue creciendo a ambos lados." : "La tangente es horizontal: la derivada vale cero en este punto.");
  set("table-caption", `${O.PROFILES[state.profile].name} en x = ${number(snap.x)}`);
  set("table-limit", measurement(snap.derivative));
  O.convergence(state.profile, snap.x).forEach((row, i) => {
    byId(`table-slope-${i}`).textContent = measurement(row.slope);
    byId(`table-error-${i}`).textContent = measurement(row.error);
  });
  document.querySelectorAll("[data-step]").forEach((button) => button.setAttribute("aria-pressed", String(secant && Math.abs(Number(button.dataset.step) - snap.h) < 0.001)));
  document.querySelectorAll("[data-landmark]").forEach((button) => button.setAttribute("aria-pressed", String(state.profile === "parabola" && state.mode === "tangent" && Math.abs(Number(button.dataset.landmark) - snap.x) < 0.001)));
  set("stage-state", reduced.matches ? "Exploración manual · movimiento reducido" : playing ? touring ? "Demostración automática" : "Recorriendo el perfil" : "Palpador detenido · arrastra para explorar");
  set("play-label", reduced.matches ? "Avanzar" : playing ? "Pausar" : "Recorrer");
  nodes.play.setAttribute("aria-label", reduced.matches ? "Avanzar el palpador un paso sin animación" : playing ? "Pausar el recorrido del palpador" : "Recorrer el perfil automáticamente");
  nodes["play-icon"].style.display = playing && !reduced.matches ? "none" : "block";
  nodes["pause-icon"].style.display = playing && !reduced.matches ? "block" : "none";
  Object.assign(stage.dataset, { x: snap.x.toFixed(5), h: snap.h.toFixed(5), slope: snap.slope.toFixed(6), derivative: snap.derivative.toFixed(6), mode: state.mode, profile: state.profile, playing: String(playing), touring: String(touring) });
}
function render() { const snap = O.snapshot(state); draw(snap); readings(snap); }
function schedule() {
  if (!frameId && visible && !document.hidden && !reduced.matches && (playing || Math.abs(targetX - state.x) > 0.00001)) frameId = requestAnimationFrame(tick);
}
function tick(now) {
  frameId = 0;
  if (!visible || document.hidden || reduced.matches) { previous = null; return; }
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.06);
  previous = now;
  if (playing) {
    targetX += direction * dt * state.speed * 0.65;
    if (targetX >= 2 || targetX <= -2) { targetX = O.clamp(targetX); direction *= -1; }
    if (touring) {
      tourTime += dt;
      const part = Math.floor(tourTime / 12);
      if (part !== tourPart) {
        tourPart = part;
        state.mode = part % 2 ? "tangent" : "secant";
        state.profile = ["parabola", "wave", "cubic"][Math.floor(part / 2) % 3];
        rebuild(); explain();
      }
    }
  }
  state.x += (targetX - state.x) * (1 - Math.exp(-18 * dt));
  if (Math.abs(targetX - state.x) < 0.00001) state.x = targetX;
  const snap = O.snapshot(state);
  draw(snap);
  if (now - lastReading > 60 || state.x === targetX) { readings(snap); lastReading = now; }
  schedule();
}
function stop() { playing = false; touring = false; targetX = state.x; previous = null; }
function moveTo(x) {
  stop(); targetX = O.clamp(x);
  if (reduced.matches) state.x = targetX;
  render(); schedule();
}
function selectMode(mode, announce = true) {
  stop(); state.mode = mode; explain(); render();
  if (announce) set("announcement", mode === "secant" ? "Secante: compara dos puntos del perfil." : "Tangente: mide la derivada en el punto elegido.");
}
function selectProfile(profile) {
  stop(); state.profile = profile; rebuild(); explain(); render();
  set("announcement", `Perfil ${O.PROFILES[profile].name.toLowerCase()} seleccionado.`);
}
function changeIncrement(h) {
  stop(); state.mode = "secant"; state.h = Math.round(O.clamp(h, 0.02, 1) * 100) / 100; explain(); render();
}
function togglePlay() {
  touring = false;
  if (reduced.matches) { moveTo(state.x >= 1.999 ? -2 : state.x + 0.25); return; }
  playing = !playing; targetX = state.x; previous = null; render(); schedule();
}
function reset() {
  stop(); Object.assign(state, O.DEFAULTS); targetX = state.x; direction = 1;
  nodes.speed.value = state.speed; rebuild(); explain(); render();
  set("announcement", "Instrumento restablecido. Parábola en x igual a 0,60 e incremento de 0,90.");
}
modeButtons.forEach((button) => button.addEventListener("click", () => selectMode(button.dataset.mode)));
profileButtons.forEach((button) => button.addEventListener("click", () => selectProfile(button.dataset.profile)));
nodes.position.addEventListener("input", () => moveTo(Number(nodes.position.value)));
nodes.increment.addEventListener("input", () => changeIncrement(Number(nodes.increment.value)));
nodes.halve.addEventListener("click", () => changeIncrement(state.h / 2));
document.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => changeIncrement(Number(button.dataset.step))));
document.querySelectorAll("[data-landmark]").forEach((button) => button.addEventListener("click", () => {
  stop(); state.profile = "parabola"; state.mode = "tangent"; rebuild(); explain(); moveTo(Number(button.dataset.landmark));
  set("announcement", `${button.textContent.slice(2)}. Parábola, derivada ${number(Number(button.dataset.landmark) / 2)}.`);
}));
nodes.play.addEventListener("click", togglePlay);
nodes.reset.addEventListener("click", reset);
nodes.speed.addEventListener("change", () => { touring = false; state.speed = Number(nodes.speed.value); });
nodes.theme.addEventListener("click", () => {
  const dark = document.body.dataset.theme !== "dark";
  document.body.dataset.theme = dark ? "dark" : "light";
  nodes.theme.setAttribute("aria-label", `Cambiar al tema ${dark ? "claro" : "oscuro"}`);
  set("announcement", `Tema ${dark ? "oscuro" : "claro"} activado.`);
});
stage.addEventListener("keydown", (event) => {
  if (![" ", "ArrowLeft", "ArrowRight", "Home", "End", "1", "2", "r", "R"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === " ") togglePlay();
  else if (event.key === "1" || event.key === "2") selectMode(event.key === "1" ? "secant" : "tangent");
  else if (event.key === "r" || event.key === "R") reset();
  else moveTo(event.key === "Home" ? -2 : event.key === "End" ? 2 : targetX + (event.key === "ArrowRight" ? 0.1 : -0.1));
});
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !event.target.closest("#machine")) return;
  stop(); render();
  drag = { id: event.pointerId, start: event.clientX, x: state.x, active: false };
});
stage.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  if (!drag.active && Math.abs(event.clientX - drag.start) > 7) { drag.active = true; stage.setPointerCapture(event.pointerId); stage.classList.add("dragging"); }
  if (!drag.active) return;
  const drawing = stage.querySelector("svg").getBoundingClientRect();
  const a = K.iso([0, 0, 0], S.PROJECTION), b = K.iso([S.SCALE, 0, 0], S.PROJECTION);
  targetX = O.clamp(drag.x + (event.clientX - drag.start) * S.WIDTH / drawing.width / (b[0] - a[0]));
  if (reduced.matches) { state.x = targetX; render(); } else schedule();
});
const release = () => { drag = null; stage.classList.remove("dragging"); };
stage.addEventListener("pointerup", release);
stage.addEventListener("pointercancel", release);
stage.addEventListener("lostpointercapture", release);
document.addEventListener("visibilitychange", () => { if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0; } previous = null; schedule(); });
new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
  if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; }
  previous = null; schedule();
}, { threshold: 0.08 }).observe(stage);
reduced.addEventListener("change", () => { if (reduced.matches) { stop(); state.x = targetX; } render(); schedule(); });
rebuild(); explain(); render();
nodes.theme.setAttribute("aria-label", `Cambiar al tema ${document.body.dataset.theme === "dark" ? "claro" : "oscuro"}`);

MechanicalPlayback.bind({stop:()=>{if(frameId)cancelAnimationFrame(frameId);frameId=0;previous=null;},refresh:()=>{visible=MechanicalPlayback.inView(stage);},resume:()=>{render();schedule();}});

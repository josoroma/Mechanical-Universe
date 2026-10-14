import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";
import * as D from "./painter.mjs";

const target = { ...O.DEFAULTS };
let state = { ...target };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const byId = (id) => document.getElementById(id);
const stage = document.querySelector(".stage"), drawing = document.querySelector(".drawing"), machine = byId("machine");
const refs = new Map([...machine.querySelectorAll("[data-part]")].map((node) => [node.dataset.part, node]));
const lastSvg = new Map(), depthCache = new WeakMap();
const modeButtons = [...document.querySelectorAll("[data-mode]")], presetButtons = [...document.querySelectorAll("[data-preset]")];
const number = O.formatNumber, set = (id, text) => { byId(id).textContent = text; };
const info = {
  parallelogram: ["01 · El paralelogramo", "Dos lados.<br>Una diagonal.", "A y B parten del mismo origen. Los brazos opuestos copian sus longitudes y orientaciones. La diagonal señala la suma.", "R = A + B", "O → R · la diagonal", "Regla del paralelogramo", "No basta con sumar longitudes: también importa hacia dónde apuntan."],
  ab: ["02 · A y después B", "Avanza por A.<br>Continúa por B.", "Recorre el brazo de latón desde el origen. Después, la copia de B parte de su punta y llega a R. Trasladar B conserva su longitud y orientación.", "O → A → R", "A · seguido de una copia de B", "Recorrido A + B", "El brazo de cobre trasladado representa el mismo vector B."],
  ba: ["03 · B y después A", "Cambia el orden.<br>Llega al mismo lugar.", "Recorre primero el brazo de cobre. Después, la copia de A une su punta con R. El camino cambia, pero el destino es el mismo.", "A + B = B + A", "B · seguido de una copia de A", "Recorrido B + A", "La suma de vectores es conmutativa: el orden no cambia la resultante."]
};
let playing = !reduced.matches, touched = false, visible = true, frameId = 0, previous = null, phase = 0, lastReadout = -1, lastMode = "";
let lastOrder = "", zoom = false, zoomMix = 0;
const zoomSettled = () => Math.abs(zoomMix - (zoom ? 1 : 0)) < 0.0001;
function settled() {
  return ["a", "b", "opening"].every((key) => Math.abs(state[key] - target[key]) < 0.0001) && Math.abs(((state.orientation - target.orientation + 540) % 360) - 180) < 0.0001;
}
function explain() {
  if (lastMode === state.mode) return;
  lastMode = state.mode;
  const [tag, heading, description, equation, path, center, discovery] = info[state.mode];
  set("experiment-tag", tag); byId("experiment-heading").innerHTML = heading;
  set("experiment-description", description); set("equation", equation); set("path-label", path); set("center-label", center); set("discovery", discovery);
  modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode)));
  for (const [name, ref] of refs) {
    const link = name.match(/^arm\.(a|b|copy-a|copy-b)\./)?.[1];
    const chosen = state.mode === "parallelogram" || (state.mode === "ab" ? ["a", "copy-b"] : ["b", "copy-a"]).includes(link);
    ref.classList.toggle("secondary-link", Boolean(link) && !chosen);
    ref.classList.toggle("chosen-link", Boolean(link) && chosen && state.mode !== "parallelogram");
  }
}
function draw() {
  const snap = O.snapshot(state), focus = K.iso([snap.R.x * S.SCALE / 2, snap.R.y * S.SCALE / 2, 65], S.PROJECTION);
  const scale = 1 + zoomMix, width = S.WIDTH / scale, height = S.HEIGHT / scale;
  const cx = S.WIDTH / 2 + (focus[0] - S.WIDTH / 2) * zoomMix, cy = S.HEIGHT / 2 + (focus[1] - S.HEIGHT / 2) * zoomMix;
  drawing.setAttribute("viewBox", `${cx - width / 2} ${cy - height / 2} ${width} ${height}`);
  const moving = S.movingParts(state), parts = [...S.fixedParts(), ...moving];
  for (const part of moving) {
    const ref = refs.get(part.name);
    if (part.shape.type === "cylinder" && ref.firstElementChild) {
      ref.firstElementChild.setAttribute("transform", K.translateAlong(S.PROJECTION, [part.shape.x, part.shape.y, 0]));
    } else if (lastSvg.get(part.name) !== part.svg) { ref.innerHTML = part.svg; lastSvg.set(part.name, part.svg); }
  }
  const order = D.orderParts(parts, S.PROJECTION, depthCache), key = order.join("/");
  if (key !== lastOrder) {
    let next = null;
    for (let i = order.length - 1; i >= 0; i--) { const node = refs.get(order[i]); if (node.nextElementSibling !== next) machine.insertBefore(node, next); next = node; }
    lastOrder = key;
  }
}
function readings() {
  explain();
  const snap = O.snapshot(state);
  set("metric-a", `${number(snap.R.magnitude)} u`); set("metric-b", snap.R.direction === null ? "Sin dirección" : `${number(snap.R.direction, 1)}°`);
  for (const key of ["a", "b", "orientation", "opening"]) {
    const isLength = key === "a" || key === "b";
    set(`${key}-value`, `${number(state[key], isLength ? 2 : 0)}${isLength ? " u" : "°"}`);
    byId(key).setAttribute("aria-valuetext", `${number(target[key], isLength ? 2 : 0)} ${isLength ? "unidades de longitud" : "grados"}`);
  }
  for (const id of ["A", "B", "R"]) {
    const v = snap[id]; set(`${id}-x`, number(v.x)); set(`${id}-y`, number(v.y)); set(`${id}-length`, number(v.magnitude)); set(`${id}-angle`, v.direction === null ? "No definida" : `${number(v.direction, 1)}°`);
  }
  set("readout", `Rₓ = ${number(snap.R.x)} u · Rᵧ = ${number(snap.R.y)} u · |R| = ${number(snap.R.magnitude)} u`);
  const term = (v) => v < -0.005 ? `(${number(v)})` : number(v);
  set("component-result", `(${term(snap.A.x)} + ${term(snap.B.x)}; ${term(snap.A.y)} + ${term(snap.B.y)}) ≈ (${number(snap.R.x)}; ${number(snap.R.y)}) u`);
  set("play-label", reduced.matches ? "Avanzar" : playing ? "Pausar" : "Animar");
  byId("play").setAttribute("aria-label", reduced.matches ? "Avanzar a otra configuración sin animación" : playing ? "Pausar la demostración" : "Animar la demostración");
  byId("play-icon").style.display = playing && !reduced.matches ? "none" : "block";
  byId("pause-icon").style.display = playing && !reduced.matches ? "block" : "none";
  set("stage-state", reduced.matches ? "Exploración manual · movimiento reducido" : playing ? touched ? "Demostración en marcha" : "Exploración automática" : "Exploración manual");
  presetButtons.forEach((button) => { const p = O.PRESETS[button.dataset.preset]; button.setAttribute("aria-pressed", String(["a", "b", "orientation", "opening"].every((key) => Math.abs(target[key] - p[key]) < 1e-7))); });
  Object.assign(stage.dataset, { mode: state.mode, a: state.a.toFixed(5), b: state.b.toFixed(5), orientation: state.orientation.toFixed(5), opening: state.opening.toFixed(5), rx: snap.R.x.toFixed(7), ry: snap.R.y.toFixed(7), magnitude: snap.R.magnitude.toFixed(7), playing: String(playing), touring: String(!touched), settled: String(settled()) });
}
function syncControls() { for (const key of ["a", "b", "orientation", "opening"]) byId(key).value = target[key]; }
function render() { draw(); readings(); }
function schedule() { if (!frameId && visible && !document.hidden && !reduced.matches && (playing || !settled() || !zoomSettled())) frameId = requestAnimationFrame(tick); }
function tick(now) {
  frameId = 0;
  if (!visible || document.hidden || reduced.matches) { previous = null; return; }
  const dt = previous === null ? 0 : Math.min(0.08, (now - previous) / 1000); previous = now;
  zoomMix += ((zoom ? 1 : 0) - zoomMix) * (1 - Math.exp(-10 * dt));
  if (zoomSettled()) zoomMix = zoom ? 1 : 0;
  if (playing) {
    phase += dt * target.speed * 0.55;
    Object.assign(target, O.tour(phase));
    if (!touched) target.mode = ["parallelogram", "ab", "ba"][Math.floor(phase / 1.8) % 3];
    syncControls();
  }
  state = { ...O.follow(state, target, dt), mode: target.mode, speed: target.speed };
  if (!playing && settled()) state = { ...target };
  draw();
  if (now - lastReadout > 50 || (!playing && settled())) { readings(); lastReadout = now; }
  if (!playing && settled() && zoomSettled()) previous = null;
  schedule();
}
function interact() { touched = true; }
function pause() { playing = false; previous = null; if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
function change(values, announce = "") {
  interact(); pause(); Object.assign(target, values); state.mode = target.mode;
  if (reduced.matches || !visible || document.hidden) state = { ...target };
  syncControls(); render(); schedule(); if (announce) set("announcement", announce);
}
function toggle() {
  interact();
  if (reduced.matches) { pause(); phase += 0.7; Object.assign(target, O.tour(phase)); state = { ...target }; syncControls(); render(); return; }
  if (playing) { pause(); Object.assign(target, state); }
  else { playing = true; previous = null; }
  render(); schedule();
}
modeButtons.forEach((button) => button.addEventListener("click", () => change({ mode: button.dataset.mode }, `Lectura seleccionada: ${button.querySelector('.era-name').textContent}.`)));
presetButtons.forEach((button) => button.addEventListener("click", () => { const preset = O.PRESETS[button.dataset.preset]; change(preset, `Configuración seleccionada: ${preset.name}.`); }));
for (const key of ["a", "b", "orientation", "opening"]) byId(key).addEventListener("input", () => change({ [key]: Number(byId(key).value) }));
byId("play").addEventListener("click", toggle);
byId("reset").addEventListener("click", () => { phase = 0; change({ ...O.DEFAULTS }, "Vectores y lectura iniciales restablecidos."); byId("speed").value = target.speed; });
byId("speed").addEventListener("change", () => { interact(); target.speed = Number(byId("speed").value); state.speed = target.speed; });
stage.addEventListener("keydown", (event) => {
  if (["1", "2", "3"].includes(event.key)) { event.preventDefault(); change({ mode: ["parallelogram", "ab", "ba"][Number(event.key) - 1] }); }
  if (event.key === " ") { event.preventDefault(); toggle(); }
  if (event.key.toLowerCase() === "r") { event.preventDefault(); byId("reset").click(); }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    if (event.key === "ArrowUp" || event.key === "ArrowDown") change({ orientation: O.normalize(target.orientation + (event.key === "ArrowUp" ? 5 : -5)) });
    else change({ opening: event.key === "Home" ? 30 : event.key === "End" ? 150 : O.clamp(target.opening + (event.key === "ArrowRight" ? 5 : -5), 30, 150) });
  }
});
function svgPoint(event) { const p = new DOMPoint(event.clientX, event.clientY); return p.matrixTransform(drawing.getScreenCTM().inverse()); }
function worldPoint(point, z) {
  const p = K.iso([0, 0, z], S.PROJECTION), u = K.iso([1, 0, z], S.PROJECTION), v = K.iso([0, 1, z], S.PROJECTION);
  const a = u[0] - p[0], b = v[0] - p[0], c = u[1] - p[1], d = v[1] - p[1], det = a * d - b * c;
  const x = point.x - p[0], y = point.y - p[1]; return { x: (d * x - b * y) / det / S.SCALE, y: (a * y - c * x) / det / S.SCALE };
}
let drag = null;
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  interact(); pause(); Object.assign(target, state); stage.focus({ preventScroll: true });
  const point = svgPoint(event), snap = O.snapshot(state);
  const candidates = [["A", 41], ["B", 55]].map(([key, z]) => { const v = snap[key], at = K.iso([v.x * S.SCALE, v.y * S.SCALE, z], S.PROJECTION); return { key, z, at, distance: Math.hypot(point.x - at[0], point.y - at[1]) }; }).sort((a, b) => a.distance - b.distance);
  const chosen = candidates[0].distance < 28 ? candidates[0] : null;
  drag = { x: event.clientX, opening: target.opening, chosen, offset: chosen ? { x: point.x - chosen.at[0], y: point.y - chosen.at[1] } : null };
  stage.setPointerCapture(event.pointerId); stage.classList.add("dragging"); render();
});
stage.addEventListener("pointermove", (event) => {
  if (!drag) return;
  if (drag.chosen) {
    const point = svgPoint(event), v = worldPoint({ x: point.x - drag.offset.x, y: point.y - drag.offset.y }, drag.chosen.z), angle = O.normalize(Math.atan2(v.y, v.x) * 180 / Math.PI), magnitude = O.clamp(Math.hypot(v.x, v.y), 1.5, 2.5);
    if (drag.chosen.key === "A") Object.assign(target, { a: magnitude, orientation: angle });
    else Object.assign(target, { b: magnitude, opening: O.clamp(O.normalize(angle - target.orientation), 30, 150) });
  } else target.opening = O.clamp(drag.opening + (event.clientX - drag.x) * 180 / stage.clientWidth, 30, 150);
  if (reduced.matches) state = { ...target };
  syncControls(); render(); schedule();
});
const endDrag = () => { drag = null; stage.classList.remove("dragging"); };
stage.addEventListener("pointerup", endDrag); stage.addEventListener("pointercancel", endDrag); stage.addEventListener("lostpointercapture", endDrag);
byId("zoom").addEventListener("click", () => {
  interact(); zoom = !zoom; if (reduced.matches) zoomMix = zoom ? 1 : 0;
  stage.classList.toggle("zoomed", zoom);
  byId("zoom").setAttribute("aria-pressed", String(zoom));
  byId("zoom").setAttribute("aria-label", zoom ? "Mostrar la máquina completa" : "Ampliar el mecanismo");
  byId("zoom").textContent = zoom ? "Vista completa ↙" : "Ampliar mecanismo ↗";
  render(); schedule();
});
function themeLabel() { byId("theme").setAttribute("aria-label", document.body.dataset.theme === "dark" ? "Cambiar al tema claro" : "Cambiar al tema oscuro"); }
byId("theme").addEventListener("click", () => { interact(); document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark"; themeLabel(); });
document.addEventListener("visibilitychange", () => { previous = null; if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = null; if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; } schedule(); }, { threshold: 0.05 }).observe(stage);
reduced.addEventListener("change", () => { pause(); state = { ...target }; zoomMix = zoom ? 1 : 0; render(); });
syncControls(); render(); themeLabel(); schedule();

MechanicalPlayback.bind({stop:()=>{if(frameId)cancelAnimationFrame(frameId);frameId=0;previous=null;},refresh:()=>{visible=MechanicalPlayback.inView(stage);},resume:()=>{render();schedule();}});

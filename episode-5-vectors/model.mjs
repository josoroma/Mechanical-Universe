export const DEFAULTS = Object.freeze({ mode: "parallelogram", a: 2.2, b: 1.8, orientation: 12, opening: 80, speed: 0.5 });
export const PRESETS = Object.freeze({
  right: { name: "Perpendiculares", a: 2, b: 2, orientation: 0, opening: 90 },
  reinforce: { name: "Se refuerzan", a: 2.3, b: 1.8, orientation: 10, opening: 30 },
  oppose: { name: "Se oponen en parte", a: 2, b: 2, orientation: 0, opening: 150 },
  negative: { name: "Componentes negativas", a: 2.2, b: 1.8, orientation: 170, opening: 80 }
});
const formats = Array.from({ length: 5 }, (_, digits) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }));
export const formatNumber = (value, digits = 2) => formats[digits].format(Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value);
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const radians = (degrees) => degrees * Math.PI / 180;
export const normalize = (degrees) => ((degrees % 360) + 360) % 360;
export const vector = (magnitude, degrees) => ({ x: magnitude * Math.cos(radians(degrees)), y: magnitude * Math.sin(radians(degrees)) });
export function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
export function describe(v) {
  const magnitude = Math.hypot(v.x, v.y);
  return { ...v, magnitude, direction: magnitude < 1e-10 ? null : normalize(Math.atan2(v.y, v.x) * 180 / Math.PI) };
}
export function snapshot(state = DEFAULTS) {
  const A = describe(vector(state.a, state.orientation)), B = describe(vector(state.b, state.orientation + state.opening)), R = describe(add(A, B));
  return { A, B, R, angleA: normalize(state.orientation), angleB: normalize(state.orientation + state.opening), area: Math.abs(A.x * B.y - A.y * B.x) };
}
export function tour(phase) {
  return { a: 2.05 + 0.35 * Math.sin(phase), b: 2.05 + 0.35 * Math.cos(phase), orientation: normalize(12 + phase * 180 / Math.PI * 0.45), opening: 90 - 55 * Math.cos(phase) };
}
export function follow(current, target, dt) {
  const next = { ...current }, factor = 1 - Math.exp(-12 * dt);
  for (const key of ["a", "b", "opening"]) next[key] += (target[key] - current[key]) * factor;
  const difference = ((target.orientation - current.orientation + 540) % 360) - 180;
  next.orientation = normalize(current.orientation + difference * factor);
  return next;
}

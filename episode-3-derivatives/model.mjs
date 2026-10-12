export const DEFAULTS = Object.freeze({ mode: "secant", profile: "parabola", x: 0.6, h: 0.9, speed: 0.5 });
export const PROFILES = Object.freeze({
  parabola: { name: "Parábola", formula: "f(x) = x²/4", derivative: "f′(x) = x/2" },
  wave: { name: "Onda", formula: "f(x) = 1 + sen x", derivative: "f′(x) = cos x" },
  cubic: { name: "Cúbica", formula: "f(x) = 1,4 + x³/24", derivative: "f′(x) = x²/8" },
});
const formats = Array.from({ length: 7 }, (_, digits) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }));
export const formatNumber = (value, digits = 2) => formats[digits].format(Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value);
export const clamp = (value, low = -2, high = 2) => Math.min(high, Math.max(low, value));
export function valueAt(profile, x) {
  if (profile === "wave") return 1 + Math.sin(x);
  if (profile === "cubic") return 1.4 + x ** 3 / 24;
  return x * x / 4;
}
export function derivativeAt(profile, x) {
  if (profile === "wave") return Math.cos(x);
  if (profile === "cubic") return x * x / 8;
  return x / 2;
}
export function secantAt(profile, x, h) {
  if (h === 0) return null;
  if (profile === "wave") return Math.cos(x + h / 2) * 2 * Math.sin(h / 2) / h;
  if (profile === "cubic") return (3 * x * x + 3 * x * h + h * h) / 24;
  return x / 2 + h / 4;
}
export function snapshot(state) {
  const x = clamp(state.x);
  const h = clamp(state.h, 0.02, 1);
  const y = valueAt(state.profile, x);
  const nextY = valueAt(state.profile, x + h);
  const derivative = derivativeAt(state.profile, x);
  const secant = secantAt(state.profile, x, h);
  const slope = state.mode === "tangent" ? derivative : secant;
  return { x, h, y, nextY, derivative, secant, slope, deltaY: nextY - y, angle: Math.atan(slope), error: Math.abs(secant - derivative) };
}
export function convergence(profile, x) {
  const derivative = derivativeAt(profile, x);
  return [1, 0.5, 0.1, 0.02].map((h) => ({ h, slope: secantAt(profile, x, h), error: Math.abs(secantAt(profile, x, h) - derivative) }));
}

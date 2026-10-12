export const GRAVITY = 9.80665;
export const RAMP_LENGTH = 2.5;
export const BALL_RADIUS = 0.075;
export const MASS_A = 0.05;
export const AIR_DENSITY = 1.225;
export const DRAG_COEFFICIENT = 0.47;
export const DEFAULTS = Object.freeze({ mode: "ramp", angle: 16, height: 1.8, mass: 0.5, air: false, progress: 0, speed: 0.25 });
const formats = Array.from({ length: 5 }, (_, digits) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }));
export const formatNumber = (value, digits = 2) => formats[digits].format(value);
export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
export const dragConstant = (mass) => AIR_DENSITY * DRAG_COEFFICIENT * Math.PI * BALL_RADIUS ** 2 / (2 * mass);
export function fallTime(height, mass, air = false) {
  if (!air) return Math.sqrt(2 * height / GRAVITY);
  const k = dragConstant(mass);
  return Math.acosh(Math.exp(k * height)) / Math.sqrt(GRAVITY * k);
}
export function fallState(time, height, mass, air = false) {
  const impact = fallTime(height, mass, air);
  const t = clamp(time, 0, impact);
  const k = dragConstant(mass);
  const x = Math.sqrt(GRAVITY * k) * t;
  const distance = air ? Math.log(Math.cosh(x)) / k : 0.5 * GRAVITY * t * t;
  const velocity = air ? Math.sqrt(GRAVITY / k) * Math.tanh(x) : GRAVITY * t;
  return { time: t, impact, distance: time >= impact ? height : Math.min(height, distance), velocity: time >= impact ? 0 : velocity, impactVelocity: air ? Math.sqrt(GRAVITY / k) * Math.tanh(Math.sqrt(GRAVITY * k) * impact) : GRAVITY * impact, landed: time >= impact - 1e-9 };
}
export function rampState(time, angle) {
  const acceleration = (5 / 7) * GRAVITY * Math.sin(angle * Math.PI / 180);
  const duration = Math.sqrt(2 * RAMP_LENGTH / acceleration);
  const t = clamp(time, 0, duration);
  return { time: t, duration, acceleration, distance: Math.min(RAMP_LENGTH, 0.5 * acceleration * t * t), velocity: time >= duration ? 0 : acceleration * t, impactVelocity: acceleration * duration, marks: [1, 2, 3, 4, 5].map((n) => ({ n, time: duration * n / 5, distance: RAMP_LENGTH * (n / 5) ** 2 })) };
}
export function snapshot(state) {
  const rampDuration = rampState(0, state.angle).duration;
  const aTime = fallTime(state.height, MASS_A, state.air);
  const bTime = fallTime(state.height, state.mass, state.air);
  const duration = state.mode === "ramp" ? rampDuration : Math.max(aTime, bTime);
  const time = clamp(state.progress) * duration;
  return { time, duration, ramp: rampState(state.mode === "ramp" ? time : 0, state.angle), a: fallState(state.mode === "drop" ? time : 0, state.height, MASS_A, state.air), b: fallState(state.mode === "drop" ? time : 0, state.height, state.mass, state.air), difference: aTime - bTime };
}

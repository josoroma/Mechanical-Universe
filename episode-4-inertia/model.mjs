export const GRAVITY = 9.80665;
export const DURATION = 6;
export const DAMPING = 0.3;
export const DEFAULTS = Object.freeze({ mode: "uniform", frame: "ground", velocity: 0.8, acceleration: 2, length: 1.6, progress: 0, speed: 0.5 });
const formats = Array.from({ length: 6 }, (_, digits) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }));
export const formatNumber = (value, digits = 2) => formats[digits].format(Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value);
export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export function cartAt(time, state) {
  const t = clamp(time, 0, DURATION);
  if (state.mode === "rest") return { time: t, position: 0, velocity: 0, acceleration: 0, phase: "rest" };
  if (state.mode === "uniform") return { time: t, position: state.velocity * t, velocity: state.velocity, acceleration: 0, phase: "uniform" };
  const a = state.acceleration;
  if (t < 1) return { time: t, position: 0.5 * a * t * t, velocity: a * t, acceleration: a, phase: "accelerating" };
  if (t < 2) return { time: t, position: a * (t - 0.5), velocity: a, acceleration: 0, phase: "coasting" };
  if (t < 3) { const q = t - 2; return { time: t, position: a * (1.5 + q - 0.5 * q * q), velocity: a * (1 - q), acceleration: -a, phase: "braking" }; }
  return { time: t, position: 2 * a, velocity: 0, acceleration: 0, phase: "stopped" };
}
export function angularAcceleration(angle, omega, acceleration, length, damping = DAMPING) {
  return -(GRAVITY * Math.sin(angle) + acceleration * Math.cos(angle)) / length - damping * omega;
}
export function rk4(angle, omega, acceleration, length, dt, damping = DAMPING) {
  const f = (q, w) => angularAcceleration(q, w, acceleration, length, damping);
  const k1 = f(angle, omega);
  const q2 = angle + omega * dt / 2, w2 = omega + k1 * dt / 2;
  const k2 = f(q2, w2);
  const q3 = angle + w2 * dt / 2, w3 = omega + k2 * dt / 2;
  const k3 = f(q3, w3);
  const q4 = angle + w3 * dt, w4 = omega + k3 * dt;
  const k4 = f(q4, w4);
  return { angle: angle + dt * (omega + 2 * w2 + 2 * w3 + w4) / 6, omega: omega + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6 };
}
export function trajectory(state, rate = 240) {
  let angle = 0, omega = 0;
  const dt = 1 / rate, points = [{ angle, omega }];
  for (let i = 0; i < DURATION * rate; i++) {
    const acceleration = cartAt((i + 0.5) * dt, state).acceleration;
    ({ angle, omega } = rk4(angle, omega, acceleration, state.length, dt));
    points.push({ angle, omega });
  }
  return { points, rate };
}
const cache = new Map();
export function motionFor(state) {
  const key = `${state.mode}/${state.acceleration}/${state.length}`;
  if (!cache.has(key)) { if (cache.size > 30) cache.clear(); cache.set(key, trajectory(state)); }
  return cache.get(key);
}
export function snapshot(state) {
  const time = clamp(state.progress) * DURATION;
  const cart = cartAt(time, state);
  const { points, rate } = motionFor(state);
  const index = Math.min(points.length - 1, Math.floor(time * rate));
  const fraction = time * rate - index;
  const p = points[index], next = points[Math.min(index + 1, points.length - 1)];
  const angle = p.angle + (next.angle - p.angle) * fraction;
  const omega = p.omega + (next.omega - p.omega) * fraction;
  return { ...cart, angle, omega, equilibrium: -Math.atan(cart.acceleration / GRAVITY), displacement: state.length * Math.sin(angle), bobHeight: -state.length * Math.cos(angle), period: 2 * Math.PI * Math.sqrt(state.length / GRAVITY) };
}

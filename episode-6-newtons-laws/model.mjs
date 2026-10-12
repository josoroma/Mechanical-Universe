export const G = 9.81;
export const TRAVEL = 0.8;
export const DEFAULTS = { mode: "atwood", m1: 0.6, m2: 0.9, v0: 0, h1: 0.25, h2: 0.25, h3: 0.35, angle: 240, mass: 1, held: true, speed: 0.5 };
export const PRESETS = {
  equal: { name: "Masas iguales", mode: "atwood", m1: 0.75, m2: 0.75, v0: 0 },
  reverse: { name: "Invierte el descenso", mode: "atwood", m1: 0.9, m2: 0.6, v0: 0 },
  inertia: { name: "Más inercia", mode: "atwood", m1: 0.9, m2: 1.2, v0: 0 },
  constant: { name: "Velocidad constante", mode: "atwood", m1: 0.75, m2: 0.75, v0: 0.25 },
  balance: { name: "Tres fuerzas equilibradas", mode: "table", h1: 0.25, h2: 0.25, h3: 0.25, angle: 240, mass: 1, held: false },
  unbalanced: { name: "Libera el desequilibrio", mode: "table", h1: 0.25, h2: 0.25, h3: 0.45, angle: 240, mass: 1, held: false }
};
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const radians = (degrees) => degrees * Math.PI / 180;
export const norm = (v) => Math.hypot(v.x, v.y);
export const unit = (degrees) => ({ x: Math.cos(radians(degrees)), y: Math.sin(radians(degrees)) });
export const normalize = (degrees) => ((degrees % 360) + 360) % 360;
export const number = (value, digits = 2) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value);
export function atwood(state = DEFAULTS, time = 0) {
  const total = state.m1 + state.m2, drive = (state.m2 - state.m1) * G;
  const acceleration = drive / total, tension = 2 * state.m1 * state.m2 * G / total;
  const roots = [];
  for (const end of [-TRAVEL, TRAVEL]) {
    if (Math.abs(acceleration) < 1e-12) { if (Math.abs(state.v0) > 1e-12) roots.push(end / state.v0); }
    else {
      const discriminant = state.v0 ** 2 + 2 * acceleration * end;
      if (discriminant >= 0) roots.push((-state.v0 + Math.sqrt(discriminant)) / acceleration, (-state.v0 - Math.sqrt(discriminant)) / acceleration);
    }
  }
  const endTime = Math.min(...roots.filter((t) => t > 1e-10)), t = Math.min(Math.max(time, 0), endTime);
  return { total, drive, acceleration, tension, time: t, q: state.v0 * t + acceleration * t * t / 2, velocity: state.v0 + acceleration * t, endTime, finished: Number.isFinite(endTime) && time >= endTime };
}
export function table(state = DEFAULTS) {
  const masses = [state.h1, state.h2, state.h3], angles = [0, 120, state.angle], units = angles.map(unit);
  let xx = state.mass, xy = 0, yy = state.mass, bx = 0, by = 0;
  masses.forEach((m, i) => { const u = units[i]; xx += m * u.x * u.x; xy += m * u.x * u.y; yy += m * u.y * u.y; bx += m * G * u.x; by += m * G * u.y; });
  const determinant = xx * yy - xy * xy;
  const acceleration = state.held ? { x: 0, y: 0 } : { x: (yy * bx - xy * by) / determinant, y: (xx * by - xy * bx) / determinant };
  const tensions = masses.map((m, i) => m * (G - units[i].x * acceleration.x - units[i].y * acceleration.y));
  const traction = tensions.reduce((v, T, i) => ({ x: v.x + T * units[i].x, y: v.y + T * units[i].y }), { x: 0, y: 0 });
  const reaction = state.held ? { x: -traction.x, y: -traction.y } : { x: 0, y: 0 };
  const net = { x: traction.x + reaction.x, y: traction.y + reaction.y };
  return { masses, angles, units, tensions, acceleration, traction, reaction, net, balanced: norm({ x: bx, y: by }) < 1e-8, hangAcceleration: units.map((u) => u.x * acceleration.x + u.y * acceleration.y) };
}
export function equilibrium(state) {
  const u = unit(120), x = state.h1 + state.h2 * u.x, y = state.h2 * u.y;
  return { h3: Math.hypot(x, y), angle: normalize(Math.atan2(-y, -x) * 180 / Math.PI) };
}
export function follow(current, target, dt) {
  const f = 1 - Math.exp(-12 * dt), next = { ...target };
  for (const key of ["m1", "m2", "v0", "h1", "h2", "h3", "angle", "mass"]) next[key] = current[key] + (target[key] - current[key]) * f;
  return next;
}

import test from "node:test";
import assert from "node:assert/strict";
import * as O from "../model.mjs";
import * as S from "../scene.mjs";
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const maneuver = { ...O.DEFAULTS, mode: "maneuver" };
test("La maniobra conserva posición y velocidad al cambiar de fase", () => {
  for (const acceleration of [0.5, 2, 2.5]) {
    const state = { ...maneuver, acceleration };
    for (const t of [1, 2, 3]) {
      const before = O.cartAt(t - 1e-8, state), after = O.cartAt(t, state);
      near(before.position, after.position, 3e-8); near(before.velocity, after.velocity, 3e-8);
    }
    near(O.cartAt(3, state).position, 2 * acceleration);
    near(O.cartAt(6, state).velocity, 0);
    for (const t of [0.4, 1.4, 2.4, 4]) {
      const h = 1e-4, left = O.cartAt(t - h, state), right = O.cartAt(t + h, state), mid = O.cartAt(t, state);
      near((right.position - left.position) / (2 * h), mid.velocity, 1e-8);
      near((right.velocity - left.velocity) / (2 * h), mid.acceleration, 1e-8);
    }
  }
});
test("Reposo y velocidad constante dejan vertical un péndulo inicialmente en equilibrio", () => {
  for (const mode of ["rest", "uniform"]) for (const velocity of [0.4, 1]) for (const progress of [0, 0.25, 0.5, 1]) {
    const snap = O.snapshot({ ...O.DEFAULTS, mode, velocity, progress });
    near(snap.angle, 0); near(snap.omega, 0); near(snap.acceleration, 0);
    near(snap.position, mode === "uniform" ? velocity * O.DURATION * progress : 0);
  }
});
test("La inclinación de equilibrio anula la aceleración angular", () => {
  for (const acceleration of [-2.5, -0.5, 0, 0.5, 2.5]) for (const length of [1.2, 2.2]) near(O.angularAcceleration(-Math.atan(acceleration / O.GRAVITY), 0, acceleration, length), 0);
});
test("El péndulo se retrasa al arrancar y no pierde su oscilación en la marcha uniforme", () => {
  assert.ok(O.snapshot({ ...maneuver, progress: 0.5 / 6 }).angle < 0);
  const coasting = O.snapshot({ ...maneuver, progress: 1.5 / 6 });
  near(coasting.acceleration, 0); assert.ok(Math.abs(coasting.angle) > 0.01);
  const braking = O.snapshot({ ...maneuver, progress: 2.5 / 6 });
  assert.ok(braking.equilibrium > 0);
  const stopped = O.snapshot({ ...maneuver, progress: 4 / 6 });
  near(stopped.velocity, 0); assert.ok(Math.abs(stopped.angle) + Math.abs(stopped.omega) > 0.01);
});
test("La integración conserva la energía del péndulo sin amortiguamiento", () => {
  const L = 1.8, energy = (q, w) => 0.5 * L * L * w * w + O.GRAVITY * L * (1 - Math.cos(q));
  let q = 0.65, w = 0;
  const initial = energy(q, w);
  for (let i = 0; i < 4800; i++) { const p = O.rk4(q, w, 0, L, 1 / 240, 0); q = p.angle; w = p.omega; }
  near(energy(q, w), initial, 1e-7);
});
test("El amortiguamiento disipa energía sin aceleración del carro", () => {
  const L = 1.6, energy = (q, w) => 0.5 * L * L * w * w + O.GRAVITY * L * (1 - Math.cos(q));
  let q = 0.6, w = 0, previous = energy(q, w), initial = previous;
  for (let i = 0; i < 2400; i++) {
    const p = O.rk4(q, w, 0, L, 1 / 240); q = p.angle; w = p.omega;
    const current = energy(q, w); assert.ok(current <= previous + 1e-10); previous = current;
  }
  assert.ok(previous < initial * 0.1);
});
test("La trayectoria converge al refinar el paso temporal", () => {
  for (const length of [1.2, 2.2]) {
    const state = { ...maneuver, length, acceleration: 2.5 };
    const coarse = O.trajectory(state, 120), fine = O.trajectory(state, 480);
    for (let i = 0; i < coarse.points.length; i += 10) {
      near(coarse.points[i].angle, fine.points[i * 4].angle, 2e-7);
      near(coarse.points[i].omega, fine.points[i * 4].omega, 5e-7);
    }
  }
});
test("Cambiar de observador conserva la geometría relativa y la longitud física", () => {
  for (const length of [1.2, 2.2]) for (const progress of [0, 0.15, 0.4, 0.7, 1]) {
    const state = { ...maneuver, length, progress }, ground = O.snapshot(state), aboard = O.snapshot({ ...state, frame: "cart" });
    near(ground.angle, aboard.angle); near(ground.position, aboard.position);
    const at = S.bobCenter(state, ground);
    near(Math.hypot(at[0] - S.cartCenter(ground), at[2] - S.PIVOT_HEIGHT), length * S.SCALE);
    assert.ok(at[2] - 11 > 74, "La esfera debe quedar sobre la plataforma");
  }
});
test("El recorrido cabe en los rieles y las ruedas ruedan sin deslizar", () => {
  for (const mode of ["rest", "uniform", "maneuver"]) for (const progress of [0, 0.5, 1]) {
    const s = O.snapshot({ ...O.DEFAULTS, mode, progress, velocity: 1, acceleration: 2.5 });
    const center = S.cartCenter(s), rotation = -s.position * S.SCALE / S.WHEEL_RADIUS;
    assert.ok(center - 50 - S.WHEEL_RADIUS >= -320 && center + 50 + S.WHEEL_RADIUS <= 320);
    near(-rotation * S.WHEEL_RADIUS, s.position * S.SCALE);
  }
});

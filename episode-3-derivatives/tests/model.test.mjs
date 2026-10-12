import test from "node:test";
import assert from "node:assert/strict";
import * as M from "../model.mjs";
import * as S from "../scene.mjs";

const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
test("Las derivadas coinciden con una diferencia central independiente", () => {
  for (const profile of Object.keys(M.PROFILES)) for (let x = -2; x <= 2; x += 0.125) {
    const h = 1e-5;
    near(M.derivativeAt(profile, x), (M.valueAt(profile, x + h) - M.valueAt(profile, x - h)) / (2 * h), 1e-9);
  }
});
test("Las secantes usan las alturas de los dos extremos", () => {
  for (const profile of Object.keys(M.PROFILES)) for (const x of [-2, -0.6, 0, 0.6, 2]) for (const h of [-1, -0.02, 0.02, 0.1, 0.5, 1]) {
    near(M.secantAt(profile, x, h), (M.valueAt(profile, x + h) - M.valueAt(profile, x)) / h);
  }
});
test("El límite por ambos lados coincide con la derivada y no divide entre cero", () => {
  for (const profile of Object.keys(M.PROFILES)) for (const x of [-2, 0, 0.6, 2]) {
    assert.equal(M.secantAt(profile, x, 0), null);
    for (const h of [-1e-8, 1e-8]) near(M.secantAt(profile, x, h), M.derivativeAt(profile, x), 1e-8);
  }
});
test("La parábola baja, tiene un mínimo y sube; la cúbica tiene una inflexión horizontal", () => {
  assert.ok(M.derivativeAt("parabola", -1.5) < 0);
  assert.equal(M.derivativeAt("parabola", 0), 0);
  assert.ok(M.derivativeAt("parabola", 1.5) > 0);
  assert.equal(M.derivativeAt("cubic", 0), 0);
  assert.ok(M.valueAt("cubic", -0.1) < M.valueAt("cubic", 0));
  assert.ok(M.valueAt("cubic", 0.1) > M.valueAt("cubic", 0));
});
test("La tabla y la regla comparten la pendiente y respetan el dominio", () => {
  for (const profile of Object.keys(M.PROFILES)) for (const x of [-2, 0.6, 2]) {
    for (const row of M.convergence(profile, x)) {
      const snap = M.snapshot({ ...M.DEFAULTS, profile, x, h: row.h });
      near(snap.slope, row.slope);
      near(Math.tan(snap.angle), row.slope);
      near(row.error, Math.abs(row.slope - snap.derivative));
      assert.ok(snap.x + snap.h <= 3.2);
    }
    const tangent = M.snapshot({ ...M.DEFAULTS, profile, x, mode: "tangent" });
    near(tangent.slope, M.derivativeAt(profile, x));
  }
});
test("Las esferas apoyan su radio sobre la normal y quedan fuera del perfil", () => {
  for (const profile of Object.keys(M.PROFILES)) for (let x = -2; x <= 3; x += 0.1) {
    const at = S.rollerPosition(profile, x);
    const contact = S.position(x, M.valueAt(profile, x));
    const dx = at[0] - contact[0], dz = at[2] - contact[2];
    near(Math.hypot(dx, dz), 4);
    near(dx + M.derivativeAt(profile, x) * dz, 0);
    for (let q = x - 0.15; q <= x + 0.15; q += 0.005) {
      const point = S.position(q, M.valueAt(profile, q));
      assert.ok(Math.hypot(at[0] - point[0], at[2] - point[2]) >= 3.999999);
    }
  }
});
test("La localización evita el punto decimal y el cero negativo", () => {
  assert.equal(M.formatNumber(1.4), "1,40");
  assert.equal(M.formatNumber(-0.000001, 4), "0,0000");
  assert.equal(M.formatNumber(-1.5, 1), "-1,5");
});

import test from "node:test";
import assert from "node:assert/strict";
import * as O from "../model.mjs";
import * as S from "../scene.mjs";
import { orderParts } from "../painter.mjs";
const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`);
test("Las componentes respetan módulo, dirección y signos", () => {
  for (const [angle, x, y] of [[0, 2, 0], [90, 0, 2], [180, -2, 0], [270, 0, -2]]) {
    const v = O.vector(2, angle); near(v.x, x); near(v.y, y);
  }
  const v = O.vector(2, 30); near(v.x, Math.sqrt(3)); near(v.y, 1);
});
test("La suma perpendicular reproduce el triángulo 3–4–5", () => {
  const s = O.snapshot({ a: 3, b: 4, orientation: 0, opening: 90 });
  near(s.R.x, 3); near(s.R.y, 4); near(s.R.magnitude, 5); near(s.R.direction, 53.13010235415598);
});
test("El módulo coincide con la ley del coseno en todo el recorrido", () => {
  for (const a of [1.5, 2, 2.5]) for (const b of [1.5, 2.2, 2.5]) for (const opening of [0, 30, 90, 150, 180]) for (const orientation of [0, 45, 170, 270]) {
    const s = O.snapshot({ a, b, opening, orientation });
    near(s.R.magnitude ** 2, a * a + b * b + 2 * a * b * Math.cos(O.radians(opening)));
  }
});
test("Los lados opuestos cierran el paralelogramo y conservan sus vectores", () => {
  for (const p of Object.values(O.PRESETS)) {
    const s = O.snapshot(p);
    near(s.R.x - s.A.x, s.B.x); near(s.R.y - s.A.y, s.B.y);
    near(s.R.x - s.B.x, s.A.x); near(s.R.y - s.B.y, s.A.y);
    near(Math.hypot(s.R.x - s.A.x, s.R.y - s.A.y), p.b);
    near(s.area, p.a * p.b * Math.sin(O.radians(p.opening)));
  }
});
test("La suma es conmutativa y asociativa", () => {
  const vectors = [O.vector(2.3, 33), O.vector(1.7, 194), O.vector(2.1, 289)];
  const [a, b, c] = vectors, ab = O.add(a, b), ba = O.add(b, a);
  near(ab.x, ba.x); near(ab.y, ba.y);
  const left = O.add(ab, c), right = O.add(a, O.add(b, c));
  near(left.x, right.x); near(left.y, right.y);
});
test("Una rotación conserva el módulo y el área y rota las componentes", () => {
  const start = O.snapshot(O.DEFAULTS);
  for (const rotation of [45, 90, 180, 270]) {
    const s = O.snapshot({ ...O.DEFAULTS, orientation: O.DEFAULTS.orientation + rotation });
    const c = Math.cos(O.radians(rotation)), t = Math.sin(O.radians(rotation));
    near(s.R.x, start.R.x * c - start.R.y * t); near(s.R.y, start.R.x * t + start.R.y * c);
    near(s.R.magnitude, start.R.magnitude); near(s.area, start.area);
  }
});
test("Los casos colineales y el vector nulo se tratan sin dirección ficticia", () => {
  near(O.snapshot({ a: 2, b: 1.5, orientation: 0, opening: 0 }).R.magnitude, 3.5);
  const opposite = O.snapshot({ a: 2, b: 1.5, orientation: 0, opening: 180 }).R;
  near(opposite.magnitude, 0.5); near(opposite.direction, 0);
  const zero = O.snapshot({ a: 2, b: 2, orientation: 0, opening: 180 }).R;
  near(zero.magnitude, 0); assert.equal(zero.direction, null);
  assert.equal(O.describe({ x: 0, y: 0 }).direction, null);
});
test("atan2 conserva el cuadrante y el formato usa coma decimal", () => {
  for (const [x, y, angle] of [[1, 1, 45], [-1, 1, 135], [-1, -1, 225], [1, -1, 315]]) near(O.describe({ x, y }).direction, angle);
  assert.equal(O.formatNumber(-0.00001), "0,00"); assert.equal(O.formatNumber(2.125, 2), "2,13");
});
test("La interpolación cruza cero por el giro más corto y respeta los topes", () => {
  const state = { ...O.DEFAULTS, orientation: 359 }, target = { ...O.DEFAULTS, a: 2.5, b: 1.5, orientation: 1, opening: 150 };
  const s = O.follow(state, target, 0.05);
  assert.ok(s.orientation > 359 || s.orientation < 1);
  assert.ok(s.a >= state.a && s.a <= target.a && s.opening >= state.opening && s.opening <= target.opening);
  for (let i = 0; i <= 100; i++) { const p = O.tour(i / 10); assert.ok(p.a >= 1.5 && p.a <= 2.5 && p.b >= 1.5 && p.b <= 2.5 && p.opening >= 30 && p.opening <= 150); }
});
test("Las correderas conservan su longitud y el orden de los sólidos admite una vuelta completa", () => {
  let count = 0;
  for (let orientation = 0; orientation < 360; orientation += 15) for (const opening of [30, 90, 150]) for (const a of [1.5, 2.5]) for (const b of [1.5, 2.5]) {
    const parts = S.scene({ ...O.DEFAULTS, orientation, opening, a, b });
    assert.equal(orderParts(parts, S.PROJECTION).length, 83);
    for (const id of ["a", "b", "copy-a", "copy-b"]) {
      const p = parts.find((part) => part.name === `arm.${id}.slide`).shape.polygon;
      const xs = p.map(([x]) => x); near(Math.max(...xs) - Math.min(...xs), 85);
    }
    count++;
  }
  assert.equal(count, 288);
});

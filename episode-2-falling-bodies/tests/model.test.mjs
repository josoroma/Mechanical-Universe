import test from "node:test";
import assert from "node:assert/strict";
import * as O from "../model.mjs";
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
test("la rodadura de una esfera maciza incluye su momento de inercia", () => {
  close(O.rampState(0, 30).acceleration, (5 / 14) * O.GRAVITY);
  const duration = O.rampState(0, 16).duration;
  close(O.rampState(duration / 2, 16).distance, O.RAMP_LENGTH / 4);
  close(O.rampState(duration, 16).distance, O.RAMP_LENGTH);
});
test("las marcas cuadráticas se alcanzan en intervalos iguales", () => {
  const ramp = O.rampState(0, 16);
  ramp.marks.forEach((mark) => close(O.rampState(mark.time, 16).distance, mark.distance));
  ramp.marks.slice(1).forEach((mark, i) => close(mark.time - ramp.marks[i].time, ramp.duration / 5));
});
test("en el vacío la masa no cambia el tiempo de caída", () => {
  for (const height of [0.5, 1.8, 2]) {
    close(O.fallTime(height, 0.05), O.fallTime(height, 1));
    close(O.fallState(0.1, height, 0.05).distance, 0.5 * O.GRAVITY * 0.1 ** 2);
  }
});
test("el aire frena más a la esfera de menor masa y conserva las condiciones iniciales", () => {
  assert.ok(O.fallTime(2, 0.05, true) > O.fallTime(2, 1, true));
  assert.ok(O.fallTime(2, 1, true) > O.fallTime(2, 1, false));
  close(O.fallState(0, 2, 0.05, true).distance, 0);
  close(O.fallState(0, 2, 0.05, true).velocity, 0);
  const t = O.fallTime(2, 0.05, true);
  close(O.fallState(t, 2, 0.05, true).distance, 2);
});
test("los cuerpos se detienen al llegar y no atraviesan el receptor", () => {
  for (const air of [true, false]) {
    const fall = O.fallState(10, 1.8, 0.05, air);
    assert.equal(fall.distance, 1.8);
    assert.equal(fall.velocity, 0);
    assert.equal(fall.landed, true);
  }
  const snapshot = O.snapshot({ ...O.DEFAULTS, mode: "drop", air: true, progress: 1 });
  assert.ok(snapshot.a.landed && snapshot.b.landed);
});
test("el texto usa la coma decimal del español", () => {
  assert.equal(O.formatNumber(1.25), "1,25");
  assert.equal(O.formatNumber(16, 0), "16");
});

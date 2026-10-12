import assert from "node:assert/strict";
import test from "node:test";
import * as O from "../model.mjs";

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test("Kepler's equation converges throughout the adjustable eccentricity range", () => {
  for (const e of [0, 0.017, 0.094, 0.206, 0.45]) {
    for (let mean = -20; mean <= 20; mean += 0.073) {
      const anomaly = O.eccentricAnomaly(mean, e);
      near(anomaly - e * Math.sin(anomaly), O.normalize(mean), 1e-11);
    }
  }
});

test("ellipses have the Sun at a focus and conserve orbital energy and angular momentum", () => {
  for (const planet of O.PLANETS) {
    for (const e of [0, planet.e, 0.45]) {
      for (let i = 0; i < 60; i++) {
        const state = O.orbit(planet, i * O.period(planet) / 60, e);
        near(((state.x + planet.a * e) / planet.a) ** 2 + (state.y / (planet.a * Math.sqrt(1 - e * e))) ** 2, 1);
        near(state.speed ** 2, O.MU * (2 / state.r - 1 / planet.a), 1e-8);
        near(state.x * state.vy - state.y * state.vx, Math.sqrt(O.MU * planet.a * (1 - e * e)), 1e-8);
        near(state.acceleration * state.r ** 2, O.MU, 1e-8);
      }
    }
  }
});

test("two equal-time sectors have equal area at perihelion and aphelion", () => {
  const planet = O.PLANETS[3];
  const e = 0.45;
  const interval = 0.12;
  const area = (start) => {
    let sum = 0;
    let previous = O.orbit(planet, start, e);
    for (let i = 1; i <= 3000; i++) {
      const next = O.orbit(planet, start + interval * i / 3000, e);
      sum += (previous.x * next.y - previous.y * next.x) / 2;
      previous = next;
    }
    return sum;
  };
  const perihelion = -planet.phase * O.period(planet) / O.TAU;
  const a = area(perihelion);
  const b = area(perihelion + O.period(planet) / 2);
  near(a, b, 1e-7);
});

test("the geocentric Mars epicycle matches circular Earth-relative motion and reverses", () => {
  let forward = false;
  let backward = false;
  for (let time = 0; time < 5; time += 0.015) {
    const state = O.geocentric(O.PLANETS[3], time);
    const mars = O.bodyPositions(0, time).find((planet) => planet.id === "mars");
    near(mars.x, state.x * 72, 1e-8);
    near(mars.y, state.y * 72, 1e-8);
    forward ||= state.angularRate > 0;
    backward ||= state.angularRate < 0;
  }
  assert.ok(forward && backward);
});

test("all carrier coordinates stay finite across every model and eccentricity extreme", () => {
  for (const mode of [0, 1, 2]) for (const e of [0, 0.094, 0.45]) {
    for (let time = 0; time <= 8; time += 0.1) {
      for (const planet of O.bodyPositions(mode, time, e)) for (const value of [planet.x, planet.y, planet.z]) assert.ok(Number.isFinite(value));
    }
  }
});

test("periods follow Kepler's third law and Earth's year normalizes the model", () => {
  near(O.period(O.PLANETS[2]), 1);
  near(O.period(O.PLANETS[3]), 1.88, 0.004);
  for (const planet of O.PLANETS) near(O.period(planet) ** 2, planet.a ** 3);
});

test("Earth's circular speed converts to about 29.8 km/s", () => {
  const speed = O.circular(O.PLANETS[2], 0).speed * O.AU_METRES / O.YEAR_SECONDS / 1000;
  near(speed, 29.8, 0.05);
});

export const TAU = 2 * Math.PI;
export const AU_METRES = 149597870700;
export const YEAR_SECONDS = 365.256 * 86400;
export const MU = TAU * TAU;
const NUMBER_FORMATS = Array.from({ length: 5 }, (_, digits) => new Intl.NumberFormat("es", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }));
export const formatNumber = (value, digits = 2) => NUMBER_FORMATS[digits].format(value);
export const PLANETS = [
  { id: "mercury", name: "Mercurio", a: 0.387, e: 0.206, radius: 49, globe: 5, phase: 2.4, material: "silver" },
  { id: "venus", name: "Venus", a: 0.723, e: 0.007, radius: 80, globe: 7, phase: 4.1, material: "ivory" },
  { id: "earth", name: "Tierra", a: 1, e: 0.017, radius: 110, globe: 8.5, phase: 1.1, material: "earth" },
  { id: "mars", name: "Marte", a: 1.524, e: 0.094, radius: 153, globe: 7, phase: 0.1, material: "copper" },
  { id: "jupiter", name: "Júpiter", a: 5.203, e: 0.049, radius: 194, globe: 11, phase: 3.7, material: "ivory" },
  { id: "saturn", name: "Saturno", a: 9.537, e: 0.052, radius: 226, globe: 8, phase: 5.2, material: "brass" },
];
export const ERAS = [
  {
    id: "ptolemaic", name: "Ptolemaico", year: "c. 150", tag: "LA TIERRA EN REPOSO",
    heading: "Un cosmos a nuestro alrededor.",
    description: "La Tierra permanece inmóvil. Para explicar el movimiento de los planetas, un círculo pequeño gira sobre otro mayor. Observa cómo Marte recorre su epiciclo y, a veces, parece retroceder.",
    principle: "Un círculo sobre otro", equation: "deferente + epiciclo", discovery: "Una geometría de las apariencias",
    note: "Reconstrucción geocéntrica esquemática. El epiciclo de Marte ilustra el movimiento retrógrado; se omiten las excéntricas, el ecuante y las inclinaciones orbitales del modelo de Ptolomeo.",
    center: "La Tierra", orbit: "Círculos y epiciclos",
  },
  {
    id: "copernican", name: "Copernicano", year: "1543", tag: "LA TIERRA EN MOVIMIENTO",
    heading: "Cambia el centro.",
    description: "Sitúa el Sol en el centro y la Tierra se convierte en un planeta en movimiento. Cuando la Tierra adelanta a Marte, este parece retroceder respecto a las estrellas lejanas. El observador también se mueve.",
    principle: "Un nuevo punto de vista", equation: "La Tierra es un planeta", discovery: "El movimiento depende del observador",
    note: "Modelo heliocéntrico idealizado con órbitas circulares. Copérnico aún utilizaba círculos adicionales; este instrumento destaca su cambio de perspectiva. La Luna se omite en los modelos heliocéntricos.",
    center: "El Sol", orbit: "Círculos idealizados",
  },
  {
    id: "newtonian", name: "Newtoniano", year: "1687", tag: "UNA LEY PARA LA TIERRA Y EL CIELO",
    heading: "Descubre la causa.",
    description: "La gravedad explica el movimiento. Los planetas describen elipses: se aceleran al acercarse al Sol y se frenan al alejarse. La misma atracción rige una órbita y la caída de una manzana.",
    principle: "Gravitación universal", equation: "F = G M m / r²", discovery: "Una ley, un universo en movimiento",
    note: "Kepler describió las órbitas elípticas en 1609; Newton las explicó mediante el movimiento y la gravedad. Este modelo de dos cuerpos mantiene el Sol fijo. El ajuste de la excentricidad de Marte es una demostración y no representa una efeméride.",
    center: "El Sol en uno de los focos", orbit: "Elipses keplerianas",
  },
];
export const planetById = (id) => PLANETS.find((planet) => planet.id === id) ?? PLANETS[3];
export const period = (planet) => Math.sqrt(planet.a ** 3);
export const normalize = (angle) => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
export function eccentricAnomaly(mean, eccentricity) {
  const m = normalize(mean);
  let result = m;
  for (let step = 0; step < 14; step++) {
    const change = (result - eccentricity * Math.sin(result) - m) / (1 - eccentricity * Math.cos(result));
    result -= change;
    if (Math.abs(change) < 1e-13) break;
  }
  return result;
}
export function orbit(planet, time, eccentricity = planet.e) {
  const n = TAU / period(planet);
  const anomaly = eccentricAnomaly(n * time + planet.phase, eccentricity);
  const denominator = 1 - eccentricity * Math.cos(anomaly);
  const minor = Math.sqrt(1 - eccentricity * eccentricity);
  const x = planet.a * (Math.cos(anomaly) - eccentricity);
  const y = planet.a * minor * Math.sin(anomaly);
  const vx = -planet.a * Math.sin(anomaly) * n / denominator;
  const vy = planet.a * minor * Math.cos(anomaly) * n / denominator;
  const r = Math.hypot(x, y);
  return { x, y, vx, vy, r, speed: Math.hypot(vx, vy), acceleration: MU / (r * r), anomaly, eccentricity };
}
export function circular(planet, time) {
  return orbit(planet, time, 0);
}
export function geocentric(planet, time) {
  const position = circular(planet, time);
  const earth = circular(PLANETS[2], time);
  const x = position.x - earth.x;
  const y = position.y - earth.y;
  const vx = position.vx - earth.vx;
  const vy = position.vy - earth.vy;
  return { x, y, vx, vy, r: Math.hypot(x, y), angularRate: (x * vy - y * vx) / (x * x + y * y) };
}
export function telemetry(mode, time, selected = "mars", marsE = 0.094) {
  const planet = planetById(selected);
  const earth = circular(PLANETS[2], time);
  const state = mode === 0 ? geocentric(planet, time) : orbit(planet, time, mode === 1 ? 0 : planet.id === "mars" ? marsE : planet.e);
  if (mode === 0 && selected === "earth") return { firstLabel: "En el centro", firstValue: "La Tierra", secondLabel: "Estado del modelo", secondValue: "En reposo", readout: "Tierra inmóvil · observador en el centro" };
  if (mode === 0) {
    const retrograde = state.angularRate < 0;
    return { firstLabel: `${planet.name} desde la Tierra`, firstValue: `${formatNumber(state.r)} ua`, secondLabel: "Movimiento aparente", secondValue: retrograde ? "Retrógrado ↶" : "Directo ↷", readout: `${planet.name} · movimiento ${retrograde ? "retrógrado" : "directo"} · ${formatNumber(state.angularRate * 180 / Math.PI, 1)}°/año`, state };
  }
  if (mode === 1) {
    const relative = selected === "earth" ? null : geocentric(planet, time);
    return { firstLabel: "Período orbital", firstValue: `${formatNumber(period(planet))} años`, secondLabel: "Desde la Tierra", secondValue: relative ? relative.angularRate < 0 ? "Retrógrado ↶" : "Directo ↷" : "Nos movemos", readout: `${planet.name} · ${formatNumber(period(planet))} años por órbita · la Tierra también se mueve`, state, earth };
  }
  const speedKm = state.speed * AU_METRES / YEAR_SECONDS / 1000;
  const acceleration = state.acceleration * AU_METRES / YEAR_SECONDS ** 2;
  return { firstLabel: "Distancia al Sol", firstValue: `${formatNumber(state.r, 3)} ua`, secondLabel: "Velocidad orbital", secondValue: `${formatNumber(speedKm)} km/s`, readout: `${planet.name} · aceleración gravitatoria del Sol: ${formatNumber(acceleration, 4)} m/s² · e = ${formatNumber(state.eccentricity, 3)}`, state };
}
export function bodyPositions(mode, time, marsE = 0.094) {
  if (mode !== 0) return PLANETS.map((planet, index) => {
    const p = orbit(planet, time, mode === 1 ? 0 : planet.id === "mars" ? marsE : planet.e);
    return { ...planet, x: p.x / planet.a * planet.radius, y: p.y / planet.a * planet.radius, z: mode === 2 && planet.id === "mars" ? 100 : 35 - index * 4, orbitState: p };
  });
  const earthPhase = TAU * time + PLANETS[2].phase;
  const specifications = [
    { id: "moon", name: "Luna", radius: 30, globe: 3.5, material: "silver", angular: TAU * time / 0.0748 + 2, z: 35 },
    { ...PLANETS[0], radius: 58, epicycle: 5, angular: earthPhase + Math.PI, z: 31 },
    { ...PLANETS[1], radius: 85, epicycle: 6, angular: earthPhase + Math.PI, z: 27 },
    { id: "sun", name: "Sol", radius: 119, globe: 13, material: "sun", angular: earthPhase + Math.PI, z: 23 },
    { ...PLANETS[3], radius: 72 * PLANETS[3].a, epicycle: 72, angular: TAU * time / period(PLANETS[3]) + PLANETS[3].phase, z: 100 },
    { ...PLANETS[4], radius: 198, epicycle: 4, angular: TAU * time / period(PLANETS[4]) + PLANETS[4].phase, z: 19 },
    { ...PLANETS[5], radius: 231, epicycle: 3, angular: TAU * time / period(PLANETS[5]) + PLANETS[5].phase, z: 15 },
  ];
  return specifications.map((planet) => {
    const cx = planet.radius * Math.cos(planet.angular);
    const cy = planet.radius * Math.sin(planet.angular);
    const offset = planet.epicycle ?? 0;
    const epicycleAngle = offset ? planet.id === "mars" ? earthPhase + Math.PI : TAU * time / period(planet) + (planet.phase ?? 0) : 0;
    return { ...planet, cx, cy, x: cx + offset * Math.cos(epicycleAngle), y: cy + offset * Math.sin(epicycleAngle) };
  });
}

# Episodio 21 · Las tres leyes de Kepler

Planetario elíptico con brazo radial, guía y áreas barridas. Ajusta semieje mayor y excentricidad; sigue la rapidez, el período y los sectores de igual duración. Español, oscuro inicial, selector claro, teclado, tacto y reloj accesible. HTML autónomos.

```sh
node episode-21-keplers-three-laws/build.mjs
node --test episode-21-keplers-three-laws/tests/model.test.mjs
node episode-21-keplers-three-laws/build.mjs --audit
node laboratory/make-tests.mjs episode-21-keplers-three-laws
node laboratory/scripts/drive.mjs episode-21-keplers-three-laws/index.html --actions episode-21-keplers-three-laws/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-21-keplers-three-laws/index.html --actions episode-21-keplers-three-laws/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-21-keplers-three-laws/index.html --actions episode-21-keplers-three-laws/tests/normal.json --width 1440 --height 1500
```

La ecuación de Kepler se resuelve en `../laboratory/orbits.mjs`. Las pruebas comprueban la aceleración central, la energía, sectores numéricos y T²/a³. Modelo solar de dos cuerpos, masa planetaria despreciable; guía y brazo ideales, cuerpos sin escala. Fuentes y unidades en `lesson.mjs`, piezas en `scene.mjs`, decisiones en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

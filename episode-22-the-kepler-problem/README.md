# Episodio 22 · El problema de Kepler


Mesa ideal de aire con disco deslizante, hilo y servotensor de fuerza inversa al cuadrado. Ajusta rapidez y distancia iniciales e intensidad central. Dinamómetro, reloj y gráfica sincronizados. Español, tema oscuro inicial, selector claro y controles accesibles. HTML autónomos.

```sh
node episode-22-the-kepler-problem/build.mjs
node --test episode-22-the-kepler-problem/tests/model.test.mjs
node episode-22-the-kepler-problem/build.mjs --audit
node laboratory/make-tests.mjs episode-22-the-kepler-problem
node laboratory/scripts/drive.mjs episode-22-the-kepler-problem/index.html --actions episode-22-the-kepler-problem/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-22-the-kepler-problem/index.html --actions episode-22-the-kepler-problem/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-22-the-kepler-problem/index.html --actions episode-22-the-kepler-problem/tests/normal.json --width 1440 --height 1500
```

El controlador prescribe F = mμ/r²; el modelo no atribuye esa ley a una tensión constante ni a imanes ordinarios. El disco sigue la solución libre de fuerza central. Las pruebas comprueban condiciones iniciales, fuerza, energía y momento angular. Fuentes, constantes y límites en `lesson.mjs`; piezas en `scene.mjs`, decisiones en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

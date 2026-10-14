# Episodio 24 · Navegación en el espacio


Planetario de transferencia de Hohmann: dos planetas y una nave, radio exterior y error de fase ajustables. Dos impulsos, tiempo de vuelo y desencuentro al arribar. Español, oscuro inicial, selector claro, teclado, tacto y movimiento reducido. HTML autónomos.

```sh
node episode-24-navigating-in-space/build.mjs
node --test episode-24-navigating-in-space/tests/model.test.mjs
node episode-24-navigating-in-space/build.mjs --audit
node laboratory/make-tests.mjs episode-24-navigating-in-space
node laboratory/scripts/drive.mjs episode-24-navigating-in-space/index.html --actions episode-24-navigating-in-space/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-24-navigating-in-space/index.html --actions episode-24-navigating-in-space/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-24-navigating-in-space/index.html --actions episode-24-navigating-in-space/tests/normal.json --width 1440 --height 1500
```

Las pruebas verifican los radios de salida y llegada, tangencias, ventana de lanzamiento y cambios de velocidad. Órbitas heliocéntricas circulares y coplanares, impulsos instantáneos; los brazos del dibujo se separan en altura por legibilidad. No se modelan escape, captura ni aterrizaje. Fuentes NASA/JPL y límites en `lesson.mjs`, piezas en `scene.mjs`, decisiones en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

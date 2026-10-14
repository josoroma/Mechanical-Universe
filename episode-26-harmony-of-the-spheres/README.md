# 26 · La armonía de las esferas

[Abrir el laboratorio](index.html). Español, oscuro predeterminado, tema claro, teclado, arrastre y movimiento reducido. Archivo autónomo, también disponible en `episode-26-dark.html`.

Selecciona un sólido para resaltarlo en la construcción de Kepler. Elige un planeta y modifica su excentricidad: seis cuerdas muestran una traducción ralentizada de sus velocidades angulares. La gráfica, las lecturas y el tono proceden del mismo modelo. «Escuchar planeta» activa una sonificación opcional; el sonido se silencia fuera de pantalla y en pestañas ocultas.

La anidación es una hipótesis histórica, no un modelo vigente de las distancias planetarias. Las proporciones entre velocidades dentro de cada órbita se conservan; cada afelio se normaliza a 220 Hz. El reloj compara fracciones de períodos diferentes, no posiciones en una fecha común. Los límites se explican en la página.

## Reconstrucción y comprobaciones

Desde la raíz de la colección:

```sh
node episode-26-harmony-of-the-spheres/build.mjs --audit
node --test episode-26-harmony-of-the-spheres/tests/model.test.mjs
node laboratory/scripts/drive.mjs episode-26-harmony-of-the-spheres/index.html --actions episode-26-harmony-of-the-spheres/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-26-harmony-of-the-spheres/index.html --actions episode-26-harmony-of-the-spheres/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-26-harmony-of-the-spheres/index.html --actions episode-26-harmony-of-the-spheres/tests/normal.json --width 1440 --height 1500
node laboratory/scripts/drive.mjs episode-26-harmony-of-the-spheres/index.html --actions episode-26-harmony-of-the-spheres/tests/audio.json --width 1440 --height 1600 --reduced
```

`concept.md` documenta el diseño. `polyhedra.mjs` contiene la geometría exacta, `model.mjs` el modelo puro y `scene.mjs` las piezas reales auditadas. Las fuentes primarias se enlazan al pie del laboratorio.

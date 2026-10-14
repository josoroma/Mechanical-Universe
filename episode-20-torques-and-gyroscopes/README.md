# Episodio 20 · Momentos de fuerza y giróscopos

Giróscopo de precisión en dos aros: giro propio, precesión y nutación. Selecciona liberación libre o precesión uniforme; ajusta el giro y la inclinación. Todas las cifras y las piezas proceden del mismo trompo pesado simétrico.

```sh
node episode-20-torques-and-gyroscopes/build.mjs
node --test episode-20-torques-and-gyroscopes/tests/model.test.mjs
node episode-20-torques-and-gyroscopes/build.mjs --audit
node laboratory/make-tests.mjs episode-20-torques-and-gyroscopes
node laboratory/scripts/drive.mjs episode-20-torques-and-gyroscopes/index.html --actions episode-20-torques-and-gyroscopes/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-20-torques-and-gyroscopes/index.html --actions episode-20-torques-and-gyroscopes/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-20-torques-and-gyroscopes/index.html --actions episode-20-torques-and-gyroscopes/tests/normal.json --width 1440 --height 1500
```

Español, tema oscuro inicial, selector claro, navegación al índice, teclado, tacto, pausa automática y movimiento reducido. HTML autónomos. Modelo y constantes en `model.mjs`; fuentes y límites en `lesson.mjs`; aparato en `scene.mjs`. Las pruebas verifican energía, momentos conservados, precesión uniforme y dL/dt = τ. Aros ideales sin masa ni rozamiento; reloj automático al 15 % de velocidad. Kit Anatomy MIT en `../laboratory/`.

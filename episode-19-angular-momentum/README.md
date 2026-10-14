# Episodio 19 · Momento angular

Plataforma con pesas de mano y rueda de bicicleta. Radio, giro de referencia y giro propio ajustables; reloj, gráfica, controles táctiles y teclado. Español, oscuro predeterminado y tema claro. HTML autónomos.

```sh
node episode-19-angular-momentum/build.mjs
node --test episode-19-angular-momentum/tests/model.test.mjs
node episode-19-angular-momentum/build.mjs --audit
node laboratory/make-tests.mjs episode-19-angular-momentum
node laboratory/scripts/drive.mjs episode-19-angular-momentum/index.html --actions episode-19-angular-momentum/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-19-angular-momentum/index.html --actions episode-19-angular-momentum/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-19-angular-momentum/index.html --actions episode-19-angular-momentum/tests/normal.json --width 1440 --height 1500
```

Las configuraciones de plataforma conservan L; la energía cambia por trabajo. La rueda usa la aproximación de precesión uniforme de giro rápido. No se simula el movimiento radial transitorio de las pesas ni la nutación. Fuentes y constantes en `lesson.mjs`; modelo puro en `model.mjs`, aparato en `scene.mjs`, piezas previstas en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

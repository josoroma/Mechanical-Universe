# 52 · El universo de la mecánica cuántica

[Abre el episodio](index.html). Contenido en español, tema oscuro predeterminado, tema claro, teclado, arrastre táctil y avance manual con movimiento reducido. HTML autónomo y fuentes editables.

Desde la raíz de la colección:

```sh
node episode-52-the-quantum-mechanical-universe/build.mjs --audit
node --test episode-52-the-quantum-mechanical-universe/tests/model.test.mjs
node laboratory/scripts/drive.mjs episode-52-the-quantum-mechanical-universe/index.html --actions episode-52-the-quantum-mechanical-universe/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-52-the-quantum-mechanical-universe/index.html --actions episode-52-the-quantum-mechanical-universe/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-52-the-quantum-mechanical-universe/index.html --actions episode-52-the-quantum-mechanical-universe/tests/normal.json --width 1440 --height 1500
```

El diseño y las piezas se documentan en concept.md; model.mjs contiene el modelo puro, scene.mjs la geometría real y lesson.mjs los textos y las fuentes. El registro comprueba las piezas y los cables dibujados, sin formas sustitutas ni sesgos de orden.

`tests/limits.json` recorre los cinco estados del pozo y tres regímenes de la barrera; comprueba que la onda termina en la pared móvil, que la superposición desplaza su densidad y que la dispersión conserva su densidad al avanzar la fase. El punto de medio periodo se comprueba con la tolerancia correspondiente al paso temporal de 0,05 fs del control. `tests/tiny-mobile.json` comprueba que una transmisión pequeña sigue siendo legible a 390 px, en ambos temas.

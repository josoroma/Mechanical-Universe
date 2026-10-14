# 45 · Laboratorio interactivo

[Abre el episodio](index.html). Contenido en español, tema oscuro predeterminado, tema claro, teclado, arrastre táctil y avance manual con movimiento reducido. HTML autónomo y fuentes editables.

Desde la raíz de la colección:

```sh
node episode-45-temperature-and-the-gas-law/build.mjs --audit
node --test episode-45-temperature-and-the-gas-law/tests/model.test.mjs
node laboratory/scripts/drive.mjs episode-45-temperature-and-the-gas-law/index.html --actions episode-45-temperature-and-the-gas-law/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-45-temperature-and-the-gas-law/index.html --actions episode-45-temperature-and-the-gas-law/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-45-temperature-and-the-gas-law/index.html --actions episode-45-temperature-and-the-gas-law/tests/normal.json --width 1440 --height 1500
```

El diseño y las piezas se documentan en concept.md; model.mjs contiene el modelo puro, scene.mjs la geometría real y lesson.mjs los textos y las fuentes. El registro comprueba las piezas y los cables dibujados, sin formas sustitutas ni sesgos de orden.

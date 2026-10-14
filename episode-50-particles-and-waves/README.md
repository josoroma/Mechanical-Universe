# 50 · Laboratorio interactivo

[Abre el episodio](index.html). Contenido en español, tema oscuro predeterminado, tema claro, teclado, arrastre táctil y avance manual con movimiento reducido. HTML autónomo y fuentes editables.

Desde la raíz de la colección:

```sh
node episode-50-particles-and-waves/build.mjs --audit
node --test episode-50-particles-and-waves/tests/model.test.mjs
node laboratory/scripts/drive.mjs episode-50-particles-and-waves/index.html --actions episode-50-particles-and-waves/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-50-particles-and-waves/index.html --actions episode-50-particles-and-waves/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-50-particles-and-waves/index.html --actions episode-50-particles-and-waves/tests/normal.json --width 1440 --height 1500
```

El diseño y las piezas se documentan en concept.md; model.mjs contiene el modelo puro, scene.mjs la geometría real y lesson.mjs los textos y las fuentes. El registro comprueba las piezas y los cables dibujados, sin formas sustitutas ni sesgos de orden.

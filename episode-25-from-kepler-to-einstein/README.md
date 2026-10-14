# Episodio 25 · De Kepler a Einstein


Comparador de órbita newtoniana aislada y avance secular relativista de Mercurio. Excentricidad y ampliación visual ajustables; medidas reales separadas de la orientación amplificada. Español, oscuro inicial, selector claro, teclado, tacto y movimiento reducido. HTML autónomos.

```sh
node episode-25-from-kepler-to-einstein/build.mjs
node --test episode-25-from-kepler-to-einstein/tests/model.test.mjs
node episode-25-from-kepler-to-einstein/build.mjs --audit
node laboratory/make-tests.mjs episode-25-from-kepler-to-einstein
node laboratory/scripts/drive.mjs episode-25-from-kepler-to-einstein/index.html --actions episode-25-from-kepler-to-einstein/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-25-from-kepler-to-einstein/index.html --actions episode-25-from-kepler-to-einstein/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-25-from-kepler-to-einstein/index.html --actions episode-25-from-kepler-to-einstein/tests/normal.json --width 1440 --height 1500
```

Las pruebas verifican el período de Mercurio, aproximadamente 42,98 segundos de arco por siglo de contribución relativista, cierre newtoniano y separación entre medidas reales y ampliación visual. Modelo secular de primer orden; no integra geodésicas ni perturbaciones planetarias. Fuentes NASA/JPL, Einstein Online y Tevian Dray en `lesson.mjs`; piezas en `scene.mjs`, decisiones en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

# Episodio 23 · Energía y excentricidad


Tres pistas orbitales con el mismo momento angular y distintas energías, perfil de potencial efectivo, palpador guiado y barra de energía. Excentricidad y parámetro orbital ajustables; reloj común. Español, oscuro inicial, selector claro, teclado, tacto y movimiento reducido. HTML autónomos.

```sh
node episode-23-energy-and-eccentricity/build.mjs
node --test episode-23-energy-and-eccentricity/tests/model.test.mjs
node episode-23-energy-and-eccentricity/build.mjs --audit
node laboratory/make-tests.mjs episode-23-energy-and-eccentricity
node laboratory/scripts/drive.mjs episode-23-energy-and-eccentricity/index.html --actions episode-23-energy-and-eccentricity/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-23-energy-and-eccentricity/index.html --actions episode-23-energy-and-eccentricity/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-23-energy-and-eccentricity/index.html --actions episode-23-energy-and-eccentricity/tests/normal.json --width 1440 --height 1500
```

Las pruebas verifican la relación entre energía, excentricidad y momento angular; la energía cinética radial y los radios extremos. El perfil usa radio r/p y energía dividida por μ/p. El palpador está guiado: no simula una bola bajo gravedad terrestre. A semieje mayor fijo la energía no cambia con e; este banco compara órbitas a h fijo. Fuentes y límites en `lesson.mjs`, piezas en `scene.mjs`, decisiones en `concept.md`. Kit Anatomy MIT en `../laboratory/`.

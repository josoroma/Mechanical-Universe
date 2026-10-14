# Episodio 18 · Ondas

Dos bancos de ondas: cuerda transversal y cadena longitudinal de carros y muelles. Ajusta la frecuencia, la tensión y la rigidez; sigue una muestra de cada medio y compara sus longitudes de onda. Interfaz en español, tema oscuro inicial, selector claro, teclado, tacto y movimiento reducido. Los HTML funcionan sin conexión.

Desde la raíz de la colección:

```sh
node episode-18-waves/build.mjs
node --test episode-18-waves/tests/model.test.mjs
node episode-18-waves/build.mjs --audit
node laboratory/scripts/drive.mjs episode-18-waves/index.html --actions episode-18-waves/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-18-waves/index.html --actions episode-18-waves/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-18-waves/index.html --actions episode-18-waves/tests/normal.json --width 1440 --height 1500
```

El modelo puro está en `model.mjs`; las piezas, en `scene.mjs`; el contenido, en `lesson.mjs`. El kit Anatomy MIT y las herramientas están en `../laboratory/`.

La cuerda ideal usa c = √(T/μ). La cadena usa la relación de dispersión discreta exacta de masas y muelles; su rapidez de fase depende de la frecuencia. Se representa una onda viajera sin reflexiones, con escalas visuales distintas para los dos desplazamientos. Las guías y los carros son un modelo mecánico de las muestras, no partículas que viajan con la onda.

Fuentes: [OpenStax, ondas viajeras](https://openstax.org/books/university-physics-volume-1/pages/16-1-traveling-waves), [rapidez en una cuerda](https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string), [MIT OCW, Physics of Waves](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/ef731c1b91d77a6db003f6c27e300d25_MIT8_03SCF16_Textbook.pdf).

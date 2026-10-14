# Episodio 17 · Resonancia

Abre `index.html`: carro con resorte, excitadores electromagnéticos y generador graduado. Ajusta la frecuencia, la fuerza y el amortiguamiento; compara el crecimiento desde el reposo con la amplitud final prevista. El reloj se puede arrastrar y avanzar por pasos. El aparato responde al puntero y al teclado, se pausa fuera de pantalla y respeta el movimiento reducido.

La interfaz está en español y comienza en tema oscuro. El botón de tema permite usar la versión clara; `episode-17-dark.html` es una ruta compatible. Los dos HTML son autónomos y funcionan sin conexión.

Desde la raíz de la colección:

```sh
node episode-17-resonance/build.mjs
node --test episode-17-resonance/tests/model.test.mjs
node episode-17-resonance/build.mjs --audit
node laboratory/scripts/drive.mjs episode-17-resonance/index.html --actions episode-17-resonance/tests/browser.json --width 1440 --height 1600 --reduced
node laboratory/scripts/drive.mjs episode-17-resonance/index.html --actions episode-17-resonance/tests/mobile.json --width 390 --height 1500 --reduced
node laboratory/scripts/drive.mjs episode-17-resonance/index.html --actions episode-17-resonance/tests/normal.json --width 1440 --height 1500
```

`model.mjs` contiene la solución analítica; `scene.mjs`, el instrumento; `lesson.mjs`, el contenido y los controles; `concept.md`, las piezas y los límites del modelo. El código común y el kit Anatomy con licencia MIT están copiados dentro de `../laboratory/`. Los generadores también usan el tema compartido de la colección.

La fuerza se prescribe como sinusoidal. No se modela el circuito ni la dependencia del campo magnético con la distancia. La curva muestra la amplitud estacionaria, no el desplazamiento instantáneo.

Referencia: [OpenStax, Oscilaciones forzadas](https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations). La frecuencia exacta del máximo de desplazamiento con amortiguamiento se obtiene al minimizar el denominador de la respuesta del modelo.

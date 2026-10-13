# Episodio 14 · Energía potencial

Explicación interactiva y autónoma, en español, de un pozo gravitatorio y su analogía con un resorte. Abre `index.html` directamente en un navegador; `episode-14-dark.html` abre el tema oscuro. Ambos archivos contienen el SVG, los estilos y el código necesarios y funcionan sin conexión.

Dos bolas de igual masa y radio, una maciza y una hueca, ruedan por canales independientes. Un carro unido a un resorte permite comparar el potencial elástico con el gravitatorio. Puedes elegir la amplitud y el lado de liberación, duplicar la rigidez del resorte, soltar, pausar y avanzar en pasos de 0,10 s. Las lecturas separan energía potencial, cinética de traslación y cinética de rotación; la gráfica y un cuaderno de tres observaciones siguen al experimento.

El teclado y el arrastre ajustan la amplitud. La demostración se pausa al señalar o enfocar el laboratorio; el reloj se detiene fuera de pantalla y con la pestaña oculta. Con movimiento reducido, la exploración avanza manualmente y los cambios de parámetros son instantáneos. La interfaz se adapta a móviles de 390 px.

## Modelo físico

- Masa de cada cuerpo: 0,100 kg; radio de las bolas: 0,040 m; g = 9,80665 m/s².
- Altura del centro de masa respecto al mínimo: h(x) = x²/(2R), con R = 0,80 m. El perfil de apoyo es una aproximación por planos tangentes de la superficie desplazada un radio respecto a esa trayectoria.
- Rodadura sin deslizamiento: I = βmr², con β = 2/5 para la esfera maciza y β = 2/3 para la cáscara esférica delgada. K = ½m(1 + β)[1 + (x/R)²]ẋ².
- La ecuación ẍ = −[xẋ²/R² + gx/(R(1 + β))]/[1 + (x/R)²] se integra mediante RK4 con pasos de hasta 1/240 s. El giro se integra con ω = v/r.
- El carro se mueve horizontalmente: U = ½kx² y x(t) = ±A cos(√(k/m)t). k = mg/R o 2mg/R. En el primer caso, su potencial coincide con el de las bolas para un mismo x; sus dinámicas difieren por la trayectoria curva y la rotación.
- Cada sistema conserva su propia energía; no se suman las energías de los tres aparatos. No hay disipación, resistencia del aire ni choques. Se supone suficiente rozamiento estático para la rodadura. El banco del resorte usa una escala visual distinta de la de los canales.

La energía gravitatoria pertenece al sistema bola–Tierra. El cero de cada potencial se elige en su mínimo. La estabilidad del equilibrio no implica que el movimiento se amortigüe.

## Fuentes y construcción

`concept.md` define la analogía y las piezas antes de la geometría. `model.mjs` contiene la física; `scene.mjs` construye las piezas y el resorte; `painter.mjs` establece el orden de pintado a partir de los sólidos reales. `page.html`, `styles.css`, `materials.css` y `live.js` forman la interfaz. `build.mjs` genera los dos HTML autónomos.

El kit Anatomy se conserva localmente en `kit/`, con licencia MIT en `LICENSE`. La escena contiene 236 piezas registradas y una ruta de resorte. Las piezas fijas se construyen una vez; el carro se traslada y se actualizan los atributos de las bolas y del resorte sin recrear el DOM en cada fotograma.

Referencias físicas: OpenStax, *University Physics, Volume 1*: [diagramas de potencial y estabilidad](https://openstax.org/books/university-physics-volume-1/pages/8-4-potential-energy-diagrams-and-stability), [rodadura y energía](https://openstax.org/books/university-physics-volume-1/pages/11-1-rolling-motion), [momentos de inercia](https://openstax.org/books/university-physics-volume-1/pages/10-5-calculating-moments-of-inertia).

## Reproducir y verificar

Con Node.js 22 o posterior, desde esta carpeta:

```sh
node build.mjs --audit
node tests/model.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1700 --reduced
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/normal.json --width 1440 --height 1700
```

La auditoría registra los sólidos y la ruta reales en nueve instantes entre 0 y 2 s, con amplitud máxima, mediante `A.settle` y `A.auditOrExit`. Comprueba soportes, penetraciones, extremos, auto-intersecciones y orden de pintado. Las pruebas del modelo verifican conservación de energía durante 40 s, simetría, equilibrio, reparto rotacional, analogía elástica y 81 estados geométricos. Las pruebas de navegador revisan teclado, arrastre, cuaderno, temas, adaptación móvil, pausas del reloj y extremos de líneas; generan vistas ampliadas a 4× y hojas de movimiento en `shots/`, excluida de Git.

`scripts/drive.mjs` requiere Chrome o Chromium local; admite la variable `CHROME_PATH`. Para reconstruir los HTML sin repetir la auditoría, ejecuta `node build.mjs`.

# Episodio 4 · Inercia

Abre `index.html` en el navegador. Es un HTML autónomo con la ilustración SVG, los estilos y el programa incluidos: funciona sin conexión, sin paquetes y sin servidor. `episode-4-dark.html` abre directamente el tema oscuro; ambas versiones permiten alternar entre claro y oscuro. Todo el contenido, los controles y las ayudas están en español, con coma decimal en las lecturas.

## Explorar

- Compara **En reposo**, **Velocidad constante** y **Arrancar y frenar**.
- Cambia entre **Desde el suelo** y **A bordo del carro**. La segunda vista acompaña al carro: el suelo se desplaza y el péndulo conserva exactamente su movimiento relativo.
- Ajusta la velocidad de la marcha uniforme, la aceleración de la maniobra y la longitud del péndulo.
- Arrastra horizontalmente la ilustración o mueve el deslizador de tiempo para examinar cualquier instante.
- Selecciona **Arranque**, **Marcha**, **Frenado** o **Detenido** para detenerte en una fase de la maniobra.
- Reproduce, pausa, repite o vuelve al comienzo. La demostración inicial alterna los tres experimentos hasta la primera interacción.

Con el foco en el instrumento: **1**, **2** y **3** cambian de experimento; **espacio** reproduce o pausa; las **flechas** recorren el tiempo; **Inicio** y **Fin** seleccionan los extremos; **R** vuelve al comienzo; **V** alterna las vistas. Todos los controles admiten navegación con Tab. La preferencia de movimiento reducido deja el aparato quieto y convierte **Avanzar** en un paso de medio segundo. La animación se suspende fuera de pantalla y al ocultar la pestaña.

## Física y alcance

El péndulo comienza vertical y sin velocidad angular respecto al carro. En el experimento uniforme, el conjunto ya se mueve al comenzar: no se simula un arranque instantáneo oculto. En la maniobra, el carro acelera de 0 a 1 s, mantiene su velocidad de 1 a 2 s, frena de 2 a 3 s y permanece detenido de 3 a 6 s. La posición y la velocidad son continuas; los saltos de aceleración son ideales.

La respuesta angular se integra con Runge–Kutta de cuarto orden a 240 pasos por segundo:

```text
θ″ = −(g sen θ + a cos θ)/L − γθ′
g = 9,80665 m/s²; γ = 0,30 s⁻¹
θ de equilibrio = −arctan(a/g)
```

El ángulo de equilibrio se distingue de la inclinación instantánea: un péndulo puede seguir oscilando aunque la aceleración del carro sea cero. El modelo trata la esfera como una masa puntual y la varilla como rígida y sin masa. No calcula las fuerzas de accionamiento, la fricción de las ruedas ni las tolerancias de un mecanismo real. Las ruedas giran según la distancia recorrida y su radio, sin deslizamiento. La masa de la esfera no aparece en la ecuación angular.

El aparato es una interpretación didáctica original del argumento del barco, no una reconstrucción de un instrumento histórico de Galileo.

## Fuentes editables y construcción

- `concept.md`: concepto, piezas y criterios escritos antes de dibujar.
- `model.mjs`: cinemática, ecuación del péndulo e integración numérica.
- `scene.mjs`: 86 piezas tridimensionales con proyección isométrica.
- `live.js`: animación, observadores, controles y accesibilidad.
- `styles.css`: composición adaptable y materiales en ambos temas.
- `build.mjs`: construcción reproducible de los dos HTML autónomos.
- `audit.mjs`: registro de los sólidos reales y restricciones de profundidad medidas en 24 posiciones.
- `kit/`, `scripts/`: herramientas locales de dibujo, auditoría y navegador.

Desde esta carpeta, con Node.js 22 o posterior:

```sh
node build.mjs
node --test tests/model.test.mjs
node build.mjs --audit
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/idle.json --width 1440 --height 1300
```

Las comprobaciones del navegador requieren Chrome o Chromium; abrir el episodio no lo requiere. `shots/` contiene capturas y registros de verificación.

## Verificación

Las nueve pruebas del modelo comprueban continuidad y derivadas de la trayectoria, equilibrio en reposo y movimiento uniforme, inclinación bajo aceleración, persistencia de las oscilaciones, conservación de energía sin amortiguamiento, disipación con amortiguamiento, convergencia numérica, invariancia al cambiar de observador, longitud del péndulo y rodadura.

La auditoría geométrica revisa nueve posiciones del carro y del péndulo, incluidas las longitudes extremas: contactos, apoyos, penetraciones y orden de pintura. Las comprobaciones del navegador cubren modos, parámetros, fases, vistas, teclado, arrastre, pausa fuera de pantalla, pestaña oculta, movimiento reducido, reproducción completa y recorrido inicial. Se revisan los extremos de las líneas en ambos temas, las capturas de escritorio y teléfono, las uniones ampliadas cuatro veces y varios instantes de movimiento.

Referencias: [Universidad de Pittsburgh, el barco de Galileo](https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/origins/index.html), [OpenStax, primera ley de Newton](https://openstax.org/books/university-physics-volume-1/pages/5-2-newtons-first-law) y [OpenStax, péndulos](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums). La licencia de Anatomy y sus herramientas se conserva en `LICENSE`.

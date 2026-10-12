# Episodio 3 · Derivadas

Abre `index.html` en el navegador. El analizador de pendientes es un HTML autónomo: incluye la ilustración SVG, los estilos y el programa. Funciona sin conexión, sin instalar paquetes ni levantar un servidor. `episode-3-dark.html` abre directamente el tema oscuro; ambas versiones permiten alternar el tema.

## Explorar

- Compara la **secante**, que mide el cambio medio entre dos puntos, con la **tangente**, que muestra la derivada exacta.
- Intercambia los perfiles **Parábola**, **Onda** y **Cúbica**.
- Mueve el palpador con el deslizador de posición o arrastra horizontalmente el instrumento.
- Reduce **Δx** o selecciona una fila de la tabla para explorar el límite.
- Usa **Baja**, **Se aplana** y **Sube** para detenerte en tres puntos de la parábola.
- Pausa o activa el recorrido automático. La demostración cambia de modo y perfil hasta la primera interacción con el instrumento.

La esfera plateada señala el punto x y la cobriza señala x + Δx en una franja paralela del mismo perfil. La regla reproduce la pendiente elegida. Su ángulo es arctan(m); las escalas horizontal y vertical son iguales. La tangente usa derivadas analíticas y nunca evalúa 0/0. El mínimo incremento mostrado es 0,02; el límite exacto se distingue de esa aproximación finita.

Todo el contenido y las ayudas están en español. Los números visibles usan coma decimal; las diferencias pequeñas muestran hasta seis decimales. La onda usa radianes.

## Teclado y accesibilidad

Con el foco en el instrumento: **1** y **2** cambian de modo; **espacio** reproduce o pausa; las **flechas** mueven el palpador; **Inicio** y **Fin** recorren los extremos; **R** restablece el instrumento. Todos los controles admiten navegación con Tab.

Con movimiento reducido, la máquina permanece quieta y **Avanzar** mueve el palpador un paso. La animación se suspende al salir de pantalla o al ocultar la pestaña. La vista de teléfono coloca los controles de posición inmediatamente después del instrumento.

## Fuentes editables y construcción

- `concept.md`: concepto, piezas y criterios de verificación, escritos antes de la geometría.
- `model.mjs`: funciones, derivadas, secantes y tabla de convergencia.
- `scene.mjs`: 81 piezas con geometría tridimensional y proyección isométrica.
- `live.js`: controles, animación y accesibilidad.
- `styles.css`: presentación y materiales de ambos temas.
- `build.mjs`: construcción reproducible de los dos HTML.
- `audit.mjs`: registro de sólidos reales y cálculo del orden de pintura mediante restricciones de profundidad de 31 posiciones.
- `kit/` y `scripts/`: herramientas locales para construir, auditar y comprobar en Chrome.

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

Las comprobaciones del navegador requieren Chrome o Chromium. No se necesitan para abrir el episodio. Las capturas y los registros se guardan en `shots/`.

## Verificación y alcance

Siete pruebas comprueban las derivadas con diferencias centrales independientes, las secantes con las alturas de sus extremos, los límites por ambos lados, los signos, la inflexión de la cúbica, la tabla, el ángulo de la regla, el contacto de las esferas y el formato numérico. La auditoría examina nueve posiciones de los tres perfiles: apoyos, penetraciones, cobertura y orden de pintura. El perfil usa un contorno cóncavo real; no se sustituye por una envolvente convexa. Los centros de las esferas se desplazan por la normal a la curva, a una distancia igual al radio.

Es una interpretación didáctica original. Representa las relaciones matemáticas, sin simular las fuerzas, la fricción ni la tolerancia de un mecanismo real.

Referencia matemática: [OpenStax, definición de la derivada](https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative). La licencia de Anatomy y de las herramientas incluidas se conserva en `LICENSE`.

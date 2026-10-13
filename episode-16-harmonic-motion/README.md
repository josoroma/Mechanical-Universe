# Episodio 16 · Movimiento armónico

Un sistema masa–resorte y un péndulo simple, uno junto al otro, con un retrato de fase interactivo. Todo el contenido está en español. Abre `index.html` directamente en un navegador; `episode-16-dark.html` inicia el tema oscuro. Ambos HTML contienen SVG, estilos y JavaScript y funcionan sin conexión ni servidor.

## Experimentar

Elige la amplitud angular del péndulo, la masa del carro y la longitud del hilo. Puedes comparar el péndulo con seno completo y la aproximación de ángulo pequeño. Las configuraciones de referencia, amplitud grande y modelo armónico ayudan a reconocer cuándo coinciden los ritmos. Suelta ambos, pausa, restablece o avanza de 0,10 s en 0,10 s.

Cada aparato tiene lecturas de posición, velocidad, período y energías. El retrato de fase superpone curvas de energía normalizadas y marcadores del mismo instante. Su control permite explorar el primer ciclo del resorte: pausa el reloj y elige un tiempo entre 0 y 359/360 de su período. No asigna al péndulo una fase armónica ficticia: calcula su estado real en ese mismo tiempo.

El cuaderno guarda hasta tres observaciones manuales. **Comparar tres instantes** registra el inicio, un cuarto de período del resorte y medio período. Explorar la fase conserva el cuaderno; cambiar un parámetro lo vacía.

Arrastrar la maqueta cambia el ángulo inicial. Las flechas cambian 1°; con Mayús, 5°. Inicio y Fin eligen 0° y 45°. Espacio pausa o reanuda; con movimiento reducido avanza un paso. La demostración se pausa al señalar o enfocar el banco o el retrato. El reloj funciona mientras alguna de las dos vistas está en pantalla y se detiene cuando ambas quedan fuera o la pestaña se oculta. Con movimiento reducido no hay reproducción automática ni transiciones. La interfaz se adapta a pantallas de 390 px.

## Modelo físico

### Masa–resorte

k = 1,96133 N/m, amplitud fija A = 0,120 m y masa m = 0,100, 0,200 o 0,400 kg. El carro se suelta desde el reposo:

```text
ωs = √(k/m)
x(t) = A cos(ωst)
v(t) = −Aωs sen(ωst)
Ts = 2π/ωs
U = ½kx²; K = ½mv²
```

La masa incluye el carro y los lastres. El resorte no tiene masa ni pérdidas. Las guías son ideales y no hay rozamiento.

### Péndulo

Masa puntual de 0,200 kg, longitud L = 0,60, 1,00 o 1,40 m medida desde el pivote al centro de la esfera, amplitud θ₀ de 0° a 45° y g = 9,80665 m/s².

```text
θ̈ = −(g/L) sen θ
U = mgL(1 − cos θ); K = ½mL²θ̇²
ω₀ = √(g/L); T₀ = 2π/ω₀
T = 4√(L/g) Kcompleta(sen(θ₀/2))
```

El movimiento exacto se integra por RK4 en pasos máximos de 1/240 s. La integral elíptica completa se calcula mediante la media aritmético-geométrica; las pruebas la contrastan con una cuadratura de Simpson independiente. A 45°, T/T₀ ≈ 1,03997. El período crece con la amplitud.

La aproximación opcional usa θ̈ = −(g/L)θ, con solución analítica θ = θ₀ cos(ω₀t). En ese modelo, Uaprox = ½mgLθ²; se muestra y conserva su propio balance, sin mezclarlo con la energía exacta. Con amplitudes grandes, se indica que el modelo lineal pierde precisión.

Con m = 0,200 kg y L = 1,00 m, ωs = ω₀. Los modelos armónicos normalizados evolucionan juntos; el péndulo exacto tarda algo más. Con θ₀ = 0, el péndulo permanece en equilibrio, su marcador es un punto y su período se muestra como «—». T₀ conserva su significado como límite de pequeñas oscilaciones. El carro continúa oscilando.

### Retrato y alcance

El resorte usa (q, u) = (x/A, v/(ωsA)); el péndulo usa (θ/θ₀, θ̇/(ω₀θ₀)). u es velocidad normalizada, no cantidad de movimiento. Las órbitas se obtienen de la energía de cada modelo y los marcadores proceden de su estado dinámico. En equilibrio se evita dividir entre cero. Las energías de los dos aparatos no se suman.

La maqueta es esquemática: el banco del resorte usa 200 unidades por metro y el péndulo, 80. El radio dibujado de la esfera y los lastres no determinan la inercia del modelo puntual. Se omiten amortiguamiento, resistencia del aire, fuerza motriz y choques. El hilo permanece tenso en las amplitudes permitidas.

## Fuente editable

- `concept.md`: idea y piezas, definidas antes de dibujar.
- `model.mjs`: oscilador analítico, péndulo exacto y lineal, energía, períodos y órbitas.
- `scene.mjs`: carro, resorte, soporte en voladizo, hilo y esfera.
- `painter.mjs`, `audit.mjs`, `kit/`: sólidos reales, orden de pintado y comprobaciones.
- `page.html`, `styles.css`, `materials.css`, `live.js`: interfaz y comportamiento.
- `build.mjs`: genera los dos HTML autónomos.
- `tests/`, `scripts/`: comprobaciones reproducibles.

La escena inicial contiene 84 piezas y dos rutas, resorte e hilo; según los lastres contiene entre 82 y 88 piezas. Las geometrías fijas y el carro se calculan una vez por configuración. Durante el movimiento se trasladan carro y esfera y se actualizan los atributos SVG del resorte y el hilo. La esfera utiliza el contorno de `G.sphereOf` con sombreado continuo. El DOM se reconstruye al preparar un estado; no en cada fotograma.

## Reconstruir y verificar

Con Node.js 22 o posterior, desde esta carpeta:

```sh
node build.mjs --audit
node tests/model.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1700 --reduced
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/normal.json --width 1440 --height 1700
```

La auditoría registra los sólidos y las dos rutas reales mediante `A.settle` y `A.auditOrExit`. Revisa 13 estados, incluidas longitudes mínima y máxima, amplitud de 45°, ambos lados, cruces por el equilibrio y resorte comprimido. Las pruebas del modelo verifican 72 configuraciones físicas y 162 estados geométricos: conservación de energía durante 40 s, períodos, retornos, equivalencia armónica, órbitas, continuidad del paso y contactos de hilo y resorte.

Las pruebas de navegador revisan fases, cuaderno, aproximación lineal, equilibrio, teclado, arrastre, temas, adaptación móvil y pausas del reloj. Comprueban extremos de líneas en varios estados y generan vistas de uniones a 4× en ambos temas y hojas de movimiento. Requieren Chrome o Chromium; `CHROME_PATH` permite indicar su ubicación. Las capturas quedan en `shots/`, excluida de Git. Para reconstruir sin repetir la auditoría: `node build.mjs`.

## Fuentes

- [OpenStax · movimiento armónico simple](https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion).
- [OpenStax · péndulos](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums).
- [NIST DLMF · péndulo e integrales elípticas](https://dlmf.nist.gov/22.19).

El kit Anatomy conserva su licencia MIT en `LICENSE`, incluida también en los HTML generados.

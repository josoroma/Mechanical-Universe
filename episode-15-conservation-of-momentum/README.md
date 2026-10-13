# Episodio 15 · Conservación de la cantidad de movimiento

Carril de aire interactivo con deslizadores y topes de resorte. Todo el contenido está en español. Abre `index.html` directamente en un navegador; `episode-15-dark.html` inicia el tema oscuro. Ambos HTML integran SVG, estilos y JavaScript y funcionan sin conexión ni servidor.

## Experimentar

Elige la masa de B y las velocidades iniciales. Las configuraciones de ejemplo preparan masas iguales, B más pesado o un choque frontal. Lanza los deslizadores, pausa o avanza de 0,05 s en 0,05 s. Las lecturas muestran velocidad y cantidad de movimiento con signo, fuerzas opuestas, impulsos y energía cinética y elástica.

La gráfica compara pA, pB y su suma a lo largo de toda la prueba. **Comparar el choque** guarda tres muestras analíticas: antes del contacto, compresión máxima y después de la separación. **Guardar instante** permite elegir hasta tres muestras manualmente. Cambiar un parámetro vacía el cuaderno y prepara otra prueba.

Arrastrar horizontalmente la maqueta cambia la velocidad inicial de A. Las flechas cambian 0,05 m/s; con Mayús, 0,10 m/s. Inicio y Fin eligen los extremos. Espacio pausa o reanuda; con movimiento reducido avanza un paso. El selector de ritmo cambia la reproducción sin alterar el tiempo físico mostrado.

La demostración se repite tras llegar al final del tramo observado, con una transición de opacidad. Se pausa al señalar o enfocar el laboratorio. El reloj se detiene fuera de pantalla y con la pestaña oculta. Con movimiento reducido no hay animación ni reproducción automática. La interfaz se adapta a pantallas de 390 px.

## Modelo y límites

Los centros parten de xA = −0,50 m y xB = +0,35 m. mA = 0,200 kg; mB = 0,100, 0,200 o 0,400 kg. La separación al primer contacto es D = 0,432 m, incluidos cuerpos y topes. Cada resorte sin masa tiene k = 32 N/m; los dos resortes en serie equivalen a keq = 16 N/m.

Con M = mA + mB, μ = mAmB/M y w = vA₀ − vB₀:

```text
V = (mAvA₀ + mBvB₀)/M
X(t) = X₀ + Vt
ω = √(keq/μ)
δ(τ) = (w/ω) sen(ωτ), 0 ≤ τ ≤ π/ω
d = D − δ
xA = X − (mB/M)d; xB = X + (mA/M)d
vA = V + (mB/M)w cos(ωτ)
vB = V − (mA/M)w cos(ωτ)
FA = −keqδ; FB = +keqδ
U = ½keqδ²
```

τ se mide desde el primer contacto. Cada resorte se comprime δ/2; U es la energía elástica de ambos. Antes y después del contacto se usa movimiento uniforme. La solución analítica conserva pA + pB y KA + KB + U durante todo el choque; no sustituye el contacto por un salto instantáneo de velocidades. En la compresión máxima ambos cuerpos tienen la velocidad del centro de masa, que puede ser distinta de cero.

Se supone un carril horizontal sin rozamiento ni resistencia del aire, resortes sin masa ni pérdidas y deslizadores guiados sin giro. La maqueta usa una escala común de 200 unidades por metro; perforaciones, alimentación, lastres y cojín de aire son esquemáticos. El patín queda 0,1 unidades sobre la superficie del carril, como representación de una película de aire muy fina.

El reloj termina cuando un centro alcanza ±1,10 m, antes de los topes físicos. No se simulan choques con esos topes ni impulsos externos. Algunas velocidades no producen encuentro dentro del tramo observado; la interfaz lo indica. El aparato simula colisiones elásticas; conservar la cantidad de movimiento también se aplica a colisiones inelásticas si el impulso externo neto es nulo.

## Fuente editable y construcción

- `concept.md`: concepto y piezas, definidos antes de dibujar.
- `model.mjs`: solución del contacto, fuerzas, impulsos y límite de observación.
- `scene.mjs`: carril triangular, deslizadores, lastres, resortes y alimentación de aire.
- `painter.mjs`, `audit.mjs`, `kit/`: sólidos reales, orden de pintado y comprobaciones geométricas.
- `page.html`, `styles.css`, `materials.css`, `live.js`: interfaz y comportamiento.
- `build.mjs`: genera los dos HTML autónomos.
- `tests/`, `scripts/`: pruebas y revisión de navegador reproducibles.

La escena inicial contiene 125 piezas y tres rutas: una manguera y dos resortes. Según los lastres de B, contiene entre 123 y 129 piezas. Las geometrías fijas y los deslizadores se calculan una vez por configuración. Durante el movimiento se trasladan los cuerpos y las cabezas de los topes y se actualizan los atributos de los resortes. El DOM de la maqueta se reconstruye únicamente al preparar una nueva prueba; no en cada fotograma.

## Reconstruir y verificar

Con Node.js 22 o posterior, desde esta carpeta:

```sh
node build.mjs --audit
node tests/model.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1700 --reduced
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/normal.json --width 1440 --height 1700
node scripts/drive.mjs index.html --actions tests/compressed.json --width 1440 --height 1700 --reduced
```

La auditoría registra los sólidos dibujados y las tres rutas reales mediante `A.settle` y `A.auditOrExit`. Revisa 14 estados: estado inicial, primer contacto, compresión, expansión, separación y final del tramo, tanto en la configuración predeterminada como con masa y aproximación máximas. Las pruebas verifican 117 combinaciones físicas y 129 estados geométricos, conservación, continuidad, impulsos opuestos, velocidades finales, contacto entre cabezas y límite de recorrido.

Las pruebas de navegador comprueban teclado, arrastre, selectores, cuaderno, temas, adaptación móvil, pausas por visibilidad y repetición automática. También revisan extremos de líneas en varios estados y generan vistas a 4× de topes extendidos y comprimidos, además de hojas de movimiento. Requieren Chrome o Chromium; `CHROME_PATH` permite indicar su ubicación. Las capturas de `shots/` están excluidas de Git. Para reconstruir sin repetir la auditoría: `node build.mjs`.

## Fuentes

- [OpenStax · colisiones elásticas en una dimensión](https://openstax.org/books/college-physics/pages/8-4-elastic-collisions-in-one-dimension).
- [OpenStax · tipos de colisiones](https://openstax.org/books/university-physics-volume-1/pages/9-4-types-of-collisions).
- [Universidad de Iowa · demostración con carril de aire](https://instructional-resources.physics.uiowa.edu/1n3030-elastic-inelastic-collision-solids-air-track).

El kit Anatomy conserva su licencia MIT en `LICENSE`, incluida también en los HTML generados.

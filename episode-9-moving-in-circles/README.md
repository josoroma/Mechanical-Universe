# Episodio 9 · Movimiento circular

Abre [index.html](index.html) directamente en un navegador. Todo el contenido está en español. La página es autónoma: no necesita servidor, red ni paquetes de npm. [episode-9-dark.html](episode-9-dark.html) abre el tema oscuro; ambas páginas permiten cambiar el tema.

El péndulo cónico permite variar el ángulo y la masa. La plataforma permite ajustar giro, radio y masa. El indicador y las lecturas proceden del mismo modelo que mueve las piezas. Las comparaciones muestran el efecto de duplicar la masa o el giro.

Arrastra la maqueta o usa el control de posición angular. Con el foco en la maqueta: ←/→ recorren 5° (15° con Mayúsculas), Inicio/Fin van a los extremos, espacio pausa o continúa y R restablece el experimento. El ritmo visual no cambia las magnitudes físicas. La demostración automática recorre ambos aparatos hasta que interactúas; se detiene al pasar el puntero por el instrumento. La animación se suspende fuera de la pantalla y en pestañas ocultas. Con movimiento reducido, «Avanzar» recorre 15° por pulsación.

## Reconstrucción y comprobación

Node.js 22 o posterior; Chrome/Chromium para las comprobaciones del navegador. Si no se detecta, define `CHROME_PATH` con la ruta del ejecutable.

```sh
cd mechanical-universe/episode-9-moving-in-circles
node build.mjs --audit
node --test tests/model.test.mjs
node tests/geometry.mjs
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs episode-9-dark.html --actions tests/browser-dark.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 1100
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
```

`model.mjs` contiene las ecuaciones; `scene.mjs`, las 56 piezas; `painter.mjs`, el orden de pintura mediante planos separadores de los sólidos reales; `live.js`, la interacción. `build.mjs` incorpora los módulos, estilos e ilustración en ambos HTML. `audit.mjs` registra las mismas formas geométricas y verifica soporte, contactos, penetraciones, cobertura y profundidad. `kit/` y `scripts/` incluyen las dependencias locales necesarias. `shots/` conserva las capturas de revisión.

Comprobación realizada: cinco pruebas del modelo superadas; orden de dibujo verificado en 2160 posiciones; auditoría completa sin fallos en 16 poses extremas y en la pose inicial. Los 68 controles de extremos de línea dieron cero líneas sueltas. Se revisaron escritorio, móvil de 390 px, ambos temas y uniones a 4×. Las pruebas de teclado, arrastre, comparaciones, reposo, movimiento reducido, suspensión al ocultarse y animación terminaron con la consola limpia. Los registros están en `tests/*.log`.

## Modelo

Se preparan regímenes circulares uniformes, sin simular sus transiciones. Péndulo ideal: longitud efectiva de 1 m, gravedad de 9,81 m/s², ángulo desde la vertical; `r = L sen θ`, `ω² = g / (L cos θ)`, `T cos θ = mg`, `T sen θ = mω²r`. La plataforma inferior es una referencia visual en este modo. Plataforma ideal: masa sobre una superficie horizontal sin rozamiento; un hilo radial proporciona `F = mω²r`, mientras la fuerza normal equilibra el peso. En reposo, velocidad y fuerza centrípeta son nulas y el período no está definido. La masa dibujada está ampliada y conserva su tamaño al cambiar su valor.

Fuentes: [OpenStax · fuerza centrípeta](https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-force), [Universidad de Texas · péndulo cónico](https://farside.ph.utexas.edu/teaching/301/lectures/node88.html). Implementación e ilustración originales; kit Anatomy bajo licencia MIT, incluida en `LICENSE`.

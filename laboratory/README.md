# Herramientas de los nuevos instrumentos

Código común de los episodios a partir del 17. El kit Anatomy y su licencia MIT están copiados dentro del proyecto; no se necesita instalar la habilidad para regenerar los HTML.

- `build.mjs` integra contenido, controles, modelos, geometría y tema en HTML autónomo. Los generadores de cada episodio lo invocan.
- `live.js` conserva las referencias a las piezas SVG, sincroniza dibujo y lecturas, proporciona teclado y arrastre, y gestiona el reloj, el movimiento reducido y la visibilidad.
- `styles.css` aporta la disposición; `../theme.css` y `../machine-materials.css` conservan el diseño de la colección.
- `painter.mjs` deduce el orden de dibujo mediante planos separadores de las geometrías reales. `audit-scene.mjs` registra esas mismas piezas y sus rutas para las auditorías del kit.
- `geometry.mjs` construye bases, piezas torneadas, prismas, tornillos y esferas con la misma geometría usada por el auditor. Las piezas que cambian de orientación conservan sus nodos SVG y actualizan sus caras.
- `scripts/drive.mjs` y `scripts/lines.mjs` ejecutan las secuencias de navegador y las comprobaciones de líneas. Las capturas se guardan en `../shots/` al ejecutar los comandos desde la raíz.

Cada carpeta de episodio conserva sus decisiones físicas en `concept.md`, el modelo puro en `model.mjs`, la máquina en `scene.mjs`, el texto español en `lesson.mjs` y sus pruebas. Copia esta carpeta y los archivos compartidos de tema al trasladar las fuentes. Los HTML generados funcionan solos, sin servidor ni recursos externos.

Las lecturas de `lesson.mjs` aceptan `digits`, `scale` y el formato opcional `format: 'scientific'` o `format: 'adaptive'`. El primero usa siempre notación científica española; el segundo la usa para valores distintos de cero con magnitud menor que 0,001, después de aplicar la escala. Los textos explican la notación E cuando la necesitan. Las tarjetas que usan estos formatos distribuyen sus lecturas en columnas más amplias en móvil.

# Episodio 2 · La ley de la caída de los cuerpos

Abre **index.html** directamente en un navegador. El archivo contiene la ilustración SVG, los estilos y el código de interacción; funciona sin servidor, paquetes de npm ni conexión a Internet. `episode-2-dark.html` abre la misma experiencia con el tema oscuro. Los enlaces de las fuentes requieren conexión.

La bancada reúne un plano inclinado ajustable y un aparato de caída simultánea. Todo el contenido de la interfaz está en español, con unidades del SI y coma decimal.

## Explorar

- Elige **Plano inclinado** o **Caída simultánea**.
- Ajusta el ángulo, la altura o la masa de la esfera B. Compara el vacío con el aire.
- Pulsa **Soltar**, pausa el movimiento o arrastra el control del tiempo.
- En el plano, pulsa las marcas **1, 4, 9, 16 y 25** para explorar intervalos iguales.
- Cambia la velocidad de reproducción para observar mejor la caída.
- Con el dibujo enfocado, usa **1** y **2** para cambiar de experimento, **espacio** para reproducir o pausar, **← / →** para avanzar por pasos, **Inicio / Fin** para ir a los extremos y **R** para volver al inicio.

La demostración inicial alterna los experimentos hasta que interactúas. Se detiene al salir de la pantalla o al ocultar la pestaña. Si prefieres movimiento reducido, la experiencia permanece quieta y **Avanzar** cambia la posición por pasos.

## Reconstruir

Requiere Node.js 20.10 o posterior; no hace falta instalar dependencias.

```sh
node build.mjs
node --test tests/model.test.mjs
node build.mjs --audit
```

Las comprobaciones de navegador necesitan Chrome o Chromium. Puedes indicar su ubicación con `CHROME_PATH`.

```sh
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 900 --reduced
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1300
node scripts/drive.mjs episode-2-dark.html --actions tests/idle.json --width 1440 --height 1300 --no-webgl
```

Se verificaron las seis pruebas del modelo, seis configuraciones de la geometría y siete comprobaciones de extremos de líneas, todas sin errores. Las pruebas de navegador cubren los dos temas, el teclado, el arrastre del control temporal, los ajustes físicos, la repetición, el recorrido automático, el movimiento reducido y la pausa fuera de pantalla o al ocultar la pestaña. Se revisaron capturas de escritorio y móvil, ampliaciones de 4× y secuencias de ambos experimentos. La versión independiente no solicitó recursos externos.

## Archivos

- `model.mjs`: modelo físico puro, tiempos de llegada y formato numérico español.
- `scene.mjs`: piezas tridimensionales proyectadas, posiciones y geometría compartida.
- `live.js`: controles, animación y accesibilidad.
- `styles.css`: presentación adaptable y materiales de ambos temas.
- `build.mjs`: genera los dos HTML independientes y calcula el orden de las piezas.
- `audit.mjs`: registra las formas reales y comprueba profundidad, apoyos y contactos. Las esferas en vuelo se tratan como cuerpos libres; sus posiciones y sus formas se siguen comprobando.
- `concept.md`: intención, lista de piezas, supuestos y fuentes científicas.
- `kit/` y `scripts/`: herramientas locales; el proyecto puede reconstruirse fuera de la instalación de la habilidad.

El plano usa la aceleración de una esfera maciza que rueda sin deslizar, **a = (5/7)g sen θ**. La caída en el vacío usa **s = gt²/2**. El aire se aproxima con resistencia cuadrática; el panel «Cómo funciona el modelo» detalla los supuestos. Las mediciones y las posiciones de las esferas se calculan con las mismas funciones.

Licencia MIT; se incluye la licencia de Anatomy.

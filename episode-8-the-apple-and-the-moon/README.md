# Episodio 8 · La manzana y la Luna

Abre **[index.html](index.html)** directamente en un navegador. Todo el contenido y todos los controles están en español. El HTML incluye el dibujo, los estilos y el programa; funciona sin servidor, paquetes, fuentes externas ni conexión. **[episode-8-dark.html](episode-8-dark.html)** inicia en tema oscuro; ambos archivos incluyen un botón para cambiar de tema.

## Interacción

- Ajusta la velocidad inicial entre 0 y 12 km/s o elige caída, órbita circular, órbita elíptica o escape. Los botones de velocidad circular y escape utilizan el valor preciso, aunque la lectura lo redondea a tres decimales.
- Lanza, pausa, continúa y repite. El control de tiempo y el arrastre horizontal permiten recorrer el vuelo. Cambiar la velocidad prepara otro lanzamiento desde el instante inicial.
- Amplía el cañón, muestra u oculta la predicción y elige el ritmo del reloj: 2, 8 o 16 minutos simulados por segundo real.
- Con la figura enfocada, las flechas cambian la velocidad en 0,1 km/s; Mayús aumenta el paso a 0,5 km/s. Inicio y Fin seleccionan los extremos temporales, espacio controla la reproducción y R reinicia.
- Compara la atracción terrestre en la superficie y a la distancia lunar; también puedes ajustar la distancia entre ambos extremos.
- La demostración automática alterna los cuatro ejemplos y se detiene al ajustar el lanzamiento o el vuelo. La animación se pausa fuera de pantalla y con la pestaña oculta. Con movimiento reducido, «Avanzar» recorre el vuelo en doce pasos, sin animación.

## Modelo e idealizaciones

La posición inicial es (0, 7071) km y la velocidad inicial es (v₀, 0) km/s, en un plano que contiene el centro terrestre. La ecuación integrada es **r″ = −μr/|r|³**, con μ = 398600,435507 km³/s² y radio terrestre idealizado de 6371 km. La montaña de 700 km es ficticia. Se omiten la atmósfera, la rotación de la Tierra, otros astros y la masa del proyectil.

`model.mjs` calcula el recorrido con Runge–Kutta de cuarto orden y paso máximo de 2 s. Refina por bisección el primer contacto con la superficie o la llegada al límite radial del campo, de 2,2 radios terrestres. Para un contacto tangente utiliza el instante del periapsis. Las órbitas que caben completas terminan en su período kepleriano. Un estado entre muestras se integra desde la muestra anterior; la interpolación de una curva decorativa no determina las lecturas.

La energía específica ε = v²/2 − μ/r clasifica el escape. Salir del campo dibujado no equivale a escapar: a 9,5 km/s la bala sale del campo, pero conserva una órbita ligada. También existe una pequeña franja de órbitas subcirculares que evita la superficie debido a la altura inicial. Las velocidades circular y mínima de escape son aproximadamente 7,508 y 10,618 km/s desde esta altura.

La comparación lunar usa 384400 km entre centros y g = 1000μ/r², en m/s². Representa la **atracción de la Tierra a esa distancia**, no la aceleración en la superficie de la Luna. El pequeño esquema usa distancias lineales, con cuerpos ampliados.

La maqueta consta de 58 sólidos: madera, latón, metal esmaltado y acero. La Tierra es un relieve circular con espesor; la montaña y el cañón están ampliados. El punto representa una masa ideal de tamaño despreciable, con un halo que permite encontrarla. La Tierra y el recorrido comparten escala radial; la trayectoria es una anotación matemática sobre el instrumento. Las piezas del soporte no son obstáculos del modelo gravitatorio.

## Construcción y verificación

Requiere Node.js 22 o posterior. Las comprobaciones de navegador necesitan Google Chrome o Chromium; no hay dependencias npm.

Desde esta carpeta:

```sh
node build.mjs --audit
node --test tests/*.test.mjs
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 1800
node scripts/lines.mjs index.html --out shots/lines-light.png
node scripts/lines.mjs episode-8-dark.html --out shots/lines-dark.png
```

La construcción siempre genera ambas variantes. `--audit` verifica los sólidos reales, sus contactos, apoyo y orden de pintura. No hay vista desmontada ni tubos. La trayectoria y el punto son anotaciones, no piezas estructurales; la aguja admite los extremos libres propios de un indicador. La auditoría no usa cajas de sustitución ni ajustes arbitrarios de profundidad.

Comprobaciones realizadas:

- 11 pruebas del modelo y de la geometría: solución circular analítica, energía, momento angular, caída radial, impacto, contacto tangente, órbitas subcirculares, período elíptico, escape, límites de entrada e inverso del cuadrado; además, encuadre de las trayectorias y orden completo de las piezas.
- Auditoría de 58 sólidos: cero problemas de separación, apoyo, interpenetración, representación u orden de profundidad; 184 relaciones de orden verificadas.
- Líneas: cero extremos sueltos en ocho velocidades, al inicio y al final, en ambos temas; también en la ampliación del cañón.
- Navegador: valores y posición de la bala, cambio de velocidad, ejemplos exactos, arrastre, teclado, reinicio, avance sin animación, predicción y comparador lunar.
- Móvil de 390 px, ambos temas, sin desbordamiento horizontal; escritorio, ampliaciones a 4×, capturas de vuelo y revisión visual.
- Ciclo completo de demostración, reloj, pausas manuales, pestaña oculta y figura fuera de pantalla; consolas sin errores.

Las capturas están en `shots/`. `concept.md` conserva el planteamiento previo; `scene.mjs` define las piezas; `painter.mjs` prueba su orden con planos separadores; `live.js` conecta el modelo con la interfaz. `kit/` y `scripts/` contienen las utilidades de Anatomy necesarias para reproducir el resultado. La licencia del kit se incluye en `LICENSE`.

## Fuentes

- [OpenStax, Astronomy 2e: movimientos de satélites y naves](https://openstax.org/books/astronomy-2e/pages/3-5-motions-of-satellites-and-spacecraft): experimento mental del cañón de Newton.
- [OpenStax, University Physics: órbitas y energía](https://openstax.org/books/university-physics-volume-1/pages/13-4-satellite-orbits-and-energy): velocidad circular, período y relación con la velocidad de escape.
- [NASA/JPL, parámetros astrodinámicos](https://ssd.jpl.nasa.gov/astro_par.html): parámetro gravitatorio terrestre de DE440.
- [NASA/JPL, distancia lunar](https://ssd.jpl.nasa.gov/glossary/LD.html): distancia media de 384400 km.

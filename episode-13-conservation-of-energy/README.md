# Episodio 13 · Conservación de la energía

Montaña rusa interactiva en español, con un carrito que sigue dos carriles, lecturas de altura, rapidez y tiempo, y un balance de energías potencial, cinética y térmica. La ilustración tiene 294 piezas sólidas: base, patas, pilares, travesaños, regla, carriles y carrito.

Abre `index.html` directamente en un navegador. `episode-13-dark.html` inicia el mismo laboratorio con tema oscuro. Los dos HTML integran SVG, CSS y JavaScript y funcionan sin conexión, servidor ni dependencias externas.

## Interacción

1. Elige una altura de liberación entre 8 y 30 m y una masa entre 200 y 1000 kg.
2. Pulsa **Soltar desde el inicio**. El carrito empieza desde el reposo. La pausa conserva el estado del experimento; **Avanzar 0,25 s** permite recorrerlo por pasos.
3. Observa cómo cambian la altura y la rapidez. La barra reparte la energía entre sus tres formas y conserva su longitud total.
4. Guarda hasta tres observaciones de una misma prueba. Cambiar un parámetro prepara otra liberación y vacía el cuaderno. También puedes vaciarlo sin modificar la prueba.
5. Activa **Incluir rozamiento** y repite: disminuye la energía mecánica y aumenta la energía térmica.

Arrastrar horizontalmente la figura cambia la altura inicial. Con el foco sobre ella, las flechas cambian 1 m y Mayús + flecha, 5 m; Inicio y Fin seleccionan 8 y 30 m. Espacio pausa o reanuda. Con movimiento reducido, Espacio avanza un paso y no hay reproducción automática ni transiciones.

La demostración inicial empieza tras una breve espera y oscila sin rozamiento. Se pausa al señalar o enfocar el laboratorio. Todo reloj se detiene cuando el laboratorio queda fuera de pantalla o la pestaña está oculta. El selector × 0,5 / × 1 / × 2 cambia el ritmo de reproducción, manteniendo el tiempo físico de las lecturas. La preparación de una nueva prueba desvanece el carrito antes de situarlo en su nueva posición; puede programarse la salida mientras se prepara.

## Modelo y alcance

Se modela una masa puntual guiada sobre una pista fija. La coordenada x abarca −24 a +24 m. Cuatro tramos polinómicos de grado cinco conectan las alturas [32, 3, 18, 3, 32] m en x = [−24, −12, 0, 12, 24] m. En cada tramo, con u entre 0 y 1, h = h₁ + (h₂ − h₁)u³(10 − 15u + 6u²). Altura, pendiente y curvatura son continuas.

Para g = 9,80665 m/s² y velocidad tangencial con signo v:

```text
dx/dt = v / √(1 + h′²)
dv/dt = −gh′ / √(1 + h′²) − γv
dQ/dt = mγv²
Eₚ = mgh; E꜀ = ½mv²; E₀ = mgh₀
Eₚ + E꜀ + Q = E₀
```

γ vale 0 o 0,09 s⁻¹. La fuerza resistente es −mγv; esta ley viscosa no es un coeficiente de rozamiento de Coulomb. `model.mjs` integra posición, velocidad y producción térmica por RK4, con pasos máximos de 1/240 s. Q se integra directamente, sin obtenerla por resta para ocultar el error del balance. Las pruebas comparan ese balance con la energía inicial a lo largo de varios recorridos y comprueban la independencia respecto a la masa y a la agrupación de pasos.

La energía potencial se mide desde h = 0 m, por debajo de los valles. Las ruedas tienen masa despreciable; no se incluye energía de rotación. El carrito permanece guiado, sin desprenderse en las crestas, y no hay motor. Preparar otra liberación aporta energía desde el exterior y define una prueba nueva. La energía total se conserva dentro del error numérico. El caso exacto de 18 m es el límite teórico, con rapidez nula en la cima; su evolución cerca del equilibrio es sensible a la precisión numérica.

La maqueta y el tamaño del carrito son esquemáticos. Las lecturas corresponden al punto material del modelo. Los carriles dibujados aproximan el perfil suave con tramos de 0,5 m; el centro de las ruedas se ajusta a la distancia exacta de contacto con ese perfil poligonal. La orientación del carro sigue la tangente suave. Las piezas que cambian de orientación actualizan sus rutas SVG; el resto se calcula una vez. La profundidad se resuelve mediante planos separadores y solo se cambia el orden del DOM cuando hace falta.

## Reconstrucción y comprobaciones

Requiere Node.js 22 o posterior. Desde esta carpeta:

```sh
node build.mjs --audit
node --test tests/physics.test.mjs tests/geometry.test.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1700 --reduced
node scripts/drive.mjs index.html --actions tests/normal.json --width 1440 --height 1100
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
```

Las pruebas de navegador requieren Chrome o Chromium; `CHROME_PATH` permite indicar otro ejecutable. Las capturas quedan en `shots/`, excluida de Git.

La auditoría verifica las 294 piezas reales dibujadas en 15 posiciones entre −21 y +21 m, con cero incidencias de contactos, separación, soportes, profundidad o cobertura. Las pruebas geométricas recorren otras 441 posiciones y comprueban el contacto rueda-carril. Las pruebas físicas verifican la conversión de energía, los límites de altura, el cruce de la loma, la producción térmica, la comparación de masas y la independencia del paso temporal.

La revisión visual incluye escritorio, móvil de 390 px, ambos temas, contactos a 4×, el estado al señalar y secuencias del recorrido y de la preparación. Las comprobaciones de líneas verifican los extremos de reglas, ranuras y radios de rueda en varios estados.

## Fuente editable

- `concept.md`: concepto y piezas, definidos antes de dibujar.
- `model.mjs`: pista, física e integración temporal.
- `scene.mjs`, `painter.mjs`, `audit.mjs`, `kit/`: sólidos, profundidad y auditoría.
- `page.html`, `styles.css`, `materials.css`, `live.js`: interfaz y comportamiento.
- `build.mjs`: genera los dos HTML autónomos.
- `tests/`, `scripts/`: comprobaciones reproducibles.

## Fuentes

- [OpenStax · energía mecánica y conservación](https://openstax.org/books/physics/pages/9-2-mechanical-energy-and-conservation-of-energy).
- [OpenStax · energía potencial gravitatoria](https://openstax.org/books/college-physics-2e/pages/7-3-gravitational-potential-energy).
- [OpenStax · movimiento de rodadura](https://openstax.org/books/university-physics-volume-1/pages/11-1-rolling-motion), para distinguir el modelo puntual de uno que incluya la energía de las ruedas.

El kit Anatomy conserva su licencia MIT en `LICENSE`, también incluida en los HTML generados.

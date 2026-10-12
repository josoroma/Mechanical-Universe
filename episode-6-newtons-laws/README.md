# Episodio 6 · Las leyes de Newton

Abre [index.html](index.html) para explorar los dos aparatos. [episode-6-dark.html](episode-6-dark.html) abre directamente el tema oscuro; ambas páginas incluyen el selector de tema. Son archivos autónomos: no necesitan servidor, red, bibliotecas ni fuentes externas.

## Experimentos

- **Máquina de Atwood:** modifica las dos masas y la velocidad inicial; reproduce, pausa o recorre el tiempo. La polea gira y los portapesas se desplazan conservando la longitud de la cuerda. Los casos preparados muestran equilibrio, descenso invertido, mayor inercia y velocidad constante.
- **Mesa de fuerzas:** ajusta tres pesas, la dirección de la tercera cuerda y la masa central. Abre o cierra las mordazas, compara las componentes de las tensiones y usa «Equilibrar la tercera fuerza». El indicador muestra el módulo de la aceleración inicial.
- **Las tres leyes:** explicaciones en español, tabla de fuerzas sobre cada cuerpo y distinción entre un par de acción y reacción y las fuerzas sobre un solo cuerpo.

La mesa representa **t = 0**, con todas las velocidades nulas: calcula la aceleración al liberar el cuerpo, sin animar su trayectoria posterior. Atwood sí reproduce el movimiento durante un tramo de ±0,8 m. Su último fotograma conserva el estado de vuelo; no simula un choque.

## Controles

Arrastra horizontalmente el dibujo para cambiar m₂ o la dirección de la tercera polea. Los controles deslizantes también se pueden manejar con el teclado.

Con el dibujo enfocado:

| Tecla | Acción |
|---|---|
| 1 / 2 | Elegir Atwood o la mesa |
| Espacio | Reproducir, pausar o abrir/cerrar las mordazas |
| ← / → | Cambiar m₂ o la dirección de la tercera cuerda |
| ↑ / ↓ | Cambiar m₁ o la tercera pesa |
| Inicio / Fin | Ir al comienzo/final del ensayo o a los extremos angulares |
| R | Restablecer el aparato |

«Ampliar mecanismo» permite inspeccionar las uniones. El recorrido automático de Atwood termina cuando se interactúa. La reproducción se suspende cuando el dibujo queda fuera de pantalla o la pestaña se oculta. Con movimiento reducido, «Avanzar» cambia el tiempo en pasos de 0,1 s sin animación.

## Modelo físico

Se usan g = 9,81 m/s², masas totales que incluyen los portapesas, cuerdas inextensibles y sin masa, poleas ideales sin rozamiento e inercia despreciable y una mesa sin rozamiento.

Para Atwood, q positivo significa que m₂ desciende:

```text
a = (m₂ − m₁)g / (m₁ + m₂)
T = 2m₁m₂g / (m₁ + m₂)
q(t) = v₀t + at²/2
v(t) = v₀ + at
```

Para la mesa sujeta, Tᵢ = mᵢg y las mordazas compensan la suma de las tensiones. Al liberar el cuerpo central de masa M, también aceleran las pesas. Con uᵢ dirigido desde el centro hacia cada polea:

```text
(M I + Σmᵢuᵢuᵢᵀ)a₀ = Σmᵢg uᵢ
Tᵢ = mᵢ(g − uᵢ·a₀)
ΣTᵢuᵢ = M a₀
```

Esta expresión se obtiene de la segunda ley aplicada a todos los cuerpos y de la longitud constante de cada cuerda en el instante inicial. Por eso la tensión libre puede diferir del peso de la pesa. El peso y la normal del cuerpo central se compensan verticalmente. Los ángulos se definen en el plano horizontal; la perspectiva del dibujo no conserva sus valores.

Referencias: [OpenStax: resolución de problemas y máquina de Atwood](https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws), [segunda ley](https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law) y [tercera ley](https://openstax.org/books/university-physics-volume-1/pages/5-5-newtons-third-law). La ecuación matricial anterior es la derivación empleada para esta mesa.

## Fuentes y construcción

| Archivo | Función |
|---|---|
| concept.md | Concepto y piezas definidos antes de construir la geometría |
| model.mjs | Física y formato numérico español |
| scene.mjs | Sólidos, poleas, cuerdas y graduaciones |
| painter.mjs | Orden de dibujo por planos separadores |
| live.js | Interacción, reproducción y accesibilidad |
| styles.css | Diseño adaptable y materiales |
| audit.mjs | Registro y comprobación geométrica |
| build.mjs | Generación de los dos HTML autónomos |
| kit/ | Copia local del kit de Anatomy, con licencia MIT |
| scripts/ y tests/ | Herramientas y secuencias reproducibles de verificación |
| shots/ | Capturas revisadas y resultados de las comprobaciones |

Desde esta carpeta, con Node.js:

```sh
node build.mjs
node build.mjs --audit
node --test tests/model.test.mjs
```

El orden de las piezas se calcula a partir de sus volúmenes reales. Las cuerdas se dividen en segmentos donde cambia su orden de profundidad; no se usan prioridades artificiales. El contacto de cada cuerda con su propia garganta se comprueba analíticamente, con holgura positiva inferior a 0,15 unidades de dibujo, antes de excluir ese contacto previsto de la comprobación genérica. Las demás intersecciones siguen verificándose.

## Verificación

Resultados: 12 pruebas del modelo superadas; auditoría de 10 estados con cero incidencias; barrido adicional de 222 configuraciones angulares de la mesa con orden de dibujo correcto. Las comprobaciones de extremos de línea terminan a cero en los estados inspeccionados, incluidos los mecanismos ampliados.

Se revisaron escritorio, móvil de 390 px, ambos temas, controles por puntero y teclado, reposo, extremos del recorrido, mordazas abiertas y cerradas, equilibrio, pestaña oculta, dibujo fuera de pantalla y movimiento reducido. Las capturas incluyen uniones a 4× y secuencias de movimiento en ambos temas.

Para repetir las comprobaciones del navegador se necesita Chrome o Chromium instalado; puede indicarse su ruta mediante CHROME_PATH:

```sh
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced --no-webgl
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1300 --reduced
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 1300
node scripts/drive.mjs episode-6-dark.html --actions tests/idle.json --width 1440 --height 1300
```


# Episodio 7 · Integración

Abre [index.html](index.html) directamente en un navegador. Todo el texto de
la interfaz está en español. El HTML incorpora los estilos, el dibujo SVG y
el programa: funciona sin servidor, dependencias de red ni claves de API.
[episode-7-dark.html](episode-7-dark.html) abre inicialmente el tema oscuro;
ambas páginas permiten cambiar de tema.

El integrador de disco y rueda acumula el área bajo cuatro curvas. El carro
representa f(x), el giro del disco representa el avance de x y las vueltas
netas de la rueda representan la integral. La gráfica muestra por separado
las regiones positiva y negativa, el área geométrica y una aproximación con
4, 8, 16 o 32 rectángulos de punto medio.

## Controles

- Elige una función y ajusta el factor de altura y el límite inferior a.
  Cada cambio inicia una medición nueva en x = a, con área acumulada cero.
- Reproduce, pausa, reinicia o arrastra el control de x. También puedes
  arrastrar horizontalmente sobre el aparato o directamente sobre la gráfica.
- Con el aparato o la gráfica enfocados, las flechas cambian x en 0,1 u;
  Mayús + flecha cambia 0,5 u. Inicio vuelve a a, Fin llega a 6, espacio o
  Intro alterna reproducción y pausa, y R reinicia.
- «Ver la cancelación de áreas» muestra la curva con signo en [0, 6].
- «Ampliar mecanismo» acerca el contacto entre el disco y la rueda.
  Las claves Disco, Carro y Rueda permiten examinar sus funciones.

El recorrido automático inicial alterna las cuatro curvas; se pausa al pasar
el puntero sobre el aparato o enfocar un control. Al ajustar el experimento,
el usuario toma el control. La animación se detiene fuera de pantalla y en
pestañas ocultas. Con movimiento reducido, «Avanzar» cambia x en pasos de
0,1 u sin animación.

## Modelo y alcance

Se supone rodadura sin deslizamiento tangencial y una carga despreciable.
El posicionamiento radial es una entrada idealizada: no se representa un
seguidor de curvas ni un amplificador de par. El contacto admite el ajuste
radial. Es una ilustración didáctica original, no un plano de fabricación.

La rueda tiene radio R = 12 mm. El radio de contacto con signo es
r = (24 mm/u)f(x), y el disco gira dθ/dx = π/3 rad/u. De R dφ = r dθ se
obtiene φ = (2π/3 rad/u²)∫ₐˣ f(t)dt. Una vuelta neta de salida equivale
a 3 u². La esfera indica el ángulo módulo una vuelta; el contador conserva
las vueltas completas y su signo. El disco cuenta su avance desde a.

Las integrales usan primitivas analíticas, sin acumulación de error temporal.
Las sumas de rectángulos son una comparación independiente. Los dos ejes
matemáticos usan unidades abstractas u. Las cifras se presentan con coma
decimal y se redondean solo al mostrarlas.

## Reconstrucción

Desde esta carpeta, con Node.js 20.10 o posterior:

```sh
node build.mjs
node build.mjs --audit
node --test tests/*.test.mjs
```

La compilación genera las dos páginas. `--audit` comprueba ocho poses,
incluidos el centro y los dos extremos del recorrido. Todos los módulos
necesarios están incluidos; no requiere tener instalada la habilidad Anatomy.

## Verificación realizada

Ocho pruebas automáticas aprobadas: primitivas, calibración, rodadura,
cancelación, límites, convergencia, formato y geometría. El orden de profundidad
y el contacto se comprueban además en 241 poses a lo largo del recorrido.

La auditoría de los 96 sólidos terminó en `audit passed` en las ocho poses,
con cero fallos en todas las categorías. El comprobador de líneas dio
`line ends: 0` para las cuatro curvas en ambos temas, en el centro, en los
extremos y con el mecanismo ampliado.

Se revisaron capturas de escritorio, móvil de 390 px, paso del puntero,
ocho momentos de movimiento y detalles a 4× en ambos temas. Se comprobaron
los controles, el arrastre, la cancelación, el reinicio al cambiar de límites,
la pausa fuera de pantalla y con pestaña oculta, el seguimiento suave y la
conservación de los nodos SVG. Consola de Chrome sin errores. La animación
también se comprobó con WebGL desactivado; el instrumento utiliza SVG.

Para reproducir las comprobaciones de navegador se necesita Chrome o Chromium.
Puedes indicar su ejecutable con `CHROME_PATH` si no se detecta automáticamente.

```sh
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1700 --reduced
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1400 --reduced
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 1400 --no-webgl
```

Los registros están en `tests/*.log` y las capturas revisadas en `shots/`.

## Fuente editable

- `concept.md`: concepto, alcance, piezas e idealizaciones anteriores al dibujo.
- `model.mjs`: funciones, primitivas, áreas, suma y calibración.
- `scene.mjs`: piezas, proyección y grabados móviles.
- `painter.mjs`, `audit.mjs`: orden de profundidad y auditoría de geometría real.
- `live.js`: interacción, movimiento y gráfica adaptable.
- `styles.css`, `materials.css`: presentación y materiales de la serie.
- `build.mjs`: genera HTML autónomo a partir de las fuentes locales.
- `kit/`, `scripts/`: herramientas Anatomy incluidas bajo la licencia MIT.

## Referencias

- [Science Museum: funcionamiento del integrador de disco y rueda](https://blog.sciencemuseum.org.uk/back-to-the-future-of-computing/).
- [Science Museum: analizador diferencial de Manchester](https://collection.sciencemuseumgroup.org.uk/objects/co59975/manchester-university-differential-analyser-analogue-computer-differential-analyser).
- [OpenStax: la integral definida y las áreas con signo](https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral).
- [OpenStax: teorema fundamental del cálculo](https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus).

Las herramientas gráficas proceden de [Anatomy, de Ryan](https://github.com/wheresryan22/anatomy).
La licencia original se conserva en [LICENSE](LICENSE).

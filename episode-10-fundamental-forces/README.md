# Episodio 10 · Fuerzas fundamentales

Abre **[index.html](index.html)** directamente en un navegador. Incluye dos balanzas de torsión interactivas, contenido en español y temas claro y oscuro. **[episode-10-dark.html](episode-10-dark.html)** empieza en el tema oscuro. Ambos archivos son autónomos: no necesitan servidor, conexión ni paquetes externos.

## Explorar

- Ajusta la distancia entre centros, la masa de cada esfera y la magnitud de las cargas.
- Cambia los signos para comparar atracción y repulsión. Los cuatro ejemplos incluyen carga nula y fuerzas casi compensadas.
- Arrastra horizontalmente sobre cualquiera de las balanzas para variar la distancia. También puedes enfocarla con Tab y usar las flechas; Mayús aumenta el paso, Inicio y Fin seleccionan los extremos. Espacio controla la demostración y R restablece el ejemplo inicial.
- Compara las magnitudes, su razón y la resultante con signo. Las balanzas tienen sensibilidades distintas, indicadas junto a cada lectura.
- La demostración se pausa al señalar las balanzas y se detiene al ajustar los controles. La animación se suspende fuera de pantalla o al ocultar la pestaña. Con movimiento reducido, los cambios son instantáneos y «Ver otro ejemplo» recorre los cuatro casos.

## Modelo

Las fuerzas se calculan en SI con `Fg = Gm₁m₂/r²` y `Fe = k|q₁q₂|/r²`, para cuerpos puntuales en el vacío. G = 6,67430 × 10⁻¹¹ N·m²/kg² y k = 8,9875517862 × 10⁹ N·m²/C². La distancia se mide entre centros. La masa de cada cuerpo varía de 0,5 a 5 kg; la magnitud de cada carga, de 0 a 2 nC; la distancia, de 0,20 a 1,00 m.

La gravedad siempre apunta hacia la fuente. El signo de la fuerza eléctrica cambia con el producto de las cargas. La resultante suma ambas componentes sobre la misma línea. La razón entre sus magnitudes no depende de la distancia. «Casi iguales» usa 1 kg y 0,086 nC por esfera: la compensación es aproximada.

Son instrumentos explicativos idealizados. La esfera fuente se desplaza con su soporte para conservar la separación y una fuerza perpendicular al brazo. La sensibilidad se adapta para visualizar fuerzas muy distintas: `Fesc = |F| + Fref`, `θ = (π/10) F/Fesc`, `κ = Fesc × 0,38/(π/10)`. Se cumple `κθ = 0,38 F`. Los valores de referencia son 0,2 nN y 20 nN. Los ángulos de las dos balanzas no son una comparación directa de fuerzas.

El reajuste prepara estados de equilibrio; no integra la dinámica de torsión. Al cambiar la polaridad, la segunda carga pasa suavemente por cero y se muestra su valor instantáneo. Se omiten las fuerzas sobre soportes y contrapesos, la inducción, la polarización y el rozamiento. Por eso, la carga nula produce fuerza eléctrica nula. El tamaño de las esferas es ilustrativo.

## Reconstruir y comprobar

Desde esta carpeta, con Node.js 22 o posterior:

```sh
node build.mjs --audit
node tests/check.mjs --audit
node tests/actions.mjs
node tests/motion-actions.mjs
```

Las pruebas de navegador usan Google Chrome local y los scripts incluidos:

```sh
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs episode-10-dark.html --actions tests/reduced.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 900
```

Se verificaron las proporcionalidades, signos, neutralidad, resultante y equilibrio de torsión; 810 posiciones con separación correcta y orden de profundidad válido; y 16 auditorías completas de contactos, apoyos, cobertura y profundidad sin incidencias. La comprobación de líneas dio cero extremos sueltos en ambos temas, los cuatro ejemplos y los extremos de los controles. Se probaron el arrastre, el teclado, la pausa, la reanudación, el movimiento reducido y la suspensión al salir de pantalla. El estado de pestaña oculta se comprobó mediante una emulación de `document.hidden` y su evento. Se revisaron capturas de escritorio, móvil de 390 px, movimiento y uniones a 4×; están en `shots/`. Los registros están en `tests/`.

## Archivos

- `concept.md`: intención, piezas y decisiones previas a la geometría.
- `model.mjs`: leyes, constantes, resultante y torsión.
- `scene.mjs`: 56 piezas por balanza, proyección y materiales.
- `painter.mjs`: orden de pintado demostrado mediante planos separadores de las formas reales.
- `live.js`: controles, actualización de los SVG y demostración.
- `styles.css` y `materials.css`: interfaz adaptable y temas.
- `build.mjs` y `audit.mjs`: generación autónoma y auditoría de geometría.
- `kit/` y `scripts/`: dependencias locales de Anatomy y herramientas de revisión.

## Fuentes y licencia

- [OpenStax · Gravitación universal](https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation).
- [OpenStax · Ley de Coulomb](https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law).
- [NIST · Constantes CODATA 2022](https://physics.nist.gov/cuu/pdf/all.pdf).
- [CERN · Modelo estándar e interacciones fundamentales](https://home.cern/science/physics/standard-model/).

El kit y las herramientas proceden de [Anatomy, de Ryan](https://github.com/wheresryan22/anatomy). Se conserva su [licencia MIT](LICENSE), también incluida en los HTML generados.

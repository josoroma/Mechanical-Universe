# Episodio 10 · Fuerzas fundamentales

Comparador con dos balanzas de torsión de sobremesa, una junto a otra. Cada balanza suspende un brazo horizontal con una esfera de prueba y un contrapeso. Otra esfera sobre un soporte móvil produce la fuerza que retuerce la suspensión. Un disco graduado revela el sentido de la desviación. Alcance: dos figuras detalladas, unas 50 piezas cada una, SVG autónomo con temas claro y oscuro; sin WebGL ni vista desmontada.

## Piezas previstas antes de la geometría

- Base de madera con moldura de latón, tapa esmaltada, patas regulables, tornillos y una placa grabada.
- Columna exterior, base atornillada, collar moleteado, brazo diagonal, cabezal y perilla de sensibilidad.
- Hilo de torsión, articulación central, dos segmentos de brazo aislante, esfera de prueba y contrapeso.
- Disco graduado con pedestal, eje, aro, cara esmaltada, anillos, divisiones y marca de cero.
- Soporte móvil de la esfera fuente: zapata, collar, columna aislante y esfera.

El brazo gira horizontalmente. Las esferas fuente y de prueba siempre quedan a la distancia entre centros indicada. El soporte móvil acompaña el reajuste del brazo para conservar la línea de fuerza perpendicular a este. Las piezas estáticas se calculan una vez; las esferas y el soporte se trasladan; solo los brazos que cambian de orientación se reproyectan. Las formas auditadas serán las mismas esferas, cilindros y prismas dibujados.

## Modelo e interacción

Dos cuerpos puntuales de masa m cada uno, con cargas de igual magnitud q; separación r. Fg = Gm²/r², siempre atractiva; |Fe| = kq²/r², atractiva para signos opuestos y repulsiva para iguales. G = 6,67430×10⁻¹¹; k = 8,9875517862×10⁹ en unidades SI. Masa entre 0,5 y 5 kg, carga entre 0 y 2 nC, distancia entre 0,20 y 1 m.

Cada balanza aísla una interacción. La comparación adicional suma ambas fuerzas con signo sobre la misma línea. Las fuerzas no se comparan mediante G y k solos, que tienen unidades diferentes. Se compara Fe/Fg para los mismos cuerpos y distancia; la razón no cambia con r. El tamaño de las esferas está ampliado y no cambia con la masa ni con la carga. Se omiten la interacción con el soporte y el contrapeso, la inducción, la polarización y la resistencia del aire; carga nula significa Fe = 0 en este modelo puntual.

Las balanzas adaptan continuamente su sensibilidad: escala Fspan = |F| + Fref, con Fref de 0,2 nN para gravedad y 20 nN para electricidad; θ = (18°) F/Fspan. El momento restaurador ideal es κθ con κ = Fspan·0,38 m/(18° en radianes), de modo que κθ = 0,38 m·F. La sensibilidad se indica fuera del aparato y no deben compararse los ángulos entre balanzas. La animación interpola la preparación de regímenes estacionarios, sin representar la dinámica de la puesta en marcha.

Controles compartidos, cuatro ejemplos (atracción, repulsión, sin carga y magnitudes casi iguales), arrastre para separar esferas, teclado, pausa, demostración automática, suspensión fuera de pantalla y movimiento reducido. Fuentes de las leyes: OpenStax; constantes: NIST; contexto de las cuatro interacciones: CERN.

## Verificación prevista

Proporcionalidades con masa, carga y distancia; signos, neutralidad, razón y resultante; equilibrio de torsión y separación geométrica real. Auditoría completa de apoyos, contactos y profundidad en extremos y puntos de la transición; barrido adicional de todas las distancias y desviaciones. Líneas a cero en los estados de reposo de ambos temas; escritorio, móvil de 390 px, capturas de movimiento y uniones a 4×.

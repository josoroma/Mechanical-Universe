# Episodio 4 · Inercia

## Concepto, antes de la geometría

Un carro de laboratorio sobre cuatro ruedas transporta un péndulo suspendido de un pórtico. El movimiento de la esfera revela los cambios de velocidad del carro; el movimiento uniforme deja intacto un péndulo inicialmente equilibrado. Un cambio de punto de vista permite comparar lo observado desde el suelo con lo observado a bordo. Es una interpretación didáctica del argumento del barco de Galileo, no una réplica histórica.

Alcance: una ilustración principal de aproximadamente 80–100 piezas, con volumen, uniones reales, controles externos y dos temas. La esfera es el centro de atención. La bancada de nogal, el esmalte verde, el latón y el acero mantienen el acabado de los episodios anteriores.

## Piezas previstas

- Cuatro pies niveladores, cada uno con zapata, casquillo y collar.
- Bancada de nogal entre dos placas; tornillos de montaje y placa grabada «INERCIA · IV».
- Dos rieles de acero con sus topes y tornillos; una regla fija graduada.
- Cuatro ruedas macizas, aros, caras con radios grabados, cubos y tapas.
- Dos ejes y cuatro apoyos de los cojinetes.
- Chasis, cubierta de madera, borde metálico y tornillos del carro.
- Dos bases del pórtico, columnas segmentadas alrededor de sus abrazaderas, travesaño y remates.
- Eje de suspensión, caja de latón, esfera graduada de marfil y tornillo de articulación.
- Varilla articulada de sección real y esfera de latón apoyada en su extremo.
- Una pequeña caja de ajuste con mando moleteado sobre la cubierta.

## Modelo físico

La escala geométrica es común: 60 unidades por metro. Las ruedas giran sin deslizamiento según la distancia recorrida. El péndulo tiene longitud L desde el pivote hasta el centro de la esfera. Se usa la ecuación no lineal θ″ = −(g/L) sen θ − (a/L) cos θ − c θ′. El signo positivo indica inclinación hacia la derecha. La ecuación se integra con Runge–Kutta de cuarto orden; el tiempo puede recorrerse en ambas direcciones a partir de una trayectoria precalculada. La masa puntual no afecta al ángulo en este modelo.

Tres ensayos de seis segundos: reposo; velocidad constante desde el inicio, sin simular un arranque previo; y una maniobra con un segundo de aceleración, uno de marcha uniforme, uno de frenado y tres de reposo. Los cambios de aceleración son idealizados, pero la posición, la velocidad y el estado del péndulo son continuos. La aceleración de la maniobra y la velocidad del ensayo uniforme tienen controles independientes. Un pequeño amortiguamiento declarado permite ver cómo se atenúan las oscilaciones.

Durante la aceleración, la posición de equilibrio del péndulo satisface tan θ = −a/g; el péndulo real oscila alrededor de ella y no se confunde con ese equilibrio. Después de frenar puede seguir oscilando aunque la aceleración ya sea cero. La vista a bordo no modifica la física ni las mediciones respecto al suelo.

## Interacción y verificación

Controles de ensayo, punto de vista, tiempo, reproducción, velocidad del carro, aceleración de la maniobra y longitud del péndulo. Botones para detenerse en el arranque, la marcha uniforme, el frenado y el reposo posterior. Teclado, arrastre horizontal para recorrer el tiempo, movimiento reducido, pausa fuera de pantalla y al ocultar la pestaña. Demostración automática hasta la primera interacción.

Pruebas independientes de la cinemática, el péndulo, la convergencia del integrador, los extremos y la localización. Registro de cada sólido real y auditoría de apoyos, penetraciones, cobertura y profundidad en diferentes posiciones. Revisión visual en escritorio, teléfono de 390 px, ambos temas, detalles a 4× y varios momentos de movimiento. HTML autónomo con fuentes editables y construcción reproducible.

# Episodio 13 · Conservación de la energía

Alcance: una maqueta de montaña rusa como instrumento de laboratorio, con dos carriles, dos valles, una loma central y un carrito guiado. HTML autónomo en español, temas claro y oscuro y controles accesibles. El movimiento del carrito y el reparto de energías proceden del mismo modelo físico.

La idea: al descender, el carrito pierde altura y gana rapidez; al ascender sucede lo contrario. Sin rozamiento conserva su energía mecánica y recupera la altura inicial. Con resistencia viscosa, parte de esa energía se transforma en energía térmica, sin desaparecer del balance total.

## Piezas antes de dibujar

- Base: tablero de madera con cantos de latón, cubierta de esmalte, cuatro patas regulables, tornillos, placa grabada y regla de recorrido.
- Estructura: siete parejas de pilares, zapatas atornilladas, travesaños bajo los carriles y capiteles. Los pilares se ajustan al perfil real de la pista.
- Pista: dos carriles de acero de sección rectangular, cortados en tramos cortos para ordenar la profundidad. Dos valles a 3 m y una loma central a 18 m; extremos a 32 m. Los límites de liberación evitan los extremos.
- Carrito: dos ruedas sobre un eje, chasis, caja abierta, asiento y respaldo. Las ruedas y la orientación acompañan la tangente a la pista. El carrito representa una masa puntual guiada; las ruedas tienen masa despreciable y no se modela la rotación energética. El contacto geométrico se aproxima dentro de la resolución de la maqueta.
- Controles: altura de liberación, masa, resistencia opcional, inicio, pausa, reinicio y avance manual. El arrastre sobre la figura ajusta la altura de liberación; prepara una nueva prueba, sin modificar una trayectoria ya iniciada.
- Lecturas: altura, rapidez, tiempo, energías potencial, cinética, térmica y total. Una barra apilada conserva su longitud total; tabla de tres observaciones para comparar estados.

## Modelo

Coordenada horizontal x de −24 a +24 m. Cuatro tramos polinómicos de grado cinco conectan alturas [32, 3, 18, 3, 32] m en x = [−24, −12, 0, 12, 24] m, con pendiente y curvatura continuas. La velocidad v se mide a lo largo de la pista. Se integran dx/dt = v/√(1+h′²), dv/dt = −gh′/√(1+h′²) − γv y dQ/dt = mγv² con RK4 y pasos máximos de 1/240 s. La resistencia es proporcional a la velocidad, no un coeficiente de rozamiento de Coulomb. La masa no altera la trayectoria con esta ley; sí escala las energías.

Las dimensiones de la maqueta son esquemáticas. El carrito se mantiene guiado incluso sobre las crestas: no hay saltos, motor ni energía rotacional. El cero de energía potencial corresponde a h = 0 m, por debajo de los valles. La demostración inicial oscila sin rozamiento, se pausa al señalar o enfocar, y se detiene fuera de pantalla o con la pestaña oculta. Con movimiento reducido se trabaja por pasos de tiempo.

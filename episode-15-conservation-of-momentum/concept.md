# Episodio 15 · Conservación de la cantidad de movimiento

Alcance: un instrumento isométrico de sobremesa, interactivo, en HTML autónomo y en español. Un carril de aire triangular sostiene dos deslizadores con topes de resorte enfrentados. El movimiento de cada deslizador cambia durante el choque; la suma de sus cantidades de movimiento permanece constante.

## Piezas, antes de la geometría

- Base de madera, cantos de latón, cuatro patas regulables, cubierta de esmalte, tornillos y placa grabada.
- Carril de aire triangular sobre dos pedestales, tapas de extremo y tornillos, perforaciones en sus caras inclinadas, regla frontal y topes de seguridad fuera del tramo observado.
- Alimentación de aire: compresor de sobremesa con patas, caja ventilada, racor y manguera conectada al carril. No se añade humo ni animación decorativa.
- Dos deslizadores con patines que rodean las caras del carril, plataforma superior, placas de lastre y tornillos de fijación. El deslizador A lleva el único acento iluminado.
- Cada tope incluye una base, un resorte helicoidal y una cabeza plana. Los resortes se comprimen a la vez, sus cabezas permanecen en contacto y los cuerpos no se atraviesan.
- Controles: masa de B, velocidad inicial de A y sentido/velocidad inicial de B; configuraciones de igual masa, B pesado y choque frontal. Lanzar, pausar, avanzar, restablecer y comparar antes, durante y después del choque.
- Lecturas con signo de velocidad y cantidad de movimiento, fuerza interna, energía cinética y elástica. Un gráfico de p frente al tiempo y un cuaderno permiten comprobar la conservación.

## Modelo

Movimiento unidimensional y horizontal sin rozamiento. A tiene masa 0,200 kg; B puede tener 0,100, 0,200 o 0,400 kg. Cada resorte ideal sin masa tiene k = 32 N/m; su constante equivalente en serie es 16 N/m. Las posiciones iniciales de los centros son −0,50 m y +0,35 m. El primer contacto ocurre cuando su separación alcanza 0,432 m.

Durante el contacto, la compresión total es δ = (vA₀ − vB₀) sen(ωτ)/ω, con ω = √(k_eq/μ), μ = mAmB/(mA + mB), y 0 ≤ τ ≤ π/ω. Cada resorte se comprime δ/2. El centro de masa avanza con velocidad constante. Antes y después del contacto, ambos cuerpos siguen movimientos uniformes. Esta solución analítica conserva pA + pB y KA + KB + Uresortes durante todo el choque.

El reloj termina cuando un centro alcanza ±1,10 m: es el final del tramo de observación, antes de los topes físicos. No se simulan colisiones con el carril ni impulsos externos. Las velocidades pueden producir una prueba sin encuentro dentro de ese tramo; la interfaz lo indicará. El carril y los cuerpos conservan una escala geométrica común; perforaciones, lastres, alimentación y cojín de aire son esquemáticos. No se modelan pérdidas ni la masa de los resortes.

La demostración se pausa con el puntero o el foco y repite la prueba mediante una transición de opacidad. Fuera de pantalla y con la pestaña oculta se detiene el reloj. El movimiento reducido permite avanzar manualmente, sin transiciones.

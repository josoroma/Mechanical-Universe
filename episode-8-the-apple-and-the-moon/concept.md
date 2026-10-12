# Episodio 8 · La manzana y la Luna

Una maqueta de sobremesa representa el experimento mental del cañón de Newton. Un relieve circular terrestre de metal esmaltado se eleva sobre una base de madera; una montaña en relieve sostiene un pequeño cañón horizontal con carro, ruedas, ejes, abrazaderas y boca. Un indicador de latón señala la velocidad inicial. La trayectoria es una anotación matemática superpuesta y el punto luminoso representa un proyectil de tamaño despreciable: ambos se distinguen de las piezas sólidas del instrumento.

La interacción principal cambia la velocidad entre 0 y 12 km/s. Cuatro ejemplos comparan impacto, órbita circular, órbita elíptica y escape. Se puede lanzar, pausar, repetir y recorrer el tiempo con el control o arrastrando la figura. Los valores de altura, rapidez y tiempo proceden del mismo estado que mueve el proyectil. Un comparador independiente muestra cómo la atracción terrestre disminuye entre la superficie y la distancia lunar.

## Geometría prevista antes de construir

- Cuatro patas con zapatas, tornillos reguladores y collares; base con moldura, tapa, tornillos y una placa grabada.
- Pedestal posterior, cojinete y eje horizontal para el relieve terrestre; aro exterior, cuerpo y cara grabada con meridianos y continentes estilizados.
- Montaña prismática, plataforma, cuatro ruedas, dos ejes, chasis, tubo del cañón, abrazaderas de boca y recámara, pomo y abertura oscura.
- Indicador de velocidad con soporte, esfera graduada, aguja y pivote.

Todas las piezas estructurales se dibujan y registran mediante los mismos cilindros, discos, losas y prismas. Los contactos se resuelven por tangencia o caras coincidentes, y el orden de pintura se obtiene de planos separadores. No hay vista desmontada. El cañón y la montaña están ampliados; la Tierra y las trayectorias comparten una escala radial fija.

## Modelo físico

Tierra esférica inmóvil, radio medio idealizado de 6371 km; parámetro gravitatorio terrestre μ = 398600,435507 km³/s² (JPL DE440). Altitud de lanzamiento fija de 700 km, deliberadamente ficticia. Lanzamiento tangencial, sin atmósfera ni rotación terrestre, sin influencia lunar o solar y con masa del proyectil despreciable.

La integración RK4 de paso máximo 2 s resuelve r″ = −μr/|r|³. Los eventos de impacto o salida del campo se refinan por bisección. Una órbita completa termina en su período kepleriano; las trayectorias que alcanzan 2,2 radios terrestres terminan su representación, sin confundir la salida del campo con el escape. La energía específica determina si existe escape. La comparación lunar usa 384400 km entre centros y g(r) = μ/r²; no representa la gravedad sobre la superficie de la Luna.

## Verificación prevista

Conservación de energía y momento angular, órbita circular frente a su solución analítica, período, impacto, escape y casos límite; auditoría geométrica completa; extremos y ejemplos en ambos temas con líneas sueltas a cero; escritorio, móvil de 390 px, teclado, puntero, movimiento reducido, pausa fuera de pantalla y pestaña oculta; detalles a 4× y secuencia de movimiento.

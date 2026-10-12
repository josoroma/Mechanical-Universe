# Episodio 5 · Vectores

Abre **[index.html](index.html)** en un navegador. La máquina, los controles y las explicaciones están en español. El HTML incluye el SVG, los estilos y el programa: funciona sin conexión ni instalación. [episode-5-dark.html](episode-5-dark.html) inicia con el tema oscuro; ambas versiones permiten cambiar de tema.

## Qué puedes explorar

Cuatro brazos telescópicos forman un paralelogramo articulado. Los brazos opuestos mantienen la misma longitud y orientación. La cinta diagonal une el origen con la punta de **R = A + B**. Los cursores frontales muestran Rₓ a la izquierda y Rᵧ a la derecha; la tabla detalla las componentes, el módulo y la dirección de cada vector.

- Cambia los módulos de A y B, el giro del conjunto y la abertura entre los vectores.
- Elige el paralelogramo completo, el recorrido A seguido de B o el recorrido B seguido de A.
- Arrastra los mandos de A y B. Arrastra horizontalmente sobre el escenario para abrir o cerrar el mecanismo.
- Prueba los cuatro casos preparados, amplía el mecanismo o reproduce la demostración.
- Con el escenario enfocado, usa **1, 2 y 3** para cambiar de lectura, **espacio** para animar o pausar, **←/→** para variar la abertura y **↑/↓** para girar. **Inicio/Fin** llevan la abertura a sus topes; **R** restablece la configuración inicial.

La preferencia de movimiento reducido sustituye la animación por el botón **Avanzar**. La animación se detiene mientras la pestaña está oculta o el mecanismo queda fuera de pantalla.

## Modelo y alcance

Con a = |A|, b = |B|, α = dirección de A y β = abertura antihoraria desde A hasta B:

```text
A = (a cos α, a sen α)
B = (b cos(α + β), b sen(α + β))
R = A + B
|R| = √(Rₓ² + Rᵧ²)
```

La dirección de R se obtiene con `atan2(Rᵧ, Rₓ)`. Los números usan coma decimal y se redondean para su lectura; la geometría conserva la precisión completa. Las longitudes se expresan en una unidad arbitraria, u. Los ángulos se miden en el plano de la bancada.

Los topes del aparato admiten módulos de **1,5 a 2,5 u** y aberturas de **30° a 150°**. El giro común permite una vuelta completa. Las guías y correderas conservan sus dimensiones; cambia su solapamiento. Los separadores distribuyen los brazos entre alturas para evitar choques. Es una representación cinemática de la suma vectorial, sin simulación de fuerzas o rozamiento. El texto explica los casos colineales y el vector nulo, fuera de los topes del mecanismo.

## Archivos y reconstrucción

`model.mjs` contiene el modelo matemático; `scene.mjs`, los sólidos; `painter.mjs`, el orden de dibujo mediante planos separadores; `live.js`, la interacción; y `build.mjs`, la generación de los dos HTML. `concept.md` conserva el concepto previo a la geometría. El kit local y su licencia MIT están incluidos.

Con Node.js 22 o posterior, desde esta carpeta:

```sh
node build.mjs
node --test tests/model.test.mjs
node build.mjs --audit
node scripts/drive.mjs index.html --actions tests/browser.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/details.json --width 1440 --height 1300
node scripts/drive.mjs index.html --actions tests/extremes.json --width 1440 --height 1300 --reduced
node scripts/drive.mjs index.html --actions tests/idle.json --width 1440 --height 1300
```

Las pruebas visuales requieren Chrome o Chromium. `CHROME_PATH` permite indicar su ejecutable.

## Verificación realizada

- Diez pruebas: componentes, ley del coseno, cierre, conmutatividad, rotación, cancelación, cuadrantes, formato español e interpolación. Incluyen 288 configuraciones del mecanismo para comprobar las correderas y el orden de dibujo.
- Auditoría de 83 sólidos en nueve configuraciones: cero colisiones, apoyos faltantes o errores de profundidad.
- Escritorio y teléfono de 390 px, los tres modos, ambos temas, arrastre, teclado, ampliación, pausa, visibilidad y movimiento reducido. Sin errores de consola, dependencias de red ni desbordamiento horizontal.
- Comprobaciones de líneas con cero extremos sueltos en los estados revisados. Capturas de uniones y extensiones a 4×, secuencias de movimiento y estado al pasar el puntero en `shots/`.

## Referencias

- [OpenStax · Componentes de un vector](https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector).
- [OpenStax · Álgebra de vectores](https://openstax.org/books/university-physics-volume-1/pages/2-3-algebra-of-vectors).
- [Anatomy · Kit de ilustración técnica](https://github.com/wheresryan22/anatomy).

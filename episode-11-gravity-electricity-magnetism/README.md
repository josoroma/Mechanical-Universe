# Episodio 11 · Gravedad, electricidad y magnetismo

Abre [index.html](index.html) directamente en el navegador. Incluye una balanza de torsión inspirada en Cavendish (60 piezas), un generador electrostático de cilindro con electroscopio (71 piezas) y una brújula bajo un hilo con corriente (28 piezas). Interfaz y explicaciones en español; HTML autónomo, sin dependencias de red, temas claro y oscuro y diseño adaptable. [episode-11-dark.html](episode-11-dark.html) abre directamente el tema oscuro.

## Explorar

- **Balanza:** ajusta la masa de cada fuente y su separación inicial, arrastra el instrumento o usa las flechas. Las cifras muestran fuerza y torsión; el ángulo dibujado está ampliado cuatro veces. Los botones preparan masas alejadas, cercanas y más pesadas.
- **Generador:** regula las revoluciones por minuto y las fugas. «Una vuelta» gira a mano; «Detener» frena la manivela; «Descargar a tierra» elimina la carga. El electroscopio, la carga, el potencial y la energía comparten un único estado físico.
- **Brújula:** cambia la corriente con el control, las flechas o el arrastre. Los botones aplican +3 A, invierten la corriente o la llevan a cero. Este circuito es independiente del generador electrostático.
- **Accesibilidad:** controles nativos, etiquetas en español, foco visible y anuncios de acciones. Inicio y Fin seleccionan los extremos. Espacio sobre el generador da una vuelta. Con movimiento reducido, las posiciones se actualizan sin animación y cada vuelta aporta 12 nC. La demostración se pausa al señalar; cada instrumento detiene su reloj fuera de pantalla y la pestaña oculta detiene todos los relojes.

## Reconstruir y verificar

Node.js 22 o posterior; Chrome o Chromium para las pruebas de navegador. No requiere npm. Desde esta carpeta:

```sh
node build.mjs --audit
node --test tests/model.test.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs episode-11-dark.html --actions tests/reduced.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/generator.json --width 1440 --height 1000
node scripts/drive.mjs index.html --actions tests/motion.json --width 1440 --height 1000
node scripts/drive.mjs index.html --actions tests/visual.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/phone.json --width 390 --height 844 --reduced
```

El generador produce ambos temas. `model.mjs` calcula la física; `scene.mjs` contiene la geometría; `painter.mjs` prueba el orden mediante planos separadores de las formas reales; `live.js` actualiza atributos de las piezas; `page.html` y `styles.css` contienen el texto y la interfaz. El kit y los scripts están copiados aquí para que el episodio pueda reconstruirse sin tener instalada la habilidad Anatomy.

Las siete pruebas del modelo cubren el equilibrio y la estabilidad de torsión, las cuatro atracciones, la solución exacta de carga y fugas, potencial y energía, el equilibrio del electroscopio, el campo magnético y los límites de los controles. Un barrido adicional dentro de esas pruebas comprueba 575 configuraciones: separación y masa, giro completo, cinco cargas y ambas polaridades de corriente. La auditoría completa comprueba nueve estados, con contactos, apoyos, cobertura y orden de profundidad a cero problemas. Las comprobaciones de navegador cubren teclado, arrastre, descarga, corriente, temas, movimiento reducido, pausa y suspensión fuera de pantalla. Las capturas locales, incluidos los instrumentos a 4× en ambos temas, se guardan en `shots/`, excluido de Git.

## Física y límites

La balanza resuelve el equilibrio estático κθ = Σ(r × F)z, sumando las cuatro atracciones entre las dos masas fuente y las dos masas de prueba; no integra oscilaciones. El generador usa un aporte didáctico de 12 nC por vuelta, capacitancia de 12 pF y fuga exponencial con τ de 18 s o 5 s. Cada esfera ligera lleva el 2 % de la carga total; su posición equilibra peso y repulsión de Coulomb. No se simulan inducción, corona ni chispas. La brújula sigue la suma del campo terrestre horizontal (25 μT) y el de un hilo largo ideal situado 2 cm por encima. Los relojes solo avanzan mientras el instrumento está visible. Las maquetas no son reproducciones históricas ni dibujos a escala. Los valores y las idealizaciones también se explican en la página.

Referencias: [Harvard, balanza de Cavendish](https://sciencedemonstrations.fas.harvard.edu/presentations/cavendish-experiment), [Royal Society, manuscrito de Cavendish de 1798](https://makingscience.royalsociety.org/items/l-and-p_11_68/paper-experiments-to-determine-the-density-of-the-earth-by-henry-cavendish), [Science Museum, generador de fricción](https://collection.sciencemuseumgroup.org.uk/objects/co7211), [OpenStax, campo de un hilo con corriente](https://openstax.org/books/university-physics-volume-2/pages/12-2-magnetic-field-due-to-a-thin-straight-wire), [NIST, constantes CODATA 2022](https://physics.nist.gov/cuu/pdf/all.pdf).

Kit Anatomy bajo licencia MIT; véase [LICENSE](LICENSE).

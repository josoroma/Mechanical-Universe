# Episodio 12 · El experimento de Millikan

Laboratorio interactivo en español: aparato isométrico con atomizador, placas de cobre, lámpara, microscopio y fuente de tensión. La vista óptica sigue una gota de aceite; permite medir su caída libre, ajustar el equilibrio y registrar la carga inferida.

Abre `index.html` directamente en el navegador. `episode-12-dark.html` ofrece el mismo laboratorio con tema oscuro inicial. Ambos archivos integran SVG, estilos y JavaScript; funcionan sin servidor, paquetes externos ni conexión.

## Experimentar

1. Pulsa **Medir caída libre · 0,20 mm**. El campo se apaga y el cronómetro se detiene al completar esa distancia.
2. Ajusta una tensión positiva hasta suspender la gota. **Ajustar al equilibrio** proporciona una ayuda calculada por el modelo.
3. Pulsa **Registrar carga**. El cuaderno estima el radio a partir de la velocidad medida y la carga a partir de ese radio y de la tensión observada. Admite un desajuste entre fuerza eléctrica y peso efectivo de hasta el 0,3 %.
4. **Capturar un electrón** conserva el tamaño de la gota y modifica su carga. Vuelve a equilibrarla y compara las cargas registradas. **Pulverizar otra gota** introduce una gota distinta y requiere otra medición de caída.

La tensión abarca −500 a +500 V. La polaridad positiva de la placa superior ejerce una fuerza ascendente sobre la gota negativa; la polaridad opuesta favorece el descenso. El cuaderno conserva las ocho últimas entradas durante la sesión, evita registros duplicados y se puede vaciar.

Arrastra horizontalmente el aparato, usa el control de tensión o enfoca la figura y pulsa las flechas (5 V; Mayús + flecha, 25 V). Inicio y Fin seleccionan los extremos. Espacio pausa o reanuda. El atomizador sustituye la gota mediante una transición de opacidad.

La demostración se pausa con el puntero o el foco sobre el laboratorio. El reloj también se detiene cuando ambos instrumentos quedan fuera de pantalla o la pestaña está oculta. Con movimiento reducido, no hay animación ni reproducción automática: **Avanzar 1 s** permite realizar la medición y **Ver otro estado** cambia la tensión inmediatamente.

## Física y alcance

`model.mjs` usa unidades SI. El eje vertical es positivo hacia arriba y U = Vsuperior − Vinferior. Para una gota negativa q = −ne, el campo es E = −U/d, el peso efectivo es W = (4πa³/3)(ρaceite − ρaire)g y la velocidad terminal es v = (qE − W)/β. El arrastre del aire es −βv. Las tarjetas muestran estas tres fuerzas, que se compensan a velocidad terminal.

Se usa d = 7,62 mm, ρaceite = 855 kg/m³, ρaire = 1,204 kg/m³, η = 1,81 × 10⁻⁵ Pa·s, p = 101325 Pa y una corrección de deslizamiento β = 6πηa/[1 + b/(pa)], con b = 8,20 × 10⁻³ Pa·m. Se omiten el breve transitorio inercial, el movimiento browniano, la evaporación y los efectos de borde. La integración de posición incluye exactamente la variación exponencial de tensión, incluso cuando cambia durante un fotograma.

El cronómetro usa la distancia recorrida y cuenta únicamente la fracción del último paso necesaria para completar 0,20 mm. La inversión de la ley de caída recupera el radio sin consultar el número de electrones de la gota. La carga registrada se calcula como q = −Wd/U. La serie de cinco gotas tiene radios y cargas controlados; no hay ruido experimental. Los valores ilustran la cuantización con datos calculados, sin constituir una medición independiente de la constante e, exacta en el SI actual.

La imagen del microscopio está enderezada. Sus divisiones menores representan 0,1 mm y la posición es proporcional a la altura; la gota se dibuja ampliada. El aparato se muestra abierto en sección y no está a escala. Tocar una placa termina la observación. En pausa se conserva la posición, pero la lectura de velocidad sigue mostrando el valor terminal previsto para el campo.

## Reconstruir y verificar

Requiere Node.js 22 o posterior. Desde esta carpeta:

```sh
node build.mjs --audit
node --test tests/physics.test.mjs
node scripts/drive.mjs index.html --actions tests/reduced.json --width 1440 --height 1800 --reduced
node scripts/drive.mjs index.html --actions tests/normal.json --width 1440 --height 1100
node scripts/drive.mjs index.html --actions tests/mobile.json --width 390 --height 844 --reduced
node scripts/drive.mjs index.html --actions tests/tour.json --width 1440 --height 1100
```

Las pruebas de navegador usan Chrome o Chromium instalado localmente; `CHROME_PATH` permite indicar el ejecutable. Las capturas se guardan en `shots/`, excluida de Git. Se revisaron escritorio, móvil de 390 px, ambos temas, los contactos del aparato a 4×, el estado al señalar y secuencias de ajuste de campo y sustitución de gotas. La consola del navegador no presenta errores. Las comprobaciones de líneas arrojan cero extremos sueltos en el aparato y la retícula, incluidos los extremos del dial.

La auditoría geométrica verifica las **107 piezas sólidas** del aparato: soportes, contactos, separación y orden de profundidad, con cero incidencias. La geometría que se audita es la que genera el SVG. El puntero es un grabado sobre el dial; la gota y la retícula pertenecen a una imagen óptica bidimensional cuyo movimiento se comprueba con el modelo físico y las pruebas de navegador.

## Archivos

- `concept.md`: diseño del instrumento y piezas antes de la geometría.
- `scene.mjs`, `painter.mjs`, `audit.mjs`, `kit/`: geometría, dibujo y auditoría.
- `model.mjs`: física, integración temporal e inferencia del radio y la carga.
- `page.html`, `styles.css`, `materials.css`, `live.js`: contenido y comportamiento.
- `build.mjs`: generador de los dos HTML autónomos.
- `tests/`, `scripts/`: pruebas físicas y revisión en navegador.

## Fuentes

- [PASCO · manual del aparato de gotas de aceite](https://cdn.pasco.com/product_document/Millikan-Oil-Drop-Manual-AP-8210B.pdf): placas, microscopio, método y corrección del arrastre.
- [Millikan · conferencia Nobel de 1923](https://www.nobelprize.org/uploads/2018/06/millikan-lecture.pdf): método de observación y cambios discretos de carga.
- [NIST · carga elemental](https://physics.nist.gov/cgi-bin/cuu/Value?e): valor exacto de e.

El kit Anatomy conserva su licencia MIT en `LICENSE`, incluida también en los HTML generados.

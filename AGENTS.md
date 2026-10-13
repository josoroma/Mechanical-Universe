# Convenciones de El universo mecánico

Estas instrucciones se aplican al índice y a todos los episodios de esta carpeta. Recogen las decisiones de diseño acordadas con el usuario. Cuando se use la habilidad Anatomy, conserva su construcción física y sus comprobaciones, y aplica las preferencias visuales de esta colección.

## Idioma y entregables

- Escribe toda la interfaz y el contenido educativo en español correcto: títulos, controles, explicaciones, unidades, mensajes y etiquetas accesibles.
- Crea cada episodio en su carpeta `episode-N-…/`, dentro de esta colección, con su fuente editable y un `index.html` autónomo.
- Mantén los títulos y la disponibilidad de los 52 episodios en `episodes.mjs`. No enlaces episodios pendientes.
- El icono y el texto «El universo mecánico» de la cabecera forman un enlace al índice de la colección: `../index.html` desde los episodios e `index.html` desde el propio índice. No los dirijas al episodio 1. Conserva su aspecto de marca y el foco visible del teclado.

## Tema predeterminado

- El tema oscuro es el predeterminado, incluso si el sistema operativo usa un tema claro. El HTML debe incluirlo desde el primer renderizado.
- Importa `DEFAULT_THEME` de `theme.mjs` en los generadores y úsalo para `index.html`. Conserva los archivos `episode-N-dark.html` existentes como rutas compatibles.
- Mantén el selector de tema claro/oscuro y actualiza su etiqueta accesible según la acción disponible. Respeta una preferencia válida ya guardada donde exista persistencia.

## Estilo visual acordado

- Usa `theme.css` como fuente de la interfaz y `machine-materials.css` para el acabado de los instrumentos. Integra ambos mediante `writeThemedHtml`; no copies otra paleta ni agregues dependencias externas a los HTML finales.
- La interfaz está dirigida a adolescentes: tarjetas redondeadas, tipografía sans serif, títulos con peso fuerte y degradados de azul a violeta y turquesa. Reutiliza los tokens actuales, los números de episodio y los pequeños acentos rosas.
- En oscuro, los fondos y las superficies son negros y grises neutros: `--background: #0a0a0a`, `--card: #161616`, `--secondary: #232323` y `--border: #363636`. No vuelvas a usar azul marino como fondo de página, tarjetas, tablas o secciones seleccionadas.
- Conserva la cuadrícula sutil de 64 px y los difuminados suaves azules y violetas. El color pertenece a títulos, acciones, indicadores y magnitudes físicas; las superficies oscuras principales siguen siendo neutras.
- En claro, conserva el fondo `#f5f8ff`, las tarjetas blancas y los tintes suaves de la paleta. Ambos temas deben resultar legibles y cuidados.
- Usa esquinas de aproximadamente `1rem`, sombras suaves y jerarquías claras entre títulos, explicaciones, lecturas y controles.
- Las secciones seleccionadas se distinguen por su fondo y su texto. No añadas líneas inferiores, bordes inferiores de acento ni pseudoelementos de subrayado para indicar la selección. Conserva el indicador de foco del teclado.
- Da espacio interior a toda la tarjeta de una tabla, incluido el título y el resultado: 24 px en escritorio y 16 px en móvil. Las celdas usan 14 × 12 px en escritorio y 12 × 10 px en móvil. Si una tabla no cabe, permite desplazamiento horizontal dentro de su tarjeta, sin desbordar la página.

## Instrumentos y simulaciones

- Los aparatos tienen acabado de grafito, acero oscuro, vidrio ahumado y escalas claras en ambos temas. Evita grandes bases o estructuras de azul brillante.
- Conserva el relieve, las juntas, los biseles y los detalles que hacen reconocible cada mecanismo. Aclara ligeramente las caras y las aristas en oscuro para distinguirlas del fondo.
- Mantén el cobre y los colores que explican una función física, por ejemplo polos magnéticos, cargas, energía o los carros A y B. No uses el acabado oscuro para borrar estas distinciones.
- El movimiento, las cifras y las explicaciones deben proceder del mismo modelo físico. Conserva los controles de teclado, la interacción táctil, la pausa fuera de pantalla y el respeto al movimiento reducido.

## Construcción y verificación

- Edita las fuentes, no solamente los HTML generados. Ejecuta `node build-all.mjs` después de cambios compartidos; para un solo episodio puedes ejecutar su `build.mjs`.
- Comprueba los cambios de tema con `node tests/themes.mjs`: estado inicial oscuro, selector funcional, contraste y disposición a 1440 y 390 px, sin errores de consola.
- Abre las capturas generadas. Para cambios en tablas o selectores, revisa también esas zonas, porque pueden quedar fuera de las capturas iniciales de página.
- Los escenarios de captura deben elegir explícitamente el tema que describen, sin depender del tema predeterminado del sitio.
- Para cambios en el modelo o en la geometría, ejecuta además las pruebas y auditorías pertinentes del episodio y las comprobaciones de Anatomy.
- Conserva el funcionamiento sin conexión. No incluyas capturas ni archivos temporales en Git; usa `shots/` y `.scratch/`, que están excluidos.

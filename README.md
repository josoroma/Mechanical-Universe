# El universo mecánico

Índice de los 52 episodios de la colección, con títulos en español. Los episodios 1–30 están disponibles como explicaciones interactivas; los episodios 31–52 figuran como pendientes y no tienen enlaces vacíos.

Abre [index.html](index.html) directamente en un navegador. El índice y los episodios funcionan sin servidor ni conexión. La interfaz se abre en tema oscuro, permite cambiar al tema claro y se adapta a pantallas pequeñas. El índice respeta la preferencia de tema que hayas guardado.

Sitio: <https://josoroma.github.io/Mechanical-Universe/>

## Actualizar el índice

Con Node.js 22 o posterior, modifica los títulos o las carpetas en `episodes.mjs` y ejecuta:

```sh
node build-index.mjs
```

Un episodio solo recibe un enlace cuando tiene una carpeta asignada y existe su `index.html`. El generador valida los 52 títulos y todos los destinos. `index.css` contiene los estilos; el HTML generado integra los estilos y el selector de tema.

Cada carpeta de episodio conserva su código fuente, documentación, pruebas y licencia del kit Anatomy. Las capturas de revisión y los registros locales se excluyen de Git.

## Temas de la colección

`theme.css` define la paleta de la interfaz, inspirada en Luma: azul, violeta y turquesa, superficies claras o negras y grises, títulos con degradado y tarjetas redondeadas. El tema oscuro conserva la cuadrícula y los difuminados suaves. Las tablas tienen espacio interior y desplazamiento horizontal dentro de su tarjeta cuando hace falta; las secciones seleccionadas se distinguen por el fondo y el texto, sin una línea inferior. Conserva colores distintos para las magnitudes físicas. Los controles de tema de cada página siguen seleccionando la versión clara u oscura.

`machine-materials.css` define por separado el acabado de los instrumentos: grafito, acero oscuro, vidrio ahumado y escalas claras en ambos temas. El cobre y los colores que identifican elementos físicos conservan su función; los carros A y B tienen pequeñas plataformas azules y turquesas. Las caras y las juntas se aclaran ligeramente en el tema oscuro para conservar el relieve.

`theme.mjs` define `DEFAULT_THEME` como oscuro e integra estos estilos al final de cada HTML completo. No hay fuentes, bibliotecas ni hojas de estilo que deban descargarse. Los archivos `page.html` de algunos episodios son plantillas parciales; reciben el tema cuando su generador produce las páginas completas. Las rutas `episode-N-dark.html` siguen disponibles.

[AGENTS.md](AGENTS.md) documenta el idioma, la paleta, los materiales, el espacio de las tablas y las reglas de selección para conservar este diseño en futuros episodios.

Para actualizar las 61 páginas publicadas después de modificar el tema:

```sh
node build-all.mjs
```

También puedes ejecutar el `build.mjs` de un episodio. Mantén `theme.css`, `machine-materials.css`, `theme.mjs` y `playback.js` en la carpeta superior al copiar el código fuente para regenerarlo. Los HTML finales son autónomos.

Para comprobar el cambio de tema de cada página, el contraste de la paleta y los tamaños de 1440 y 390 px, con Chrome instalado:

```sh
node tests/themes.mjs
```

La prueba también comprueba que se muestran las máquinas y que los textos principales no se recortan. Guarda cuatro hojas de revisión en `shots/themes/`. Puedes indicar otro navegador Chromium mediante `CHROME_PATH`.

`node tests/playback.mjs` comprueba la recuperación del reloj al navegar con Atrás, restaurar una página y volver de una pestaña oculta, a 1440 y 390 px. También verifica que no se dupliquen los relojes y que los episodios 17–26 conserven la pausa manual y puedan repetir el recorrido al terminar.

## GitHub Pages

El sitio es estático y se publica desde la raíz de la rama `main`. `.nojekyll` permite servir directamente los archivos. Los enlaces de los episodios son relativos y funcionan dentro de `/Mechanical-Universe/`.

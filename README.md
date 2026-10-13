# El universo mecánico

Índice de los 52 episodios de la colección, con títulos en español. Los episodios 1–15 están disponibles como explicaciones interactivas; los episodios 16–52 figuran como pendientes y no tienen enlaces vacíos.

Abre [index.html](index.html) directamente en un navegador. El índice y los episodios funcionan sin servidor ni conexión. La interfaz incluye temas claro y oscuro y se adapta a pantallas pequeñas.

Sitio: <https://josoroma.github.io/Mechanical-Universe/>

## Actualizar el índice

Con Node.js 22 o posterior, modifica los títulos o las carpetas en `episodes.mjs` y ejecuta:

```sh
node build-index.mjs
```

Un episodio solo recibe un enlace cuando tiene una carpeta asignada y existe su `index.html`. El generador valida los 52 títulos y todos los destinos. `index.css` contiene los estilos; el HTML generado integra los estilos y el selector de tema.

Cada carpeta de episodio conserva su código fuente, documentación, pruebas y licencia del kit Anatomy. Las capturas de revisión y los registros locales se excluyen de Git.

## GitHub Pages

El sitio es estático y se publica desde la raíz de la rama `main`. `.nojekyll` permite servir directamente los archivos. Los enlaces de los episodios son relativos y funcionan dentro de `/Mechanical-Universe/`.

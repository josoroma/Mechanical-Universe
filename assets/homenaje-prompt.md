# Portada del homenaje

Imagen: [homenaje-universo-mecanico.png](homenaje-universo-mecanico.png).

Corregida con la herramienta integrada `image_gen`: texto íntegramente en español, contornos nítidos y separación clara entre «El» y «universo». Conserva la composición panorámica, los instrumentos y el estilo oscuro de la colección.

El homenaje se refiere a [The Mechanical Universe… and Beyond](https://www.its.caltech.edu/~tmu/), la serie educativa de Caltech e INTELECOM.

## Texto de la portada

- HOMENAJE A LA SERIE ORIGINAL
- El universo
- mecánico.
- 52 episodios interactivos
- para explorar la física en español.

## Prompt de corrección

```text
Use case: text-localization / precise typography correction.
Edit target: the supplied existing widescreen tribute banner.
Preserve the composition, black and charcoal background, faint grid, blue-violet-turquoise title gradient, light accents, original mechanical orrery, mass-spring instrument, copper coils, graphite plinths, shadows and camera. Change ONLY the lettering in the left text area. Keep the apparatus on the right unchanged.
Replace ALL the existing lettering in the left text area with clean, correctly spelled Spanish text EXACTLY as follows:
Small heading: "HOMENAJE A LA SERIE ORIGINAL"
Large main title, first line: "El universo"
Large main title, second line: "mecánico."
Subtitle, first line: "52 episodios interactivos"
Subtitle, second line: "para explorar la física en español."
There must be a clear normal word space between "El" and "universo": these are two separate words, never "Eluniverso". Keep the u of universo lowercase.
Accents are mandatory and must be sharply drawn: mecánico has á; física has í; español has ñ. Render exactly the specified wording. The heading is entirely Spanish, with no "The Mechanical Universe" or other English words.
Typography must look professionally typeset with a clean bold sans-serif: flat solid fills, precise geometric character shapes, crisp smooth contours and correct kerning. No blur, no glow on letters, no motion blur, no grain or paint texture within letters, no soft ghosting, no duplicate outlines, no warped letters. The first title line is warm white and the second has the original smooth blue-violet-turquoise gradient, contained sharply inside the glyphs. Use generous separation between words, lines and subtitle, and avoid touching the instruments. Text should be razor-sharp and readable at README display size. Keep the 16:9 panoramic framing and export at high resolution, preferably 2560 × 1440 or higher, without artificial sharpening halos. Do not introduce any new lettering or change the instruments.
```

## Ajuste del espaciado

```text
Edit this banner with ONE very specific typography correction. Erase and re-typeset ONLY the white first main-title line. It must read "El universo", with a conspicuous, proper word space. The existing image reads like "Eluniverso" because the l and u nearly touch. Separate these two words with at least 60 pixels of completely empty horizontal space at the current 1672-pixel canvas width. This is a word space, not letter tracking. Reduce the font size of this first line about 8 percent if needed so the entire phrase still fits in the original left text column, ending before x = 820. Keep both words on the same baseline. The u must be lowercase. Use crisp, professionally typeset solid white bold sans-serif glyphs with clean precise edges, no blur or texture. Maintain the left alignment at x = 70.
Everything else is already correct and must remain unchanged: "HOMENAJE A LA SERIE ORIGINAL"; the gradient "mecánico."; "52 episodios interactivos"; "para explorar la física en español."; the Spanish accents; the instruments; the black grid background; the colors; the composition; and the widescreen framing. Change no other text or pixels except the immediate area of the first white title line.
```

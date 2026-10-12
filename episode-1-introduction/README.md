# Episode 1: Introduction

Open [index.html](index.html) directly in a browser. Everything is embedded; the illustration works offline. [episode-1-dark.html](episode-1-dark.html) opens in the dark theme.

Choose Ptolemaic, Copernican or Newtonian to change the mechanism. Play or scrub through eight Earth years, select a planet for measurements, and adjust Mars's eccentricity in the Newtonian model. The shaded sectors show equal swept areas over equal 0.12-year intervals.

Focus the illustration for keyboard controls: **1–3** choose an era, **Space** plays or pauses, **Left/Right** step through time, **Shift + Left/Right** take larger steps, **Home/End** move to the time limits, and **Escape** pauses. Reduced motion disables autoplay and transitions while retaining manual controls. Animation pauses when the illustration is offscreen or its tab is hidden.

## Rebuild

Requires Node.js 20.10 or newer. No dependencies or API keys are needed.

```sh
node build.mjs
node --test tests/model.test.mjs
node build.mjs --audit
```

`model.mjs` contains orbital calculations. `mechanism.mjs` builds the moving SVG parts. `instrument.mjs` builds the fixed instrument. `live.js` handles interaction, and `styles.css` contains both themes and the phone layout. `kit/` includes the local drawing and audit dependencies, so the source remains portable.

The model tests cover Kepler's equation, conservation of energy and angular momentum, equal swept areas, retrograde motion, orbital periods, unit conversion and finite carrier coordinates. The geometry audit checks the three opening poses, including maximum Mars eccentricity. Individual poses can be checked with `node audit.mjs --mode=2 --time=1.8 --ecc=0.45 --actual-order`.

`tests/browser-actions.json` and `tests/reduced-actions.json` contain repeatable browser checks for Anatomy's `scripts/drive.mjs`. Review screenshots and verification logs are in `shots/`.

## Model and attribution

Distances are compressed and globes enlarged. The Ptolemaic and Copernican mechanisms are simplified historical reconstructions; the Newtonian view is a fixed-Sun two-body model, not an ephemeris. See [concept.md](concept.md) for the mechanism plan and scientific sources.

Built with the MIT-licensed [Anatomy SVG kit](https://github.com/wheresryan22/anatomy). The upstream license is included in [LICENSE](LICENSE).

import {DEFAULT_THEME, writeThemedHtml} from '../theme.mjs';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
import * as D from './painter.mjs';
import {check} from './audit.mjs';
const HERE=dirname(fileURLToPath(import.meta.url)),read=file=>readFileSync(join(HERE,file),'utf8');
const strip=s=>s.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
const bundle=(file,name,exports,preface='')=>`const ${name}=(()=>{${preface}\n${strip(read(file))}\nreturn {${Object.keys(exports).join(',')}};})();\n`;
if(process.argv.includes('--audit'))check();
const runtime=(bundle('kit/iso-kit.mjs','K',K)+bundle('kit/lathe.mjs','G',G,'const {cameraOf,iso,pathOf}=K;')+bundle('model.mjs','O',O)+bundle('scene.mjs','S',S)+bundle('painter.mjs','D',D)+strip(read('live.js'))).replace(/<\/script/gi,'<\\/script');
const parts=S.scene(),art=S.svgParts(parts,D.orderParts(parts,S.P));
const apparatus=`<div class="stage" tabindex="0" role="slider" aria-label="Altura de liberación en metros. Arrastra horizontalmente o usa las flechas; Inicio y Fin seleccionan los extremos; Espacio pausa o avanza un paso." aria-valuemin="8" aria-valuemax="30" aria-valuenow="26" aria-valuetext="26 metros"><div class="stage-corners"><span>Fig. 13.1 / Pista de energía</span><span>Carrito guiado · ruedas de masa despreciable</span></div><svg class="iso-svg drawing" viewBox="0 0 ${S.WIDTH} ${S.HEIGHT}" role="img" aria-labelledby="apparatus-svg-title apparatus-svg-desc"><title id="apparatus-svg-title">Montaña rusa de laboratorio sobre una base de madera</title><desc id="apparatus-svg-desc">Dos carriles paralelos de acero forman dos valles y una loma central. Pilares con zapatas y travesaños sostienen la pista. Un carrito con ruedas de latón y asiento claro sigue la pendiente de los carriles. La base tiene patas regulables, tornillos, una regla y una placa grabada.</desc><ellipse class="shadow" cx="560" cy="510" rx="420" ry="30"/><g class="machine">${art}</g></svg><div class="stage-bottom"><span id="motion-state">Preparado a 26 m</span><span>Arrastra para elegir la altura inicial</span></div></div>`;
const body=read('page.html').replace('{{apparatus}}',apparatus);
for(const[name,theme]of[['index.html', DEFAULT_THEME],['episode-13-dark.html','dark']]){writeThemedHtml(join(HERE,name),`<!doctype html>\n<!-- ${read('LICENSE')} -->\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Suelta un carrito, observa su altura y rapidez y sigue la conservación de la energía en una montaña rusa interactiva. Episodio 13 de El universo mecánico, en español."><title>Conservación de la energía — El universo mecánico</title><style>${K.ISO_CSS}\n${read('materials.css')}\n${read('styles.css')}</style></head><body class="iso" data-theme="${theme}">${body}<script type="module">${runtime}</script></body></html>`);console.log(`${name}: español · autónomo · ${parts.length} piezas`);}

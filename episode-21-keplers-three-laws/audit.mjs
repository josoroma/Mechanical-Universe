import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.1,.3,.5,.7,1].map((f,i)=>{const s=O.create({axis:i%2?.8:1.3,eccentricity:i%3?.65:0});return O.advance(s,O.position(s).period*f);}));}

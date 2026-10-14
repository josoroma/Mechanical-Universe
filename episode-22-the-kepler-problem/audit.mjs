import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.125,.25,.5,.75,1].map((f,i)=>{const s=O.create({speedRatio:i%2?.7:1.15,distance:i%2?.15:.24,mu:.006});return O.advance(s,O.position(s).period*f);}));}

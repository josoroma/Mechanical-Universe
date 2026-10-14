import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.25,.5,1,1.05].map((f,i)=>{const s=O.create({destination:i%2?1.2:2.2,phaseOffset:i%2?-45:45});return O.advance(s,O.transfer(s).flight*f);}));}

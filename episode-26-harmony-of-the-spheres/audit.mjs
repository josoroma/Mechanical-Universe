import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.073,.25,.5,.79,1].map((t,i)=>O.advance(O.create({eccentricity:i%2?.4:0,planet:i%6,solid:i%5}),t)));}

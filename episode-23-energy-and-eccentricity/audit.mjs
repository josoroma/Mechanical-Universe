import {auditScene} from '../laboratory/audit-scene.mjs';
import * as O from './model.mjs';
import * as S from './scene.mjs';
export function check(){auditScene(S,[0,.2,.5,.8,1.5,3].map((t,i)=>O.advance(O.create({eccentricity:i%2?.6:0,parameter:i%3?.7:1}),t)));}

import {check} from '../audit.mjs';
for(const values of [{angle:10},{angle:65},{mode:'platform',radius:.15},{mode:'platform',radius:.85}]){
  for(const phase of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
    console.log(`\nPOSE ${JSON.stringify(values)} · fase ${phase}`);
    check(values,phase);
  }
}

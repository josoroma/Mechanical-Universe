import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {episodes} from '../episodes.mjs';
import {chromePort} from '../laboratory/scripts/chrome-port.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),profile=mkdtempSync(join(tmpdir(),'universe-playback-'));
const chrome=spawn(process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--allow-file-access-from-files','about:blank']);
let socket;
const server=createServer((request,response)=>{try{const path=new URL(request.url,'http://localhost').pathname;assert(!path.includes('..'));const file=join(root,decodeURIComponent(path));response.setHeader('Content-Type','text/html; charset=utf-8');response.end(readFileSync(file));}catch{response.writeHead(404);response.end();}});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;
 const port=await chromePort(chrome,profile),target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r);let id=0;const pending=new Map(),errors=[];socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.error||r.result.exceptionDetails)throw Error(JSON.stringify(r.error||r.result.exceptionDetails));return r.result.result.value;};
 const until=async(expression,timeout=4000)=>{const end=Date.now()+timeout;do{if(await ev(expression))return;await wait(50);}while(Date.now()<end);throw Error('Timeout: '+expression);};
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const request=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window),pending=new Set();window.__ticks=0;window.__discardFrames=()=>{for(const id of pending)cancel(id);pending.clear();};window.requestAnimationFrame=cb=>{const id=request(t=>{pending.delete(id);window.__ticks++;cb(t);});pending.add(id);return id;};window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id);};window.__pendingFrames=()=>pending.size;})()`});
 for(const width of[1440,390]){await send('Emulation.setDeviceMetricsOverride',{width,height:1200,deviceScaleFactor:1,mobile:false});for(const ep of episodes.filter(e=>e.folder)){
  const url=base+ep.folder+'/index.html';await send('Page.navigate',{url});await until(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&!!window.MechanicalPlayback`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:3,y:3});await ev('document.activeElement.blur();scrollTo(0,0)');await until('__ticks>3');
  // Emulate browser suspension: the document keeps its id, but the callback is gone.
  await ev(`window.__discardFrames();window.before=__ticks;dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));`);await until('__ticks>before+2');assert((await ev('__pendingFrames()'))<=1,'Más de un reloj · '+ep.number);
  // Returning from a hidden tab must also renew the clock.
  await ev(`Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));window.before=__ticks;`);await wait(120);assert.equal(await ev('__ticks'),await ev('before'),'Reloj en pestaña oculta · '+ep.number);
  await ev(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));`);await until('__ticks>before+2');
  // Repeated restoration must not create additional animation loops.
  await ev(`dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.__discardFrames();dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));window.before=__ticks;`);await until('__ticks>before+2');assert((await ev('__pendingFrames()'))<=1,'Reloj duplicado · '+ep.number);
  if(ep.number>=17){
   await ev(`const t=document.getElementById('time');t.value=t.max;t.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('play').click();`);await until(`+document.querySelector('.laboratory').dataset.time>0&&+document.querySelector('.laboratory').dataset.time<+document.getElementById('time').max`);
   await ev(`document.getElementById('play').click();window.timeBefore=+document.querySelector('.laboratory').dataset.time;dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));`);await wait(150);assert.equal(await ev(`+document.querySelector('.laboratory').dataset.time`),await ev('timeBefore'),'No conserva la pausa manual · '+ep.number);
   await ev(`document.getElementById('play').click()`);await until(`+document.querySelector('.laboratory').dataset.time>timeBefore`);
  }
  // Navigate to the collection and use real browser history to return.
  const history=await send('Page.getNavigationHistory'),entry=history.result.entries[history.result.currentIndex].id;
  await ev(`document.querySelector('a.wordmark').click()`);await until(`location.href===${JSON.stringify(base+'index.html')}&&document.readyState==='complete'`);
  await send('Page.navigateToHistoryEntry',{entryId:entry});await until(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&!!window.MechanicalPlayback`);await ev('document.activeElement.blur();window.before=__ticks');await until('__ticks>before+2');
  assert.equal(errors.length,0,errors.join('\n'));console.log(`${width}px · Episodio ${ep.number}: restauración, pestaña oculta y reloj único${ep.number>=17?', repetición y pausa manual':''} correctos`);
 }}
 console.log('26 episodios · 52 escenarios de reproducción · consola limpia.');
}finally{socket?.close();chrome.kill();server.close();await wait(120);rmSync(profile,{recursive:true,force:true});}

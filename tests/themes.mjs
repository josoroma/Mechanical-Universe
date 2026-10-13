import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {episodes} from '../episodes.mjs';
import {chromePort} from '../episode-16-harmonic-motion/scripts/chrome-port.mjs';

// Browser regression checks for every generated page, rather than just a demo.
const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'shots', 'themes');
mkdirSync(out, {recursive: true});
const pages = [{file:'index.html', number:0, theme:'light'}];
for (const {number, folder} of episodes.filter(episode => episode.folder)) {
  pages.push({file:`${folder}/index.html`, number, theme:'light'});
  pages.push({file:`${folder}/episode-${number}-dark.html`, number, theme:'dark'});
}
for (const {file} of pages) {
  const html = readFileSync(join(root, file), 'utf8');
  assert.equal((html.match(/data-collection-theme="luma"/g) || []).length, 1, file);
  assert(!/<(?:link|script)[^>]+(?:href|src)=/i.test(html), `External runtime asset: ${file}`);
}
const binary = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
assert(existsSync(binary), 'Instala Chrome o define CHROME_PATH.');
const profile = mkdtempSync(join(tmpdir(), 'universe-theme-'));
const chrome = spawn(binary, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank']);
let socket;
try {
  const port = await chromePort(chrome, profile);
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method:'PUT'})).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => {socket.onopen = resolve;});
  let next = 0;
  const pending = new Map(), problems = [];
  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const callback = pending.get(data.id);
      if (callback) {pending.delete(data.id); callback(data);}
    } else if (data.method === 'Runtime.exceptionThrown') {
      problems.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    } else if (data.method === 'Runtime.consoleAPICalled' && ['error','warning'].includes(data.params.type)) {
      problems.push(data.params.args.map(arg => arg.value || arg.description).join(' '));
    }
  };
  const send = (method, params = {}) => new Promise(resolve => {
    const id = ++next;
    pending.set(id, resolve);
    socket.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const reply = await send('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true});
    if (reply.error || reply.result?.exceptionDetails) throw new Error(JSON.stringify(reply.error || reply.result.exceptionDetails));
    return reply.result.result.value;
  };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]});
  await send('Page.addScriptToEvaluateOnNewDocument', {source:'try{localStorage.clear()}catch{}'});
  const inspect = String.raw`(() => {
    const style = getComputedStyle(document.body);
    const canvas = document.createElement('canvas'); canvas.width=canvas.height=1;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    const rgb = value => {ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3)};
    const lum = rgb => rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    const contrast = (a,b) => {const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const token = key => style.getPropertyValue(key).trim();
    const contrastProblems=[];
    for (const key of ['--foreground','--muted-foreground','--brand-blue','--brand-violet','--brand-teal','--brand-pink']) {
      for (const ground of ['--card','--background']) {const ratio=contrast(token(key),token(ground));if(ratio<4.5)contrastProblems.push({key,ground,ratio})}
    }
    const buttonRatio=contrast(token('--primary-foreground'),token('--primary'));
    if(buttonRatio<4.5)contrastProblems.push({key:'primary button',ratio:buttonRatio});
    const heading=document.querySelector('h1 em');
    if(heading)for(const color of getComputedStyle(heading).backgroundImage.match(/rgb\([^)]*\)/g)||[]) {
      const ratio=contrast(color,token('--background'));if(ratio<4.5)contrastProblems.push({key:'heading gradient',color,ratio});
    }
    for(const selector of ['.folio','.intro-copy','.legend','.collection-label']) {
      const el=document.querySelector(selector);
      if(el){const ratio=contrast(getComputedStyle(el).color,token('--background'));if(ratio<4.5)contrastProblems.push({key:selector,ratio})}
    }
    for(const el of document.querySelectorAll('.playback .play:not(:disabled),.controls-actions .primary:not(:disabled)')) {
      const button=getComputedStyle(el),ratio=contrast(button.color,button.backgroundColor);
      if(ratio<4.5)contrastProblems.push({key:'visible primary button',ratio});
    }
    const overflow = [...document.querySelectorAll('h1,h2,.readings strong,.measurement strong,.system-motion strong')].filter(el=>el.clientWidth && el.scrollWidth>el.clientWidth+2).map(el=>({tag:el.tagName,text:el.textContent,width:el.clientWidth,scroll:el.scrollWidth}));
    return {theme:document.body.dataset.theme, background:style.backgroundColor, lang:document.documentElement.lang, font:getComputedStyle(document.querySelector('h1')).fontFamily, weight:getComputedStyle(document.querySelector('h1')).fontWeight, width:innerWidth, scroll:document.documentElement.scrollWidth, contrastProblems, overflow, shapes:document.querySelectorAll('.drawing path').length};
  })()`;
  const check = async (page, width, expected) => {
    const state = await evaluate(inspect);
    assert.equal(state.lang, 'es', page.file);
    assert.equal(state.theme, expected, page.file);
    assert.equal(state.background, expected==='dark'?'rgb(10, 10, 10)':'rgb(245, 248, 255)', page.file);
    assert.equal(state.weight, '800', page.file);
    assert(state.scroll <= width+1, `${page.file} ${width}: horizontal overflow ${state.scroll}`);
    assert.deepEqual(state.contrastProblems, [], `${page.file}: contrast`);
    assert.deepEqual(state.overflow, [], `${page.file}: clipped text`);
    if(page.number)assert(state.shapes>20, `${page.file}: missing machine`);
    return state;
  };
  const screenshot = async (width, height, scale = 1, x = 0, y = 0) => {
    const result=await send('Page.captureScreenshot',{format:'png',clip:{x,y,width,height,scale},captureBeyondViewport:true});
    if(result.error)throw new Error(JSON.stringify(result.error));
    return result.result.data;
  };
  const boards = new Map();
  let configurations = 0;
  for (const width of [1440, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height:1100, deviceScaleFactor:1, mobile:width<600});
    for (const page of pages) {
      const navigation = await send('Page.navigate', {url:pathToFileURL(join(root,page.file)).href});
      assert(!navigation.result?.errorText, page.file);
      await wait(250);
      for(let tries=0;tries<20 && !await evaluate('Boolean(document.querySelector("h1") && document.getElementById("theme"))');tries++)await wait(100);
      await check(page, width, page.theme);
      const key = `${width}-${page.theme}`;
      if(!boards.has(key))boards.set(key,[]);
      boards.get(key).push({label:page.number?`Episodio ${page.number}`:'Índice',data:await screenshot(width,width===390?1500:1300,width===390?.8:1/3)});
      // Exercise the actual event handler on both the light and dark documents.
      await evaluate('document.getElementById("theme").click()');
      await check(page, width, page.theme==='dark'?'light':'dark');
      if(page.number===0) {
        const other=`${width}-dark`;
        if(!boards.has(other))boards.set(other,[]);
        boards.get(other).push({label:'Índice',data:await screenshot(width,width===390?1500:1300,width===390?.8:1/3)});
      }
      configurations+=2;
      assert.deepEqual(problems, [], page.file);
      console.log(`${width}px · ${page.file} · ambos temas, contraste y disposición correctos`);
    }
  }
  // Compose review sheets in the browser; intermediate captures stay in memory.
  await send('Page.navigate',{url:'about:blank'});
  for(const [key,frames] of boards) {
    const png=await evaluate(`(async()=>{
      const frames=${JSON.stringify(frames)};
      const images=await Promise.all(frames.map(frame=>new Promise((done,fail)=>{const img=new Image();img.onload=()=>done(img);img.onerror=fail;img.src='data:image/png;base64,'+frame.data})));
      const columns=${key.startsWith('390')?4:3}, pad=12, header=30;
      const w=images[0].width,h=images[0].height;
      const canvas=document.createElement('canvas');canvas.width=columns*(w+pad)+pad;canvas.height=Math.ceil(images.length/columns)*(h+header+pad)+pad;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#dee7f5';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='bold 16px system-ui';
      images.forEach((img,i)=>{const x=pad+(i%columns)*(w+pad),y=pad+Math.floor(i/columns)*(h+header+pad);ctx.fillStyle='#15213b';ctx.fillText(frames[i].label,x,y+21);ctx.drawImage(img,x,y+header)});
      return canvas.toDataURL('image/png').split(',')[1];
    })()`);
    writeFileSync(join(out, `${key}.png`),Buffer.from(png,'base64'));
  }
  console.log(`${pages.length} HTML autónomos · ${configurations} estados de tema y pantalla · consola limpia · 4 hojas de revisión`);
} finally {
  socket?.close(); chrome.kill('SIGKILL');
  rmSync(profile,{recursive:true,force:true});
}

/* AI INFORMATION - core.js
   shared helpers: storage, toast, panels, API calls (xget/xpost), downloads, share/export, image reading.
   Only function declarations: they are called later by app.js (loaded last). */

function toast(msg,bg,ms){if(bg==='#ff4444')bg='#c62828';var st=document.getElementById('shareStatus');st.style.color=(bg==='#c62828')?'#fff':'';st.textContent=msg;st.style.background=bg||'var(--accent)';st.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(function(){st.style.display='none';},ms||2500);}
function getCap(name){try{if(window.claude&&typeof window.claude.use==='function')return Promise.resolve(window.claude.use(name)).then(function(c){return c||null;},function(){return null;});}catch(e){}return Promise.resolve(null);}
async function saveFile(filename,data,mime){
try{var dl=await getCap('downloads');if(dl){await dl.save({filename:filename,data:data});toast('Saved');return;}}
catch(e){if(e&&e.code==='declined')return;}
var blob=new Blob([data],{type:mime||'text/plain'});var url=URL.createObjectURL(blob);var a=document.createElement('a');
a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},2000);
}
function fmtBytes(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';}
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function addPassive(t,fn){document.addEventListener(t,fn,{passive:true});}
function consSave(){try{CONS.t=new Date().toISOString();localStorage.setItem('ai_consent',JSON.stringify(CONS));}catch(e){}}
function storeAllowed(k){return k==='ai_consent'||!!(CONS&&(CONS.prefs||(CONS.cache&&/^ai_(vc|v9_vidx|v9_fyp|v9_feed2)/.test(k))));}
function cacheOK(){return !!(CONS&&CONS.cache);}
function flushMem(){Object.keys(MEM).forEach(function(k){if(storeAllowed(k)){try{localStorage.setItem(k,MEM[k]);}catch(e){}delete MEM[k];}});}
function wipeStored(onlyPrefs){try{var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('ai_')===0&&k!=='ai_consent'&&k!=='ai_age'&&(!onlyPrefs||!/^ai_(vc|v9_vidx|v9_fyp|v9_feed2)/.test(k)))ks.push(k);}ks.forEach(function(k){localStorage.removeItem(k);});}catch(e){}}
function netUp(){return window.__netUp!==false;}
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeUrl(u){return /^https?:\/\//i.test(String(u))?String(u):'#';}
function hideKeyboard(){
document.activeElement.blur();
document.getElementById('q').blur();
var inputs = document.querySelectorAll('input');
inputs.forEach(function(input){input.blur();});
window.focus();
document.body.focus();
console.log('Keyboard hidden');
}
function toggleTheme(){
try{if(window.AI_AUTOTHEME_STOP)AI_AUTOTHEME_STOP();}catch(e){}
var vt=document.startViewTransition&&!toggleTheme._skip&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
if(vt){try{document.startViewTransition(function(){toggleTheme._skip=1;try{toggleTheme();}finally{toggleTheme._skip=0;}});return;}catch(e){}}
document.body.classList.toggle('light-theme');
var isLight=document.body.classList.contains('light-theme');document.documentElement.style.colorScheme=isLight?'light':'dark';
store.set('ai_info_theme',isLight?'light':'dark');
document.querySelectorAll('.theme-btn').forEach(function(b){b.textContent=isLight?'☀️':'🌙';});
}
function purgeCaches(){
try{if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations)navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){var u=(r.active&&r.active.scriptURL)||(r.waiting&&r.waiting.scriptURL)||(r.installing&&r.installing.scriptURL)||'';if(/[?&]n=1/.test(u))return;r.unregister();});});}catch(e){}
try{if(window.caches)caches.keys().then(function(ns){ns.forEach(function(n){if(/^aiinfo-|^ai-v9-videos/.test(n))caches.delete(n);});});}catch(e){}
}
function $(id){return document.getElementById(id);}
function jget(k,d){try{var v=JSON.parse(store.get(k)||'null');return v==null?d:v;}catch(e){return d;}}
function jset(k,v){store.set(k,JSON.stringify(v));}
function country(){
if(API.country)return API.country;
var m=/-([A-Za-z]{2})\b/.exec(navigator.language||'');return m?m[1].toUpperCase():'US';
}
function xurl(route,q){var p=new URLSearchParams(q||{});p.set('country',country());if(route==='videos'||route==='feed')p.set('qv','2');return '/api/x/'+route+'?'+p.toString();}
function waitApi(){return new Promise(function(res){var t0=Date.now();(function chk(){if(API.ok||API.done||Date.now()-t0>4000||!/^https?:$/.test(location.protocol))res();else setTimeout(chk,100);})();});}
function xget(route,q,timeout){
var ttl=XCT[route],key=ttl?xurl(route,q):'',now=Date.now();
if(key&&XC[key]){if(XC[key].j&&now-XC[key].t<ttl)return Promise.resolve(XC[key].j);if(XC[key].p)return XC[key].p;}
var pr=waitApi().then(function(){if(!API.ok)throw new Error('needs-server');return apiFetch(xurl(route,q),{timeout:timeout||12000});}).then(function(r){return r.json().then(function(j){if(!r.ok||j.ok===false)throw new Error(j.error||('http '+r.status));return j;});});
if(key){XC[key]={t:now,p:pr};pr.then(function(j){XC[key]={t:Date.now(),j:j};},function(){delete XC[key];});}
return pr;
}
function xpost(route,body,timeout,signal){
return waitApi().then(function(){if(!API.ok)throw new Error('needs-server');return apiFetch('/api/x/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),timeout:timeout||25000,signal:signal});}).then(function(r){return r.json().then(function(j){if(!r.ok||j.ok===false)throw new Error(j.error||('http '+r.status));return j;});});
}
function needsServer(box){box.textContent='';box.appendChild(el('div','v9-note','This feature needs the Cloudflare Worker (or the Node server). It is not available in this preview.'));}
function extOf(type,url){
var t=String(type||'').toLowerCase(),u=String(url||'').split(/[?#]/)[0].toLowerCase(),m=/\.(mp4|webm|ogv|ogg|mov|m4v)$/.exec(u);
if(/^image\//.test(t))return/png/.test(t)?'png':/webp/.test(t)?'webp':/gif/.test(t)?'gif':'jpg';if(/webm/.test(t))return'webm';if(/ogg/.test(t))return'ogv';if(/mp4|mpeg4/.test(t))return'mp4';if(/quicktime/.test(t))return'mov';
return m?(m[1]==='ogg'?'ogv':m[1]):'mp4';
}
function saveBlob(b,base){
var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=base+'.'+extOf(b.type);a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();
setTimeout(function(){a.remove();URL.revokeObjectURL(u);},15000);
}
function dl(url,base,btn,cachedUrl){
var key=url;if(DL_BUSY[key])return Promise.resolve();DL_BUSY[key]=1;
var old=btn?btn.textContent:'';
function ui(t){if(btn)btn.textContent=t;}
function done(){delete DL_BUSY[key];setTimeout(function(){ui(old||'⬇️');if(btn)btn.disabled=false;},1200);}
function fallback(){
ui('↗');var a=document.createElement('a');a.href=safeUrl(url);a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
toast('Opened in a new tab. Use the ⋮ menu → Download.','#ffaa00',4500);done();
}
if(btn)btn.disabled=true;ui('…');
if(!cachedUrl&&/^https:\/\/([^\/]+\.)?(wikimedia|archive)\.org\//i.test(url)&&API.ok){
var pa=document.createElement('a');pa.href='/api/dl?u='+encodeURIComponent(url)+'&n='+encodeURIComponent(base);pa.download=base;pa.style.display='none';document.body.appendChild(pa);pa.click();
setTimeout(function(){pa.remove();},3000);ui('✓');toast('Download started','var(--accent)',2500);done();return Promise.resolve();
}
var src=cachedUrl?fetch(cachedUrl).then(function(r){return r.blob();}).then(function(b){return b;}):
(function(){
return fetch(url,{mode:'cors',credentials:'omit'}).then(function(r){
if(!r.ok)throw 0;
var len=Number(r.headers.get('content-length'))||0;
if(len>200*1048576)throw 0; // too big to hold in memory: let the browser download it
if(!r.body||!r.body.getReader)return r.blob();
var rd=r.body.getReader(),parts=[],got=0;
function pump(){return rd.read().then(function(x){
if(x.done)return new Blob(parts,{type:r.headers.get('content-type')||''});
parts.push(x.value);got+=x.value.length;
if(got>200*1048576){try{rd.cancel();}catch(e){}throw 0;}
ui(len?Math.round(100*got/len)+'%':Math.round(got/1048576)+' MB');return pump();});}
return pump();
});
})();
return src.then(function(b){
if(!b||!b.size)throw 0;
saveBlob(b,base);ui('✓');toast('Saved to your downloads','var(--accent)',2500);done();
}).catch(fallback);
}
function labCard(ic,label,fn,bg){var g=document.querySelector('#scamLabBar .scam-grid');if(!g)return null;var c=el('div','scam-card');c.setAttribute('role','button');c.tabIndex=0;var i=el('div','icon',ic);i.style.background=bg||'color-mix(in srgb,var(--accent) 15%,transparent)';c.appendChild(i);c.appendChild(el('h4','',label));c.onclick=function(){fn();};c.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};g.appendChild(c);return c;}
function mkBtn(txt,cls,fn){var b=el('button','v9-btn '+(cls||''),txt);b.type='button';if(fn)b.onclick=fn;return b;}
function logAct(kind,data){
ACT.push({t:new Date().toISOString(),k:kind,d:data});if(ACT.length>600)ACT=ACT.slice(-600);
jset('ai_v9_act',ACT);
}
/* ---- panels + Esc ---- */
function mkPanel(id,title){
var p=el('div','v9-panel');p.id=id;p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('aria-label',title);
var h=el('div','v9-ph');h.appendChild(el('h2','',title));
var x=el('button','v9-x','✕');x.type='button';x.setAttribute('aria-label','Close');x.onclick=function(){closePanel(id);};h.appendChild(x);
var b=el('div','v9-pb');b.id=id+'Body';p.appendChild(h);p.appendChild(b);document.body.appendChild(p);return b;
}
function openPanel(id){
var p=$(id);if(!p)return;if(V9.stack.indexOf(id)===-1)V9.stack.push(id);
p.classList.add('open');document.documentElement.style.overflow='hidden';
var ev=new CustomEvent('v9open');p.dispatchEvent(ev);
}
function closePanel(id){
var p=$(id);if(!p)return;if(p.classList.contains('req'))return;p.classList.remove('open');V9.stack=V9.stack.filter(function(x){return x!==id;});
if(!V9.stack.length)document.documentElement.style.overflow='';
p.dispatchEvent(new CustomEvent('v9close'));
}
function setRadarEvery(sec){
radarEvery=Math.max(10,Math.min(86400,sec|0||30));store.set('ai_radar_every',String(radarEvery));
if(typeof radarTimer!=='undefined'){clearInterval(radarTimer);}
radarTimer=setInterval(function(){if(!document.hidden)loadBreaking(true);},radarEvery*1000);
toast('News refresh every '+(radarEvery>=60?(radarEvery/60)+' min':radarEvery+' s'));logAct('radar','interval '+radarEvery+'s');
}
function savedStories(){return jget('ai_v9_saved',[]);}
function saveStory(title,url,meta){
var s=savedStories();if(s.some(function(x){return x.url===url;})){toast('Already saved','#ffaa00');return;}
s.push({title:title,url:url,time:meta||new Date().toLocaleString(),saved:new Date().toISOString()});jset('ai_v9_saved',s);
updSaved();toast('Story saved');logAct('radar','saved '+title);
}
function updSaved(){var b=$('radarSaved');if(b)b.textContent='💾 '+'Saved'+' ('+savedStories().length+')';}
function downloadStories(){
var s=savedStories();if(!s.length){toast('No saved stories yet','#ff4444');return;}
var L=['AI INFORMATION – saved stories','Created: '+new Date().toISOString(),'(Browsers cannot read other sites\' article text, so each entry has the title, link, time and score.)',''];
s.forEach(function(x,i){L.push((i+1)+'. '+x.title);L.push('   Link: '+x.url);L.push('   Time: '+x.time);L.push('   Saved: '+x.saved);L.push('');});
saveFile('ai-information-saved-stories.txt',L.join('\n'),'text/plain');
}
function tipToCard(t){var c=$('tipCard');if(!c)return;c.textContent='';c.appendChild(el('b','','💡 '+'AI tip'));c.appendChild(el('div','',t.text));if(t.source){c.appendChild(el('small','',t.source));}c.style.display='block';}


/* aiBlock(label, task, getReq, opts): getReq() returns {text,extra,question,image} or a string (a message to show instead);
   opts.render(el,res) draws a custom result, opts.auto runs at once, opts.hint is a small note under the button */


function imgToDataUrl(file){
return new Promise(function(res,rej){
if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))return rej(new Error('Use a PNG, JPEG, WebP or GIF image.'));
var u=URL.createObjectURL(file),im=new Image();
im.onload=function(){try{var m=Math.max(im.naturalWidth,im.naturalHeight)||1,sc=Math.min(1,1024/m),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*sc));c.height=Math.max(1,Math.round(im.naturalHeight*sc));var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);
var q=0.85,d=c.toDataURL('image/jpeg',q);while(d.length>1600000&&q>0.4){q-=0.15;d=c.toDataURL('image/jpeg',q);}URL.revokeObjectURL(u);if(d.length>1650000)rej(new Error('The image is too large.'));else res(d);}catch(e){URL.revokeObjectURL(u);rej(e);}};
im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('This image could not be opened.'));};
im.src=u;});
}
/* read a file in the browser only to show it to the AI: it is never run, opened as a page or sent anywhere else */
function fileForAi(file){
if(!file)return Promise.reject(new Error('No file.'));
if(file.size>8*1048576)return Promise.reject(new Error('The file is bigger than 8 MB.'));
if(/^image\/(png|jpeg|webp|gif)$/.test(file.type))return imgToDataUrl(file).then(function(d){return{task:'chat_image',image:d,name:file.name,kind:'image'};});
if(/^text\//.test(file.type)||/json|xml|javascript|x-sh|x-python/.test(file.type)||TEXTEXT.test(file.name))
return file.slice(0,24000).text().then(function(t){return{task:'chat_file',text:'File name: '+file.name+' ('+file.size+' bytes)\n'+t,name:file.name,kind:'text'};});
return file.arrayBuffer().then(function(buf){
var u8=new Uint8Array(buf),head=Array.prototype.slice.call(u8.slice(0,16)).map(function(x){return('0'+x.toString(16)).slice(-2);}).join(' ');
var strs=[],cur='';for(var i=0;i<Math.min(u8.length,2*1048576);i++){var c=u8[i];if(c>=32&&c<127){cur+=String.fromCharCode(c);}else{if(cur.length>=6)strs.push(cur);cur='';}if(strs.length>=700)break;}if(cur.length>=6)strs.push(cur);
var st=strs.join('\n').slice(0,16000);
return(crypto&&crypto.subtle?crypto.subtle.digest('SHA-256',buf).then(function(h){return Array.prototype.map.call(new Uint8Array(h),function(x){return('0'+x.toString(16)).slice(-2);}).join('');}):Promise.resolve('n/a')).then(function(sha){
return{task:'chat_file',text:'BINARY FILE (not opened or run; the AI only sees these facts)\nName: '+file.name+'\nType: '+(file.type||'unknown')+'\nSize: '+file.size+' bytes\nSHA-256: '+sha+'\nFirst 16 bytes (hex): '+head+'\nReadable strings found inside:\n'+st,name:file.name,kind:'binary'};});
});
}

/* ---- LIVE SEARCH (VERIFY) ---- */
function liveSearch(q,box){
box.textContent='';box.appendChild(el('div','v9-note','🌐 Searching the internet live…'));
function esc2(x){return String(x||'');}
function browserSearch(){
var out=[];
var w=fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=4&srsearch='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){((j.query||{}).search||[]).forEach(function(x){out.push({title:x.title,url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_')),source:'Wikipedia',text:String(x.snippet||'').replace(/<[^>]+>/g,'')});});}).catch(function(){});
var h=fetch('https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=4&query='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){(j.hits||[]).forEach(function(x){if(x.title)out.push({title:x.title,url:x.url||('https://news.ycombinator.com/item?id='+x.objectID),source:'Hacker News',text:''});});}).catch(function(){});
var g=fetch('https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&format=json&maxrecords=5&sort=datedesc&query='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){(j.articles||[]).forEach(function(x){out.push({title:x.title,url:x.url,source:x.domain||'News',text:''});});}).catch(function(){});
return Promise.all([w,h,g]).then(function(){return{results:out,browser:true};});
}
var lk=q.toLowerCase().trim(),saved=(jget('ai_v9_live',{})[lk])||null;
var src=netUp()?xget('search',{q:q},20000).catch(browserSearch):Promise.resolve({results:[]});
src.then(function(j){
box.textContent='';
var rs=(j&&j.results)||[],off=false;
if(rs.length){var all=jget('ai_v9_live',{});all[lk]={t:Math.floor(Date.now()/1000),r:rs.slice(0,12)};var ks=Object.keys(all);if(ks.length>30)ks.slice(0,ks.length-30).forEach(function(k){delete all[k];});jset('ai_v9_live',all);}
else if(saved){rs=saved.r;off=true;}
box.appendChild(el('b','','🌐 Live search results'));
if(off)box.appendChild(el('div','v9-note','Showing the results saved '+ago(saved.t)+' (no live connection).'));
if(!rs.length){box.appendChild(el('div','v9-note',netUp()?'No live results found (sources may be unreachable right now). Use the source buttons below.':'You are offline and this search has no saved results yet.'));return;}
rs.slice(0,12).forEach(function(r){
var u=safeUrl(r.url);if(!u)return;
var d=el('div','');d.style.cssText='margin-top:8px;padding-top:8px;border-top:1px solid var(--border2)';
var a=el('a','',esc2(r.title));a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='font-weight:700;color:var(--accent)';d.appendChild(a);
d.appendChild(el('div','v9-note',esc2(r.source)));if(r.text)d.appendChild(el('div','',esc2(r.text).slice(0,260)));
box.appendChild(d);});
logAct('search','live: '+q);
}).catch(function(){box.textContent='Live search failed. Use the source buttons below.';});
}

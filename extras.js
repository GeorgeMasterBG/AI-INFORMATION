/* AI INFORMATION - extras.js
   Favourites (sources and links), favourite functions bar, session file (save / load), scroll-bar choice, rotating header label,
   the nicely styled "Export new information" page, and the code preview (View Code / Preview) used by AI Chat.
   Only function declarations: they are called later by app.js (loaded last) or from other files. */

/* ---------------- small helpers ---------------- */
function xEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function xUrl(u){u=String(u||'');return /^https?:\/\//i.test(u)?u:'';}

/* ---------------- scroll bar choice ---------------- */
function sbMode(){var m=store.get('ai_sbmode');return m==='standard'?'standard':'handle';}

/* ---------------- rotating label next to the title ---------------- */
function hdrRotate(){
var sp=document.querySelector('.header h1 span:not(.ttl-l)');if(!sp||window._hdrRot)return;window._hdrRot=1;window.AI_COUNTED=1;
var names=['1918 SOURCES','Standard Mode','Quote Context','Scam Lab','URL Scanner','Text Analyzer','Fake Image Checker','Weekly Report','Tools','Quiz','AI Chat','AI Tip','Feed and Videos','Weather','Translator','Dictionary','Calculator','Compare Two Sources','Language'];
var i=-1;
function tick(){if(document.hidden)return;i=(i+1)%names.length;sp.textContent=names[i];}
tick();setInterval(tick,2000);
}

/* ---------------- favourite sources and links ---------------- */
var FAV={src:null,links:null};
function favLoad(){
if(FAV.src)return;
FAV.src=jget('ai_fav_sources',[]);FAV.links=jget('ai_fav_links',[]);
if(!Array.isArray(FAV.src))FAV.src=[];if(!Array.isArray(FAV.links))FAV.links=[];
if(!store.get('ai_fav_migrated')){ /* old favourites were tied to one search: keep them as favourite sources */
try{(favorites||[]).forEach(function(u){var id=parseInt(String(u).split('_').pop(),10);if(isFinite(id)&&FAV.src.indexOf(id)<0)FAV.src.push(id);});}catch(e){}
store.set('ai_fav_migrated','1');favSave();}
}
function favSave(){jset('ai_fav_sources',FAV.src);jset('ai_fav_links',FAV.links);}
function favIsSrc(id){favLoad();return FAV.src.indexOf(Number(id))>-1;}
function favToggleSrc(id){favLoad();id=Number(id);var i=FAV.src.indexOf(id);if(i>-1)FAV.src.splice(i,1);else FAV.src.push(id);favSave();return i<0;}
function favHasLink(url){favLoad();return FAV.links.some(function(l){return l.url===url;});}
function favToggleLink(l){favLoad();var i=-1;FAV.links.forEach(function(x,k){if(x.url===l.url)i=k;});if(i>-1){FAV.links.splice(i,1);favSave();return false;}
FAV.links.unshift({url:l.url,title:String(l.title||l.url).slice(0,160),source:String(l.source||'').slice(0,60),snippet:String(l.snippet||'').slice(0,400),t:Date.now()});FAV.links=FAV.links.slice(0,200);favSave();return true;}
function openFavs(){
favLoad();var body=document.getElementById('v9FavsBody');
if(!body){body=mkPanel('v9Favs','⭐ Favorites');body.parentNode.id='v9Favs';}
body.textContent='';
body.appendChild(el('p','lg-p','Favorite sources are saved for every search. Favorite links keep one exact page (for example two different Wikipedia articles), even when the source is the same. Everything is saved only on this device.'));
var fo=mkBtn(showOnlyFav?'Show all results':'Show only favorite sources in the results','',function(){try{toggleFavFilter();}catch(x){}closePanel('v9Favs');});fo.type='button';fo.style.marginBottom='8px';body.appendChild(fo);
body.appendChild(el('h3','','🌐 Favorite sources ('+FAV.src.length+')'));
if(!FAV.src.length)body.appendChild(el('div','v9-note','None yet. Press ⭐ on a source in the search results.'));
FAV.src.forEach(function(id){var s=ALL_SOURCES[id];if(!s)return;var r=el('div','');r.style.cssText='display:flex;gap:8px;align-items:center;padding:6px 8px;margin:4px 0;border:1px solid var(--border2);border-radius:10px;background:var(--bg2)';
var t=el('div','',s.name+' · '+s.domain);t.style.cssText='flex:1;min-width:0;overflow-wrap:anywhere';r.appendChild(t);
var q=(currentQuery||'').trim();var u=xUrl(q?sourceUrl(s,q):'https://'+s.domain);if(u){var a=el('a','','Open ↗');a.href=safeUrl(u);a.target='_blank';a.rel='noopener noreferrer';r.appendChild(a);}
var x=el('button','std-b','✕');x.type='button';x.setAttribute('aria-label','Remove');x.style.cssText='padding:2px 8px';x.onclick=function(){favToggleSrc(id);openFavs();try{applyFilters();}catch(e){}};r.appendChild(x);body.appendChild(r);});
var h2=el('h3','','🔗 Favorite links ('+FAV.links.length+')');h2.style.marginTop='16px';body.appendChild(h2);
if(!FAV.links.length)body.appendChild(el('div','v9-note','None yet. Press 🔗 on a result or on a Wikipedia article to keep that exact link.'));
FAV.links.forEach(function(l){var r=el('div','');r.style.cssText='padding:8px 10px;margin:4px 0;border:1px solid var(--border2);border-radius:10px;background:var(--bg2)';
r.appendChild(el('b','',l.title));r.appendChild(el('div','v9-note',l.source||''));if(l.snippet){var sn=el('div','',l.snippet.slice(0,160));sn.style.cssText='font-size:12px;opacity:.85;margin:4px 0';r.appendChild(sn);}
var row=el('div','');row.style.cssText='display:flex;gap:10px;align-items:center';var a=el('a','','Open ↗');a.href=safeUrl(l.url);a.target='_blank';a.rel='noopener noreferrer';row.appendChild(a);
var x=el('button','std-b','✕ Remove');x.type='button';x.style.cssText='padding:2px 8px';x.onclick=function(){favToggleLink(l);openFavs();};row.appendChild(x);r.appendChild(row);body.appendChild(r);});
var ai=el('h3','','✨ AI summary');ai.style.marginTop='16px';body.appendChild(ai);
body.appendChild(aiBlock('✨ Summarize my favorite links','fav_sum',function(){
if(!FAV.links.length)return null;
return{text:FAV.links.slice(0,20).map(function(l,i){return(i+1)+'. '+l.title+' ('+(l.source||'link')+') – '+(l.snippet||'no excerpt');}).join('\n'),question:'Summarize these saved links.'};
},{hint:'AI mode: only the titles, sources and short excerpts of your favorite links are sent to an AI model when you press the button. The links are not opened.'}));
openPanel('v9Favs');
}
function favAddSearch(){var b=document.getElementById('favFilterBtn');if(!b||document.getElementById('favOpenBtn'))return;var o=el('button','',' ');o.id='favOpenBtn';o.type='button';o.textContent='⭐ Favorites';o.setAttribute('aria-label','Open favorites: sources, links and AI summary');o.className=b.className.replace(/\bactive\b/,'').trim();o.style.cssText=b.style.cssText+';font-size:12px;padding:6px 10px;width:auto;height:auto;border-radius:18px;white-space:nowrap';o.onclick=openFavs;b.parentNode.insertBefore(o,b.nextSibling);b.style.display='none';}
function favAddHdr(){return;
var hb=document.querySelector('.hdr-tools');if(!hb||document.getElementById('favBtn'))return;
var b=el('button','hdr-chip','⭐ Favorites');b.id='favBtn';b.type='button';b.setAttribute('aria-label','Favorites: sources and links');b.onclick=openFavs;hb.appendChild(b);
}

/* ---------------- favourite functions ---------------- */
function fnLabel(e){var h=e.querySelector&&e.querySelector('h4');return String((h?h.textContent:e.textContent)||'').replace(/\s+/g,' ').trim().slice(0,40);}
function fnAll(){var out=[],seen={};
[].forEach.call(document.querySelectorAll('#scamLabBar .scam-card'),function(c){var l=fnLabel(c);if(l&&!seen[l]){seen[l]=1;out.push({label:l,el:c});}});
[].forEach.call(document.querySelectorAll('#v9Bar button'),function(c){var l=fnLabel(c);if(l&&!seen[l]){seen[l]=1;out.push({label:l,el:c});}});
return out;}
function fnFavs(){var f=jget('ai_fav_fn',[]);return Array.isArray(f)?f:[];}
function fnRender(){
var host=document.getElementById('favFnBar');var fav=fnFavs();
if(!fav.length){if(host)host.remove();return;}
if(!host){host=el('div','');host.id='favFnBar';host.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 15px';var anchor=document.getElementById('scamLabBar')||document.getElementById('v9Bar');if(!anchor||!anchor.parentNode)return;anchor.parentNode.insertBefore(host,anchor);}
host.textContent='';host.appendChild(el('b','','⭐ My functions:'));
fav.forEach(function(l){var b=mkBtn(l,'',function(){var f=fnAll().filter(function(x){return x.label===l;})[0];if(f&&f.el)f.el.click();else toast('This function is not available now','#ff4444',2500);});b.type='button';host.appendChild(b);});
}

/* ---------------- session file ---------------- */
function sessionData(){
var items={},k;
try{for(var i=0;i<localStorage.length;i++){k=localStorage.key(i);if(/^ai[_-]/.test(k)&&k!=='ai_v9_vidx')items[k]=localStorage.getItem(k);}}catch(e){}
try{for(k in MEM){if(/^ai[_-]/.test(k))items[k]=String(MEM[k]);}}catch(e){}
return{format:'ai-information-session',version:1,created:new Date().toISOString(),note:'Your settings and what you did in AI INFORMATION. Keep it private: it can contain searches, chat and favorites.',items:items};
}
function sessionSave(){logAct('session','save');saveFile('ai-information-session-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(sessionData(),null,1),'application/json');}
function sessionLoad(file){
if(!file)return;
if(file.size>6*1048576){toast('The file is too big for a session file','#ff4444',4000);return;}
if(!storeAllowed('ai_favorites')){toast('Allow saving on this device first (cookie and storage choice), then load the file again.','#ff4444',6000);return;}
var r=new FileReader();r.onload=function(){
var d;try{d=JSON.parse(String(r.result));}catch(e){d=null;}
if(!d||d.format!=='ai-information-session'||!d.items||typeof d.items!=='object'){toast('This is not an AI INFORMATION session file','#ff4444',4000);return;}
var ks=Object.keys(d.items).filter(function(k){return /^ai[_-][A-Za-z0-9_.-]{1,80}$/.test(k)&&typeof d.items[k]==='string'&&d.items[k].length<3000000;});
if(!ks.length){toast('The file has nothing to restore','#ff4444',4000);return;}
if(!confirm('Restore '+ks.length+' saved items from this file? Your current settings and saved data on this device will be replaced where they overlap. The page will reload.'))return;
ks.forEach(function(k){try{localStorage.setItem(k,d.items[k]);}catch(e){}});
toast('Session restored. Reloading…','var(--accent)',2500);setTimeout(function(){location.reload();},1200);};
r.readAsText(file);
}

/* ---------------- settings sections (called from Features) ---------------- */
function featExtras(body){
function h(t){var x=el('h3','',t);x.style.margin='16px 0 6px';body.appendChild(x);}
/* scrolling */
h('Scrolling');body.lastChild.id='sbSection';
body.appendChild(el('div','v9-note','On a phone or tablet the site has its own scroll handle at the right edge. It is different from the standard scroll bar: press and hold it, then drag to the place where you want to be. It stays visible for a few seconds after you scroll. On a computer nothing changes.'));
var sr=el('div','');sr.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:8px 0';body.appendChild(sr);var sb=[];
[['handle','Quick scroll handle (new)'],['standard','Standard scroll']].forEach(function(o){var b=mkBtn(o[1],'',function(){store.set('ai_sbmode',o[0]);if(window.AI_SB_APPLY)AI_SB_APPLY();mk();});b.dataset.v=o[0];b.type='button';sr.appendChild(b);sb.push(b);});
function mk(){var c=sbMode();sb.forEach(function(b){b.style.outline=b.dataset.v===c?'3px solid var(--text)':'none';});}mk();
/* favourite functions */
h('⭐ My favorite functions');
body.appendChild(el('div','v9-note','Pick the functions you use most. They appear as quick buttons on the home screen. The choice is saved on this device.'));
var fav=fnFavs(),fl=el('div','');body.appendChild(fl);
fnAll().forEach(function(f){var l=el('label','');l.style.cssText='display:flex;gap:10px;align-items:center;padding:6px 10px;margin:3px 0;border:1px solid var(--border2);border-radius:10px;background:var(--bg2);cursor:pointer';
var c=document.createElement('input');c.type='checkbox';c.checked=fav.indexOf(f.label)>-1;c.onchange=function(){var cur=fnFavs(),i=cur.indexOf(f.label);if(c.checked&&i<0)cur.push(f.label);if(!c.checked&&i>-1)cur.splice(i,1);jset('ai_fav_fn',cur);fnRender();};
l.appendChild(c);l.appendChild(document.createTextNode(f.label));fl.appendChild(l);});
/* session */
h('💾 Session file');
body.appendChild(el('div','v9-note','⚠️ You usually do not need this. It is only for safety: it saves your settings and what you did in the site (searches, favorites, chat, choices) into one file. Later you can load the file here and everything comes back. Keep the file private. Loading a file replaces the matching saved data on this device.'));
var ss=el('div','');ss.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:8px 0';body.appendChild(ss);
ss.appendChild(mkBtn('💾 Save session file','',sessionSave));
var lf=document.createElement('input');lf.type='file';lf.accept='application/json,.json';lf.style.display='none';lf.onchange=function(){var f=lf.files&&lf.files[0];lf.value='';sessionLoad(f);};ss.appendChild(lf);
ss.appendChild(mkBtn('📂 Load session file','',function(){lf.click();}));
}

/* ---------------- export new information: a styled page ---------------- */
function doExport(){
hideKeyboard();
var S=[];function sec(icon,title){var s={icon:icon,title:title,rows:[]};S.push(s);return s;}
function row(s,text,url,sub){s.rows.push({t:String(text==null?'':text),u:url||'',s:sub||''});}
var s=sec('🔎','Current search');row(s,'Query: '+(currentQuery||'(none)'));
if(currentSources.length){currentSources.slice(0,60).forEach(function(x){row(s,'['+(x.id+1)+'] '+x.source+' ('+x.type+') – '+x.title,x.url);});}
favLoad();s=sec('⭐','Favorites');
if(!FAV.src.length&&!FAV.links.length)row(s,'(none)');
FAV.src.forEach(function(id){var a=ALL_SOURCES[id];if(a)row(s,'Source: '+a.name,'https://'+a.domain);});
FAV.links.forEach(function(l){row(s,'Link: '+l.title,l.url,l.source);});
s=sec('📡','Live radar (shown now)');var any=false;
[].forEach.call(document.querySelectorAll('#breakingNewsScroll a.breaking-item'),function(a){any=true;row(s,a.textContent.replace(/\s+/g,' ').trim(),a.href);});if(!any)row(s,'(nothing shown)');
s=sec('💾','Saved radar stories');var sv=jget('ai_v9_saved',[]);if(!sv.length)row(s,'(none)');sv.forEach(function(t){row(s,t.title,t.url,t.time);});
s=sec('🔥','Trending');row(s,[].map.call(document.querySelectorAll('#trendingScroll > *'),function(x){return x.textContent.trim();}).join(' | ')||'(none)');
s=sec('🛡️','Scam Lab');any=false;ACT.forEach(function(a){if(a.k==='scam'){any=true;row(s,a.d.mode+': '+a.d.input,'',a.t+(a.d.result?' · '+a.d.result:''));}});if(!any)row(s,'(nothing run)');
var sr=$('scamResult');if(sr&&sr.textContent.trim())row(s,'Latest result on screen: '+sr.innerText.trim().slice(0,1200));
s=sec('🖼️','Fake Image Checker');any=false;ACT.forEach(function(a){if(a.k==='fake'){any=true;row(s,a.d.name+' ('+a.d.type+', '+fmtBytes(a.d.size)+')','',a.t+(a.d.result?' · '+a.d.result:''));}});if(!any)row(s,'(nothing checked)');
s=sec('🤖','AI Chat');var ch=jget('ai_v9_chat',[]);if(!ch.length)row(s,'(no conversation)');ch.forEach(function(m){row(s,(m.role==='user'?'You: ':'AI: ')+m.content);});
s=sec('💡','AI tips');var tp=jget('ai_v9_tips',[]);if(!tp.length)row(s,'(none)');tp.forEach(function(t){row(s,t.text,'','('+t.topic+') '+t.t);});
s=sec('🎬','Videos, feed and weather');any=false;ACT.forEach(function(a){if(/^(video|weather)$/.test(a.k)&&typeof a.d==='string'&&!/^\d+$/.test(a.d)){any=true;row(s,a.k+': '+a.d,'',a.t);}});var wx=$('wxChip');if(wx)row(s,'Weather chip: '+wx.textContent.trim());if(!any&&!wx)row(s,'(none)');
var LBL={open:'Opened',search:'Searched',chat:'Asked the AI',dict:'Dictionary',compare:'Compared',weekly:'Weekly report',radar:'Radar',tip:'AI tip',theme:'Theme',share:'Shared',video:'Video',weather:'Weather',scam:'Scam Lab',fake:'Fake image check',quote:'Quote'};
function human(a){var d=a.d;if(d==null)return '';if(typeof d==='string')return /^(loaded )?\d+( \(\d+ new\))?$/.test(d)?'':d;if(typeof d==='object')return Object.keys(d).map(function(k){var v=d[k];return typeof v==='string'||typeof v==='number'?v:'';}).filter(function(v){return v!==''&&!/^\d+$/.test(String(v));}).join(' · ');return String(d);}
var used={};ACT.forEach(function(a){if(a.k==='open'&&typeof a.d==='string')used[a.d]=(used[a.d]||0)+1;});
s=sec('🧰','Functions you used');var un=Object.keys(used);if(!un.length)row(s,'(none yet)');un.forEach(function(k){row(s,k+' – opened '+used[k]+(used[k]===1?' time':' times'));});
s=sec('🕘','Everything you did in this site (newest last)');var shown=0;ACT.forEach(function(a){if(/^(feed|player|cache|session|export)$/.test(a.k))return;var t=human(a).slice(0,300);if(!t)return;shown++;row(s,(LBL[a.k]||a.k)+': '+t,'',a.t);});if(!shown)row(s,'(nothing yet)');
var css='*{box-sizing:border-box}html{color-scheme:dark light}body{margin:0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#0b110e;color:#e8f1ec}'
+'.wrap{max-width:860px;margin:0 auto;padding:0 16px 48px}header{padding:44px 16px 30px;text-align:center;background:radial-gradient(120% 140% at 50% 0%,#0f3d2a 0%,#0b110e 70%);border-bottom:1px solid #1d3a2c}'
+'h1{margin:0;font-size:30px;letter-spacing:.5px;color:#00ff88}header p{margin:8px 0 0;opacity:.8;font-size:14px}.pill{display:inline-block;margin-top:14px;padding:5px 14px;border-radius:999px;background:#13261d;border:1px solid #1d3a2c;font-size:12px}'
+'nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:22px 0}nav a{padding:6px 12px;border-radius:999px;background:#13261d;border:1px solid #1d3a2c;color:#bfe9d3;text-decoration:none;font-size:13px}'
+'section{margin:18px 0;padding:18px 20px;border-radius:16px;background:#111a15;border:1px solid #1d3a2c;box-shadow:0 8px 24px rgba(0,0,0,.25)}h2{margin:0 0 12px;font-size:19px;color:#00ff88}'
+'.r{padding:9px 0;border-top:1px solid #1a2c22;overflow-wrap:anywhere}.r:first-of-type{border-top:0}.r a{color:#5cc8ff}.sub{font-size:12px;opacity:.7;margin-top:2px}footer{text-align:center;opacity:.65;font-size:12px;margin-top:30px}'
+'@media (prefers-color-scheme:light){body{background:#f4f8f6;color:#13201a}header{background:radial-gradient(120% 140% at 50% 0%,#d7f5e6 0%,#f4f8f6 70%);border-color:#cfe5da}h1,h2{color:#087a47}.pill,nav a{background:#e6f3ec;border-color:#cfe5da;color:#12603c}section{background:#fff;border-color:#d8e8df;box-shadow:0 6px 18px rgba(0,0,0,.06)}.r{border-color:#e4eee8}.r a{color:#0b61a4}}'
+'@media print{body{background:#fff;color:#000}section{box-shadow:none;break-inside:avoid}}';
var out='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>AI INFORMATION – new information</title><style>'+css+'</style></head><body>'
+'<header><h1>AI INFORMATION</h1><p>Export of new information</p><span class="pill">'+xEsc(new Date().toLocaleString())+'</span></header><div class="wrap"><nav>'
+S.map(function(x,i){return'<a href="#s'+i+'">'+x.icon+' '+xEsc(x.title)+'</a>';}).join('')+'</nav>'
+S.map(function(x,i){return'<section id="s'+i+'"><h2>'+x.icon+' '+xEsc(x.title)+'</h2>'+x.rows.map(function(r){var u=xUrl(r.u);return'<div class="r">'+(u?'<a href="'+xEsc(u)+'" target="_blank" rel="noopener noreferrer">'+xEsc(r.t)+'</a>':xEsc(r.t))+(r.s?'<div class="sub">'+xEsc(r.s)+'</div>':'')+'</div>';}).join('')+'</section>';}).join('')
+'<footer>Made by AI INFORMATION on this device. Check important facts at the sources.</footer></div></body></html>';
logAct('export','new information');
saveFile('ai-information-export-'+new Date().toISOString().slice(0,10)+'.html',out,'text/html');
}

/* ---------------- code in AI answers: Preview and View Code ---------------- */
function looksHtml(c){return /^\s*(<!doctype html|<html|<head|<body|<div|<main|<section|<canvas|<svg|<style|<button|<form|<table|<h1|<p[ >]|<ul|<span|<script)/i.test(c);}
function pvDoc(lang,code,more){
/* turns one answer's code into one page that RUNS: html + its css + its js together; plain JS shows its console output */
var css=(more&&more.css||[]).join('\n'),js=(more&&more.js||[]).join('\n');
function safeJs(t){return String(t).replace(/<\/script/gi,'<\\/script');}
if(lang==='svg')return '<!doctype html><body style="margin:0">'+code;
if(/^(javascript|js|jsx|mjs)$/.test(lang)){
var boot='(function(){var o=document.createElement("pre");o.style.cssText="margin:0;padding:10px;font:13px/1.4 monospace;white-space:pre-wrap;color:#111";document.addEventListener("DOMContentLoaded",function(){document.body.appendChild(o);});function w(a){try{return Array.prototype.map.call(a,function(x){return typeof x==="object"?JSON.stringify(x):String(x);}).join(" ");}catch(e){return String(a);}}["log","info","warn","error"].forEach(function(k){console[k]=function(){o.textContent+=(k==="error"?"[error] ":"")+w(arguments)+"\\n";};});window.onerror=function(m){o.textContent+="[error] "+m+"\\n";};})();';
return '<!doctype html><meta charset="utf-8"><body><script>'+boot+'<\/script><script>'+safeJs(code)+'<\/script>';}
var d=code;
if(!/<html|<!doctype/i.test(d))d='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body>'+d;
d=d.replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi,'').replace(/<script[^>]+src=[^>]*>\s*<\/script>/gi,'');
if(css)d=/<\/head>/i.test(d)?d.replace(/<\/head>/i,'<style>'+css.replace(/<\/style/gi,'')+'</style></head>'):d.replace(/<body[^>]*>/i,function(m){return '<style>'+css.replace(/<\/style/gi,'')+'</style>'+m;});
if(js)d=/<\/body>/i.test(d)?d.replace(/<\/body>/i,function(){return '<script>'+safeJs(js)+'<\/script></body>';}):d+'<script>'+safeJs(js)+'<\/script>';
return d;
}
function codeCard(lang,code,more,codeOnly){
lang=String(lang||'').toLowerCase();
if(!lang&&looksHtml(code))lang='html';
var prev=!codeOnly&&/^(html?|svg|javascript|js|jsx|mjs|xhtml)$/.test(lang);
var card=el('div','v9-card');card.style.cssText='margin:8px 0;padding:8px;white-space:normal;border-radius:12px';
var bar=el('div','');bar.style.cssText='display:flex;flex-wrap:wrap;gap:6px;align-items:center';bar.appendChild(el('b','','</> '+(lang||'code')));
var area=el('div','');area.style.marginTop='6px';
var pre=el('pre','');pre.style.cssText='margin:0;max-height:320px;overflow:auto;white-space:pre-wrap;font-size:12px;background:var(--bg3);padding:8px;border-radius:8px';pre.textContent=code;pre.tabIndex=0;
var fr=null,showP=false,showC=false;
function build(){fr=document.createElement('iframe');fr.setAttribute('sandbox','allow-scripts allow-forms allow-modals');fr.setAttribute('referrerpolicy','no-referrer');fr.title='Result (runs in a closed box, no internet)';fr.style.cssText='width:100%;height:360px;border:1px solid var(--border2);border-radius:8px;background:#fff;resize:vertical';
var meta='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; media-src data:; font-src data:">';
fr.srcdoc=meta+pvDoc(lang,code,more);}
function draw(){if(fsOn&&!showP){fsOn=false;card.style.cssText='margin:8px 0;padding:8px;white-space:normal;border-radius:12px';}area.textContent='';fr=null;if(showP&&prev){build();area.appendChild(fr);if(fsb)area.appendChild(fsb);area.appendChild(el('div','v9-note','This is the running result. It runs in a closed box without internet.'));}if(showC){area.appendChild(cmenu);paintPre();area.appendChild(pre);}if(pb)pb.setAttribute('aria-pressed',showP?'true':'false');cb.setAttribute('aria-pressed',showC?'true':'false');}
var wrapOn=true,numOn=false,cmenu=el('div','');cmenu.style.cssText='display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px';
function paintPre(){pre.style.whiteSpace=wrapOn?'pre-wrap':'pre';pre.style.wordBreak=wrapOn?'break-word':'normal';
if(numOn){var n=code.split('\n').length,w=String(n).length;pre.textContent=code.split('\n').map(function(l,i){return String(i+1).padStart(w,' ')+' │ '+l;}).join('\n');}else pre.textContent=code;
wb.textContent=wrapOn?'↵ Wrap: on':'↵ Wrap: off';nb.textContent=numOn?'# Numbers: on':'# Numbers: off';}
var wb=mkBtn('','',function(){wrapOn=!wrapOn;paintPre();}),nb=mkBtn('','',function(){numOn=!numOn;paintPre();});
var dbt=mkBtn('⬇ Save','',function(){var ext=/^(html?|xhtml)$/.test(lang)?'html':/^(javascript|js|mjs|jsx)$/.test(lang)?'js':lang==='css'?'css':lang==='svg'?'svg':'txt';try{var u=URL.createObjectURL(new Blob([code],{type:'text/plain'})),a=document.createElement('a');a.href=u;a.download='code.'+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},2000);}catch(e){toast('Could not save','#ff4444',3000);}});
[wb,nb,dbt].forEach(function(x){x.type='button';cmenu.appendChild(x);});
var pb=null,fsb=null,fsOn=false;
function fsSet(on){fsOn=on;if(!fr)return;if(on){card.style.cssText='position:fixed;inset:0;z-index:99999;margin:0;padding:8px;border-radius:0;overflow:auto;background:var(--bg,#111);white-space:normal';fr.style.height='calc(100vh - 110px)';fsb.textContent='✕ Close fullscreen';}else{card.style.cssText='margin:8px 0;padding:8px;white-space:normal;border-radius:12px';fr.style.height='360px';fsb.textContent='⛶ Fullscreen';}}
fsb=mkBtn('⛶ Fullscreen','',function(){fsSet(!fsOn);});fsb.type='button';
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fsOn)fsSet(false);});
if(prev){pb=mkBtn('▶ Result','',function(){showP=!showP;if(showP)showC=false;draw();});pb.type='button';bar.appendChild(pb);}
else bar.appendChild(el('span','v9-note',codeOnly?'Runs together with the page above':'No live result for this language'));
var cb=mkBtn('</> View Code','',function(){showC=!showC;if(showC)showP=false;draw();});cb.type='button';bar.appendChild(cb);
var sel=mkBtn('✂ Select / cut','',function(){selBox(code);});sel.type='button';bar.appendChild(sel);
var cp=mkBtn('⧉ Copy','',function(){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(function(){toast('Copied');},function(){toast('Could not copy. Open View Code and select it.','#ff4444',3000);});else toast('Open View Code and select it.','#ff4444',3000);});cp.type='button';bar.appendChild(cp);
card.appendChild(bar);card.appendChild(area);
showP=prev;showC=!prev;draw();return card;
}
function richText(text){
var s=String(text==null?'':text),re=/```([A-Za-z0-9+#-]*)[ \t]*\n?([\s\S]*?)(```|$)/g,parts=[],last=0,m;
while((m=re.exec(s))){if(m[0]==='')break;if(m.index>last)parts.push({t:s.slice(last,m.index)});parts.push({lang:m[1].toLowerCase(),code:m[2].replace(/\n$/,'')});last=m.index+m[0].length;}
if(last<s.length)parts.push({t:s.slice(last)});
/* css and js blocks of the same answer run together with its html block */
var cssB=[],jsB=[],hasHtml=parts.some(function(p){return p.code!=null&&(/^(html?|xhtml)$/.test(p.lang)||(!p.lang&&looksHtml(p.code)));});
if(hasHtml)parts.forEach(function(p){if(p.code==null)return;if(p.lang==='css')cssB.push(p.code);else if(/^(javascript|js|mjs)$/.test(p.lang))jsB.push(p.code);});
var f=document.createDocumentFragment();
parts.forEach(function(p){if(p.code==null){f.appendChild(document.createTextNode(p.t));return;}
var isH=/^(html?|xhtml)$/.test(p.lang)||(!p.lang&&looksHtml(p.code));
if(hasHtml&&(p.lang==='css'||/^(javascript|js|mjs)$/.test(p.lang))){f.appendChild(codeCard(p.lang,p.code,null,true));return;}
f.appendChild(codeCard(p.lang,p.code,isH?{css:cssB,js:jsB}:null));});
return f;
}
function copyBar(text){var r=el('div','');r.style.cssText='margin-top:6px;text-align:right';var b=mkBtn('⧉ Copy answer','',function(){var done=function(){b.textContent='✓ Copied';setTimeout(function(){b.textContent='⧉ Copy answer';},1800);};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,function(){fallback();});else fallback();
function fallback(){try{var t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(t);t.select();var ok=document.execCommand('copy');t.remove();if(ok)done();else toast('Could not copy','#ff4444',2500);}catch(e){toast('Could not copy','#ff4444',2500);}}});
b.type='button';b.style.cssText='font-size:12px;padding:4px 10px';b.setAttribute('aria-label','Copy the whole answer');r.appendChild(b);
var sb=mkBtn('✂ Select part','',function(){selBox(text);});sb.type='button';sb.style.cssText='font-size:12px;padding:4px 10px;margin-left:6px';sb.setAttribute('aria-label','Open the answer in a field where you can select a part and copy it');r.appendChild(sb);return r;}
/* a plain text field with the answer: select only the part you want, then copy just that part */
function selBox(text){
var old=document.getElementById('selBoxOv');if(old)old.remove();
var ov=el('div','');ov.id='selBoxOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Select and copy');ov.style.cssText='position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
var bx=el('div','');bx.style.cssText='background:var(--bg);color:var(--text);border:1px solid var(--border2);border-radius:14px;padding:12px;width:min(900px,100%);max-height:100%;display:flex;flex-direction:column;gap:8px;box-sizing:border-box';
bx.appendChild(el('b','','✂ Select the part you want'));bx.appendChild(el('div','v9-note','Select text in the field (tap and drag, or double-tap a word). Then press “Copy selected”, or “Cut selected” to copy it and remove it from this field (this only changes the field, not the chat). With nothing selected, Copy copies everything.'));
var ta=document.createElement('textarea');ta.value=text;ta.readOnly=true;ta.setAttribute('aria-label','Answer text');ta.style.cssText='flex:1;min-height:40vh;width:100%;box-sizing:border-box;resize:none;font:13px/1.45 ui-monospace,Consolas,monospace;padding:10px;border-radius:10px;border:1px solid var(--border2);background:var(--bg2);color:var(--text);white-space:pre';
var row=el('div','');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px';
function cp(t,btn,lab){var ok=function(){btn.textContent='✓ Copied';setTimeout(function(){btn.textContent=lab;},1800);};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
function fb(){try{var x=ta.readOnly;ta.readOnly=false;ta.focus();var a=ta.selectionStart,e=ta.selectionEnd;if(t===text)ta.select();var done=document.execCommand('copy');ta.readOnly=x;if(done)ok();else toast('Could not copy','#ff4444',2500);}catch(er){toast('Could not copy','#ff4444',2500);}}}
var undo=[];
var c1=mkBtn('⧉ Copy selected','pri',function(){var a=ta.selectionStart,e=ta.selectionEnd,t=(e>a)?ta.value.slice(a,e):ta.value;cp(t,c1,'⧉ Copy selected');});
var cut=mkBtn('✂ Cut selected','',function(){var a=ta.selectionStart,e=ta.selectionEnd;if(e<=a){toast('Select something first','#ffaa00',2000);return;}var t=ta.value.slice(a,e);undo.push(ta.value);ta.value=ta.value.slice(0,a)+ta.value.slice(e);ta.setSelectionRange(a,a);cp(t,cut,'✂ Cut selected');un.disabled=false;});
var un=mkBtn('↶ Undo cut','',function(){if(undo.length)ta.value=undo.pop();un.disabled=!undo.length;});un.disabled=true;
var c4=mkBtn('⧉ Copy what is left','',function(){cp(ta.value,c4,'⧉ Copy what is left');});
var c2=mkBtn('Select all','',function(){ta.focus();ta.select();});
var c3=mkBtn('Close','',function(){ov.remove();});
[c1,cut,un,c4,c2,c3].forEach(function(x){x.type='button';row.appendChild(x);});
bx.appendChild(ta);bx.appendChild(row);ov.appendChild(bx);ov.onclick=function(e){if(e.target===ov)ov.remove();};
ov.addEventListener('keydown',function(e){if(e.key==='Escape')ov.remove();});document.body.appendChild(ov);ta.focus();}
function chatSet(m,text){m.textContent='';m.appendChild(richText(text));if(String(text||'').trim())m.appendChild(copyBar(String(text)));}

/* every opened panel is written to the activity log so the export can list the functions that were used */
(function(){if(typeof openPanel!=='function')return;var _op=openPanel,lastO='';openPanel=function(id){try{var p=document.getElementById(id),t=p&&p.getAttribute('aria-label');if(t&&t!==lastO){lastO=t;logAct('open',t);}setTimeout(function(){lastO='';},800);}catch(e){}return _op.apply(this,arguments);};})();

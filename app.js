/* AI INFORMATION - app.js
   The start-up code: it runs last and wires everything together (variables, first draw, events, timers).
   The functions it calls are in core.js, search.js, scamlab.js, tools.js ... and ai.js (everything with AI). */
/* AI INFORMATION - app.js
   All the other JavaScript of the site (search, Scam Lab, tools, feed, weather, settings, legal...).
   AI parts live in ai.js, styles in style.css, the page text in index.html, the server in _worker.js. */

/* v44: stable vs beta decided by host; sets the home-screen name */
(function(){var h=location.hostname,beta=/(^|\.)beta[-.]/i.test(h);window.AI_BETA=beta;try{var br=(navigator.userAgentData&&navigator.userAgentData.brands||[]).some(function(b){return /Chromium/.test(b.brand);});if(br&&!(window.matchMedia&&matchMedia('(prefers-reduced-transparency: reduce)').matches))document.documentElement.classList.add('lg-ref');}catch(e){}
window.AI_AGE='18+';try{localStorage.removeItem('ai_age');}catch(e){}
var nm='AI INFORMATION '+(beta?'BETA':'STABLE');
try{document.querySelector('meta[name="apple-mobile-web-app-title"]').setAttribute('content',nm);}catch(e){}
try{if(beta)document.title='AI Information BETA';}catch(e){}
window.AI_AGEQ=[];window.AGEWAIT=function(f){if(window.AI_AGE)f();else window.AI_AGEQ.push(f);};window.AI_AGEFLUSH=function(){var q=window.AI_AGEQ;window.AI_AGEQ=[];q.forEach(function(f){try{f();}catch(e){}});};
window.AI_SHOWBLOCK=function(){document.documentElement.classList.add('agb');if(document.getElementById('ageBlock'))return;var d=document.createElement('div');d.id='ageBlock';d.setAttribute('role','alertdialog');d.innerHTML='<div class="ab"><h1>⛔ You are blocked</h1><p>You told us you are under 13 years old. You cannot use this site.</p><p>You will be allowed to come back when you are 13 or older.</p><p><b>If you find a way to get in anyway, you are officially in violation of the Terms of Use.</b></p></div>';document.body.appendChild(d);};
if(window.AI_AGE==='u13'){if(document.body)window.AI_SHOWBLOCK();else document.addEventListener('DOMContentLoaded',window.AI_SHOWBLOCK);}
try{var l=document.querySelector('link[rel="manifest"]');if(l&&/^https?:$/.test(location.protocol)){var o=location.origin+'/';
var m={name:nm,short_name:nm,description:'Check links, messages and images, search sources and read tech news.',id:o,start_url:o,scope:o,display:'standalone',background_color:'#0a0a0a',theme_color:'#0a0a0a',icons:[{src:o+'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:o+'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'},{src:o+'icon.svg',sizes:'any',type:'image/svg+xml'}]};
l.href=URL.createObjectURL(new Blob([JSON.stringify(m)],{type:'application/manifest+json'}));}}catch(e){}})();

(function(){
function pref(){var p='auto';try{p=localStorage.getItem('ai_v9_anim')||'auto';}catch(e){}return p==='on'||p==='off'?p:'auto';}
window.AI_RMQ=function(){var p=pref();if(p==='on')return false;if(p==='off')return true;try{return !!(window.AI_RMQ&&AI_RMQ());}catch(e){return false;}};
function walk(rules,fn){for(var i=0;i<rules.length;i++){var r=rules[i];if(r.media)fn(r);if(r.cssRules&&r.type!==1)walk(r.cssRules,fn);}}
window.AI_ANIM_APPLY=function(){var p=pref();for(var k=0;k<document.styleSheets.length;k++){try{walk(document.styleSheets[k].cssRules,function(r){var o=r._aiOrig||(r._aiOrig=r.media.mediaText);if(o.indexOf('prefers-reduced-motion')<0)return;var np=/no-preference/.test(o),n=o;
if(p==='on'){n=np?o.replace(/\s*and\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/i,''):'not all';}
else if(p==='off'){n=np?'not all':o.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i,'all');}
if(!n||/^\s*$/.test(n))n='all';if(r.media.mediaText!==n)r.media.mediaText=n;});}catch(e){}}};
try{if(pref()!=='auto')window.AI_ANIM_APPLY();}catch(e){}
})();
(function(){var d=document.getElementById('splash');if(!d)return;var offS=false;try{offS=/"splash"/.test(localStorage.getItem('ai_v9_ftoff')||'');}catch(e){}if(offS||navigator.webdriver||(window.AI_RMQ&&AI_RMQ())){d.remove();return;}document.documentElement.classList.add('splashing');function rm(){if(d&&d.parentNode)d.parentNode.removeChild(d);d=null;document.documentElement.classList.remove('splashing');}d.addEventListener('click',rm);d.addEventListener('animationend',function(e){if(e.animationName==='spOut')rm();});var el0=0;try{el0=performance.now();}catch(e){}try{if(getComputedStyle(d).visibility==='hidden'){rm();return;}}catch(e){}setTimeout(rm,Math.max(150,Math.min(3300,3000-el0)));})();
var toastTimer=null;
/* v42: consent-aware storage. Until the visitor chooses, nothing except the choice itself is written to the device. */
var CONS=(function(){try{var j=JSON.parse(localStorage.getItem('ai_consent')||'null');return j&&j.v===1?j:null;}catch(e){return null;}})();
var MEM={};
var store={
get:function(k){if(Object.prototype.hasOwnProperty.call(MEM,k))return MEM[k];try{return localStorage.getItem(k);}catch(e){return null;}},
set:function(k,v){if(storeAllowed(k)){try{localStorage.setItem(k,v);}catch(e){}delete MEM[k];}else{MEM[k]=String(v);}}
};
(function(){try{var am=localStorage.getItem('ai_v9_autotheme');if(am==='time'||am==='weather'){var hh=new Date().getHours();var lt=hh>=7&&hh<19;document.body.classList.toggle('light-theme',lt);document.documentElement.style.colorScheme=lt?'light':'dark';document.querySelectorAll('.theme-btn').forEach(function(b){b.textContent=lt?'☀️':'🌙';});return;}}catch(e){}var t=store.get('ai_info_theme');if(t==='light'){document.body.classList.add('light-theme');document.querySelectorAll('.theme-btn').forEach(function(b){b.textContent='☀️';});}})();
var favorites=(function(){try{var f=JSON.parse(store.get('ai_favorites')||'[]');return Array.isArray(f)?f:[];}catch(e){return [];}})();var showOnlyFav=false;
var ALL_SOURCES=SRC_DATA.map(function(p,i){return{id:i,name:p[0],type:p[1],domain:p[2],tpl:p[3],region:p[4]};});
var TYPE_INFO={encyclopedia:'Reference and learning site',factcheck:'Fact-checking or investigation organisation',agency:'International news agency',news:'News outlet',bulgaria:'Bulgarian source',science:'Scientific journal, preprint server or science publication',health:'Health authority or medical reference',gov:'Official or intergovernmental institution',tech:'Technology source',bigtech:'Major US technology company',economy:'Business and finance source',company:'Major company or industry leader'};
/* live source lists: all Wikimedia sites in all languages + the Stack Exchange network, fetched when you search */
var LIVE={p:null,n:0};
var currentSources=[],currentQuery='';
var currentFiltered=[];
var currentWiki=null;
var filterTimer=null;
var clsSt=null,clsTimer=0;
var RADAR_SNAPSHOT={"taken": "3 Oct 2026, 11:47 (Sofia time)", "items": [{"t": "Court agrees with EFF: Utah's VPN law demands a technical impossibility", "u": "https://www.eff.org/deeplinks/2026/10/court-agrees-eff-utahs-vpn-law-demands-technical-impossibility", "p": 614}, {"t": "Mike Tomlin spent 12 years building a Minecraft city", "u": "https://www.nytimes.com/athletic/7648198/2026/10/01/mike-tomlin-minecraft-nfl-coach/", "p": 444}, {"t": "Apple Pass Designer", "u": "https://developer.apple.com/pass-designer/", "p": 409}, {"t": "FLUX 3 Image", "u": "https://bfl.ai/models/flux-3-image", "p": 335}, {"t": "The Legend of von Neumann (1973) [pdf]", "u": "https://gwern.net/doc/math/1973-halmos.pdf", "p": 275}, {"t": "A 12-year sequence of telescope images of a star and four planets orbiting", "u": "https://bsky.app/profile/theplanetaryguy.com/post/3mwucf5ert22f", "p": 273}, {"t": "Show HN: Giving Opus 5.5 a simulated paint canvas", "u": "https://stillwet.art/", "p": 270}, {"t": "Extra Big Ass Intelligence", "u": "https://www.extrabigassintelligence.com/", "p": 265}]};
var radarSeen=null,radarTimer=null,radarBusy=false,radarLive=false,radarLast=0;
var SUSPICIOUS_TLDS=['zip','mov','top','xyz','click','link','gq','tk','ml','cf','ga','work','country','support','rest','cam','icu','monster','buzz','cyou','sbs','quest','loan','date','men','win','bid','download','review','racing','stream','party'];
var SHORTENERS=['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rebrand.ly','shorturl.at','tiny.cc','rb.gy','lnkd.in','t.ly','s.id','v.gd','clck.ru'];
var RISKY_EXT=['exe','apk','scr','msi','bat','cmd','vbs','js','jar','iso','dmg','pkg','lnk','ps1','hta'];
var HOST_WORDS=['login','signin','sign-in','verify','secure','account','update','confirm','wallet','password','billing','invoice','gift','claim','prize','suspend','unlock','recover','support','helpdesk'];
var BRANDS={paypal:['paypal.com','paypal.me'],apple:['apple.com','icloud.com'],google:['google.com','gmail.com','youtube.com'],microsoft:['microsoft.com','live.com','outlook.com','office.com','windows.com'],amazon:['amazon.com','amazon.de','amazon.co.uk','amazonaws.com'],facebook:['facebook.com','fb.com','messenger.com'],instagram:['instagram.com'],netflix:['netflix.com'],binance:['binance.com'],coinbase:['coinbase.com'],dhl:['dhl.com','dhl.de'],fedex:['fedex.com'],ups:['ups.com'],econt:['econt.com'],speedy:['speedy.bg'],revolut:['revolut.com'],visa:['visa.com'],mastercard:['mastercard.com'],whatsapp:['whatsapp.com'],telegram:['telegram.org','t.me'],olx:['olx.bg','olx.com'],postbank:['postbank.bg'],dskbank:['dskbank.bg'],fibank:['fibank.bg'],unicredit:['unicreditbulbank.bg','unicredit.eu'],raiffeisen:['raiffeisen.bg','rbinternational.com'],linkedin:['linkedin.com'],tiktok:['tiktok.com'],steam:['steampowered.com','steamcommunity.com'],dropbox:['dropbox.com'],adobe:['adobe.com'],ebay:['ebay.com'],aliexpress:['aliexpress.com'],docusign:['docusign.com','docusign.net'],usps:['usps.com'],chase:['chase.com'],wellsfargo:['wellsfargo.com'],bankofamerica:['bankofamerica.com']};
var TXT_RULES=[
{id:'urgency',w:12,label:'Pressure and urgency',why:'Scammers rush you so you do not stop to verify.',p:['urgent*','immediately','right away','within 24 hours','within 48 hours','act now','last chance','final notice','expires today','limited time','спешно*','незабавно','веднага','в рамките на 24 часа','в рамките на 48 часа','последен шанс','последно предупреждение','само днес','изтича днес']},
{id:'threat',w:15,label:'Account threat',why:'Fake alerts about blocked or suspended accounts are the classic phishing opener.',p:['account suspended','account locked','account blocked','account has been','your account will be','unusual activity','suspicious activity','unauthorized login','unauthorised login','verify your account','verify your identity','confirm your identity','security alert','акаунтът ви','профилът ви','сметката ви','необичайна активност','подозрителна активност','потвърдете самоличност*','потвърдете данни*','верифицирайте']},
{id:'credentials',w:25,label:'Asks for secrets',why:'Banks and real companies never ask for passwords, PINs or one-time codes by message.',p:['password','passcode','pin','cvv','cvc','otp','one-time code','verification code','sms code','security code','card number','login details','парола','паролата','пин','пин код','пин-код','код от sms','код за потвърждение','еднократен код','номер на карта*','данни за вход']},
{id:'payment',w:15,label:'Unusual payment request',why:'Gift cards, crypto and wire transfers are hard to reverse, which is why scammers ask for them.',p:['wire transfer','western union','moneygram','gift card*','itunes card','google play card','bitcoin','usdt','crypto*','wallet address','processing fee','release fee','advance fee','bank transfer','send money','iban','банков превод','преведете','пратете пари','карта за подарък','процесинг такса','такса за','криптовалут*','биткойн','портфейл']},
{id:'prize',w:18,label:'Prize, lottery or inheritance',why:'You cannot win a lottery you did not enter. This is an advance-fee classic.',p:['you have won','you won','congratulations','lottery','winner','prize','inheritance','beneficiary','unclaimed funds','спечелихте','печеливш*','лотария','награда','наследство','бенефициент','поздравления']},
{id:'delivery',w:10,label:'Parcel or delivery notice',why:'Fake courier messages ask for a small fee or your card details.',p:['parcel','package could not','delivery failed','could not be delivered','customs fee','customs duty','shipping fee','пратка','колет','куриер','митническа такса','такса за доставка','не може да бъде доставена','econt','speedy','еконт','спиди','dhl','fedex']},
{id:'authority',w:12,label:'Claims to be an authority',why:'Police, tax or bank security rarely contact you this way, and never to move your money.',p:['police','court','tax office','tax authority','irs','customs','bank security','fraud department','полиция','прокуратура','съд','нап','данъчна','митница','отдел сигурност']},
{id:'secrecy',w:15,label:'Asks you to keep it secret',why:'Isolation stops you from asking someone who would spot the scam.',p:['don\'t tell anyone','do not tell anyone','keep this confidential','keep it secret','не казвайте на никого','не споделяйте с никого','поверително']},
{id:'remote',w:25,label:'Remote access or app install',why:'Installing remote-control apps lets a scammer empty your accounts.',p:['anydesk','teamviewer','remote access','ultraviewer','quicksupport','install the app','download the app','отдалечен достъп','инсталирайте приложение','изтеглете приложение']},
{id:'invest',w:15,label:'Too-good-to-be-true profit',why:'Guaranteed returns do not exist. Promises like this are typical of investment fraud.',p:['guaranteed profit','guaranteed return','risk-free','risk free','double your money','100% return','passive income','trading signals','investment opportunity','гарантирана печалба','гарантиран доход','без риск','удвоите','пасивен доход','инвестиц*']},
{id:'job',w:10,label:'Easy-money job offer',why:'Fake job offers lead to advance fees, money-mule work or stolen documents.',p:['work from home','easy money','earn $','earn €','лесни пари','работа от вкъщи','работа от дома','печелете от вкъщи']},
{id:'generic',w:8,label:'Generic greeting',why:'Mass messages do not know your name.',p:['dear customer','dear user','dear sir','dear client','dear account holder','уважаеми клиент','уважаеми потребител','драги клиент']},
{id:'channel',w:6,label:'Moves you to a chat app',why:'Scammers prefer private chats where fewer checks apply.',p:['whatsapp','telegram','viber']}
];
var scamMode='url';
var AI_SIGS=[
{re:/compositewithtrainedalgorithmicmedia/i,label:'Declared as a composite that includes AI-generated media (IPTC DigitalSourceType)'},
{re:/trainedalgorithmicmedia/i,label:'Declared as AI-generated (IPTC DigitalSourceType: trainedAlgorithmicMedia)'},
{re:/midjourney/i,label:'Metadata mentions Midjourney'},
{re:/dall[\-· ]?e\b/i,label:'Metadata mentions DALL·E'},
{re:/openai/i,label:'Metadata mentions OpenAI'},
{re:/stable[ _\-]?diffusion/i,label:'Metadata mentions Stable Diffusion'},
{re:/comfyui/i,label:'Metadata mentions ComfyUI'},
{re:/automatic1111/i,label:'Metadata mentions AUTOMATIC1111'},
{re:/adobe firefly/i,label:'Metadata mentions Adobe Firefly'},
{re:/leonardo\.ai/i,label:'Metadata mentions Leonardo.Ai'},
{re:/ideogram/i,label:'Metadata mentions Ideogram'},
{re:/novelai/i,label:'Metadata mentions NovelAI'},
{re:/black forest labs/i,label:'Metadata mentions Black Forest Labs (FLUX)'},
{re:/made with google ai/i,label:'Metadata says "Made with Google AI"'},
{re:/bing image creator|microsoft designer/i,label:'Metadata mentions Bing Image Creator / Designer'},
{re:/\bsdxl\b/i,label:'Metadata mentions SDXL'}
];
var EDITORS=/photoshop|lightroom|gimp|affinity|capture one|snapseed|canva|picsart|pixelmator|paint\.net|darktable|luminar|facetune|illustrator|figma/i;
var AI_DIMS={'512x512':1,'768x768':1,'1024x1024':1,'1024x1792':1,'1792x1024':1,'1024x1536':1,'1536x1024':1,'832x1216':1,'1216x832':1,'1344x768':1,'768x1344':1,'896x1152':1,'1152x896':1,'1536x1536':1,'2048x2048':1};
var _dec=new TextDecoder('latin1');
var fakeRun=0,fakeUrl=null;
var trendWiki=[],trendTech=[],trendTimer=null,trendTip='';
var TREND_STOP=/^(the|and|for|with|from|that|this|into|your|you|are|was|not|but|have|has|had|how|why|what|when|who|new|more|than|will|can|its|our|their|about|over|after|before|show|hn|ask|tell|using|use|via|vs|out|all|one|two|now|just|get|got|why|does|did|is|in|on|of|to|a|an|it|by|at|as|be|or|we|my|me|i)$/i;
loadTrending();
measureBars();
if(window.ResizeObserver){var barsRO=new ResizeObserver(measureBars);barsRO.observe(document.querySelector('.header'));barsRO.observe(document.querySelector('.search-header'));}
else window.addEventListener('resize',measureBars);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSummary();});
(function(){var btn=document.getElementById('backToTopBtn');
var ticking=false,shown=false;
function upd(){ticking=false;var want=window.scrollY>400;if(want!==shown){shown=want;btn.classList.toggle('show',want);}}
window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd);}},{passive:true});upd();})();
(function(){var z=document.getElementById('fakeDropZone');
['dragenter','dragover'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();});});
z.addEventListener('drop',function(e){e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files[0];if(f)handleFakeFile(f);});})();
document.querySelectorAll('.scam-card').forEach(function(c){c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click();}});});
var API={ok:false,urlCheck:false,site:''};
var dnsVia='';
(function(){

/* ---- version check with a percent bar: streams the newest page from Cloudflare and shows how much is downloaded.
   It checks again when you come back to the tab and every 5 minutes, so a second new version is noticed too ---- */
(function(){
if(!/^https?:$/.test(location.protocol)||!window.fetch||!window.ReadableStream)return;
function build(t){var m=/<meta name="app-build" content="([^"]*)"/.exec(t);return m?m[1]:'';}
var cur=(document.querySelector('meta[name="app-build"]')||{}).content||'',known=cur,lastTag='',busy=false,bar=null,hideT=0;
function mkBar(){var old=document.getElementById('verBar');if(old&&old.parentNode)old.parentNode.removeChild(old);var d=document.createElement('div');d.id='verBar';d.setAttribute('role','status');d.setAttribute('aria-live','polite');d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:8px;z-index:100002;max-width:calc(100vw - 24px);box-sizing:border-box;white-space:nowrap;background:var(--bg2,#111);color:var(--text,#fff);border:1.5px solid var(--accent,#0f8);border-radius:999px;padding:5px 12px;font:600 12px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);display:flex;gap:8px;align-items:center;overflow:hidden';
var t=document.createElement('span');t.id='verTxt';d.appendChild(t);var tr=document.createElement('span');tr.style.cssText='width:56px;height:6px;border-radius:4px;background:rgba(128,128,128,.35);overflow:hidden;flex:none';var f=document.createElement('span');f.id='verFill';f.style.cssText='display:block;height:100%;width:0;background:var(--accent,#0f8);transition:width .15s';tr.appendChild(f);d.appendChild(tr);document.body.appendChild(d);return d;}
function say(txt,pct){clearTimeout(hideT);if(!bar||!bar.parentNode)bar=mkBar();document.getElementById('verTxt').textContent=txt;document.getElementById('verFill').style.width=Math.max(0,Math.min(100,pct||0))+'%';var o=bar.querySelector('button');if(o)o.remove();}
function hide(ms){clearTimeout(hideT);hideT=setTimeout(function(){if(bar&&bar.parentNode)bar.parentNode.removeChild(bar);bar=null;},ms);}
function check(first){
if(busy)return;busy=true;
var tm=first?setTimeout(function(){say('⬇ Checking… 0%',0);},400):0;
fetch(location.pathname,{cache:'no-cache',headers:{'x-ver-check':'1'},credentials:'same-origin'}).then(function(res){
if(!res.ok||!res.body)throw 0;
var tag=res.headers.get('etag')||'';
if(!first&&tag&&tag===lastTag){try{res.body.cancel();}catch(e){}return;}
lastTag=tag;
var total=Number(res.headers.get('x-page-bytes'))||Number(res.headers.get('content-length'))||0;
var keep=res.clone(),rd=res.body.getReader(),got=0,parts=[];
function pump(){return rd.read().then(function(r){
if(r.done)return;parts.push(r.value);got+=r.value.length;
if(first||total){var pc=total?Math.min(99,Math.round(got*100/total)):0;if(total)say('⬇ Updating… '+pc+'%',pc);else say('⬇ Updating… '+Math.round(got/1024)+' KB',50);}
return pump();});}
return pump().then(function(){
clearTimeout(tm);tm=0;
var u=new Uint8Array(got),o=0;parts.forEach(function(x){u.set(x,o);o+=x.length;});
var nb=build(new TextDecoder().decode(u));
if(nb&&nb!==cur){
try{if(window.caches&&typeof cacheOK==='function'&&cacheOK()){caches.keys().then(function(ks){var k=ks.filter(function(x){return /^aiinfo-/.test(x);})[0];if(k)caches.open(k).then(function(c){c.put(new Request(location.origin+'/'),keep);});});}}catch(e){}
known=nb;try{var oldT=document.getElementById('shareStatus');if(oldT&&/New version/i.test(oldT.textContent)){oldT.style.display='none';}}catch(e){}say('✅ New version ready',100);
var bt=document.createElement('button');bt.type='button';bt.textContent='Reload';bt.style.cssText='border:0;border-radius:999px;padding:3px 10px;font-weight:700;cursor:pointer;background:var(--accent,#0f8);color:var(--bg,#000)';bt.onclick=function(){bt.disabled=true;bt.textContent='…';var go=function(){location.reload();};try{var jobs=[];if(window.caches)jobs.push(caches.keys().then(function(ks){return Promise.all(ks.filter(function(x){return /^aiinfo-/.test(x);}).map(function(x){return caches.delete(x);}));}));if(navigator.serviceWorker)jobs.push(navigator.serviceWorker.getRegistration().then(function(r){return r&&r.update();}));Promise.all(jobs).then(go,go);setTimeout(go,2500);}catch(e){go();}};bar.appendChild(bt);hide(7000);}
else if(first){say('✓ Up to date',100);hide(1000);}
else if(bar)hide(0);
});
}).catch(function(){if(tm)clearTimeout(tm);if(bar)hide(0);}).then(function(){busy=false;});
}
function start(){check(true);}
if(document.readyState==='complete')start();else window.addEventListener('load',start);
document.addEventListener('visibilitychange',function(){if(!document.hidden)check(false);});
window.addEventListener('online',function(){check(false);});
setInterval(function(){if(!document.hidden)check(false);},300000);
})();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
window.addEventListener('load',function(){try{if(cacheOK())navigator.serviceWorker.register('sw.js').catch(function(){});else purgeCaches();}catch(e){}});
}
var deferred=null,btn=document.getElementById('installBtn');
if(!btn)return;
function standalone(){try{return window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||window.matchMedia('(display-mode: minimal-ui)').matches||window.matchMedia('(display-mode: window-controls-overlay)').matches||navigator.standalone===true||/[?&]source=pwa/.test(location.search);}catch(e){return false;}}
function installed(){return standalone()||store.get('ai_installed')==='1';}
function sync(){if(installed()){btn.hidden=true;btn.style.display='none';}}
sync();
try{window.matchMedia('(display-mode: standalone)').addEventListener('change',sync);}catch(e){}
try{if(navigator.getInstalledRelatedApps)navigator.getInstalledRelatedApps().then(function(a){if(a&&a.length){store.set('ai_installed','1');sync();}}).catch(function(){});}catch(e){}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();if(installed())return;deferred=e;btn.hidden=false;});
btn.title='Note: when the site is updated to a new version, this button may appear again by mistake.';btn.addEventListener('click',function(){if(!deferred)return;try{toast('ℹ️ Note: after a site update this Install button may appear again by mistake, even if the app is already installed.','#b7791f',7000);}catch(e){}deferred.prompt();deferred.userChoice.then(function(c){deferred=null;btn.hidden=true;if(c&&c.outcome==='accepted')store.set('ai_installed','1');});});
window.addEventListener('appinstalled',function(){store.set('ai_installed','1');btn.hidden=true;btn.style.display='none';});
if(standalone())store.set('ai_installed','1');
})();
initApi();
window.toggleTheme=toggleTheme;window.hideKeyboard=hideKeyboard;
window.doSearch=doSearch;window.filterSources=filterSources;window.toggleFavFilter=toggleFavFilter;window.toggleFav=toggleFav;
window.doSummary=doSummary;window.closeSummary=closeSummary;window.doShare=doShare;window.doExport=doExport;
window.saveProgress=saveProgress;window.loadProgress=loadProgress;window.loadBreaking=loadBreaking;
window.openScam=openScam;window.closeScam=closeScam;window.runScam=runScam;
window.handleFakeFile=handleFakeFile;window.clearFake=clearFake;window.loadTrending=loadTrending;
/* ===================== v9: core ===================== */
var V9={bg:false,stack:[]};
var XC={},XCT={define:3600000,videos:600000,feed:300000,digest:300000,article:900000,search:300000};
var DL_BUSY={};
/* ---- activity log (feeds EXPORT NEW INFORMATION) ---- */
var ACT=jget('ai_v9_act',[]);
document.addEventListener('keydown',function(e){
if(e.key!=='Escape')return;
if(V9.stack.length){closePanel(V9.stack[V9.stack.length-1]);e.preventDefault();return;}
var w=$('v9Welcome');if(w&&w.style.display==='flex'){v9WelcomeNext();return;}
var s=$('aiSummary');if(s&&getComputedStyle(s).display!=='none'){closeSummary();return;}
var o=$('scamLabOutput');if(o&&o.style.display!=='none'){closeScam();return;}
});
/* tooltip: hover a close (✕) button for 2 s */
(function(){
var tip=el('div');tip.id='v9Hint';document.body.appendChild(tip);var timer=null;
function isX(t){return t&&t.tagName==='BUTTON'&&(t.classList.contains('v9-x')||/^✕/.test((t.textContent||'').trim())||t.getAttribute('aria-label')==='Close');}
document.addEventListener('mouseover',function(e){
var t=e.target.closest&&e.target.closest('button');if(!isX(t))return;clearTimeout(timer);
timer=setTimeout(function(){var r=t.getBoundingClientRect();tip.textContent='Tip: you can also close this with the Esc key';
tip.style.display='block';tip.style.left=Math.max(8,Math.min(innerWidth-250,r.left-120))+'px';tip.style.top=(r.bottom+8)+'px';},2000);
});
document.addEventListener('mouseout',function(e){var t=e.target.closest&&e.target.closest('button');if(isX(t)){clearTimeout(timer);tip.style.display='none';}});
document.addEventListener('click',function(){clearTimeout(timer);tip.style.display='none';},true);
})();
/* ---- v64: pointer light + tilt on glass ---- */
(function(){
if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches||(window.AI_RMQ&&AI_RMQ()))return;
var SEL='.v9-card,.scam-card,.fd-post,.vd-card,.tool-card,.std-card,#v9Bar button,.hdr-chip',cur=null,raf=0,ev=null;
function upd(){raf=0;if(!cur||!ev)return;var r=cur.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;
var big=r.width>260||r.height>200,k=big?2.2:5;
cur.style.setProperty('--mx',(x*100).toFixed(1)+'%');cur.style.setProperty('--my',(y*100).toFixed(1)+'%');
cur.style.setProperty('--ry',((x-.5)*k).toFixed(2)+'deg');cur.style.setProperty('--rx',((.5-y)*k).toFixed(2)+'deg');}
document.addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;var t=e.target.closest&&e.target.closest(SEL);
if(t!==cur){if(cur){cur.style.removeProperty('--rx');cur.style.removeProperty('--ry');}cur=t;}
if(!cur)return;ev=e;if(!raf)raf=requestAnimationFrame(upd);},{passive:true});
document.addEventListener('pointerleave',function(){if(cur){cur.style.removeProperty('--rx');cur.style.removeProperty('--ry');cur=null;}},true);
})();
/* ---- title sun-glint ---- */
(function(){
var h=document.querySelector('.header h1');if(!h)return;var n=h.firstChild;if(!n||n.nodeType!==3)return;
var txt=n.nodeValue.trim(),f=document.createDocumentFragment();
for(var i=0;i<txt.length;i++){var c=txt[i];if(c===' '){f.appendChild(document.createTextNode(' '));continue;}var s=el('span','ttl-l',c);s.style.setProperty('--i',i);s.setAttribute('aria-hidden','true');f.appendChild(s);}
h.insertBefore(f,n);h.removeChild(n);h.setAttribute('aria-label',txt);h.setAttribute('data-t',txt);
})();
var welcomeSession=false;
try{if(hasCookie('ai_welcome'))document.cookie='ai_welcome=; Max-Age=0; Path=/';}catch(e){}
/* ---- hooks that feed the activity log ---- */
(function(){
var _s=window.doSearch;window.doSearch=doSearch=function(){var q=(($('q')||{}).value||'').trim();if(q){var rc=jget('ai_v9_recent',[]).filter(function(x){return x.toLowerCase()!==q.toLowerCase();});rc.unshift(q);jset('ai_v9_recent',rc.slice(0,10));}var r=_s.apply(this,arguments);logAct('search',q);return r;};
var _r=window.runScam;window.runScam=runScam=function(){
var mode=scamMode,inp=mode==='url'?$('scamInput').value:$('scamText').value.slice(0,300);var r=_r.apply(this,arguments);
setTimeout(function(){var box=$('scamResult');logAct('scam',{mode:mode,input:inp,result:box?box.innerText.replace(/\s+/g,' ').slice(0,400):''});},2500);
if(mode==='url'&&String(inp||'').trim())multiScan(inp);return r;};
var _h=window.handleFakeFile;window.handleFakeFile=handleFakeFile=function(f){
var r=_h.apply(this,arguments);if(f){setTimeout(function(){var a=$('fakeAnalysis');logAct('fake',{name:f.name,type:f.type,size:f.size,result:a?a.innerText.replace(/\s+/g,' ').slice(0,400):''});},3500);}return r;};
var _t=window.toggleTheme;window.toggleTheme=toggleTheme=function(){var r=_t.apply(this,arguments);logAct('theme',document.body.classList.contains('light-theme')?'light':'dark');return r;};
})();
/* ---- LIVE RADAR: refresh interval + save stories ---- */
var radarEvery=Math.max(10,parseInt(store.get('ai_radar_every')||'30',10)||30);
(function(){
var _rr=window.renderRadar;
window.renderRadar=renderRadar=function(items,note,markNew){
_rr.apply(this,arguments);
[].forEach.call(document.querySelectorAll('#breakingNewsScroll a.breaking-item'),function(a,i){
if(a.parentNode.className==='ri-wrap')return;
var h=items[i];if(!h)return;var w=el('div','ri-wrap');w.className='ri-wrap';w.style.cssText='display:flex;gap:4px;align-items:stretch';
a.parentNode.insertBefore(w,a);w.appendChild(a);a.style.flex='1';
var sb=el('button','save-btn','💾');sb.type='button';sb.title='Save this story';sb.setAttribute('aria-label','Save story');
sb.onclick=function(){saveStory(h.t,h.u,(h.a?new Date(h.a*1000).toLocaleString():'')+(h.p>0?' · ▲ '+h.p:''));};w.appendChild(sb);
});
};
var bar=$('breakingNewsBar');if(!bar)return;
var tools=el('div','radar-tools');
tools.appendChild(el('span','','Auto-refresh every'));
var inp=el('input');inp.type='number';inp.min='1';inp.value=radarEvery>=60&&radarEvery%60===0?radarEvery/60:radarEvery;inp.setAttribute('aria-label','Interval');
var sel=el('select');sel.setAttribute('aria-label','Unit of time');[['s','seconds'],['m','minutes']].forEach(function(o){var op=el('option','',o[1]);op.value=o[0];sel.appendChild(op);});sel.value=radarEvery>=60&&radarEvery%60===0?'m':'s';
var ok=el('button','','Set');inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();ok.click();}});ok.type='button';ok.onclick=function(){var v=parseFloat(inp.value);if(!(v>0)){toast('?','#ff4444');return;}setRadarEvery(sel.value==='m'?Math.round(v*60):Math.round(v));};
var sv=el('button','');sv.id='radarSaved';sv.type='button';sv.onclick=downloadStories;
tools.appendChild(inp);tools.appendChild(sel);tools.appendChild(ok);tools.appendChild(sv);
bar.insertBefore(tools,$('breakingNewsScroll'));updSaved();
if(radarEvery!==30)setTimeout(function(){setRadarEvery(radarEvery);},0);
})();
/* ---- AI TIP ---- */
var tipState={topic:store.get('ai_tip_topic')||'security',every:parseInt(store.get('ai_tip_every')||'3600',10)||3600};
/* ===== shared AI helper: one "Ask AI" block for every tool (server task names are fixed on the server) ===== */





/* ---- Features menu: switch whole features off and on (hidden and stopped) ---- */
var FT={mem:null,
off:function(){if(!FT.mem){FT.mem={};try{var a=jget('ai_v9_ftoff',[]);(Array.isArray(a)?a:[]).forEach(function(k){if(/^[a-z0-9]{2,20}$/.test(String(k)))FT.mem[k]=1;});}catch(e){}}return FT.mem;},
on:function(id){return !FT.off()[id];},
set:function(id,v){var o=FT.off();if(v)delete o[id];else o[id]=1;try{jset('ai_v9_ftoff',Object.keys(o));}catch(e){}FT.css();},
css:function(){var st=document.getElementById('ftStyle');if(!st){st=document.createElement('style');st.id='ftStyle';document.head.appendChild(st);}st.textContent=Object.keys(FT.off()).map(function(k){return'[data-ft~="'+k+'"]{display:none!important}';}).join('\n');},
rules:[['feed','#feedBar'],['news','#breakingNewsBar'],['trending','#trendingBar'],['weekly','#weeklyCard'],['tip','#tipCard'],['fakeimg','#fakeCheckerBar'],['weather','#wxChip'],
['chat','#v9Bar button',/AI Chat/],['quote','#v9Bar button',/Quote context/],['compare','#v9Bar button',/Compare/],['weather','#v9Bar button',/Weather/],['dict','#v9Bar button',/Dictionary/],['translator','#v9Bar button',/Translator/],['calc','#v9Bar button',/Calculator/],['reminders','#v9Bar button',/Reminders/],['install','#v9Bar button',/Install/],
['urlscan','.scam-card',/URL Scanner/],['textan','.scam-card',/Text Analyzer/],['weekly','.scam-card',/Weekly/],['tip','.scam-card',/AI Tip/],['tools','.scam-card',/Tools/],['quiz','.scam-card',/Quiz/]],
tag:function(){FT.rules.forEach(function(r){[].forEach.call(document.querySelectorAll(r[1]),function(e){if(r[2]&&!r[2].test(e.getAttribute('data-ft-txt')||e.textContent))return;if(r[2]&&!e.getAttribute('data-ft-txt'))e.setAttribute('data-ft-txt',e.textContent);var c=(e.getAttribute('data-ft')||'').split(' ').filter(Boolean);if(c.indexOf(r[0])<0){c.push(r[0]);e.setAttribute('data-ft',c.join(' '));}});});}};
window.FT=FT;
var TEXTEXT=/\.(txt|md|csv|tsv|json|xml|html?|css|js|mjs|ts|py|sh|bat|cmd|ps1|vbs|php|rb|pl|java|c|cpp|h|cs|go|rs|sql|ini|cfg|conf|yml|yaml|toml|log|eml|reg|inf|lnk|url|desktop|svg)$/i;

/* ===== AI video finder: the AI only CHOOSES among videos our own script found in Internet Archive / Wikimedia; the script then caches and plays them ===== */
var VID_OK=/archive\.org|wikimedia|wikipedia|commons/i;





var tipTimer=null;
(function(){var c=navigator.connection;if(store.get('ai_lowdata')===null&&c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')))store.set('ai_lowdata','1');document.body.classList.toggle('lowdata',LOW());})();
var WK_TITLES={scams:'🎣 Scams & phishing',vulns:'🐛 Vulnerabilities, breaches & malware',privacy:'🔒 Privacy'};
var CMP_STOP={};'the and for that with this from have were been their which would there about after other also into than then them these those will more most over such only some what when where while your you are was has had not but can may its our out all any one two new said says say'.split(' ').forEach(function(w){CMP_STOP[w]=1;});
var CMP_EMO='shocking,shocked,outrage,outrageous,disaster,disastrous,catastrophe,catastrophic,horrific,terrifying,devastating,stunning,explosive,bombshell,scandal,furious,slams,blasts,destroys,massive,huge,crisis,chaos,panic,nightmare,unbelievable,incredible,миг,шок,шокиращ,скандал,ужас,катастрофа,бомба,кошмар,невероятен,драма,паника,хаос,разгром,срам'.split(',');
var CMP_ABS='always,never,everyone,nobody,completely,totally,absolutely,undeniable,undeniably,proven,obviously,certainly,all,none,винаги,никога,всички,никой,напълно,абсолютно,доказано,очевидно,безспорно'.split(',');
var CMP_HEDGE='reportedly,allegedly,may,might,could,possibly,apparently,suggests,suggested,likely,unclear,claims,claimed,според,твърди,твърдят,може,вероятно,предполага,привидно,уж'.split(',');
var CMP_ATTR=['said','says','told','according to','announced','confirmed','stated','reported','заяви','каза','според','съобщи','потвърди'];

/* ===================== v49: calculator + reminders ===================== */
(function(){try{document.querySelectorAll('.scam-card h4').forEach(function(h){h.setAttribute('aria-level','3');});}catch(e){}})();

/* ===================== v9: weather ===================== */
var WMO={0:['☀️','Clear sky'],1:['🌤️','Mostly clear'],2:['⛅️','Partly cloudy'],3:['☁️','Overcast'],45:['🌫️','Fog'],48:['🌫️','Rime fog'],51:['🌦️','Light drizzle'],53:['🌦️','Drizzle'],55:['🌧️','Dense drizzle'],56:['🌧️','Freezing drizzle'],57:['🌧️','Freezing drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],66:['🌧️','Freezing rain'],67:['🌧️','Freezing rain'],71:['🌨️','Light snow'],73:['🌨️','Snow'],75:['❄️','Heavy snow'],77:['🌨️','Snow grains'],80:['🌦️','Rain showers'],81:['🌧️','Rain showers'],82:['⛈️','Violent showers'],85:['🌨️','Snow showers'],86:['❄️','Heavy snow showers'],95:['⛈️','Thunderstorm'],96:['⛈️','Thunderstorm, hail'],99:['⛈️','Thunderstorm, heavy hail']};
var wxLoc=jget('ai_wx_loc',{name:'Sofia',lat:42.6977,lon:23.3219}),wxData=null;
var wxPanelBody=null,wxNote='';
(function(){try{var ua=navigator.userAgent||'',mob=/Android|iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),w=[],m;
var desk=/Windows NT|Macintosh|Mac OS X/i.test(ua)&&!mob;
if(!mob&&!desk)w.push('This device does not run Android, iOS, Windows or macOS, so animations or icons may not look right.');
var ok=true;
if((m=/Firefox\/(\d+)|FxiOS\/(\d+)/.exec(ua))){if(+(m[1]||m[2])<110)ok=false;}
else if((m=/Chrome\/(\d+)|CriOS\/(\d+)/.exec(ua))){if(+(m[1]||m[2])<110)ok=false;}
else if((m=/Version\/(\d+)[\d.]* .*Safari/.exec(ua))){if(+m[1]<16)ok=false;}
else w.push('This browser is not one the site was tested with, so some things may not work.');
if(!ok)w.push('Your browser looks old. Update it, or parts of the site may not work.');
if(!w.length||sessionStorage.getItem('ai_compat_ok'))return;
var b=document.createElement('div');b.setAttribute('role','note');b.style.cssText='margin:8px 12px;padding:10px 12px;border-radius:12px;border:1.5px solid #f5a623;background:var(--bg2);color:var(--text);font-size:13px;line-height:1.45;display:flex;gap:10px;align-items:flex-start';
var t=document.createElement('div');t.style.flex='1';t.textContent='⚠️ '+w.join(' ');var x=document.createElement('button');x.type='button';x.textContent='✕';x.setAttribute('aria-label','Close');x.style.cssText='background:none;border:none;color:var(--text);font-size:16px;cursor:pointer';x.onclick=function(){b.remove();try{sessionStorage.setItem('ai_compat_ok','1');}catch(e){}};
b.appendChild(t);b.appendChild(x);document.body.insertBefore(b,document.body.firstChild);}catch(e){}})();
window.AI_AUTOTHEME_APPLY=function(){var m=atMode();if(m==='off')return null;var d=atDecide();var cur=document.body.classList.contains('light-theme');
if(cur!==d.light){document.body.classList.toggle('light-theme',d.light);document.documentElement.style.colorScheme=d.light?'light':'dark';document.querySelectorAll('.theme-btn').forEach(function(b){b.textContent=d.light?'☀️':'🌙';});}
return d;};
window.AI_AUTOTHEME_STOP=function(){if(atMode()==='off')return;try{store.set('ai_v9_autotheme','off');localStorage.setItem('ai_v9_autotheme','off');}catch(e){}toast('Automatic theme is off. You are in control.','var(--accent)',2500);if(window.AI_AUTOTHEME_REFRESH)AI_AUTOTHEME_REFRESH();};
setInterval(function(){if(!document.hidden)try{AI_AUTOTHEME_APPLY();}catch(e){}},300000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)try{AI_AUTOTHEME_APPLY();}catch(e){}});
/* ===================== v9: video cache ===================== */
var VC={name:'ai-v9-videos',max:1024*1024*1024,per:512*1024*1024,blobMax:6*1024*1024,lastScroll:0,busy:0,hold:0,q:[],state:{},idx:jget('ai_v9_vidx',{}),par:2,ahead:2,wifi:true};
var VC_SIZES=[150,1024,3072,5120,9216];
vcApplySize(store.get('ai_vcsize')||1024);VC.wifi=store.get('ai_vcwifi')!=='0';
/* ===================== v33: video quality (smallest → 8K) ===================== */
var VQL=[144,240,360,480,720,1080,1440,2160,4320],VQN={144:'144p',240:'240p',360:'360p',480:'480p',720:'720p HD',1080:'1080p Full HD',1440:'1440p 2K',2160:'2160p 4K',4320:'4320p 8K'},VQBIG={};
var vcObs=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target._on&&e.target._on();}else{e.target._off&&e.target._off();}});},{rootMargin:'700px 0px'}):null;
document.addEventListener('visibilitychange',function(){if(document.hidden)[].forEach.call(document.querySelectorAll('.vd-card video'),function(v){v.pause();});});
/* ===================== v9: video sources (server, with browser fallback) ===================== */
var PAIDRE=/fair use|non-?free|all rights reserved|proprietary|\bpaid\b|premium|subscription|\brent(al)?\b|purchase|pay[- ]per/i;
var KIDRE=/(?<![\p{L}])(sex\w*|porn\w*|nude|nudes|nudity|naked|nsfw|xxx|erotic\w*|fetish\w*|strip\s?tease|striptease|escort\w*|onlyfans|hentai|bdsm|orgy|milf|boob\w*|topless|lingerie|bikini\s+model|adult\s+(only|content|video)|18\+|gore|beheading|murder\w*|massacre|torture|rape\w*|suicide|self[- ]harm|cocaine|heroin|meth\b|weed|cannabis|marijuana|drug\s+(deal|use)\w*|casino|gambl\w*|betting|slot\s+machine|секс\w*|порн\w*|еротик\w*|еротичн\w*|голи\s+(жени|мъже|момичета|тела)|гола|голо\s+тяло|проститут\w*|насилие|убийств\w*|самоубийств\w*|изнасилван\w*|наркотик\w*|хазарт\w*|казино|залагани\w*)(?![\p{L}])/iu;
var KIDSRC=/mastodon|lemmy|peertube|reddit|4chan|tumblr/i;
/* ===================== v9: videos panel ===================== */
var TOPICS=['documentary','nature','space','science','technology','history','music','art','travel','animals','ocean','city'];
var quoteRunId=0;
/* ===================== v9: assemble the UI ===================== */
(function v9init(){
var hdr=document.querySelector('.header'),tools=el('div','hdr-tools');
var wx=el('button','hdr-chip','🌡️ --°');wx.id='wxChip';wx.type='button';wx.setAttribute('aria-label','Weather');tools.appendChild(wx);
['themeBtn'].forEach(function(id){var e=$(id);if(e)tools.appendChild(e);});hdr.appendChild(tools);setTimeout(function(){var ib=$('installBtn'),vb=$('v9Bar');if(ib&&vb)vb.appendChild(ib);},0);
var gc=el('div');gc.id='greetCard';gc.setAttribute('role','region');gc.setAttribute('aria-label','Greeting');hdr.parentNode.insertBefore(gc,hdr.nextSibling);
var bar=el('div');bar.id='v9Bar';
[['🔎 Quote context',function(){openPanel('v9Quote');}],['🤖 AI Chat',openChat],['⚖️ Compare',openCompare],['📶 Low data',function(){setLow(!LOW());toast(LOW()?'Low data mode ON: text and cached videos only':'Low data mode OFF','var(--accent)',3000);loadFeed(true);}],['🌤️ '+'Weather',function(){wxPanelBody=$('v9WeatherBody');wxRender();openPanel('v9Weather');}]].forEach(function(b){var x=el('button','',b[0]);x.type='button';x.onclick=b[1];if(/Low data/.test(b[0]))x.id='lowBtn';bar.appendChild(x);});labCard('🛡️','Weekly',openWeekly,'rgba(0,200,160,0.16)');labCard('💡','AI Tip',openTip,'rgba(255,215,0,0.16)');setLow(LOW());
var sh=$('verdict')||document.querySelector('.search-header');sh.parentNode.insertBefore(bar,$('verdict')?sh:sh.nextSibling);
var wcd=el('div');wcd.id='weeklyCard';wcd.style.cssText='display:none;margin:8px 15px;padding:12px;border-radius:12px;background:var(--bg2);border:1.5px solid var(--accent);cursor:pointer;font-weight:700';wcd.textContent='🛡️ Your weekly security report is ready — tap to read';wcd.onclick=openWeekly;
bar.parentNode.insertBefore(wcd,bar);if(weeklyDue())wcd.style.display='block';
var ob=el('div');ob.id='offBar';ob.style.cssText='display:none;margin:8px 15px;padding:10px 12px;border-radius:10px;background:var(--bg2);border:1.5px dashed var(--accent2);font-size:13px;line-height:1.5';
function renderOff(){ob.textContent='';ob.appendChild(el('b','','📴 You are offline. '));ob.appendChild(document.createTextNode('Saved searches, tips, the feed and downloaded videos still work.'));
var rc=jget('ai_v9_recent',[]).slice(0,6);if(rc.length){var row=el('div','');row.style.cssText='margin-top:8px;display:flex;flex-wrap:wrap;gap:6px';rc.forEach(function(q){var bt=mkBtn('🕘 '+q.slice(0,28),'',function(){var i=$('q');if(i)i.value=q;doSearch();});row.appendChild(bt);});ob.appendChild(row);}}
function updOff(){if(window.__netUp===false){renderOff();ob.style.display='block';}else ob.style.display='none';}
/* the browser's online flag is often wrong, so a small real request decides (twice before it says offline) */
function netProbe(){var c=new AbortController(),t=setTimeout(function(){try{c.abort();}catch(e){}},7000);return fetch(location.pathname,{method:'HEAD',cache:'no-store',headers:{'x-ver-check':'1'},signal:c.signal}).then(function(){return true;},function(){return false;}).then(function(v){clearTimeout(t);return v;});}
var netBusy=false;
function netCheck(){if(netBusy)return;netBusy=true;netProbe().then(function(v){return v?true:new Promise(function(r){setTimeout(r,1500);}).then(netProbe);}).then(function(v){var was=window.__netUp;window.__netUp=v;updOff();if(v&&was===false)loadFeed(true);}).then(function(){netBusy=false;},function(){netBusy=false;});}
window.addEventListener('offline',netCheck);window.addEventListener('online',netCheck);
document.addEventListener('visibilitychange',function(){if(!document.hidden)netCheck();});
setInterval(function(){if(!document.hidden)netCheck();},15000);setTimeout(netCheck,1500);
bar.parentNode.insertBefore(ob,bar);updOff();
var tc=el('div');tc.id='tipCard';tc.onclick=openTip;bar.parentNode.insertBefore(tc,bar.nextSibling);
var fb=el('div');fb.id='feedBar';fb.style.cssText='margin:12px 15px;background:var(--bg2);border:1.5px solid var(--accent2);border-radius:12px;padding:12px';
var fh=el('div');fh.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';fh.appendChild(el('b','','📰 Feed'));fh.appendChild(mkBtn('↻','',function(){loadFeed(true);}));fb.appendChild(fh);var fbody=el('div');fb.appendChild(fbody);
var scam=$('scamLabBar');scam.parentNode.insertBefore(fb,scam);
/* ---- Feed: Videos / Posts choices + AI video finder ---- */
var FM=jget('ai_v9_feedmode',null);if(!FM||typeof FM!=='object')FM={v:true,p:true};FM={v:FM.v!==false,p:FM.p!==false};if(!FM.v&&!FM.p)FM.p=true;window.AI_FEED_MODE=FM;
var fmRow=el('div','v9-row');fmRow.setAttribute('role','group');fmRow.setAttribute('aria-label','What to show in the Feed');fmRow.style.margin='0 0 8px';
var fmV=el('button','std-b','🎬 Videos'),fmP=el('button','std-b','📝 Posts');fmV.type='button';fmP.type='button';
fmRow.appendChild(fmV);fmRow.appendChild(fmP);var fmHint=el('span','v9-note','');fmRow.appendChild(fmHint);fb.insertBefore(fmRow,fbody);
var fvid=el('div');fvid.style.display='none';fb.insertBefore(fvid,fbody);
var vaiWrap=el('div');vaiWrap.style.display='none';fb.insertBefore(vaiWrap,fvid);
var fsumBox=el('div');fsumBox.setAttribute('data-ft','aifeed');fsumBox.style.cssText='margin:0 0 10px';fb.insertBefore(fsumBox,vaiWrap);
var fsum={busy:false,done:false};
function dayKey(){return new Date().toISOString().slice(0,10);}
function fsumDraw(rec,err){
fsumBox.textContent='';if(!rec&&!err&&!fsum.busy)return;
var c=el('div','v9-card');c.style.cssText='padding:12px;line-height:1.55';c.appendChild(el('b','','📰 AI summary of the day'));
var bd=el('div','');bd.style.cssText='margin:8px 0;white-space:pre-wrap';bd.setAttribute('translate','no');bd.className='notranslate';bd.textContent=fsum.busy?'The AI is reading today\'s headlines…':(rec?rec.text:'⚠️ '+err);c.appendChild(bd);
if(rec&&!fsum.busy)c.appendChild(el('div','v9-note','🤖 AI model ('+aiShort(rec.model)+'), run by Cloudflare. Made from the headlines in the feed on '+rec.d+'. It can be wrong: open the posts to check.'));
try{var fmr=mkModelRow();var fms=fmr.msel;fmr.removeChild(fmr.lastChild);fms.disabled=fsum.busy;fms.addEventListener('change',function(){fsumRun(true,fms.value);});fmr.style.margin='6px 0';c.appendChild(fmr);}catch(e){}
var nb=mkBtn('↻ New summary','',function(){fsumRun(true);});nb.disabled=fsum.busy;nb.style.marginTop='6px';c.appendChild(nb);
fsumBox.appendChild(c);
}
function fsumRun(force,pick){
if(!FT.on('aifeed')||fsum.busy)return;
try{if(!API.ai)return;}catch(e){return;}
var cached=jget('ai_v9_feedsum',null);
if(!force&&cached&&cached.d===dayKey()&&cached.text){fsum.done=true;fsumDraw(cached);return;}
var items=feedList.filter(function(it){return it&&it.title&&it.type!=='video'&&kidOK({title:it.title,text:it.text,source:it.source});}).slice(0,30);
if(items.length<5){if(cached&&cached.text)fsumDraw(cached);return;}
fsum.busy=true;fsum.done=true;fsumDraw();
var txt=items.map(function(it,i){return(i+1)+'. '+String(it.title).replace(/\s+/g,' ').slice(0,140)+(it.source?' ['+String(it.source).slice(0,30)+']':'');}).join('\n');
var used=cached&&cached.model?cached.model:'';var nx=pick||'';if(force&&!pick){var al=AI_ALL.filter(function(m){return m!==used;});nx=al[Math.floor(Math.random()*al.length)]||'';}
aiAsk('feed_day',{text:txt,model:nx||modelPick()}).then(function(j){fsum.busy=false;var rec={d:dayKey(),text:String(j.answer||'').slice(0,1500),model:j.model||nx||''};if(!rec.text)throw new Error('empty');jset('ai_v9_feedsum',rec);fsumDraw(rec);}).catch(function(e){fsum.busy=false;if(cached&&cached.text&&cached.d===dayKey())fsumDraw(cached);else fsumDraw(null,aiErrText(e));});
}
function fmApply(){
if(!FM.v&&!FM.p)FM.p=true;jset('ai_v9_feedmode',FM);
[[fmV,FM.v],[fmP,FM.p]].forEach(function(x){x[0].setAttribute('aria-pressed',x[1]?'true':'false');x[0].style.outline=x[1]?'2px solid var(--accent)':'none';});
fmHint.textContent=FM.v&&FM.p?'Both: videos and posts together, with the AI video finder.':FM.v?'Videos only: For you, Search and My player, with the AI video finder.':'Posts only: no videos.';
var vOnly=FM.v&&!FM.p;
fvid.style.display=vOnly?'':'none';fsumBox.style.display=vOnly?'none':'';fbody.style.display=vOnly?'none':'';vaiWrap.style.display=FM.v?'':'none';
if(FM.v&&!vaiWrap._built){vaiWrap._built=1;vaiWrap.appendChild(aiVideoBlock());}
if(vOnly){var vb=$('v9VideosBody');if(vb&&vb.parentNode!==fvid)fvid.appendChild(vb);var vb2=$('v9VideosBody');if(vb2&&!vb2._built)openVideos(window.__vtab||'fyp',true);}
if(!vOnly&&window.AI_FEED_REFRESH)window.AI_FEED_REFRESH();
}
fmV.onclick=function(){FM.v=!FM.v;fmApply();};fmP.onclick=function(){FM.p=!FM.p;fmApply();};
fmApply();
window.AI_FEED_VIDEOS=function(tab){FM.v=true;FM.p=false;window.__vtab=tab||'fyp';fmApply();var vb=$('v9VideosBody');if(vb&&vb._show&&tab)vb._show(tab);try{fb.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}};

var feedKnown=null,feedList=[],feedBusy=false,feedLast=0,feedPage=0,feedEnd=false,feedMoreBusy=false;
fbody._manual=true;var fst=el('span','v9-note','');fst.id='feedStatus';window.AI_FEED_REFRESH=function(){if(feedList.length)renderFeed(fbody,feedList,Math.max(12,fbody._shown||12),feedEnd?null:feedMore);};fh.insertBefore(fst,fh.lastChild);
function itemKey(it){return it.src||it.link||it.title;}
function feedPlaying(){return [].some.call(fbody.querySelectorAll('video'),function(v){return !v.paused&&!v.ended;});}
function feedMore(){
if(feedMoreBusy||feedEnd){return;}feedMoreBusy=true;var np=feedPage+1;
feedItems(np).then(function(items){
if(!feedKnown)feedKnown={};var add=[];items.forEach(function(it){var k=itemKey(it);if(!feedKnown[k]){feedKnown[k]=1;it.isNew=false;add.push(it);}});
feedPage=np;if(!add.length&&np>=60)feedEnd=true;
feedList=feedList.concat(add).slice(0,2000);
renderFeed(fbody,feedList,Math.min(feedList.length,Math.max(12,(fbody._shown||12)+(fbody._step||10))),feedEnd?null:feedMore);
}).catch(function(){feedEnd=true;renderFeed(fbody,feedList,Math.max(12,fbody._shown||12),null);}).then(function(){feedMoreBusy=false;});
}
function loadFeed(force){
if(!FT.on('feed'))return;if(feedBusy)return;if(!force&&feedPlaying()){return;}
feedBusy=true;var cached=jget('ai_v9_feed2_'+country(),null);
if(!feedList.length){if(cached)renderFeed(fbody,cached.items,8);else{fbody.textContent='';fbody.appendChild(el('div','v9-spin'));}}
feedItems().then(function(items){
var first=!feedKnown;if(first){feedKnown={};}
var fresh=[];items.forEach(function(it){var k=itemKey(it);if(!feedKnown[k]){feedKnown[k]=1;it.isNew=!first;fresh.push(it);}else{it.isNew=false;}});
feedList.forEach(function(o){o.isNew=false;});
var keep=feedList.filter(function(o){return !items.some(function(n){return itemKey(n)===itemKey(o);});});
feedList=(first?items:fresh.concat(items.filter(function(it){return !it.isNew;})).concat(keep)).slice(0,2000);
var top=window.scrollY;renderFeed(fbody,feedList,Math.max(8,Math.min(feedList.length,Math.max(12,fbody._shown||0))),feedEnd?null:feedMore);window.scrollTo(0,top);
feedLast=Date.now();fst.textContent='● LIVE · updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})+(fresh.length&&!first?' · '+fresh.length+' new':'');
logAct('feed','loaded '+items.length+(fresh.length&&!first?' ('+fresh.length+' new)':''));
if(!fsum.done)fsumRun(false);
}).catch(function(){if(!feedList.length&&!cached)fbody.textContent='The feed is not reachable from this viewer.';fst.textContent='offline';}).then(function(){feedBusy=false;});
}
setInterval(function(){if(!document.hidden&&feedKnown)loadFeed(false);},90000);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&feedKnown&&Date.now()-feedLast>60000)loadFeed(false);});
if(window.IntersectionObserver){var fio=new IntersectionObserver(function(es){if(es[0].isIntersecting){fio.disconnect();loadFeed(false);}},{rootMargin:'600px'});fio.observe(fb);}else loadFeed(false);
mkPanel('v9Share','Share');mkPanel('v9Tip','💡 AI Tip');mkPanel('v9Weather','🌤️ Weather');mkPanel('v9Chat','🤖 AI Chat');mkPanel('v9Videos','🎬 Videos');mkPanel('v9Weekly','🛡️ Weekly security report');mkPanel('v9Cmp','⚖️ Compare two sources');
wx.onclick=function(){wxPanelBody=$('v9WeatherBody');wxRender();openPanel('v9Weather');};
var eb=$('exportBtn');if(eb)eb.textContent='📄 EXPORT NEW INFORMATION';
initVoice();
initTools();
initA11y();
initClear();
initQuiz();
initBeta();
initStd();
initQuoteContext();
initDict();
initLang();
initCache();
initLegal();
initCalc();
initRemind();
initColor();
initAge();
initFeatures();

/* v29: idle warm-up — fetch the feed once the page is idle so the next open is instant (skipped on Low data / Save-Data / slow links) */
(function(){
var c=navigator.connection||{};
if(c.saveData||/(^|-)2g$/.test(c.effectiveType||''))return;
function go(){try{if(!FT.on('feed'))return;if(typeof LOW==='function'&&LOW())return;if(document.hidden)return;xget('feed',{},15000).catch(function(){});}catch(e){}}
if('requestIdleCallback' in window)requestIdleCallback(function(){setTimeout(go,1500);},{timeout:6000});else setTimeout(go,4000);
})();
buildWelcome();
function startWelcome(){if(!welcomeSeen())$('v9Welcome').style.display='flex';else showGreeting();}
window.AI_AFTER_CONSENT=function(){AGEWAIT(startWelcome);};
if(CONS)AGEWAIT(startWelcome);
wxLoad();setInterval(function(){if(!document.hidden)wxLoad();},15*60*1000);
schedTip();
var t0=Date.now();var iv=setInterval(function(){if(API.ok||Date.now()-t0>6000){clearInterval(iv);}},300);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&wxData&&Date.now()-Date.parse(wxData.current.time)>1800000)wxLoad();});
})();

/* touch: after a long press and a drag the finger-down look (and the green focus ring) must not stay on the button */
(function(){
var T=/^(touch|pen)$/;
function clearTouch(e){
if(e&&e.pointerType&&!T.test(e.pointerType))return;
setTimeout(function(){try{var x=document.activeElement;if(x&&x!==document.body&&x.matches&&x.matches('button,[role=button],.scam-card,a,summary,label,.trending-chip'))x.blur();}catch(_){}document.documentElement.classList.remove('touch-hold');},0);}
['pointerup','pointercancel','touchend','touchcancel'].forEach(function(n){document.addEventListener(n,clearTouch,{passive:true,capture:true});});
document.addEventListener('pointerdown',function(e){if(e.pointerType&&T.test(e.pointerType))document.documentElement.classList.add('touch-hold');},{passive:true,capture:true});
document.addEventListener('contextmenu',function(e){try{if(e.target.closest&&e.target.closest('button,[role=button],.scam-card,.trending-chip')&&!e.target.closest('input,textarea'))e.preventDefault();}catch(_){}},true);
window.addEventListener('blur',function(){document.documentElement.classList.remove('touch-hold');});
})();

/* warning: a browser's own page translation (Chrome, Edge, Safari, Firefox) can translate the site wrongly */
(function(){
function show(){
try{if(sessionStorage.getItem('ai_trwarn_ok'))return;}catch(e){}
if(document.getElementById('trWarn'))return;
var b=document.createElement('div');b.id='trWarn';b.setAttribute('role','note');
b.style.cssText='margin:8px 12px;padding:10px 12px;border-radius:12px;border:1.5px solid #f5a623;background:var(--bg2);color:var(--text);font-size:13px;line-height:1.45;display:flex;gap:10px;align-items:flex-start';
var t=document.createElement('div');t.style.flex='1';
t.textContent='⚠️ Some browsers may translate this site wrongly if you choose the system translation option of your browser.';
var x=document.createElement('button');x.type='button';x.textContent='✕';x.setAttribute('aria-label','Close');x.style.cssText='background:none;border:none;color:var(--text);font-size:16px;cursor:pointer';
x.onclick=function(){b.remove();try{sessionStorage.setItem('ai_trwarn_ok','1');}catch(e){}};
b.appendChild(t);b.appendChild(x);
var main=document.getElementById('main');if(main&&main.parentNode)main.parentNode.insertBefore(b,main);else document.body.insertBefore(b,document.body.firstChild);}
function translated(){var h=document.documentElement;return /translated-(ltr|rtl)/.test(h.className)||!!document.querySelector('font[style*="vertical-align: inherit"]');}
setTimeout(show,2500);
try{new MutationObserver(function(){if(translated())show();}).observe(document.documentElement,{attributes:true,attributeFilter:['class','lang']});}catch(e){}
})();

/* touch only: scroll handle on the right edge, visible for a few seconds after scrolling, draggable for fast scrolling.
   Light on purpose: sizes are measured only when the page size changes (never inside the scroll event), the handle moves with a CSS
   scroll-driven animation (or a transform where that is not supported), and the hide timer is one timestamp.
   Settings > Features > Scrolling can switch it off (standard scroll). */
(function(){
var touch=false;try{touch=!!(window.matchMedia&&matchMedia('(hover:none) and (pointer:coarse)').matches);}catch(e){}
if(!touch){window.AI_SB_APPLY=function(){};return;}
var th=null,SHOW=3500,vh=0,H=0,max=1,h=56,need=false,visible=false,drag=false,last=0,raf=0,tm=0,sy=0,st=0,CSSMOVE=false,hinted=false;
try{CSSMOVE=!!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline: scroll(root)'));}catch(e){}
function measure(){var d=document.documentElement;if(d.style.overflow==='hidden')return;vh=window.innerHeight;H=Math.max(d.scrollHeight,document.body?document.body.scrollHeight:0);max=Math.max(1,H-vh);need=H>=vh*1.4;h=Math.max(44,Math.min(Math.round(vh*vh/H),Math.round(vh*0.2),160));th.style.height=h+'px';th.style.setProperty('--sbh',h+'px');}
function move(){raf=0;var y=(window.pageYOffset||0)/max;y=y<0?0:y>1?1:y;th.style.transform='translate3d(0,'+Math.round(y*(vh-h))+'px,0)';}
function sbHintBox(){var b=document.createElement('div');b.setAttribute('role','status');b.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:99998;background:var(--accent);color:#fff;padding:12px;border-radius:12px;font-size:14px;line-height:1.4;box-shadow:0 4px 18px rgba(0,0,0,.4)';
b.appendChild(document.createTextNode('ℹ️ The line at the side is different from the standard scroll bar: press and hold it, then drag to the place where you want to be.'));
var r=document.createElement('div');r.style.cssText='display:flex;gap:8px;margin-top:8px;flex-wrap:wrap';
function bt(t,f){var x=document.createElement('button');x.type='button';x.textContent=t;x.style.cssText='padding:8px 12px;border-radius:8px;border:1px solid #fff;background:rgba(0,0,0,.25);color:#fff;font:inherit;cursor:pointer';x.onclick=f;r.appendChild(x);}
bt('⚙️ Open settings',function(){b.remove();try{openPanel('v9Feat');setTimeout(function(){var h=document.getElementById('sbSection');if(h)h.scrollIntoView({block:'start'});},200);}catch(e){}});
bt('OK',function(){b.remove();});b.appendChild(r);document.body.appendChild(b);setTimeout(function(){if(b.parentNode)b.remove();},15000);}
function setOn(v){if(v===visible)return;visible=v;th.classList.toggle('on',v);if(v&&!hinted){hinted=true;var ok=false;try{ok=!!localStorage.getItem('ai_sbhint');}catch(e){}if(!ok){try{localStorage.setItem('ai_sbhint','1');}catch(e){}try{sbHintBox();}catch(e){}}}}
function tick(){tm=0;if(drag)return;var left=SHOW-(Date.now()-last);if(left<=0)setOn(false);else tm=setTimeout(tick,left);}
function onScroll(){last=Date.now();if(!visible){measure();if(!need)return;setOn(true);}if(!CSSMOVE&&!raf)raf=requestAnimationFrame(move);if(!tm&&!drag)tm=setTimeout(tick,SHOW);}
function onResize(){if(visible&&document.documentElement.style.overflow!=='hidden')measure();}
function down(e){drag=true;measure();sy=e.clientY;st=window.pageYOffset||0;th.classList.add('drag');try{th.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();}
function mv(e){if(!drag)return;window.scrollTo(0,st+(e.clientY-sy)*(max/Math.max(1,vh-h)));}
function end(){if(!drag)return;drag=false;th.classList.remove('drag');last=Date.now();if(!tm)tm=setTimeout(tick,SHOW);}
function enable(){if(th)return;th=document.createElement('div');th.id='sbThumb';th.setAttribute('aria-hidden','true');th.appendChild(document.createElement('i'));if(CSSMOVE)th.classList.add('cssmove');document.body.appendChild(th);document.documentElement.classList.add('sb-handle');
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onResize,{passive:true});
th.addEventListener('pointerdown',down);th.addEventListener('pointermove',mv);th.addEventListener('pointerup',end);th.addEventListener('pointercancel',end);}
function disable(){if(!th)return;window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);clearTimeout(tm);tm=0;if(th.parentNode)th.parentNode.removeChild(th);th=null;visible=false;document.documentElement.classList.remove('sb-handle');}
window.AI_SB_APPLY=function(){if(sbMode()==='handle')enable();else disable();};
window.AI_SB_APPLY();
})();

/* video cache: remember when the page was last scrolled, so downloads wait for a quiet moment (no jank while scrolling the Feed) */
window.addEventListener('scroll',function(){VC.lastScroll=Date.now();},{passive:true});

/* start-up of the extras: rotating label, Favorites button, favourite-functions bar, scroll choice */
setTimeout(function(){try{hdrRotate();}catch(e){}try{favAddSearch();}catch(e){}try{fnRender();}catch(e){}},1800);
setTimeout(function(){try{favAddSearch();fnRender();}catch(e){}},5000);

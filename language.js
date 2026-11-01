/* AI INFORMATION - language.js
   Language panel: site translation (initLang).
   Only function declarations: they are called later by app.js (loaded last). */

function initLang(){
var CODES=('af sq am ar hy as ay az bm eu be bn bho bs bg ca ceb ny zh zh-TW co hr cs da dv doi nl eo et ee fil fi fr fy gl ka de el gn gu ht ha haw he hi hmn hu is ig ilo id ga it ja jv kn kk km rw gom ko kri ku ckb ky lo la lv ln lt lg lb mk mai mg ms ml mt mi mr lus mn my ne no or om ps fa pl pt pa qu ro ru sm sa gd nso sr st sn sd si sk sl so es su sw sv tg ta tt te th ti ts tr tk ak uk ur ug uz vi cy xh yi yo zu '+
'aa ab ae av bi br ce ch cr cu cv gv ho hz ia ie ii ik io iu kg ki kj kl kr ks kv kw li mh na nb nd ng nn nr nv oc oj os pi rm rn sc se sg ss tn to tw ty ve vo wa wo').split(' ');
var RTL={ar:1,he:1,fa:1,ur:1,ps:1,sd:1,yi:1,dv:1,ug:1,ckb:1,ks:1};
var SKIP='script,style,noscript,textarea,input,select,code,pre,svg,[translate=no],.notranslate,#v9Lang,#v9LangBody,#result,#liveBox,#wikiBox,#chatLog,.vd-card,.fd-post,.rl-s,.rl-menu';
var cur=store.get('ai_ui_lang')||'en',cache={},budget=2500,tracked=[],orig=new WeakMap(),applied=new WeakMap(),attrOrig=new WeakMap(),engine=null,busy=false,pend=[],timer=0,obs=null;
function loadCache(c){cache=jget('ai_tr_'+c,{})||{};}
function saveCache(){try{var k=Object.keys(cache);if(k.length>3000)k.slice(0,k.length-3000).forEach(function(x){delete cache[x];});jset('ai_tr_'+cur,cache);}catch(e){}}
function latin(t){var l=(t.match(/[A-Za-z]/g)||[]).length,o=(t.match(/[^\sA-Za-z0-9.,:;!?'"()\-–—%&\/+*@#$_=<>|\\[\]{}~^`0-9]/g)||[]).length;return l>=2&&l>=o*2;}
function okText(s){s=s.trim();return s.length>=2&&s.length<=480&&latin(s);}
function name(code,inEnglish){try{return new Intl.DisplayNames([inEnglish?'en':code],{type:'language'}).of(code)||code;}catch(e){return code;}}
function collect(root,list){
if(!root)return;
if(root.nodeType===3){if(root.parentElement&&!root.parentElement.closest(SKIP)){var s=orig.has(root)&&applied.get(root)===root.nodeValue?orig.get(root):root.nodeValue;if(okText(s))list.push({n:root,s:s,cv:root.nodeValue});}return;}
if(root.nodeType!==1||root.closest(SKIP))return;
var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentElement;return p&&!p.closest(SKIP)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}}),n;
while((n=w.nextNode())){var s2=orig.has(n)&&applied.get(n)===n.nodeValue?orig.get(n):n.nodeValue;if(okText(s2))list.push({n:n,s:s2,cv:n.nodeValue});}
[].forEach.call((root.matches&&root.matches('[placeholder],[title],[aria-label]')?[root]:[]).concat([].slice.call(root.querySelectorAll('[placeholder],[title],[aria-label]'))),function(e){
if(e.closest(SKIP))return;['placeholder','title','aria-label'].forEach(function(a){var v=e.getAttribute(a);if(!v)return;var o=attrOrig.get(e);var base=o&&o[a]&&o['_'+a]===v?o[a]:v;if(okText(base))list.push({e:e,a:a,s:base});});});
}
function tmo(p,ms){return new Promise(function(res){var t=setTimeout(function(){res(null);},ms);Promise.resolve(p).then(function(v){clearTimeout(t);res(v);},function(){clearTimeout(t);res(null);});});}
function chromeEngine(code){
if(!('Translator' in self))return Promise.resolve(null);
var act=function(){return !!(navigator.userActivation&&navigator.userActivation.isActive);};
return tmo(self.Translator.availability({sourceLanguage:'en',targetLanguage:code}),1200).then(function(av){
if(av!=='available')return null;
return tmo(self.Translator.create({sourceLanguage:'en',targetLanguage:code}),4000);
}).then(function(t){
if(!t)return null;
return function(texts){return Promise.all(texts.map(function(x){return tmo(t.translate(x),15000);}));};
}).catch(function(){return null;});
}
/* v41: translation straight from the browser (Google web translator, then MyMemory); the site server is only a spare */
function anyTr(texts,from,to){
/* all translations come from our own server (open translation services and AI models), asked 12 texts at a time */
var out=texts.map(function(){return null;}),chunks=[];for(var c=0;c<texts.length;c+=12)chunks.push(c);
var sq=Promise.resolve();
chunks.forEach(function(c){sq=sq.then(function(){return xpost('translate',{from:from,to:to,texts:texts.slice(c,c+12)},50000).then(function(j){if(j.engine&&lastSrc.indexOf(j.engine)<0)lastSrc+=(lastSrc?' + ':'')+j.engine;(j.out||[]).forEach(function(v,k){if(v)out[c+k]=v;});}).catch(function(e){lastErr=String((e&&e.message)||e);});});});
return sq.then(function(){if(!out.some(Boolean))throw new Error('no translator could be reached (check the internet connection)');return out;});
}
function serverEngine(code){return function(texts){return anyTr(texts,'en',code);};}
function combine(local,remote){
if(!local)return remote;
return function(texts){return local(texts).then(function(out){
var miss=[],mi=[];out.forEach(function(v,i){if(!v||typeof v!=='string'){miss.push(texts[i]);mi.push(i);}});
if(!miss.length)return out;
return remote(miss).then(function(r){r.forEach(function(v,j){out[mi[j]]=v;});return out;}).catch(function(){return out;});
});};
}
var lastErr='',lastSrc='';
function translateTexts(texts,cb){
var res=new Array(texts.length),need=[],idx=[];
texts.forEach(function(t,i){if(cache[t]){res[i]=cache[t];}else{need.push(t);idx.push(i);}});
if(cb&&need.length<texts.length)cb(res,true);
if(!need.length)return Promise.resolve(res);
if(need.length>budget)return Promise.resolve(res);
budget-=need.length;
var chunks=[];for(var i=0;i<need.length;i+=30)chunks.push(need.slice(i,i+30));
var k=0;
function next(){
if(k>=chunks.length)return Promise.resolve();
var ch=chunks[k],base=k*30;k++;
return engine(ch).then(function(out){out.forEach(function(v,j){if(v&&typeof v==='string'){cache[ch[j]]=v;res[idx[base+j]]=v;}});if(cb)cb(res);},function(e){lastErr=String(e&&e.message||e||'');}).then(next);
}
return next().then(function(){saveCache();return res;});
}
function apply(items,res){
items.forEach(function(it,i){var v=res[i];if(!v)return;
if(it.n){if(!it.n.parentNode||it.n.nodeValue!==it.cv)return;var s=it.n.nodeValue,lead=(s.match(/^\s*/)||[''])[0],trail=(s.match(/\s*$/)||[''])[0];
if(!orig.has(it.n)||applied.get(it.n)!==it.n.nodeValue){orig.set(it.n,it.s);tracked.push(it.n);}
var nv=lead+v+trail;applied.set(it.n,nv);it.n.nodeValue=nv;}
else if(it.e){var o=attrOrig.get(it.e)||{};o[it.a]=it.s;o['_'+it.a]=v;attrOrig.set(it.e,o);tracked.push(it.e);it.e.setAttribute(it.a,v);}
});
}
function pass(root){
if(cur==='en'||!engine)return Promise.resolve();
var items=[];collect(root||document.body,items);
if(!items.length)return Promise.resolve();
var vis=function(it){var e=it.n?it.n.parentElement:it.e;return e&&e.offsetParent!==null?0:1;};items.sort(function(a,b){return vis(a)-vis(b);});
var uniq=[],seen={};items.forEach(function(it){if(!seen[it.s]){seen[it.s]=1;uniq.push(it.s);}});
var done={};
function flush(r){var m={};uniq.forEach(function(u,i){if(r[i]&&!done[u]){m[u]=r[i];done[u]=1;}});apply(items,items.map(function(it){return m[it.s];}));}
return translateTexts(uniq,flush).then(function(r){flush(r);});
}
function revert(){
tracked.forEach(function(x){
if(x.nodeType===3){if(orig.has(x)&&applied.get(x)===x.nodeValue)x.nodeValue=orig.get(x);}
else if(x.nodeType===1){var o=attrOrig.get(x);if(o)['placeholder','title','aria-label'].forEach(function(a){if(o[a]&&o['_'+a]===x.getAttribute(a))x.setAttribute(a,o[a]);});}
});
tracked=[];
}
function setDir(code){var d=document.documentElement;d.lang=code==='en'?'en':code;d.dir=RTL[code]?'rtl':'ltr';}
function watch(on){
if(obs){obs.disconnect();obs=null;}
if(!on||!window.MutationObserver)return;
obs=new MutationObserver(function(ms){
ms.forEach(function(m){
if(m.type==='characterData'){if(applied.get(m.target)!==m.target.nodeValue)pend.push(m.target);}
else m.addedNodes.forEach(function(n){pend.push(n);});
});
clearTimeout(timer);timer=setTimeout(function(){var ps=pend;pend=[];if(busy)return;busy=true;
Promise.all(ps.map(function(n){return pass0(n);})).catch(function(){}).then(function(){busy=false;});},350);
});
obs.observe(document.body,{childList:true,subtree:true,characterData:true});
}
function pass0(n){if(n.nodeType===3){var l=[];collect(n,l);if(!l.length)return Promise.resolve();return translateTexts([l[0].s]).then(function(r){apply(l,[r[0]]);});}return pass(n);}
var revBusy=false,revNote=null;
function revSay(t){if(revNote)revNote.textContent=t;}
/* v123: a second source translates the same texts and an AI model approves one version per text (or writes a better one) */
function aiReview(code){
if(revBusy||code==='en')return;
var done=jget('ai_trv_'+code,{})||{};
var keys=Object.keys(cache).filter(function(k){return cache[k]&&cache[k]!==k&&!done[k];}).slice(0,36);
if(!keys.length){revSay('AI review: all texts on this page were already checked.');return;}
revBusy=true;revSay('AI review: checking '+keys.length+' texts with a second source…');
var st={checked:0,agreed:0,changed:0,src:{},model:''},i=0;
function next(){
if(i>=keys.length||cur!==code)return Promise.resolve();
var ch=keys.slice(i,i+12);i+=12;
return xpost('review',{from:'en',to:code,used:lastSrc.slice(0,300),items:ch.map(function(k){return{s:k,t:cache[k]};})},90000).then(function(j){
st.checked+=j.checked||0;st.agreed+=j.agreed||0;st.model=j.model||st.model;(j.sources||[]).forEach(function(x){st.src[x]=1;});
(j.out||[]).forEach(function(v,k){if(v&&typeof v==='string'){cache[ch[k]]=v;st.changed++;}});
ch.forEach(function(k){done[k]=1;});
}).then(next);
}
next().then(function(){
jset('ai_trv_'+code,done);saveCache();
if(st.changed&&cur===code){watch(false);revert();return pass(document.body).then(function(){watch(true);});}
}).then(function(){
revSay('AI review: '+st.checked+' texts checked'+(Object.keys(st.src).length?' against '+Object.keys(st.src).join(', '):'')+'; '+st.agreed+' agreed, '+st.changed+' improved'+(st.model?' by '+st.model:'')+'.');
if(st.changed)toast('🤖 AI improved '+st.changed+' translations','var(--accent)',3000);
}).catch(function(e){revSay('AI review is not available right now ('+String((e&&e.message)||e).slice(0,60)+'). The translation above is unchanged.');}).then(function(){revBusy=false;});
}
function setLang(code,quiet){
if(code==='en'){watch(false);revert();cur='en';store.set('ai_ui_lang','en');setDir('en');cache={};updBtn();if(!quiet)toast('Language: English');return Promise.resolve(true);}
lastErr='';
return (Promise.resolve(cur!=='en'?(watch(false),revert()):0)).then(function(){loadCache(code);cur=code;return chromeEngine(code);}).then(function(ce){
lastSrc=ce?'Chrome on-device translator':'';engine=combine(ce,serverEngine(code));
if(!quiet)toast('Translating to '+name(code,true)+'… this can take a while, please wait.','var(--accent)',6000);
watch(false);
return pass(document.body);
}).then(function(){
var any=tracked.length>0;
if(!any&&!quiet){toast('This language could not be translated'+(lastErr?' ('+lastErr.slice(0,80)+')':'')+'. Try another language or try again later.','#ffaa00');cur='en';store.set('ai_ui_lang','en');setDir('en');updBtn();return false;}
store.set('ai_ui_lang',code);setDir(code);watch(true);updBtn();if(!quiet)toast('✓ '+name(code)+(lastSrc?' · '+lastSrc.slice(0,90):''),'var(--accent)',4500);setTimeout(function(){aiReview(code);},1500);return true;
}).catch(function(e){revert();cur='en';store.set('ai_ui_lang','en');setDir('en');updBtn();if(!quiet)toast('Translation failed. Check the internet connection and try again.','#ffaa00');return false;});
}
var body=mkPanel('v9Lang','🌐 Language');
body.parentNode.id='v9Lang';
var lw=el('div','v9-card');lw.style.cssText+=';border-color:#ffaa00;background:rgba(255,170,0,.08)';
lw.appendChild(el('b','','⚠️ Please note'));lw.appendChild(el('div','v9-note','⏳ Translating the whole site can take some time, from several seconds to a minute or more, because it is done by free services and AI models. The visible part is translated first. Please wait and do not close the page.'));
lw.appendChild(el('div','v9-note','Your language may have much longer words than English, so some buttons, icons and animations may not fit or may look cramped. Also, not everything can always be translated: some texts, names, web results and video titles stay in their original language.'));
body.appendChild(lw);
body.appendChild(el('div','v9-note','Choose the language of the site. The text is machine-translated and may contain mistakes. Your own text, web results and video titles are not changed.'));
var SRC22=['Chrome on-device translator (your browser)', 'LibreTranslate via our server (libretranslate.de)', 'LibreTranslate via our server (translate.terraprint.co)', 'LibreTranslate via our server (lt.vern.cc)', 'LibreTranslate via our server (translate.fedilab.app)', 'LibreTranslate via our server (translate.argosopentech.com)', 'LibreTranslate via our server (libretranslate.eownerdead.dedyn.io)', 'LibreTranslate via our server (translate.flossboxin.org.in)', 'LibreTranslate via our server (lt.blitzw.in)', 'LibreTranslate via our server (translate.cutie.dedyn.io)', 'Apertium via our server (apertium.org)', 'MyMemory via our server', 'AI m2m100 (Cloudflare Workers AI)', 'AI Gemma 4', 'AI Llama 3.1', 'AI Llama 3.2', 'AI Granite 4', 'AI Llama 4 Scout', 'AI GPT-OSS 20B', 'AI GPT-OSS 120B'];
var dt=document.createElement('details');dt.style.margin='8px 0';var dsm=document.createElement('summary');dsm.textContent=SRC22.length+' translation sources (tap to see)';dsm.style.cursor='pointer';dt.appendChild(dsm);var dol=document.createElement('ol');dol.style.cssText='margin:6px 0 0 18px;padding:0;font-size:12px;line-height:1.5';SRC22.forEach(function(x){dol.appendChild(el('li','',x));});dt.appendChild(dol);dt.appendChild(el('div','v9-note','They are tried in this order. A source that does not answer is skipped for a few minutes. Some of them are free public services that may be busy or unavailable at times.'));body.appendChild(dt);
revNote=el('div','v9-note','AI review: after a language is chosen, a second source translates the same texts and an AI model approves one version of each text (or writes a better one). It runs in the background.');body.appendChild(revNote);
var q=el('input','v9-in');q.placeholder='Search a language…';q.setAttribute('aria-label','Search language');q.setAttribute('translate','no');q.style.marginBottom='10px';body.appendChild(q);
var list=el('div');body.appendChild(list);
var rows=null;
function build(){
rows=[{c:'en',n:'English (original)',e:'English'}].concat(CODES.map(function(c){return{c:c,n:name(c),e:name(c,true)};}).filter(function(r){return r.n&&r.e&&r.e!==r.c||/^(zh|hmn|ckb)/.test(r.c);}).sort(function(a,b){return a.e.localeCompare(b.e);}));
}
function show(f){
f=(f||'').toLowerCase();list.textContent='';
if(!rows)build();
rows.forEach(function(r){
if(f&&(r.n+' '+r.e+' '+r.c).toLowerCase().indexOf(f)===-1)return;
var b=el('button','',r.n+(r.n!==r.e&&r.c!=='en'?'  ·  '+r.e:''));b.type='button';b.setAttribute('translate','no');b.lang=r.c;
b.style.cssText='display:block;width:100%;text-align:start;padding:11px 12px;margin:5px 0;background:var(--bg2);color:var(--text);border:1.5px solid '+(r.c===cur?'var(--accent)':'var(--border2)')+';border-radius:10px;font-size:15px;cursor:pointer';
if(r.c===cur)b.style.background='var(--bg3)';
b.onclick=function(){closePanel('v9Lang');setLang(r.c).then(function(ok){show(q.value);if(ok&&r.c!=='en')setTimeout(function(){toast('⚠️ Some words may be too long for the buttons, and not everything can be translated.','#ffaa00',5000);},900);});};
list.appendChild(b);
});
if(!list.childNodes.length)list.appendChild(el('div','v9-note','No language found.'));
}
q.addEventListener('input',function(){show(q.value);});

/* ---- v40: Translator panel (text + websites) ---- */
var trP=mkPanel('v9Tr','🌍 Translator');trP.parentNode.id='v9Tr';
var trTab=el('div');trTab.style.cssText='display:flex;gap:8px;margin-bottom:12px';
var tText=mkBtn('✍️ Text','pri'),tSite=mkBtn('🌐 Website','');
trTab.appendChild(tText);trTab.appendChild(tSite);trP.appendChild(trTab);
function optName(r){return r.c==='en'?'English':r.n+(r.n!==r.e?'  ·  '+r.e:'');}
function langSel(auto,def){
var sel=el('select','v9-in');sel.setAttribute('translate','no');if(!rows)build();
if(auto){var o0=document.createElement('option');o0.value='auto';o0.textContent='Auto-detect';sel.appendChild(o0);}
rows.forEach(function(r){var o=document.createElement('option');o.value=r.c;o.textContent=optName(r);sel.appendChild(o);});
sel.value=def;if(sel.value!==def)sel.value=auto?'auto':'en';return sel;}
var navL=(navigator.language||'en').toLowerCase().split('-')[0];
var defTo=store.get('ai_trl_to')||(navL!=='en'?navL:'bg');
function split(t,max){var out=[],pi=0;String(t||'').replace(/\r/g,'').split(/\n/).forEach(function(p){p=p.trim();if(!p){pi++;return;}
while(p.length>max){var cut=Math.max(p.lastIndexOf('. ',max),p.lastIndexOf('? ',max),p.lastIndexOf('! ',max),p.lastIndexOf('。',max));if(cut<max*0.4)cut=p.lastIndexOf(' ',max);if(cut<1)cut=max;out.push({t:p.slice(0,cut+1).trim(),p:pi});p=p.slice(cut+1).trim();}
if(p)out.push({t:p,p:pi});pi++;});return out;}
function trErr(e){var m=String(e&&e.message||e||'');return /needs-server/.test(m)?'No translator could be reached. Check the internet connection.':/timeout|abort/i.test(m)?'The translation took too long. Try a shorter text.':'Translation failed: '+m.slice(0,120);}
function runTr(pieces,from,to,onProg){
var out=new Array(pieces.length),k=0;
function next(){
if(k>=pieces.length)return Promise.resolve(out);
var a=k,batch=pieces.slice(k,k+30);k+=30;
return anyTr(batch.map(function(x){return x.t;}),from,to).then(function(o){
o.forEach(function(v,i){out[a+i]=v||batch[i].t;});if(onProg)onProg(out);return next();});
}
return next();
}
function joinOut(pieces,out){var s='',lp=-1;pieces.forEach(function(p,i){if(lp!==-1)s+=(p.p!==lp?'\n':' ');s+=out[i]||p.t;lp=p.p;});return s;}
function outBox(){var b=el('div');b.setAttribute('translate','no');b.className='notranslate';b.style.cssText='white-space:pre-wrap;word-break:break-word;background:var(--bg2);border:1.5px solid var(--border2);border-radius:10px;padding:12px;margin-top:10px;min-height:48px;display:none;line-height:1.55';return b;}
function dirOf(b,code){b.dir=RTL[code]?'rtl':'ltr';b.lang=code;}
/* text tab */
var pText=el('div');
var fromS=langSel(true,'auto'),toS=langSel(false,defTo);
var lr=el('div');lr.style.cssText='display:flex;gap:6px;align-items:center;margin-bottom:8px';
var sw=mkBtn('⇄','',function(){var f=fromS.value,t=toS.value;if(f==='auto')return;fromS.value=t;toS.value=f;});sw.setAttribute('aria-label','Swap languages');sw.style.flex='0 0 auto';
fromS.style.flex='1';toS.style.flex='1';fromS.style.minWidth='0';toS.style.minWidth='0';
lr.appendChild(fromS);lr.appendChild(sw);lr.appendChild(toS);pText.appendChild(lr);
var ta=el('textarea','v9-in');ta.rows=5;ta.maxLength=5000;ta.placeholder='Type or paste text to translate…';ta.setAttribute('aria-label','Text to translate');ta.style.cssText='width:100%;resize:vertical;margin-bottom:8px';pText.appendChild(ta);
var go=mkBtn('Translate','pri',doText);go.style.width='100%';pText.appendChild(go);
var ob=outBox();pText.appendChild(ob);
var cp=mkBtn('📋 Copy','',function(){try{navigator.clipboard.writeText(ob.textContent).then(function(){toast('Copied','var(--accent)');});}catch(e){}});cp.style.cssText='margin-top:8px;display:none';pText.appendChild(cp);
function doText(){
var t=ta.value.trim();if(!t){ta.focus();return;}
var from=fromS.value,to=toS.value;if(from===to){toast('Choose two different languages','#ffaa00');return;}
store.set('ai_trl_to',to);go.disabled=true;go.textContent='Translating…';ob.style.display='block';dirOf(ob,to);ob.textContent='…';cp.style.display='none';
var pcs=split(t,800);
runTr(pcs,from,to,function(o){ob.textContent=joinOut(pcs,o);}).then(function(o){ob.textContent=joinOut(pcs,o);cp.style.display='';}).catch(function(e){ob.textContent=trErr(e);}).then(function(){go.disabled=false;go.textContent='Translate';});
}
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();doText();}});
function langEn(c){if(!rows)build();var r=rows.filter(function(x){return x.c===c;})[0];return r?r.e:'English';}
pText.appendChild(aiBlock('🤖 Translate with AI','translate_text',function(){var t=ta.value.trim();if(!t){ta.focus();return 'Type or paste some text first.';}return{text:t.slice(0,5000),extra:{to:langEn(toS.value)}};},{hint:'Optional: an AI model translates instead of the free web translators. It can sound more natural, but it can also be wrong.'}));
trP.appendChild(pText);
/* website tab */
var pSite=el('div');pSite.style.display='none';
var ui=el('input','v9-in');ui.type='url';ui.placeholder='https://example.com/article';ui.setAttribute('aria-label','Web address');ui.setAttribute('autocapitalize','none');ui.setAttribute('autocorrect','off');ui.spellcheck=false;ui.style.cssText='width:100%;margin-bottom:8px';
var toS2=langSel(false,defTo);toS2.style.cssText='width:100%;margin-bottom:8px';toS2.setAttribute('aria-label','Translate into');
var go2=mkBtn('Translate the page','pri',doSite);go2.style.width='100%';
var st2=el('div','v9-note','');st2.style.margin='8px 0';
var ob2=outBox();
var lnk=el('div');lnk.style.marginTop='10px';
var aiL=el('label','v9-note');aiL.style.cssText='display:flex;gap:8px;align-items:center;margin:0 0 8px;cursor:pointer';var aiOn=document.createElement('input');aiOn.type='checkbox';aiOn.checked=jget('ai_v9_trsite_ai',true)!==false;aiOn.onchange=function(){jset('ai_v9_trsite_ai',aiOn.checked);};aiL.appendChild(aiOn);aiL.appendChild(document.createTextNode('🤖 AI manages the whole page: it reads the text and an AI model translates it (turn off to use the free web translators)'));
var aiM=mkModelRow();aiM.style.margin='0 0 8px';
pSite.appendChild(ui);pSite.appendChild(toS2);pSite.appendChild(aiL);pSite.appendChild(aiM);pSite.appendChild(go2);pSite.appendChild(st2);pSite.appendChild(ob2);pSite.appendChild(lnk);
pSite.appendChild(el('div','v9-note','The page text is read by a free text reader (the first part of long pages) and machine-translated by a free web translator. It may contain mistakes. Pages that need a login or block readers cannot be read.'));
trP.appendChild(pSite);
function readSite(u){
return apiFetch('https://r.jina.ai/'+u,{timeout:25000,headers:{Accept:'text/plain'}}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.text();}).then(function(t){
var title=(/^Title:\s*(.+)$/m.exec(t)||[])[1]||'';
var body=t.replace(/^[\s\S]*?Markdown Content:\s*/,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#*_`>|]+/g,' ').replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim().slice(0,9000);
if(body.length<80)throw new Error('empty');
return{title:title,text:body,url:u,via:'reader'};
}).catch(function(){return xget('article',{url:u},45000);});
}
function doSite(){
var u=ui.value.trim();if(!u){ui.focus();return;}
if(!/^https?:\/\//i.test(u))u='https://'+u;
var to=toS2.value;store.set('ai_trl_to',to);
go2.disabled=true;go2.textContent='Reading the page…';st2.textContent='';ob2.style.display='none';lnk.textContent='';
readSite(u).then(function(j){
var title=j.title||'',text=String(j.text||'');
if(text.length<20)throw new Error('The page has no readable text.');
if(aiOn.checked){
go2.textContent='AI is translating…';st2.textContent='Read: '+(title||j.url)+'. The AI model is translating…';ob2.style.display='block';dirOf(ob2,to);ob2.textContent='…';
var lnk0=function(){lnk.textContent='';var a=el('a','v9-open','Open the original page ↗');a.href=safeUrl(j.url||u);a.target='_blank';a.rel='noopener noreferrer';lnk.appendChild(a);};
return aiAsk('translate_site',{text:(title?title+'\n':'')+text,extra:{to:langEn(to)}}).then(function(res){
ob2.textContent=res.answer;st2.textContent='🤖 Translated by an AI model ('+aiShort(res.model)+'). It can be wrong.';lnk0();
var ot=mkBtn('🔁 Translate with another model','',function(){var nx=AI_ALL[(AI_ALL.indexOf(res.model)+1)%AI_ALL.length];jset('ai_v9_model',nx);doSite();});ot.style.marginTop='8px';lnk.appendChild(document.createElement('br'));lnk.appendChild(ot);
}).catch(function(e){
st2.textContent='The AI model could not translate ('+String((e&&e.message)||e).slice(0,100)+'). Using the free web translators instead…';
var pcs0=split((title?title+'\n':'')+text,700).slice(0,40);dirOf(ob2,to);
return runTr(pcs0,'auto',to,function(o){ob2.textContent=joinOut(pcs0,o);}).then(function(o){ob2.textContent=joinOut(pcs0,o);lnk0();});
});
}
var pcs=split((title?title+'\n':'')+text,700).slice(0,40);
go2.textContent='Translating…';st2.textContent='Read: '+(title||j.url)+(j.via&&j.via!=='page'?' (from '+(j.via==='archive'?'a saved copy':'a text reader')+')':'');
ob2.style.display='block';dirOf(ob2,to);ob2.textContent='…';
return runTr(pcs,'auto',to,function(o){ob2.textContent=joinOut(pcs,o);}).then(function(o){ob2.textContent=joinOut(pcs,o);
var a=el('a','v9-open','Open the original page ↗');a.href=safeUrl(j.url||u);a.target='_blank';a.rel='noopener noreferrer';lnk.appendChild(a);
});
}).catch(function(e){ob2.style.display='none';st2.textContent=/needs-server/.test(String(e&&e.message))?trErr(e):(/^Translation failed|The page/.test(String(e&&e.message))?e.message:'Could not read or translate this page: '+String(e&&e.message||e).slice(0,140));
var g=el('a','v9-open','Open it in Google Translate ↗');g.href='https://translate.google.com/translate?sl=auto&tl='+encodeURIComponent(to)+'&u='+encodeURIComponent(u);g.target='_blank';g.rel='noopener noreferrer';lnk.textContent='';lnk.appendChild(g);
}).then(function(){go2.disabled=false;go2.textContent='Translate the page';});
}
ui.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doSite();}});
function tabTo(site){pText.style.display=site?'none':'';pSite.style.display=site?'':'none';tText.className='v9-btn'+(site?'':' pri');tSite.className='v9-btn'+(site?' pri':'');}
tText.onclick=function(){tabTo(false);};tSite.onclick=function(){tabTo(true);};
var trBtn=mkBtn('🌍 Translator','',function(){openPanel('v9Tr');});trBtn.setAttribute('translate','no');
window.AI_TR={open:function(url){openPanel('v9Tr');if(url){tabTo(true);ui.value=url;doSite();}}};
var btn=mkBtn('🌐 Language','',function(){openPanel('v9Lang');show(q.value);});
function updBtn(){btn.textContent='🌐 '+(cur==='en'?'Language':name(cur));btn.setAttribute('translate','no');}
btn.setAttribute('translate','no');
var bar=$('v9Bar');if(bar){bar.appendChild(trBtn);bar.appendChild(btn);}
updBtn();
window.AI_LANG={get:function(){return cur;},set:setLang};
if(cur!=='en'){setTimeout(function(){setLang(cur,true).then(function(ok){if(!ok){cur='en';store.set('ai_ui_lang','en');}});},900);}
}

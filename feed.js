/* AI INFORMATION - feed.js
   Feed: content filter helpers, the article feed and the AI Finder (the AI looks for articles). There are no videos on this site.
   Only function declarations: they are called later by app.js (loaded last). */

function ageG(){return window.AI_AGE||'';}
function kidsOn(){try{var g=ageG();if(g==='u13'||g==='13-15'||g==='16-17')return true;return store.get('ai_kids')!=='0';}catch(e){return true;}}
function rudeOn(){return kidsOn();}
function kidOK(it){if(!it)return true;if(rudeOn()&&RUDERE.test([it.title,it.text,it.license].join(' ')))return false;if(!kidsOn())return true;if(KIDSRC.test(String(it.source||'')))return false;return !KIDRE.test([it.title,it.text,it.license].join(' '));}
function feedItems(page){
var key='ai_v9_feed2_'+country();var cached=jget(key,null);
if(page)return xget('feed',{page:String(page)},25000).then(function(j){return(j.items||[]).filter(function(it){return it.type!=='video';});});
var p=xget('feed',{},20000).then(function(j){return(j.items||[]).filter(function(it){return it.type!=='video';});});
return p.catch(function(){
var d=new Date(Date.now()-86400000),lang='en';
return fetch('https://api.wikimedia.org/feed/v1/wikipedia/'+lang+'/featured/'+d.getUTCFullYear()+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+String(d.getUTCDate()).padStart(2,'0')).then(function(r){return r.json();}).then(function(j){
var out=[];(j.mostread&&j.mostread.articles||[]).forEach(function(a){if(/^(Main_Page|Special:|Wikipedia:|Заглавна_страница|Служебна:)/.test(a.title))return;out.push({type:'post',title:a.normalizedtitle||a.title,text:(a.extract||a.description||'').slice(0,300),image:(a.thumbnail&&a.thumbnail.source)||'',link:a.content_urls&&a.content_urls.desktop&&a.content_urls.desktop.page||''});});
var tp=['nature','space','science','technology','history','music','art','travel','animals','ocean'][Math.floor(Date.now()/300000)%10];
return fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=40').then(function(r){return r.json();}).then(function(h){return(h.hits||[]).filter(function(x){return x.title;}).map(function(x){return{type:'post',title:x.title,text:'Hacker News - '+(x.points||0)+' points',image:'',link:x.url||('https://news.ycombinator.com/item?id='+x.objectID),t:x.created_at_i};});}).catch(function(){return[];}).then(function(hn){out=hn.concat(out);return commonsClient(tp);}).then(function(v){return out.concat(v.slice(0,5).map(function(x){return{type:'video',title:x.title,text:x.license,image:x.thumb,src:x.src,link:x.page,mime:x.mime,source:x.source,license:x.license,duration:x.duration};}));}).catch(function(){return out;});
});
}).then(function(items){if(items.length)jset(key,{t:Date.now(),items:items.slice(0,80)});return items;}).catch(function(e){if(cached)return cached.items;throw e;});
}
function renderFeed(box,items,limit,moreFn){
items=items.filter(function(it){return it.type!=='video';});
if(kidsOn()||rudeOn())items=items.filter(kidOK);
/* when only more items are asked for, the cards already on the screen stay (a playing video is not cut off); otherwise everything is built again */
var fk=items[0]?String(items[0].src||items[0].link||items[0].title):'',kd=kidsOn()?1:0,skip=0;
if(box._built&&box._fk===fk&&box._kd===kd&&box._shown>0&&limit>=box._shown){skip=box._shown;if(box._moreEl&&box._moreEl.parentNode)box._moreEl.parentNode.removeChild(box._moreEl);if(box._aio){try{box._aio.disconnect();}catch(e){}box._aio=null;}}
else{box.textContent='';}
box._built=true;box._fk=fk;box._kd=kd;var n=0;box._shown=limit;
items.forEach(function(it){
if(n>=limit)return;n++;if(n<=skip)return;
var p=el('div','fd-post');
if(it.image&&!LOW()){var im=new Image();im.loading='lazy';im.decoding='async';try{im.fetchPriority='low';}catch(e){}im.alt='';im.referrerPolicy='no-referrer';im.src=it.image;p.appendChild(im);}
var t=el('div');var h4=el('h4','');if(it.isNew)h4.appendChild(el('span','new-tag','NEW'));h4.appendChild(document.createTextNode(it.title));t.appendChild(h4);t.appendChild(el('p','',(it.text||'')+(it.t?' · '+ago(it.t):'')));
var r=el('div','v9-row');
if(it.link){var a=el('a','','Open ↗');a.href=safeUrl(it.link);a.target='_blank';a.rel='noopener noreferrer';r.appendChild(a);}
if(it.image)r.appendChild(mkBtn('⬇️ '+'Image','',function(){dl(it.image,(it.title||'image').replace(/[^\wЀ-ӿ.-]+/g,'_').slice(0,80)||'image');}));
r.appendChild(mkBtn('⬇️ '+'Text','',function(){saveFile((it.title||'post').replace(/[^\wЀ-ӿ.-]+/g,'_')+'.txt',it.title+'\n\n'+(it.text||'')+'\n\n'+(it.link||''),'text/plain');}));
t.appendChild(r);p.appendChild(t);box.appendChild(p);
});
var moreBtn=null;
if(box._manual){
var ctl=el('div','fd-more');ctl.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:16px';
ctl.appendChild(el('div','v9-note','Showing '+Math.min(n,items.length)+' items. Load more:')).style.width='100%';
[10,25,50,100].forEach(function(k){var bt=mkBtn('+'+k,'',function(){box._step=k;if(items.length>limit){renderFeed(box,items,limit+k,moreFn);}else if(moreFn){[].forEach.call(ctl.querySelectorAll('button'),function(x){x.disabled=true;});moreFn();}});bt.setAttribute('aria-label','Load '+k+' more');ctl.appendChild(bt);});
var al=el('label','v9-note');al.style.cssText='width:100%;display:flex;align-items:center;gap:8px;justify-content:center;cursor:pointer';var ac=document.createElement('input');ac.type='checkbox';ac.checked=store.get('ai_feed_auto')==='1';ac.setAttribute('aria-label','Auto Loading');
ac.onchange=function(){store.set('ai_feed_auto',ac.checked?'1':'0');if(!ac.checked&&box._aio){try{box._aio.disconnect();}catch(e){}box._aio=null;}else if(ac.checked)renderFeed(box,items,limit,moreFn);};
al.appendChild(ac);al.appendChild(document.createTextNode('Auto Loading (off by default): load the next items by itself while scrolling'));ctl.appendChild(al);
box.appendChild(ctl);box._moreEl=ctl;
if(items.length<=limit&&!moreFn)ctl.style.display='none';
else if(store.get('ai_feed_auto')==='1'&&window.IntersectionObserver){/* only when Auto Loading is on: keeps about 1500 px of videos and articles ready below the screen: loads the next ones by itself, but never while a video is playing */
var aio=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;var bs=ctl.querySelectorAll('button');if(!bs.length||bs[0].disabled)return;if(Date.now()-(box._lastAuto||0)<1500){setTimeout(function(){if(box._aio===aio){aio.disconnect();aio.observe(ctl);}},1600);return;}box._lastAuto=Date.now();
if([].some.call(box.querySelectorAll('video'),function(v){return !v.paused&&!v.ended;})){setTimeout(function(){if(box._aio===aio){aio.disconnect();aio.observe(ctl);}},3000);return;}
aio.disconnect();bs[0].click();},{rootMargin:'1500px'});aio.observe(ctl);box._aio=aio;}
}else if(items.length>limit){moreBtn=mkBtn('Load more','',function(){renderFeed(box,items,limit+24,moreFn);});box.appendChild(moreBtn);}
else if(moreFn&&!box._manual){moreBtn=mkBtn('Load more','',function(){moreBtn.disabled=true;moreBtn.textContent='Loading…';moreFn();});box.appendChild(moreBtn);}
if(moreBtn&&window.IntersectionObserver){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();moreBtn.click();}},{rootMargin:'1200px'});io.observe(moreBtn);}
items.slice(limit,limit+10).forEach(function(it){if(it.image&&!LOW()){var i=new Image();i.src=it.image;}});
}
function regionName(){try{return new Intl.DisplayNames(['en'],{type:'region'}).of(country());}catch(e){return'';}}

/* ============================ AI Finder ============================ */
function artCard(it){
var p=el('div','fd-post');p.setAttribute('data-kind','article');var t=el('div');t.appendChild(el('h4','',it.title));
if(it.text)t.appendChild(el('p','',it.text));t.appendChild(el('p','v9-note',it.source));
var r=el('div','v9-row');var a=el('a','','Open ↗');a.href=safeUrl(it.url);a.target='_blank';a.rel='noopener noreferrer';r.appendChild(a);
var star=el('button','v9-btn','');star.type='button';function sS(){var on=false;try{on=FAV.links.some(function(x){return x.url===it.url;});}catch(e){}star.textContent=on?'🔗 Saved':'🔗 Save link';}
try{favLoad();}catch(e){}sS();
star.onclick=function(){var on=favToggleLink({url:it.url,title:it.title+' – '+it.source,source:it.source,snippet:String(it.text||'').slice(0,300)});sS();toast(on?'🔗 Link saved in Favorites':'Link removed from Favorites','var(--accent)',1600);};
r.appendChild(star);t.appendChild(r);p.appendChild(t);return p;
}
function plainText(h){try{return String(new DOMParser().parseFromString(String(h),'text/html').body.textContent||'').replace(/\s+/g,' ').trim();}catch(e){return String(h).replace(/<[^>]+>/g,' ');}}
function fetchJ(u,ms){var c=window.AbortController?new AbortController():null,t=c?setTimeout(function(){c.abort();},ms||9000):0;return fetch(u,c?{signal:c.signal}:{}).then(function(r){if(t)clearTimeout(t);if(!r.ok)throw new Error('http '+r.status);return r.json();}).catch(function(e){if(t)clearTimeout(t);throw e;});}
function wikiPool(lang,q,off){
return fetchJ('https://'+lang+'.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=50&sroffset='+off+'&srprop=snippet&format=json&formatversion=2&origin=*').then(function(j){
return((j.query&&j.query.search)||[]).map(function(x){return{title:String(x.title||'').slice(0,140),text:plainText(x.snippet).slice(0,260),source:'Wikipedia '+lang.toUpperCase(),url:'https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(String(x.title||'').replace(/ /g,'_'))};}).filter(function(x){return x.title;});}).catch(function(){return[];});}
function hnPool(q,pg){
return fetchJ('https://hn.algolia.com/api/v1/search?query='+encodeURIComponent(q)+'&tags=story&hitsPerPage=50&page='+pg).then(function(j){
return(j.hits||[]).filter(function(h){return h&&h.title&&/^https:\/\//.test(String(h.url||''));}).map(function(h){return{title:String(h.title).slice(0,140),text:(h.points||0)+' points on Hacker News',source:'Hacker News',url:String(h.url)};});}).catch(function(){return[];});}
function aiFinderBlock(){
var box=el('div','v9-card');box.id='aiFinder';box.style.cssText='margin:0 0 10px;padding:10px;line-height:1.5';
box.appendChild(el('b','','🤖 AI Finder'));
box.appendChild(el('div','v9-note','Tell the AI what you want to read. It searches Wikipedia and Hacker News and chooses the best articles for you. The AI never invents links.'));
var row=el('div','v9-row'),inp=el('input','v9-in');inp.maxLength=80;inp.setAttribute('aria-label','What should the AI find?');inp.placeholder='e.g. how black holes form, new ideas in security…';
var go=mkBtn('Find','pri',function(){run(true);});row.appendChild(inp);row.appendChild(go);box.appendChild(row);
var opts=el('div','v9-row');var nl=el('label','v9-note');nl.style.cssText='display:flex;gap:6px;align-items:center';nl.appendChild(document.createTextNode('How many at once:'));var nsel=el('select','v9-sel');nsel.setAttribute('aria-label','How many articles the AI loads at once');nl.appendChild(nsel);opts.appendChild(nl);box.appendChild(opts);
[10,20,30,40,50].forEach(function(n){var o=el('option','',String(n));o.value=String(n);nsel.appendChild(o);});
var sv=+(jget('ai_v9_findn',{})||{}).article;nsel.value=String([10,20,30,40,50].indexOf(sv)>-1?sv:20);
nsel.onchange=function(){jset('ai_v9_findn',{article:+nsel.value});};
var mr=mkModelRow();mr.style.margin='4px 0';box.appendChild(mr);
var st=el('div','v9-note');st.setAttribute('aria-live','polite');box.appendChild(st);
var aOut=el('div','');box.appendChild(aOut);
var tail=el('div','fd-more');tail.style.cssText='display:none;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin:12px 0;padding:10px;border:1px solid var(--line);border-radius:16px';
var moreB=mkBtn('⬇ Load more (AI)','',function(){run(false);});tail.appendChild(moreB);
var al=el('label','v9-note');al.style.cssText='width:100%;display:flex;align-items:center;gap:8px;justify-content:center;cursor:pointer';var ac=document.createElement('input');ac.type='checkbox';ac.checked=store.get('ai_feed_auto')==='1';ac.setAttribute('aria-label','Auto Loading');
ac.onchange=function(){store.set('ai_feed_auto',ac.checked?'1':'0');watch();};al.appendChild(ac);al.appendChild(document.createTextNode('Auto Loading (off by default): load the next ones by itself while scrolling'));tail.appendChild(al);box.appendChild(tail);
var busy=false,A={};
function count(){return +nsel.value||20;}
function announce(first){
if(!first)return;var pill=document.getElementById('fdNew');
if(!pill){pill=el('button','v9-btn pri','');pill.id='fdNew';pill.type='button';pill.style.cssText='position:fixed;left:50%;bottom:78px;transform:translateX(-50%);z-index:9000;display:none;box-shadow:0 4px 18px rgba(0,0,0,.4)';document.body.appendChild(pill);}
clearTimeout(pill._t);if(pill._io){try{pill._io.disconnect();}catch(e){}pill._io=null;}
pill.textContent='⬇ Jump to the first new article';pill.style.display='block';
function hide(){pill.style.display='none';clearTimeout(pill._t);if(pill._io){try{pill._io.disconnect();}catch(e){}pill._io=null;}}
pill.onclick=function(){hide();try{first.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){first.scrollIntoView();}};
pill._t=setTimeout(hide,30000);
if(window.IntersectionObserver){pill._io=new IntersectionObserver(function(es){if(es[0].isIntersecting)hide();},{threshold:0.6});pill._io.observe(first);}
}
var wio=null;
function watch(){if(wio){try{wio.disconnect();}catch(e){}wio=null;}
if(ac.checked&&window.IntersectionObserver&&tail.style.display!=='none'){wio=new IntersectionObserver(function(es){if(!es[0].isIntersecting||busy)return;if(Date.now()-(box._la||0)<1500)return;box._la=Date.now();run(false);},{rootMargin:'1200px'});wio.observe(tail);}}
function fail(msg){busy=false;go.disabled=false;moreB.disabled=false;st.textContent='⚠️ '+msg;}
function runArticle(fresh){
if(fresh){var w=inp.value.trim();if(w.length<2){inp.focus();return false;}A={wish:w,qs:[],pool:[],seen:{},off:{},n:0,done:false,planned:false};aOut.textContent='';}
else if(!A.wish||(A.done&&!A.pool.length)){st.textContent=A.wish?'No more articles found for this wish.':'';return false;}
var want=count(),first=null,cyr=/[Ѐ-ӿ]/.test(A.wish),model=modelPick();
busy=true;go.disabled=true;moreB.disabled=true;
function plan(){if(A.planned)return Promise.resolve();st.textContent='🤖 The AI is planning the search…';
return aiAsk('article_plan',{text:A.wish}).then(function(j){A.qs=(j&&j.queries||[]).filter(function(x){return typeof x==='string'&&x.length>1;}).slice(0,2);}).catch(function(){A.qs=[];}).then(function(){if(!A.qs.length)A.qs=[A.wish];A.planned=true;});}
function fill(tries){
if(A.pool.length>=want||A.done||tries>2)return Promise.resolve();
st.textContent='Looking in Wikipedia and Hacker News…';
var jobs=[];A.qs.forEach(function(q,i){var k='e'+i,o=A.off[k]||0;A.off[k]=o+50;jobs.push(wikiPool('en',q,o));var h='h'+i,p=A.off[h]||0;A.off[h]=p+1;jobs.push(hnPool(q,p));});
if(cyr){var o2=A.off.bg||0;A.off.bg=o2+50;jobs.push(wikiPool('bg',A.wish,o2));}
return Promise.all(jobs).then(function(rs){var n0=0;rs.forEach(function(a){a.forEach(function(it){if(!it||!it.url||A.seen[it.url])return;if(!kidOK({title:it.title,text:it.text}))return;A.seen[it.url]=1;A.pool.push(it);n0++;});});if(!n0)A.done=true;return fill(tries+1);});}
function pick(){
if(!A.pool.length)return Promise.resolve([]);
var cand=A.pool.slice(0,60);var lines=cand.map(function(it,i){return(i+1)+'. '+it.title.replace(/\s+/g,' ').slice(0,80)+' | '+it.source+(it.text?' | '+it.text.slice(0,60):'');}).join('\n');
st.textContent='🤖 The AI is choosing the best articles…';
return aiAsk('article_pick',{text:lines.slice(0,5800),question:'Wish: '+A.wish,model:model}).then(function(j){
var ord=(j.order||[]).filter(function(n,i,a){return n>=1&&n<=cand.length&&a.indexOf(n)===i;});A.why=j.why||'';A.model=j.model||'';
var inO={};ord.forEach(function(n){inO[n]=1;});var rest=cand.map(function(_,i){return i+1;}).filter(function(n){return!inO[n];});return ord.concat(rest).slice(0,want).map(function(n){return cand[n-1];});
}).catch(function(){A.why='';A.model='';return cand.slice(0,want);});}
plan().then(function(){return fill(0);}).then(pick).then(function(sel){
var got=0;sel.forEach(function(it){var i=A.pool.indexOf(it);if(i>-1)A.pool.splice(i,1);var c=artCard(it);if(!first)first=c;aOut.appendChild(c);got++;A.n++;});
busy=false;go.disabled=false;moreB.disabled=false;
st.textContent=got?('Found '+got+' article'+(got>1?'s':'')+(A.why?' · '+A.why:'')+(A.model?' · 🤖 '+aiShort(A.model):'')):'No article found. Try other words.';
tail.style.display=A.n&&(A.pool.length||!A.done)?'flex':'none';announce(first);watch();try{logAct('search','AI Finder '+A.wish);}catch(e){}
}).catch(function(e){fail(aiErrText(e));});
return true;}
function run(fresh){if(busy)return;runArticle(fresh);}
inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();run(true);}});
box.fill=function(text,doRun){inp.value=String(text||'').slice(0,80);if(doRun&&inp.value.trim().length>1)run(true);else inp.focus();};
return box;
}

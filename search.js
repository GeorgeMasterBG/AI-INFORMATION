/* AI INFORMATION - search.js
   home screen: the 950+ source search, filters, search summary, trending, radar, breaking news, live sources.
   Only function declarations: they are called later by app.js (loaded last). */

function sourceUrl(b,q){
if(b.tpl)return b.tpl.replace('{q}',encodeURIComponent(q));
return 'https://www.google.com/search?q='+encodeURIComponent('site:'+b.domain+' '+q);
}
function loadLive(){
if(LIVE.p)return LIVE.p;
function get(u){var c=window.AbortController?new AbortController():null,t=c&&setTimeout(function(){c.abort();},6000);return fetch(u,{credentials:'omit',referrerPolicy:'no-referrer',signal:c?c.signal:undefined}).then(function(r){clearTimeout(t);return r.ok?r.json():null;}).catch(function(){clearTimeout(t);return null;});}
var have={};ALL_SOURCES.forEach(function(b){have[b.domain]=1;});
function add(name,type,domain,tpl,region){if(!domain||have[domain])return;have[domain]=1;ALL_SOURCES.push({id:ALL_SOURCES.length,name:name,type:type,domain:domain,tpl:tpl,region:region});LIVE.n++;}
LIVE.p=Promise.all([
get('https://meta.wikimedia.org/w/api.php?action=sitematrix&format=json&origin=*&smtype=language&smsiteprop=url|sitename').then(function(j){var m=(j&&j.sitematrix)||{};Object.keys(m).forEach(function(k){if(!/^\d+$/.test(k))return;var L=m[k];(L.site||[]).forEach(function(x){if('closed' in x||'private' in x||'fishbowl' in x||!x.url)return;var h=x.url.replace(/^https?:\/\//,'');add((x.sitename||'Wikimedia')+' ('+(L.localname||L.name||L.code)+')','encyclopedia',h,'https://'+h+'/w/index.php?search={q}','INT');});});}),
get('https://api.stackexchange.com/2.3/sites?pagesize=500').then(function(j){((j&&j.items)||[]).forEach(function(x){if(x.site_type!=='main_site'||!x.site_url)return;var h=x.site_url.replace(/^https?:\/\//,'');add(x.name+' (Stack Exchange)','tech',h,x.site_url+'/search?q={q}','INT');});})
]).then(function(){if(LIVE.n){var sp=document.querySelector('.header h1 span:not(.ttl-l)');if(sp&&!window.AI_COUNTED){window.AI_COUNTED=1;sp.textContent=ALL_SOURCES.length+' SOURCES';}var fi=document.getElementById('filterInput');if(fi)fi.placeholder='Filter '+ALL_SOURCES.length+' sources (e.g. factcheck, bulgaria)…';}});
return LIVE.p;
}
function generateSources(query){
return ALL_SOURCES.map(function(b){
return{uid:query+'_'+b.id,id:b.id,title:'Search "'+query+'" on '+b.name,
snippet:(TYPE_INFO[b.type]||'Source')+' · '+b.domain+(b.tpl?'':' · this opens a Google search limited to this site'),
url:sourceUrl(b,query),source:b.name,type:b.type,domain:b.domain,region:b.region};
});
}
function buildItem(s,full){
var isFav=favorites.indexOf(s.uid)!==-1;
var div=document.createElement('div');
div.className='source-item'+(isFav?' favorited':'');
div.setAttribute('data-uid',s.uid);
div.innerHTML='<b>['+(Number(s.id)+1)+'] '+esc(s.source)+' - '+esc(s.type)+'</b>'
+'<div style="font-size:11px;font-weight:bold;">'+esc(s.title)+'</div>'
+'<div style="font-size:11px;opacity:0.8;margin:6px 0;line-height:1.5;">'+esc(s.snippet)+'</div>'
+'<a href="'+esc(safeUrl(s.url))+'" target="_blank" rel="noopener noreferrer">Open on '+esc(s.domain||s.source)+' ↗</a>'
+'<div style="font-size:9px;color:var(--gold);">'+esc(s.region||'')+' • '+(Number(s.id)+1)+'/'+ALL_SOURCES.length+'</div>'
+'<button class="source-fav '+(isFav?'active':'')+'" data-uid="'+esc(s.uid)+'" type="button" aria-label="Favorite" onclick="toggleFav(this)">⭐</button>';
return div;
}
function renderSources(list){
currentFiltered=list;
var resultDiv=document.getElementById('result');resultDiv.innerHTML='';
if(!list.length){var e=document.createElement('div');e.style.cssText='text-align:center;padding:16px;opacity:0.8;';e.textContent='No sources match your filter';resultDiv.appendChild(e);}
var toShow=list.slice(0,150);
for(var i=0;i<toShow.length;i++)resultDiv.appendChild(buildItem(toShow[i],false));
if(list.length>150){var more=document.createElement('div');more.style.cssText='text-align:center;padding:12px;background:var(--bg2);border:1px dashed var(--border2);border-radius:10px;margin-top:10px;';more.innerHTML='Showing 150 of '+Number(list.length)+'<br><button type="button" onclick="renderAllSources()" style="margin-top:8px;padding:8px 16px;background:var(--accent);color:var(--bg);border:none;border-radius:20px;font-weight:bold;cursor:pointer;">Load all '+Number(list.length)+'</button>';resultDiv.appendChild(more);}
resultDiv.style.display='block';document.getElementById('filterBox').style.display='block';document.getElementById('summaryBtn').style.display='block';try{clsAiDraw();}catch(e){}document.getElementById('shareBtn').style.display='block';document.getElementById('exportBtn').style.display='block';
}
function renderAllSources(){
var resultDiv=document.getElementById('result');resultDiv.innerHTML='';
var frag=document.createDocumentFragment();
for(var i=0;i<currentFiltered.length;i++)frag.appendChild(buildItem(currentFiltered[i],true));
resultDiv.appendChild(frag);
}
function toggleFav(btn){var uid=btn.getAttribute('data-uid');var idx=favorites.indexOf(uid);if(idx>-1){favorites.splice(idx,1);btn.classList.remove('active');btn.closest('.source-item').classList.remove('favorited');}else{favorites.push(uid);btn.classList.add('active');btn.closest('.source-item').classList.add('favorited');}store.set('ai_favorites',JSON.stringify(favorites));var s=document.getElementById('shareStatus');s.textContent=favorites.indexOf(uid)!==-1?'⭐ Added':'☆ Removed';s.style.display='block';setTimeout(function(){s.style.display='none';},1500);}
function fetchWiki(q,box){
currentWiki=null;
var lang=/[\u0400-\u04FF]/.test(q)?'bg':'en';
var url='https://'+lang+'.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrlimit=3&prop=extracts%7Cinfo&inprop=url&exintro=1&explaintext=1&exsentences=3&format=json&formatversion=2&origin=*';
apiFetch(url,{timeout:7000}).then(function(r){if(!r.ok)throw new Error('http');return r.json();}).then(function(d){
if(q!==currentQuery)return;
var pages=(d.query&&d.query.pages)||[];pages.sort(function(a,b){return a.index-b.index;});
box.textContent='';
if(!pages.length){box.textContent='Wikipedia has no article that matches this search.';return;}
var p=pages[0];currentWiki={title:p.title,url:p.fullurl,text:p.extract||'',lang:lang};
box.appendChild(el('b','','📖 '+p.title+' · Wikipedia ('+lang.toUpperCase()+')'));
box.appendChild(el('div','',(p.extract||'No introduction available.').slice(0,700)));
var a=el('a','','Read the full article ↗');a.href=safeUrl(p.fullurl);a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='font-size:11px;color:var(--accent2);';box.appendChild(a);
}).catch(function(){if(q===currentQuery)box.textContent='A live Wikipedia excerpt is not available here (network blocked or offline). The buttons below still open real searches.';});
}
function setFilterChip(t){var i=document.getElementById('filterInput');i.value=(i.value===t)?'':t;applyFilters();hideKeyboard();}
function doSearch(){
hideKeyboard();
var q=document.getElementById('q').value.trim();
var verdict=document.getElementById('verdict'),result=document.getElementById('result');
if(!q){
verdict.innerHTML='<div style="background:#ff4444;color:#fff;padding:10px;border-radius:8px;text-align:center;">⚠️ Enter a topic first</div>';
document.getElementById('q').focus();return;
}
verdict.innerHTML='<div style="background:var(--bg2);border:1px solid var(--accent);padding:10px;border-radius:8px;text-align:center;">⏳ Preparing searches on '+ALL_SOURCES.length+' sources for "'+esc(q)+'"…</div>';
result.style.display='block';
setTimeout(hideKeyboard,100);
Promise.race([loadLive(),new Promise(function(r){setTimeout(r,5500);})]).then(function(){
try{
currentQuery=q;
currentSources=generateSources(q);resetFilters();
renderSources(currentSources);
var chips=['factcheck','news','science','health','gov','bulgaria','bigtech'].map(function(t){return'<button type="button" class="src-chip" onclick="setFilterChip(\''+t+'\')">'+t+'</button>';}).join('');
verdict.innerHTML='<div style="background:var(--bg2);border:1px solid var(--border2);border-left:3px solid var(--accent);padding:12px;border-radius:8px;">'
+'<b style="color:var(--accent);font-size:14px;">🔎 '+ALL_SOURCES.length+' sources for "'+esc(q)+'"</b>'
+'<div style="font-size:11px;opacity:.85;line-height:1.5;margin-top:6px;">Each button below opens a real search on that website. This tool does not read those pages, so it cannot say whether something is true. Check at least one fact-checker, one news agency and one reference source.</div>'
+'<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">'+chips+'<button type="button" class="src-chip" onclick="if(window.openStd)openStd(currentQuery)">🔎 Standard Mode</button></div>'
+'<div id="wikiBox" style="margin-top:10px;font-size:12px;line-height:1.5;padding:10px;background:var(--bg3);border-radius:8px;">⏳ Fetching a live Wikipedia excerpt…</div></div>';
fetchWiki(q,document.getElementById('wikiBox'));
var lb=document.createElement('div');lb.id='liveBox';lb.style.cssText='margin-top:10px;font-size:12px;line-height:1.5;padding:10px;background:var(--bg3);border-radius:8px';document.getElementById('wikiBox').parentNode.appendChild(lb);if(window.liveSearch)liveSearch(q,lb);
hideKeyboard();
setTimeout(hideKeyboard,300);
toast('Ready: '+currentSources.length+' sources');
}catch(e){verdict.innerHTML='<div style="background:#ff4444;color:#fff;padding:10px;border-radius:8px;"><b>Error:</b> '+esc(e.message)+'</div>';}
});
}
function applyFilters(){
var t=(document.getElementById('filterInput').value||'').trim().toLowerCase();
var list=currentSources.filter(function(s){
if(showOnlyFav&&favorites.indexOf(s.uid)===-1)return false;
if(!t)return true;
return (s.title+' '+s.source+' '+s.type+' '+(s.domain||'')+' '+(s.region||'')).toLowerCase().indexOf(t)!==-1;
});
renderSources(list);
}
function filterSources(){clearTimeout(filterTimer);filterTimer=setTimeout(applyFilters,120);}
function resetFilters(){document.getElementById('filterInput').value='';showOnlyFav=false;document.getElementById('favFilterBtn').classList.remove('active');}
function toggleFavFilter(){
showOnlyFav=!showOnlyFav;
document.getElementById('favFilterBtn').classList.toggle('active',showOnlyFav);
applyFilters();
hideKeyboard();
}

function clsGen(model){
var st=clsSt;if(!st||st.busy)return;
if(!FT.on('aisum'))return;
var kid=false;try{var g=ageG();kid=(g==='u13'||g==='13-15'||g==='16-17');}catch(e){}
if(kid&&!model&&!st.manual){st.err='Pick a model above to ask once.';clsAiDraw();return;}
if(model)st.manual=1;
var items=currentSources.slice(0,14).map(function(r){return{title:String(r.source||r.title||'').slice(0,140),text:String(r.desc||r.description||r.text||r.type||'').slice(0,320),source:String(r.type||'').slice(0,50),url:r.url};});
if(currentWiki&&currentWiki.text)items.unshift({title:'Wikipedia: '+currentWiki.title,text:String(currentWiki.text).slice(0,320),source:'wikipedia',url:currentWiki.url});
if(!items.length)return;
st.busy=true;st.err='';clsAiDraw();
xpost('summary',{query:st.q,items:items,model:model||''},40000).then(function(j){st.busy=false;if(!j.summary)throw new Error('empty');st.versions.push({model:j.model||model||'',text:j.summary});st.cur=st.versions.length-1;if(clsSt===st)clsAiDraw();}).catch(function(e){st.busy=false;st.err=/needs-server|501|needs Workers AI/.test(String(e&&e.message))?'AI summary needs the Cloudflare Worker with Workers AI switched on.':'The AI model did not answer. Try another model.';if(clsSt===st)clsAiDraw();});
}
function doSummary(){
hideKeyboard();
var box=document.getElementById('aiSummary'),overlay=document.getElementById('aiSummaryOverlay');
if(!currentSources.length){box.innerHTML='<div style="padding:20px;text-align:center;"><b>No results</b><br>Type a topic and press VERIFY first</div>';box.style.display='block';overlay.style.display='block';return;}
function links(type,n){return currentSources.filter(function(s){return s.type===type;}).slice(0,n).map(function(s){return'<a href="'+esc(safeUrl(s.url))+'" target="_blank" rel="noopener noreferrer" style="display:block;margin:4px 0;color:var(--accent2);">'+esc(s.source)+' ↗</a>';}).join('');}
var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="margin:0;color:var(--accent2);">📖 Summary</h3><button type="button" onclick="closeSummary()" style="background:var(--bg3);border:1px solid var(--border2);color:var(--text);width:32px;height:32px;border-radius:50%;cursor:pointer;">✕</button></div>';
h+='<div class="trust-badge">"'+esc(currentQuery)+'" · '+currentSources.length+' sources</div><div class="summary-text">';
if(currentWiki&&currentWiki.text)h+='<b style="color:var(--gold);">📚 From Wikipedia ('+esc(currentWiki.lang.toUpperCase())+'): '+esc(currentWiki.title)+'</b><br>'+esc(currentWiki.text)+'<br><a href="'+esc(safeUrl(currentWiki.url))+'" target="_blank" rel="noopener noreferrer" style="color:var(--accent2);">Full article ↗</a><br><br>';
else h+='<i>No live excerpt is available (network blocked or no matching article).</i><br><br>';
h+='<b style="color:var(--accent);">✅ Check the claim</b>'+links('factcheck',4)+'<br><b style="color:#ff8800;">📰 News agencies</b>'+links('agency',3)+'<br><b style="color:var(--accent);">🔬 Research</b>'+links('science',3);
h+='<div style="background:var(--bg2);border-left:3px solid var(--accent);padding:12px;border-radius:8px;margin-top:12px;"><b>Note:</b> the text above is quoted from Wikipedia, which anyone can edit. The links open real searches. Nothing here is a verdict on whether the topic is true.</div></div>';
box.innerHTML=h;box.style.display='block';overlay.style.display='block';
}
function closeSummary(){document.getElementById('aiSummary').style.display='none';document.getElementById('aiSummaryOverlay').style.display='none';}
function saveProgress(){
hideKeyboard();
if(!currentSources.length){toast('No data to save','#ff4444');return;}
var data={query:currentQuery,sources:currentSources,favorites:favorites};
var name='ai-info-'+currentSources.length+'-'+currentQuery.replace(/[^A-Za-z0-9Ѐ-ӿ_-]+/g,'_').slice(0,40)+'.json';
saveFile(name,JSON.stringify(data),'application/json');
}
function loadProgress(e){
hideKeyboard();
var file=e.target.files[0];if(!file)return;
if(file.size>5*1024*1024){toast('File too large (max 5 MB)','#ff4444');e.target.value='';return;}
var reader=new FileReader();
reader.onload=function(ev){
try{
var data=JSON.parse(ev.target.result);
if(!data||!Array.isArray(data.sources))throw new Error('bad file');
currentSources=data.sources.slice(0,5000).map(function(x,i){x=x||{};return{
uid:String(x.uid||('x_'+i)),id:Number(x.id)||i,title:String(x.title||''),snippet:String(x.snippet||''),
url:String(x.url||''),source:String(x.source||''),type:String(x.type||''),
domain:String(x.domain||''),region:String(x.region||'')};});
currentQuery=String(data.query||'');
favorites=Array.isArray(data.favorites)?data.favorites.map(String):[];
store.set('ai_favorites',JSON.stringify(favorites));
document.getElementById('q').value=currentQuery;
resetFilters();applyFilters();
}catch(err){toast('Could not load this file','#ff4444');}
};
reader.readAsText(file);e.target.value='';
}
function ago(t){var d=Math.max(0,Math.floor(Date.now()/1000-t));if(d<60)return'just now';if(d<3600)return Math.floor(d/60)+' min ago';if(d<86400)return Math.floor(d/3600)+' h ago';return Math.floor(d/86400)+' d ago';}
function renderRadar(items,note,markNew){
var sc=document.getElementById('breakingNewsScroll'),keep=sc.scrollTop;sc.textContent='';
if(note){var n=el('div','',note);n.style.cssText='font-size:10px;opacity:.7;line-height:1.5;margin-bottom:4px;';sc.appendChild(n);}
items.forEach(function(h){
var a=el('a','breaking-item');a.href=safeUrl(h.u);a.target='_blank';a.rel='noopener noreferrer';
var b=el('b','','');
if(markNew&&radarSeen&&!radarSeen[h.u])b.appendChild(el('span','new-tag','NEW'));
b.appendChild(document.createTextNode(h.t));a.appendChild(b);
if(h.a||h.p!=null){var m=el('div','',(h.a?ago(h.a):'')+((h.a&&h.p>0)?' · ':'')+(h.p>0?'▲ '+h.p:''));m.style.cssText='font-size:10px;opacity:.85;margin-top:3px;';a.appendChild(m);}
sc.appendChild(a);
});
sc.scrollTop=keep;
}
function radarSet(live,text){
var d=document.getElementById('radarDot'),s=document.getElementById('radarStatus');
if(d)d.className='live-dot'+(live?'':' off');if(s)s.textContent=text||'';
}
function radarFetch(){
if(API.ok){
return apiFetch('/api/news',{timeout:8000}).then(function(r){
if(!r.ok)throw new Error('http '+r.status);return r.json();
}).then(function(d){return{items:d.items,from:'server'};});
}
function algolia(){return apiFetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=40',{timeout:6000}).then(function(r){if(!r.ok)throw new Error('a');return r.json();})
.then(function(d){return{from:'hn.algolia.com',items:(d.hits||[]).map(function(h){return{t:String(h.title||''),u:h.url||('https://news.ycombinator.com/item?id='+encodeURIComponent(h.objectID)),p:h.points,a:h.created_at_i};})};});}
function firebase(){return apiFetch('https://hacker-news.firebaseio.com/v0/newstories.json',{timeout:6000}).then(function(r){if(!r.ok)throw new Error('f');return r.json();})
.then(function(ids){return Promise.all(ids.slice(0,40).map(function(id){return apiFetch('https://hacker-news.firebaseio.com/v0/item/'+id+'.json',{timeout:6000}).then(function(r){return r.json();});}));})
.then(function(a){return{from:'hacker-news.firebaseio.com',items:a.filter(Boolean).map(function(h){return{t:String(h.title||''),u:h.url||('https://news.ycombinator.com/item?id='+h.id),p:h.score,a:h.time};})};});}
function devto(){return apiFetch('https://dev.to/api/articles?per_page=40',{timeout:6000}).then(function(r){if(!r.ok)throw new Error('d');return r.json();})
.then(function(a){return{from:'dev.to',items:a.map(function(h){return{t:String(h.title||''),u:h.url,p:h.positive_reactions_count,a:h.published_timestamp?Math.floor(Date.parse(h.published_timestamp)/1000):null};})};});}
return algolia().catch(firebase).catch(devto);
}
function loadBreaking(auto){
if(radarBusy)return;radarBusy=true;
var sc=document.getElementById('breakingNewsScroll');
if(!auto&&!radarLive){sc.textContent='Loading…';}
radarSet(radarLive,radarLive?'updating…':'connecting…');
radarFetch().then(function(r){
if(!r.items||!r.items.length)throw new Error('empty');
r.items=r.items.filter(function(h){return h.t;}).sort(function(a,b){return(b.a||0)-(a.a||0);}).slice(0,40);
var first=!radarSeen;if(first)radarSeen={};
renderRadar(r.items,'● LIVE · updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · '+r.from+' · newest first · refreshes every '+(radarEvery>=60?(radarEvery/60)+' min':radarEvery+' s'),!first);
r.items.forEach(function(h){radarSeen[h.u]=1;});
radarLive=true;radarLast=Date.now();radarSet(true,'LIVE');
trendTech=trendKeywords(r.items);renderTrending();
}).catch(function(){
if(radarLive){radarSet(false,'connection lost – retrying');return;}
renderRadar(RADAR_SNAPSHOT.items,'NOT LIVE – this viewer cannot reach the news feeds, so you see a saved snapshot from '+RADAR_SNAPSHOT.taken+'. It will switch to live automatically when a connection works (retry every 30 s).');
radarSet(false,'offline snapshot');
}).then(function(){radarBusy=false;});
if(!radarTimer){
radarTimer=setInterval(function(){if(!document.hidden)loadBreaking(true);},30000);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&Date.now()-radarLast>20000)loadBreaking(true);});
}
}
function renderReport(box,rep){
box.textContent='';
var badge=rep.aiTask?el('b','',rep.headline):el('div','rep-badge lvl-'+rep.level,rep.headline);
if(rep.score!=null&&!rep.aiTask)badge.appendChild(el('div','rep-sub','Risk signals: '+rep.score+'/100 (a count of warning signs, not a probability)'));
box.appendChild(badge);
if(rep.items&&rep.items.length){
var ul=el('ul','rep-list');
rep.items.forEach(function(it){var li=el('li','rep-item sev-'+(rep.aiTask?'info':it.sev));li.appendChild(el('b','',it.title));if(it.detail)li.appendChild(el('div','',it.detail));ul.appendChild(li);});
box.appendChild(ul);
}
(rep.nodes||[]).forEach(function(n){box.appendChild(n);});
if(rep.links&&rep.links.length){
var lk=el('div','rep-links');
rep.links.forEach(function(l){var a=el('a','',l.label);a.href=safeUrl(l.url);a.target='_blank';a.rel='noopener noreferrer';lk.appendChild(a);});
box.appendChild(lk);
}
if(rep.note)box.appendChild(el('div','rep-note',rep.note));
if(rep.aiTask)box.appendChild(aiRisk(rep.aiTask,function(){return{text:String(rep.aiText||rep.headline).slice(0,5000)};}));else if(rep.ai)attachAi(box,rep.ai);
}
function attachAi(box,ai){
var wrap=el('div','rep-ai');box.appendChild(wrap);
getCap('sample').then(async function(sm){
if(!sm||!wrap.isConnected)return;
if(ai.kind==='image'){
try{var lim=await sm.limits();if(!(lim&&lim.images&&lim.images.mediaTypes.indexOf(ai.file.type)!==-1&&ai.file.size<=lim.images.maxInputBytes))return;}catch(e){return;}
}
var btn=el('button','rep-ai-btn','🤖 Ask Claude for a second opinion');btn.type='button';
var out=el('div','rep-ai-box');out.hidden=true;
btn.onclick=function(){askClaude(sm,ai,btn,out);};
wrap.appendChild(btn);wrap.appendChild(out);
});
}


function renderAi(out,d){
out.textContent='';
if(!d||typeof d!=='object'){out.textContent='Claude returned an unexpected answer.';return;}
var names={likely_scam:'Likely a scam',suspicious:'Suspicious',probably_ok:'Probably fine',unclear:'Unclear',likely_ai:'Looks AI-generated',likely_real:'Looks like a real photo'};
var v=String(d.verdict||'unclear');
out.appendChild(el('b','',(names[v]||'Unclear')+(d.confidence?' · confidence: '+String(d.confidence).slice(0,12):'')));
if(d.summary){var sm=el('div','',String(d.summary).slice(0,600));sm.style.marginTop='4px';out.appendChild(sm);}
var list=Array.isArray(d.reasons)?d.reasons:(Array.isArray(d.observations)?d.observations:[]);
if(list.length){var ul=el('ul','');ul.style.cssText='margin:6px 0 0 18px;padding:0;';list.slice(0,6).forEach(function(r){ul.appendChild(el('li','',String(r).slice(0,300)));});out.appendChild(ul);}
if(d.advice){var ad=el('div','',String(d.advice).slice(0,300));ad.style.marginTop='6px';out.appendChild(ad);}
if(d.caveat){var cv=el('div','',String(d.caveat).slice(0,300));cv.style.cssText='margin-top:6px;opacity:.8;';out.appendChild(cv);}
out.appendChild(el('div','rep-note','This is an AI opinion based on what it could see. It is not proof.'));
}
function trendKeywords(items){
var count={};
items.forEach(function(h){
var seen={};
(String(h.t||'').match(/[A-Za-z][A-Za-z0-9+#.\-]{2,}/g)||[]).forEach(function(w){
var k=w.toLowerCase().replace(/[.\-]+$/,'');
if(k.length<3||TREND_STOP.test(k)||seen[k])return;seen[k]=1;count[k]=(count[k]||0)+1;
});
});
return Object.keys(count).filter(function(k){return count[k]>=2;}).sort(function(x,y){return count[y]-count[x];}).slice(0,4)
.map(function(k){return k.charAt(0).toUpperCase()+k.slice(1);});
}
function renderTrending(){
var scroll=document.getElementById('trendingScroll'),bar=document.getElementById('trendingBar');
scroll.textContent='';
var list=trendWiki.map(function(t){return{t:t,tip:trendTip||'Among the most-read Wikipedia articles yesterday'};})
.concat(trendTech.map(function(t){return{t:t,tip:'On the front page of Hacker News right now'};}));
if(!list.length){
var n=el('div','','Trending needs a live connection and is not available here. It loads by itself when one works.');
n.style.cssText='font-size:11px;opacity:.7;padding:6px 2px;';scroll.appendChild(n);
}
list.forEach(function(x){
var chip=el('div','trending-chip',x.t);chip.title=x.tip;chip.setAttribute('role','button');chip.tabIndex=0;
function go(){document.getElementById('q').value=x.t;doSearch();}
chip.onclick=go;chip.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};
scroll.appendChild(chip);
});
bar.classList.add('show');
}
function loadTrending(){
function day(off){var d=new Date(Date.now()-off*86400000);return d.getUTCFullYear()+'/'+('0'+(d.getUTCMonth()+1)).slice(-2)+'/'+('0'+d.getUTCDate()).slice(-2);}
function top(lang,off){
return apiFetch('https://wikimedia.org/api/rest_v1/metrics/pageviews/top/'+lang+'.wikipedia/all-access/'+day(off),{timeout:7000})
.then(function(r){if(!r.ok)throw new Error('http');return r.json();})
.then(function(d){
return((d.items&&d.items[0]&&d.items[0].articles)||[])
.filter(function(a){return!/^(Main_Page|Начална_страница|Special:|Wikipedia:|Уикипедия:|Portal:|Help:|File:|Category:|Talk:|Template:|User:|Служебна:|Заглавна_страница|-$)/.test(a.article)&&!/^(Special|Служебна|Спец)/i.test(a.article);})
.map(function(a){return a.article.replace(/_/g,' ');});
});
}
function get(lang){return top(lang,1).catch(function(){return top(lang,2);}).catch(function(){return top(lang,3);}).catch(function(){return[];});}
var ul=String(navigator.language||'en').slice(0,2).toLowerCase(),langs=['en'];if(ul!=='en'&&/^[a-z]{2,3}$/.test(ul))langs.push(ul);
function shortT(t){t=String(t||'').replace(/\s+/g,' ').trim();if(t.length>46)t=t.slice(0,44).replace(/\s+\S*$/,'')+'…';return t;}
var hn=apiFetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=14',{timeout:7000}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){return(j.hits||[]).map(function(h){return shortT(h.title);}).filter(function(t){return t.length>6;});}).catch(function(){return[];});
var EVER=['artificial intelligence','climate change','space exploration','electric cars','cybersecurity','renewable energy','quantum computing','vaccines','ocean life','the Moon','Mars','volcanoes','black holes','recycling','robotics','the human brain','coffee','chess','dinosaurs','the Olympic Games','solar eclipse','earthquakes','privacy online','fake news'];
Promise.all([Promise.all(langs.map(get)),hn]).then(function(r){
var w=[];r[0].forEach(function(arr,i){w=w.concat(arr.slice(0,i?3:5));});trendWiki=w;
trendTech=(trendTech&&trendTech.length&&!r[1].length)?trendTech:r[1].slice(0,6);
if(!trendWiki.length&&!trendTech.length){var h=Math.floor(Date.now()/3600000),o=[];for(var i=0;i<8;i++)o.push(EVER[(h*3+i*3)%EVER.length]);trendWiki=o;trendTip='Popular topic';}else trendTip='';
}).then(renderTrending);
if(!trendTimer)trendTimer=setInterval(function(){if(!document.hidden)loadTrending();},600000);
}
function measureBars(){
var h=document.querySelector('.header'),sb=document.querySelector('.search-header'),root=document.documentElement.style;
if(h)root.setProperty('--hh',h.offsetHeight+'px');
if(sb)root.setProperty('--sh',sb.offsetHeight+'px');
}
function apiFetch(p,o){
o=Object.assign({credentials:'same-origin'},o||{});if(!cacheOK()&&!o.cache)o.cache='no-store';
var ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort();},o.timeout||5000);
var ext=o.signal;delete o.timeout;if(ctl){o.signal=ctl.signal;if(ext){if(ext.aborted)ctl.abort();else ext.addEventListener('abort',function(){ctl.abort();});}}
return fetch(p,o).then(function(r){clearTimeout(t);return r;},function(e){clearTimeout(t);throw e;});
}
function initApi(){
loadBreaking();
if(!/^https?:$/.test(location.protocol)||!window.fetch)return;
apiFetch('/api/config',{timeout:3500}).then(function(r){
if(!r.ok||!/json/.test(r.headers.get('content-type')||''))throw new Error('no api');return r.json();
}).then(function(c){API.ok=true;API.urlCheck=!!c.urlCheck;API.country=c.country||'';API.ai=!!c.ai;API.stt=!!c.stt;API.geo=c.geo||null;if(window.wxGeoInit)wxGeoInit();API.done=true;}).catch(function(){API.done=true;});
}

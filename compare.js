/* AI INFORMATION - compare.js
   weekly report helpers, Compare Two Sources.
   Only function declarations: they are called later by app.js (loaded last). */

/* ---- LOW DATA MODE ---- */
function LOW(){return store.get('ai_lowdata')==='1';}
function setLow(on){store.set('ai_lowdata',on?'1':'0');document.body.classList.toggle('lowdata',!!on);var b=$('lowBtn');if(b){b.classList.toggle('on',!!on);b.textContent=on?'📶 Low data: ON':'📶 Low data';}}
/* ---- WEEKLY SECURITY REPORT ---- */
function weekKey(d){d=d||new Date();var t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);var y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+Math.ceil(((t-y)/864e5+1)/7);}
function weeklyDue(d){d=d||new Date();var g=d.getDay();return(g===6||g===0)&&store.get('ai_weekly_seen')!==weekKey(d);}
function weeklyFetch(){
return xget('digest',{},25000).catch(function(){
var now=Math.floor(Date.now()/1000),from=now-7*86400;
var qs={scams:'phishing scam',vulns:'vulnerability CVE breach ransomware',privacy:'privacy tracking'};
var out={from:from,to:now,sections:{scams:[],vulns:[],privacy:[]},sources:['Hacker News'],total:0,fallback:true};
return Promise.all(Object.keys(qs).map(function(k){
return fetch('https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=6&numericFilters='+encodeURIComponent('created_at_i>'+from)+'&query='+encodeURIComponent(qs[k])).then(function(r){return r.json();}).then(function(j){
(j.hits||[]).forEach(function(h){if(h.title)out.sections[k].push({title:h.title,url:h.url||('https://news.ycombinator.com/item?id='+h.objectID),text:'',t:h.created_at_i,source:'Hacker News'});});
}).catch(function(){});
})).then(function(){out.total=out.sections.scams.length+out.sections.vulns.length+out.sections.privacy.length;if(!out.total)throw new Error('none');return out;});
});
}
function weeklyText(d){
var f=function(t){return new Date(t*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
var o='WEEKLY SECURITY REPORT\n'+f(d.from)+' - '+f(d.to)+'\n\n'+(d.ai?d.ai+'\n\n':'');
Object.keys(WK_TITLES).forEach(function(k){o+=WK_TITLES[k]+'\n';var a=(d.sections&&d.sections[k])||[];if(!a.length)o+='  (nothing found this week)\n';a.forEach(function(x){o+='  - '+x.title+' ['+x.source+']\n    '+x.url+'\n';});o+='\n';});
return o+'Sources: '+((d.sources||[]).join(', ')||'-')+'\nHeadlines are quoted from these sites and were not verified by this tool.\n';
}
function cmpWords(t){return(String(t).toLowerCase().match(/[\p{L}\p{N}]{2,}/gu)||[]);}
function cmpSentences(t){return String(t).replace(/\s+/g,' ').split(/(?<=[.!?…])\s+(?=[\p{Lu}\p{N}"„«(])/u).map(function(x){return x.trim();}).filter(function(x){return x.length>=30&&x.length<=400;});}
function cmpNums(t){
var out={},m,re=/(?:[$€£]\s?)?\d[\d.,]*\d|\d/g;
var src=String(t);
while((m=re.exec(src))){
var raw=m[0],after=src.slice(m.index+raw.length,m.index+raw.length+14).toLowerCase(),before=src.slice(Math.max(0,m.index-1),m.index);
var unit=/^\s?(%|percent|per cent|million|billion|trillion|thousand|млн|млрд|хил|лв|евро|долар|euro|dollar|usd|eur|bgn|km|kg|years?|години|души|people|deaths|killed|жертви)/.exec(after);
var digits=raw.replace(/\D/g,'');
if(!unit&&!/^[$€£]/.test(raw)&&digits.length<3)continue;
if(/^\d{4}$/.test(raw)&&Number(raw)>=1900&&Number(raw)<=2100&&!unit)continue;
var norm=raw.replace(/[$€£\s]/g,'').replace(/[.,]$/,'').replace(/,/g,'.')+(unit?unit[1].replace(/\s/g,''):'');
out[norm]=1;
}
return out;
}
function cmpEntities(t){
var out={},m,re=/\p{Lu}[\p{L}'’-]{2,}(?:\s+\p{Lu}[\p{L}'’-]{2,}){0,3}/gu,bad={the:1,this:1,that:1,these:1,those:1,they:1,when:1,what:1,where:1,while:1,after:1,before:1,here:1,there:1,some:1,many:1,also:1,but:1,and:1,for:1,with:1,from:1,his:1,her:1,she:1,monday:1,tuesday:1,wednesday:1,thursday:1,friday:1,saturday:1,sunday:1,това:1,този:1,тази:1,които:1,когато:1,след:1,преди:1,както:1};
var lowTxt=String(t);while((m=re.exec(t))){var k=m[0].trim();if(bad[k.toLowerCase()]||k.length<4)continue;if(k.indexOf(' ')===-1){if(k===k.toUpperCase())continue;var lw=k.toLowerCase();if(new RegExp('(?<![\\p{L}])'+lw+'(?![\\p{L}])','u').test(lowTxt))continue;if(m.index===0||/[.!?…]\s*$/.test(lowTxt.slice(Math.max(0,m.index-3),m.index)))continue;}out[k]=(out[k]||0)+1;}
return out;
}
function cmpTone(text){
var w=cmpWords(text),n=Math.max(1,w.length),low=String(text).toLowerCase(),cnt=function(list){var c=0;list.forEach(function(x){var m=low.match(new RegExp('(?<![\\p{L}])'+x+'(?![\\p{L}])','gu'));if(m)c+=m.length;});return c;};
var letters=String(text).replace(/[^\p{L}]/gu,''),up=0;for(var i=0;i<letters.length;i++){var ch=letters.charAt(i);if(ch!==ch.toLowerCase()&&ch===ch.toUpperCase())up++;}
var per=function(c){return Math.round(c*10000/n)/10;};
return{words:w.length,emo:per(cnt(CMP_EMO)),abs:per(cnt(CMP_ABS)),hedge:per(cnt(CMP_HEDGE)),attr:per(cnt(CMP_ATTR)),excl:(String(text).match(/!/g)||[]).length,caps:letters.length?Math.round(up*100/letters.length):0};
}
function cmpTopics(text){
var f={};cmpWords(text).forEach(function(w){if(w.length<5||CMP_STOP[w]||/^\d+$/.test(w))return;f[w]=(f[w]||0)+1;});
return Object.keys(f).filter(function(k){return f[k]>=2;}).sort(function(a,b){return f[b]-f[a];}).slice(0,25);
}
function cmpOverlap(a,b){
var wa=cmpWords(a).slice(0,6000),wb=cmpWords(b).slice(0,6000);if(wa.length<20||wb.length<20)return null;
function sh(w){var s={};for(var i=0;i+2<w.length;i++)s[w[i]+' '+w[i+1]+' '+w[i+2]]=1;return s;}
var A=sh(wa),B=sh(wb),inter=0,na=0,nb=0,k;for(k in A){na++;if(B[k])inter++;}for(k in B)nb++;
var uni=na+nb-inter;return uni?Math.round(inter*100/uni):0;
}
function cmpSets(a,b){var both=[],onlyA=[],onlyB=[];Object.keys(a).forEach(function(k){(b[k]?both:onlyA).push(k);});Object.keys(b).forEach(function(k){if(!a[k])onlyB.push(k);});return{both:both,a:onlyA,b:onlyB};}
function cmpConflicts(ta,tb){
var sa=cmpSentences(ta).slice(0,120),sb=cmpSentences(tb).slice(0,120),res=[];
var pre=function(s){var w={};cmpWords(s).forEach(function(x){if(x.length>=4&&!CMP_STOP[x]&&!/^\d+$/.test(x))w[x]=1;});return w;};
var pb=sb.map(function(s){return{s:s,w:pre(s),n:Object.keys(cmpNums(s))};});
sa.forEach(function(s){
var na=Object.keys(cmpNums(s));if(!na.length)return;var wa=pre(s),wl=Object.keys(wa).length;if(wl<4)return;
var best=null,bs=0;
pb.forEach(function(o){if(!o.n.length)return;var c=0;for(var k in wa)if(o.w[k])c++;var sc=c/Math.max(wl,Object.keys(o.w).length);if(sc>bs){bs=sc;best=o;}});
if(best&&bs>=0.3){var shared=na.filter(function(x){return best.n.indexOf(x)!==-1;});if(!shared.length)res.push({a:s,b:best.s,score:bs});}
});
res.sort(function(x,y){return y.score-x.score;});return res.slice(0,4);
}
function cmpUnique(text,otherNums,otherEnts){
var out=[];
cmpSentences(text).forEach(function(s){
var n=Object.keys(cmpNums(s)).filter(function(x){return !otherNums[x];}),e=Object.keys(cmpEntities(s)).filter(function(x){return !otherEnts[x];});
if(n.length||e.length>=2)out.push({s:s,w:n.length*2+e.length});
});
out.sort(function(x,y){return y.w-x.w;});var seen={};return out.filter(function(x){if(seen[x.s])return false;seen[x.s]=1;return true;}).slice(0,4).map(function(x){return x.s;});
}
function compareTexts(ta,tb){
var na=cmpNums(ta),nb=cmpNums(tb),ea=cmpEntities(ta),eb=cmpEntities(tb);
var nums=cmpSets(na,nb),ents=cmpSets(ea,eb);
var tpa=cmpTopics(ta),tpb=cmpTopics(tb);
return{overlap:cmpOverlap(ta,tb),nums:nums,ents:ents,conflicts:cmpConflicts(ta,tb),uniqA:cmpUnique(ta,nb,eb),uniqB:cmpUnique(tb,na,ea),toneA:cmpTone(ta),toneB:cmpTone(tb),topicsBoth:tpa.filter(function(x){return tpb.indexOf(x)!==-1;}).slice(0,10)};
}
function cmpKey(text){
var ss=cmpSentences(text),pick=[],seen={};
function add(s){if(s&&!seen[s]&&pick.length<4){seen[s]=1;pick.push(s);}}
ss.filter(function(s){return s.length>=60;}).slice(0,2).forEach(add);
ss.map(function(s){return{s:s,w:Object.keys(cmpNums(s)).length*2+Object.keys(cmpEntities(s)).length};}).sort(function(a,b){return b.w-a.w;}).slice(0,3).forEach(function(x){if(x.w>0)add(x.s);});
return pick;
}
function cmpAgree(ta,tb){
var sa=cmpSentences(ta).slice(0,120),sb=cmpSentences(tb).slice(0,120),res=[],used={};
sa.forEach(function(s){
var na=Object.keys(cmpNums(s));if(!na.length)return;
for(var i=0;i<sb.length;i++){var nb=cmpNums(sb[i]);if(na.some(function(x){return nb[x];})){if(!used[i]){used[i]=1;res.push({a:s,b:sb[i]});}break;}}
});
return res.slice(0,3);
}
function wikiClient(link){
var m=/^https?:\/\/([a-z-]{2,12})\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)/i.exec(link);if(!m)return null;
return fetch('https://'+m[1].toLowerCase()+'.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&origin=*&titles='+m[2]).then(function(r){return r.json();}).then(function(j){
var p=j.query&&j.query.pages,k=p&&Object.keys(p)[0],pg=p&&p[k];if(!pg||!pg.extract||pg.extract.length<200)throw new Error('empty');
return{title:pg.title+' · Wikipedia',text:pg.extract.slice(0,20000),url:link,via:'page'};});
}

function cmpDays(){
var box=el('div','v9-card');box.setAttribute('data-ft','aibtn');box.style.cssText='margin:16px 0;padding:12px;line-height:1.5';
box.appendChild(el('b','','📅 Same topic, two different days (AI)'));
box.appendChild(el('div','v9-note','When you search in Standard Search, this device keeps the top results of each topic for each day (only on your device, up to 8 days and 25 topics). Pick a topic and two days, and an AI model tells what changed. Search the same topic on two different days to use it.'));
var S=jget('ai_v9_snaps',{}),topics=Object.keys(S||{}).filter(function(k){return Object.keys(S[k]||{}).length>=2;});
if(!topics.length){box.appendChild(el('div','v9-note','Nothing to compare yet: no topic has been searched on two different days.'));return box;}
function sel(){var x=document.createElement('select');x.style.cssText='width:100%;box-sizing:border-box;padding:10px;margin:6px 0;border-radius:10px;border:1px solid var(--border2);background:var(--bg2);color:var(--text)';return x;}
var ts=sel(),da=sel(),db=sel();ts.setAttribute('aria-label','Topic');da.setAttribute('aria-label','Earlier day');db.setAttribute('aria-label','Later day');
topics.forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=k;ts.appendChild(o);});
function fillDays(){var ds=Object.keys(S[ts.value]||{}).sort();[da,db].forEach(function(x,j){x.textContent='';ds.forEach(function(d){var o=document.createElement('option');o.value=d;o.textContent=(j?'Later: ':'Earlier: ')+d;x.appendChild(o);});});da.value=ds[0];db.value=ds[ds.length-1];}
ts.onchange=fillDays;fillDays();box.appendChild(ts);box.appendChild(da);box.appendChild(db);
function blk(L,d){var a=(S[ts.value]||{})[d]||[];return 'Day '+L+' ('+d+'):\n'+a.map(function(r,i){return(i+1)+'. '+r[0]+' — '+r[1]+' ['+r[2]+']';}).join('\n');}
box.appendChild(aiBlock('📅 Compare the two days','compare_days',function(){var a=da.value,b2=db.value;if(!a||!b2||a===b2)return 'Pick two different days.';var x=a<b2?a:b2,y=a<b2?b2:a;return{text:'Topic: '+ts.value+'\n\n'+blk('A',x)+'\n\n'+blk('B',y)};},{hint:'The AI reads only the saved titles and short descriptions. It can be wrong and does not decide what is true.'}));
return box;
}
function openCompare(){
var b=$('v9CmpBody');openPanel('v9Cmp');
if(b.dataset.ready){var f0=b.querySelector('textarea');if(f0)f0.focus();return;}b.dataset.ready='1';b.textContent='';
var warn=el('div','');warn.style.cssText='margin:0 0 10px;padding:12px;border-radius:10px;border:1.5px solid #ffaa00;background:var(--bg2);font-size:13px;line-height:1.55';
var wb=el('b','','⚠️ Paste the exact link to an article, not a website home page.');warn.appendChild(wb);
warn.appendChild(el('div','','Good: https://site.com/news/2026/title-of-the-story'));warn.appendChild(el('div','','Not good: https://site.com (the front page changes all day and mixes many topics).'));
var w3=el('div','','If you do paste a home page or a section page, the tool shows a general overview of what that page lists right now instead of a story-by-story comparison.');w3.style.marginTop='4px';warn.appendChild(w3);b.appendChild(warn);
b.appendChild(el('div','v9-note','Paste two links about the same topic and press Enter. The page reads both, quotes the key passages and shows what they agree on and where they differ. You can paste article text instead of a link. It does not decide which one is right.'));
var ta=[],st=[];
['A','B'].forEach(function(L){
var l=el('div','v9-note','Link '+L);l.style.cssText='margin:14px 0 10px;font-weight:700;line-height:1.3';b.appendChild(l);
var t=el('textarea');t.rows=2;t.maxLength=20000;t.placeholder='https://… (or paste text)';t.autocapitalize='off';t.spellcheck=false;t.setAttribute('enterkeyhint','go');t.setAttribute('aria-label','Link '+L);t.style.cssText='display:block;box-sizing:border-box;width:100%;margin:0 0 6px;padding:12px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-size:16px;resize:vertical';
t.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run();}});
b.appendChild(t);ta.push(t);var s=el('div','v9-note','');b.appendChild(s);st.push(s);
});
var go=mkBtn('⚖️ Compare','pri',run);go.style.marginTop='10px';b.appendChild(go);
var out=el('div');out.style.marginTop='12px';b.appendChild(out);
b.appendChild(cmpDays());
var busy=false;
function isLink(v){v=v.trim();return v.length<1000&&!/\s/.test(v)&&(/^https?:\/\//i.test(v)||v.indexOf('.')>0);}
function load(i){
var v=ta[i].value.trim(),L='AB'.charAt(i);
if(!v)return Promise.reject(new Error('Fill in both fields.'));
if(!isLink(v)){if(v.length<200)return Promise.reject(new Error('Link '+L+' does not look like a web address, and the text is too short. Paste a link starting with https:// or at least a few paragraphs.'));st[i].textContent='Pasted text ('+cmpWords(v).length+' words)';return Promise.resolve({title:'Text '+L,text:v,pasted:true});}
var link=/^https?:\/\//i.test(v)?v:'https://'+v;
st[i].textContent='⏳ Reading the page…';
function fail(e){
var msg=e&&e.message;
if(msg==='needs-server')return new Error('This link needs the Worker or server to be read. Only Wikipedia links work without it. Paste the article text instead.');
return new Error('Link '+L+': '+(msg&&msg!=='Failed to fetch'?msg:'could not read the page')+'. Paste the article text instead.');
}
return xget('article',{url:link},45000).then(function(j){st[i].textContent=(j.kind==='index'?'ℹ️ Home or section page: ':'✓ ')+(j.title||j.url)+(j.via&&j.via!=='page'?' (read from '+(j.via==='archive'?'a saved copy':'a text reader')+')':'');return{title:j.title||j.url,text:j.text,url:j.url,via:j.via,kind:j.kind,overview:j.overview};}).catch(function(e){
var w=wikiClient(link);
if(w)return w.then(function(r){st[i].textContent='✓ '+r.title;return r;},function(){throw fail(e);});
throw fail(e);
});
}
function run(){
if(busy)return;busy=true;go.disabled=true;out.textContent='';try{document.activeElement&&document.activeElement.blur();}catch(e){}
out.appendChild(el('div','v9-note','⏳ Reading both sources… this can take up to 30 seconds.'));
Promise.all([load(0),load(1)]).then(function(r){out.textContent='';render(r[0],r[1],compareTexts(r[0].text,r[1].text));logAct('compare',r[0].title+' vs '+r[1].title);
var ab=aiBlock('🤖 Compare with AI','compare',function(){return{text:'Source A ('+String(r[0].title||'').slice(0,120)+'):\n'+String(r[0].text||'').slice(0,2800)+'\n\nSource B ('+String(r[1].title||'').slice(0,120)+'):\n'+String(r[1].text||'').slice(0,2800)};},{hint:'AI mode: an AI model reads the start of both sources and says where they agree and differ. It does not decide which one is true.'});out.appendChild(ab);
}).catch(function(e){out.textContent='';out.appendChild(el('div','v9-note','⚠️ '+e.message));}).then(function(){busy=false;go.disabled=false;});
}
function sec(title,color){var h=el('h3','',title);h.style.cssText='margin:18px 0 6px;color:'+(color||'var(--accent2)');out.appendChild(h);}
function chips(list){var d=el('div');d.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px';list.slice(0,14).forEach(function(x){var c=el('span','v9-note',x);c.style.cssText='padding:4px 9px;border:1px solid var(--border2);border-radius:14px;background:var(--bg2)';d.appendChild(c);});if(!list.length)d.appendChild(el('span','v9-note','none'));return d;}
function quote(t,label){var c=el('div','v9-card');if(label){var lb=el('b','',label);lb.style.fontSize='12px';c.appendChild(lb);}var q=el('div','',t);q.style.cssText='margin-top:3px;line-height:1.55;font-size:14px;border-left:3px solid var(--accent);padding-left:10px;font-style:italic;word-break:break-word';c.appendChild(q);c.style.marginBottom='6px';return c;}
function linkTo(x,txt){var a=el('a','',txt);a.href=safeUrl(x);a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin:2px 0 6px;color:var(--accent2)';return a;}
function render(A,B,r){
out.textContent='';
var box=el('div');box.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:14px';out.appendChild(box);
var tmp=out;out=box;
var hd=el('h3','','📖 Summary of both sources');hd.style.cssText='margin:0 0 4px;color:var(--accent2)';out.appendChild(hd);
if(r.overlap!==null)out.appendChild(el('div','v9-note','The two texts share about '+r.overlap+'% of their wording. Low overlap is normal for independent reports.'));
if(A.kind==='index'||B.kind==='index'){var iw=el('div','','⚠️ '+(A.kind==='index'&&B.kind==='index'?'Both links are home or section pages.':'Link '+(A.kind==='index'?'A':'B')+' is a home or section page.')+' The comparison below is general: it covers what the page lists today, not one story. For a precise comparison paste the exact link of an article.');iw.style.cssText='margin:8px 0;padding:10px;border-radius:8px;border:1.5px solid #ffaa00;font-size:13px;line-height:1.5';out.appendChild(iw);}
[['A',A],['B',B]].forEach(function(x){
if(x[1].kind==='index'){
sec('ℹ️ '+x[0]+': general overview of '+String(x[1].title||x[1].url||'this page').slice(0,80),'var(--gold)');
var ov=x[1].overview||{},hl=(ov.headlines||[]).slice(0,6);
if(ov.description)out.appendChild(quote(ov.description,'What the site says about itself'));
if(hl.length){out.appendChild(el('div','v9-note','Headlines on the page right now'));hl.forEach(function(h){out.appendChild(quote(h));});}
else if(!ov.description)cmpKey(x[1].text).forEach(function(s){out.appendChild(quote(s));});
out.appendChild(el('div','v9-note','A home page changes all day. Treat this as a snapshot of what the page shows now.'));
if(x[1].url)out.appendChild(linkTo(x[1].url,'Open page '+x[0]+' ↗'));
return;}
sec('📰 '+x[0]+': '+String(x[1].title||'').slice(0,90),'var(--gold)');
cmpKey(x[1].text).forEach(function(s){out.appendChild(quote(s));});
if(x[1].url)out.appendChild(linkTo(x[1].url,'Open source '+x[0]+' ↗'));
});
var ag=cmpAgree(A.text,B.text);
sec('✅ What both report','var(--accent)');
if(ag.length){ag.forEach(function(p){var w=el('div');w.appendChild(quote(p.a,'A'));w.appendChild(quote(p.b,'B'));out.appendChild(w);});}
else out.appendChild(el('div','v9-note','No sentence with the same figure appears in both.'));
if(r.nums.both.length){out.appendChild(el('div','v9-note','Figures in both'));out.appendChild(chips(r.nums.both));}
if(r.ents.both.length){out.appendChild(el('div','v9-note','Names and places in both'));out.appendChild(chips(r.ents.both));}
sec('⚠️ Where they differ','#ff8800');
if(r.conflicts.length){out.appendChild(el('div','v9-note','Similar sentences with different figures:'));r.conflicts.forEach(function(c){var w=el('div');w.appendChild(quote(c.a,'A says'));w.appendChild(quote(c.b,'B says'));out.appendChild(w);});}
[['A',r.nums.a,r.ents.a,r.uniqA],['B',r.nums.b,r.ents.b,r.uniqB]].forEach(function(x){
if(!x[1].length&&!x[2].length&&!x[3].length)return;
var h=el('div','v9-note','Only in '+x[0]);h.style.cssText='font-weight:700;margin-top:10px';out.appendChild(h);
if(x[1].length){out.appendChild(el('div','v9-note','Figures'));out.appendChild(chips(x[1]));}
if(x[2].length){out.appendChild(el('div','v9-note','Names and places'));out.appendChild(chips(x[2]));}
x[3].slice(0,2).forEach(function(s){out.appendChild(quote(s,'Only '+x[0]+' says'));});
});
sec('🎭 Wording','var(--accent2)');
var ta2=r.toneA,tb2=r.toneB,note=[];
if(ta2.emo>=tb2.emo*2&&ta2.emo>=1)note.push('A uses noticeably more emotional wording.');if(tb2.emo>=ta2.emo*2&&tb2.emo>=1)note.push('B uses noticeably more emotional wording.');
if(ta2.attr>=tb2.attr*2&&ta2.attr>=2)note.push('A names its sources more often.');if(tb2.attr>=ta2.attr*2&&tb2.attr>=2)note.push('B names its sources more often.');
if(ta2.hedge>=tb2.hedge*2&&ta2.hedge>=2)note.push('A is more cautious ("may", "reportedly").');if(tb2.hedge>=ta2.hedge*2&&tb2.hedge>=2)note.push('B is more cautious ("may", "reportedly").');
out.appendChild(el('div','v9-note',note.length?note.join(' '):'The wording of both is similar in tone.'));
var dt=document.createElement('details');dt.style.marginTop='6px';var sm=document.createElement('summary');sm.textContent='Show the numbers';sm.style.cursor='pointer';dt.appendChild(sm);
var rows=[['Words',ta2.words,tb2.words],['Emotional words /1000',ta2.emo,tb2.emo],['Absolute words /1000',ta2.abs,tb2.abs],['Cautious words /1000',ta2.hedge,tb2.hedge],['Attributions /1000',ta2.attr,tb2.attr],['Exclamation marks',ta2.excl,tb2.excl],['Capital letters %',ta2.caps,tb2.caps]];
var tb=document.createElement('table');tb.style.cssText='width:100%;border-collapse:collapse;font-size:13px;margin-top:6px';
var hr=document.createElement('tr');['','A','B'].forEach(function(t){var th=document.createElement('th');th.textContent=t;th.style.cssText='text-align:left;padding:6px;border-bottom:1px solid var(--border2)';hr.appendChild(th);});tb.appendChild(hr);
rows.forEach(function(r0){var tr=document.createElement('tr');r0.forEach(function(c,i){var td=document.createElement('td');td.textContent=c;td.style.cssText='padding:6px;border-bottom:1px solid var(--border2)';tr.appendChild(td);});tb.appendChild(tr);});
dt.appendChild(tb);out.appendChild(dt);
var nt=el('div','v9-note','Note: the text above is quoted from the two pages you gave. This tool counts words and numbers, so it finds differences, not truth. Check which report is first-hand and open both before drawing a conclusion.');nt.style.cssText='background:var(--bg3);border-left:3px solid var(--accent);padding:10px;border-radius:8px;margin-top:14px';out.appendChild(nt);
out=tmp;
}
}

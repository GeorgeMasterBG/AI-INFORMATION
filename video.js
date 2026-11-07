/* AI INFORMATION - video.js
   videos: cache, player, Feed cards, Reels.
   Only function declarations: they are called later by app.js (loaded last). */

function vcApplySize(mb){mb=VC_SIZES.indexOf(+mb)>-1?+mb:1024;VC.max=mb*1048576;VC.per=Math.min(3*1073741824,Math.floor(VC.max/2));VC.par=1;VC.ahead=mb<=150?1:mb<=1024?2:mb<=3072?3:mb<=5120?5:8;}
var _vcSaveT=0;function vcSave(){clearTimeout(_vcSaveT);_vcSaveT=setTimeout(function(){jset('ai_v9_vidx',VC.idx);},1500);}
function vqBucket(h){var b=0;VQL.forEach(function(L){if(h>=L*0.88)b=L;});return b||VQL[0];}
function vqPref(){var p=store.get('ai_vq');return p&&p!=='best'&&isFinite(+p)?+p:'best';}
function vqList(it){
if(it._vql)return it._vql;
var t=document.createElement('video'),a=(Array.isArray(it.qualities)?it.qualities:[]).filter(function(q){return q&&q.src&&/^https:/.test(q.src)&&q.h>0;});
a=a.filter(function(q){var ty=q.type||q.mime;if(!ty)return true;try{return t.canPlayType(ty)!=='';}catch(e){return true;}});
a.forEach(function(q){q.b=vqBucket(q.h);});
a.sort(function(x,y){return x.h-y.h;});
it._vql=a;return a;
}
function vqChoose(it,pref){
var a=vqList(it);if(!a.length)return null;
if(pref==='best')return LOW()?(a.filter(function(q){return q.b<=480;}).pop()||a[0]):a[a.length-1];
var le=a.filter(function(q){return q.b<=pref;});return le.length?le[le.length-1]:a[0];
}
function vqApply(it,pref){
var q=vqChoose(it,pref===undefined?vqPref():pref);if(!q)return null;
if(it._vqs!==q.src){it.src=q.src;if(q.mime)it.mime=q.mime;it._vqs=q.src;}
it._vqb=q.b;if(q.b>720)VQBIG[q.src]=1;return q;
}
function vqStepDown(it){
var a=vqList(it),i=-1,k;for(k=0;k<a.length;k++)if(a[k].src===it.src)i=k;
if(i<1)return false;var q=a[i-1];it.src=q.src;if(q.mime)it.mime=q.mime;it._vqs=q.src;it._vqb=q.b;toast('Could not play this quality — switched to '+VQN[q.b],'#ffaa00');return true;
}
function vqSeen(it,v){var w=v.videoWidth,h=v.videoHeight;if(!(w&&h))return 0;var sh=Math.min(w,h),b=vqBucket(sh);it._vqd=b;if(!it._vql||!it._vql.length)it._vql=[{h:sh,b:b,src:it.src,mime:it.mime||''}];return b;}
function vqFill(sel,it){
var a=vqList(it),have={},cur=String(vqPref()),best=a.length?a[a.length-1].b:0;
a.forEach(function(q){have[q.b]=1;});sel.textContent='';
var o=el('option','','Best'+(best?' ('+VQN[best].split(' ')[0]+')':''));o.value='best';sel.appendChild(o);
VQL.forEach(function(L){var x=el('option','',VQN[L]+(have[L]?(it._vqd===L?' ✓ playing':''):' — not available'));x.value=String(L);x.disabled=!have[L];sel.appendChild(x);});
sel.value=cur;if(sel.value!==cur)sel.value='best';
}
function vqSet(val){store.set('ai_vq',String(val));try{document.dispatchEvent(new Event('aivq'));}catch(e){}}
function vcURL(src){
if(!window.caches||!cacheOK())return Promise.resolve(null);
var big=!!(VC.idx[src]&&VC.idx[src].s>VC.blobMax);
if(big&&!(navigator.serviceWorker&&navigator.serviceWorker.controller))return Promise.resolve(null);
return caches.open(VC.name).then(function(c){return c.match(src);}).then(function(r){if(!r)return null;VC.idx[src]&&(VC.idx[src].t=Date.now());if(big)return '/__vc/'+encodeURIComponent(src);return r.blob().then(function(b){return b.size>VC.blobMax?null:URL.createObjectURL(b);});}).catch(function(){return null;});
}
function vcEvict(){
var tot=0,k;for(k in VC.idx)tot+=VC.idx[k].s;if(tot<=VC.max)return;
var keys=Object.keys(VC.idx).sort(function(a,b){return VC.idx[a].t-VC.idx[b].t;});
caches.open(VC.name).then(function(c){keys.forEach(function(k){if(tot<=VC.max*0.8)return;tot-=VC.idx[k].s;delete VC.idx[k];c.delete(k);});vcSave();});
}
var _vcPT=0;
function vcPump(){
/* never download while the page is being scrolled, a video is playing, or the tab is hidden: wait for a quiet moment */
if(VC.q.length&&!VC.hold){var quiet=Date.now()-(VC.lastScroll||0)>900&&!document.hidden;if(!quiet){if(!_vcPT)_vcPT=setTimeout(function(){_vcPT=0;vcPump();},700);return;}}
while(!VC.hold&&VC.busy<VC.par&&VC.q.length){
var job=VC.q.shift();VC.busy++;
(function(job){
fetch(job.src,{mode:'cors',priority:'low'}).then(function(r){
if(!r.ok||r.status!==200)throw 0;var len=parseInt(r.headers.get('content-length')||'0',10);
if(len>VC.per){try{r.body&&r.body.cancel();}catch(e){}VC.state[job.src]='big';throw 0;}
var ct=r.headers.get('content-type')||'',mt=/^(video|audio)\//.test(ct)?ct.split(';')[0]:(job.mime||'video/mp4');
if((len>VC.blobMax||!len)&&r.body&&typeof TransformStream==='function'){
/* large file: stream straight into the cache, never held in memory */
var n=0,ts=new TransformStream({transform:function(ch,ctl){n+=ch.byteLength;if(n>VC.per){ctl.error(new Error('big'));return;}ctl.enqueue(ch);}});
var hd={'content-type':mt};if(len)hd['content-length']=String(len);
return caches.open(VC.name).then(function(c){return c.put(job.src,new Response(r.body.pipeThrough(ts),{status:200,headers:hd})).then(function(){return c;});}).then(function(c){
VC.idx[job.src]={s:len||n,t:Date.now()};vcSave();vcEvict();VC.state[job.src]='ok';job.cb&&job.cb();
}).catch(function(e){try{caches.open(VC.name).then(function(c){c.delete(job.src);});}catch(x){}delete VC.idx[job.src];throw e;});
}
return r.blob().then(function(b){
if(b.size>VC.blobMax*4&&!r.body){VC.state[job.src]='big';throw 0;}
b=new Blob([b],{type:mt});return caches.open(VC.name).then(function(c){return c.put(job.src,new Response(b,{headers:{'content-type':mt}}));}).then(function(){VC.idx[job.src]={s:b.size,t:Date.now()};vcSave();vcEvict();VC.state[job.src]='ok';job.cb&&job.cb();});
});
}).catch(function(){if(!VC.state[job.src])VC.state[job.src]='fail';}).then(function(){VC.busy--;vcPump();});
})(job);
}
}
function vcWarm(src,cb,front,mime){
if(LOW()||!cacheOK())return;try{var cn=navigator.connection;if(VC.wifi&&cn&&cn.type==='cellular')return;}catch(e){}if(!window.caches||!/^https:/.test(src))return;if(VC.state[src]||VC.q.some(function(j){return j.src===src;}))return;
if(VC.idx[src]){VC.state[src]='ok';cb&&cb();return;}
var j={src:src,cb:cb,mime:mime};while(VC.q.length>=4)VC.q.pop();front?VC.q.unshift(j):VC.q.push(j);if('requestIdleCallback' in window)requestIdleCallback(vcPump,{timeout:1500});else setTimeout(vcPump,300);
}
function vPlaying(on){VC.hold=on?1:0;document.body.classList.toggle('v-busy',!!on);if(!on)vcPump();}
/* ===================== v9: video card (custom controls) ===================== */
function fmtT(s){if(!isFinite(s))return'0:00';s=Math.floor(s);var m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0');}
function controls(v,opts){
opts=opts||{};var c=el('div','vd-ctl');
function b(txt,title,fn){var x=el('button','',txt);x.type='button';x.title=title;x.setAttribute('aria-label',title);x.onclick=fn;c.appendChild(x);return x;}
var pp=b('▶','Play / pause',function(){v.paused?v.play().catch(function(){}):v.pause();});
b('⏪','Back 10 s',function(){v.currentTime=Math.max(0,v.currentTime-10);});
b('⏩','Forward 10 s',function(){v.currentTime=Math.min(v.duration||1e9,v.currentTime+10);});
if(opts.next)b('⏭','Next video',opts.next);
var seek=el('input');seek.type='range';seek.min='0';seek.max='1000';seek.value='0';seek.setAttribute('aria-label','Seek');c.appendChild(seek);
var tm=el('span','v9-note','0:00');c.appendChild(tm);
var dragging=false;seek.oninput=function(){dragging=true;if(v.duration)v.currentTime=v.duration*seek.value/1000;};seek.onchange=function(){dragging=false;};
var lastU=0;v.addEventListener('timeupdate',function(){var n=performance.now();if(n-lastU<400)return;lastU=n;if(!dragging&&v.duration)seek.value=Math.round(1000*v.currentTime/v.duration);tm.textContent=fmtT(v.currentTime)+' / '+fmtT(v.duration);});
v.addEventListener('play',function(){pp.textContent='⏸';});v.addEventListener('pause',function(){pp.textContent='▶';});
if(opts.speed){var sp=el('select','v9-sel');['0.5','0.75','1','1.25','1.5','2'].forEach(function(s){var o=el('option','',s+'×');o.value=s;sp.appendChild(o);});sp.value='1';sp.onchange=function(){v.playbackRate=parseFloat(sp.value);};c.appendChild(sp);}
if(opts.item){var qs=el('select','v9-sel');qs.title='Video quality';qs.setAttribute('aria-label','Video quality');vqFill(qs,opts.item);
var rs=el('span','v9-note vd-res','');rs.title='Quality being played';
qs.onchange=function(){vqSet(qs.value);if(opts.onQuality)opts.onQuality(qs.value);};
function det(){var b=vqSeen(opts.item,v);if(!b)return;rs.textContent='▶ '+VQN[b].split(' ')[0];rs.title='Playing '+v.videoWidth+'×'+v.videoHeight;vqFill(qs,opts.item);}
v.addEventListener('loadedmetadata',det);v.addEventListener('resize',det);
var sync=function(){if(!document.body.contains(qs)){document.removeEventListener('aivq',sync);return;}vqFill(qs,opts.item);};document.addEventListener('aivq',sync);c.appendChild(qs);c.appendChild(rs);}
if(opts.dl)b('⬇️','Download',opts.dl);
var fsBtn=b('⛶','Full screen',function(){
var t=v.closest('.vd-card')||v.parentNode,cur=document.fullscreenElement||document.webkitFullscreenElement;
if(cur){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}return;}
if(!t.querySelector('.vd-exit')){var x=el('button','vd-exit','✕ Exit full screen');x.type='button';x.setAttribute('aria-label','Exit full screen');x.onclick=function(e){e.stopPropagation();try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(_){}};t.appendChild(x);}
if(!t._idle){t._idle=1;t._wake=idleHide(t,3000,function(){return !!v.paused;},true);}
(t.requestFullscreen||t.webkitRequestFullscreen||function(){v.webkitEnterFullscreen&&v.webkitEnterFullscreen();}).call(t);
});
return c;
}
function videoCard(it,opts){
opts=opts||{};vqApply(it);var card=el('div','vd-card');var v=document.createElement('video');v.playsInline=true;v.preload='none';v.disablePictureInPicture=false;v.setAttribute('playsinline','');v.setAttribute('disableremoteplayback','');if(it.thumb&&!LOW())v.poster=it.thumb;
var wrap=el('div','vd-wrap'),spin=el('div','v9-spin');spin.setAttribute('role','status');spin.setAttribute('aria-label','Loading');wrap.appendChild(v);wrap.appendChild(spin);card.appendChild(wrap);
function busy(x){wrap.classList.toggle('loading',!!x);}
['loadstart','waiting','stalled','seeking'].forEach(function(n){v.addEventListener(n,function(){if(card._started&&(v.src||v.currentSrc))busy(true);});});['canplay','playing','loadeddata','error','seeked','pause','emptied'].forEach(function(n){v.addEventListener(n,function(){if(n!=='pause'||v.readyState>=3)busy(false);});});
var tag=el('span','vd-cached',''),blobU=null,on=false,stallT=0;
v.addEventListener('play',function(){[].forEach.call(document.querySelectorAll('.vd-card video'),function(o){if(o!==v)o.pause();});vPlaying(true);logAct('video','play '+it.title);});
v.addEventListener('pause',function(){vPlaying(false);});v.addEventListener('ended',function(){vPlaying(false);});
v.addEventListener('waiting',function(){clearTimeout(stallT);stallT=setTimeout(function(){if(v.paused||v.readyState>2)return;var t=v.currentTime,s0=v.currentSrc;v.load();v.addEventListener('loadedmetadata',function f(){v.removeEventListener('loadedmetadata',f);try{v.currentTime=t;}catch(e){}v.play().catch(function(){});});},9000);});
v.addEventListener('playing',function(){clearTimeout(stallT);});
v.addEventListener('timeupdate',function(){if(v.currentTime>0.5)card._pos=v.currentTime;});v.addEventListener('ended',function(){card._pos=0;});
v.addEventListener('loadedmetadata',function(){var p=card._pos||0;if(p>0.5&&Math.abs(v.currentTime-p)>1){try{v.currentTime=p;}catch(e){}}});
function attach(){
if(on)return;on=true;if(card._started)busy(true);vqApply(it);
vcURL(it.src).then(function(u){
if(!on){if(u)URL.revokeObjectURL(u);return;}
if(u){blobU=u;v.src=u;tag.textContent='⚡ cached';}
else if(LOW()&&!card._forced){busy(false);tag.textContent='📶 low data';var lb=mkBtn('⬇️ Load video (uses data)','pri',function(){card._forced=true;lb.remove();on=false;attach();});lb.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3';wrap.appendChild(lb);}
else if(!netUp()){busy(false);tag.textContent='📴 not saved offline';}
else{v.src=it.src;v.preload='metadata';
card._warm=function(){vcWarm(it.src,function(){tag.textContent='⚡ cached';},opts.front,it.mime);};
setTimeout(function(){if(on&&v.paused&&!card._wd)card._warm();},1200);}
});
}
function detach(){
if(!on||!v.paused)return;on=false;clearTimeout(stallT);
busy(false);v.removeAttribute('src');v.preload='none';try{v.load();}catch(e){}
if(blobU){URL.revokeObjectURL(blobU);blobU=null;}
}
card._on=attach;card._off=detach;
/* nothing loads or spins until the visitor presses start; after the press the video starts by itself */
var startB=el('button','v9-btn','▶');startB.type='button';startB.setAttribute('aria-label','Start video');startB.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;width:64px;height:64px;border-radius:50%;font-size:26px;cursor:pointer';
wrap.style.position='relative';wrap.appendChild(startB);
startB.onclick=function(){startB.remove();card._forced=true;card._started=true;attach();var go=function(){var p=v.play();if(p&&p.catch)p.catch(function(){});};if(v.readyState>=2)go();else{v.addEventListener('canplay',function f(){v.removeEventListener('canplay',f);go();});setTimeout(function(){if(v.paused&&v.readyState<2){try{v.load();}catch(e){}}},12000);}};
var tried=0,failBox=null;
function failUi(){
busy(false);tag.textContent='⚠️ cannot play';if(failBox)return;
failBox=el('div','v9-note','This video cannot be played here. ');failBox.style.cssText='padding:8px 0;';
failBox.appendChild(mkBtn('↻ Retry','',function(){failBox.remove();failBox=null;tried=0;on=false;attach();}));
if(it.page){var oa=el('a','','Open original ↗');oa.href=safeUrl(it.page);oa.target='_blank';oa.rel='noopener noreferrer';failBox.appendChild(document.createTextNode(' '));failBox.appendChild(oa);}
card.appendChild(failBox);
}
function swapSrc(u,keep){
if(blobU&&!keep){URL.revokeObjectURL(blobU);blobU=null;}
v.removeAttribute('src');try{v.load();}catch(e){}
v.src=u;v.preload='metadata';busy(true);
}
v.addEventListener('error',function(){
if(!on||!v.getAttribute('src'))return;
var cur=v.getAttribute('src');
if(blobU&&cur===blobU&&tried<1){tried=1;try{caches.open(VC.name).then(function(c){c.delete(it.src);});}catch(e){}delete VC.idx[it.src];VC.state[it.src]='fail';vcSave();swapSrc(it.src);return;}
if(vqStepDown(it)){swapSrc(it.src);return;}
if(it.full&&it.full!==it.src&&cur!==it.full&&tried<2){tried=2;swapSrc(it.full);return;}
failUi();
});
card.appendChild(el('div','vd-ttl',it.title));
var meta=el('div','vd-meta',[it.source,it.license,it.duration?fmtT(it.duration):''].filter(Boolean).join(' · ')+' ');meta.appendChild(tag);
if(it.page){var a=el('a','','↗');a.href=safeUrl(it.page);a.target='_blank';a.rel='noopener noreferrer';meta.appendChild(document.createTextNode(' '));meta.appendChild(a);}
card.appendChild(meta);
var subEl=el('div','vd-sub');subEl.style.display='none';card.insertBefore(subEl,wrap.nextSibling);
var subOn=false,subLoaded=false;
function srt2vtt(t){return 'WEBVTT\n\n'+t.replace(/\r/g,'').replace(/(\d+:\d+:\d+),(\d+)/g,'$1.$2');}
function loadSubs(){
if(subLoaded)return;subLoaded=true;subEl.textContent='Loading subtitles…';
var lang=(navigator.language||'en').slice(0,2).toLowerCase(),L=it.subs;
var pick=L.filter(function(x){return x.lang===lang;})[0]||L.filter(function(x){return x.lang==='en';})[0]||L[0];
fetch(pick.url).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
if(!/^\s*WEBVTT/.test(t))t=srt2vtt(t);
var tr=document.createElement('track');tr.kind='subtitles';tr.label=pick.label;tr.srclang=pick.lang||'en';tr.src=URL.createObjectURL(new Blob([t],{type:'text/vtt'}));v.appendChild(tr);tr.track.mode='hidden';
subEl.textContent='Subtitles on — they appear here while someone speaks.';
tr.track.addEventListener('cuechange',function(){var c=tr.track.activeCues,out=[];if(c)for(var i=0;i<c.length;i++)out.push(String(c[i].text).replace(/<[^>]+>/g,''));subEl.textContent=out.join('\n')||'\u00a0';});
}).catch(function(){subLoaded=false;subOn=false;subEl.style.display='none';toast('Subtitles could not be loaded','#ffaa00');});
}
var ctl=controls(v,{speed:true,item:it,onQuality:function(val){
var q=vqApply(it,val==='best'?'best':+val);if(!q||!on)return;
var t=v.currentTime,was=!v.paused;if(blobU){URL.revokeObjectURL(blobU);blobU=null;}tag.textContent=VQN[q.b]||'';busy(true);tried=0;
v.src=it.src;v.preload='auto';v.addEventListener('loadedmetadata',function f(){v.removeEventListener('loadedmetadata',f);try{v.currentTime=t;}catch(e){}if(was)v.play().catch(function(){});});
},next:opts.next&&function(){opts.next(card);},dl:function(ev){var bt=ev&&ev.currentTarget;dl(it.src,(it.title||'video').replace(/[^\wЀ-ӿ.-]+/g,'_').slice(0,80)||'video',bt,blobU);logAct('video','download '+it.title);}});card.appendChild(ctl);
if(it.subs&&it.subs.length){var cc=el('button','','CC');cc.type='button';cc.title='Subtitles';cc.setAttribute('aria-label','Subtitles');cc.onclick=function(){subOn=!subOn;cc.style.opacity=subOn?'1':'.6';cc.style.outline=subOn?'2px solid var(--accent)':'none';subEl.style.display=subOn?'block':'none';store.set('ai_cc',subOn?'1':'0');if(subOn)loadSubs();};cc.style.opacity='.6';ctl.appendChild(cc);if(store.get('ai_cc')==='1'&&!LOW())v.addEventListener('play',function f(){v.removeEventListener('play',f);cc.click();});}
return card;
}
function nextCard(card){var n=card.nextElementSibling;while(n&&!n.classList.contains('vd-card'))n=n.nextElementSibling;if(n){n.scrollIntoView({behavior:'smooth',block:'start'});var v=n.querySelector('video');if(v)setTimeout(function(){v.play().catch(function(){});},400);}}
function ageG(){return window.AI_AGE||'';}
function kidsOn(){try{var g=ageG();if(g==='u13'||g==='13-15'||g==='16-17')return true;return store.get('ai_kids')!=='0';}catch(e){return true;}}
function kidOK(it){if(!kidsOn()||!it)return true;if(KIDSRC.test(String(it.source||'')))return false;return !KIDRE.test([it.title,it.text,it.license].join(' '));}
function freeVid(it){return !!it&&!PAIDRE.test(String(it.license||''))&&kidOK(it);}
function commonsClient(q,page){
var u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=50&gsroffset='+((page||0)*50)+'&gsrsearch='+encodeURIComponent(q+' filetype:video')+'&prop=videoinfo|imageinfo&viprop=url|mime|extmetadata|size|mediatype|derivatives&viurlwidth=480&iiprop=url|mime|size|extmetadata&iiurlwidth=480';
return fetch(u).then(function(r){return r.json();}).then(function(j){
var pages=j.query?Object.keys(j.query.pages).map(function(k){return j.query.pages[k];}):[];pages.sort(function(a,b){return(a.index||99)-(b.index||99);});
return pages.map(function(p){var ii=(p.videoinfo||[])[0]||(p.imageinfo||[])[0];if(!ii||!/^(video\/|application\/ogg)/.test(ii.mime))return null;var m=ii.extmetadata||{};if(m.NonFree&&/true|1|yes/i.test(String(m.NonFree.value)))return null;if(PAIDRE.test(String((m.LicenseShortName&&m.LicenseShortName.value)||'')+' '+String((m.UsageTerms&&m.UsageTerms.value)||'')))return null;var ds=(ii.derivatives||[]).filter(function(d){return d&&/^https:/.test(d.src||'')&&Number(d.height)>0;});ds.sort(function(x,y){function sc(d){return(String(d.type).indexOf('video/mp4')===0?0:1000)+Math.abs(Number(d.height)-480)+(Number(d.height)<240?500:0);}return sc(x)-sc(y);});var dv=ds[0];
var cq={};(ii.derivatives||[]).concat([{src:ii.url,type:ii.mime,width:ii.width,height:ii.height}]).forEach(function(d){var h=Math.round(Math.min(Number(d.width)||1e9,Number(d.height)||0));if(!(h>0)||h>9000||!/^https:/.test(d.src||''))return;var m=String(d.type||'').split(';')[0],c=cq[h];if(!c||(m==='video/mp4'&&c.mime!=='video/mp4'))cq[h]={h:h,src:d.src,mime:m==='application/ogg'?'video/ogg':m,type:String(d.type||'')};});
return{qualities:Object.keys(cq).map(function(k){return cq[k];}).sort(function(a,b){return a.h-b.h;}),id:'c:'+p.pageid,title:String(p.title).replace(/^File:/,'').replace(/\.\w+$/,'').replace(/_/g,' '),thumb:ii.thumburl||'',src:dv?dv.src:ii.url,full:ii.url,page:ii.descriptionurl,license:(m.LicenseShortName&&m.LicenseShortName.value)||'Free license',source:'Wikimedia Commons',mime:dv?String(dv.type).split(';')[0]:ii.mime,duration:ii.duration?Math.round(ii.duration):null};}).filter(Boolean);
});
}
function archivePick(files){
var l=(files||[]).filter(function(f){return f&&typeof f.name==='string'&&!/_thumb|\/|\.(gif|jpg|png)$/i.test(f.name);});
function rk(f){var n=f.name.toLowerCase(),fm=String(f.format||'').toLowerCase();return(/h\.?264|mpeg4/.test(fm)&&/\.mp4$/.test(n))?0:/\.mp4$/.test(n)?1:/\.webm$/.test(n)?2:/\.ogv$/.test(n)?3:9;}
l=l.filter(function(f){return rk(f)<9;}).sort(function(a,b){return rk(a)-rk(b)||(Number(a.size)||0)-(Number(b.size)||0);});
return l[0]||null;
}
function archiveClient(q,popular,page){
var qq='('+(q?'('+q+') AND ':'')+'mediatype:movies AND collection:(opensource_movies OR prelinger OR feature_films OR classic_tv OR newsandpublicaffairs))';
var u='https://archive.org/advancedsearch.php?q='+encodeURIComponent(qq)+'&fl[]=identifier&fl[]=title&fl[]=week&rows=60&page='+((page||0)+1)+'&output=json'+(popular?'&sort[]='+encodeURIComponent('week desc'):'');
return fetch(u).then(function(r){return r.json();}).then(function(j){
var docs=((j.response||{}).docs||[]).filter(function(d){return /^[A-Za-z0-9._-]{1,100}$/.test(String(d.identifier||''));}).slice(0,40);
return Promise.all(docs.map(function(d){
return fetch('https://archive.org/metadata/'+encodeURIComponent(d.identifier)).then(function(r){return r.json();}).then(function(m){
var f=archivePick(m&&m.files);if(!f)return null;var n=f.name.toLowerCase();
var aq={};(m&&m.files||[]).forEach(function(g){if(!g||typeof g.name!=='string'||/_thumb|\//.test(g.name))return;var nn=g.name.toLowerCase();if(!/\.(mp4|webm|ogv)$/.test(nn))return;var h=Math.round(Math.min(Number(g.width)||1e9,Number(g.height)||0));if(!(h>0)||h>9000)return;var c=aq[h];if(!c||(/\.mp4$/.test(nn)&&!/\.mp4$/.test(c.src)))aq[h]={h:h,src:'https://archive.org/download/'+encodeURIComponent(d.identifier)+'/'+g.name.split('/').map(encodeURIComponent).join('/'),mime:/\.webm$/.test(nn)?'video/webm':/\.ogv$/.test(nn)?'video/ogg':'video/mp4'};});
return{qualities:Object.keys(aq).map(function(k){return aq[k];}).sort(function(a,b){return a.h-b.h;}),id:'a:'+d.identifier,title:String(Array.isArray(d.title)?d.title[0]:(d.title||d.identifier)),thumb:'https://archive.org/services/img/'+d.identifier,src:'https://archive.org/download/'+encodeURIComponent(d.identifier)+'/'+f.name.split('/').map(encodeURIComponent).join('/'),page:'https://archive.org/details/'+d.identifier,license:'Public domain / CC',source:'Internet Archive',mime:/\.webm$/.test(n)?'video/webm':/\.ogv$/.test(n)?'video/ogg':'video/mp4',popularity:d.week||0};
}).catch(function(){return null;});
})).then(function(a){return a.filter(Boolean);});
});
}
function browserVideoFallback(q,o){return commonsClient(q||'video',o.page).then(function(a){return a.filter(freeVid);}).catch(function(){return[];}).then(function(a){if(a.length)return a;return archiveClient(q,!!o.popular,o.page).then(function(b){return b.filter(freeVid);}).catch(function(){return[];});});}
function findVideos(q,o){
o=o||{};var params={q:q||''};if(o.popular)params.popular='1';if(o.ai)params.ai='1';if(o.page)params.page=String(o.page);
return xget('videos',params,20000).then(function(j){o.fallback=!!j.fallback;var a=(j.items||[]).filter(freeVid).map(tagPop);return a.length?a:browserVideoFallback(q,o).then(function(b){return b.map(tagPop);});}).catch(function(){return browserVideoFallback(q,o).then(function(a){return a.map(tagPop);});});
}
function tagPop(it){if(it.popularity&&!it._p){it._p=1;it.title=it.title+' · 🔥 '+it.popularity+' downloads this week';}return it;}
function feedItems(page){
var key='ai_v9_feed2_'+country();var cached=jget(key,null);
if(page)return xget('feed',{page:String(page)},25000).then(function(j){return(j.items||[]).filter(function(it){return it.type!=='video'||freeVid(it);});});
var p=xget('feed',{},20000).then(function(j){return(j.items||[]).filter(function(it){return it.type!=='video'||freeVid(it);});});
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
if(window.AI_FEED_MODE&&window.AI_FEED_MODE.p&&!window.AI_FEED_MODE.v)items=items.filter(function(it){return it.type!=='video';});
if(kidsOn())items=items.filter(kidOK);box.textContent='';var n=0;box._shown=limit;
items.forEach(function(it){
if(n>=limit)return;n++;
if(it.type==='video'&&it.src){box.appendChild(videoCard({title:it.title,thumb:it.image,src:it.src,page:it.link,license:it.license||it.text,source:it.source||'',mime:it.mime||'video/mp4',duration:it.duration,subs:it.subs,full:it.full,qualities:it.qualities},{next:nextCard}));return;}
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
box.appendChild(ctl);
if(items.length<=limit&&!moreFn)ctl.style.display='none';
}else if(items.length>limit){moreBtn=mkBtn('Load more','',function(){renderFeed(box,items,limit+24,moreFn);});box.appendChild(moreBtn);}
else if(moreFn&&!box._manual){moreBtn=mkBtn('Load more','',function(){moreBtn.disabled=true;moreBtn.textContent='Loading…';moreFn();});box.appendChild(moreBtn);}
if(moreBtn&&window.IntersectionObserver){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();moreBtn.click();}},{rootMargin:'1200px'});io.observe(moreBtn);}
items.slice(limit,limit+10).forEach(function(it){if(it.image&&!LOW()){var i=new Image();i.src=it.image;}});
}
function regionName(){try{return new Intl.DisplayNames(['en'],{type:'region'}).of(country());}catch(e){return'';}}
function openVideos(tab,inline){
if(!inline&&window.AI_FEED_VIDEOS){window.AI_FEED_VIDEOS(tab);return;}
var b=$('v9VideosBody');
if(!b._built){
b._built=true;
var tabs=el('div','v9-row');var body=el('div');b.appendChild(tabs);b.appendChild(body);b._tabs=tabs;b._body=body;
b._show=function(name){
[].forEach.call(tabs.children,function(t){t.classList.toggle('on',t.dataset.k===name);});body.textContent='';
if(name==='fyp')vidFyp(body);else if(name==='search')vidSearch(body);else vidPlayer(body);
};
[['fyp','🔥 '+'For you'],['search','🔎 '+'Search'],['player','▶ '+'My player']].forEach(function(t){var x=el('button','v9-tab',t[1]);x.type='button';x.dataset.k=t[0];x.onclick=function(){b._show(t[0]);};tabs.appendChild(x);});
}
if(!b._pc){b._pc=1;['https://upload.wikimedia.org','https://archive.org'].forEach(function(h){var l=document.createElement('link');l.rel='preconnect';l.href=h;l.crossOrigin='anonymous';document.head.appendChild(l);});}
b._show(tab||'fyp');if(!inline)openPanel('v9Videos');
}
function vidFyp(body){
var feed=el('div','vd-feed');feed.id='v9Scroller';var note=el('div','v9-note');
note.textContent='Viral videos — the most downloaded this week from free-licensed archives (Internet Archive, Wikimedia Commons). Videos are downloaded ahead into your device cache so scrolling and seeking stay instant.';
body.appendChild(note);body.appendChild(feed);
var topics=TOPICS.slice(),page=0,loading=false,seen={},all=[],dry=0;
var rbtn=reelBtn(function(){return all;},function(){return more();},function(){var cs=[].slice.call(feed.querySelectorAll('.vd-card')),i;for(i=0;i<cs.length;i++){var vv=cs[i].querySelector('video');if(vv&&!vv.paused)return i;}var top=$('v9VideosBody').getBoundingClientRect().top;for(i=0;i<cs.length;i++){if(cs[i].getBoundingClientRect().bottom>top+80)return i;}return 0;});
body.insertBefore(rbtn,body.firstChild);
var sentinel=el('div','v9-spin');
function more(){
if(loading||dry>=6)return Promise.resolve();loading=true;
var rnd=Math.floor(page/topics.length),qs=[topics[page%topics.length],topics[(page+1)%topics.length]];page+=2;
return Promise.all(qs.map(function(q){return findVideos(q,{popular:true,page:rnd}).catch(function(){return[];});})).then(function(rs){
var got=0,keep=[];rs.forEach(function(arr){arr.forEach(function(it){if(seen[it.src])return;seen[it.src]=1;got++;keep.push(it);all.push(it);feed.appendChild(videoCard(it,{next:nextCard}));});});if(keep.length&&page<=2)jset('ai_v9_fyp_q_'+country(),keep.slice(0,40));
loading=false;dry=got?0:dry+1;if(dry>=6){sentinel.className='v9-note';sentinel.textContent='No more free videos right now.';}else if(!got)more();
[].slice.call(feed.querySelectorAll('.vd-card')).slice(0,Math.max(2,VC.ahead)).forEach(function(c){c._warm&&c._warm();});
});
}
body.appendChild(sentinel);
var fc=jget('ai_v9_fyp_q_'+country(),null);
if(fc&&fc.length){fc.forEach(function(it){if(seen[it.src])return;seen[it.src]=1;all.push(it);feed.appendChild(videoCard(it,{next:nextCard}));});}
more();logAct('video','opened For you');
if(window.IntersectionObserver){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting)more();},{root:$('v9VideosBody'),rootMargin:'1500px'});io.observe(sentinel);}
}
function vidSearch(body){
var row=el('div','v9-row'),inp=el('input','v9-in');inp.placeholder='Search videos…';inp.setAttribute('aria-label','Video search');
var out=el('div','vd-feed');
function go(){var q=inp.value.trim();if(q.length<2)return;out.textContent='';out.appendChild(el('div','v9-spin'));logAct('video','search '+q);
var items=[],seenS={},pg=0,mb=null;
function add(a){var n=0;a.forEach(function(it){if(seenS[it.src])return;seenS[it.src]=1;n++;items.push(it);out.insertBefore(videoCard(it,{next:nextCard,front:items.length<4}),mb);});return n;}
function more(){if(mb){mb.disabled=true;mb.textContent='Loading…';}pg++;findVideos(q,{page:pg}).then(function(a){var n=add(a);if(!n&&pg>=3){mb.remove();out.appendChild(el('div','v9-note','No more results.'));}else{mb.disabled=false;mb.textContent='Load more videos';if(!n)more();}}).catch(function(){mb.disabled=false;mb.textContent='Load more videos';});}
findVideos(q).then(function(a){out.textContent='';if(!a.length){out.appendChild(el('div','v9-note','Nothing found in the free video archives.'));return;}out.appendChild(reelBtn(function(){return items;},function(){return new Promise(function(res){if(!mb){res();return;}pg++;findVideos(q,{page:pg}).then(function(b){add(b);res();}).catch(function(){res();});});}));mb=mkBtn('Load more videos','',more);out.appendChild(mb);add(a);}).catch(function(){out.textContent='Search failed.';});}
inp.onkeydown=function(e){if(e.key==='Enter'){go();hideKeyboard();}};row.appendChild(inp);row.appendChild(mkBtn('Search','pri',go));body.appendChild(row);
body.appendChild(el('div','v9-note','Results come from Wikimedia Commons and the Internet Archive (free licenses). Each card has a download button.'));
body.appendChild(out);
}
function vidPlayer(body){
var drop=el('div','v9-card');drop.style.cssText+=';text-align:center;border-style:dashed;cursor:pointer';drop.textContent='📂 '+'Choose or drop a video file here';
var fi=el('input');fi.type='file';fi.accept='video/*';fi.style.display='none';drop.onclick=function(){fi.click();};
var stage=el('div');body.appendChild(drop);body.appendChild(fi);body.appendChild(stage);var cur=null;
function load(f){if(!f||!/^video\//.test(f.type)){toast('Choose a video file','#ff4444');return;}
if(cur)URL.revokeObjectURL(cur);cur=URL.createObjectURL(f);stage.textContent='';logAct('player',f.name);
var wrap=el('div','vd-card');var v=document.createElement('video');v.src=cur;v.playsInline=true;v.autoplay=true;wrap.appendChild(v);wrap.appendChild(el('div','vd-ttl',f.name));wrap.appendChild(controls(v,{speed:true}));stage.appendChild(wrap);wrap.tabIndex=0;
wrap.onkeydown=function(e){if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;if(e.key===' '){e.preventDefault();v.paused?v.play():v.pause();}else if(e.key==='ArrowLeft')v.currentTime-=5;else if(e.key==='ArrowRight')v.currentTime+=5;else if(e.key==='f')wrap.requestFullscreen&&wrap.requestFullscreen();};}
fi.onchange=function(){load(fi.files[0]);};
drop.ondragover=function(e){e.preventDefault();};drop.ondrop=function(e){e.preventDefault();load(e.dataTransfer.files[0]);};
if(V9.pending){var pi=V9.pending;V9.pending=null;var w0=el('div','vd-card');w0.appendChild(videoCard(pi,{front:true}));stage.appendChild(w0);}
body.appendChild(el('div','v9-note','Space = play/pause · ← → = 5 s · F = full screen. The file stays on your device.'));
}

/* ===================== v29: full-screen scrolling reel ===================== */
/* auto-hide helper: adds .idle to el after ms without touch / mouse / key / scroll */
function isLand(){try{return window.matchMedia('(orientation:landscape)').matches;}catch(e){return false;}}
function idleHide(elm,ms,hold,always){
var t=0,mq=null;
function wake(){elm.classList.remove('idle');clearTimeout(t);if(!always&&!isLand())return;t=setTimeout(function(){if(hold&&hold())return wake();elm.classList.add('idle');},ms);}
function down(){elm._wasIdle=elm.classList.contains('idle');wake();}
elm.addEventListener('pointerdown',down,{passive:true,capture:true});
['pointermove','touchstart','wheel','scroll'].forEach(function(n){elm.addEventListener(n,wake,{passive:true,capture:true});});
document.addEventListener('keydown',wake,true);window.addEventListener('resize',wake);window.addEventListener('orientationchange',wake);
try{mq=window.matchMedia('(orientation:landscape)');(mq.addEventListener?mq.addEventListener('change',wake):mq.addListener(wake));}catch(e){}
wake();
return function(){clearTimeout(t);document.removeEventListener('keydown',wake,true);window.removeEventListener('resize',wake);window.removeEventListener('orientationchange',wake);try{if(mq)(mq.removeEventListener?mq.removeEventListener('change',wake):mq.removeListener(wake));}catch(e){}elm.classList.remove('idle');};
}
function openReel(items,start,loadMore){
if($('v28Reel')||!items||!items.length)return;
[].forEach.call(document.querySelectorAll('.vd-card video'),function(v){v.pause();});
var R=el('div','');R.id='v28Reel';R.setAttribute('role','dialog');R.setAttribute('aria-modal','true');R.setAttribute('aria-label','Full screen videos');
var slides=[],cur=-1,muted=store.get('ai_reel_mute')==='1',loadingMore=false,fsOn=false,shut=false,rafT=0;
function ui(cls){var d=el('div','rl-ui '+cls);return d;}
function rb(txt,label,fn){var b=el('button','rl-btn',txt);b.type='button';b.setAttribute('aria-label',label);b.title=label;b.onclick=function(e){e.stopPropagation();fn();};return b;}
var topUi=ui('rl-top'),rightUi=ui('rl-right'),cnt=el('div','rl-cnt','');
function setCnt(){var s=slides[cur],r=s&&s.it._vqd?' · '+VQN[s.it._vqd].split(' ')[0]:'';cnt.textContent=(cur+1)+' / '+slides.length+r;}
var mb=rb(muted?'🔇':'🔊','Sound on / off',function(){muted=!muted;store.set('ai_reel_mute',muted?'1':'0');mb.textContent=muted?'🔇':'🔊';slides.forEach(function(s){s.v.muted=muted;});});
topUi.appendChild(rb('✕','Close',close));
rightUi.appendChild(mb);
var qb=rb('⚙️','Video quality',function(){openQ();});qb.className+=' rl-q';rightUi.appendChild(qb);
rightUi.appendChild(rb('▲','Previous video',function(){go(-1);}));
rightUi.appendChild(rb('▼','Next video',function(){go(1);}));
R.appendChild(topUi);R.appendChild(rightUi);R.appendChild(cnt);
function qswap(s){
var v=s.v,t=v.currentTime,was=!v.paused;if(s.blobU){URL.revokeObjectURL(s.blobU);s.blobU=null;}
s.d.classList.add('loading');s.tried=0;v.src=s.it.src;v.preload='auto';
v.addEventListener('loadedmetadata',function f(){v.removeEventListener('loadedmetadata',f);try{v.currentTime=t;}catch(e){}if(was)v.play().catch(function(){});});
}
function closeQ(){var m=R.querySelector('.rl-menu');if(m)m.remove();}
function openQ(){
if(R.querySelector('.rl-menu')){closeQ();return;}
var s=slides[cur];if(!s)return;var a=vqList(s.it),have={},curB=s.it._vqb||0,pref=String(vqPref());
a.forEach(function(q){have[q.b]=1;});
var m=el('div','rl-menu');m.addEventListener('click',function(e){e.stopPropagation();});m.addEventListener('pointerdown',function(e){e.stopPropagation();});
m.appendChild(el('b','','Video quality'));
if(a.length<2)m.appendChild(el('div','v9-note','This video is only available in the quality it is playing now.'));
function item(label,val,ok){
var b=el('button','rl-qi',label+(ok?'':' — not available'));b.type='button';b.disabled=!ok;
if(String(val)===pref)b.className+=' on';
b.onclick=function(e){e.stopPropagation();vqSet(val);var q=vqApply(s.it,val==='best'?'best':+val);closeQ();if(q&&s.on)qswap(s);};
m.appendChild(b);
}
item('Best'+(a.length?' ('+VQN[a[a.length-1].b].split(' ')[0]+')':''),'best',a.length>0);
VQL.forEach(function(L){item(VQN[L]+(L===(s.it._vqd||curB)?' ✓ playing':''),L,!!have[L]);});
var x=rb('Close','Close menu',closeQ);x.className+=' rl-qx';x.textContent='Close';m.appendChild(x);
R.appendChild(m);
}
function go(d){var n=cur+d;if(n<0||n>=slides.length)return;R.scrollTo({top:n*R.clientHeight,behavior:'smooth'});}
function play(s){
var p=s.v.play();
if(p&&p.catch)p.catch(function(){
if(!s.v.muted){s.v.muted=true;muted=true;mb.textContent='🔇';s.v.play().catch(function(){flash(s,'▶');});toast('Tap 🔊 for sound','#ffaa00');}else flash(s,'▶');
});
}
function flash(s,t){s.fl.textContent=t;s.fl.classList.remove('show');void s.fl.offsetWidth;s.fl.classList.add('show');}
function attach(s){
if(s.on)return;s.on=true;s.d.classList.add('loading');vqApply(s.it);
vcURL(s.it.src).then(function(u){
if(!s.on){if(u)URL.revokeObjectURL(u);return;}
if(u){s.blobU=u;s.v.src=u;}
else if(LOW()&&!s.forced){s.d.classList.remove('loading');var lb=mkBtn('⬇️ Load video (uses data)','pri',function(){s.forced=true;lb.remove();s.on=false;attach(s);});lb.className+=' rl-fail';s.d.appendChild(lb);return;}
else{s.v.src=s.it.src;vcWarm(s.it.src,null,slides[cur]===s,s.it.mime);}
s.v.preload='auto';
if(s.pos>0.5){s.v.addEventListener('loadedmetadata',function f(){s.v.removeEventListener('loadedmetadata',f);try{s.v.currentTime=s.pos;}catch(e){}});}
if(slides[cur]===s)play(s);
});
}
function detach(s){
if(!s.on)return;s.on=false;s.d.classList.remove('loading');
if(s.v.currentTime>0.5&&!s.v.ended)s.pos=s.v.currentTime;s.v.pause();s.v.removeAttribute('src');s.v.preload='none';try{s.v.load();}catch(e){}
if(s.blobU){URL.revokeObjectURL(s.blobU);s.blobU=null;}
}
function fail(s){
s.d.classList.remove('loading');if(s.failEl)return;
var f=el('div','rl-fail','This video cannot be played.');f.appendChild(document.createElement('br'));
f.appendChild(mkBtn('↻ Retry','',function(){f.remove();s.failEl=null;s.tried=0;detach(s);attach(s);}));
s.failEl=f;s.d.appendChild(f);
var k=slides.indexOf(s);if(k===cur)setTimeout(function(){if(!shut&&slides[cur]===s&&s.failEl)go(1);},2500);
}
function mk(it){
var s={it:it,on:false,blobU:null,tried:0,forced:false,failEl:null};
var d=el('div','rl-s'),v=document.createElement('video');
v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='none';v.muted=muted;v.setAttribute('disableremoteplayback','');
if(it.thumb&&!LOW())v.poster=it.thumb;
var spin=el('div','v9-spin'),fl=el('div','rl-flash','▶'),info=el('div','rl-info');
info.appendChild(el('b','',it.title||'Video'));
var meta=el('span','',[it.source,it.license].filter(Boolean).join(' · ')+' ');
if(it.page){var a=el('a','','Original ↗');a.href=safeUrl(it.page);a.target='_blank';a.rel='noopener noreferrer';meta.appendChild(a);}
info.appendChild(meta);
var bar=el('input','rl-bar');bar.type='range';bar.min='0';bar.max='1000';bar.value='0';bar.setAttribute('aria-label','Seek');
var drag=false;bar.oninput=function(){drag=true;if(v.duration)v.currentTime=v.duration*bar.value/1000;};bar.onchange=function(){drag=false;};
bar.addEventListener('click',function(e){e.stopPropagation();});
var lastU=0;v.addEventListener('timeupdate',function(){var n=performance.now();if(n-lastU<250)return;lastU=n;if(!drag&&v.duration)bar.value=Math.round(1000*v.currentTime/v.duration);});
['waiting','stalled','seeking'].forEach(function(n){v.addEventListener(n,function(){if(s.on&&(v.src||v.currentSrc))d.classList.add('loading');});});
['canplay','playing','loadeddata','seeked','pause'].forEach(function(n){v.addEventListener(n,function(){d.classList.remove('loading');});});
['loadedmetadata','resize'].forEach(function(n){v.addEventListener(n,function(){vqSeen(it,v);if(slides[cur]===s)setCnt();});});
v.addEventListener('playing',function(){logAct('video','reel '+it.title);});
v.addEventListener('ended',function(){if(slides[cur]===s)go(1);});
v.addEventListener('error',function(){
if(!s.on||!v.getAttribute('src'))return;var c=v.getAttribute('src');
if(s.blobU&&c===s.blobU&&s.tried<1){s.tried=1;try{caches.open(VC.name).then(function(x){x.delete(it.src);});}catch(e){}delete VC.idx[it.src];VC.state[it.src]='fail';vcSave();v.removeAttribute('src');try{v.load();}catch(e){}v.src=it.src;return;}
if(vqStepDown(it)){v.removeAttribute('src');try{v.load();}catch(e){}v.src=it.src;return;}
if(it.full&&it.full!==it.src&&c!==it.full&&s.tried<2){s.tried=2;v.removeAttribute('src');try{v.load();}catch(e){}v.src=it.full;return;}
fail(s);
});
d.addEventListener('click',function(e){if(R._wasIdle){R._wasIdle=false;return;}if(R.querySelector('.rl-menu')){closeQ();return;}if(e.target.closest&&e.target.closest('button,a,input'))return;if(v.paused){play(s);flash(s,'▶');}else{v.pause();flash(s,'⏸');}});
d.appendChild(v);d.appendChild(spin);d.appendChild(fl);d.appendChild(info);d.appendChild(bar);
s.d=d;s.v=v;s.fl=fl;return s;
}
function sync(){
while(slides.length<items.length){var s=mk(items[slides.length]);slides.push(s);R.appendChild(s.d);}
setCnt();
}
function more(){
if(!loadMore||loadingMore)return;loadingMore=true;
Promise.resolve().then(loadMore).catch(function(){}).then(function(){loadingMore=false;if(!shut)sync();});
}
function setActive(i){
if(i===cur||i<0||i>=slides.length)return;
if(slides[cur])slides[cur].v.pause();
cur=i;
slides.forEach(function(s,k){if(Math.abs(k-i)<=1)attach(s);else detach(s);});
var s=slides[i];if(s.on&&s.v.getAttribute('src'))play(s);
for(var k=1;k<=Math.max(2,VC.ahead);k++){var n=slides[i+k];if(n&&!LOW())vcWarm(n.it.src,null,false,n.it.mime);}
setCnt();
if(i>=slides.length-3)more();
}
R.addEventListener('scroll',function(){if(rafT)return;rafT=requestAnimationFrame(function(){rafT=0;if(shut)return;setActive(Math.round(R.scrollTop/Math.max(1,R.clientHeight)));});},{passive:true});
function key(e){
if(shut)return;var k=e.key;
if(k==='Escape'){e.preventDefault();e.stopPropagation();if(R.querySelector('.rl-menu'))closeQ();else close();}
else if(k==='ArrowDown'||k==='PageDown'||k==='j'){e.preventDefault();go(1);}
else if(k==='ArrowUp'||k==='PageUp'||k==='k'){e.preventDefault();go(-1);}
else if(k===' '){e.preventDefault();var s=slides[cur];if(s)s.v.paused?play(s):s.v.pause();}
else if(k==='m'||k==='M'){mb.click();}
else if(k==='ArrowRight'){var t=slides[cur];if(t)t.v.currentTime+=5;}
else if(k==='ArrowLeft'){var u=slides[cur];if(u)u.v.currentTime-=5;}
}
function onFs(){var f=document.fullscreenElement||document.webkitFullscreenElement;if(f===R)fsOn=true;else if(fsOn&&!shut){fsOn=false;close();}}
function close(){
if(shut)return;shut=true;closeQ();
document.removeEventListener('keydown',key,true);document.removeEventListener('fullscreenchange',onFs);document.removeEventListener('webkitfullscreenchange',onFs);
slides.forEach(function(s){s.on=true;detach(s);});
if(stopIdle)stopIdle();R.remove();document.documentElement.style.overflow=V9.stack.length?'hidden':'';
var f=document.fullscreenElement||document.webkitFullscreenElement;if(f===R){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch(e){}}
}
document.addEventListener('keydown',key,true);document.addEventListener('fullscreenchange',onFs);document.addEventListener('webkitfullscreenchange',onFs);
document.body.appendChild(R);document.documentElement.style.overflow='hidden';
var stopIdle=idleHide(R,3000,function(){return R.querySelector('.rl-bar:active')||R.querySelector('.rl-bar:focus-visible');});
sync();
var st=Math.max(0,Math.min(start||0,slides.length-1));
R.scrollTop=st*R.clientHeight;setActive(st);
if(!store.get('ai_reel_hint')){store.set('ai_reel_hint','1');R.appendChild(el('div','rl-hint','Swipe up / down for the next video · tap to pause'));}
try{var rq=R.requestFullscreen||R.webkitRequestFullscreen;if(rq){var pr=rq.call(R);if(pr&&pr.catch)pr.catch(function(){});}}catch(e){}
logAct('video','reel opened');
}
function reelBtn(getItems,loadMore,getStart){
var b=mkBtn('🎞️ Full screen scroll','pri',function(){var it=getItems();if(!it.length){toast('No videos loaded yet','#ffaa00');return;}openReel(it,getStart?getStart():0,loadMore);});
b.className+=' rl-start';return b;
}

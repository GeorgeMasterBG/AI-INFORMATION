/* AI INFORMATION - settings.js
   Settings, Features menu, reminders, cache/storage settings, accessibility, voice, standard-mode UI.
   Only function declarations: they are called later by app.js (loaded last). */

function initRemind(){
var body=mkPanel('v9Remind','⏰ Reminders');body.parentNode.id='v9Remind';
var list=jget('ai_remind',[]);if(!Array.isArray(list))list=[];
function save(){jset('ai_remind',list);}
function pad(n){return String(n).padStart(2,'0');}
function localIso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());}
body.appendChild(el('p','lg-p','Write what to remember, pick the time and how you want to be reminded.'));
var txt=el('input','v9-in');txt.placeholder='Remind me to…';txt.maxLength=140;txt.setAttribute('aria-label','Reminder text');body.appendChild(txt);
var when=document.createElement('input');when.type='datetime-local';when.className='v9-in';when.style.cssText='margin-top:8px;width:100%';when.setAttribute('aria-label','Date and time');body.appendChild(when);
var q=el('div','v9-row');q.style.margin='8px 0';
[['+10 min',10],['+1 hour',60],['Tomorrow 9:00',-1]].forEach(function(x){q.appendChild(mkBtn(x[0],'',function(){var d=new Date();if(x[1]<0){d.setDate(d.getDate()+1);d.setHours(9,0,0,0);}else d=new Date(Date.now()+x[1]*60000);when.value=localIso(d);}));});
body.appendChild(q);
function chk(label,on){var l=el('label','lg-p','');l.style.cssText='display:block;margin:6px 0';var c=document.createElement('input');c.type='checkbox';c.checked=!!on;l.appendChild(c);l.appendChild(document.createTextNode(' '+label));body.appendChild(l);return c;}
var cN=chk('🔔 Notification on this device',true);
var nst=el('div','v9-note','');nst.style.margin='2px 0 8px';body.appendChild(nst);
var nbtn=mkBtn('Allow notifications','',function(){askNotif(true);});nbtn.style.marginRight='8px';
var ntest=mkBtn('Send a test notification','',function(){showNote('⏰ Test','If you can read this, notifications work.','test');});
var nrow=el('div','v9-row');nrow.appendChild(nbtn);nrow.appendChild(ntest);body.appendChild(nrow);
function nState(){if(!('Notification' in window))return'unsupported';return Notification.permission;}
function nUpdate(){var st=nState(),ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
nbtn.style.display=st==='default'?'':'none';ntest.style.display=st==='granted'?'':'none';
nst.textContent=st==='granted'?'✓ Notifications are allowed. They appear on time while your browser is running; if it was closed, they appear when you open the site again. For a reminder that always rings, also tick the calendar file.':
st==='denied'?'✗ Notifications are blocked for this site. Open your browser’s site settings (the lock icon next to the address), allow Notifications, then reload this page.':
st==='default'?'Notifications are not allowed yet. Press “Allow notifications” and choose Allow.':
'✗ This browser does not support notifications'+(ios?' here. On iPhone/iPad they work only after you add the site to the Home Screen (iOS 16.4 or newer) and open it from there.':'. Use the calendar file instead.');}
function askNotif(force){if(!('Notification' in window)){nUpdate();return;}if(Notification.permission==='default'||force){try{var pr=Notification.requestPermission(function(){nUpdate();});if(pr&&pr.then)pr.then(nUpdate);}catch(e){}}nUpdate();}
function swReg(){if(!navigator.serviceWorker||!/^https?:$/.test(location.protocol))return Promise.reject(0);return navigator.serviceWorker.getRegistration().then(function(g){return g||navigator.serviceWorker.register(cacheOK()?'sw.js':'sw.js?n=1');}).then(function(){return navigator.serviceWorker.ready;});}
function noteIcon(){return new Promise(function(res){var abs='';try{abs=new URL('icon-192.png',location.href).href;}catch(e){res('icon-192.png');return;}
try{fetch(abs,{credentials:'omit'}).then(function(r){return r.ok?r.blob():null;}).then(function(b){if(!b){res(abs);return;}var f=new FileReader();f.onload=function(){res(String(f.result));};f.onerror=function(){res(abs);};f.readAsDataURL(b);}).catch(function(){res(abs);});}catch(e){res(abs);}});}
function showNote(title,bodyTxt,tag){if(nState()!=='granted'){toast(title+' '+bodyTxt,'#b7791f',8000);return;}
noteIcon().then(function(ic){var o={body:bodyTxt,tag:tag,icon:ic,requireInteraction:true};
return swReg().then(function(g){return g.showNotification(title,o);}).catch(function(){try{new Notification(title,o);}catch(e){toast(title+' '+bodyTxt,'#b7791f',8000);}});});}
cN.onchange=function(){if(cN.checked&&nState()==='default')askNotif();};
var cC=chk('📅 Calendar file (.ics) – your calendar app reminds you even when this site is closed',false);
var cE=chk('✉️ Email draft – open my mail app with the reminder ready to send now',false);
var em=el('input','v9-in');em.type='email';em.placeholder='Your e-mail address (only for the mail draft)';em.maxLength=120;em.setAttribute('aria-label','E-mail address');em.style.display='none';body.appendChild(em);
cE.onchange=function(){em.style.display=cE.checked?'block':'none';};
var msg=el('div','v9-note','');msg.style.margin='8px 0';body.appendChild(msg);var mailBox=el('div');body.appendChild(mailBox);
[txt,when,em].forEach(function(x){x.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add.click();}});});
var add=mkBtn('Add reminder','pri',function(){
var t=txt.value.trim();if(!t){msg.textContent='Write what to remember.';return;}
var d=new Date(when.value);if(!when.value||isNaN(d)||d.getTime()<Date.now()-60000){msg.textContent='Pick a time in the future.';return;}
if(list.length>=50){msg.textContent='You can keep up to 50 reminders.';return;}
var r={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:t,at:d.getTime(),n:cN.checked?1:0,done:0};
list.push(r);list.sort(function(a,b){return a.at-b.at;});save();

if(cN.checked)askNotif();
if(cC.checked)icsDownload(r);
mailBox.textContent='';if(cE.checked)mailDraft(r,em.value.trim());
txt.value='';msg.textContent='Added.';render();});
body.appendChild(add);
var note=el('div','v9-note','');note.style.margin='10px 0';body.appendChild(note);
var ul=el('div','');body.appendChild(ul);
function icsDownload(r){var u=function(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');};var e=function(s){return String(s).replace(/[\;,]/g,'\\$&').replace(/\n/g,'\\n');};
var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AI INFORMATION//Reminder//EN\r\nBEGIN:VEVENT\r\nUID:'+r.id+'@ai-information\r\nDTSTAMP:'+u(Date.now())+'\r\nDTSTART:'+u(r.at)+'\r\nDTEND:'+u(r.at+900000)+'\r\nSUMMARY:'+e(r.t)+'\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:'+e(r.t)+'\r\nTRIGGER:PT0S\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
saveFile('reminder-'+r.id+'.ics',ics,'text/calendar');}
function mailDraft(r,to){var s='Reminder: '+r.t,b=r.t+'\n\nWhen: '+new Date(r.at).toLocaleString()+'\n\n(Created with AI INFORMATION)';
var ee=encodeURIComponent,tt=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(to)?to:'';
var box=el('div','v9-row');box.style.margin='8px 0';box.appendChild(el('div','v9-note','Open the e-mail draft in:')).style.width='100%';
var a1=el('a','v9-open','📧 Mail app');a1.href='mailto:'+tt+'?subject='+ee(s)+'&body='+ee(b);
var a2=el('a','v9-open','Gmail ↗');a2.href='https://mail.google.com/mail/?view=cm&fs=1&to='+ee(tt)+'&su='+ee(s)+'&body='+ee(b);a2.target='_blank';a2.rel='noopener noreferrer';
var a3=el('a','v9-open','Outlook ↗');a3.href='https://outlook.live.com/mail/0/deeplink/compose?to='+ee(tt)+'&subject='+ee(s)+'&body='+ee(b);a3.target='_blank';a3.rel='noopener noreferrer';
[a1,a2,a3].forEach(function(a){a.style.marginRight='8px';box.appendChild(a);});
var cp=mkBtn('Copy text','',function(){try{navigator.clipboard.writeText(s+'\n'+b);toast('Copied');}catch(e){toast('Copy is not available');}});box.appendChild(cp);
box.appendChild(el('div','v9-note','The site cannot send e-mail by itself. This opens a ready draft; send it now, or use “schedule send” in your mail service to get it at the right time.')).style.width='100%';
if(mailBox.firstChild)mailBox.textContent='';mailBox.appendChild(box);}
function fire(r,late){r.done=1;save();var m='⏰ '+r.t+(late?' (missed while the site was closed)':'');
try{toast(m,'#b7791f',12000);}catch(e){}
if(r.n)showNote('⏰ '+r.t,late?'Missed while the site was closed':new Date(r.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),r.id);
render();}
function tick(){var now=Date.now();list.forEach(function(r){if(!r.done&&r.at<=now)fire(r,now-r.at>120000);});}
function render(){
ul.textContent='';
note.textContent=(CONS&&CONS.prefs)?'Reminders are saved on this device (preferences are allowed). A notification only appears while the site is open in a browser; reminders that came due while it was closed are shown when you open it again.':'Preferences are not allowed, so reminders are kept only until you close or reload this tab. You can allow them in “Cookie settings”.';
if(!list.length){ul.appendChild(el('div','v9-note','No reminders yet.'));return;}
list.forEach(function(r){var row=el('div','v9-row');row.style.cssText='justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--line)';
var tx=el('div','',(r.done?'✓ ':'⏳ ')+r.t);var wn=el('div','v9-note',new Date(r.at).toLocaleString());tx.appendChild(wn);tx.style.flex='1';
row.appendChild(tx);row.appendChild(mkBtn('📅','',function(){icsDownload(r);}));row.appendChild(mkBtn('✕','',function(){list=list.filter(function(x){return x.id!==r.id;});save();render();}));ul.appendChild(row);});
}
render();tick();setInterval(tick,15000);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();});
var btn=mkBtn('⏰ Reminders','',function(){nUpdate();when.value=when.value||localIso(new Date(Date.now()+3600000));render();openPanel('v9Remind');});
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
}


/* ===================== v57: accent colour (background stays the same) ===================== */

function initFeatures(){
var body=mkPanel('v9Feat','🎛️ Features');body.parentNode.id='v9Feat';
var G=[['Main tools',[['feed','📰 Feed','Posts and videos'],['news','🚨 Breaking news bar',''],['trending','🔥 Trending bar',''],['chat','🤖 AI Chat','Chat button'],['weather','🌤️ Weather','Button and the chip at the top'],['translator','🌍 Translator',''],['dict','📖 Dictionary',''],['calc','🧮 Calculator',''],['compare','⚖️ Compare',''],['quote','🔎 Quote context',''],['reminders','⏰ Reminders',''],['install','📲 Install','']]],
['Scam Lab',[['urlscan','🔗 URL Scanner',''],['textan','📝 Text Analyzer',''],['fakeimg','🖼️ Fake image checker',''],['weekly','🛡️ Weekly report',''],['tip','💡 AI Tip',''],['tools','🧰 Tools',''],['quiz','🎮 Quiz','']]],
['AI helpers',[['aisum','✨ AI Summary of search results','Also stops the automatic request'],['aifeed','📰 AI summary of the day in the Feed','Also stops the automatic request'],['aibtn','🤖 AI buttons inside tools','Explain, translate, check and the two-day comparison'],['foryou','✨ "For you" in Standard Search',''],['aibg','🖼️ AI picture background','Hides the picture; it stays saved']]],
['Look',[['splash','✨ Start animation','']]]];
body.appendChild(el('p','lg-p','Switch features off to hide them and stop them from running. Switch them on again here at any time. Nothing is deleted. The choice is saved on this device if you allowed storage.'));
var boxes={};
G.forEach(function(g){var h=el('h3','',g[0]);h.style.margin='16px 0 6px';body.appendChild(h);g[1].forEach(function(f){
var l=el('label','');l.style.cssText='display:flex;gap:10px;align-items:flex-start;padding:8px 10px;margin:4px 0;border:1px solid var(--border2);border-radius:10px;background:var(--bg2);cursor:pointer';
var c=document.createElement('input');c.type='checkbox';c.style.marginTop='3px';c.checked=FT.on(f[0]);boxes[f[0]]=c;
c.onchange=function(){FT.set(f[0],c.checked);};
var t=el('span','');t.appendChild(document.createTextNode(f[1]));if(f[2]){var n=el('small','',f[2]);n.style.cssText='display:block;opacity:.75';t.appendChild(n);}
l.appendChild(c);l.appendChild(t);body.appendChild(l);});});
var th=el('h3','','Theme');th.style.margin='16px 0 6px';body.appendChild(th);
body.appendChild(el('div','v9-note','Let the site pick dark or light for you. It uses the sunrise and sunset and, if you choose, the weather of the place set in Weather (the same data as the weather chip; nothing else is sent). If you press the 🌙/☀️ button yourself, automatic theme turns off.'));
var trow=el('div','');trow.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:8px 0';body.appendChild(trow);
var tinfo=el('div','v9-note','');tinfo.setAttribute('role','status');
function tmode(){var m='off';try{m=localStorage.getItem('ai_v9_autotheme')||'off';}catch(e){}return m==='time'||m==='weather'?m:'off';}
var tb=[];
function tmark(){var c=tmode();tb.forEach(function(b){b.style.outline=b.dataset.v===c?'3px solid var(--text)':'none';});var d=c!=='off'&&window.AI_AUTOTHEME_APPLY?AI_AUTOTHEME_APPLY():null;tinfo.textContent=d?'Now: '+(d.light?'light':'dark')+' because '+d.why+'.':'Manual: you choose with the 🌙/☀️ button.';}
[['off','Manual (default)'],['time','🌗 Day and night'],['weather','🌦️ Day, night and weather']].forEach(function(o){var b=mkBtn(o[1],'',function(){try{store.set('ai_v9_autotheme',o[0]);}catch(e){}try{localStorage.setItem('ai_v9_autotheme',o[0]);}catch(e){}if(o[0]==='off'){var sv=store.get('ai_info_theme');var lt=sv==='light';document.body.classList.toggle('light-theme',lt);document.documentElement.style.colorScheme=lt?'light':'dark';document.querySelectorAll('.theme-btn').forEach(function(x){x.textContent=lt?'☀️':'🌙';});}tmark();if(o[0]!=='off'){var dd=window.AI_AUTOTHEME_APPLY&&AI_AUTOTHEME_APPLY();if(dd)toast('Automatic theme on: '+(dd.light?'light':'dark')+' because '+dd.why+'.','var(--accent)',4000);}else toast('Manual theme.','var(--accent)',2000);});b.style.margin='0';b.dataset.v=o[0];tb.push(b);trow.appendChild(b);});
var mrow=el('div','v9-row');mrow.style.marginTop='8px';mrow.appendChild(el('div','v9-note','Choose by hand (this turns automatic off):')).style.width='100%';
[['☀️ Light',true],['🌙 Dark',false]].forEach(function(o){var mb=mkBtn(o[0],'',function(){try{store.set('ai_v9_autotheme','off');}catch(e){}try{localStorage.setItem('ai_v9_autotheme','off');}catch(e){}if(document.body.classList.contains('light-theme')!==o[1])toggleTheme();setTimeout(function(){try{store.set('ai_info_theme',o[1]?'light':'dark');}catch(e){}tmark();},700);});mb.style.margin='0';mrow.appendChild(mb);});
body.appendChild(mrow);
var prow=el('div','v9-row');prow.style.marginTop='8px';prow.appendChild(el('div','v9-note','Try how it looks (5 seconds, then it returns to automatic):')).style.width='100%';
[['☀️ Day, clear',true],['🌧️ Day, rain',false],['🌙 Night',false]].forEach(function(o){var pb=mkBtn(o[0],'',function(){var lt=o[1];document.body.classList.toggle('light-theme',lt);document.documentElement.style.colorScheme=lt?'light':'dark';document.querySelectorAll('.theme-btn').forEach(function(x){x.textContent=lt?'☀️':'🌙';});toast('Preview: '+(lt?'light':'dark'),'var(--accent)',2000);clearTimeout(window._atPv);window._atPv=setTimeout(function(){if(tmode()!=='off'&&window.AI_AUTOTHEME_APPLY)AI_AUTOTHEME_APPLY();else{var lt2=store.get('ai_info_theme')==='light';document.body.classList.toggle('light-theme',lt2);document.documentElement.style.colorScheme=lt2?'light':'dark';document.querySelectorAll('.theme-btn').forEach(function(x){x.textContent=lt2?'☀️':'🌙';});}},5000);});pb.style.margin='0';prow.appendChild(pb);});
body.appendChild(prow);
body.appendChild(tinfo);window.AI_AUTOTHEME_REFRESH=tmark;tmark();
var ah=el('h3','','Animations');ah.style.margin='16px 0 6px';body.appendChild(ah);
body.appendChild(el('div','v9-note','Many animations (the shine around the logo, hover effects, the start animation) are switched off when your device asks to reduce motion. This is often on by default on a computer (Windows: Settings > Accessibility > Visual effects > Animation effects), and usually off on a phone. Here you can choose for this site only.'));
var arow=el('div','');arow.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:8px 0';body.appendChild(arow);
body.appendChild(el('div','v9-note','⚠️ If animations are forced on (Always on), the site can be slower to start, especially on older phones and on slow connections.'));
function curAnim(){var p='auto';try{p=localStorage.getItem('ai_v9_anim')||'auto';}catch(e){}return p==='on'||p==='off'?p:'auto';}
var abtns=[];
[['auto','Follow my device (default)'],['on','Always on'],['off','Off']].forEach(function(o){var b=mkBtn(o[1],'',function(){try{store.set('ai_v9_anim',o[0]);}catch(e){}if(!store.get('ai_v9_anim'))try{localStorage.setItem('ai_v9_anim',o[0]);}catch(e){}if(window.AI_ANIM_APPLY)AI_ANIM_APPLY();if(window.AI_A11Y_APPLY)AI_A11Y_APPLY();mark();toast(o[0]==='on'?'Animations are on':o[0]==='off'?'Animations are off':'Animations follow your device','var(--accent)',2500);});b.style.margin='0';b.dataset.v=o[0];abtns.push(b);arow.appendChild(b);});
function mark(){var c=curAnim();abtns.forEach(function(b){b.style.outline=b.dataset.v===c?'3px solid var(--text)':'none';});}mark();
try{featExtras(body);}catch(e){}
var all=mkBtn('Turn everything on','pri',function(){Object.keys(FT.off()).forEach(function(k){FT.set(k,true);});Object.keys(boxes).forEach(function(k){boxes[k].checked=true;});toast('All features are on','var(--accent)',2500);});all.style.marginTop='14px';body.appendChild(all);
body.appendChild(el('p','v9-note','Always on: Accessibility, Language, Quick clear, Content filter, Colour, and this menu.'));
var hb=document.querySelector('.hdr-tools');var b=el('button','hdr-chip','🎛️ Features');b.id='ftBtn';b.type='button';b.setAttribute('aria-label','Features: switch features on or off');b.onclick=function(){openPanel('v9Feat');};
if(hb)hb.appendChild(b);
FT.css();FT.tag();[400,1500,4000].forEach(function(ms){setTimeout(FT.tag,ms);});
try{var mo=new MutationObserver(function(){clearTimeout(FT._t);FT._t=setTimeout(FT.tag,200);});['v9Bar','scamLabBar','feedBar'].forEach(function(id){var e=document.getElementById(id);if(e)mo.observe(e,{childList:true,subtree:true});});}catch(e){}
}
/* ---- why the site asks for your location (shown before the browser asks) ---- */
function explainLocation(go){
var id='v9LocWhy';var old=$(id);if(old)old.remove();
var b=mkPanel(id,'📍 Why location?');b.parentNode.id=id;
b.appendChild(el('p','lg-p','The site would like to know where you are for one reason only: to show the weather for your area.'));
var ul=el('ul','lg-ul');['Your device sends its coordinates to Open-Meteo (a free weather service) to get the forecast.','The coordinates are not sent to this site’s server, not used for ads, and not shared with anyone else.','The place is saved on your device only if you allowed “Preferences” in the cookie choices.','Next your browser will ask you for permission. You can say “No”: you can always type a city name instead.'].forEach(function(t){ul.appendChild(el('li','',t));});b.appendChild(ul);
var r=el('div','v9-row');r.appendChild(mkBtn('Continue','pri',function(){closePanel(id);setTimeout(go,150);}));r.appendChild(mkBtn('Not now','',function(){closePanel(id);}));b.appendChild(r);
openPanel(id);
}
/* ---- Feed cache: choose 150 MB / 1 / 3 / 5 / 9 GB with honest hardware notes ---- */
function initCache(){
var SZ=[
{mb:150,name:'150 MB',tag:'Light',vids:'about 6 videos',free:'1 GB',ram:2,store:'any storage (eMMC is fine)',total:'Any phone or computer',ff:'Firefox needs at least 1.5 GB of total storage',net:'under a minute on Wi-Fi'},
{mb:1024,name:'1 GB',tag:'Balanced',vids:'about 40 videos',free:'3 GB',ram:3,store:'any storage (eMMC is fine)',total:'At least 4 GB of total storage',ff:'Firefox needs at least 10 GB of total storage',net:'about 3 minutes at 50 Mbit/s'},
{mb:3072,name:'3 GB',tag:'Large',vids:'about 120 videos',free:'8 GB',ram:4,store:'UFS 2.1 or better, or an SSD (eMMC ≈ 125 MB/s writes: slow to fill)',total:'At least 32 GB of total storage',ff:'Firefox needs at least 30 GB of total storage',net:'about 8 minutes at 50 Mbit/s'},
{mb:5120,name:'5 GB',tag:'Heavy',vids:'about 200 videos',free:'12 GB',ram:6,store:'UFS 3.x or an SSD',total:'At least 64 GB of total storage',ff:'Firefox needs at least 50 GB of total storage',net:'about 14 minutes at 50 Mbit/s'},
{mb:9216,name:'9 GB',tag:'Maximum',vids:'about 360 videos',free:'20 GB',ram:8,store:'UFS 3.1 / 4.0 or an NVMe SSD',total:'At least 128 GB of total storage',ff:'Firefox needs about 90 GB of total storage (and caps one site at 10 GiB)',net:'about 25 minutes at 50 Mbit/s; use Wi-Fi'}
];
var b=mkPanel('v9Cache','💾 Feed cache');b.parentNode.id='v9Cache';
var note=el('p','lg-p','The feed saves videos on this device so they start at once and keep working offline. Pick the most it may use. When the limit is reached, the oldest videos are removed first. The limit is checked against the real size of the saved files.');
b.appendChild(note);
var dev=el('div','v9-note');dev.id='cDev';b.appendChild(dev);
var st=el('div','cc-use');b.appendChild(st);
var offBox=el('div','v9-card');b.appendChild(offBox);
var list=el('div');b.appendChild(list);
var wl=el('label','cb-o');var wc=el('input');wc.type='checkbox';wc.checked=VC.wifi;wc.onchange=function(){VC.wifi=wc.checked;store.set('ai_vcwifi',wc.checked?'1':'0');};wl.appendChild(wc);var wd=el('span','cb-od');wd.appendChild(el('b','','Save videos only on Wi-Fi'));wd.appendChild(el('span','','Does not use mobile data for background saving (works where the browser tells the site the connection type; other browsers cannot tell).'));wl.appendChild(wd);b.appendChild(wl);
var clr=mkBtn('🗑️ Clear saved videos','',function(){
if(!window.caches){return;}caches.delete(VC.name).then(function(){VC.idx={};VC.state={};VC.q=[];vcSave();toast('Saved videos cleared','var(--accent)');refresh();});
});clr.style.marginTop='10px';b.appendChild(clr);
b.appendChild(el('p','v9-note','How the hardware advice was worked out: browsers allow one site up to about 60% of the device’s total storage in Chrome, Edge and Safari, but only 10% (maximum 10 GiB) in Firefox (MDN, “Storage quotas and eviction criteria”). Typical sequential write speeds are about 125 MB/s for eMMC 5.1, 410 to 1,200 MB/s for UFS 3.0 / 3.1 and about 2,800 MB/s for UFS 4.0. RAM and free-space numbers are recommendations so the device stays smooth, not hard limits.'));
var quota=0,usage=0,sel=+store.get('ai_vcsize')||1024;
function used(){var t=0,k;for(k in VC.idx)t+=VC.idx[k].s||0;return t;}
function gb(n){return (n/1073741824).toFixed(n<1073741824*10?2:1)+' GB';}
function refresh(){
var u=used();
dev.textContent='';
var mem=navigator.deviceMemory;
dev.appendChild(document.createTextNode('This browser allows this site up to '+(quota?gb(quota):'an unknown amount')+' of storage. '+(mem?'The device reports about '+(mem>=8?'8 GB or more':mem+' GB')+' of RAM'+(navigator.hardwareConcurrency?' and '+navigator.hardwareConcurrency+' CPU cores':'')+'. ':'')));
st.textContent='Saved now: '+gb(u)+' of '+SZ.filter(function(x){return x.mb===sel;})[0].name+(cacheOK()?'':' (offline cache is off)');
var bar=el('div','cc-bar');var fill=el('i');fill.style.width=Math.min(100,u/(sel*1048576)*100)+'%';bar.appendChild(fill);st.appendChild(bar);
offBox.textContent='';
if(!cacheOK()){offBox.appendChild(el('b','','Offline cache is off. '));offBox.appendChild(document.createTextNode('Videos are not saved until you allow it.'));var on=mkBtn('Allow the offline cache','pri',function(){applyConsent({prefs:CONS?CONS.prefs:0,cache:1});refresh();});on.style.cssText='display:block;margin-top:8px';offBox.appendChild(on);offBox.style.display='block';}else offBox.style.display='none';
list.textContent='';
SZ.forEach(function(o){
var need=o.mb*1048576,tooBig=quota&&need>quota*0.9;
var ramWarn=navigator.deviceMemory&&navigator.deviceMemory<o.ram;
var card=el('button','cc-o'+(o.mb===sel?' on':'')+(tooBig?' off':''));card.type='button';card.disabled=!!tooBig;card.setAttribute('role','radio');card.setAttribute('aria-checked',o.mb===sel?'true':'false');
var h=el('div','cc-h');h.appendChild(el('b','',o.name));h.appendChild(el('span','cc-tag',o.tag));
h.appendChild(el('span','cc-st',tooBig?'⛔ too large for this browser':ramWarn?'⚠️ low RAM':quota&&need>quota*0.5?'⚠️ may not fit':'✅ fits'));card.appendChild(h);
var ul=el('ul','cc-ul');
['Holds '+o.vids+' (about 25 MB each at 480p; HD and 4K files are larger).','Free space on the device: at least '+o.free+'. '+o.total+'.','RAM: at least '+o.ram+' GB. Storage: '+o.store+'.',o.ff+'.','First fill: '+o.net+'. Uses mobile data if Wi-Fi-only is off.'].forEach(function(t){ul.appendChild(el('li','',t));});
card.appendChild(ul);
card.onclick=function(){
if(!cacheOK()){toast('Allow the offline cache first','#ffaa00');return;}
sel=o.mb;store.set('ai_vcsize',String(o.mb));vcApplySize(o.mb);vcEvict();
try{if(o.mb>=1024&&navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
toast('Feed cache limit: '+o.name,'var(--accent)');logAct('cache','limit '+o.name);refresh();
};
list.appendChild(card);
});
}
function fit(){
if(!quota)return;
var fits=SZ.filter(function(o){return o.mb*1048576<=quota*0.9;});
if(!store.get('ai_vcsize')||SZ.filter(function(o){return o.mb===sel;})[0].mb*1048576>quota*0.9){sel=(fits.length?fits[fits.length-1]:SZ[0]).mb;vcApplySize(sel);}
VC.max=Math.min(VC.max,Math.floor(quota*0.8));VC.per=Math.min(VC.per,Math.floor(VC.max/2));
}
function load(){
try{if(navigator.storage&&navigator.storage.estimate)return navigator.storage.estimate().then(function(e){quota=e&&e.quota||0;usage=e&&e.usage||0;fit();}).catch(function(){});}catch(e){}
return Promise.resolve();
}
load();
window.AI_CACHE={open:function(){load().then(function(){if(store.get('ai_vcsize'))sel=+store.get('ai_vcsize');refresh();openPanel('v9Cache');});}};
var fbar=$('feedBar');
if(fbar){var fh=fbar.firstChild;if(fh){var cb=mkBtn('💾 Cache','',function(){window.AI_CACHE.open();});cb.setAttribute('aria-label','Feed cache size');fh.insertBefore(cb,fh.lastChild);
}}
}

/* ===================== v39: Beta link + Standard Mode (search-engine style results) ===================== */
function initBeta(){
if(window.AI_BETA)return;
var body=mkPanel('v9Beta','🧪 Beta version');
var c=el('div','v9-card');
c.appendChild(el('b','','Try the Beta version of the site'));
var p=el('div','v9-note','The Beta version is where new features are tried first. It can be a little different or less stable than this version.');p.style.margin='8px 0';c.appendChild(p);
var w=el('div','rep-badge lvl-medium','⚠️ New features do not always appear in the Beta version straight away. Sometimes it has nothing new yet, and sometimes a feature is added there later.');w.style.margin='10px 0';c.appendChild(w);
var a=el('a','v9-open','Open the Beta version ↗');a.href='https://beta-ai-information.pages.dev/';a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('translate','no');
a.style.cssText='display:inline-block;padding:12px 18px;border-radius:22px;background:var(--accent);color:var(--bg);font-weight:bold;text-decoration:none;margin-top:6px';
c.appendChild(a);
var u=el('div','v9-note','https://beta-ai-information.pages.dev/');u.setAttribute('translate','no');u.style.marginTop='10px';c.appendChild(u);
body.appendChild(c);
var btn=mkBtn('🧪 Beta','',function(){openPanel('v9Beta');});
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
}

function initStd(){
var body=mkPanel('v9Std','Standard Mode');var P=body.parentNode;P.classList.add('std');
var ph=P.querySelector('.v9-ph');if(ph)ph.style.display='none';
var wrap=el('div','std-wrap home');body.appendChild(wrap);
var top=el('div','std-top');
var back=el('button','std-x','✕');back.type='button';back.setAttribute('aria-label','Close Standard Mode');back.onclick=function(){closePanel('v9Std');};
var logo=el('div','std-logo','AI INFORMATION');logo.setAttribute('translate','no');logo.onclick=function(){goHome();};
var pillBox=el('div','std-pillbox');
var pill=el('div','std-pill');
var mag=el('span','std-mag','🔍');
var inp=el('input');inp.type='search';inp.placeholder='Search';inp.setAttribute('aria-label','Search');inp.maxLength=120;inp.setAttribute('autocomplete','off');inp.setAttribute('enterkeyhint','search');inp.setAttribute('translate','no');
var clr=el('button','std-clr','✕');clr.type='button';clr.setAttribute('aria-label','Clear');clr.style.display='none';
pill.appendChild(mag);pill.appendChild(inp);pill.appendChild(clr);
var sug=el('div','std-sug');sug.style.display='none';
pillBox.appendChild(pill);pillBox.appendChild(sug);
top.appendChild(back);top.appendChild(logo);top.appendChild(pillBox);
var homeBtns=el('div','std-hb');
var b1=el('button','std-b','Search');b1.type='button';b1.onclick=function(){run();};
var b2=el('button','std-b','Verify sources (Classic mode)');b2.type='button';b2.onclick=function(){var q=inp.value.trim();closePanel('v9Std');if(q&&$('q')){$('q').value=q;try{window.scrollTo(0,0);}catch(e){}if(typeof doSearch==='function')doSearch();}};
homeBtns.appendChild(b1);homeBtns.appendChild(b2);
var tabs=el('div','std-tabs');
var TABS=[['all','All'],['images','Images'],['news','News']],tabBtn={};
TABS.forEach(function(t){var b=el('button','std-tab',t[1]);b.type='button';b.onclick=function(){setTab(t[0]);};tabs.appendChild(b);tabBtn[t[0]]=b;});
var meta=el('div','std-meta');var res=el('div','std-res');var more=el('div','std-more');more.style.cssText='display:none;text-align:center;margin:10px 0;padding:0;border:0;background:none;cursor:default';
wrap.appendChild(top);wrap.appendChild(homeBtns);wrap.appendChild(tabs);wrap.appendChild(meta);var sumWrap=el('div','std-sum');sumWrap.setAttribute('data-ft','aisum');wrap.appendChild(sumWrap);var curList=[],sumSt=null,sumTimer=0;wrap.appendChild(res);wrap.appendChild(more);
var fyWrap=el('div','std-fy');fyWrap.setAttribute('data-ft','foryou');fyWrap.style.cssText='margin:10px 0';
function fyDraw(){
fyWrap.textContent='';
var rc=jget('ai_v9_recent',[]).slice(0,8);
var b=el('button','std-b','✨ For you (AI)');b.type='button';b.style.cssText='border-radius:999px;padding:8px 16px;font-weight:700';fyWrap.appendChild(b);
fyWrap.appendChild(el('div','v9-note','The AI reads your last searches (kept only on this device), suggests related topics, and our script then loads pictures and short texts for them. Nothing is sent until you press.'));
var out=el('div');fyWrap.appendChild(out);
b.onclick=function(){
rc=jget('ai_v9_recent',[]).slice(0,8);
if(!rc.length){out.textContent='Search for something first, then the AI can suggest more.';return;}
b.disabled=true;out.textContent='Asking the AI model…';
aiAsk('suggest',{text:rc.join('\n')}).then(function(j){
var tp=(j.topics||[]).filter(function(t){return kidOK({title:t,text:''});}).slice(0,4);if(!tp.length)throw new Error('no topics');
out.textContent='';out.appendChild(el('div','v9-note','🤖 Topics suggested by the AI model ('+mName(j.model)+'). It can be wrong; the pictures and texts come from open sources.'));
tp.forEach(function(t){
var card=el('div','v9-card');card.style.cssText='margin:8px 0;padding:10px';
var tb=el('button','std-b','🔎 '+t);tb.type='button';tb.onclick=function(){inp.value=t;run();};card.appendChild(tb);
var g=el('div','std-grid');g.style.marginTop='6px';card.appendChild(g);var tx=el('div','v9-note','');card.appendChild(tx);out.appendChild(card);
imgPage(t,0).then(function(a){a.filter(function(x){return x&&x.thumb&&kidOK({title:x.title,license:x.license});}).slice(0,4).forEach(function(x){var c=el('a','std-ic');c.href=safe(x.url);c.target='_blank';c.rel='noopener noreferrer';var im=new Image();im.loading='lazy';im.alt=x.title||t;im.referrerPolicy='strict-origin-when-cross-origin';im.src=safe(x.thumb);im.onerror=function(){c.remove();};c.appendChild(im);g.appendChild(c);});}).catch(function(){});
webPage(t,0).then(function(a){var r=(a||[]).filter(function(x){return kidOK({title:x.title,text:x.text,source:x.source});})[0];if(r){tx.textContent=String(r.title||'')+' — '+String(r.text||'').slice(0,200);}}).catch(function(){});
});
b.disabled=false;
}).catch(function(e){b.disabled=false;out.textContent=aiErrText(e);});
};
}
fyDraw();wrap.insertBefore(fyWrap,sumWrap);

wrap.appendChild(el('div','std-foot','Standard Mode · results come from free public sources. They are not checked for truth.'));
var q='',tab='all',data={},shown=10,t0=0,seq=0;
function lang(){return /[Ѐ-ӿ]/.test(q)?'bg':'en';}
function safe(u){u=safeUrl(u);return u==='#'?'':u;}
function pretty(u){try{var x=new URL(u);var parts=x.pathname.split('/').filter(Boolean).slice(0,3).map(function(s){try{return decodeURIComponent(s);}catch(e){return s;}});return x.hostname.replace(/^www\./,'')+(parts.length?' › '+parts.join(' › '):'');}catch(e){return u;}}
function strip(h){try{return new DOMParser().parseFromString(String(h||''),'text/html').body.textContent||'';}catch(e){return '';}}
var imgIO=null;
function imgAuto(S){
if(imgIO){imgIO.disconnect();imgIO=null;}
var lb=el('label','v9-note');lb.style.cssText='display:flex;gap:8px;align-items:center;margin:6px 4px;cursor:pointer';var cb=document.createElement('input');cb.type='checkbox';cb.checked=jget('ai_v9_imgauto',false)===true;
cb.onchange=function(){jset('ai_v9_imgauto',cb.checked);imgAuto(S);};lb.appendChild(cb);lb.appendChild(document.createTextNode('Auto: load more pictures while I scroll'));more.appendChild(lb);
if(!cb.checked||!window.IntersectionObserver||S.items.length<S.shown)return;
var sen=el('div');sen.style.cssText='height:2px;width:100%';more.appendChild(sen);
imgIO=new IntersectionObserver(function(en){if(en[0]&&en[0].isIntersecting&&pickFn){imgIO.disconnect();imgIO=null;pickFn(10);}},{rootMargin:'700px'});imgIO.observe(sen);}
function goHome(){try{fyDraw();}catch(e){}sumSt=null;clearTimeout(sumTimer);sumWrap.textContent='';seq++;wrap.classList.add('home');q='';inp.value='';clr.style.display='none';res.textContent='';meta.textContent='';more.style.display='none';hideSug();setTimeout(function(){try{inp.focus();}catch(e){}},50);}
function setTab(t){tab=t;shown=10;Object.keys(tabBtn).forEach(function(k){tabBtn[k].classList.toggle('on',k===t);});if(t!=='all'){grpSel='';gbar.textContent='';gbar.style.display='none';}if(q)load(t);}
function run(){var v=inp.value.trim();if(v.length<2){toast('Type at least 2 letters','#ffaa00');return;}q=v;data={};sumSt=null;clearTimeout(sumTimer);sumWrap.textContent='';shown=10;wrap.classList.remove('home');hideSug();inp.blur();
var r=jget('ai_v9_recent',[]).filter(function(x){return x.toLowerCase()!==v.toLowerCase();});r.unshift(v);jset('ai_v9_recent',r.slice(0,10));logAct('search','std: '+v);
setTab(tab);}
/* ---- data loaders ---- */
function wikiRaw(q){var l=lang();return fetch('https://'+l+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=8&srsearch='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){return((j.query||{}).search||[]).map(function(x){return{title:x.title,url:'https://'+l+'.wikipedia.org/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_')),source:'Wikipedia',text:strip(x.snippet),t:0};});}).catch(function(){return[];});}
function gdeltRaw(q){
var words=String(q||'').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
var stop=/^(the|and|with|from|what|who|how|why|when|where|is|are|was|were|for|you|your|какво|как|защо|кога|къде|кой|коя|кои|ли|е|са|и|на|от|във|в|с|до|по)$/;
words=words.filter(function(w){return w.length>2&&!stop.test(w);});
var raw=String(q||'').trim().toLocaleLowerCase();
var query='"'+String(q||'').replace(/["\\]/g,' ').trim()+'"';
return J('https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&format=json&maxrecords=12&sort=datedesc&query='+E(query)).then(function(j){
return(j.articles||[]).map(function(x){var t=0;if(x.seendate){var m=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(x.seendate);if(m)t=Math.floor(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6])/1000);}return{title:x.title,url:x.url,source:'GDELT news',text:x.domain||'',t:t};})
.filter(function(x){var title=String(x.title||'').toLocaleLowerCase();return words.length?words.every(function(w){return title.indexOf(w)>=0;}):!!raw&&title.indexOf(raw)>=0;});
}).catch(function(){return[];});
}
function hnRaw(q){return fetch('https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=6&query='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){return(j.hits||[]).filter(function(x){return x.title;}).map(function(x){return{title:x.title,url:x.url||('https://news.ycombinator.com/item?id='+x.objectID),source:'Hacker News',text:(x.points||0)+' points · '+(x.num_comments||0)+' comments',t:x.created_at_i||0};});}).catch(function(){return[];});}
function J(u){var c=window.AbortController?new AbortController():null,t=c&&setTimeout(function(){c.abort();},4500);return fetch(u,{credentials:'omit',referrerPolicy:'no-referrer',signal:c?c.signal:undefined}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.json();},function(e){clearTimeout(t);throw e;});}
function E(v){return encodeURIComponent(v);}
function mw(host,label,q,p){return J('https://'+host+'/w/api.php?action=query&format=json&origin=*&list=search&srlimit=10&sroffset='+(p*10)+'&srsearch='+E(q)).then(function(j){return((j.query||{}).search||[]).map(function(x){return{title:x.title,url:'https://'+host+'/wiki/'+E(x.title.replace(/ /g,'_')),source:label,text:strip(x.snippet),t:0};});}).catch(function(){return[];});}
function iaRaw(q,p){return J('https://archive.org/advancedsearch.php?q='+E(q+' AND NOT subject:(nude OR erotic OR porn OR adult OR xxx)')+'&fl[]=identifier&fl[]=title&fl[]=description&rows=10&page='+(p+1)+'&output=json').then(function(j){return(((j.response||{}).docs)||[]).filter(function(x){return x.title;}).map(function(x){var d=Array.isArray(x.description)?x.description[0]:x.description;return{title:String(x.title),url:'https://archive.org/details/'+E(x.identifier),source:'Internet Archive',text:strip(d||'').slice(0,240),t:0};});}).catch(function(){return[];});}
function olRaw(q,p){return J('https://openlibrary.org/search.json?limit=10&page='+(p+1)+'&fields=key,title,author_name,first_publish_year&q='+E(q)).then(function(j){return(j.docs||[]).map(function(x){return{title:x.title,url:'https://openlibrary.org'+x.key,source:'Open Library',text:(x.author_name?x.author_name.slice(0,2).join(', ')+' · ':'')+(x.first_publish_year||''),t:0};});}).catch(function(){return[];});}
function crRaw(q,p){return J('https://api.crossref.org/works?rows=10&offset='+(p*10)+'&select=title,URL,container-title,author&query='+E(q)).then(function(j){return((j.message||{}).items||[]).filter(function(x){return x.title&&x.title[0]&&x.URL;}).map(function(x){return{title:x.title[0],url:x.URL,source:'Crossref (research)',text:(x['container-title']&&x['container-title'][0])||'',t:0};});}).catch(function(){return[];});}
function oaRaw(q,p){return J('https://api.openalex.org/works?per-page=10&page='+(p+1)+'&search='+E(q)).then(function(j){return(j.results||[]).filter(function(x){return x.display_name;}).map(function(x){var u=(x.primary_location&&x.primary_location.landing_page_url)||x.doi||x.id;return{title:x.display_name,url:u,source:'OpenAlex (research)',text:(x.publication_year||'')+(x.cited_by_count?' · cited '+x.cited_by_count+' times':''),t:0};});}).catch(function(){return[];});}
function pmcRaw(q,p){return J('https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=10&page='+(p+1)+'&query='+E(q)).then(function(j){return(((j.resultList||{}).result)||[]).filter(function(x){return x.title&&x.id;}).map(function(x){return{title:strip(x.title),url:'https://europepmc.org/article/'+E(x.source||'MED')+'/'+E(x.id),source:'Europe PMC (science)',text:(x.journalTitle||'')+(x.pubYear?' · '+x.pubYear:''),t:0};});}).catch(function(){return[];});}
function seRaw(q,p){return J('https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&site=stackoverflow&pagesize=10&page='+(p+1)+'&q='+E(q)).then(function(j){return(j.items||[]).map(function(x){return{title:strip(x.title),url:x.link,source:'Stack Overflow',text:(x.score||0)+' votes · '+(x.answer_count||0)+' answers',t:x.creation_date||0};});}).catch(function(){return[];});}
function inter(lists){var out=[],i=0,more=true;while(more){more=false;lists.forEach(function(l){if(i<l.length){out.push(l[i]);more=true;}});i++;}return out;}
function mk(label,urlf,mapf,nopage){return function(q,p){if(nopage&&p>0)return Promise.resolve([]);return J(urlf(q,p)).then(function(j){return(mapf(j,q)||[]).filter(function(x){return x&&x.title&&x.url;}).map(function(x){x.source=label;x.text=x.text?String(x.text):'';x.t=x.t||0;return x;});}).catch(function(){return[];});};}
function sx(v){return strip(v||'').replace(/\s+/g,' ').trim();}
var GROUP={'Wikipedia':'Encyclopedias','Wikipedia (DE)':'Encyclopedias','Wikipedia (FR)':'Encyclopedias','Wikipedia (ES)':'Encyclopedias','Wikipedia (RU)':'Encyclopedias','Simple Wikipedia':'Encyclopedias','Wikidata':'Encyclopedias','Wikispecies':'Encyclopedias','Wikiquote':'Encyclopedias','Wiktionary':'Encyclopedias',
'Wikibooks':'Learning','Wikiversity':'Learning','Wikisource':'Learning','Wikivoyage':'Places','Internet Archive':'Books','Open Library':'Books','Project Gutenberg':'Books','Google Books':'Books','Library of Congress':'Books',
'Crossref (research)':'Science','OpenAlex (research)':'Science','Europe PMC (science)':'Science','DOAJ (open journals)':'Science','Semantic Scholar':'Science','INSPIRE (physics)':'Science','Zenodo':'Science','DataCite':'Science',
'Stack Overflow':'Code','Super User':'Code','Math Stack Exchange':'Code','Physics Stack Exchange':'Code','History Stack Exchange':'Code','GitHub':'Code','npm':'Code',
'Hacker News':'News','GDELT news':'News','Wikinews':'News','Spaceflight News':'News','GBIF (species)':'Nature','iNaturalist':'Nature','Cleveland Museum of Art':'Culture','MusicBrainz':'Culture',
'OpenStreetMap':'Places','REST Countries':'Places','TheMealDB':'Food','Open Food Facts':'Food'};
function grpOf(r){return r.g||GROUP[r.source]||'Other';}
function seX(site,label){return mk(label,function(q,p){return 'https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&site='+site+'&pagesize=10&page='+(p+1)+'&q='+E(q);},function(j){return(j.items||[]).map(function(x){return{title:sx(x.title),url:x.link,text:(x.score||0)+' votes · '+(x.answer_count||0)+' answers',t:x.creation_date||0};});});}
var MORE=[
mk('Project Gutenberg',function(q,p){return 'https://gutendex.com/books/?page='+(p+1)+'&search='+E(q);},function(j){return(j.results||[]).map(function(x){return{title:x.title,url:'https://www.gutenberg.org/ebooks/'+x.id,text:((x.authors||[])[0]||{}).name||''};});}),
mk('Google Books',function(q,p){return 'https://www.googleapis.com/books/v1/volumes?maxResults=10&startIndex='+(p*10)+'&q='+E(q);},function(j){return(j.items||[]).map(function(x){var v=x.volumeInfo||{};return{title:v.title,url:v.infoLink,text:((v.authors||[]).slice(0,2).join(', ')+' '+sx(v.description)).slice(0,240)};});}),
mk('Library of Congress',function(q,p){return 'https://www.loc.gov/search/?fo=json&c=10&sp='+(p+1)+'&q='+E(q);},function(j){return(j.results||[]).map(function(x){return{title:x.title,url:x.url||x.id,text:sx(Array.isArray(x.description)?x.description[0]:x.description).slice(0,240)};});}),
mk('DOAJ (open journals)',function(q,p){return 'https://doaj.org/api/search/articles/'+E(q)+'?pageSize=10&page='+(p+1);},function(j){return(j.results||[]).map(function(x){var b=x.bibjson||{};return{title:b.title,url:((b.link||[])[0]||{}).url||('https://doaj.org/article/'+x.id),text:(b.journal&&b.journal.title)||''};});}),
mk('Semantic Scholar',function(q,p){return 'https://api.semanticscholar.org/graph/v1/paper/search?limit=10&offset='+(p*10)+'&fields=title,url,year,venue&query='+E(q);},function(j){return(j.data||[]).map(function(x){return{title:x.title,url:x.url,text:(x.venue||'')+(x.year?' · '+x.year:'')};});}),
mk('INSPIRE (physics)',function(q,p){return 'https://inspirehep.net/api/literature?size=10&page='+(p+1)+'&fields=titles,control_number&q='+E(q);},function(j){return((j.hits||{}).hits||[]).map(function(x){var m=x.metadata||{};return{title:((m.titles||[])[0]||{}).title,url:'https://inspirehep.net/literature/'+m.control_number};});}),
mk('Zenodo',function(q,p){return 'https://zenodo.org/api/records?size=10&page='+(p+1)+'&q='+E(q);},function(j){return((j.hits||{}).hits||[]).map(function(x){var m=x.metadata||{};return{title:m.title,url:(x.links||{}).self_html,text:sx(m.description).slice(0,240)};});}),
mk('DataCite',function(q,p){return 'https://api.datacite.org/dois?page%5Bsize%5D=10&page%5Bnumber%5D='+(p+1)+'&query='+E(q);},function(j){return(j.data||[]).map(function(x){var a=x.attributes||{};return{title:((a.titles||[])[0]||{}).title,url:a.url||('https://doi.org/'+x.id),text:a.publicationYear||''};});}),
seX('superuser','Super User'),seX('math','Math Stack Exchange'),seX('physics','Physics Stack Exchange'),seX('history','History Stack Exchange'),
mk('GitHub',function(q,p){return 'https://api.github.com/search/repositories?per_page=10&page='+(p+1)+'&q='+E(q);},function(j){return(j.items||[]).map(function(x){return{title:x.full_name,url:x.html_url,text:(x.description||'')+' · ★ '+(x.stargazers_count||0)};});}),
mk('npm',function(q,p){return 'https://registry.npmjs.org/-/v1/search?size=10&from='+(p*10)+'&text='+E(q);},function(j){return(j.objects||[]).map(function(x){var k=x.package||{};return{title:k.name,url:(k.links||{}).npm,text:k.description||''};});}),
mk('Spaceflight News',function(q,p){return 'https://api.spaceflightnewsapi.net/v4/articles/?limit=10&offset='+(p*10)+'&search='+E(q);},function(j){return(j.results||[]).map(function(x){return{title:x.title,url:x.url,text:x.summary,t:x.published_at?Math.floor(Date.parse(x.published_at)/1000):0};});}),
mk('GBIF (species)',function(q,p){return 'https://api.gbif.org/v1/species/search?limit=10&offset='+(p*10)+'&q='+E(q);},function(j){return(j.results||[]).map(function(x){return{title:x.scientificName,url:'https://www.gbif.org/species/'+x.key,text:[x.rank,x.kingdom,x.family].filter(Boolean).join(' · ')};});}),
mk('iNaturalist',function(q,p){return 'https://api.inaturalist.org/v1/taxa?per_page=10&page='+(p+1)+'&q='+E(q);},function(j){return(j.results||[]).map(function(x){return{title:(x.preferred_common_name?x.preferred_common_name+' – ':'')+x.name,url:'https://www.inaturalist.org/taxa/'+x.id,text:x.rank||''};});}),
mk('Cleveland Museum of Art',function(q,p){return 'https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=10&skip='+(p*10)+'&q='+E(q);},function(j){return(j.data||[]).map(function(x){return{title:x.title,url:x.url,text:(((x.creators||[])[0]||{}).description||'')+' · '+(x.type||'')};});}),
mk('MusicBrainz',function(q,p){return 'https://musicbrainz.org/ws/2/artist?fmt=json&limit=10&offset='+(p*10)+'&query='+E(q);},function(j){return(j.artists||[]).map(function(x){return{title:x.name,url:'https://musicbrainz.org/artist/'+x.id,text:[x.disambiguation,x.country].filter(Boolean).join(' · ')};});}),
mk('OpenStreetMap',function(q){return 'https://nominatim.openstreetmap.org/search?format=json&limit=8&q='+E(q);},function(j){return(Array.isArray(j)?j:[]).map(function(x){return{title:x.display_name,url:'https://www.openstreetmap.org/'+x.osm_type+'/'+x.osm_id,text:x.type||''};});},true),
mk('REST Countries',function(q){return 'https://restcountries.com/v3.1/name/'+E(q)+'?fields=name,capital,region,population';},function(j){return(Array.isArray(j)?j:[]).slice(0,4).map(function(x){return{title:(x.name||{}).common,url:'https://en.wikipedia.org/wiki/'+E(String((x.name||{}).common||'').replace(/ /g,'_')),text:'Capital: '+((x.capital||[])[0]||'–')+' · '+(x.region||'')+' · population '+(x.population||0).toLocaleString('en')};});},true),
mk('TheMealDB',function(q){return 'https://www.themealdb.com/api/json/v1/1/search.php?s='+E(q);},function(j){return(j.meals||[]).slice(0,6).map(function(x){return{title:x.strMeal,url:'https://www.themealdb.com/meal/'+x.idMeal,text:[x.strCategory,x.strArea].filter(Boolean).join(' · ')};});},true),
mk('Open Food Facts',function(q,p){return 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=10&page='+(p+1)+'&search_terms='+E(q);},function(j){return(j.products||[]).map(function(x){return{title:x.product_name,url:'https://world.openfoodfacts.org/product/'+x.code,text:x.brands||''};});})
];
function webPage(q,p,cb){
var l=lang(),h=function(d){return l+'.'+d;};
var jobs=[mw(h('wikipedia.org'),'Wikipedia',q,p)];
if(l==='bg')jobs.push(mw('en.wikipedia.org','Wikipedia',q,p));
else jobs.push(mw('simple.wikipedia.org','Simple Wikipedia',q,p));
[['de','DE'],['fr','FR'],['es','ES'],['ru','RU']].forEach(function(x){if(x[0]!==l)jobs.push(mw(x[0]+'.wikipedia.org','Wikipedia ('+x[1]+')',q,p));});
jobs.push(mw(h('wikibooks.org'),'Wikibooks',q,p),mw(h('wikisource.org'),'Wikisource',q,p),mw(h('wikinews.org'),'Wikinews',q,p),mw(h('wiktionary.org'),'Wiktionary',q,p),mw(h('wikiversity.org'),'Wikiversity',q,p),
mw(h('wikivoyage.org'),'Wikivoyage',q,p),mw(h('wikiquote.org'),'Wikiquote',q,p),mw('species.wikimedia.org','Wikispecies',q,p),mw('www.wikidata.org','Wikidata',q,p),
iaRaw(q,p),olRaw(q,p),crRaw(q,p),oaRaw(q,p),pmcRaw(q,p),seRaw(q,p),
J('https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=10&page='+p+'&query='+E(q)).then(function(j){return(j.hits||[]).filter(function(x){return x.title;}).map(function(x){return{title:x.title,url:x.url||('https://news.ycombinator.com/item?id='+x.objectID),source:'Hacker News',text:(x.points||0)+' points · '+(x.num_comments||0)+' comments',t:x.created_at_i||0};});}).catch(function(){return[];}));
MORE.forEach(function(f){jobs.push(f(q,p));});
if(p===0){jobs.push(gdeltRaw(q));if(netUp())jobs.push(xget('search',{q:q},20000).then(function(j){return j.results||[];}).catch(function(){return[];}));}
jobs=jobs.map(function(j){return j.then(function(a){if(cb)cb(a);return a;});});
return Promise.all(jobs).then(inter);
}
/* images: several free sources, paged */
function imgCommons(q,p){return J('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=30&gsroffset='+(p*30)+'&gsrsearch='+E(q+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=320').then(function(j){
var ps=Object.keys((j.query||{}).pages||{}).map(function(k){return j.query.pages[k];});ps.sort(function(a,b){return(a.index||99)-(b.index||99);});
return ps.map(function(p){var ii=(p.imageinfo||[])[0];if(!ii||!ii.thumburl||!/^image\//.test(ii.mime||''))return null;var m=ii.extmetadata||{};return{title:String(p.title).replace(/^File:/,'').replace(/\.\w+$/,'').replace(/_/g,' '),thumb:ii.thumburl,url:ii.descriptionurl,license:(m.LicenseShortName&&m.LicenseShortName.value)||'',thumbFallback:ii.url||'',src:'Wikimedia Commons'};}).filter(Boolean);}).catch(function(){return[];});}
function imgOpenverse(q,p){return J('https://api.openverse.org/v1/images/?page_size=20&page='+(p+1)+'&q='+E(q)).then(function(j){return(j.results||[]).filter(function(x){return x.thumbnail&&x.foreign_landing_url&&!x.mature;}).map(function(x){return{title:x.title||'Image',thumb:x.thumbnail,url:x.foreign_landing_url,license:'CC '+String(x.license||'').toUpperCase()+' '+(x.license_version||''),src:'Openverse'};});}).catch(function(){return[];});}
function imgNasa(q,p){return J('https://images-api.nasa.gov/search?media_type=image&page='+(p+1)+'&q='+E(q)).then(function(j){return(((j.collection||{}).items)||[]).map(function(x){var d=(x.data||[])[0]||{},l=(x.links||[])[0];if(!l||!d.nasa_id)return null;return{title:d.title||'NASA image',thumb:l.href,url:'https://images.nasa.gov/details/'+E(d.nasa_id),license:'NASA (public domain)',src:'NASA'};}).filter(Boolean);}).catch(function(){return[];});}
function imgIA(q,p){return J('https://archive.org/advancedsearch.php?q='+E('('+q+') AND mediatype:image AND (licenseurl:(*creativecommons* OR *publicdomain*) OR collection:(flickrcommons OR nasa)) AND NOT subject:(nude OR erotic OR porn OR adult OR xxx)')+'&fl[]=identifier&fl[]=title&rows=20&page='+(p+1)+'&output=json').then(function(j){return(((j.response||{}).docs)||[]).filter(function(x){return x.title;}).map(function(x){return{title:String(x.title),thumb:'https://archive.org/services/img/'+E(x.identifier),url:'https://archive.org/details/'+E(x.identifier),license:'Internet Archive (free license)',src:'Internet Archive'};});}).catch(function(){return[];});}
function imgArt(q,p){return J('https://api.artic.edu/api/v1/artworks/search?limit=20&page='+(p+1)+'&fields=id,title,image_id,is_public_domain&q='+E(q)).then(function(j){return(j.data||[]).filter(function(x){return x.image_id&&x.is_public_domain;}).map(function(x){return{title:x.title||'Artwork',thumb:'https://www.artic.edu/iiif/2/'+x.image_id+'/full/400,/0/default.jpg',url:'https://www.artic.edu/artworks/'+x.id,license:'Public domain',src:'Art Institute of Chicago'};});}).catch(function(){return[];});}
function imgWiki(q,p){var l=lang();return J('https://'+l+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=15&gsroffset='+(p*15)+'&gsrsearch='+E(q)+'&prop=pageimages&piprop=thumbnail&pithumbsize=320').then(function(j){return Object.keys((j.query||{}).pages||{}).map(function(k){return j.query.pages[k];}).filter(function(x){return x.thumbnail;}).map(function(x){return{title:x.title,thumb:x.thumbnail.source,url:'https://'+l+'.wikipedia.org/wiki/'+E(x.title.replace(/ /g,'_')),license:'See the Wikipedia page',src:'Wikipedia'};});}).catch(function(){return[];});}
function imgNat(q,p){return J('https://api.inaturalist.org/v1/taxa?per_page=15&page='+(p+1)+'&q='+E(q)).then(function(j){return(j.results||[]).filter(function(x){return x.default_photo&&x.default_photo.medium_url;}).map(function(x){return{title:(x.preferred_common_name||x.name),thumb:x.default_photo.medium_url,url:'https://www.inaturalist.org/taxa/'+x.id,license:(x.default_photo.license_code||'').toUpperCase().replace(/-/g,' ')||'',src:'iNaturalist'};});}).catch(function(){return[];});}
function imgCle(q,p){return J('https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&cc0=1&limit=15&skip='+(p*15)+'&q='+E(q)).then(function(j){return(j.data||[]).filter(function(x){return x.images&&x.images.web;}).map(function(x){return{title:x.title,thumb:x.images.web.url,url:x.url,license:'CC0 (public domain)',src:'Cleveland Museum of Art'};});}).catch(function(){return[];});}
function imgPage(q,p,cb){return Promise.all([imgCommons(q,p),imgOpenverse(q,p),imgNasa(q,p),imgIA(q,p),imgArt(q,p),imgWiki(q,p),imgNat(q,p),imgCle(q,p)].map(function(j){return j.then(function(a){if(cb)cb(a);return a;});})).then(inter);}
/* ---- rendering ---- */
function favLetter(s){return(String(s||'?').replace(/^www\./,'').charAt(0)||'?').toUpperCase();}
function licInfo(l){l=String(l||'');
if(/public domain|cc0|\bpd\b|pdm/i.test(l))return['Public domain','Free to use for anything. Credit is not required, but it is polite.'];
if(/by[-\s]?nc[-\s]?nd/i.test(l))return['CC BY-NC-ND','Use with credit, not for commercial use, and without changes.'];
if(/by[-\s]?nc[-\s]?sa/i.test(l))return['CC BY-NC-SA','Use and change with credit, not for commercial use, and share your changes under the same licence.'];
if(/by[-\s]?nc/i.test(l))return['CC BY-NC','Use and change with credit, but not for commercial use.'];
if(/by[-\s]?nd/i.test(l))return['CC BY-ND','Use with credit, but do not change it.'];
if(/by[-\s]?sa/i.test(l))return['CC BY-SA','Use and change with credit, and share your changes under the same licence.'];
if(/\bcc[-\s]?by\b|by\s*\d/i.test(l))return['CC BY','Use and change freely if you credit the author.'];
if(/nasa/i.test(l))return['NASA','Usually free to use. Do not suggest that NASA endorses you, and check NASA’s media guidelines.'];
if(/internet archive/i.test(l))return['Free licence','The item page shows its exact licence. Check it before reusing.'];
return l?['Licence: '+l.slice(0,24),'Check the licence on the source page before reusing it.']:['Licence unknown','No licence was given. Assume it is NOT free to reuse until you check the source page.'];}
var cmp=[];var cmpBar=el('div','std-cmpbar');cmpBar.style.cssText='display:none;margin:8px 0;padding:10px 12px;border:1px solid var(--accent);border-radius:14px;align-items:center;gap:10px;flex-wrap:wrap';
var cmpPanelBody=mkPanel('v9Cmp2','⚖️ Compare two results');wrap.insertBefore(cmpBar,res);
var flowBar=el('div','std-cmpbar');flowBar.style.cssText='display:none;margin:8px 0;padding:10px 12px;border:1px solid var(--accent2);border-radius:14px;align-items:center;gap:8px;flex-wrap:wrap';wrap.insertBefore(flowBar,meta);
var flowNote=el('div','v9-note','Use the checkboxes under results to choose sources for comparison. Or let Random comparison pick two for you; check a link from the results.');flowNote.style.flexBasis='100%';flowBar.appendChild(flowNote);
function flowShow(list){flowBar.textContent='';if(!list||!list.length||tab!=='all'){flowBar.style.display='none';return;}flowBar.style.display='flex';flowBar.appendChild(flowNote);
var cmpBtn=el('button','std-b','🎲 Random comparison');cmpBtn.type='button';cmpBtn.disabled=list.length<2;cmpBtn.title=list.length<2?'At least two results are needed':'';cmpBtn.onclick=function(){var pool=list.slice(),picked=[];while(pool.length&&picked.length<2){var i=Math.floor(Math.random()*pool.length);picked.push(pool.splice(i,1)[0]);}cmp=picked;[].forEach.call(res.querySelectorAll('.std-cmp input'),function(c){c.checked=cmp.some(function(x){return x.url===c.closest('.std-r').querySelector('.std-t').href;});});cmpUpdate();if(cmp.length===2)openCmp();};flowBar.appendChild(cmpBtn);
var checkBtn=el('button','std-b','🛡️ Check first link');checkBtn.type='button';checkBtn.onclick=function(){var r=list[0];closePanel('v9Std');openScam('url');var input=$('scamInput');if(input)input.value=r.url;var lab=$('scamLabBar');if(lab)lab.scrollIntoView({behavior:'smooth',block:'start'});runScam();};flowBar.appendChild(checkBtn);
}
function cmpUpdate(){cmpBar.textContent='';if(!cmp.length){cmpBar.style.display='none';return;}cmpBar.style.display='flex';
cmpBar.appendChild(el('span','',cmp.length===1?'1 source selected. Select one more result below.':'2 sources selected.'));
var go=el('button','std-b','Compare selected sources');go.type='button';go.disabled=cmp.length<2;go.onclick=openCmp;cmpBar.appendChild(go);
var cl=el('button','std-b','Clear');cl.type='button';cl.onclick=function(){cmp=[];cmpUpdate();[].forEach.call(res.querySelectorAll('.std-cmp input'),function(c){c.checked=false;});};cmpBar.appendChild(cl);}
var STOP=/^(this|that|with|from|have|were|been|their|there|which|about|would|could|should|also|more|than|into|they|them|what|when|will|your|only|other|some|such|most|these|those|over|after)$/;
function words(t){var o={};String(t||'').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,' ').split(/\s+/).forEach(function(w){if(w.length>=4&&!STOP.test(w))o[w]=1;});return o;}
function openCmp(){
var b=cmpPanelBody;b.textContent='';b.appendChild(el('div','v9-note','Side by side: the short descriptions given by each source. Open the links to read the full pages. Results are not checked for truth.'));
var grid=el('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:12px 0';b.appendChild(grid);
var texts=[],done=0;var shared=el('div');
function fin(){if(++done<2)return;var A=words(texts[0]),B=words(texts[1]),both=Object.keys(A).filter(function(w){return B[w];}).slice(0,16);
shared.textContent='';shared.appendChild(el('b','','Words in both'));var row=el('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:6px';
if(both.length)both.forEach(function(w){var c=el('span','',w);c.style.cssText='padding:4px 10px;border-radius:14px;border:1px solid var(--accent);font-size:13px';row.appendChild(c);});else row.appendChild(el('span','v9-note','No shared key words found. These two may be about different things or use different words.'));shared.appendChild(row);}
cmp.forEach(function(r,i){var c=el('div','v9-card');c.setAttribute('translate','no');c.appendChild(el('div','v9-note',r.source||''));
var a=el('a','std-t',r.title);a.href=safe(r.url);a.target='_blank';a.rel='noopener noreferrer';c.appendChild(a);
var tx=el('div','std-s',r.text||'');tx.style.marginTop='8px';c.appendChild(tx);grid.appendChild(c);
texts[i]=(r.title||'')+' '+(r.text||'');
var m=/\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)$/.exec(r.url||'');
if(m){tx.textContent='Loading…';fetch('https://'+m[1]+'.wikipedia.org/api/rest_v1/page/summary/'+m[2]).then(function(x){return x.ok?x.json():null;}).then(function(j){var t=j&&j.extract?j.extract.slice(0,700):(r.text||'');tx.textContent=t;texts[i]+=' '+t;fin();}).catch(function(){tx.textContent=r.text||'';fin();});}else fin();});
b.appendChild(shared);openPanel('v9Cmp2');}
function resultEl(r){
var u=safe(r.url);if(!u)return null;
var d=el('div','std-r');d.setAttribute('translate','no');
var site=el('div','std-site');var host='';try{host=new URL(u).hostname.replace(/^www\./,'');}catch(e){}
site.appendChild(el('span','std-fav',favLetter(host)));
var s2=el('div','std-sn');s2.appendChild(el('div','std-name',r.source||host));s2.appendChild(el('div','std-url',pretty(u)));site.appendChild(s2);
var a=el('a','std-t',r.title||u);a.href=u;a.target='_blank';a.rel='noopener noreferrer';
d.appendChild(site);d.appendChild(a);
var sn=(r.t?ago(r.t)+' — ':'')+(r.text||'');if(sn.trim())d.appendChild(el('div','std-s',sn.slice(0,300)));
var lb=el('label','std-cmp');lb.style.cssText='display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-top:6px;cursor:pointer';var cb=document.createElement('input');cb.type='checkbox';cb.checked=cmp.some(function(x){return x.url===u;});
cb.onchange=function(){if(cb.checked){if(cmp.length>=2){cb.checked=false;toast('Compare works with two results. Clear one first.','#ffaa00');return;}cmp.push(r);}else cmp=cmp.filter(function(x){return x.url!==u;});cmpUpdate();};
lb.appendChild(cb);lb.appendChild(document.createTextNode('Compare'));d.appendChild(lb);
return d;
}
function setMeta(n,ms){meta.textContent=n?('About '+n+' result'+(n===1?'':'s')+' ('+(ms/1000).toFixed(2)+' seconds)'):'';}
function status(t){res.textContent='';res.appendChild(el('div','std-none',t));more.style.display='none';meta.textContent='';}
function knowledge(list){
var w=list.filter(function(r){return r.source==='Wikipedia';})[0];if(!w)return null;
var box=el('div','std-kp');box.setAttribute('translate','no');
var l=/\/\/(\w+)\.wikipedia/.exec(w.url);var lg=l?l[1]:'en';
fetch('https://'+lg+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(w.title.replace(/ /g,'_'))).then(function(r){return r.ok?r.json():null;}).then(function(j){
if(!j||!j.extract||j.type==='disambiguation')return box.remove();
if(j.thumbnail&&j.thumbnail.source){var im=new Image();im.alt='';im.referrerPolicy='no-referrer';im.decoding='async';im.src=j.thumbnail.source;box.appendChild(im);}
var t=el('div','std-kt',j.title);box.appendChild(t);if(j.description)box.appendChild(el('div','std-kd',j.description));
box.appendChild(el('div','std-ke',j.extract.slice(0,420)+(j.extract.length>420?'…':'')));
var a=el('a','','Wikipedia ↗');a.href=safe(j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page)||w.url;a.target='_blank';a.rel='noopener noreferrer';box.appendChild(a);
}).catch(function(){box.remove();});
return box;
}

var SUM_MODELS=Object.keys(AI_SHORT);
function mName(m){return String(m||'').replace(/^@cf\//,'');}
function mShort(m){return aiShort(m);}
function drawSum(){
sumWrap.textContent='';
if(!curList||!curList.length||(tab!=='all'&&tab!=='news')){return;}
if(!sumSt||sumSt.q!==q){sumSt={q:q,versions:[],cur:-1,busy:false,open:false,err:'',auto:0,t0:Date.now()};}
if(!sumSt.auto&&autoSumOn()){var _st=sumSt;clearTimeout(sumTimer);sumTimer=setTimeout(function(){if(sumSt!==_st||_st.auto)return;_st.auto=1;_st.open=true;if(!_st.versions.length&&!_st.busy)genSum(msel0());else drawSum();},Math.max(300,Math.min(1400,4500-(Date.now()-_st.t0))));}
var bub=el('button','std-b','✨ AI Summary');bub.type='button';bub.setAttribute('aria-expanded',sumSt.open?'true':'false');
bub.style.cssText='border-radius:999px;padding:8px 16px;margin:6px 0;font-weight:700';
bub.onclick=function(){sumSt.open=!sumSt.open;if(sumSt.open&&!sumSt.versions.length&&!sumSt.busy)genSum(msel0());drawSum();};
sumWrap.appendChild(bub);
if(!sumSt.open)return;
var box=el('div','v9-card');box.style.cssText='margin:6px 0 10px;padding:12px;line-height:1.55';box.setAttribute('role','region');box.setAttribute('aria-label','AI Summary');
box.appendChild(el('b','','✨ AI Summary of '+Math.min(curList.length,14)+' results'));
var mr=mkModelRow();var ms=mr.msel;mr.removeChild(mr.lastChild);
ms.addEventListener('change',function(){genSum(ms.value);});box.appendChild(mr);
var al=el('label','v9-note');al.style.cssText='display:flex;gap:8px;align-items:center;margin:4px 0;cursor:pointer';var acb=document.createElement('input');acb.type='checkbox';acb.checked=autoSumOn();acb.onchange=function(){jset('ai_v9_autosum',acb.checked);};al.appendChild(acb);al.appendChild(document.createTextNode('Write the summary automatically after each search (sends the shown results to the AI model; turn off to send only when you press ✨)'));box.appendChild(al);
var body=el('div','');body.style.cssText='margin:8px 0;white-space:pre-wrap';
if(sumSt.busy){body.textContent='Asking the AI model… (it reads only the titles and snippets of the results)';}
else if(sumSt.err&&sumSt.cur<0){body.textContent='⚠️ '+sumSt.err;}
else if(sumSt.cur>=0){body.textContent=sumSt.versions[sumSt.cur].text;}
box.appendChild(body);
if(sumSt.versions.length>1||sumSt.cur>=0){
var vr=el('div','');vr.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;max-width:100%;min-width:0';
sumSt.versions.forEach(function(v,i){var vb=el('button','std-b',(i+1)+' · '+mShort(v.model));vb.type='button';vb.title='Version '+(i+1)+': '+mName(v.model);vb.setAttribute('aria-label','Version '+(i+1)+', '+mName(v.model));vb.setAttribute('aria-pressed',i===sumSt.cur?'true':'false');vb.style.cssText='padding:4px 10px;font-size:12px;flex:0 1 auto;min-width:0;max-width:100%;white-space:normal;'+(i===sumSt.cur?'outline:2px solid var(--accent)':'');vb.onclick=function(){sumSt.cur=i;drawSum();};vr.appendChild(vb);});
box.appendChild(vr);}
if(sumSt.err&&sumSt.cur>=0){var ew=el('div','v9-note','⚠️ The last try failed: '+sumSt.err);box.appendChild(ew);}
var ar=el('div','');ar.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:6px';
var other=el('button','std-b','🔁 Another model');other.type='button';other.disabled=sumSt.busy;other.onclick=function(){var used=sumSt.versions.map(function(v){return v.model;});var nx=SUM_MODELS.filter(function(m){return used.indexOf(m)<0;})[0]||SUM_MODELS[(SUM_MODELS.indexOf(used[used.length-1])+1)%SUM_MODELS.length];jset('ai_v9_model',nx);genSum(nx);};
ar.appendChild(other);
if(sumSt.cur>=0){var chat=el('button','std-b','💬 Open in AI Chat');chat.type='button';chat.onclick=function(){var v=sumSt.versions[sumSt.cur];var h=jget('ai_v9_chat',[]);h.push({role:'user',content:'AI Summary: '+q});h.push({role:'assistant',content:v.text,ai:1});jset('ai_v9_chat',h.slice(-40));closePanel('v9Std');openChat();};ar.appendChild(chat);}
box.appendChild(ar);
if(sumSt.cur>=0){var v=sumSt.versions[sumSt.cur];box.appendChild(el('div','v9-note','🤖 AI model ('+mName(v.model)+'), run by Cloudflare. It summarised these results and can be wrong: open the sources to check. Sources used: '+v.n+'.'));}
sumWrap.appendChild(box);
}
function autoSumOn(){try{var g=ageG();if(g==='u13'||g==='13-15'||g==='16-17')return false;}catch(e){}return jget('ai_v9_autosum',true)!==false;}
function msel0(){var v=jget('ai_v9_model','');return typeof v==='string'?v:'';}
function genSum(model){
if(!FT.on('aisum'))return;if(!sumSt||sumSt.busy)return;var st=sumSt;st.busy=true;st.err='';drawSum();
var items=curList.slice(0,14).map(function(r){return{title:String(r.title||'').slice(0,140),text:String(r.text||'').slice(0,320),source:String(r.source||'').slice(0,50),url:r.url};});
xpost('summary',{query:q,items:items,model:model||''},40000).then(function(j){
st.busy=false;if(!j.summary)throw new Error('empty');st.versions.push({model:j.model||model||'',text:j.summary,n:items.length});st.cur=st.versions.length-1;if(sumSt===st)drawSum();
}).catch(function(e){st.busy=false;st.err=/needs-server|501|needs Workers AI/.test(String(e&&e.message))?'AI summary needs the Cloudflare Worker with Workers AI switched on.':'The AI model did not answer ('+String((e&&e.message)||e).slice(0,160)+'). Try another model.';if(sumSt===st)drawSum();});
}
var kfBad={},kfBusy={};
function kfFilter(list){
var k=q+'|'+tab,bad=kfBad[k];
try{var _g=ageG();if(!(_g==='u13'||_g==='13-15'||_g==='16-17'||store.get('ai_kids')==='1'))return list;}catch(e){return list;}
if(!bad){if(!kfBusy[k]&&list.length&&typeof aiAsk==='function'){kfBusy[k]=1;var first=list.slice(0,60);var txt=first.map(function(r,i){return(i+1)+'. '+String(r.title||'').slice(0,120)+' — '+String(r.text||'').slice(0,160);}).join('\n');
aiAsk('kidfilter',{text:txt}).then(function(j){var m={};(j.unsafe||[]).forEach(function(n){var r=first[n-1];if(r&&r.url)m[r.url]=1;});kfBad[k]=m;kfBusy[k]=0;if(k===q+'|'+tab&&curList)renderList(curList);}).catch(function(){kfBad[k]={};kfBusy[k]=0;});}
return list;}
return list.filter(function(r){return !bad[r.url];});}
var snapT=0;
function snapSave(){clearTimeout(snapT);var qq=q,tt=tab;snapT=setTimeout(function(){try{if(!qq||qq.length<2||tt!=='all'||!curList||curList.length<3)return;var d=new Date().toISOString().slice(0,10),key=qq.toLowerCase().slice(0,60);var S=jget('ai_v9_snaps',{});if(!S||typeof S!=='object'||Array.isArray(S))S={};var o=S[key]||(S[key]={});o[d]=curList.slice(0,12).map(function(r){return[String(r.title||'').slice(0,120),String(r.text||'').slice(0,200),String(r.source||'').slice(0,30)];});var ds=Object.keys(o).sort();while(ds.length>8)delete o[ds.shift()];var ks=Object.keys(S);if(ks.length>25){ks.sort(function(a,b){var x=Object.keys(S[a]).sort().pop()||'',y=Object.keys(S[b]).sort().pop()||'';return x<y?-1:1;});delete S[ks[0]];}jset('ai_v9_snaps',S);}catch(e){}},1500);}
function renderList(list){
list=kfFilter(list);
flowShow(list);curList=list;drawSum();snapSave();
res.textContent='';
var shownN=0;
if(tab==='all'){var kp=knowledge(list);if(kp)res.appendChild(kp);}
list.slice(0,(data.all?data.all.shown:shown)).forEach(function(r){var e=resultEl(r);if(e){res.appendChild(e);shownN++;}});
if(!shownN)status('No results found. Try different words.');
}
var pickFn=null,grpSel='';var gbar=el('div','std-grp');gbar.style.cssText='display:none;flex-wrap:wrap;gap:6px;margin:6px 0';wrap.insertBefore(gbar,res);
function optBar(label){more.textContent='';more.appendChild(el('div','std-meta',label));[10,25,50,100].forEach(function(k){var b=el('button','std-b','+'+k);b.type='button';b.setAttribute('aria-label','Load '+k+' more');b.style.margin='4px';b.onclick=function(){if(!pickFn)return;[].forEach.call(more.querySelectorAll('button'),function(x){x.disabled=true;});pickFn(k);};more.appendChild(b);});more.style.display='block';}
function stream(S,fetcher,okFn){var lists=[],t=0,first=true;
function rebuild(){S.seen={};S.items=[];inter(lists).forEach(function(x){if(!x||!x.url||S.seen[x.url]||!okFn(x))return;S.seen[x.url]=1;S.items.push(x);});}
function chunk(a){lists.push(a);rebuild();if(first&&S.items.length){first=false;if(S.upd)S.upd();return;}if(!t)t=setTimeout(function(){t=0;if(S.upd)S.upd();},300);}
return fetcher(q,0,chunk).then(function(){clearTimeout(t);t=0;S.page=1;S.started=2;if(!S.items.length)S.empty=1;});}
function fill(S,fetcher,n,okFn){var tries=0;function step(){if(S.count()>=n||S.done||tries>=6)return Promise.resolve();tries++;return fetcher(q,S.page).then(function(a){S.page++;var add=0;a.forEach(function(x){if(!x||!x.url||S.seen[x.url]||!okFn(x))return;S.seen[x.url]=1;S.items.push(x);add++;});if(!add){S.empty=(S.empty||0)+1;if(S.empty>=2)S.done=true;}else S.empty=0;return step();});}return step();}
function newS(f){var S={items:[],page:0,seen:{},done:false,shown:0,count:function(){return f?S.items.filter(f).length:S.items.length;}};return S;}
function webList(S){var l=tab==='news'?S.items.filter(function(r){return /news/i.test(r.source||'');}).sort(function(x,y){return(y.t||0)-(x.t||0);}):S.items;return grpSel&&tab==='all'?l.filter(function(r){return grpOf(r)===grpSel;}):l;}
function drawGroups(S,redraw){gbar.textContent='';if(tab!=='all'||!S.items.length){gbar.style.display='none';return;}var c={};S.items.forEach(function(r){var g=grpOf(r);c[g]=(c[g]||0)+1;});var names=Object.keys(c).sort();gbar.style.display='flex';
[''].concat(names).forEach(function(g){var b=el('button','std-b',g?g+' ('+c[g]+')':'All sources ('+S.items.length+')');b.type='button';b.style.cssText='padding:6px 12px;font-size:13px;'+(grpSel===g?'outline:2px solid var(--accent)':'');b.setAttribute('aria-pressed',grpSel===g?'true':'false');b.onclick=function(){grpSel=g;W_shownReset(S);redraw();};gbar.appendChild(b);});}
function W_shownReset(S){S.shown=Math.max(10,S.shown);}
function load(t){
var me=++seq;t0=performance.now();status('Searching…');pickFn=null;
if(t==='images'){
var S=data.images=data.images||(function(){var o=newS();o.shown=30;return o;})();
var iok=function(x){return kidOK({title:x.title,license:x.license});};
function drawI(){if(me!==seq)return;res.textContent='';if(!S.items.length){status(S.started===2?'No images found.':'Searching…');return;}
if(Math.min(S.shown,S.items.length)>=10){var warn=el('div','v9-note','⚠️ Showing 10 or more images can include previews whose original files have been deleted or are no longer reachable. The search script may still try to load those thumbnails; if one is missing, open its source page.');warn.style.cssText='margin:8px 0;padding:10px 12px;border:1px solid #d69e00;border-radius:10px';res.appendChild(warn);}var g=el('div','std-grid');S.items.slice(0,S.shown).forEach(function(x){var c=el('a','std-ic');c.href=safe(x.url);c.target='_blank';c.rel='noopener noreferrer';c.setAttribute('translate','no');var im=new Image();im.loading='lazy';im.decoding='async';im.alt=x.title;im.referrerPolicy='strict-origin-when-cross-origin';im.onerror=function(){if(x.thumbFallback&&im.src!==x.thumbFallback){im.src=x.thumbFallback;return;}im.remove();var ph=el('span','','🖼️ Preview unavailable');ph.style.cssText='position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:12px 8px 30px;background:var(--bg2);color:var(--text);font-size:12px';c.appendChild(ph);};im.src=x.thumb;c.appendChild(im);var li=licInfo(x.license);c.title=li[0]+': '+li[1];c.appendChild(el('span','std-ct',x.title+(x.src?' · '+x.src:'')));var lbd=el('span','std-lic',li[0]);lbd.style.cssText='position:absolute;top:6px;left:6px;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:700;background:rgba(0,0,0,.72);color:#fff';c.appendChild(lbd);g.appendChild(c);});res.appendChild(g);setMeta(Math.min(S.shown,S.items.length),performance.now()-t0);
res.appendChild(el('div','v9-note','Licence badges: “Public domain” = free for anything. “CC BY” = free if you credit the author. “SA” = share changes under the same licence. “NC” = not for commercial use. “ND” = no changes. Hover or long-press an image for details. This is a guide, not legal advice.'));
optBar('Showing '+Math.min(S.shown,S.items.length)+' images from Wikimedia Commons, Wikipedia, Openverse, NASA, Internet Archive, iNaturalist, the Art Institute of Chicago and the Cleveland Museum of Art. Load more:');imgAuto(S);}
pickFn=function(k){S.shown+=k;fill(S,imgPage,S.shown,iok).then(function(){drawI();});};
S.upd=drawI;if(S.started===2)drawI();else if(!S.started){S.started=1;stream(S,imgPage,iok).then(function(){drawI();}).catch(function(){if(me===seq)status('Images could not be loaded. Try again.');});}
return;}

var W=data.all=data.all||(function(){var o=newS();o.shown=10;return o;})();
var wok=function(x){return kidOK({title:x.title,text:x.text,source:x.source});};
function ensure(){var tries=0;function go(){if(webList(W).length>=W.shown||W.done||tries++>=6)return Promise.resolve();return fill(W,webPage,W.items.length+10,wok).then(go);}return go();}
function draw(){if(me!==seq)return;drawGroups(W,function(){ensure().then(draw);});var list=webList(W);data.cur=list;setMeta(list.length,performance.now()-t0);renderList(list);
if(list.length||!W.done){optBar('Showing '+Math.min(W.shown,list.length)+(tab==='news'?' news results from ':' results from ')+(function(){var n={};list.slice(0,Math.min(W.shown,list.length)).forEach(function(r){n[r.source]=1;});return Object.keys(n).length;})()+(tab==='news'?' news sources. Load more:':' different sources (encyclopedias, books, research papers, code, news, nature, art, places and more). Load more:'));}else more.style.display='none';}
pickFn=function(k){W.shown+=k;ensure().then(draw);};
W.upd=draw;if(W.started===2)draw();else if(!W.started){W.started=1;stream(W,webPage,wok).then(function(){if(me!==seq)return;if(!W.items.length){status('No results found. Try different words.');return;}draw();}).catch(function(){if(me!==seq)return;status('Search failed. Check your connection and try again.');});}
}
/* ---- suggestions ---- */
var sugT=0,sugSeq=0;
function hideSug(){sug.style.display='none';sug.textContent='';}
function showSug(items){sug.textContent='';if(!items.length){sug.style.display='none';return;}
items.forEach(function(s){var b=el('button','std-si','🔍  '+s);b.type='button';b.setAttribute('translate','no');b.onmousedown=function(e){e.preventDefault();};b.onclick=function(){inp.value=s;clr.style.display='block';run();};sug.appendChild(b);});sug.style.display='block';}
function suggest(){
var v=inp.value.trim();clr.style.display=inp.value?'block':'none';
clearTimeout(sugT);
if(!v){var rec=jget('ai_v9_recent',[]).slice(0,6);showSug(rec);return;}
if(v.length<2||!netUp()){hideSug();return;}
sugT=setTimeout(function(){var me=++sugSeq,l=/[Ѐ-ӿ]/.test(v)?'bg':'en';
fetch('https://'+l+'.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=6&search='+encodeURIComponent(v)).then(function(r){return r.json();}).then(function(j){if(me!==sugSeq||document.activeElement!==inp)return;showSug((j[1]||[]).filter(function(x){return typeof x==='string';}));}).catch(function(){});},220);
}
inp.addEventListener('input',suggest);inp.addEventListener('focus',suggest);
inp.addEventListener('blur',function(){setTimeout(hideSug,150);});
inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();run();}else if(e.key==='Escape'){hideSug();}});
clr.onclick=function(){inp.value='';clr.style.display='none';inp.focus();suggest();};
setTab('all');
window.openStd=function(v){openPanel('v9Std');if(v){inp.value=v;clr.style.display='block';run();}else{goHome();}};
var btn=mkBtn('🔎 Standard Mode','',function(){window.openStd(($('q')||{}).value&&($('q').value.trim())||'');});
var bar=$('v9Bar');if(bar)bar.insertBefore(btn,bar.firstChild);
}
function initA11y(){
var D=document.documentElement;
function load(){var o=null;try{o=JSON.parse(store.get('ai_a11y')||'null');}catch(e){}
if(!o||typeof o!=='object'){var rm=false;try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}o={size:0,hc:false,rm:rm};}
o.size=[0,1,2].indexOf(o.size)!==-1?o.size:0;o.hc=!!o.hc;o.rm=!!o.rm;return o;}
var st=load();
function apply(){D.classList.toggle('a11y-l',st.size===1);D.classList.toggle('a11y-xl',st.size===2);D.classList.toggle('a11y-hc',st.hc);var ap='auto';try{ap=localStorage.getItem('ai_v9_anim')||'auto';}catch(e){}D.classList.toggle('a11y-rm',ap==='on'?false:ap==='off'?true:st.rm);}
window.AI_A11Y_APPLY=apply;
function save(){store.set('ai_a11y',JSON.stringify(st));apply();}
apply();
var body=mkPanel('v9A11y','♿️ Accessibility');
function render(){
body.textContent='';
body.appendChild(el('div','v9-note','These settings are saved on this device only.'));
var h1=el('h3','','Text size');h1.style.margin='14px 0 6px';body.appendChild(h1);
var r1=el('div','v9-row');
[['Normal',0],['Large',1],['Extra large',2]].forEach(function(z){var b=mkBtn(z[0],st.size===z[1]?'on':'',function(){st.size=z[1];save();render();});b.setAttribute('aria-pressed',st.size===z[1]?'true':'false');r1.appendChild(b);});
body.appendChild(r1);
var h2=el('h3','','Display');h2.style.margin='14px 0 6px';body.appendChild(h2);
var r2=el('div','v9-row');
var hc=mkBtn(st.hc?'◐ High contrast: ON':'◐ High contrast: OFF',st.hc?'on':'',function(){st.hc=!st.hc;save();render();});hc.setAttribute('aria-pressed',st.hc?'true':'false');
var rm=mkBtn(st.rm?'⏸ Reduced motion: ON':'⏸ Reduced motion: OFF',st.rm?'on':'',function(){st.rm=!st.rm;save();render();});rm.setAttribute('aria-pressed',st.rm?'true':'false');
r2.appendChild(hc);r2.appendChild(rm);body.appendChild(r2);
var r3=el('div','v9-row');r3.style.marginTop='14px';
r3.appendChild(mkBtn('↺ Reset to default','',function(){st={size:0,hc:false,rm:false};save();render();}));body.appendChild(r3);
body.appendChild(el('div','v9-note','Reduced motion stops animations such as the title shine. Your browser\'s own reduced-motion setting is used the first time.'));
}
var btn=el('button','','♿️ Access');btn.type='button';btn.onclick=function(){render();openPanel('v9A11y');};
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
}
function initVoice(){
var pill=document.querySelector('.search-pill'),inp=$('q'),sb=$('searchBtn');if(!pill||!inp||!sb||$('micBtn'))return;
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
var LOCALE={en:'en-US'},lang='en';
var mic=el('button','','🎤');mic.type='button';mic.id='micBtn';mic.title='Voice search: tap, then speak';mic.setAttribute('aria-label','Voice search');
mic.style.cssText='min-width:44px;padding:10px;background:var(--bg3);color:var(--text);border:1.5px solid var(--accent);font-size:18px;line-height:1';
pill.insertBefore(mic,sb);
var stat=el('div','');stat.id='micStatus';stat.setAttribute('role','status');stat.setAttribute('aria-live','polite');stat.style.cssText='display:none;font-size:12px;text-align:center;margin-top:8px;padding:6px 10px;border-radius:10px;background:var(--bg2);border:1px solid var(--accent2)';
pill.parentNode.insertBefore(stat,pill.nextSibling);
function say(t){stat.textContent=t||'';stat.style.display=t?'block':'none';}
var listening=false,stopFn=null;
function setListening(on,txt){listening=on;mic.textContent=on?'⏹':'🎤';mic.style.background=on?'#ff4444':'var(--bg3)';mic.style.color=on?'#fff':'var(--text)';mic.setAttribute('aria-pressed',on?'true':'false');if(txt!==undefined)say(txt);}
function fail(t){setListening(false,'');say('⚠️ '+t);setTimeout(function(){if(!listening)say('');},6000);}
function submit(t){t=String(t||'').replace(/\s+/g,' ').trim().slice(0,200);if(!t){fail('I did not hear anything. Tap 🎤 and try again.');return;}inp.value=t;setListening(false,'');say('🔎 '+t);setTimeout(function(){if(!listening)say('');},2500);doSearch();}
function native(){
var rec=new SR(),final='',heard=false,errored=false;
rec.lang=LOCALE[lang];rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
rec.onresult=function(e){var t='',f='';for(var i=e.resultIndex;i<e.results.length;i++){var r=e.results[i];t+=r[0].transcript;if(r.isFinal)f+=r[0].transcript;}heard=true;inp.value=t;if(f)final=(final+' '+f).trim();};
rec.onerror=function(e){
errored=true;var c=e&&e.error;
if(c==='network'||c==='service-not-allowed'||c==='language-not-supported'){store.set('ai_voice_native_fail','1');if(API.stt){recorder();return;}fail('This browser blocks its speech service (Brave does). Use Chrome, Edge or Safari for voice search.');return;}
if(c==='not-allowed')fail('Microphone access was denied. Allow the microphone for this site in your browser settings.');
else if(c==='no-speech')fail('I did not hear anything. Tap 🎤 and try again.');
else if(c==='audio-capture')fail('No microphone was found.');
else if(c!=='aborted')fail('Voice search failed ('+c+').');
};
rec.onend=function(){if(errored)return;if(final)submit(final);else if(heard&&inp.value)submit(inp.value);else fail('I did not hear anything. Tap 🎤 and try again.');};
stopFn=function(){try{rec.stop();}catch(e){}};
try{rec.start();setListening(true,'🎤 Listening… speak now. (Your browser\'s speech service processes the audio.)');inp.value='';}catch(e){fail('Could not start the microphone.');}
}
function recorder(){
if(!API.stt){fail('Voice search is not supported in this browser. Use Chrome, Edge or Safari, or enable Workers AI (binding AI) on the Worker.');return;}
if(!navigator.mediaDevices||!window.MediaRecorder){fail('This browser cannot record audio.');return;}
navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
var types=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'],mt='';
for(var i=0;i<types.length;i++){try{if(MediaRecorder.isTypeSupported(types[i])){mt=types[i];break;}}catch(e){}}
var mr;try{mr=mt?new MediaRecorder(stream,{mimeType:mt}):new MediaRecorder(stream);}catch(e){stream.getTracks().forEach(function(t){t.stop();});fail('This browser cannot record audio.');return;}
var chunks=[],spoke=false,last=Date.now(),t0=Date.now(),timer=0,ac=null,an=null,buf=null;
mr.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
function cleanup(){clearInterval(timer);stream.getTracks().forEach(function(t){t.stop();});try{ac&&ac.close();}catch(e){}}
mr.onstop=function(){
cleanup();setListening(false,'⏳ Understanding what you said…');
var blob=new Blob(chunks,{type:mr.mimeType||mt||'audio/webm'});
if(blob.size<1200){fail('I did not hear anything. Tap 🎤 and try again.');return;}
var fr=new FileReader();fr.onload=function(){
var b64=String(fr.result).split(',')[1]||'';
xpost('transcribe',{audio:b64,lang:lang},45000).then(function(j){submit(j.text);}).catch(function(e){fail(e&&e.message&&e.message!=='needs-server'?e.message:'Speech recognition is not available right now.');});
};fr.readAsDataURL(blob);
};
stopFn=function(){try{if(mr.state!=='inactive')mr.stop();}catch(e){}};
try{var AC=window.AudioContext||window.webkitAudioContext;if(AC){ac=new AC();var src=ac.createMediaStreamSource(stream);an=ac.createAnalyser();an.fftSize=1024;src.connect(an);buf=new Uint8Array(an.fftSize);}}catch(e){an=null;}
timer=setInterval(function(){
var now=Date.now();
if(an){an.getByteTimeDomainData(buf);var s=0;for(var k=0;k<buf.length;k++){var v=(buf[k]-128)/128;s+=v*v;}if(Math.sqrt(s/buf.length)>0.03){spoke=true;last=now;}}
if(spoke&&now-last>1400)stopFn();else if(!spoke&&an&&now-t0>7000)stopFn();else if(now-t0>14000)stopFn();
},120);
mr.start();setListening(true,'🎤 Listening… speak now, then pause. Tap ⏹ to finish.');inp.value='';
}).catch(function(e){fail(e&&e.name==='NotAllowedError'?'Microphone access was denied. Allow the microphone for this site in your browser settings.':'Could not use the microphone.');});
}
mic.onclick=function(){
if(listening){stopFn&&stopFn();return;}
if(!window.isSecureContext){fail('Voice search needs a secure (https) page.');return;}
waitApi().then(function(){
if(SR&&store.get('ai_voice_native_fail')!=='1')native();else recorder();
});
};
}

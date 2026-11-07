/* AI INFORMATION - welcome.js
   welcome screen, tutorial, greeting.
   Only function declarations: they are called later by app.js (loaded last). */

/* ---- welcome (shown once) + greeting ---- */
function hasCookie(n){return document.cookie.split(';').some(function(c){return c.trim().indexOf(n+'=')===0;});}
function greetText(){
var h=new Date().getHours();
if(h>=5&&h<11)return 'Good morning! Have a great day!';
if(h>=11&&h<14)return 'Good day! Welcome!';
if(h>=14&&h<18)return 'Good afternoon! Welcome!';
if(h>=18&&h<23)return 'Good evening! Enjoy your evening!';
return 'Good night! Welcome, you are up late.';
}
function showGreeting(){
var g=$('greetCard');if(!g)return;g.textContent='👋 '+greetText();g.style.display='block';
setTimeout(function(){g.style.display='none';},9000);
}
function welcomeSeen(){return welcomeSession||!!(CONS&&CONS.w);}
function tutorialDone(){welcomeSession=true;if(CONS){CONS.w=1;consSave();}}
function v9WelcomeNext(){tutorialDone();var w=$('v9Welcome');if(w)w.style.display='none';showGreeting();}
function openTutorial(){var w=$('v9Welcome');if(w){w.style.display='flex';tutorialRender('choose');}}
function tutorialTry(mode,index){var actions=[
function(){openPanel('v9Std');},
function(){openScam('url');$('scamLabBar').scrollIntoView({behavior:'smooth',block:'start'});},
function(){openScam('text');$('scamLabBar').scrollIntoView({behavior:'smooth',block:'start'});},
function(){var x=$('fakeFileInput');if(x)x.click();},
function(){$('breakingNewsBar').scrollIntoView({behavior:'smooth',block:'start'});},
function(){openChat();},
function(){openTip();},
function(){openWeekly();},
function(){openVideos();},
function(){openPanel('v9Tr');},
function(){openPanel('v9Dict');},
function(){openPanel('v9Tools');},
function(){openPanel('v9Weather');},
function(){openPanel('v9Age');},
function(){openPanel('v9A11y');},
function(){openPanel('v9Color');},
function(){openPanel('v9Cache');},
function(){openPanel('v9Clear');},
function(){openPanel('v9Calc');},
function(){openPanel('v9Remind');},
function(){openPanel('v9Quiz');},
function(){openPanel('v9Lang');},
function(){openPanel('v9Share');},
function(){openPanel('v9Quote');}
];tutorialDone();var w=$('v9Welcome');if(w)w.style.display='none';try{actions[index]();}catch(e){toast('Open this feature from its section on the page.','#ffaa00',3500);}}
function tutorialRender(page){var w=$('v9Welcome');if(!w)return;w.textContent='';var b=el('div','box');w.appendChild(b);
function btn(label,cls,fn){var x=mkBtn(label,cls,fn);x.style.cssText='width:100%;margin-top:9px;padding:12px;font-size:15px';b.appendChild(x);}
b.appendChild(el('h2','',page==='choose'?'Welcome to AI INFORMATION':page==='read'?'A guide to the site':'Try the features'));
if(page==='choose'){
b.appendChild(el('p','','Explore a search and safety toolkit with sources, news, media, language and everyday tools. Choose how you want to learn. You can skip now and reopen this guide any time with the ? button.'));
btn('📖 Read the guide','pri',function(){tutorialRender('read');});btn('🖱️ Interactive tour','',function(){tutorialRender('try');});btn('Skip for now','',v9WelcomeNext);
}else if(page==='read'){
b.appendChild(el('p','','Use these examples as a quick map. Search results come from public sources; compare them and check important claims at the original pages.'));
var groups=[
['Search and research','Classic search checks a broad directory of sources. Standard Mode searches public sources, images and news, with filters and source comparison. Example: search “renewable energy”, then compare two different sources or search for a quote’s wider context.'],
['Safety and media','Scam Lab checks URLs and message text with AI. Fake Image Checker can inspect image/video signals; the QR reader is in Tools. Example: paste a suspicious address into URL Scanner. No automated check can guarantee a link is safe.'],
['News and discovery','LIVE RADAR shows recent tech stories; Feed (with Videos and Posts choices) and Weekly security report offer more to explore. Example: open a headline, then save or share it.'],
['Chat and learning','AI Chat can answer with an open AI model (such as Google Gemma or Meta Llama on Cloudflare Workers AI, not ChatGPT) together with public sources; if the AI is unavailable it falls back to scripts and cited sources. AI Tips and Security Quiz provide short lessons. Example: ask a factual question and open the cited source.'],
['Language and everyday tools','Translator, Dictionary, language choice, Calculator and Reminders help with everyday tasks. Example: translate a short phrase or set a reminder.'],
['Personalization and privacy','Weather, age/content filters, theme and accent colors, accessibility settings, storage consent, cache and quick clear are available. Share, export and Beta are also in the site. Example: adjust text size in Accessibility.']
];groups.forEach(function(g){b.appendChild(el('h3','',g[0]));b.appendChild(el('p','',g[1]));});
b.appendChild(el('p','v9-note','For safety results, “no warning found” does not mean a link is guaranteed safe. The chat and summaries can be incomplete; check original sources.'));
btn('Start using the site','pri',v9WelcomeNext);btn('Back','',function(){tutorialRender('choose');});btn('Skip tutorial','',v9WelcomeNext);
}else{
b.appendChild(el('p','','Each card gives a sample use. Press Try to open that feature; the guide will close. Reopen it later with the ? button.'));
var lessons=[
['🔎 Search and compare','Search “climate change” across many sources; in Standard Mode select two results to compare, or try Random comparison.',0],
['🛡️ Check a link','Paste a suspicious URL and review the local and available safety checks.',1],
['📝 Check a message','Paste a suspicious SMS or email and inspect the warning signs.',2],
['🖼️ Check media','Choose an image or video to inspect available authenticity signals.',3],
['📡 Read current news','Browse LIVE RADAR and the feed for recent stories.',4],
['🤖 Ask the helper','Ask a factual question; check the public sources it returns.',5],
['💡 Learn a tip','Open a short privacy or security tip.',6],
['🛡️ Weekly report','Read the weekly security digest and its linked sources.',7],
['🎬 Find videos','Search video archives and open a result in the player.',8],
['🌍 Translate','Translate text or a web page.',9],
['📖 Dictionary','Look up a word and its definitions.',10],
['🧰 Privacy tools and QR reader','Open Tools for the password generator, PDF/photo checks and QR reader.',11],
['🌤️ Weather','See current weather information.',12],
['👶 Age and content settings','Set an age choice and content filter.',13],
['♿️ Accessibility','Adjust text, contrast and motion settings.',14],
['🎨 Appearance','Change accent color and theme.',15],
['💾 Offline cache','Inspect the saved feed/video cache.',16],
['🧹 Storage and consent','Review storage choices and clear saved data.',17],
['🧮 Calculator','Try a calculation.',18],
['⏰ Reminders','Create a reminder or export it to a calendar.',19],
['🎮 Security quiz','Try a short security knowledge quiz.',20],
['🌐 Language choice','Choose a language for supported parts of the site.',21],
['📤 Share and export','Use the page’s Share or Export controls after a search.',22],
['🔎 Find quote context','Paste any word, phrase or sentence. Search public sources, then inspect readable results for matching wording and surrounding text. Short phrases may be less specific; open the original source for more context.',23]
];lessons.forEach(function(item){var c=el('div','v9-card');c.style.margin='8px 0';c.appendChild(el('b','',item[0]));c.appendChild(el('p','',item[1]));var x=mkBtn('Try this','',function(){tutorialTry('try',item[2]);});x.style.cssText='padding:8px 14px';c.appendChild(x);b.appendChild(c);});
btn('Finish tutorial','pri',v9WelcomeNext);btn('Skip tutorial','',v9WelcomeNext);btn('Back','',function(){tutorialRender('choose');});
}
w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');}
function buildWelcome(){var w=el('div');w.id='v9Welcome';var header=document.querySelector('.header');if(header&&!$('tutorialBtn')){var help=mkBtn('? Guide','',openTutorial);help.id='tutorialBtn';help.setAttribute('aria-label','Open tutorial');header.appendChild(help);}document.body.appendChild(w);tutorialRender('choose');return w;}
/* ---- SHARE ---- */
function shareText(){
var lines=['AI Information'+(currentQuery?' – '+currentQuery:''),''];
if(typeof currentSources!=='undefined'&&currentSources.length){currentSources.slice(0,200).forEach(function(x){lines.push('• '+x.source+': '+x.url);});lines.push('');}
lines.push(location.href);return lines.join('\n');
}
function doShare(){
hideKeyboard();
var body=$('v9ShareBody');body.textContent='';
var mode=store.get('ai_share_mode')||'text';
body.appendChild(el('div','v9-note','Choose what to send:'));
var row=el('div','v9-row'),tb=el('button','v9-tab'+(mode==='text'?' on':''),'📝 As text'),fb=el('button','v9-tab'+(mode==='file'?' on':''),'📎 As a file');
tb.type=fb.type='button';
function setMode(m){mode=m;store.set('ai_share_mode',m);tb.classList.toggle('on',m==='text');fb.classList.toggle('on',m==='file');}
tb.onclick=function(){setMode('text');};fb.onclick=function(){setMode('file');};row.appendChild(tb);row.appendChild(fb);body.appendChild(row);
var ta=el('textarea','v9-in');ta.rows=7;ta.style.width='100%';ta.value=shareText();body.appendChild(ta);
var r2=el('div','v9-row');
r2.appendChild(mkBtn('📲 Share to apps…','pri',function(){
var t=ta.value,nav=navigator;
if(mode==='file'&&nav.canShare){
var f=new File([t],'ai-information.txt',{type:'text/plain'});
if(nav.canShare({files:[f]})){nav.share({files:[f],title:'AI Information'}).then(function(){logAct('share','file');}).catch(function(){});return;}
}
if(nav.share){nav.share({title:'AI Information',text:t,url:location.href}).then(function(){logAct('share','text');}).catch(function(){});return;}
toast('Your browser has no share menu. Use the buttons below.','#ffaa00',4000);
}));
r2.appendChild(mkBtn('🔗 Copy link','',function(){
if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(function(){toast('Link copied');logAct('share','copy link');},function(){toast('Copy failed','#ff4444');});
}));
r2.appendChild(mkBtn('📋 Copy text','',function(){if(navigator.clipboard)navigator.clipboard.writeText(ta.value).then(function(){toast('Copied');});}));
r2.appendChild(mkBtn('⬇️ Download .txt','',function(){saveFile('ai-information-share.txt',ta.value,'text/plain');logAct('share','download');}));
body.appendChild(r2);
body.appendChild(el('div','v9-note','Or open a messenger directly (mobile):'));
var r3=el('div','v9-row'),enc=encodeURIComponent;
[['Viber',function(){return 'viber://forward?text='+enc(ta.value);}],['Messenger',function(){return 'fb-messenger://share/?link='+enc(location.href);}],['WhatsApp',function(){return 'https://wa.me/?text='+enc(ta.value);}],['Telegram',function(){return 'https://t.me/share/url?url='+enc(location.href)+'&text='+enc(ta.value.slice(0,500));}],['Email',function(){return 'mailto:?subject='+enc('AI Information')+'&body='+enc(ta.value);}]].forEach(function(a){
r3.appendChild(mkBtn(a[0],'',function(){window.location.href=a[1]();logAct('share',a[0]);}));});
body.appendChild(r3);
openPanel('v9Share');
}
/* ---- EXPORT NEW INFORMATION ---- */

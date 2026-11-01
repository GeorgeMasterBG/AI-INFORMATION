/* AI INFORMATION - dict.js
   Dictionary.
   Only function declarations: they are called later by app.js (loaded last). */

/* ===================== v38: dictionary (any language) + site language (any language) ===================== */
function initDict(){
var body=mkPanel('v9Dict','📖 Dictionary');
var note=el('div','v9-note','Look up any word in any language. Definitions come from Wiktionary. Offensive and vulgar words are never shown.');
var row=el('div','v9-row');var inp=el('input','v9-in');inp.placeholder='Type a word… (any language)';inp.maxLength=60;inp.setAttribute('aria-label','Word');inp.setAttribute('autocapitalize','none');inp.setAttribute('autocomplete','off');inp.setAttribute('translate','no');
var go=mkBtn('Look up','pri',function(){run();});row.appendChild(inp);row.appendChild(go);
var out=el('div');out.style.marginTop='10px';
var CTRY=[['','Auto (all countries and languages)',''],['United States','United States','English'],['United Kingdom','United Kingdom','English'],['Australia','Australia','English'],['Canada','Canada','English'],['Bulgaria','Bulgaria','Bulgarian'],['Germany','Germany','German'],['France','France','French'],['Spain','Spain','Spanish'],['Italy','Italy','Italian'],['Portugal','Portugal','Portuguese'],['Brazil','Brazil','Portuguese'],['Netherlands','Netherlands','Dutch'],['Poland','Poland','Polish'],['Romania','Romania','Romanian'],['Serbia','Serbia','Serbian'],['Greece','Greece','Greek'],['Turkey','Turkey','Turkish'],['Russia','Russia','Russian'],['Ukraine','Ukraine','Ukrainian'],['Japan','Japan','Japanese'],['China','China','Chinese'],['India','India','Hindi']];
var cr=el('div','v9-row');cr.appendChild(el('span','','🌍 Country:'));
var csel=el('select','v9-sel');csel.setAttribute('aria-label','Country');CTRY.forEach(function(c){var o=document.createElement('option');o.value=c[0];o.textContent=c[1];csel.appendChild(o);});
var _c0=jget('ai_v9_dict_country','');csel.value=typeof _c0==='string'?_c0:'';if(csel.value!==_c0)csel.value='';
csel.onchange=function(){jset('ai_v9_dict_country',csel.value);};cr.appendChild(csel);
var chint=el('div','v9-note','Pick a country instead of leaving it on automatic: its language is shown first in the dictionary, and the AI explains how the word is used there.');
body.appendChild(note);body.appendChild(row);body.appendChild(cr);body.appendChild(chint);body.appendChild(out);
var dictAi=aiBlock('🤖 Define with AI','define',function(){var w=inp.value.trim().replace(/\s+/g,' ');if(!w){inp.focus();return 'Type a word first.';}if(w.length>60||/[\/\\?#<>|{}\[\]^`"]/.test(w))return 'Type one word or a short phrase without special symbols.';return{text:w,extra:csel.value?{country:csel.value}:{}};},{hint:'AI mode: an AI model writes the definition and tells you how the word is used in the chosen country. Check important meanings in the dictionary above.'});
body.appendChild(dictAi);
inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();run();}});
var seq=0;
function msg(t){out.textContent='';out.appendChild(el('div','v9-note',t));}
function run(){
var w=inp.value.trim().replace(/\s+/g,' ');
if(!w){msg('Type a word first.');return;}
if(w.length>60||/[\/\\?#<>|{}\[\]^`"]/.test(w)){msg('Type one word or a short phrase without special symbols.');return;}
var me=++seq;msg('Looking up…');
xget('define',{word:w},20000).then(function(j){
if(me!==seq)return;out.textContent='';
if(!j.found){msg('No entry found for this word.');return;}
if(!j.entries||!j.entries.length){msg(j.hidden?'This word is not shown because the dictionary marks it as offensive or vulgar.':'No definition is available for this word.');return;}
var groups={},order=[];
j.entries.forEach(function(e){var k=e.name||e.lang;if(!groups[k]){groups[k]=[];order.push(k);}groups[k].push(e);});
var want=(CTRY.filter(function(c){return c[0]===csel.value;})[0]||['','',''])[2];
if(want)order.sort(function(a,b){return(b===want)-(a===want);});
order.forEach(function(k){
var card=el('div','v9-card');var h=el('b','',k+(want&&k===want?'  ·  '+csel.value:''));card.appendChild(h);
groups[k].forEach(function(e){
if(e.pos){var p=el('div','v9-note',e.pos);p.style.marginTop='8px';card.appendChild(p);}
var ol=document.createElement('ol');ol.style.cssText='margin:4px 0 0 18px;padding:0;line-height:1.5';
e.defs.forEach(function(d){var li=document.createElement('li');li.appendChild(document.createTextNode(d.t));
if(d.ex&&d.ex[0]){var x=el('div','v9-note','“'+d.ex[0]+'”');x.setAttribute('translate','no');x.style.fontStyle='italic';li.appendChild(x);}
ol.appendChild(li);});
card.appendChild(ol);
});
out.appendChild(card);
});
var hw=el('div','v9-note','');hw.style.marginTop='8px';
var a=el('a','','Open “'+w+'” on Wiktionary ↗');a.setAttribute('translate','no');a.href='https://en.wiktionary.org/wiki/'+encodeURIComponent(w.replace(/ /g,'_'));a.target='_blank';a.rel='noopener noreferrer';hw.appendChild(a);
hw.appendChild(document.createTextNode(' · Text from Wiktionary, CC BY-SA.'));
out.appendChild(hw);
if(j.hidden)out.appendChild(el('div','v9-note','Some meanings are not shown because the dictionary marks them as offensive.'));
logAct('dict',w);
}).catch(function(e){if(me!==seq)return;msg(/needs-server/.test(String(e&&e.message))?'The dictionary needs the site server (the Worker). It is not available on this kind of hosting.':'The dictionary could not be reached. Try again in a moment.');});
}
var btn=mkBtn('📖 Dictionary','',function(){openPanel('v9Dict');setTimeout(function(){try{inp.focus();}catch(e){}},300);});
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
}

/* AI INFORMATION - tools.js
   Tools: password generator, PDF details, photo location, QR, translate from photo, calculator, colours, age, clear data.
   Only function declarations: they are called later by app.js (loaded last). */

function initTools(){
var body=mkPanel('v9Tools','🧰 Tools');
var tabs=el('div','v9-row'),pane=el('div');pane.style.marginTop='14px';
body.appendChild(tabs);body.appendChild(pane);
var cur='';
function tab(id,label,fn){var b=mkBtn(label,'',function(){cur=id;[].forEach.call(tabs.children,function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false');});b.classList.add('on');b.setAttribute('aria-pressed','true');pane.textContent='';fn(pane);});b.setAttribute('aria-pressed','false');tabs.appendChild(b);return b;}
function field(){var i=document.createElement('input');i.style.cssText='width:100%;box-sizing:border-box;padding:12px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-size:15px';return i;}
function note(t){var n=el('div','v9-note',t);n.style.marginTop='10px';return n;}
// ---------- 1. password generator ----------
function gen(p){
var sets={lower:'abcdefghijkmnopqrstuvwxyz',upper:'ABCDEFGHJKLMNPQRSTUVWXYZ',digits:'23456789',symbols:'!@#$%^&*()-_=+[]{};:,.?'};
var full={lower:'abcdefghijklmnopqrstuvwxyz',upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',digits:'0123456789',symbols:sets.symbols};
var opt={lower:true,upper:true,digits:true,symbols:true,clear:true},len=20;
var out=el('div','');out.style.cssText='font-family:monospace;font-size:17px;word-break:break-all;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px;min-height:24px';
out.setAttribute('aria-live','polite');
var meta=el('div','v9-note','');meta.style.marginTop='8px';
function rnd(n){var lim=Math.floor(4294967296/n)*n,a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=lim);return a[0]%n;}
function make(){
var src=opt.clear?sets:full,pools=['lower','upper','digits','symbols'].filter(function(k){return opt[k];});
if(!pools.length){out.textContent='Choose at least one kind of character.';meta.textContent='';return;}
var all=pools.map(function(k){return src[k];}).join(''),chars=[];
pools.forEach(function(k){chars.push(src[k].charAt(rnd(src[k].length)));});
while(chars.length<len)chars.push(all.charAt(rnd(all.length)));
for(var i=chars.length-1;i>0;i--){var j=rnd(i+1),t=chars[i];chars[i]=chars[j];chars[j]=t;}
out.textContent=chars.join('');
var bits=Math.round(len*Math.log(all.length)/Math.LN2);
meta.textContent=bits+' bits of randomness · '+(bits>=100?'excellent':bits>=75?'strong':bits>=55?'okay':'weak');
}
var lr=el('div','');lr.style.cssText='display:flex;align-items:center;gap:10px;margin:12px 0';
var ll=el('label','','Length: '+len);var sl=document.createElement('input');sl.type='range';sl.min=8;sl.max=64;sl.value=len;sl.style.flex='1';sl.setAttribute('aria-label','Password length');
sl.oninput=function(){len=Number(sl.value);ll.textContent='Length: '+len;make();};lr.appendChild(ll);lr.appendChild(sl);
var row=el('div','');row.style.cssText='display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px';
[['lower','a-z'],['upper','A-Z'],['digits','0-9'],['symbols','!@#'],['clear','No look-alikes (0/O, 1/l)']].forEach(function(o){
var l=el('label','');l.style.cssText='display:flex;align-items:center;gap:6px;font-size:13px';var c=document.createElement('input');c.type='checkbox';c.checked=opt[o[0]];c.onchange=function(){opt[o[0]]=c.checked;make();};l.appendChild(c);l.appendChild(document.createTextNode(o[1]));row.appendChild(l);});
var br=el('div','v9-row');
br.appendChild(mkBtn('↻ New','',make));
br.appendChild(mkBtn('⧉ Copy','',function(){var t=out.textContent;if(!t||/^Choose/.test(t))return;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('Copied');},function(){toast('Could not copy. Select the text and copy it.','#ff4444');});else toast('Could not copy. Select the text and copy it.','#ff4444');}));
p.appendChild(out);p.appendChild(meta);p.appendChild(lr);p.appendChild(row);p.appendChild(br);
var pwBox=el('div','v9-card');pwBox.style.cssText='margin:10px 0;padding:10px';p.appendChild(pwBox);
pwBox.appendChild(el('b','','🔎 Rate my password with AI'));
pwBox.appendChild(el('div','v9-note','Type a password to rate. The password itself is never sent: only its length and shape (how many lowercase, uppercase, digits, symbols, repeats and simple sequences) go to the AI. A stronger one is then made in your browser.'));
var pwi=document.createElement('input');pwi.type='password';pwi.autocomplete='off';pwi.setAttribute('aria-label','Password to rate');pwi.style.cssText='width:100%;margin-top:8px;padding:8px';pwBox.appendChild(pwi);
function pwShape(w){var c={lower:0,upper:0,digit:0,symbol:0};for(var i=0;i<w.length;i++){var ch=w[i];if(/[a-z]/.test(ch))c.lower++;else if(/[A-Z]/.test(ch))c.upper++;else if(/[0-9]/.test(ch))c.digit++;else c.symbol++;}
var rp=0,seq=0;for(var j=1;j<w.length;j++){if(w[j]===w[j-1])rp++;if(Math.abs(w.charCodeAt(j)-w.charCodeAt(j-1))===1)seq++;}
var uniq=new Set(w.split('')).size;var m=w.slice(0,64).replace(/[a-z]/g,'l').replace(/[A-Z]/g,'U').replace(/[0-9]/g,'d').replace(/[^lUd]/g,'s');
return 'Length: '+w.length+'. Lowercase: '+c.lower+', uppercase: '+c.upper+', digits: '+c.digit+', symbols: '+c.symbol+'. Distinct characters: '+uniq+'. Repeated neighbours: '+rp+'. Neighbouring sequence steps: '+seq+'. Shape (l=lowercase, U=uppercase, d=digit, s=symbol): '+m+'. Starts with an uppercase letter: '+(/^[A-Z]/.test(w)?'yes':'no')+'. Ends with digits: '+(/[0-9]+$/.test(w)?'yes':'no')+'.';}
var pwOut=el('div','');
pwBox.appendChild(aiBlock('🔎 Rate with AI','pw_rate',function(){var w=pwi.value;if(!w)return 'Type a password first.';return{text:pwShape(w)};},{hint:'AI mode: only the shape described above is sent, never the password. The AI cannot know if it was leaked or is a common word; never reuse a password you rate here.',render:function(out,res,redraw){aiRiskRender(out,res,redraw);var b=mkBtn('✨ Make a stronger one for me','pri',function(){var cs='abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_=+',o='';for(var i=0;i<18;i++)o+=cs[rnd(cs.length)];pwOut.textContent='';var t=el('div','');t.style.cssText='font-family:monospace;word-break:break-all;margin:8px 0';t.textContent=o;pwOut.appendChild(t);pwOut.appendChild(mkBtn('⧉ Copy','',function(){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(o).then(function(){toast('Copied');},function(){toast('Could not copy. Select it by hand.');});}));pwOut.appendChild(el('div','v9-note','Made in your browser with the secure random generator (18 characters). Save it in a password manager.'));});b.type='button';out.appendChild(b);}}));
pwBox.appendChild(pwOut);
p.appendChild(aiBlock('🤖 Ask AI for memorable passphrases','passphrase',function(){return{text:'Make five passphrases.'};},{hint:'AI mode: nothing about your passwords is sent. The AI only writes example passphrases from common words. AI text is not truly random, so for important accounts use the generator above.'}));
p.appendChild(note('Made in your browser with the secure random generator. Nothing is sent or saved anywhere. Use a different password for every account and keep them in a password manager.'));
make();
}
// ---------- 3. PDF metadata ----------
function pdfStr(raw){
var s;
if(raw.charAt(0)==='('){
s=raw.slice(1,-1).replace(/\\([nrtbf()\\]|[0-7]{1,3}|\r?\n)/g,function(m,c){if(c==='n')return'\n';if(c==='r')return'\r';if(c==='t')return'\t';if(c==='b')return'\b';if(c==='f')return'\f';if(/^[0-7]/.test(c))return String.fromCharCode(parseInt(c,8)&255);if(/^\r?\n$/.test(c))return'';return c;});
}else{
var h=raw.slice(1,-1).replace(/\s+/g,'');if(h.length%2)h+='0';s='';for(var i=0;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.slice(i,i+2),16));
}
if(s.charCodeAt(0)===254&&s.charCodeAt(1)===255){var o='';for(var k=2;k+1<s.length;k+=2)o+=String.fromCharCode((s.charCodeAt(k)<<8)|s.charCodeAt(k+1));return o;}
return s;
}
function pdfDate(v){var m=/^D:(\d{4})(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?/.exec(v);if(!m)return v;return m[1]+'-'+(m[2]||'01')+'-'+(m[3]||'01')+(m[4]?' '+m[4]+':'+(m[5]||'00'):'');}
function inspectPdf(txt,size){
var info={},keys=['Title','Author','Subject','Keywords','Creator','Producer','CreationDate','ModDate'];
var re=/\/(Title|Author|Subject|Keywords|Creator|Producer|CreationDate|ModDate)\s*(\((?:\\[\s\S]|[^\\)])*\)|<[0-9A-Fa-f\s]*>)/g,m;
while((m=re.exec(txt)))info[m[1]]=pdfStr(m[2]);   // the last one wins (edits are appended)
var xmp=function(tag){var r=new RegExp('<'+tag+'[^>]*>([\\s\\S]{0,400}?)</'+tag+'>').exec(txt);return r?r[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():'';};
var x={creatorTool:xmp('xmp:CreatorTool'),producer:xmp('pdf:Producer'),author:xmp('dc:creator'),created:xmp('xmp:CreateDate'),modified:xmp('xmp:ModifyDate')};
var flags=[];
if(/\/(JavaScript|JS)\b/.test(txt))flags.push(['high','Contains JavaScript','PDF scripts can run actions when opened. Only open this from a source you trust.']);
if(/\/Launch\b/.test(txt))flags.push(['high','Can launch other programs','A /Launch action is rarely needed in a normal document.']);
if(/\/OpenAction\b/.test(txt))flags.push(['med','Runs something when opened','An /OpenAction is set.']);
if(/\/EmbeddedFile\b/.test(txt))flags.push(['med','Has attached files inside','The PDF carries other files.']);
if(/\/Encrypt\b/.test(txt))flags.push(['info','Encrypted','Some details may be hidden from this check.']);
var pages=(txt.match(/\/Type\s*\/Page(?![A-Za-z])/g)||[]).length;
return{info:info,x:x,flags:flags,pages:pages,version:(/^%PDF-(\d\.\d)/.exec(txt)||[])[1]||''};
}
function pdfTab(p){
p.appendChild(el('div','v9-note','See what a PDF reveals about you before you share it: author name, the software used and dates. The file is read in your browser and never uploaded.'));
var f=document.createElement('input');f.type='file';f.accept='application/pdf,.pdf';f.style.cssText='margin-top:12px;width:100%';f.setAttribute('aria-label','Choose a PDF');
var res=el('div','');res.style.marginTop='12px';res.setAttribute('aria-live','polite');
f.onchange=function(){
var file=f.files&&f.files[0];res.textContent='';if(!file)return;
if(file.size>30*1048576){res.textContent='This file is too large to check here (max 30 MB).';return;}
res.textContent='⏳ Reading…';
var rd=new FileReader();rd.onerror=function(){res.textContent='Could not read this file.';};
rd.onload=function(){
var txt=rd.result;
if(!/^%PDF-/.test(txt.slice(0,1024))){res.textContent='This does not look like a PDF file.';return;}
var r=inspectPdf(txt,file.size);res.textContent='';
var rows=[['Title',r.info.Title],['Author',r.info.Author||r.x.author],['Subject',r.info.Subject],['Keywords',r.info.Keywords],['Created with',r.info.Creator||r.x.creatorTool],['PDF software',r.info.Producer||r.x.producer],['Created',r.info.CreationDate?pdfDate(r.info.CreationDate):r.x.created],['Last modified',r.info.ModDate?pdfDate(r.info.ModDate):r.x.modified],['Pages (approx.)',r.pages?String(r.pages):''],['PDF version',r.version],['File',String(file.name).slice(0,80)+' · '+fmtBytes(file.size)]];
var shown=0,tb=document.createElement('table');tb.style.cssText='width:100%;border-collapse:collapse;font-size:13px';
rows.forEach(function(x){if(!x[1])return;shown++;var tr=document.createElement('tr');var a=document.createElement('td'),b=document.createElement('td');a.textContent=x[0];b.textContent=String(x[1]).slice(0,200);a.style.cssText='padding:6px;border-bottom:1px solid var(--border2);opacity:.7;white-space:nowrap;vertical-align:top';b.style.cssText='padding:6px;border-bottom:1px solid var(--border2);word-break:break-word';tr.appendChild(a);tr.appendChild(b);tb.appendChild(tr);});
res.appendChild(tb);
var personal=r.info.Author||r.x.author||r.info.Creator||r.info.Producer;
var _pf=rows.filter(function(x){return x[1];}).map(function(x){return x[0]+': '+String(x[1]).slice(0,200);}).concat(r.flags.map(function(g){return 'Flag: '+g[1]+' - '+g[2];}));
if(r.flags.length){var ul=el('ul','rep-list');r.flags.forEach(function(g){var li=el('li','rep-item sev-info');li.appendChild(el('b','',g[1]));li.appendChild(el('div','',g[2]));ul.appendChild(li);});res.appendChild(ul);}
res.appendChild(aiRisk('pdf',function(){return{text:_pf.join('\n').slice(0,5000)};}));
res.appendChild(el('div','rep-note','To remove personal details: open the PDF, choose Print, then "Save as PDF" (this writes a new file with fresh details), or use "Sanitize" in a PDF editor. Some PDFs store details in compressed sections that a browser check cannot read, so a clean result is not a guarantee.'));
};
rd.readAsText(file.size>12*1048576?file.slice(0,6*1048576):file,'latin1');
};
p.appendChild(f);p.appendChild(res);
}
// ---------- 4. photo location ----------
function exifFind(b){
var i,len,m;
if(b[0]===0xFF&&b[1]===0xD8){
i=2;
while(i+4<b.length){
if(b[i]!==0xFF){i++;continue;}
m=b[i+1];
if(m===0xD8||m===0x01||(m>=0xD0&&m<=0xD7)){i+=2;continue;}
if(m===0xD9||m===0xDA)break;
len=(b[i+2]<<8)|b[i+3];
if(m===0xE1&&String.fromCharCode(b[i+4],b[i+5],b[i+6],b[i+7])==='Exif')return i+10;
i+=2+len;
}
return -1;
}
if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47){
var dv=new DataView(b.buffer,b.byteOffset,b.byteLength);i=8;
while(i+12<=b.length){len=dv.getUint32(i);var ty=String.fromCharCode(b[i+4],b[i+5],b[i+6],b[i+7]);if(ty==='eXIf')return i+8;if(ty==='IEND')break;i+=12+len;}
return -1;
}
if(b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50){
i=12;
while(i+8<=b.length){var t=String.fromCharCode(b[i],b[i+1],b[i+2],b[i+3]),l=(b[i+4]|(b[i+5]<<8)|(b[i+6]<<16)|(b[i+7]<<24))>>>0,d=i+8;
if(t==='EXIF')return String.fromCharCode(b[d],b[d+1],b[d+2],b[d+3])==='Exif'?d+6:d;
i=d+l+(l&1);}
return -1;
}
return -2;
}
function exifRead(b,off){
var le=b[off]===0x49&&b[off+1]===0x49;
if(!le&&!(b[off]===0x4D&&b[off+1]===0x4D))return null;
var dv=new DataView(b.buffer,b.byteOffset,b.byteLength);
function u16(o){return dv.getUint16(o,le);}
function u32(o){return dv.getUint32(o,le);}
if(u16(off+2)!==42)return null;
var SZ={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
function ifd(o){var n=Math.min(u16(o),300),r=[];for(var i=0;i<n;i++){var e=o+2+i*12;if(e+12>b.length)break;r.push({tag:u16(e),type:u16(e+2),count:u32(e+4),e:e});}return r;}
function ptr(en){var sz=(SZ[en.type]||1)*en.count;return sz>4?off+u32(en.e+8):en.e+8;}
function str(en){var p=ptr(en),s='';for(var k=0;k<Math.min(en.count,128);k++){var c=b[p+k];if(!c)break;s+=String.fromCharCode(c);}return s.trim();}
function rats(en){var p=ptr(en),r=[];for(var k=0;k<Math.min(en.count,3);k++){var d=u32(p+k*8+4);r.push(d?u32(p+k*8)/d:0);}return r;}
function find(list,tag){for(var i=0;i<list.length;i++)if(list[i].tag===tag)return list[i];return null;}
var out={},i0=ifd(off+u32(off+4)),t;
if((t=find(i0,0x010F)))out.make=str(t);
if((t=find(i0,0x0110)))out.model=str(t);
if((t=find(i0,0x0131)))out.software=str(t);
if((t=find(i0,0x8769))){var ex=ifd(off+u32(t.e+8));
if((t=find(ex,0x9003)))out.taken=str(t);
if((t=find(ex,0xA430)))out.owner=str(t);
if((t=find(ex,0xA431)))out.serial=str(t);
if((t=find(ex,0xA434)))out.lens=str(t);
}
if((t=find(i0,0x8825))){var g=ifd(off+u32(t.e+8)),la=find(g,2),lo=find(g,4),lr=find(g,1),or=find(g,3),al=find(g,6),ar=find(g,5),gd=find(g,29);
if(la&&lo&&la.count>=3&&lo.count>=3){
var a=rats(la),o=rats(lo),lat=a[0]+a[1]/60+a[2]/3600,lon=o[0]+o[1]/60+o[2]/3600;
if(lr&&str(lr).charAt(0)==='S')lat=-lat;
if(or&&str(or).charAt(0)==='W')lon=-lon;
if(isFinite(lat)&&isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180&&(lat!==0||lon!==0))out.gps={lat:lat,lon:lon};
}
if(al){var p2=ptr(al),d2=u32(p2+4);if(d2){out.alt=u32(p2)/d2*(ar&&b[ar.e+8]===1?-1:1);}}
if(gd)out.gpsDate=str(gd);
out.hasGpsBlock=true;
}
return out;
}
function photoTab(p){
p.appendChild(el('div','v9-note','See what a photo reveals before you share it: the place it was taken, the camera and the date. The photo is read in your browser and never uploaded.'));
var f=dualPick(p,'Choose a photo');
var res=el('div','');res.style.marginTop='12px';res.setAttribute('aria-live','polite');
p.appendChild(res);
var run=0;
f.onchange=function(){
var file=f.files&&f.files[0];if(!file)return;
var my=++run;res.textContent='⏳ Reading…';
if(!/^image\//.test(file.type)){res.textContent='Please choose an image file.';return;}
file.slice(0,Math.min(file.size,6*1048576)).arrayBuffer().then(function(ab){
if(my!==run)return;
var b=new Uint8Array(ab),off=exifFind(b),ex=null;
try{if(off>=0)ex=exifRead(b,off);}catch(e){ex=null;}
var items=[],gps=ex&&ex.gps;
if(gps){
var c=gps.lat.toFixed(5)+', '+gps.lon.toFixed(5);
items.push({sev:'high',title:'Location found: '+c,detail:'Anyone who gets this file can see where it was taken, often to within a few metres.'});
if(ex.alt!=null&&isFinite(ex.alt))items.push({sev:'low',title:'Altitude: '+Math.round(ex.alt)+' m',detail:''});
}else if(off===-2){
items.push({sev:'info',title:'This format cannot be read here',detail:'Only JPEG, PNG and WebP are checked. Photos in HEIC format often carry a location too; export or share them as JPEG to check.'});
}else{
items.push({sev:'ok',title:'No location data found',detail:off<0?'The file has no embedded metadata block.':'The photo carries no GPS position.'});
}
if(ex){
if(ex.make||ex.model)items.push({sev:'info',title:'Camera: '+[ex.make,ex.model].filter(Boolean).join(' '),detail:'The device model is stored in the file.'});
if(ex.taken)items.push({sev:'info',title:'Taken: '+ex.taken,detail:'The date and time the photo was shot.'});
if(ex.gpsDate&&!ex.taken)items.push({sev:'info',title:'GPS date: '+ex.gpsDate,detail:''});
if(ex.owner)items.push({sev:'med',title:'Owner name: '+ex.owner,detail:'A personal name is stored in the file.'});
if(ex.serial)items.push({sev:'med',title:'Camera serial number: '+ex.serial,detail:'A serial number can link photos to one device.'});
if(ex.lens)items.push({sev:'info',title:'Lens: '+ex.lens,detail:''});
if(ex.software)items.push({sev:'info',title:'Software: '+ex.software,detail:''});
}
var risky=!!(gps||(ex&&(ex.owner||ex.serial)));
var rep={level:gps?'high':risky?'medium':'low',headline:gps?'📍 This photo contains the location where it was taken':risky?'⚠️ This photo contains personal details':off===-2?'❔ This format cannot be checked here':'✅ No location in this photo',score:null,items:items,nodes:[],links:[],
note:'Messengers and social networks usually remove this data, but email, cloud links and some websites send the file as it is. A copy without any metadata is the safe way to share.'};
if(gps)rep.links.push({label:'Open this spot on OpenStreetMap',url:'https://www.openstreetmap.org/?mlat='+gps.lat.toFixed(5)+'&mlon='+gps.lon.toFixed(5)+'#map=16/'+gps.lat.toFixed(5)+'/'+gps.lon.toFixed(5)});
if(off!==-2){
var box=el('div','');box.style.marginTop='12px';
var bt=mkBtn('⬇️ Download a copy without location data','',function(){
if(file.size>40*1048576){toast('This photo is too large to clean in the browser','#ff4444');return;}
bt.disabled=true;
createImageBitmap(file).then(function(bm){
var cv=document.createElement('canvas');cv.width=bm.width;cv.height=bm.height;cv.getContext('2d').drawImage(bm,0,0);
var type=file.type==='image/png'?'image/png':'image/jpeg';
return new Promise(function(r){cv.toBlob(r,type,0.92);}).then(function(bl){
if(!bl)throw new Error('encode');
var base=String(file.name||'photo').replace(/\.[^.]+$/,'').replace(/[^A-Za-z0-9._-]+/g,'_').slice(0,60)||'photo';
var u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=base+'-clean.'+(type==='image/png'?'png':'jpg');document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},3000);
toast('Saved a copy with no metadata');
});
}).catch(function(){toast('Could not make a clean copy of this file','#ff4444');}).then(function(){bt.disabled=false;});
});
box.appendChild(bt);
box.appendChild(el('div','rep-note','The clean copy is re-drawn from the pixels, so location, camera and date data are all left out. It is saved on your device only.'));
rep.nodes.push(box);
}
if(my!==run)return;
rep.aiTask='photo';rep.aiText=rep.headline+'\n'+(rep.items||[]).map(function(x){return x.title+(x.detail?': '+x.detail:'');}).join('\n');
renderReport(res,rep);
}).catch(function(){res.textContent='Could not read this file.';});
};
}
// ---------- 5. QR code from a photo ----------
function loadJsQR(){
return window.jsQR?Promise.resolve(window.jsQR):new Promise(function(res,rej){
var s=document.createElement('script');s.src='/jsqr.js';s.onload=function(){window.jsQR?res(window.jsQR):rej(new Error('qr'));};s.onerror=function(){rej(new Error('qr'));};document.head.appendChild(s);
});
}
function qrDecode(file){
return createImageBitmap(file).then(function(bm){
var det=null;try{if(window.BarcodeDetector)det=new BarcodeDetector({formats:['qr_code']});}catch(e){det=null;}
var first=det?det.detect(bm).then(function(r){return(r&&r[0]&&r[0].rawValue)||'';}).catch(function(){return '';}):Promise.resolve('');
return first.then(function(v){
if(v)return v;
return loadJsQR().then(function(jsQR){
var sizes=[1600,1100,700,450],last='';
for(var i=0;i<sizes.length;i++){
var sc=Math.min(1,sizes[i]/Math.max(bm.width,bm.height)),w=Math.max(1,Math.round(bm.width*sc)),h=Math.max(1,Math.round(bm.height*sc)),key=w+'x'+h;
if(key===last)continue;last=key;
var cv=document.createElement('canvas');cv.width=w;cv.height=h;
var cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(bm,0,0,w,h);
var d=cx.getImageData(0,0,w,h),r=jsQR(d.data,w,h,{inversionAttempts:'attemptBoth'});
if(r&&r.data)return r.data;
}
return '';
});
});
});
}
function dualPick(p,label){
var f={files:null,onchange:null},row=el('div','');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px';
function mk(txt,cam){var i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','environment');i.style.display='none';i.setAttribute('aria-label',label+(cam?' (camera)':' (file)'));
i.onchange=function(){f.files=i.files;if(f.onchange)f.onchange();};
var b=mkBtn(txt,'',function(){i.value='';i.click();});b.type='button';row.appendChild(i);row.appendChild(b);}
mk('📷 Take a photo',true);mk('🖼️ Choose a file',false);p.appendChild(row);return f;}
function ocrTab(p){
p.appendChild(el('div','v9-note','Take or choose a photo of printed text (sign, menu, label, document). An AI model reads the text and translates it. When you press the button, a smaller copy of the photo is sent to an AI model run by Cloudflare. Handwriting, blur and dark photos may be read wrongly.'));
var f=dualPick(p,'Photo with text');
var sel=document.createElement('select');sel.setAttribute('aria-label','Translate into');sel.style.cssText='margin:10px 0;width:100%;padding:8px';
['Bulgarian','English','German','French','Spanish','Italian','Russian','Turkish','Greek','Romanian','Serbian','Ukrainian','Polish','Dutch','Portuguese','Arabic','Chinese','Japanese'].forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
sel.value=aiLang();if(!sel.value)sel.value='English';
var holder=el('div','');var img=document.createElement('img');img.alt='';img.style.cssText='display:none;max-width:100%;max-height:220px;border-radius:8px;margin-top:6px';
p.appendChild(el('div','v9-note','Translate into:'));p.appendChild(sel);p.appendChild(img);p.appendChild(holder);
var url=null;
f.onchange=function(){holder.textContent='';if(url){URL.revokeObjectURL(url);url=null;}var file=f.files&&f.files[0];if(!file)return;url=URL.createObjectURL(file);img.src=url;img.style.display='block';
holder.appendChild(aiBlock('🔤 Read and translate','photo_text',function(){return imgToDataUrl(file).then(function(d){return{image:d,question:'Read the text in this photo and translate it.',extra:{to:sel.value}};});},{auto:true,hint:'AI mode: a smaller copy of the photo is sent to an AI model when the check starts. Check names, prices, doses and legal text at the original.'}));};
}
function qrTab(p){
p.appendChild(el('div','v9-note','Take or choose a photo of a QR code. The code is read in your browser and the photo is never uploaded. You see what is inside before anything opens.'));
var f=dualPick(p,'Photo of a QR code');
var res=el('div','');res.style.marginTop='12px';res.setAttribute('aria-live','polite');
p.appendChild(res);
var run=0;
f.onchange=function(){
var file=f.files&&f.files[0];if(!file)return;
var my=++run;res.textContent='⏳ Reading the code…';
if(!/^image\//.test(file.type)){res.textContent='Please choose an image file.';return;}
if(file.size>25*1048576){res.textContent='This photo is too large (max 25 MB).';return;}
qrDecode(file).then(function(text){
if(my!==run)return;
if(!text){res.textContent='';res.appendChild(el('div','rep-badge lvl-unknown','❔ No QR code found'));res.appendChild(el('div','rep-note','Try again with the code filling most of the photo, sharp and evenly lit. Do not use a photo of a screen with glare.'));return;}
var raw=String(text).slice(0,2000),rep,nodes=[];
var box=el('div','');box.style.cssText='margin-top:10px;padding:10px;border:1px dashed var(--border2);border-radius:10px;background:var(--bg3);font-family:monospace;font-size:13px;word-break:break-all;white-space:pre-wrap';
box.textContent=raw;
var cap=el('div','rep-note','Exact content of the code:');
nodes.push(cap);nodes.push(box);
if(/^https?:\/\//i.test(raw)||/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(raw)&&!/\s/.test(raw)){
var url=/^https?:\/\//i.test(raw)?raw:'https://'+raw;
rep=analyzeUrl(url)||{level:'unknown',headline:'Link',score:null,items:[],links:[],note:''};
rep.headline='🔗 This code opens a web link. '+rep.headline;
rep.nodes=nodes;

}else{
var kind='Plain text',sev='info',level='low',detail='This code only holds text.';
if(/^WIFI:/i.test(raw)){var ssid=(raw.match(/S:((?:\\.|[^;])*)/i)||[])[1]||'';kind='Wi-Fi login'+(ssid?' for "'+ssid.replace(/\\(.)/g,'$1').slice(0,40)+'"':'');level='medium';sev='med';detail='Scanning it can join your phone to that network. Only join networks you trust.';}
else if(/^(tel|sms|smsto|mms):/i.test(raw)){kind='Phone call or text message';level='medium';sev='med';detail='It can start a call or fill in a message. Premium-rate numbers and text scams use this.';}
else if(/^mailto:/i.test(raw)){kind='New email';level='low';detail='It fills in an email for you to send. Read it before sending.';}
else if(/^(bitcoin|ethereum|litecoin|monero|ripple|solana):/i.test(raw)){kind='Crypto payment';level='high';sev='high';detail='A payment request. Crypto transfers cannot be reversed, so check the address and amount yourself.';}
else if(/^BEGIN:VCARD/i.test(raw)){kind='Contact card';detail='It adds a contact to your phone.';}
else if(/^(geo):/i.test(raw)){kind='Map location';detail='A place on the map.';}
else if(/^(MECARD|BEGIN:VEVENT|BEGIN:VCALENDAR)/i.test(raw)){kind='Contact or calendar entry';detail='It adds an entry to your phone.';}
else if(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)){kind='Link of another type ('+raw.split(':')[0]+')';level='medium';sev='med';detail='This is not a normal web address. It may open an app. Do not continue unless you know what it is.';}
rep={level:level,headline:'📄 '+kind,score:null,items:[{sev:sev,title:kind,detail:detail}],links:[],nodes:nodes,note:'The code may also contain text that looks like instructions. Never follow instructions found in a QR code without checking where they came from.'};
}
rep.aiTask='qr';rep.aiText='QR code content: '+String(raw).slice(0,1500)+'\nKind: '+rep.headline;
renderReport(res,rep);
}).catch(function(){if(my===run)res.textContent='Could not read this photo. Try another one.';});
};
}
var t1=tab('gen','🔑 Password generator',gen);tab('pdf','📄 PDF details',pdfTab);tab('photo','📍 Photo location',photoTab);tab('qr','▦ QR from photo',qrTab);tab('ocr','🔤 Translate from photo',ocrTab);
labCard('🧰','Tools',function(){if(!cur)t1.click();openPanel('v9Tools');},'rgba(160,100,255,0.16)');
}
function initClear(){
var body=mkPanel('v9Clear','🧹 Quick clear');
var SEARCH=/^(ai_v9_(recent|snaps|feedsum|saved|live|act|chat|tips|weekly|fyp_.*)|ai_tip_(cur|last)|ai_favorites|ai_fav_sources|ai_fav_links)$/;
var VIDEO=/^ai_v9_vidx$/;
function keys(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('ai_')===0)o.push(k);}}catch(e){}return o;}
function groups(){var g={search:[],video:[],settings:[]};keys().forEach(function(k){if(VIDEO.test(k))g.video.push(k);else if(SEARCH.test(k))g.search.push(k);else g.settings.push(k);});return g;}
function cacheFiles(){if(!window.caches)return Promise.resolve({names:[],n:0});return caches.keys().then(function(ns){ns=ns.filter(function(n){return n.indexOf('aiinfo-')!==0;});return Promise.all(ns.map(function(n){return caches.open(n).then(function(c){return c.keys();}).then(function(k){return k.length;}).catch(function(){return 0;});})).then(function(a){return{names:ns,n:a.reduce(function(x,y){return x+y;},0)};});}).catch(function(){return{names:[],n:0};});}
var chk={},armed=false,armT=0,go,status;
function render(){
body.textContent='';armed=false;clearTimeout(armT);
body.appendChild(el('div','v9-note','Removes data this site saved on this device. Nothing is sent anywhere. Pick what to clear, then confirm.'));
var g=groups();
cacheFiles().then(function(cf){
var rows=[
['search','Searches and saved items','Recent searches, saved results, AI chat history, tips, favourites and the activity log.',g.search.length+' saved item'+(g.search.length===1?'':'s')],
['video','Videos and feed cache','Downloaded videos and cached pictures. They download again when you watch.',cf.n+' cached file'+(cf.n===1?'':'s')],
['settings','Settings and preferences','Theme, text size, low data mode, weather place, tip timing and the welcome screen. They go back to the defaults.',g.settings.length+' setting'+(g.settings.length===1?'':'s')]
];
rows.forEach(function(r){
if(chk[r[0]]===undefined)chk[r[0]]=true;
var l=el('label','');l.style.cssText='display:flex;gap:10px;align-items:flex-start;padding:12px;margin-top:10px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;cursor:pointer';
var c=document.createElement('input');c.type='checkbox';c.checked=chk[r[0]];c.style.marginTop='3px';c.onchange=function(){chk[r[0]]=c.checked;};
var t=el('div','');var h=el('div','',r[1]);h.style.fontWeight='bold';var d=el('div','',r[2]);d.style.cssText='font-size:12px;opacity:.85;margin-top:2px;line-height:1.5';var n=el('div','',r[3]);n.style.cssText='font-size:12px;margin-top:4px;color:var(--accent)';
t.appendChild(h);t.appendChild(d);t.appendChild(n);l.appendChild(c);l.appendChild(t);body.appendChild(l);
});
go=mkBtn('🧹 Clear selected','',function(){
if(!chk.search&&!chk.video&&!chk.settings){status.textContent='Choose at least one item.';return;}
if(!armed){armed=true;go.textContent='⚠️ Tap again to confirm';go.classList.add('on');status.textContent='This cannot be undone.';armT=setTimeout(function(){armed=false;go.textContent='🧹 Clear selected';go.classList.remove('on');status.textContent='';},5000);return;}
clearTimeout(armT);go.disabled=true;status.textContent='⏳ Clearing…';
var gg=groups(),removed=0;
['search','video','settings'].forEach(function(k){if(chk[k])gg[k].forEach(function(key){try{localStorage.removeItem(key);removed++;}catch(e){}});});
var p=Promise.resolve(0);
if(chk.video&&window.caches){p=cacheFiles().then(function(cf){return Promise.all(cf.names.map(function(n){return caches.delete(n);})).then(function(){return cf.n;});}).catch(function(){return 0;});}
p.then(function(files){
status.textContent='✅ Done: '+removed+' saved item'+(removed===1?'':'s')+(chk.video?' and '+files+' cached file'+(files===1?'':'s'):'')+' removed. Reloading…';
setTimeout(function(){try{location.reload();}catch(e){}},1400);
});
});
go.style.marginTop='16px';
status=el('div','');status.style.cssText='margin-top:10px;font-size:13px';status.setAttribute('aria-live','polite');
body.appendChild(go);body.appendChild(status);
body.appendChild(el('div','v9-note','The page keeps its own offline copy so it still opens without a connection.'));
});
}
var btn=el('button','','🧹 Quick clear');btn.type='button';btn.onclick=function(){render();openPanel('v9Clear');};
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
}
function initCalc(){
var body=mkPanel('v9Calc','🧮 Calculator');body.parentNode.id='v9Calc';
var deg=true,hist=[];
function fmt(x){if(!isFinite(x))throw new Error('Not a number');var r=parseFloat(x.toPrecision(12));return String(r);}
function evalExpr(src){
var s=String(src).toLowerCase().replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/,/g,'.').replace(/\s+/g,'');
if(!s)throw new Error('Type something');if(s.length>200)throw new Error('Too long');
var t=s.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/^%()!]/g);if(!t||t.join('')!==s)throw new Error('Unknown symbol');
var i=0;function peek(){return t[i];}function nx(){return t[i++];}
var F={sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp,floor:Math.floor,ceil:Math.ceil,round:Math.round,
sin:function(x){return Math.sin(deg?x*Math.PI/180:x);},cos:function(x){return Math.cos(deg?x*Math.PI/180:x);},tan:function(x){return Math.tan(deg?x*Math.PI/180:x);},
asin:function(x){var r=Math.asin(x);return deg?r*180/Math.PI:r;},acos:function(x){var r=Math.acos(x);return deg?r*180/Math.PI:r;},atan:function(x){var r=Math.atan(x);return deg?r*180/Math.PI:r;}};
function expr(){var v=term();while(peek()==='+'||peek()==='-'){var o=nx(),r=term();v=o==='+'?v+r:v-r;}return v;}
function term(){var v=pow();for(;;){var p=peek();if(p==='*'||p==='/'){nx();var r=pow();v=p==='*'?v*r:v/r;}else if(p&&(/^[\d.(]/.test(p)||(/^[a-z]/.test(p)&&p!=='e'||p==='e'&&false))){var r2=pow();v=v*r2;}else break;}return v;}
function pow(){var b=unary();if(peek()==='^'){nx();return Math.pow(b,pow());}return b;}
function unary(){if(peek()==='-'){nx();return -unary();}if(peek()==='+'){nx();return unary();}return post();}
function post(){var v=prim();for(;;){if(peek()==='%'){nx();v=v/100;}else if(peek()==='!'){nx();if(v<0||v>170||Math.floor(v)!==v)throw new Error('Bad factorial');var f=1;for(var k=2;k<=v;k++)f*=k;v=f;}else break;}return v;}
function prim(){var x=nx();if(x===undefined)throw new Error('Unfinished');
if(x==='('){var v=expr();if(nx()!==')')throw new Error('Missing )');return v;}
if(/^[\d.]/.test(x)){var n=parseFloat(x);if(isNaN(n))throw new Error('Bad number');return n;}
if(x==='pi')return Math.PI;if(x==='e')return Math.E;
if(F[x]){if(nx()!=='(')throw new Error('Use '+x+'( )');var a=expr();if(nx()!==')')throw new Error('Missing )');return F[x](a);}
throw new Error('Unknown: '+x);}
var res=expr();if(i<t.length)throw new Error('Unexpected '+t[i]);return res;}
var disp=document.createElement('input');disp.className='age-in';disp.style.cssText='font-size:24px;text-align:right;font-family:ui-monospace,monospace';disp.setAttribute('aria-label','Expression');disp.setAttribute('autocomplete','off');disp.setAttribute('inputmode','none');disp.readOnly=true;disp.placeholder='0';
var out=el('div','v9-note','');out.style.cssText='text-align:right;min-height:22px;font-size:15px';out.setAttribute('aria-live','polite');
body.appendChild(disp);body.appendChild(out);
function preview(){var v=disp.value.trim();if(!v){out.textContent='';return;}try{out.textContent='= '+fmt(evalExpr(v));out.style.color='';}catch(e){out.textContent='';}}
disp.addEventListener('input',preview);
function equals(){try{var r=fmt(evalExpr(disp.value));hist.unshift(disp.value+' = '+r);hist=hist.slice(0,6);disp.value=r;out.textContent='';showHist();}catch(e){out.textContent=e.message;out.style.color='#ff6b6b';}}
disp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();equals();}});
var grid=el('div','');grid.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:10px 0';
var keys=[['C','clr'],['(','('],[')',')'],['⌫','bk'],['÷','÷'],['sin','sin('],['7','7'],['8','8'],['9','9'],['×','×'],['cos','cos('],['4','4'],['5','5'],['6','6'],['−','-'],['tan','tan('],['1','1'],['2','2'],['3','3'],['+','+'],['√','sqrt('],['0','0'],['.','.'],['%','%'],['=','eq'],['x²','^2'],['π','pi'],['e','e'],['^','^'],['ln','ln('],['log','log(']];
keys.forEach(function(k){var b=mkBtn(k[0],k[1]==='eq'?'pri':'',function(){var a=k[1];if(a==='clr'){disp.value='';out.textContent='';}else if(a==='bk'){disp.value=disp.value.slice(0,-1);preview();}else if(a==='eq')equals();else{disp.value+=a;preview();}if(!disp.readOnly)disp.focus();});b.style.cssText='padding:14px 0;font-size:17px;min-width:0';b.setAttribute('aria-label',k[0]);grid.appendChild(b);});
body.appendChild(grid);
var kbBtn=mkBtn('⌨ Phone keyboard: off','',function(){disp.readOnly=!disp.readOnly;disp.setAttribute('inputmode',disp.readOnly?'none':'decimal');kbBtn.textContent='⌨ Phone keyboard: '+(disp.readOnly?'off':'on');if(!disp.readOnly)disp.focus();else disp.blur();});kbBtn.style.marginRight='8px';body.appendChild(kbBtn);
var dg=mkBtn('Angles: degrees','',function(){deg=!deg;dg.textContent='Angles: '+(deg?'degrees':'radians');preview();});body.appendChild(dg);
var hh=el('div','v9-note','');hh.style.marginTop='12px';body.appendChild(hh);
function showHist(){hh.textContent='';hist.forEach(function(h){var d=el('div','',h);d.style.cssText='cursor:pointer;padding:3px 0';d.onclick=function(){disp.value=h.split(' = ').pop();preview();};hh.appendChild(d);});}
body.appendChild(el('div','v9-note','The calculator works offline and nothing you type is sent anywhere, unless you press the AI button below. Tap the buttons, or turn on the phone keyboard above.'));
var aq=el('input','v9-in');aq.placeholder='Or ask in words: e.g. 15% of 240, or a word problem…';aq.maxLength=400;aq.setAttribute('aria-label','Maths question for the AI');aq.style.cssText='width:100%;margin-top:10px';body.appendChild(aq);
body.appendChild(aiBlock('🤖 Solve with AI','calc',function(){var t=(aq.value.trim()||disp.value.trim());if(!t){aq.focus();return 'Type a question above, or an expression in the display.';}return{text:t.slice(0,400)};},{hint:'AI mode: only the text above is sent to an AI model (when you press the button). AI can make arithmetic mistakes, so check the result with the keys above.'}));
var btn=mkBtn('🧮 Calculator','',function(){openPanel('v9Calc');});
var bar=$('v9Bar');if(bar)bar.appendChild(btn);
window.AI_CALC=evalExpr;
}
function initColor(){
var C=[['Green',null,null],['Red','#ff5c5c','#b3261e'],['Orange','#ff9f43','#a65200'],['Yellow','#ffd93d','#8a6d00'],['Blue','#4da3ff','#0b57d0'],['Indigo','#8a8cff','#3f3fbf'],['Violet','#c084fc','#7b2fbf']];
var st=document.createElement('style');st.id='accStyle';document.head.appendChild(st);
var timer=0,idx=0;
function paint(i){var c=C[i];st.textContent=c[1]?'body{--accent:'+c[1]+';--text2:'+c[1]+'}body.light-theme{--accent:'+c[2]+';--text2:'+c[2]+'}':'';}
function stop(){clearInterval(timer);timer=0;}
function set(v){stop();store.set('ai_accent',String(v));
if(v==='auto'){idx=0;paint(0);timer=setInterval(function(){if(document.hidden)return;idx=(idx+1)%C.length;paint(idx);},7000);if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){stop();}}
else paint(parseInt(v,10)||0);mark();}
var body=mkPanel('v9Color','🎨 Accent colour');body.parentNode.id='v9Color';
body.appendChild(el('p','lg-p','Choose the colour used for buttons, borders and highlights. The background does not change.'));
var row=el('div','');row.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin:12px 0';body.appendChild(row);
var btns=[];
function sw(label,bg,val){var b=el('button','v9-btn',label);b.type='button';b.setAttribute('aria-label',label);b.style.cssText='min-width:96px;padding:12px;border:2px solid '+(bg||'var(--accent)')+';';if(bg&&bg!=='rainbow')b.style.background='color-mix(in srgb,'+bg+' 22%,var(--bg2))';if(bg==='rainbow')b.style.background='linear-gradient(90deg,#ff5c5c33,#ffd93d33,#4da3ff33,#c084fc33)';b.onclick=function(){set(val);};b.dataset.v=String(val);row.appendChild(b);btns.push(b);}
C.forEach(function(c,i){sw((i?'':'● ')+c[0],c[1]||'#00ff88',i);});
sw('🌈 Auto','rainbow','auto');
function mark(){var cur=store.get('ai_accent')||'0';btns.forEach(function(b){b.style.outline=b.dataset.v===cur?'3px solid var(--text)':'none';});}
body.appendChild(el('p','v9-note','“Auto” slowly goes through all the colours of the rainbow (it stays still if your device asks for reduced motion). Your choice is remembered if you allowed preferences.'));
body.appendChild(mkBtn('Reset to green','',function(){set(0);}));
body.appendChild(el('p','v9-note','Reset to green does not change the picture below.'));
var bgBox=el('div','v9-card');bgBox.style.cssText='margin:14px 0;padding:12px';body.appendChild(bgBox);
bgBox.appendChild(el('b','','🖼️ Picture background'));bgBox.appendChild(el('p','v9-note','Upload your own picture from this device (it is not sent anywhere), or let an AI make one below.'));
bgBox.appendChild(el('p','v9-note','Describe a picture (for example "calm blue mountains at dawn"). An AI image model on Cloudflare Workers AI makes it, and it is shown softly behind the site. Only your description is sent, and only when you press the button. It is stored on this device if you allow storage. AI pictures can look odd.'));
var bgIn=document.createElement('input');bgIn.type='text';bgIn.maxLength=120;bgIn.placeholder='calm blue mountains at dawn';bgIn.setAttribute('aria-label','Describe the background picture');bgIn.style.cssText='width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid var(--border2);background:var(--bg2);color:var(--text);margin:8px 0 10px';bgBox.appendChild(bgIn);
var POOL=['misty pine forest at sunrise','northern lights over a frozen lake','neon city street in the rain','soft pastel clouds at sunset','deep blue ocean waves','red desert dunes at dusk','galaxy of purple and teal stars','autumn leaves in golden light','snowy mountain peaks at dawn','calm lavender fields','tropical beach with turquoise water','glowing jellyfish in dark water','minimal green gradient waves','cherry blossoms in soft wind','old stone bridge in fog','aurora above a quiet village','abstract geometric shapes in green','waterfall in a mossy jungle','moonlit clouds over the sea','sunflower field under blue sky','paper-cut layered hills','watercolor sky with soft colours','starry desert night','lighthouse on a stormy coast','bamboo forest with morning light','crystal cave with glowing lights','floating islands in the sky','rainy window with city lights','warm sunset over rice terraces','abstract ink flowing in water','low-poly mountain landscape','foggy lake at first light','fireflies in a summer meadow','retro synthwave horizon','glacier with blue ice','quiet library with warm lamps','coral reef full of colour','sakura petals over a river','dark space with a green nebula','hot air balloons at sunrise'];
function pick6(){var a=POOL.slice(),o=[];while(o.length<6&&a.length){o.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);}return o;}
var chipRow=el('div','');chipRow.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px';bgBox.appendChild(chipRow);
function drawChips(list){chipRow.textContent='';list.forEach(function(t){var c=el('button','std-b',t);c.type='button';c.style.cssText='padding:6px 12px;font-size:12px;border-radius:999px;max-width:100%;white-space:normal;text-align:left;border:1px solid var(--accent);background:var(--bg2);color:var(--text);cursor:pointer';c.onclick=function(){bgIn.value=t;};chipRow.appendChild(c);});}
drawChips(pick6());
var bgSt=el('div','v9-note','');bgSt.setAttribute('role','status');bgSt.style.marginTop='8px';
function bgShow(u){var L=document.getElementById('aiBgLayer');if(!u){if(L)L.remove();return;}if(!L){L=document.createElement('div');L.id='aiBgLayer';L.setAttribute('data-ft','aibg');L.setAttribute('aria-hidden','true');document.body.insertBefore(L,document.body.firstChild);}L.style.backgroundImage='url("'+u+'")';}
var btnRow=el('div','');btnRow.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:4px 0';
var mk=mkBtn('✨ Make the picture','',function(){var t=bgIn.value.trim();if(t.length<3){bgSt.textContent='Write at least 3 letters, or press a theme.';return;}mk.disabled=true;bgSt.textContent='Making the picture… this can take some seconds.';
aiAsk('bgimage',{text:t}).then(function(j){if(!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(j.image||''))throw new Error('bad picture');bgShow(j.image);try{store.set('ai_bgimg',j.image);}catch(e){}bgSt.textContent='Done. Made by '+String(j.model||'').replace(/^@cf\//,'')+'.';mk.disabled=false;}).catch(function(e){mk.disabled=false;bgSt.textContent=aiErrText(e);});});
var more=mkBtn('🎲 New AI themes','',function(){more.disabled=true;bgSt.textContent='The AI is thinking of new themes…';
aiAsk('bgideas',{text:'Seed: '+Math.random().toString(36).slice(2,10)}).then(function(j){var l=(j.ideas||[]).filter(function(x){return x&&x.length>=3;});if(!l.length)throw new Error('empty');drawChips(l.slice(0,8));bgSt.textContent='New themes from an AI model ('+aiShort(j.model)+'). Press one, then make the picture.';more.disabled=false;}).catch(function(){drawChips(pick6());bgSt.textContent='The AI could not answer, so here are other ready themes.';more.disabled=false;});});
var rnd=mkBtn('🎲 Surprise me','',function(){var l=[].map.call(chipRow.children,function(c){return c.textContent;});bgIn.value=l[Math.floor(Math.random()*l.length)]||POOL[0];mk.click();});
var rm=mkBtn('Remove picture','',function(){bgShow('');try{store.set('ai_bgimg','');}catch(e){}bgSt.textContent='Removed.';});
var upIn=document.createElement('input');upIn.type='file';upIn.accept='image/*';upIn.style.display='none';upIn.setAttribute('aria-label','Choose your own background picture');
upIn.onchange=function(){var f=upIn.files&&upIn.files[0];upIn.value='';if(!f)return;if(!/^image\//.test(f.type)){bgSt.textContent='Please choose a picture file.';return;}
bgSt.textContent='Preparing your picture…';var u=URL.createObjectURL(f),im=new Image();
im.onload=function(){try{var M=1600,w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,M/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));var g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);var d=c.toDataURL('image/jpeg',0.82);URL.revokeObjectURL(u);
if(!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(d))throw 0;bgShow(d);var saved=true;try{store.set('ai_bgimg',d);if(store.get('ai_bgimg')!==d)saved=false;}catch(e){saved=false;}
bgSt.textContent='Done. Your picture stays on this device only and was not sent anywhere.'+(saved?'':' It could not be saved (storage is off or full), so it will be gone after you close the page.');}catch(e){bgSt.textContent='This picture could not be used. Try another one.';}};
im.onerror=function(){URL.revokeObjectURL(u);bgSt.textContent='This picture could not be read. Try a JPG, PNG or WebP file.';};im.src=u;};
var up=mkBtn('📁 Upload my own picture','pri',function(){upIn.click();});
bgBox.appendChild(upIn);
[up,mk,rnd,more,rm].forEach(function(x){x.style.margin='0';btnRow.appendChild(x);});bgBox.appendChild(btnRow);bgBox.appendChild(bgSt);
try{var sv=store.get('ai_bgimg');if(sv&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(sv))bgShow(sv);}catch(e){}
var hb=document.querySelector('.hdr-tools');var cb=el('button','hdr-chip','🎨 Colour');cb.id='colorBtn';cb.type='button';cb.setAttribute('aria-label','Accent colour');cb.onclick=function(){mark();openPanel('v9Color');};
if(hb)hb.appendChild(cb);
var v=store.get('ai_accent');if(v)set(v);else mark();
}

/* ===================== v47: age check for the whole site ===================== */
function initAge(){
function save(g){window.AI_AGE=g;try{if(CONS)localStorage.setItem('ai_age',JSON.stringify({g:g,t:new Date().toISOString()}));}catch(e){}}
function apply(){document.body.classList.toggle('age-lite',ageG()==='13-15');if(ageG()==='u13')window.AI_SHOWBLOCK();}
var body=mkPanel('v9Age','🛡️ Content filter');body.parentNode.id='v9Age';
function build(){
body.textContent='';
body.appendChild(el('p','lg-p','Content filter. The site does not ask for your age.'));
var fcb=document.createElement('input');fcb.type='checkbox';fcb.checked=kidsOn();fcb.id='ageFilterCb';
var fl=el('label','lg-p','');fl.style.cssText='display:block;margin:14px 0';fl.appendChild(fcb);fl.appendChild(document.createTextNode(' Content filter: hide adult, violent, drug and gambling content (recommended)'));
var fn=el('span','v9-note','');fn.style.display='block';fn.textContent='It is on by default. The site cannot check anyone\'s age, so you decide here. If a child uses this device, keep it on.';fl.appendChild(fn);
fcb.onchange=function(){store.set('ai_kids',fcb.checked?'1':'0');if(window.AI_FEED_REFRESH)window.AI_FEED_REFRESH();};
body.appendChild(fl);
if(false){var t=el('label','lg-p','');var cb=document.createElement('input');cb.type='checkbox';cb.checked=kidsOn();cb.onchange=function(){store.set('ai_kids',cb.checked?'1':'0');if(window.AI_FEED_REFRESH)window.AI_FEED_REFRESH();};t.appendChild(cb);t.appendChild(document.createTextNode(' Hide adult, violent, drug and gambling content (recommended)'));t.style.display='block';t.style.margin='14px 0';body.appendChild(t);}
body.appendChild(el('p','v9-note','No filter is perfect: Wikimedia Commons and the Internet Archive do not filter adult material themselves, so this site filters it by category and by words.'));
}
var hb=document.querySelector('.hdr-tools');var ab=el('button','hdr-chip','🛡️ Filter');ab.id='ageBtn';ab.type='button';ab.setAttribute('aria-label','Content filter');ab.onclick=function(){build();openPanel('v9Age');};
if(hb)hb.appendChild(ab);else document.querySelector('.header').appendChild(ab);
apply();
window.AI_ASKAGE=function(){};
}

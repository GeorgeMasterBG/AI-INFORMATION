/* AI INFORMATION - scamlab.js
   Scam Lab: URL scanner, text analyzer, fake image/video checker, multi-source scan, DNS checks.
   Only function declarations: they are called later by app.js (loaded last). */

function lev(a,b){var m=a.length,n=b.length,i,j,d=[];for(i=0;i<=m;i++){d[i]=[i];}for(j=1;j<=n;j++)d[0][j]=j;
for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));return d[m][n];}
function leet(t){return t.replace(/0/g,'o').replace(/1/g,'l').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/rn/g,'m').replace(/vv/g,'w');}
function regDomain(host){var p=host.split('.');if(p.length<=2)return host;var sld=p[p.length-2],tld=p[p.length-1];
if(tld.length===2&&['co','com','org','net','gov','ac','edu','or','ne'].indexOf(sld)!==-1)return p.slice(-3).join('.');return p.slice(-2).join('.');}
function officialBrand(host){for(var b in BRANDS){var list=BRANDS[b];for(var i=0;i<list.length;i++){if(host===list[i]||host.slice(-(list[i].length+1))==='.'+list[i])return b;}}return null;}
function analyzeUrl(raw){
var items=[],score=0;
function add(sev,pts,title,detail){items.push({sev:sev,title:title,detail:detail});score+=pts;}
var input=String(raw||'').trim().replace(/^[<"'(\[]+|[>"')\]]+$/g,'').replace(/^hxxp/i,'http').replace(/\[\.\]|\(\.\)/g,'.');
if(!input)return null;
var note='Based on the text of the link only. This tool never visits the site. For live reputation use the Google or VirusTotal checks below. No warning signs does not mean a link is safe.';
if(/\s/.test(input))return{level:'unknown',headline:'That does not look like a single link',score:null,items:[{sev:'info',title:'The text contains spaces',detail:'Paste one link only. For a whole message use the Text Analyzer.'}],links:[],note:''};
var hadScheme=/^(https?|ftp|file):\/\//i.test(input)||/^(javascript|data|vbscript|blob|mailto|tel):/i.test(input);
var u;
try{u=new URL(hadScheme?input:'https://'+input);}catch(e){return{level:'unknown',headline:'This is not a valid link',score:null,items:[{sev:'info',title:'Could not read the address',detail:'Check it for typos, or paste the full link including https://'}],links:[],note:''};}
if(/^(javascript|data|vbscript):$/.test(u.protocol))return{level:'high',headline:'⛔ Dangerous: this link runs code instead of opening a site',score:100,items:[{sev:'high',title:'Scheme "'+u.protocol+'"',detail:'Links like this can run script in your browser. Do not open it.'}],links:[],note:note,ai:{kind:'url',href:u.protocol+'(code hidden)',signals:['dangerous scheme']}};
if(u.protocol!=='http:'&&u.protocol!=='https:')return{level:'info',headline:'Not a web link ('+u.protocol+')',score:null,items:[{sev:'info',title:'Unusual link type',detail:'This tool checks web links (http and https) only.'}],links:[],note:''};
var hostRaw=input.replace(/^[a-z][a-z0-9+.-]*:\/\//i,'').split(/[\/?#]/)[0];
var host=u.hostname.toLowerCase(),labels=host.split('.'),tld=labels[labels.length-1];
var official=officialBrand(host);
if(u.protocol==='http:')add('med',15,'No HTTPS','The connection is not encrypted. Never enter passwords or card details here.');
if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host)||host.charAt(0)==='[')add('high',30,'The address is a raw IP number','Real services use domain names. An IP link hides who runs the site.');
if(u.username||u.password||hostRaw.indexOf('@')!==-1)add('high',35,'Contains "@" before the host','The browser ignores everything before "@". Scammers put a trusted name there to fake it.');
if(/[^\x00-\x7F]/.test(hostRaw)||host.indexOf('xn--')!==-1)add('high',30,'Lookalike (international) characters in the domain','Stored as "'+host+'". Letters from other alphabets can imitate Latin ones, for example Cyrillic "а" for "a".');
if(SHORTENERS.indexOf(host)!==-1)add('med',15,'Link shortener','The real destination is hidden until you open it.');
if(SUSPICIOUS_TLDS.indexOf(tld)!==-1)add('low',10,'Domain ending ".'+tld+'"','This ending is cheap and often abused by scammers. Many legitimate sites use others, so it is a weak hint.');
if(labels.length>=5)add('low',10,'Many subdomains ('+labels.length+' parts)',host);
if(host.length>40)add('low',8,'Very long domain name',host.length+' characters.');
if((host.replace(/xn--/g,'').match(/-/g)||[]).length>=3)add('low',8,'Many hyphens in the domain',host);
if((host.match(/\d/g)||[]).length>=5)add('low',6,'Many digits in the domain',host);
if(u.port&&u.port!=='80'&&u.port!=='443')add('med',10,'Unusual port :'+u.port,'Normal sites use the default web ports.');
var ext=(u.pathname.match(/\.([a-z0-9]{2,4})$/i)||[])[1];
if(ext&&RISKY_EXT.indexOf(ext.toLowerCase())!==-1)add('high',25,'Link points to a program file (.'+ext.toLowerCase()+')','Downloading and running it can install malware.');
if(/[?&](url|redirect|redirect_uri|next|goto|target|dest|continue|return)=(https?:|https?%3a)/i.test(u.search))add('med',15,'Redirect inside the link','The site sends you on to another address that is written in the link.');
if((u.href.match(/%[0-9a-f]{2}/gi)||[]).length>=6)add('low',5,'Lots of encoded characters','Hard-to-read links are sometimes used to hide the real address.');
if(input.length>120)add('low',5,'Very long link',input.length+' characters.');
if(!official){
var words=HOST_WORDS.filter(function(w){return host.indexOf(w)!==-1;});
if(words.length)add('low',Math.min(12,6*words.length),'Sensitive words in the domain: '+words.join(', '),'Fake sites often include words like these to look official.');
var cands=labels.slice(0,-1).reduce(function(a,l){a.push(l);a.push(l.replace(/-/g,''));l.split('-').forEach(function(p){a.push(p);});return a;},[]);
var hit=null;
outer:for(var b in BRANDS){
var re1=new RegExp('^'+b+'(secure|login|verify|support|help|account|service|update|billing|id|pay|wallet|online|app|team|center|care|\\d+)$');
var re2=new RegExp('^(secure|login|my|verify|support|account|service|update)'+b+'$');
for(var i=0;i<cands.length;i++){
var c=cands[i],cn=leet(c);
if(c===b||cn===b||re1.test(cn)||re2.test(cn)){hit={brand:b,kind:'uses'};break outer;}
if(b.length>=5&&c!==b&&Math.abs(c.length-b.length)<=2&&lev(cn,b)<=(b.length>=8?2:1)){hit={brand:b,kind:'misspells'};break outer;}
}
}
if(hit){
var rd=regDomain(host).split('.'),sld=rd[rd.length-2];
if(hit.kind==='uses'&&sld===hit.brand&&tld.length===2)add('low',10,'Uses the name "'+hit.brand+'" on a country domain','Big brands do own some country domains, but fakes do too. Check the address carefully.');
else add('high',35,hit.kind==='uses'?'Contains "'+hit.brand+'" but is not '+BRANDS[hit.brand][0]:'Looks like a misspelling of "'+hit.brand+'"','Official domains for this brand: '+BRANDS[hit.brand].join(', ')+'. This one is "'+regDomain(host)+'".');
}
}else if(u.protocol==='https:'){
items.push({sev:'ok',title:'The domain belongs to '+official,detail:'It is on this tool\'s list of official domains. That says nothing about the specific page, so still check what it asks for.'});
}
var level=score>=45?'high':score>=20?'medium':'low';
var headline=score>=45?'⛔ High risk: this link looks like a scam':score>=20?'⚠️ Suspicious link':score>0?'🟡 A few weak warning signs':'✅ No warning signs in the link itself';
var signals=items.filter(function(x){return x.sev!=='ok';}).map(function(x){return x.title;});
return{level:level,headline:headline,score:Math.min(100,score),items:items,note:note,
links:[{label:'Google Safe Browsing report',url:'https://transparencyreport.google.com/safe-browsing/search?url='+encodeURIComponent(u.href)},{label:'VirusTotal',url:'https://www.virustotal.com/gui/home/url'},{label:'urlscan.io',url:'https://urlscan.io/'}],
ai:{kind:'url',href:u.href,signals:signals}};
}
function isWordChar(ch){return /[\p{L}\p{N}]/u.test(ch);}
function findAll(lower,phrase,max){
var star=phrase.charAt(phrase.length-1)==='*',p=star?phrase.slice(0,-1):phrase,res=[],pos=0;
while(res.length<max){
var i=lower.indexOf(p,pos);if(i===-1)break;
var before=i>0?lower.charAt(i-1):' ',after=lower.charAt(i+p.length)||' ';
var okL=!isWordChar(before)||!isWordChar(p.charAt(0)),okR=star||!isWordChar(after)||!isWordChar(p.charAt(p.length-1));
if(okL&&okR)res.push({i:i,len:p.length});
pos=i+p.length;
}
return res;
}
function excerpt(text,hit){var a=Math.max(0,hit.i-35),b=Math.min(text.length,hit.i+hit.len+35);return(a>0?'…':'')+text.slice(a,b).replace(/\s+/g,' ')+(b<text.length?'…':'');}
function analyzeText(raw){
var text=String(raw||'').trim();
if(text.length<15)return null;
var lower=text.toLowerCase(),items=[],score=0,cats={};
TXT_RULES.forEach(function(r){
var hits=[];
r.p.forEach(function(ph){findAll(lower,ph,3).forEach(function(h){hits.push(h);});});
if(!hits.length)return;
hits.sort(function(a,b){return a.i-b.i;});
cats[r.id]=true;score+=r.w;
var seen={},ex=[];
hits.forEach(function(h){var key=Math.floor(h.i/40);if(!seen[key]&&ex.length<2){seen[key]=1;ex.push('"'+excerpt(text,h)+'"');}});
items.push({sev:r.w>=18?'high':r.w>=10?'med':'low',title:r.label,detail:r.why+' Found: '+ex.join('  ')});
});
if((cats.credentials||cats.payment)&&(cats.urgency||cats.threat)){score+=15;items.push({sev:'high',title:'Urgency combined with a request for secrets or money',detail:'This pairing is the strongest single phishing pattern.'});}
var catCount=Object.keys(cats).length;
if(catCount>=4){score+=10;items.push({sev:'med',title:catCount+' different scam patterns in one message',detail:'Genuine messages rarely hit this many at once.'});}
var urls=[],seenU={};
(text.match(/(?:https?:\/\/|www\.)[^\s<>"'()]+/gi)||[]).concat(text.match(/\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|t\.ly)\/\S+/gi)||[]).forEach(function(u){u=u.replace(/[.,;:!?]+$/,'');if(!seenU[u]&&urls.length<5){seenU[u]=1;urls.push(u);}});
var linkScore=0;
urls.forEach(function(u){
var r=analyzeUrl(u);if(!r||r.score==null)return;
var top=r.items.filter(function(x){return x.sev!=='ok';}).slice(0,2).map(function(x){return x.title;}).join('; ');
if(r.level==='high'){linkScore=Math.max(linkScore,30);items.push({sev:'high',title:'Risky link: '+u.slice(0,70),detail:top||'Several warning signs.'});}
else if(r.level==='medium'){linkScore=Math.max(linkScore,12);items.push({sev:'med',title:'Suspicious link: '+u.slice(0,70),detail:top});}
else items.push({sev:'info',title:'Link found: '+u.slice(0,70),detail:r.score>0?top:'No warning signs in the link text itself.'});
});
score+=linkScore;
var letters=text.replace(/[^\p{L}]/gu,'');
if(letters.length>=40){var up=0;for(var k=0;k<letters.length;k++){var ch=letters.charAt(k);if(ch===ch.toUpperCase()&&ch!==ch.toLowerCase())up++;}
if(up/letters.length>0.35){score+=8;items.push({sev:'low',title:'Lots of CAPITAL LETTERS',detail:Math.round(up/letters.length*100)+'% of the letters. Shouting is a pressure tactic.'});}}
if((text.match(/!/g)||[]).length>=3){score+=5;items.push({sev:'low',title:'Many exclamation marks',detail:'Hype and urgency are typical of scam messages.'});}
score=Math.min(100,score);
var level=score>=50?'high':score>=25?'medium':'low';
var headline=score>=50?'⛔ Likely a scam or phishing message':score>=25?'⚠️ Suspicious message':score>0?'🟡 A few weak warning signs':'✅ No known scam patterns found';
if(!items.length)items.push({sev:'info',title:'Nothing matched',detail:'The check looks for common scam wording in English and Bulgarian. A new or unusual scam can slip through.'});
return{level:level,headline:headline,score:score,items:items,links:[],
note:'Pattern matching on common scam wording (English and Bulgarian). No warning signs does not prove a message is safe. If it claims to be from your bank or a company, contact them through their official app or phone number, not through the message.',
ai:{kind:'text',text:text,signals:items.filter(function(x){return x.sev!=='info';}).map(function(x){return x.title;})}};
}
function openScam(tool){
hideKeyboard();scamMode=tool==='text'?'text':'url';
document.getElementById('scamLabOutput').style.display='block';
document.getElementById('scamOutputTitle').textContent=scamMode==='url'?'URL Scanner (AI)':'Text Analyzer (AI)';
document.getElementById('scamInput').style.display=scamMode==='url'?'block':'none';document.getElementById('scamUrlNote').style.display=scamMode==='url'?'block':'none';
var ta=document.getElementById('scamText');
ta.style.display=scamMode!=='url'?'block':'none';
ta.maxLength=8000;
ta.placeholder='Paste the message here (email, SMS, chat)…';
ta.rows=6;
document.getElementById('scamResult').textContent='';
var _o=document.getElementById('scamLabOutput');setTimeout(function(){try{_o.scrollIntoView({behavior:'smooth',block:'center'});var f=scamMode==='url'?document.getElementById('scamInput'):ta;if(f)f.focus({preventScroll:true});}catch(e){}},60);
}
function closeScam(){hideKeyboard();document.getElementById('scamLabOutput').style.display='none';}


function runScam(){
hideKeyboard();
var res=document.getElementById('scamResult'),inp,mode=scamMode;
if(mode==='url'){inp=document.getElementById('scamInput').value.trim();if(!inp){res.textContent='Paste a link first.';return;}}
else{inp=document.getElementById('scamText').value.trim();if(inp.length<15){res.textContent='Paste the whole message (at least a sentence).';return;}}
res.textContent='';
res.appendChild(aiRisk(mode,function(){return{text:mode==='url'?'Address: '+inp.slice(0,500):inp.slice(0,5000)};}));
try{res.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){}
if(mode==='url'){res.appendChild(el('div','v9-note','⚠️ Not every website can be checked: some use anti-bot protection and block automatic checks. When a check cannot run, the result says so. “Nothing found” never proves a site is safe.'));serverUrlCheck(inp,res);dnsCheck(inp,res);}
}
function lat(b,s,e){return _dec.decode(b.subarray(s,e));}
function sniffFmt(b){
if(b[0]===0xFF&&b[1]===0xD8)return'jpeg';
if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47)return'png';
if(lat(b,0,4)==='RIFF'&&lat(b,8,12)==='WEBP')return'webp';
if(lat(b,0,3)==='GIF')return'gif';
if(lat(b,4,8)==='ftyp')return'mp4';
if(b[0]===0x1A&&b[1]===0x45&&b[2]===0xDF&&b[3]===0xA3)return'webm';
return'unknown';
}
function parseTiff(b,off){
var out={};
try{
var le=b[off]===0x49&&b[off+1]===0x49;if(!le&&!(b[off]===0x4D&&b[off+1]===0x4D))return null;
var dv=new DataView(b.buffer,b.byteOffset,b.byteLength);
var u16=function(o){return dv.getUint16(o,le);},u32=function(o){return dv.getUint32(o,le);};
if(u16(off+2)!==42)return null;
var sizes={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8,11:4,12:8};
var val=function(e,tag){
var t=u16(e+2),c=u32(e+4),sz=(sizes[t]||1)*c,o=sz>4?off+u32(e+8):e+8;
if(t===2){var str='';for(var k=0;k<Math.min(c,256);k++){var ch=b[o+k];if(!ch)break;str+=String.fromCharCode(ch);}return str.trim();}
if(t===3)return u16(o);if(t===4)return u32(o);
if(t===5){var d=u32(o+4);return d?u32(o)/d:0;}
if(t===10){var sd=dv.getInt32(o+4,le);return sd?dv.getInt32(o,le)/sd:0;}
if(t===11)return dv.getFloat32(o,le);
if(t===12)return dv.getFloat64(o,le);
if(t===7&&tag===0x9286)return lat(b,o+8,o+Math.min(c,2048)).replace(/\0/g,'').trim();
return null;
};
var ifd=function(o,depth){
var n=Math.min(u16(o),300);
for(var i=0;i<n;i++){
var e=o+2+i*12,tag=u16(e);
if(tag===0x8769){if(depth<2)ifd(off+u32(e+8),depth+1);continue;}
if(tag===0x8825){out.gps=true;continue;}
var v=val(e,tag);
switch(tag){case 0x010F:out.make=v;break;case 0x0110:out.model=v;break;case 0x0131:out.software=v;break;case 0x0132:out.date=v;break;case 0x9003:out.dateOriginal=v;break;case 0x829A:out.exposure=v;break;case 0x829D:out.fnumber=v;break;case 0x8827:out.iso=v;break;case 0xA434:out.lens=v;break;case 0x010E:out.description=v;break;case 0x013B:out.artist=v;break;case 0x9286:out.userComment=v;break;}
}
};
ifd(off+u32(off+4),0);
}catch(e){}
return out;
}
function scanJpeg(b){
var out={exif:null,xmp:'',c2pa:false,comments:[],app11:''},i=2,guard=0;
while(i+4<b.length&&guard++<400){
if(b[i]!==0xFF){i++;continue;}
var m=b[i+1];
if(m===0xD8||m===0x01||(m>=0xD0&&m<=0xD7)){i+=2;continue;}
if(m===0xD9||m===0xDA)break;
var len=(b[i+2]<<8)|b[i+3],s=i+4,e=Math.min(b.length,i+2+len);
if(m===0xE1){
if(lat(b,s,s+6)==='Exif\0\0'){if(!out.exif)out.exif=parseTiff(b,s+6);}
else if(lat(b,s,s+28).indexOf('http://ns.adobe.com/xap/1.0/')===0){out.xmp+=lat(b,s+29,Math.min(e,s+29+262144));}
}else if(m===0xEB){var t=lat(b,s,Math.min(e,s+4096));out.app11+=t;if(t.indexOf('c2pa')!==-1||t.indexOf('jumb')!==-1)out.c2pa=true;}
else if(m===0xFE){out.comments.push(lat(b,s,Math.min(e,s+2000)));}
i=e;
}
return out;
}
async function inflateBytes(u8){
try{if(typeof DecompressionStream==='undefined')return'';var st=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate'));return await new Response(st).text();}catch(e){return'';}
}
async function scanPng(b){
var dv=new DataView(b.buffer,b.byteOffset,b.byteLength),out={text:{},exif:null,c2pa:false,xmp:''},i=8,guard=0;
while(i+12<=b.length&&guard++<600){
var len=dv.getUint32(i),type=lat(b,i+4,i+8),d=i+8,end=Math.min(b.length,d+len);
if(type==='tEXt'){var z=d;while(z<end&&b[z]!==0)z++;out.text[lat(b,d,z)]=lat(b,z+1,end).slice(0,30000);}
else if(type==='zTXt'){var z2=d;while(z2<end&&b[z2]!==0)z2++;out.text[lat(b,d,z2)]=(await inflateBytes(b.subarray(z2+2,end))).slice(0,30000);}
else if(type==='iTXt'){
var z3=d;while(z3<end&&b[z3]!==0)z3++;var key=lat(b,d,z3),comp=b[z3+1],p=z3+3;
while(p<end&&b[p]!==0)p++;p++;while(p<end&&b[p]!==0)p++;p++;
var body=b.subarray(p,end),txt=comp?await inflateBytes(body):new TextDecoder('utf-8').decode(body);
if(key==='XML:com.adobe.xmp')out.xmp+=txt.slice(0,262144);else out.text[key]=txt.slice(0,30000);
}
else if(type==='eXIf'){out.exif=parseTiff(b,d);}
else if(type==='caBX'){out.c2pa=true;}
else if(type==='IEND')break;
i=d+len+4;
}
return out;
}
function scanWebp(b){
var out={exif:null,xmp:''},i=12,guard=0;
while(i+8<=b.length&&guard++<200){
var type=lat(b,i,i+4),len=(b[i+4]|(b[i+5]<<8)|(b[i+6]<<16)|(b[i+7]<<24))>>>0,d=i+8;
if(type==='EXIF'){out.exif=parseTiff(b,lat(b,d,d+4)==='Exif'?d+6:d);}
else if(type==='XMP '){out.xmp=lat(b,d,Math.min(d+len,d+262144));}
i=d+len+(len&1);
}
return out;
}
function findSigs(text){
var found=[],composite=false;
AI_SIGS.forEach(function(sg,idx){
if(idx===1&&composite)return;
if(sg.re.test(text)){found.push(sg.label);if(idx===0)composite=true;}
});
return found;
}
async function runEla(file){
var bmp=await createImageBitmap(file),W=bmp.width,H=bmp.height,sx=0,sy=0,cw=W,ch=H,cropped=false;
if(W*H>8e6){cw=Math.min(W,2048);ch=Math.min(H,2048);sx=Math.floor((W-cw)/2/16)*16;sy=Math.floor((H-ch)/2/16)*16;cropped=true;}
var c1=document.createElement('canvas');c1.width=cw;c1.height=ch;
var x1=c1.getContext('2d',{willReadFrequently:true});x1.drawImage(bmp,sx,sy,cw,ch,0,0,cw,ch);
var blob=await new Promise(function(r){c1.toBlob(r,'image/jpeg',0.9);});
if(!blob)throw new Error('encode failed');
var bmp2=await createImageBitmap(blob);
var c2=document.createElement('canvas');c2.width=cw;c2.height=ch;
var x2=c2.getContext('2d',{willReadFrequently:true});x2.drawImage(bmp2,0,0);
var a=x1.getImageData(0,0,cw,ch),A=a.data,B=x2.getImageData(0,0,cw,ch).data;
var gx=16,gy=16,cells=new Float64Array(gx*gy),cnt=new Uint32Array(gx*gy),sum=0;
for(var y=0;y<ch;y++){
var cy=Math.min(gy-1,Math.floor(y*gy/ch));
for(var x=0;x<cw;x++){
var p=(y*cw+x)*4,d=(Math.abs(A[p]-B[p])+Math.abs(A[p+1]-B[p+1])+Math.abs(A[p+2]-B[p+2]))/3;
sum+=d;var ci=cy*gx+Math.min(gx-1,Math.floor(x*gx/cw));cells[ci]+=d;cnt[ci]++;
var v=Math.min(255,d*20);A[p]=v;A[p+1]=v;A[p+2]=v;A[p+3]=255;
}
}
x1.putImageData(a,0,0);
var means=[];for(var k=0;k<cells.length;k++)if(cnt[k])means.push(cells[k]/cnt[k]);
var sorted=means.slice().sort(function(m,n){return m-n;}),median=sorted[Math.floor(sorted.length/2)]||0,flagged=0;
means.forEach(function(m){if(m>4&&m>median*3.5)flagged++;});
return{canvas:c1,mean:sum/(cw*ch),median:median,flagged:flagged,total:means.length,cropped:cropped,cw:cw,ch:ch};
}
async function analyzeMedia(file){
var isVideo=file.type.indexOf('video')===0,size=file.size,items=[],nodes=[];
var big=size>40*1048576;
var head=new Uint8Array(await file.slice(0,isVideo?4*1048576:Math.min(size,40*1048576)).arrayBuffer());
var tail=null;if(isVideo&&size>head.length)tail=new Uint8Array(await file.slice(Math.max(head.length,size-1048576)).arrayBuffer());
var fmt=sniffFmt(head);
items.push({sev:'info',title:(fmt==='unknown'?'Unknown format':fmt.toUpperCase())+' · '+fmtBytes(size),detail:file.name?String(file.name).slice(0,80):''});
var exif=null,xmp='',c2pa=false,texts=[],pngText={};
if(fmt==='jpeg'){var j=scanJpeg(head);exif=j.exif;xmp=j.xmp;c2pa=j.c2pa;texts=j.comments.concat([j.app11]);}
else if(fmt==='png'){var pn=await scanPng(head);exif=pn.exif;xmp=pn.xmp;c2pa=pn.c2pa;pngText=pn.text;for(var key in pn.text)texts.push(key+': '+pn.text[key]);}
else if(fmt==='webp'){var w=scanWebp(head);exif=w.exif;xmp=w.xmp;}
var rawText=lat(head,0,Math.min(head.length,524288))+(tail?lat(tail,0,tail.length):lat(head,Math.max(0,head.length-65536),head.length));
var rawLower=rawText.toLowerCase();
if(rawLower.indexOf('c2pa')!==-1)c2pa=true;
var metaText=[xmp,texts.join('\n'),exif?[exif.software,exif.userComment,exif.description,exif.artist].join(' '):''].join('\n');
var sigs=findSigs(metaText+'\n'+rawText);
var strongExtra=[];
if(pngText.parameters&&/steps:\s*\d+/i.test(pngText.parameters)&&/sampler|cfg scale|seed/i.test(pngText.parameters))strongExtra.push('Contains Stable Diffusion generation parameters (prompt, steps, sampler)');
if((pngText.prompt&&/class_type/.test(pngText.prompt))||pngText.workflow)strongExtra.push('Contains a ComfyUI workflow');
if(pngText.Comment&&/"sampler"/.test(pngText.Comment)&&/"steps"/.test(pngText.Comment))strongExtra.push('Contains image-generator settings (steps, sampler)');
var strong=sigs.concat(strongExtra);
strong.forEach(function(t){items.push({sev:'high',title:t,detail:'Written into the file by the tool that made it, so this is strong evidence the file came from AI. It is not proof of intent, and a file can be re-saved without it.'});});
var camera=!!(exif&&exif.make&&(exif.model||exif.exposure!==undefined));
var xmpTool=(xmp.match(/CreatorTool(?:>|=")([^<"]{2,80})/)||[])[1];
var software=(exif&&exif.software)||xmpTool||'';
if(camera){
var bits=[(exif.make+' '+(exif.model||'')).trim()];
if(exif.exposure)bits.push(exif.exposure<1?'1/'+Math.round(1/exif.exposure)+' s':exif.exposure+' s');
if(exif.fnumber)bits.push('f/'+exif.fnumber.toFixed(1));if(exif.iso)bits.push('ISO '+exif.iso);if(exif.lens)bits.push(exif.lens);
items.push({sev:'ok',title:'Camera data: '+bits.join(' · '),detail:'Typical of a photo from a real camera or phone. Metadata can be copied or forged, so this is a hint, not proof.'});
}
if(software&&!strong.length)items.push({sev:EDITORS.test(software)?'med':'info',title:(EDITORS.test(software)?'Edited or exported with: ':'Software: ')+software.slice(0,80),detail:EDITORS.test(software)?'The picture passed through an editor, so it may differ from what the camera recorded.':'Recorded by the program that saved the file.'});
if(exif&&(exif.dateOriginal||exif.date))items.push({sev:'info',title:'Date in metadata: '+(exif.dateOriginal||exif.date),detail:'Written by the device or program. It can be edited.'});
if(exif&&exif.gps)items.push({sev:'info',title:'Contains a GPS location',detail:'If you share this file, the place it was taken can be read from it.'});
if(c2pa)items.push({sev:'info',title:'Content Credentials (C2PA) found',detail:'Signed provenance data is embedded. This tool does not verify the signature; check it at contentcredentials.org/verify.'});
var hasMeta=!!(exif&&(exif.make||exif.software||exif.dateOriginal))||xmp.length>0||Object.keys(pngText).length>0||c2pa;
if(!hasMeta&&!strong.length)items.push({sev:'info',title:'No provenance metadata',detail:'Messengers, social networks and screenshots strip metadata, and so do many AI workflows. Its absence proves nothing either way.'});
var mismatch=fmt!=='unknown'&&file.type&&file.type.indexOf(fmt==='jpeg'?'jpeg':fmt)===-1&&!isVideo;
if(mismatch)items.push({sev:'low',title:'File type does not match its content',detail:'Declared '+file.type+', but the data is '+fmt.toUpperCase()+'.'});
if(!isVideo){
try{
var bm=await createImageBitmap(file),dim=bm.width+'x'+bm.height;
items.push({sev:'info',title:'Size: '+bm.width+' × '+bm.height+' px',detail:''});
if(!camera&&AI_DIMS[dim]&&bm.width%64===0&&bm.height%64===0)items.push({sev:'low',title:'Size is a common AI-generator output',detail:'Many generators output exactly '+bm.width+' × '+bm.height+', but plenty of ordinary images share it. A weak hint at most.'});
}catch(e){}
if(fmt==='jpeg'&&!big){
try{
var ela=await runEla(file);
var cap=el('div','ela-cap','Error Level Analysis map'+(ela.cropped?' (centre '+ela.cw+' × '+ela.ch+' px at full resolution)':'')+'. Even grey means the whole picture was compressed the same way. Bright patches that do not follow object edges can mean a region was edited or pasted in.');
var holder=el('div','');holder.id='fakeEla';holder.appendChild(ela.canvas);holder.appendChild(cap);nodes.push(holder);
if(ela.flagged>0&&ela.flagged<=ela.total*0.1)items.push({sev:'low',title:'ELA: '+ela.flagged+' of '+ela.total+' zones compress differently from the rest',detail:'A few isolated zones. This can mean part of the picture was edited, but sharp edges and text trigger it too. Look at the map.'});
else if(ela.flagged>ela.total*0.1)items.push({sev:'info',title:'ELA: uneven across much of the image',detail:'Detailed textures, noise and sharp edges cause this. It does not point to one specific edit.'});
else items.push({sev:'info',title:'ELA: compression level looks uniform',detail:'No obvious local edit found. This does not rule out AI generation or edits to the whole picture.'});
}catch(e){items.push({sev:'info',title:'ELA could not run on this file',detail:''});}
}else if(fmt==='jpeg'&&big)items.push({sev:'info',title:'File too large for in-browser ELA',detail:'Only the first 40 MB were read for metadata.'});
else if(fmt!=='jpeg')items.push({sev:'info',title:'ELA skipped',detail:'It works on JPEG files. PNG and other lossless formats carry no compression history.'});
}else{
try{await analyzeVideo(file,items,nodes);}
catch(e){items.push({sev:'info',title:'Frames could not be read in this browser',detail:'Only metadata and markers were checked. The browser may not support this video codec.'});}
}
if(!big&&window.crypto&&crypto.subtle&&size<=40*1048576){
try{var buf=await file.arrayBuffer(),h=await crypto.subtle.digest('SHA-256',buf),hex=Array.prototype.map.call(new Uint8Array(h),function(x){return('0'+x.toString(16)).slice(-2);}).join('');
items.push({sev:'info',title:'SHA-256 fingerprint',detail:hex});}catch(e){}
}
var level,headline;
if(strong.length){level='high';headline='🤖 The file says it was made with AI';}
else if(c2pa){level='info';headline='🔏 Signed Content Credentials found';}
else if(camera){level='low';headline='📷 Camera data present (consistent with a real photo)';}
else if(software&&EDITORS.test(software)){level='medium';headline='🛠️ Edited with '+software.slice(0,40);}
else{level='unknown';headline='❔ Inconclusive: nothing in the file settles it';}
return{level:level,headline:headline,score:null,items:items,nodes:nodes,
links:[{label:'Google Lens',url:'https://lens.google.com/'},{label:'TinEye',url:'https://tineye.com/'},{label:'Bing Visual Search',url:'https://www.bing.com/visualsearch'},{label:'Yandex Images',url:'https://yandex.com/images/'},{label:'Verify Content Credentials',url:'https://contentcredentials.org/verify'}],
note:'This reads what the file says about itself and runs forensic checks. It cannot prove that a picture is real or fake, and no in-browser tool can. Upload the file to a reverse-search site above to find where it first appeared.',
ai:isVideo?null:{kind:'image',file:file}};
}
function seekTo(v,t){return new Promise(function(res,rej){
var done=false,to=setTimeout(function(){if(!done){done=true;rej(new Error('seek timeout'));}},6000);
v.onseeked=function(){if(!done){done=true;clearTimeout(to);res();}};
v.currentTime=t;});}
function frameStats(ctx,w,h,prev){
var d=ctx.getImageData(0,0,w,h).data,n=w*h,g=new Float32Array(n),i,x,y;
for(i=0;i<n;i++)g[i]=0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2];
var noise=0,l1=0,l2=0,cnt=0,diff=null;
for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){
var c=g[y*w+x],dev=c-(g[y*w+x-1]+g[y*w+x+1]+g[(y-1)*w+x]+g[(y+1)*w+x])/4;
noise+=Math.abs(dev);l1+=dev*4;l2+=dev*dev*16;cnt++;
}
if(prev){var s=0;for(i=0;i<n;i++)s+=Math.abs(g[i]-prev[i]);diff=s/n;}
return{gray:g,noise:noise/cnt,sharp:l2/cnt-(l1/cnt)*(l1/cnt),diff:diff};
}
async function analyzeVideo(file,items,nodes){
var url=URL.createObjectURL(file),v=document.createElement('video');
v.muted=true;v.preload='auto';v.playsInline=true;v.src=url;
try{
await new Promise(function(res,rej){var t=setTimeout(function(){rej(new Error('meta'));},8000);
v.onloadedmetadata=function(){clearTimeout(t);res();};v.onerror=function(){clearTimeout(t);rej(new Error('decode'));};});
var dur=v.duration;if(!isFinite(dur)||dur<=0.3||!v.videoWidth)throw new Error('dur');
items.push({sev:'info',title:'Video: '+v.videoWidth+' × '+v.videoHeight+' px · '+dur.toFixed(1)+' s',detail:''});
var W=Math.min(320,v.videoWidth),H=Math.max(2,Math.round(W*v.videoHeight/v.videoWidth));
var c=document.createElement('canvas');c.width=W;c.height=H;var ctx=c.getContext('2d',{willReadFrequently:true});
var STEP=1/12,N=dur<3?3:6,anchors=[],k,j;
for(k=0;k<N;k++)anchors.push(Math.max(0,Math.min(dur-3*STEP,dur*(k+0.5)/N)));
var rows=[],diffs=[],strip=el('div','vid-strip');
for(k=0;k<anchors.length;k++){
var prev=null,row={t:anchors[k],noise:0,sharp:0,diffs:[]};
for(j=0;j<3;j++){
await seekTo(v,anchors[k]+j*STEP);
ctx.drawImage(v,0,0,W,H);
var st=frameStats(ctx,W,H,prev);prev=st.gray;
if(j===0){row.noise=st.noise;row.sharp=st.sharp;
var fig=document.createElement('figure'),tc=document.createElement('canvas');tc.width=96;tc.height=Math.round(96*H/W);tc.getContext('2d').drawImage(c,0,0,tc.width,tc.height);
fig.appendChild(tc);fig.appendChild(el('div','',anchors[k].toFixed(1)+' s'));fig.dataset.t=String(anchors[k]);fig.title='Jump to this moment';
fig.addEventListener('click',function(){var pv=document.querySelector('#fakeMediaPreview video');if(pv){pv.pause();pv.currentTime=parseFloat(this.dataset.t);}});
strip.appendChild(fig);}
else{row.diffs.push(st.diff);diffs.push({t:anchors[k]+j*STEP,d:st.diff});}
}
rows.push(row);
}
var holder=el('div','');holder.appendChild(strip);
holder.appendChild(el('div','ela-cap','Frames sampled at '+rows.length+' moments, 3 frames each (about 0.08 s apart). Tap a frame to jump there, then use the frame buttons under the video to step through it.'));
nodes.push(holder);
var all=diffs.map(function(x){return x.d;}).sort(function(a,b){return a-b;}),med=all[Math.floor(all.length/2)]||0;
var frozen=diffs.filter(function(x){return x.d<0.05;}).length;
if(frozen&&frozen>=diffs.length*0.5)items.push({sev:'info',title:'Most neighbouring frames are identical',detail:'The picture barely changes between sampled frames. That is normal for a still shot or a very low frame rate, and it is also how repeated or frozen frames look.'});
else if(frozen)items.push({sev:'low',title:frozen+' of '+diffs.length+' frame pairs are identical',detail:'Some frames repeat. This happens with low frame rates, pauses and duplicated footage.'});
var jumps=diffs.filter(function(x){return x.d>25&&x.d>med*4;});
if(jumps.length)items.push({sev:'info',title:'Abrupt picture change at '+jumps.map(function(x){return x.t.toFixed(1)+' s';}).join(', '),detail:'The image changes completely within a fraction of a second. That is usually a cut between shots, which is normal in edited video.'});
var nz=rows.map(function(r){return r.noise;}),nmin=Math.min.apply(null,nz),nmax=Math.max.apply(null,nz),navg=nz.reduce(function(a,b){return a+b;},0)/nz.length;
if(nmin>0.3&&nmax>nmin*3)items.push({sev:'low',title:'Image noise differs a lot between moments ('+nmin.toFixed(1)+' to '+nmax.toFixed(1)+')',detail:'Parts of the video may come from different cameras or were processed differently. Lighting changes and compression also cause this, so treat it as a reason to look closer.'});
if(navg<0.8)items.push({sev:'info',title:'Very smooth frames (average noise '+navg.toFixed(2)+')',detail:'AI-generated video often looks like this, but so do heavily compressed, denoised or animated videos.'});
if(!frozen&&!jumps.length&&!(nmin>0.3&&nmax>nmin*3)&&navg>=0.8)items.push({sev:'info',title:'Frames look consistent with each other',detail:'No freezes, jumps or noise changes in the sampled moments. This does not show the video is genuine; only a few moments were sampled.'});
}finally{v.removeAttribute('src');v.load();URL.revokeObjectURL(url);}
}
function buildFrameStepper(video){
var row=el('div','vid-step'),back=el('button','','◀ Frame'),fwd=el('button','','Frame ▶'),lab=el('span','','');
back.type='button';fwd.type='button';var fps=30;
function upd(){lab.textContent=video.currentTime.toFixed(3)+' s · frame '+Math.round(video.currentTime*fps);}
function step(dir){video.pause();video.currentTime=Math.max(0,Math.min(video.duration||0,video.currentTime+dir/fps));}
back.onclick=function(){step(-1);};fwd.onclick=function(){step(1);};
video.addEventListener('seeked',upd);video.addEventListener('timeupdate',upd);
video.addEventListener('loadedmetadata',function(){
upd();
if(!video.requestVideoFrameCallback)return;
var times=[],stopped=false;
function done(){if(stopped)return;stopped=true;video.pause();video.currentTime=0;
var d=[];for(var i=1;i<times.length;i++){var x=times[i]-times[i-1];if(x>0.004)d.push(x);}
if(d.length>=3){d.sort(function(a,b){return a-b;});var f=1/d[Math.floor(d.length/2)];if(f>=5&&f<=240)fps=f;}upd();}
function cb(now,meta){times.push(meta.mediaTime);if(times.length>=8)done();else video.requestVideoFrameCallback(cb);}
video.requestVideoFrameCallback(cb);
var m=video.muted;video.muted=true;var p=video.play();if(p&&p.catch)p.catch(function(){stopped=true;});
setTimeout(function(){done();video.muted=m;},1500);
},{once:true});
row.appendChild(back);row.appendChild(lab);row.appendChild(fwd);return row;
}
async function handleFakeFile(file){
hideKeyboard();
if(!file)return;
if(!/^(image|video)\//.test(file.type)){toast('Please choose an image or a video','#ff4444');return;}
var token=++fakeRun;
document.getElementById('fakePreviewArea').style.display='block';
var preview=document.getElementById('fakeMediaPreview');preview.textContent='';
if(fakeUrl)URL.revokeObjectURL(fakeUrl);
fakeUrl=URL.createObjectURL(file);
var media;
if(file.type.indexOf('image')===0){media=document.createElement('img');media.alt='Selected image preview';}
else{media=document.createElement('video');media.controls=true;media.preload='metadata';}
media.src=fakeUrl;media.style.cssText='width:100%;border-radius:10px;';preview.appendChild(media);
if(media.tagName==='VIDEO')preview.appendChild(buildFrameStepper(media));
document.getElementById('fakeReverseSearch').textContent='';
var out=document.getElementById('fakeAnalysis');out.textContent='⏳ Analyzing the file…';
try{
var rep=await analyzeMedia(file);
if(token!==fakeRun)return;
renderReport(out,rep);
if(file.type.indexOf('image')===0){out.appendChild(aiBlock('🤖 Check this image with AI','image',function(){return imgToDataUrl(file).then(function(d){return{image:d,question:'Is this image AI-generated, edited or misleading?'};});},{auto:true,hint:'AI mode: a smaller copy of the image is sent to an AI model automatically when the checks finish. It can be wrong; the metadata and error-level measurements above stay and are separate.'}));}
}catch(e){if(token===fakeRun)out.textContent='Could not analyze this file. Try a JPEG, PNG, WebP or MP4.';}
}
function clearFake(){
hideKeyboard();fakeRun++;
if(fakeUrl){URL.revokeObjectURL(fakeUrl);fakeUrl=null;}
document.getElementById('fakePreviewArea').style.display='none';
document.getElementById('fakeMediaPreview').textContent='';
document.getElementById('fakeAnalysis').textContent='';
document.getElementById('fakeReverseSearch').textContent='';
document.getElementById('fakeFileInput').value='';
}
function serverUrlCheck(raw,box){
raw=String(raw).trim();var u;
try{u=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:'http://'+raw);}catch(e){return;}
if(!API.ok||!API.urlCheck){
var fw=el('div','rep-ai');fw.appendChild(el('div','rep-note','Online reputation databases are not available from this copy of the site, but all checks above ran on your device. You can also check the link yourself (opens in a new tab; the link is sent to that service only if you press it):'));
var fl=el('div');[['Google Safe Browsing','https://transparencyreport.google.com/safe-browsing/search?url='+encodeURIComponent(u.href)],['VirusTotal','https://www.virustotal.com/gui/search/'+encodeURIComponent(u.href)]].forEach(function(x){var a=el('a','',x[0]);a.href=x[1];a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin:6px 12px 0 0';fl.appendChild(a);});
fw.appendChild(fl);box.appendChild(fw);return;}
var w=el('div','rep-ai');w.appendChild(el('div','rep-note','Checking reputation databases…'));box.appendChild(w);
apiFetch('/api/check-url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u.href}),timeout:15000}).then(function(r){
if(r.status===429)throw new Error('Too many checks. Try again later.');
if(!r.ok)throw new Error('The database check failed.');return r.json();
}).then(function(d){
w.textContent='';var ul=el('ul','rep-list'),bad=false;
function add(sev,t,x){var li=el('li','rep-item sev-'+sev);li.appendChild(el('b','',t));if(x)li.appendChild(el('div','',x));ul.appendChild(li);}
var sb=d.safeBrowsing||{},vt=d.virusTotal||{};
if(sb.checked){
if(sb.threats&&sb.threats.length){bad=true;add('high','Google Safe Browsing flags this link: '+sb.threats.join(', ').toLowerCase().replace(/_/g,' '),'Do not open it or enter anything on it.');}
else add('ok','Not on Google Safe Browsing lists','New scams are listed only after they are reported, so this is not a guarantee.');
}
if(vt.checked){
if(vt.known===false)add('info','VirusTotal has not seen this link before','Normal for new or rare links. It is neither good nor bad on its own.');
else if(vt.malicious>0){bad=true;add('high','VirusTotal: '+vt.malicious+' security engine(s) flag it as malicious'+(vt.suspicious?' and '+vt.suspicious+' as suspicious':''),'');}
else if(vt.suspicious>0)add('med','VirusTotal: '+vt.suspicious+' engine(s) call it suspicious','');
else add('ok','VirusTotal: no engine flags it','Harmless: '+vt.harmless+', no verdict: '+vt.undetected+'.');
}
if(!ul.children.length){w.appendChild(el('div','rep-note','No reputation database answered.'));return;}
w.appendChild(el('div','rep-note','Reputation databases (checked on the server)'));w.appendChild(ul);
if(bad){var bd=box.querySelector('.rep-badge');if(bd){bd.className='rep-badge lvl-high';bd.textContent='🚨 Flagged by a reputation database';}}
}).catch(function(e){w.textContent='';w.appendChild(el('div','rep-note',e&&e.message?e.message:'The database check failed.'));});
}
function dnsBuild(name,type){
var parts=name.replace(/\.$/,'').split('.'),len=12+1+4,i,o=12;
parts.forEach(function(p){if(!p||p.length>63)throw new Error('bad name');len+=p.length+1;});
var b=new Uint8Array(len);b[2]=1;b[5]=1;
parts.forEach(function(p){b[o++]=p.length;for(i=0;i<p.length;i++)b[o++]=p.charCodeAt(i)&127;});
b[o++]=0;b[o++]=type>>8;b[o++]=type&255;b[o++]=0;b[o++]=1;return b;
}
function dnsName(b,o){
var labels=[],jumped=false,end=o,guard=0;
while(guard++<64){
var l=b[o];if(l===undefined)throw new Error('short');
if(l===0){if(!jumped)end=o+1;break;}
if((l&0xC0)===0xC0){var ptr=((l&0x3F)<<8)|b[o+1];if(!jumped)end=o+2;jumped=true;o=ptr;continue;}
labels.push(String.fromCharCode.apply(null,b.subarray(o+1,o+1+l)));o+=l+1;
}
return[labels.join('.'),end];
}
function dnsParse(b){
if(b.length<12)throw new Error('short');
var rcode=b[3]&15,qd=(b[4]<<8)|b[5],an=(b[6]<<8)|b[7],o=12,i,out=[];
for(i=0;i<qd;i++){o=dnsName(b,o)[1]+4;}
for(i=0;i<an;i++){
var nm=dnsName(b,o);o=nm[1];
var type=(b[o]<<8)|b[o+1],ttl=b[o+4]*16777216+(b[o+5]<<16)+(b[o+6]<<8)+b[o+7],rl=(b[o+8]<<8)|b[o+9],rd=o+10,v;
if(type===1)v=b[rd]+'.'+b[rd+1]+'.'+b[rd+2]+'.'+b[rd+3];
else if(type===28){var g=[];for(var k=0;k<8;k++)g.push(((b[rd+2*k]<<8)|b[rd+2*k+1]).toString(16));v=g.join(':');}
else if(type===15)v=((b[rd]<<8)|b[rd+1])+' '+dnsName(b,rd+2)[0];
else if(type===2||type===5)v=dnsName(b,rd)[0];
else v='';
out.push({type:type,ttl:ttl,v:v});o=rd+rl;
}
return{rcode:rcode,answers:out};
}
function dnsQuery(name,type){
var body=dnsBuild(name,type);
function direct(url,label){return fetch(url,{method:'POST',headers:{'Content-Type':'application/dns-message',Accept:'application/dns-message'},body:body,credentials:'omit',referrerPolicy:'no-referrer'}).then(function(r){if(!r.ok)throw new Error('no dns');dnsVia=label;return r.arrayBuffer();});}
return apiFetch('/dns-query',{method:'POST',headers:{'Content-Type':'application/dns-message',Accept:'application/dns-message'},body:body,timeout:7000})
.then(function(r){
if(!r.ok||(r.headers.get('content-type')||'').indexOf('dns-message')===-1)throw new Error('no dns');
dnsVia=r.headers.get('x-doh-upstream')||dnsVia;return r.arrayBuffer();
}).catch(function(){return direct('https://cloudflare-dns.com/dns-query','your browser → Cloudflare DNS').catch(function(){return direct('https://dns.google/dns-query','your browser → Google DNS');});})
.then(function(buf){return dnsParse(new Uint8Array(buf));});
}
function dnsCheck(raw,box){
if(!/^https?:$/.test(location.protocol))return;
raw=String(raw).trim();var u;
try{u=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:'http://'+raw);}catch(e){return;}
var host=u.hostname;
if(!host||/^[\d.]+$/.test(host)||host.indexOf(':')!==-1||host.indexOf('.')===-1)return;
var w=el('div','rep-ai');w.appendChild(el('div','rep-note','Looking up the domain in DNS…'));box.appendChild(w);
function q(t){return dnsQuery(host,t).catch(function(){return null;});}
Promise.all([q(1),q(28),q(15),q(2)]).then(function(r){
w.textContent='';
if(!r[0]&&!r[1]&&!r[2]&&!r[3]){w.remove();return;}  // no DNS endpoint on this host
var ul=el('ul','rep-list');
function add(sev,t,x){var li=el('li','rep-item sev-'+sev);li.appendChild(el('b','',t));if(x)li.appendChild(el('div','',x));ul.appendChild(li);}
var a=r[0]||{answers:[],rcode:0},aaaa=r[1]||{answers:[]},mx=r[2]||{answers:[]},ns=r[3]||{answers:[]};
var ips=a.answers.filter(function(x){return x.type===1;}).concat(aaaa.answers.filter(function(x){return x.type===28;}));
if(a.rcode===3)add('med','This domain name does not exist','DNS says there is no such domain (NXDOMAIN). The link leads nowhere: it may be mistyped, or a scam site that has already been taken down.');
else if(!ips.length)add('low','The domain has no web address','It exists, but DNS gives no IP address for it, so a website cannot be opened there.');
else{
add('info','Resolves to '+ips.slice(0,4).map(function(x){return x.v;}).join(', ')+(ips.length>4?' …':''),'The addresses the domain points to right now.');
var minTtl=Math.min.apply(null,ips.map(function(x){return x.ttl;}));
if(minTtl<60)add('low','Very short DNS cache time ('+minTtl+' s)','CDNs use this, but so do throwaway scam sites that change address often.');
}
if(a.rcode!==3){
if(ns.answers.length)add('info','Name servers: '+ns.answers.slice(0,3).map(function(x){return x.v;}).join(', '),'');
if(!mx.answers.length)add('info','No mail records','The domain is not set up to receive email. Normal for many sites; odd for a company that mails you.');
}
w.appendChild(el('div','rep-note','DNS lookup'+(dnsVia?' (via '+dnsVia+')':'')));w.appendChild(ul);
});
}

/* ===================== v9: AI Chat ===================== */
/* ---- local conversation engine (used when no language model is connected) ---- */
function calcExpr(src){
var i=0;function ws(){}
function num(){var m=/^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0]);}
function atom(){if(src[i]==='('){i++;var v=add();if(src[i++]!==')')throw 0;return v;}if(src[i]==='-'){i++;return -atom();}if(src[i]==='+'){i++;return atom();}return num();}
function pow(){var b=atom();if(src.slice(i,i+2)==='**'){i+=2;return Math.pow(b,pow());}return b;}
function mul(){var v=pow();while(i<src.length&&/[*/%]/.test(src[i])&&src.slice(i,i+2)!=='**'){var o=src[i++];var r=pow();v=o==='*'?v*r:o==='/'?v/r:v%r;}return v;}
function add(){var v=mul();while(i<src.length&&/[-+]/.test(src[i])){var o=src[i++];var r=mul();v=o==='+'?v+r:v-r;}return v;}
var out=add();if(i!==src.length)throw 0;return out;
}
function localReply(q,hist){
var t=q.trim(),l=t.toLowerCase().replace(/[!?.,]+$/,'').trim(),bg=/[Ѐ-ӿ]/.test(t);
function pick(a){return a[Math.floor(Math.random()*a.length)];}
if(/^(hi|hello|hey|yo|hola|good (morning|afternoon|evening)|здрасти|здравей|здравейте|привет|добър ден|добро утро|добър вечер|чао)$/.test(l))
return bg?pick(['Здравей! Как мога да помогна днес?','Здравей! С какво да помогна?']):pick(['Hello! How can I help you today?','Hi there! What would you like to talk about?','Hey! What can I do for you?']);
if(/^(how are you|how'?s it going|what'?s up|how do you do|как си|как сте|какво правиш|как върви)( today)?$/.test(l))
return bg?'Добре съм, благодаря! А ти как си? Какво да потърсим или обсъдим?':'I\'m doing well, thanks for asking! How are you? What shall we look into?';
if(/^(thanks|thank you|thx|ty|благодаря|мерси|благодаря ти)( a lot| very much| you)?$/.test(l))return bg?'Моля! Ако имаш друг въпрос, питай.':'You\'re welcome! Ask me anything else any time.';
if(/^(bye|goodbye|see you|good night|чао|довиждане|лека нощ)$/.test(l))return bg?'Довиждане! Връщай се когато искаш.':'Goodbye! Come back any time.';
if(/(who are you|what are you|your name|кой си|какъв си|как се казваш)/.test(l))
return bg?'Аз съм асистентът на AI INFORMATION. Не съм свързан с ChatGPT или OpenAI. Мога да разговарям, да смятам, да търся в интернет и да намирам видеа.':'I\'m the assistant of AI INFORMATION. I have no connection to ChatGPT or OpenAI. I can chat, do maths, search the web for facts and find videos.';
if(/(are you (chat)?gpt|are you openai|chatgpt ли си)/.test(l))return bg?'Не, не съм ChatGPT и не използвам OpenAI API.':'No, I\'m not ChatGPT and I don\'t use any OpenAI API.';
if(/^(help|what can you do|what do you do|помощ|какво можеш|какво умееш)$/.test(l))
return bg?'Мога да разговарям, да смятам (напр. 12*7+3), да ти кажа часа и датата, да търся факти в Wikipedia/новини и да намирам видеа ("намери видео за вулкани"). За по-умни отговори сайтът трябва да е свързан с езиков модел (Workers AI).':'I can chat, calculate (try 12*7+3), tell the time and date, search Wikipedia/news for facts, and find videos ("find a video about volcanoes"). For smarter, free-form answers the site must be connected to a language model (Cloudflare Workers AI).';
if(/(what('?s| is) the (time|date)|what time is it|what day is it|колко е часът|коя дата е|какъв ден е|колко е часа)/.test(l)){
var d=new Date();return (bg?'Сега е ':'It is ')+d.toLocaleString(bg?'bg-BG':'en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})+'.';}
if(/^(tell me a joke|joke|another joke|кажи (ми )?виц|виц)$/.test(l))
return bg?pick(['Защо програмистите бъркат Хелоуин с Коледа? Защото 31 октомври = 25 декември (Oct 31 = Dec 25).','Опитах да хвана облак… но получих 404.']):pick(['Why do programmers mix up Halloween and Christmas? Because Oct 31 = Dec 25.','I tried to catch some fog earlier. I mist.','There are 10 kinds of people: those who understand binary and those who don\'t.']);
var m=/^(?:what is|what's|calculate|calc|solve|колко е|изчисли|смятай)?\s*([-+*/%^().,\d\s×x÷:]+)\s*=?\s*\??$/i.exec(l);
if(m&&/\d/.test(m[1])&&/[-+*/%^×x÷:]/.test(m[1].replace(/^\s*-/,''))){
var ex=m[1].replace(/×|x/gi,'*').replace(/÷|:/g,'/').replace(/\^/g,'**').replace(/,/g,'.').replace(/\s+/g,'');
if(/^[-+*/%().\d]+$/.test(ex)&&ex.length<80){try{var v=calcExpr(ex);if(typeof v==='number'&&isFinite(v))return ex.replace(/\*\*/g,'^')+' = '+(Math.round(v*1e10)/1e10);}catch(e){}}
}
return null;
}

/* ===================== v9: multi-source scans ===================== */
function engRows(box,list){
list.forEach(function(e){var r=el('div','eng '+e.status);var l=el('div');l.appendChild(el('b','',e.name));l.appendChild(el('small','',e.detail||''));r.appendChild(l);r.appendChild(el('span','st',({flagged:'🚨 flagged',clean:'✅ clean',unknown:'❔ no data',error:'⚠️ error'})[e.status]||e.status));box.appendChild(r);});
}
function multiScan(raw){
var res=$('scamResult');var w=el('div','rep-ai');w.appendChild(el('b','','🔬 Multi-source scan'));var st=el('div','v9-note','Asking several independent sources…');w.appendChild(st);res.appendChild(w);
var u=String(raw).trim();if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(u))u='https://'+u;
function localScan(why){
var host;try{host=new URL(u).hostname;}catch(e){st.textContent='This does not look like a link.';return;}
st.textContent='Asking the DNS safety filters from your browser…';
function ask(url){return fetch(url,{method:'POST',headers:{'Content-Type':'application/dns-message',Accept:'application/dns-message'},body:dnsBuild(host,1),credentials:'omit',referrerPolicy:'no-referrer'}).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer();}).then(function(b){return dnsParse(new Uint8Array(b));});}
var E=[['Cloudflare Security DNS','https://security.cloudflare-dns.com/dns-query'],['Cloudflare Family DNS','https://family.cloudflare-dns.com/dns-query']];
Promise.all([ask('https://cloudflare-dns.com/dns-query').catch(function(){return null;})].concat(E.map(function(x){return ask(x[1]).catch(function(){return null;});}))).then(function(r){
st.remove();var base=r[0],ok=base&&base.rcode===0&&base.answers.some(function(x){return x.type===1&&x.v!=='0.0.0.0';});
var eng=[],bad=0,good=0;
E.forEach(function(x,i){var q=r[i+1];if(!q||!base){eng.push({name:x[0],status:'unknown',detail:'resolver unreachable'});return;}
var blocked=ok&&(q.rcode===3||(q.answers.length&&q.answers.every(function(a){return a.v==='0.0.0.0'||a.v==='::'||/^0(:0)*$/.test(a.v);}))||(q.rcode===0&&!q.answers.length));
if(blocked){bad++;eng.push({name:x[0],status:'flagged',detail:i?'blocked by the family filter (malware, phishing or adult content)':'blocked as malware/phishing'});}else{good++;eng.push({name:x[0],status:'clean',detail:'not blocked'});}});
var v=bad>=2?['🚨','Malicious – multiple sources flag it','high']:bad===1?['⚠️','Suspicious – one source flags it','medium']:good?['✅','No source flags it','low']:['❔','Not enough data for a verdict','unknown'];
w.appendChild(el('div','rep-badge lvl-'+v[2],v[0]+' '+v[1]));engRows(w,eng);
w.appendChild(el('div','v9-note','These two filters were asked directly from your browser (the domain name is sent to Cloudflare’s DNS). This is a quick hint, not a guarantee. The page itself is never opened.'));
logAct('scam','multi-source local '+v[2]);});}
if(!API.ok){localScan();return;}
xpost('scan-url',{url:u},30000).then(function(j){
if(j.verdict==='unknown'&&(j.engines||[]).every(function(e){return e.status==='unknown'||e.status==='error';})){localScan();return;}
st.remove();var vm={malicious:['🚨','Malicious – multiple sources flag it'],suspicious:['⚠️','Suspicious – one source flags it'],clean:['✅','No source flags it'],unknown:['❔','Not enough data for a verdict']}[j.verdict]||['❔','',''];
var badge=el('div','rep-badge lvl-'+(j.verdict==='malicious'?'high':j.verdict==='suspicious'?'medium':j.verdict==='clean'?'low':'unknown'),vm[0]+' '+vm[1]);w.appendChild(badge);
engRows(w,j.engines||[]);(function(){var d=j.domainAgeDays,t;if(d==null)t='Domain age: not available (this domain ending has no public registry data).';else{var y=Math.floor(d/365),m=Math.floor((d%365)/30);t='Domain '+(j.domainName||'')+' was registered on '+j.domainCreated+' ('+(y?y+' y ':'')+(y||m?m+' mo':d+' days')+(d<30?', very new: a common sign of scam sites':'')+').';}w.appendChild(el('div','v9-note',t));})();
if(j.note)w.appendChild(el('div','v9-note',j.note));
w.appendChild(el('div','v9-note','Sources: Cloudflare DNS filters, URLhaus, domain registry age (+ VirusTotal / Google Safe Browsing when keys are set on the server). The page itself is never opened. These lookups are facts from other services; the risk estimate above comes only from the AI.'));
logAct('scam','multi-source '+j.verdict);
}).catch(function(e){localScan();});
}
function hashHex(alg,buf){return crypto.subtle.digest(alg,buf).then(function(h){return Array.from(new Uint8Array(h),function(b){return b.toString(16).padStart(2,'0');}).join('');});}
function fileScan(file){
var host=$('fakeReverseSearch');if(!host)return;
setTimeout(function(){
var w=el('div','rep-ai');w.style.width='100%';w.appendChild(el('b','','🔬 Sources scan'));host.appendChild(w);
var st=el('div','v9-note','Computing the file fingerprint…');w.appendChild(st);
if(file.size>150*1024*1024){st.textContent='File is too large to fingerprint in the browser (limit 150 MB).';linkRow(w);return;}
file.arrayBuffer().then(function(buf){return Promise.all([hashHex('SHA-256',buf),hashHex('SHA-1',buf)]);}).then(function(h){
st.textContent='SHA-256: '+h[0].slice(0,16)+'…  ·  SHA-1: '+h[1].slice(0,12)+'…';var list=el('div');w.appendChild(list);
fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&list=allimages&aisha1='+h[1]+'&aiprop=url').then(function(r){return r.json();}).then(function(j){
var m=(j.query&&j.query.allimages)||[];engRows(list,[m.length?{name:'Wikimedia Commons',status:'clean',detail:'This exact file is published on Commons: '+m[0].descriptionurl}:{name:'Wikimedia Commons',status:'unknown',detail:'This exact file is not on Commons (does not prove anything either way).'}]);
if(m.length){var a=el('a','',m[0].descriptionurl);a.href=safeUrl(m[0].descriptionurl);a.target='_blank';a.rel='noopener noreferrer';list.appendChild(a);}
}).catch(function(){engRows(list,[{name:'Wikimedia Commons',status:'error',detail:'not reachable from this viewer'}]);});
if(API.ok)xget('hash',{sha256:h[0]},15000).then(function(j){engRows(list,j.engines||[]);}).catch(function(){});
logAct('fake',{name:file.name,type:'sources scan',size:file.size,result:'sha256 '+h[0]});
linkRow(w);
}).catch(function(){st.textContent='Could not read the file.';});
},300);
function linkRow(w){
w.appendChild(el('div','v9-note','Reverse-image / forensic services (open one and drop the same file there – browsers cannot upload it for you):'));
var r=el('div','v9-row');[['Google Lens','https://lens.google.com/'],['TinEye','https://tineye.com/'],['Bing Visual Search','https://www.bing.com/visualsearch'],['Yandex Images','https://yandex.com/images/'],['FotoForensics','https://fotoforensics.com/'],['Forensically','https://29a.ch/photo-forensics/'],['InVID (video)','https://www.invid-project.eu/tools-and-services/invid-verification-plugin/']].forEach(function(l){var a=el('a','v9-btn',l[0]);a.href=l[1];a.target='_blank';a.rel='noopener noreferrer';a.style.textDecoration='none';r.appendChild(a);});w.appendChild(r);
}
}

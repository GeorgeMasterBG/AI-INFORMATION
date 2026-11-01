/* AI INFORMATION - weather.js
   Weather Scout and the automatic theme.
   Only function declarations: they are called later by app.js (loaded last). */

function wmo(c){var w=WMO[c]||['🌡️','Unknown'];return{i:w[0],t:w[1]};}
function atMode(){var m='off';try{m=localStorage.getItem('ai_v9_autotheme')||'off';}catch(e){}return m==='time'||m==='weather'?m:'off';}
function atIsDay(){
try{if(wxData&&wxData.daily&&wxData.daily.sunrise&&wxData.utc_offset_seconds!=null){var nowL=new Date(Date.now()+wxData.utc_offset_seconds*1000).toISOString().slice(0,16),dayS=nowL.slice(0,10),i=wxData.daily.time.indexOf(dayS);if(i>=0){return wxData.daily.sunrise[i]<=nowL&&nowL<wxData.daily.sunset[i];}}}catch(e){}
try{if(wxData&&wxData.current&&wxData.current.is_day!=null)return wxData.current.is_day===1;}catch(e){}
var h=new Date().getHours();return h>=7&&h<19;}
function atDecide(){var m=atMode(),day=atIsDay(),place=(wxData&&wxLoc&&wxLoc.name)||'';
if(!day)return{light:false,why:'it is night'+(place?' in '+place:'')};
if(m==='weather'&&wxData&&wxData.current){var c=wxData.current;if(c.weather_code>=45)return{light:false,why:'the weather is gloomy ('+wmo(c.weather_code).t.toLowerCase()+')'+(place?' in '+place:'')};if(c.cloud_cover>=90)return{light:false,why:'the sky is heavily clouded'+(place?' in '+place:'')};return{light:true,why:'it is a bright day'+(place?' in '+place:'')};}
return{light:true,why:'it is day'+(place?' in '+place:'')};}
function wxLoad(){
var u='https://api.open-meteo.com/v1/forecast?latitude='+wxLoc.lat+'&longitude='+wxLoc.lon+'&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max&timezone=auto&forecast_days=7';
return fetch(u).then(function(r){if(!r.ok)throw new Error('http');return r.json();}).then(function(j){
wxData=j;var c=j.current,w=wmo(c.weather_code);var chip=$('wxChip');chip.textContent='';chip.appendChild(document.createTextNode(w.i+' '+Math.round(c.temperature_2m)+'°C'));chip.title=wxLoc.name+' · '+w.t;try{AI_AUTOTHEME_APPLY();}catch(e){}
if(wxPanelBody&&$('v9Weather').classList.contains('open'))wxRender();
}).catch(function(){$('wxChip').textContent='🌡️ --°';});
}
function wxRender(){
var b=wxPanelBody;b.textContent='';var j=wxData;
var row=el('div','v9-row'),inp=el('input','v9-in');inp.placeholder='Search a city…';inp.setAttribute('aria-label','City');
var list=el('div');
function search(){var q=inp.value.trim();if(q.length<2)return;list.textContent='…';
fetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language='+'en'+'&name='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(d){
list.textContent='';(d.results||[]).forEach(function(c){var bt=mkBtn(c.name+(c.admin1?', '+c.admin1:'')+', '+(c.country||''),'',function(){wxLoc={name:c.name,lat:c.latitude,lon:c.longitude};jset('ai_wx_loc',wxLoc);logAct('weather','city '+c.name);wxLoad();});bt.style.margin='3px';list.appendChild(bt);});
if(!(d.results||[]).length)list.textContent='No city found';}).catch(function(){list.textContent='Search unavailable here';});}
inp.onkeydown=function(e){if(e.key==='Enter')search();};row.appendChild(inp);row.appendChild(mkBtn('Search','pri',search));
var msg=el('div','v9-note');msg.id='wxMsg';msg.textContent=wxNote;if(/preview window/.test(wxNote)){var ob=el('button','v9-btn','↗ Open the site in your browser');ob.type='button';ob.style.cssText='display:block;margin-top:8px';ob.onclick=function(){window.open(location.href,'_blank','noopener');};msg.appendChild(ob);}
var locBtn=mkBtn('📍 My location','',function(){explainLocation(locGo);});
function locGo(){
var done=false,wd=null;
function say(t,keep){if(keep)wxNote=t;msg.textContent=t;}
function use(name,lat,lon,why){wxLoc={name:name,lat:lat,lon:lon};jset('ai_wx_loc',wxLoc);say(why||'',true);locBtn.disabled=false;wxLoad();}
function approx(why){
if(API.geo&&API.geo.lat!=null){logAct('weather','approximate location');use((API.geo.city||'Approximate location')+' (approximate)',API.geo.lat,API.geo.lon,why+' Using your approximate location from your network instead.');return;}
say(why+' Trying an approximate location from your network…');
fetch('https://ipwho.is/?fields=success,city,latitude,longitude').then(function(r){return r.json();}).then(function(g){
if(!g||!g.success||g.latitude==null)throw 0;logAct('weather','approximate location (ip)');use((g.city||'Approximate location')+' (approximate)',g.latitude,g.longitude,why+' Used an approximate location from your network (city level, found with ipwho.is).');
}).catch(function(){locBtn.disabled=false;say(why+' Search for your city above instead.',true);});
}
function finish(fn){if(done)return;done=true;clearTimeout(wd);fn();}
locBtn.disabled=true;say('Asking your device for its location… (allow it if the browser asks)');
wd=setTimeout(function(){finish(function(){approx('Your browser gave no answer (location may be blocked in this window).'+(embedded?'':' '+how()));if(embedded)openOut();});},11000);
var embedded=false;try{embedded=window.top!==window;}catch(e){embedded=true;}
var ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
function openOut(){}
function how(){return ios?'On iPhone: Settings → Privacy & Security → Location Services → Safari Websites → While Using, then reload.':'On Android: tap the lock icon in the address bar → Permissions → Location → Allow, then reload.';}
if(!window.isSecureContext){finish(function(){approx('Phones only allow location on secure (https://) pages, and this page is not secure.');});return;}
if(!navigator.geolocation){finish(function(){approx('This browser has no location access.');});return;}
try{
navigator.geolocation.getCurrentPosition(function(p){finish(function(){logAct('weather','geolocation');use('My location',p.coords.latitude,p.coords.longitude,'');});},
function(e){finish(function(){approx(e&&e.code===1?(embedded?'This preview window is not allowed to ask for your location, so the browser shows no permission prompt.':'Location permission is blocked for this site. '+how()):'Your device could not provide a location (turn on GPS/Location Services and try again).');if(embedded)openOut();});},{timeout:9000,maximumAge:600000,enableHighAccuracy:false});
}catch(e){finish(function(){approx('Location is blocked in this window.');});}
}
row.appendChild(locBtn);
b.appendChild(row);b.appendChild(msg);b.appendChild(list);
if(!j){b.appendChild(el('div','v9-note','Weather is loading, or this viewer cannot reach the weather service.'));return;}
var c=j.current,w=wmo(c.weather_code);
b.appendChild(el('h3','',wxLoc.name));
var big=el('div','wx-big');big.appendChild(el('span','',w.i));big.appendChild(el('span','',Math.round(c.temperature_2m)+'°C'));var d=el('span','',w.t);d.style.cssText='font-size:18px;font-weight:normal';big.appendChild(d);b.appendChild(big);
var g=el('div','wx-grid');
[['Feels like',Math.round(c.apparent_temperature)+'°C'],['Humidity',c.relative_humidity_2m+'%'],['Wind',Math.round(c.wind_speed_10m)+' km/h '+compass(c.wind_direction_10m)],['Pressure',Math.round(c.pressure_msl)+' hPa'],['Cloud cover',c.cloud_cover+'%'],['Precipitation',c.precipitation+' mm'],['Sunrise',(j.daily.sunrise[0]||'').slice(11)],['Sunset',(j.daily.sunset[0]||'').slice(11)],['UV index (max)',j.daily.uv_index_max[0]]].forEach(function(p){var x=el('div');x.appendChild(el('b','',p[0]));x.appendChild(document.createTextNode(p[1]));g.appendChild(x);});
b.appendChild(g);
b.appendChild(el('b','','Next 24 hours'));var st=el('div','wx-strip'),now=new Date().toISOString().slice(0,13);var start=Math.max(0,j.hourly.time.findIndex(function(t){return t.slice(0,13)>=now.slice(0,13);}));
for(var i=start;i<start+24&&i<j.hourly.time.length;i++){var x=el('div');x.appendChild(el('div','',j.hourly.time[i].slice(11,16)));x.appendChild(el('div','',wmo(j.hourly.weather_code[i]).i));x.appendChild(el('b','',Math.round(j.hourly.temperature_2m[i])+'°'));x.appendChild(el('div','v9-note','💧'+(j.hourly.precipitation_probability[i]||0)+'%'));st.appendChild(x);}
b.appendChild(st);b.appendChild(el('div','',' '));
b.appendChild(el('b','','7 days'));var dy=el('div','wx-strip');
j.daily.time.forEach(function(t,i){var x=el('div');x.appendChild(el('div','',new Date(t).toLocaleDateString('en',{weekday:'short'})));x.appendChild(el('div','',wmo(j.daily.weather_code[i]).i));x.appendChild(el('b','',Math.round(j.daily.temperature_2m_max[i])+'° / '+Math.round(j.daily.temperature_2m_min[i])+'°'));x.appendChild(el('div','v9-note','💧'+j.daily.precipitation_sum[i]+' mm'));dy.appendChild(x);});
b.appendChild(dy);
var src=el('div','v9-note');src.appendChild(document.createTextNode('Source: '));var a=el('a','','Open-Meteo.com');a.href='https://open-meteo.com/en/docs';a.target='_blank';a.rel='noopener noreferrer';src.appendChild(a);src.appendChild(document.createTextNode(' · '+'updated '+(c.time||'').replace('T',' ')));src.style.marginTop='14px';b.appendChild(src);
var scoutTxt=function(){var d=j.daily,cc=j.current,t=[];t.push('Now: '+wmo(cc.weather_code).t+', '+Math.round(cc.temperature_2m)+'°C (feels '+Math.round(cc.apparent_temperature)+'°C), wind '+Math.round(cc.wind_speed_10m)+' km/h, humidity '+cc.relative_humidity_2m+'%, rain '+cc.precipitation+' mm.');
for(var k=0;k<3&&d&&k<d.time.length;k++)t.push(d.time[k]+': '+wmo(d.weather_code[k]).t+', '+Math.round(d.temperature_2m_min[k])+'..'+Math.round(d.temperature_2m_max[k])+'°C'+(d.precipitation_sum?', rain '+d.precipitation_sum[k]+' mm':'')+'.');return t.join('\n');};
var scout=aiBlock('🛰️ AI Weather Scout','weather',function(){return{text:scoutTxt(),extra:{place:wxLoc.name.replace(/\s*\(approximate\)\s*$/i,'')}};},{hint:'AI + location: the AI model takes the place shown above and today\'s numbers, the site searches the internet for news and warnings about that place, and the AI writes a short briefing. Only the place name and these numbers are sent, not your exact coordinates.'});
scout.style.marginTop='14px';b.appendChild(scout);
}
function compass(d){return['N','NE','E','SE','S','SW','W','NW'][Math.round((d%360)/45)%8];}
function wxGeoInit(){
if(store.get('ai_wx_loc'))return;
if(API.geo&&API.geo.lat!=null){wxLoc={name:API.geo.city||'Approximate location',lat:API.geo.lat,lon:API.geo.lon};wxLoad();}
}

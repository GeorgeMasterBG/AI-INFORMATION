/* The pixel maths of the image and video checks runs in a small Rust program (fastlab.wasm, source in worker-source/fastlab-rust).
   There is no JavaScript copy of it any more. Before it is used it must pass a known-answer test (the values below were made once
   with the earlier JavaScript version). If WebAssembly or the file is not available, the pixel checks are skipped and the
   other checks (file type, metadata, AI marks) still run. */
var FASTLAB={engine:'none',why:'not loaded',ready:null,ex:null,ms:0};
(function(){
var KAT={sum:3744.333333333311,ca:48862865,cc:491500.99999999994,cn:133223,noise:34273.25,l1:-723,l2:38951923,cnt:945,cg:1922726};
function ela(A,B,w,h){var e=FASTLAB.ex;if(!e)throw new Error('Rust/WebAssembly is not available ('+FASTLAB.why+')');
var t=performance.now();e.fl_reset();var n=w*h*4,pa=e.fl_alloc(n),pb=e.fl_alloc(n),pc=e.fl_alloc(256*8),pn=e.fl_alloc(256*4);if(!pa||!pb||!pc||!pn)throw new Error('not enough memory for the analysis');
var m=new Uint8Array(e.memory.buffer);m.set(A,pa);m.set(B,pb);new Float64Array(e.memory.buffer,pc,256).fill(0);new Uint32Array(e.memory.buffer,pn,256).fill(0);
var sum=e.fl_ela(pa,pb,w,h,pc,pn);A.set(new Uint8Array(e.memory.buffer,pa,n));
var r={sum:sum,cells:new Float64Array(e.memory.buffer.slice(pc,pc+2048)),cnt:new Uint32Array(e.memory.buffer.slice(pn,pn+1024))};FASTLAB.ms=Math.round(performance.now()-t);return r;}
function frame(d,w,h){var e=FASTLAB.ex;if(!e)throw new Error('Rust/WebAssembly is not available ('+FASTLAB.why+')');
e.fl_reset();var n=w*h,pd=e.fl_alloc(n*4),pg=e.fl_alloc(n*4),po=e.fl_alloc(32);if(!pd||!pg||!po)throw new Error('not enough memory for the analysis');
new Uint8Array(e.memory.buffer).set(d,pd);e.fl_frame(pd,w,h,pg,po);var o=new Float64Array(e.memory.buffer.slice(po,po+32));
return{gray:new Float32Array(e.memory.buffer.slice(pg,pg+n*4)),noise:o[0],l1:o[1],l2:o[2],cnt:o[3]};}
FASTLAB.ela=ela;FASTLAB.frame=frame;
function same(a,b){return Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));}
function selfTest(){var w=37,h=29,A=new Uint8ClampedArray(w*h*4),B=new Uint8ClampedArray(w*h*4),s=12345,i;
for(i=0;i<A.length;i++){s=(s*1103515245+12345)&0x7fffffff;A[i]=s>>8&255;B[i]=(A[i]+(s>>3&15))&255;}
var r=ela(A,B,w,h),ca=0,cc=0,cn=0;for(i=0;i<A.length;i++)ca=(ca+A[i]*((i%251)+1))>>>0;for(i=0;i<256;i++){cc+=r.cells[i]*(i+1);cn+=r.cnt[i]*(i+1);}
var f=frame(A,w,h),cg=0;for(i=0;i<f.gray.length;i++)cg+=f.gray[i]*((i%97)+1);
return same(r.sum,KAT.sum)&&ca===KAT.ca&&same(cc,KAT.cc)&&cn===KAT.cn&&same(f.noise,KAT.noise)&&same(f.l1,KAT.l1)&&same(f.l2,KAT.l2)&&f.cnt===KAT.cnt&&same(cg,KAT.cg);}
FASTLAB.ready=(function(){
if(typeof WebAssembly!=='object'||!window.fetch){FASTLAB.why='this browser has no WebAssembly';return Promise.resolve(false);}
return fetch('/fastlab.wasm?v='+((document.querySelector('meta[name="app-build"]')||{}).content||'1').replace(/\D/g,''),{credentials:'omit'}).then(function(r){if(!r.ok)throw new Error('file '+r.status);return r.arrayBuffer();})
.then(function(b){return WebAssembly.instantiate(b,{});}).then(function(o){FASTLAB.ex=o.instance.exports;
if(!selfTest()){FASTLAB.ex=null;FASTLAB.why='the self-test did not give the expected numbers';return false;}
FASTLAB.engine='Rust';FASTLAB.why='ok';return true;}).catch(function(e){FASTLAB.ex=null;FASTLAB.why=String(e&&e.message||e).slice(0,100);return false;});})();
})();

import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
test('interrupted offline redownload preserves the previous working cache',async()=>{
 const handlers={},previous={};const data=new Map([['taman-main-v1',previous]]);
 const caches={keys:async()=>[...data.keys()],has:async k=>data.has(k),open:async k=>{if(data.has(k))return data.get(k);const c={addAll:async()=>{throw Error('connection interrupted')}};data.set(k,c);return c},delete:async k=>data.delete(k)};
 const self={addEventListener:(t,f)=>handlers[t]=f,location:{origin:'https://example.com',href:'https://example.com/sw.js'},skipWaiting(){},clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),{self,caches,URL,Request,Response,Date,Math,fetch:async()=>{throw Error('offline')}});
 let pending;let response;handlers.message({data:{type:'DOWNLOAD'},waitUntil:p=>pending=p,ports:[{postMessage:r=>response=r}]});await pending;
 assert.equal(response.ok,false);assert.equal(data.get('taman-main-v1'),previous,'previous downloaded activities must remain available');
 assert.equal(response.stage,'assets','a failed update must identify the failed phase');
 assert.equal(response.error.message,'connection interrupted','keep the underlying cause for diagnostics');
});
test('offline download includes every narration file before marking ready',async()=>{
 const handlers={},added=[],stored=[];let marker;const cache={addAll:async urls=>added.push(...urls.map(request=>typeof request==='string'?request:'./'+new URL(request.url).pathname.slice(1))),match:async()=>({json:async()=>({language:'en',clips:{hello:['audio/a.mp3'],intro:['audio/a.mp3','audio/b.mp3']}})}),put:async(key,value)=>{stored.push(key);marker=await value.text()}};
 const caches={keys:async()=>['taman-main-download-test'],open:async()=>cache,delete:async()=>true};
 const self={addEventListener:(t,f)=>handlers[t]=f,location:{origin:'https://example.com',href:'https://example.com/sw.js'},skipWaiting(){},clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),{self,caches,URL,Request,Response,Date,Math,fetch:async()=>{throw Error('offline')}});
 let pending,response;handlers.message({data:{type:'DOWNLOAD'},waitUntil:p=>pending=p,ports:[{postMessage:r=>response=r}]});await pending;
 assert.equal(response.ok,true);assert.ok(added.includes('./progress.mjs'));assert.ok(added.includes('./gallery.mjs'));assert.ok(added.includes('./audio/a.mp3'));assert.ok(added.includes('./audio/b.mp3'));assert.equal(added.filter(x=>x==='./audio/a.mp3').length,1);assert.deepEqual(stored,['./__offline-ready']);
 assert.equal(marker,'ready:en-v1');
});

test('an old-language audio catalog cannot replace a completed offline download',async()=>{
 const handlers={},old={},data=new Map([['taman-main-download-old',old]]);let marked=false;
 const caches={keys:async()=>[...data.keys()],open:async key=>{if(data.has(key))return data.get(key);const cache={addAll:async()=>{},match:async()=>({json:async()=>({language:'id',clips:{hello:['audio/a.mp3']}})}),put:async()=>{marked=true}};data.set(key,cache);return cache},delete:async key=>data.delete(key)};
 const self={addEventListener:(type,fn)=>handlers[type]=fn,location:{origin:'https://example.com',href:'https://example.com/sw.js'},skipWaiting(){},clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),{self,caches,URL,Request,Response,Date,Math,fetch:async()=>{throw Error('offline')}});
 let pending,result;handlers.message({data:{type:'DOWNLOAD'},waitUntil:p=>pending=p,ports:[{postMessage:r=>result=r}]});await pending;
 assert.equal(result.ok,false);assert.equal(marked,false);assert.equal(data.get('taman-main-download-old'),old);
});

test('redownload bypasses cached partial audio and preserves the site subpath',async()=>{
 const handlers={},requests=[],previous={},data=new Map([['taman-main-download-old',previous]]);let marked=false;
 const cache={addAll:async inputs=>{for(const input of inputs){const url=typeof input==='string'?input:input.url;requests.push(input);if(url.endsWith('.mp3')&&(input.cache!=='reload'||input.headers.has('range')))throw new TypeError("Partial response (status code 206) is unsupported")}},match:async()=>({json:async()=>({language:'en',clips:{intro:['audio/intro.mp3']}})}),put:async()=>{marked=true}};
 const caches={keys:async()=>[...data.keys()],open:async key=>{if(data.has(key))return data.get(key);data.set(key,cache);return cache},delete:async key=>{if(key==='taman-main-download-old')assert.equal(marked,true,'keep the previous package until the complete replacement is ready');return data.delete(key)}};
 const self={addEventListener:(type,fn)=>handlers[type]=fn,location:{origin:'https://example.com',href:'https://example.com/KidsJourney/sw.js'},skipWaiting(){},clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),{self,caches,URL,Request,Response,Date,Math,fetch:async()=>{throw Error('offline')}});
 let pending,result;handlers.message({data:{type:'DOWNLOAD'},waitUntil:p=>pending=p,ports:[{postMessage:r=>result=r}]});await pending;
 assert.equal(result.ok,true,'redownloading after playback must request the complete audio file');
 assert.ok(requests.some(request=>request.url==='https://example.com/KidsJourney/audio/intro.mp3'));
 assert.equal(marked,true);
});

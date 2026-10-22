import test from 'node:test';
import assert from 'node:assert/strict';
import {newArt,artMove,artSvg} from '../dist/art.mjs';
import {makeGalleryStore,packArt,unpackArt,makeArtAutosaver} from '../dist/gallery.mjs';
function memory(){const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
function drawing(type='drawing',level='preschool'){return artMove(newArt(type,level),{type:'stroke',points:[{x:52.25,y:90},{x:95,y:110}],color:'red',size:12})}
test('all four art types restore editable, self-contained artwork without undo history',()=>{
 for(const type of ['drawing','mirror','fill','number'])for(const level of ['preschool','kindergarten']){
  let s=['drawing','mirror'].includes(type)?drawing(type,level):newArt(type,level);
  if(s.regions.length)s=artMove(s,{type:'fill',id:s.regions[0].id,color:type==='number'?s.regions[0].color:'blue'});
  const packed=packArt(s),restored=unpackArt(packed);
  assert.ok(restored);assert.deepEqual(restored.fills,s.fills);assert.deepEqual(restored.strokes,s.strokes);assert.equal(restored.undo.length,0);assert.equal(packed.regions,undefined);assert.equal(packed.undo,undefined);assert.equal(artSvg(restored),artSvg(s));
 }
});
test('gallery is private to profile, updates the same work and survives repository reload',()=>{
 const st=memory(),repo=makeGalleryStore(st);const first=repo.save('child-a','p-art-drawing',drawing());assert.equal(first.ok,true);
 assert.equal(repo.list('child-b').items.length,0);assert.equal(repo.get('child-b',first.item.id),null);
 let changed=artMove(drawing(),{type:'stroke',points:[{x:120,y:50}],color:'blue',size:6});
 const updated=repo.save('child-a','p-art-drawing',changed,{id:first.item.id,revision:first.item.revision});assert.equal(updated.ok,true);assert.equal(updated.item.id,first.item.id);assert.equal(updated.item.revision,2);
 const reloaded=makeGalleryStore(st);assert.equal(reloaded.list('child-a').items.length,1);assert.equal(unpackArt(reloaded.get('child-a',first.item.id).data).strokes.length,2);
});
test('quota, corruption, stale edits and wrong ownership preserve existing works',()=>{
 const st=memory(),repo=makeGalleryStore(st);const a=repo.save('a','p-art-drawing',drawing());const before=[...st.data.entries()];
 st.setItem=()=>{throw Error('QuotaExceededError')};assert.equal(repo.save('a','p-art-mirror',drawing('mirror')).ok,false);assert.deepEqual([...st.data.entries()],before);
 assert.equal(repo.save('b','p-art-drawing',drawing(),{id:a.item.id,revision:1}).ok,false);assert.equal(repo.save('a','p-art-drawing',drawing(),{id:a.item.id,revision:0}).reason,'conflict');
 const bad=memory();bad.setItem('taman-main-art-v1:a','{broken');const broken=makeGalleryStore(bad);assert.equal(broken.list('a').ok,false);assert.equal(broken.save('a','p-art-drawing',drawing()).ok,false);assert.equal(bad.getItem('taman-main-art-v1:a'),'{broken');
});
test('malformed snapshots cannot introduce arbitrary SVG, foreign colors or unknown shapes',()=>{
 assert.equal(unpackArt({type:'unknown',level:'preschool',strokes:[],fills:{}}),null);
 const p=packArt(drawing());p.strokes[0].color='<script>';assert.equal(unpackArt(p),null);
 const n=packArt(newArt('number','preschool'));n.fills={'left-top':'blue'};assert.equal(unpackArt(n),null);
 const m=packArt(newArt('mirror','preschool'));m.fills={'left-top':'red'};assert.equal(unpackArt(m),null);
 const f=packArt(newArt('fill','preschool'));f.fills={'unknown':'red'};assert.equal(unpackArt(f),null);
});
test('opening or saving an unfinished work does not change progress and deleting one profile preserves another',()=>{
 const st=memory(),repo=makeGalleryStore(st);st.setItem('taman-main-v1','unchanged-progress');repo.save('a','p-art-drawing',drawing());repo.save('b','p-art-drawing',drawing());assert.equal(st.getItem('taman-main-v1'),'unchanged-progress');
 assert.equal(repo.removeProfile('a').ok,true);assert.equal(repo.list('a').items.length,0);assert.equal(repo.list('b').items.length,1);assert.equal(st.getItem('taman-main-v1'),'unchanged-progress');
});
test('autosave coalesces changes, flushes on close and retains failed work for retry',()=>{
 let timer,fail=true,writes=0;const notices=[];
 const auto=makeArtAutosaver(s=>{writes++;return fail?{ok:false,reason:'storage'}:{ok:true,item:{data:packArt(s)}}},n=>notices.push(n.state),{setTimer:f=>{timer=f;return 1},clearTimer:()=>{}});
 auto.change(drawing());auto.change(drawing('mirror'));assert.equal(writes,0);timer();assert.equal(writes,1);assert.equal(notices.at(-1),'error');fail=false;assert.equal(auto.flush().ok,true);assert.equal(writes,2);assert.equal(notices.at(-1),'saved');
 auto.change(drawing());assert.equal(auto.dispose().ok,true);assert.equal(writes,3);timer();assert.equal(writes,3);
});

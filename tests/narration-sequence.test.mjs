import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeNarrator} from '../dist/narration.mjs';
import {audioClips} from '../dist/audio-catalog.mjs';
function setup(){const audios=[];class Audio{constructor(src){this.src=src;audios.push(this)}play(){return Promise.resolve()}pause(){this.paused=true}remove(){}}return {audios,n:makeNarrator({AudioClass:Audio,clips:{intro:['hello','guide'],one:['one'],two:['two'],next:['next']},enabled:()=>true})}}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('a step finishes every clip before the latest pending response starts',async()=>{
 const {n,audios}=setup();let finished=false;const intro=n.say('intro').then(()=>finished=true);await tick();
 const one=n.say('one');const two=n.say('two');await tick();
 assert.equal(audios.length,1);assert.equal(audios[0].paused,undefined);assert.equal(finished,false);
 audios[0].onended();await tick();assert.equal(audios[1].src,'guide');assert.equal(finished,false);
 audios[1].onended();await tick();assert.equal(finished,true);assert.equal(audios[2].src,'two');
 audios[2].onended();await Promise.all([intro,one,two]);
});
test('closing an activity cancels active and queued speech and resolves completion waits',async()=>{
 const {n,audios}=setup();const active=n.say('intro');const queued=n.say('next');await tick();const ended=audios[0].onended;
 n.stop();ended();await Promise.all([active,queued]);await tick();assert.equal(audios.length,1);assert.equal(audios[0].paused,true);
});
test('replay waits for the active message and only keeps the latest request',async()=>{
 const {n,audios}=setup();const first=n.say('one');const second=n.say('two',true);const replay=n.say('two',true);await tick();
 assert.equal(audios.length,1);audios[0].onended();await tick();assert.equal(audios.length,2);audios[1].onended();await Promise.all([first,second,replay]);
});
test('every recorded guide playlist completes in order with one audio at a time',async()=>{
 let live=0,maxLive=0;const played=[];
 class Audio{
  constructor(src){this.src=src;this.started=false}
  play(){this.started=true;live++;maxLive=Math.max(maxLive,live);played.push(this.src);setImmediate(()=>this.onended?.());return Promise.resolve()}
  pause(){if(this.started){live--;this.started=false}}
 }
 const n=makeNarrator({AudioClass:Audio,clips:audioClips,enabled:()=>true});
 for(const [text,urls] of Object.entries(audioClips)){const start=played.length;assert.equal(await n.say(text),'ended',text);assert.deepEqual(played.slice(start),urls,text)}
 assert.equal(live,0);assert.equal(maxLive,1);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeNarrator,afterNarration} from '../dist/narration.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('mute, replay, missing recordings and playback rejection resolve safely',async()=>{
 const audios=[],errors=[];let enabled=false,fail=false;
 class Audio{constructor(src){this.src=src;audios.push(this)}play(){return fail?Promise.reject(Error('blocked')):Promise.resolve()}pause(){this.paused=true}}
 const n=makeNarrator({AudioClass:Audio,clips:{Hi:['hello']},enabled:()=>enabled,onUnavailable:()=>errors.push('error')});
 assert.equal(await n.say('Hi'),'muted');assert.equal(audios.length,0);
 const forced=n.say('Hi',true);await tick();audios[0].onended();assert.equal(await forced,'ended');
 enabled=true;assert.equal(await n.say('missing'),'unavailable');fail=true;assert.equal(await n.say('Hi'),'unavailable');assert.equal(errors.length,2);
 fail=false;const retry=n.say('Hi',true);await tick();n.stop();assert.equal(await retry,'cancelled');
});
test('round waits for audio longer than animation and cancellation prevents a late transition',async()=>{
 let endSpeech,endAnimation,count=0;const speech=new Promise(r=>endSpeech=r);
 const cancel=afterNarration(()=>speech,'feedback',2000,()=>count++,{setTimer:f=>{endAnimation=f;return 1},clearTimer:()=>{}});
 endAnimation();await tick();assert.equal(count,0);endSpeech();await tick();assert.equal(count,1);cancel();
 let finish;const pending=new Promise(r=>finish=r);const c=afterNarration(()=>pending,'feedback',650,()=>count++,{setTimer:f=>{endAnimation=f;return 2},clearTimer:()=>{}});
 c();endAnimation();finish();await tick();assert.equal(count,1);
});
test('muted narration still allows the animation to finish first',async()=>{
 let timer,count=0;afterNarration(()=>Promise.resolve('muted'),'feedback',650,()=>count++,{setTimer:f=>{timer=f;return 1},clearTimer:()=>{}});
 await tick();assert.equal(count,0);timer();assert.equal(count,1);
});

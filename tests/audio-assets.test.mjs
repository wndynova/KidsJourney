import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activities,stories} from '../dist/model.mjs';
import {audioClips} from '../dist/audio-catalog.mjs';
import {artGuide} from '../dist/art.mjs';
test('every activity guide, hint and story page has bundled narration',()=>{
 for(const a of activities){assert.ok(audioClips[a.prompt],a.id+' prompt');assert.ok(audioClips[a.hint],a.id+' hint')}
 for(const s of stories)for(const [,text] of s.pages)assert.ok(audioClips[text],s.id+' page');
 for(const type of ['drawing','fill','number','mirror'])for(const level of ['preschool','kindergarten'])assert.ok(audioClips[artGuide(type,level)],type+' '+level+' guide');
});
test('every catalog audio exists and has an MP3 frame or ID3 header',()=>{
 for(const src of new Set(Object.values(audioClips).flat())){
  assert.match(src,/^audio\/[a-f0-9]+\.mp3$/);
  const b=fs.readFileSync(new URL('../dist/'+src,import.meta.url));
  assert.ok(b.length>500,src);assert.ok(b.subarray(0,3).toString()==='ID3'||(b[0]===255&&(b[1]&224)===224),src);
 }
});

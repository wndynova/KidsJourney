import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activities,stories,freshState,loadState,addProfile,complete} from '../dist/model.mjs';
import {newMiniGame,miniRound,miniMove} from '../dist/games.mjs';
import * as gallery from '../dist/gallery.mjs';

test('English curriculum matches pictures, answers and playable word tiles',()=>{
 assert.equal(activities.find(a=>a.id==='p-letter').answer,'A');
 assert.match(activities.find(a=>a.id==='p-letter').prompt,/apple/i);
 assert.equal(activities.find(a=>a.id==='k-word').answer,'Cat');
 for(const level of ['preschool','kindergarten']){
  let game=newMiniGame('word',level);
  for(let round=0;round<3;round++){
   const r=miniRound(game);assert.ok(['APPLE','BALL','SUN','CAT','DOG'].includes(r.word));
   assert.equal(r.tokens.join('')+(r.tail??''),r.word);
   for(const token of r.tokens){assert.ok(r.choices.includes(token));game=miniMove(game,{type:'pick',value:token});}
  }
  assert.equal(game.done,true);
 }
 for(const a of activities.filter(a=>a.kind==='choice'))assert.ok(a.options.includes(a.answer),a.id);
 assert.match(stories[0].pages[0][1],/seed/);
});

test('English update preserves existing profile, progress, story identity and gallery storage',()=>{
 const s=freshState();addProfile(s,'Alea','preschool','🐰');complete(s,'p-count',1);s.profiles[0].stories=['bunga'];
 const saved=JSON.stringify(s),loaded=loadState({getItem:()=>saved});assert.deepEqual(loaded,s);
 assert.equal(gallery.artworkTitle({title:'Karya 12'}),'Artwork 12');
 assert.equal(gallery.artworkTitle({title:'My sunflower'}),'My sunflower');
 assert.equal(gallery.artworkTitle({title:'Karya untuk Ayu'}),'Karya untuk Ayu');
});

test('document and install metadata declare English',()=>{
 assert.match(fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),/lang="en"/);
 assert.equal(JSON.parse(fs.readFileSync(new URL('../dist/manifest.webmanifest',import.meta.url))).lang,'en');
});

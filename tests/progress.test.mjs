import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,addProfile,complete,saveState,loadState,activities} from '../dist/model.mjs';
import {progressSummary} from '../dist/progress.mjs';
test('empty dashboard has bounded category totals and a useful recommendation',()=>{
 const s=freshState();assert.equal(progressSummary(s).profile,null);addProfile(s,'Ayu','preschool','🐰');
 const p=progressSummary(s);assert.equal(p.finished,0);assert.equal(p.total,14);assert.equal(p.artFinished,0);assert.equal(p.storyFinished,0);assert.equal(p.categories.reduce((n,c)=>n+c.total,0),14);assert.equal(p.suggestions.length,3);
});
test('dashboard counts distinct completions, art subset and unique stories for only the active profile',()=>{
 const s=freshState();addProfile(s,'Ayu','preschool','🐰');const first=s.active;
 complete(s,'p-count',1);complete(s,'p-count',1);complete(s,'p-art-drawing',2);s.profiles[0].stories=['bunga','bunga','unknown'];
 let p=progressSummary(s);assert.equal(p.finished,2);assert.equal(p.artFinished,1);assert.equal(p.storyFinished,1);assert.equal(p.categories.find(c=>c.name==='Numbers').finished,1);
 addProfile(s,'Bima','kindergarten','🐻');assert.equal(progressSummary(s).finished,0);complete(s,'k-art-number',1);assert.equal(progressSummary(s).artFinished,1);
 s.active=first;assert.equal(progressSummary(s).finished,2);assert.equal(s.profiles[0].progress['p-count'].runs,2);
});
test('changing level retains history but dashboard uses selected level; persistence restores the same summary',()=>{
 const s=freshState();addProfile(s,'Ayu','preschool','🐰');complete(s,'p-count',1);s.profiles[0].level='kindergarten';complete(s,'k-clock',1);
 const p=progressSummary(s);assert.equal(p.finished,1);assert.ok(p.suggestions.every(a=>a.level==='kindergarten'));assert.equal(p.total,14);
 let json;const storage={getItem:()=>json,setItem:(_,value)=>json=value};saveState(storage,s);assert.deepEqual(progressSummary(loadState(storage)),p);
});
test('unknown and invalid progress never inflate counts or leak another level',()=>{
 const s=freshState();addProfile(s,'Ayu','preschool','🐰');s.profiles[0].progress={'unknown':{runs:5},'p-count':{runs:0},'k-clock':{runs:3},'p-art-fill':{runs:2}};
 const p=progressSummary(s);assert.equal(p.finished,1);assert.equal(p.artFinished,1);assert.equal(p.categories.reduce((n,c)=>n+c.finished,0),1);
});

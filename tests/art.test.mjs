import test from 'node:test';
import assert from 'node:assert/strict';
import {artPalette,newArt,artMove,mirrorPoints,artComplete,artSvg,artGuide} from '../dist/art.mjs';
test('mirror reflects every point about the center including the center line',()=>{assert.deepEqual(mirrorPoints([{x:50,y:90},{x:300,y:0},{x:580,y:360}]),[{x:550,y:90},{x:300,y:0},{x:20,y:360}])});
test('drawing undo redo and erase preserve meaningful completion',()=>{
 let s=newArt('drawing','preschool');assert.equal(artComplete(s),false);
 s=artMove(s,{type:'stroke',points:[{x:50,y:50},{x:100,y:80}],color:'red',size:12});assert.equal(artComplete(s),true);
 s=artMove(s,{type:'undo'});assert.equal(artComplete(s),false);s=artMove(s,{type:'redo'});assert.equal(artComplete(s),true);
 const restored=s;s=artMove(s,{type:'clear'});assert.equal(artComplete(s),false);s=artMove(s,{type:'undo'});assert.deepEqual(s.strokes,restored.strokes);
});
test('number painting rejects a mismatched color and requires every region',()=>{
 let s=newArt('number','preschool');const r=s.regions[0];s=artMove(s,{type:'fill',id:r.id,color:artPalette.find(c=>c.id!==r.color).id});assert.equal(s.outcome,'wrong');assert.equal(artComplete(s),false);assert.equal(s.fills[r.id],undefined);
 for(const r of s.regions)s=artMove(s,{type:'fill',id:r.id,color:r.color});assert.equal(artComplete(s),true);
});
test('free fill accepts any palette color; twin fill colors paired wings',()=>{
 let s=newArt('fill','kindergarten');for(const r of s.regions)s=artMove(s,{type:'fill',id:r.id,color:'blue'});assert.equal(artComplete(s),true);
 s=newArt('mirror','preschool');s=artMove(s,{type:'fill',id:'left-top',color:'red'});assert.equal(s.fills['right-top'],'red');assert.equal(s.fills['left-top'],'red');
});
test('export contains self contained artwork and mirrored strokes; invalid input is ignored',()=>{
 let s=newArt('mirror','kindergarten');s=artMove(s,{type:'stroke',points:[{x:50,y:20},{x:80,y:40}],color:'blue',size:12});
 const svg=artSvg(s);assert.match(svg,/550,20/);assert.match(svg,/520,40/);assert.doesNotMatch(svg,/<script|href=["']https?:/);
 assert.deepEqual(artMove(s,{type:'stroke',points:[{x:NaN,y:2}],color:'red',size:12}).strokes,s.strokes);
 assert.deepEqual(artMove(s,{type:'fill',id:'unknown',color:'red'}).fills,s.fills);
 for(const type of ['drawing','fill','number','mirror'])assert.ok(artGuide(type,'preschool').length>20);
});

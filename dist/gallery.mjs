import {newArt,artPalette} from './art.mjs';
import {activities} from './model.mjs';
const ART_TYPES=['drawing','fill','number','mirror'];
export function packArt(state){
 return {version:1,type:state.type,level:state.level,strokes:state.strokes.map(s=>({color:s.color,size:s.size,points:s.points.map(p=>[Math.round(p.x*100)/100,Math.round(p.y*100)/100])})),fills:{...state.fills}};
}
export function unpackArt(data){
 try{
  if(data?.version!==1||!ART_TYPES.includes(data.type)||!['preschool','kindergarten'].includes(data.level)||!Array.isArray(data.strokes)||data.strokes.length>300||!data.fills||typeof data.fills!=='object'||Array.isArray(data.fills))return null;
  const state=newArt(data.type,data.level),colors=artPalette.map(c=>c.id);
  if(!['drawing','mirror'].includes(data.type)&&data.strokes.length)return null;
  for(const stroke of data.strokes){
   if(![...colors,'erase'].includes(stroke?.color)||!Number.isFinite(stroke.size)||stroke.size<4||stroke.size>40||!Array.isArray(stroke.points)||!stroke.points.length||stroke.points.length>1200)return null;
   const points=[];for(const p of stroke.points){if(!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<0||p[0]>600||p[1]<0||p[1]>360)return null;points.push({x:p[0],y:p[1]})}
   state.strokes.push({color:stroke.color,size:stroke.size,points});
  }
  for(const [id,color] of Object.entries(data.fills)){const region=state.regions.find(r=>r.id===id);if(!region||!colors.includes(color)||(state.type==='number'&&region.color!==color))return null;state.fills[id]=color}
  if(state.type==='mirror')for(const region of state.regions)if(region.pair&&state.fills[region.id]!==state.fills[region.pair])return null;
  return state;
 }catch{return null}
}
export function makeGalleryStore(storage){
 const key=id=>'taman-main-art-v1:'+encodeURIComponent(id);
 const validProfile=id=>typeof id==='string'&&id.length>0&&id.length<=200;
 function validItem(item,profileId){
  const activity=activities.find(a=>a.id===item?.activityId&&a.isArt);
  return item?.version===1&&item.profileId===profileId&&typeof item.id==='string'&&item.id.length>0&&item.id.length<=200&&typeof item.title==='string'&&item.title.length<=80&&Number.isInteger(item.revision)&&item.revision>0&&Number.isFinite(item.createdAt)&&Number.isFinite(item.updatedAt)&&activity&&item.data?.type===activity.game&&item.data?.level===activity.level&&unpackArt(item.data);
 }
 function list(profileId){
  if(!validProfile(profileId))return {ok:false,items:[],reason:'profile'};
  try{const raw=storage.getItem(key(profileId));const items=raw===null?[]:JSON.parse(raw);if(!Array.isArray(items))throw Error('corrupt');const valid=items.filter(item=>validItem(item,profileId));const ids=new Set(valid.map(i=>i.id));return {ok:valid.length===items.length&&ids.size===items.length,items:valid.sort((a,b)=>b.updatedAt-a.updatedAt),reason:valid.length!==items.length||ids.size!==items.length?'corrupt':null}}catch{return {ok:false,items:[],reason:'unavailable'}}
 }
 function get(profileId,id){return list(profileId).items.find(i=>i.id===id)??null}
 function save(profileId,activityId,state,{id=null,revision=null}={}){
  const before=list(profileId);if(!before.ok)return {ok:false,reason:before.reason};
  const activity=activities.find(a=>a.id===activityId&&a.isArt);if(!activity||state.type!==activity.game||state.level!==activity.level)return {ok:false,reason:'invalid'};
  const data=packArt(state);if(!unpackArt(data))return {ok:false,reason:'invalid'};
  if(!data.strokes.length&&!Object.keys(data.fills).length)return {ok:false,reason:'empty'};
  const existing=id?before.items.find(i=>i.id===id):null;if(id&&(!existing||existing.revision!==revision||existing.activityId!==activityId))return {ok:false,reason:'conflict'};
  if(existing&&JSON.stringify(existing.data)===JSON.stringify(data))return {ok:true,item:existing};
  const now=Date.now();const item={version:1,id:existing?.id??(globalThis.crypto?.randomUUID?.()??'art-'+now+'-'+Math.random().toString(36).slice(2)),profileId,activityId,title:existing?.title??'Artwork '+(before.items.length+1),revision:(existing?.revision??0)+1,createdAt:existing?.createdAt??now,updatedAt:now,data};
  const items=[item,...before.items.filter(i=>i.id!==item.id)];
  try{storage.setItem(key(profileId),JSON.stringify(items));return {ok:true,item}}catch{return {ok:false,reason:'storage'}}
 }
 function removeProfile(profileId){if(!validProfile(profileId))return {ok:false,reason:'profile'};try{storage.removeItem(key(profileId));return {ok:true}}catch{return {ok:false,reason:'storage'}}}
 return {list,get,save,removeProfile};
}
export function makeArtAutosaver(write,onStatus=()=>{},{setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let timer=null,pending=null,dirty=false,closed=false;
 function flush(){clearTimer(timer);timer=null;if(!dirty||!pending)return {ok:true};const result=write(pending);if(result.ok)dirty=false;onStatus({state:result.ok?'saved':'error',result});return result}
 function change(state){if(closed)return;clearTimer(timer);if(!state.strokes.length&&!Object.keys(state.fills).length){pending=null;dirty=false;onStatus({state:'empty'});return}pending=state;dirty=true;onStatus({state:'pending'});timer=setTimer(()=>{if(!closed)flush()},350)}
 function dispose(){const result=flush();closed=true;return result}
 return {change,flush,dispose};
}

// Translate only the legacy generated title; never rewrite a custom title or stored record.
export function artworkTitle(item){return item.title.replace(/^Karya (?=\d+$)/,'Artwork ')}

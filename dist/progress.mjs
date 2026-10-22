import {activities,stories,activeProfile,recommend} from './model.mjs';
export function progressSummary(state){
 const profile=activeProfile(state)??null;
 const available=profile?activities.filter(a=>a.level===profile.level):[];
 const has=a=>Number.isInteger(profile?.progress?.[a.id]?.runs)&&profile.progress[a.id].runs>0;
 const finished=available.filter(has);
 const categories=[['Language','Aa','lavender'],['Numbers','123','yellow'],['Thinking','◇','sky'],['Creativity','〰','mint'],['Feelings','♡','pink']].map(([name,icon,color])=>{
  const items=available.filter(a=>a.category===name);return {name,icon,color,total:items.length,finished:items.filter(has).length};
 });
 return {profile,level:profile?.level??null,finished:finished.length,total:available.length,artFinished:finished.filter(a=>a.isArt).length,artTotal:available.filter(a=>a.isArt).length,storyFinished:stories.filter(s=>profile?.stories?.includes(s.id)).length,storyTotal:stories.length,categories,suggestions:profile?recommend(state):[]};
}

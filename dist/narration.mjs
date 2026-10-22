// Keep one active message and only the newest pending response to fast input.
export function makeNarrator({AudioClass=Audio,clips,enabled,onUnavailable=()=>{},onPlaying=()=>{},attach=()=>{}}){
 let active=null,pending=null,current=null,watchdog=null;
 function clearAudio(){clearTimeout(watchdog);watchdog=null;if(current){current.pause();current.onended=null;current.onerror=null;current.remove?.();current=null}}
 function stop(){const old=active;active=null;clearAudio();old?.resolve('cancelled');pending?.resolve('cancelled');pending=null}
 function finish(job,status){if(active!==job)return;clearAudio();active=null;job.resolve(status);const next=pending;pending=null;if(next)start(next)}
 function playAt(job,index){
  if(active!==job)return;
  clearAudio();const audio=new AudioClass(job.urls[index]);current=audio;audio.volume=.9;attach(audio);
  const fail=()=>{if(active!==job||current!==audio)return;onUnavailable(job.force);finish(job,'unavailable')};
  audio.onended=()=>{if(active!==job||current!==audio)return;if(index+1<job.urls.length)playAt(job,index+1);else finish(job,'ended')};
  audio.onerror=fail;
  watchdog=setTimeout(fail,30000);
  try{Promise.resolve(audio.play()).then(()=>{if(active===job&&current===audio)onPlaying()},fail)}catch{fail()}
 }
 function start(job){active=job;playAt(job,0)}
 function say(text,force=false){
  if(!force&&!enabled())return Promise.resolve('muted');
  const urls=clips[text];if(!urls?.length){onUnavailable(force);return Promise.resolve('unavailable')}
  return new Promise(resolve=>{const job={urls,force,resolve};if(active){pending?.resolve('superseded');pending=job}else start(job)});
 }
 return {say,stop};
}
// A round needs both the animation delay and the complete recording.
export function afterNarration(speak,text,delay,onDone,{setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let cancelled=false,elapsed=false,spoken=false;
 const finish=()=>{if(!cancelled&&elapsed&&spoken){cancelled=true;onDone()}};
 const timer=setTimer(()=>{elapsed=true;finish()},delay);
 Promise.resolve(speak(text)).then(()=>{spoken=true;finish()},()=>{spoken=true;finish()});
 return ()=>{cancelled=true;clearTimer(timer)};
}

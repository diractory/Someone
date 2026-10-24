var Voice={
 rec:null,on:false,muted:false,speaking:false,lang:"en-IN",onText:null,onState:null,level:null,ctx:null,warned:false,
 SR:window.SpeechRecognition||window.webkitSpeechRecognition,
 state:function(s){if(this.onState)this.onState(s)},
 start:function(){
  if(!this.SR){this.state("nosr");return}
  this.on=true;
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC&&!this.ctx)this.ctx=new AC();if(this.ctx&&this.ctx.resume)this.ctx.resume()}catch(e){}
  try{if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}}catch(e){}
  this.listen();
 },
 listen:function(){
  var me=this;
  if(!me.on||me.muted||me.speaking||me.rec||!me.SR)return;
  var r=new me.SR();me.rec=r;r.lang=me.lang;r.continuous=true;r.interimResults=false;
  r.onstart=function(){me.state("listening")};
  r.onresult=function(e){var res=e.results[e.results.length-1];if(res.isFinal){var t=res[0].transcript.trim();if(t&&me.onText)me.onText(t)}};
  r.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){me.on=false;me.state("blocked")}};
  r.onend=function(){me.rec=null;if(me.on&&!me.muted&&!me.speaking)setTimeout(function(){me.listen()},350)};
  try{r.start()}catch(e){me.rec=null}
 },
 stop:function(){if(this.rec){var r=this.rec;this.rec=null;try{r.onend=null;r.abort()}catch(e){}}},
 setMuted:function(m){this.muted=m;if(m){this.stop();this.state("muted")}else this.listen()},
 finish:function(){var me=this;me.speaking=false;me.level=null;me.state("idle");setTimeout(function(){me.listen()},400)},
 pick:function(t){
  var vs=speechSynthesis.getVoices()||[],L=/[\u0900-\u097F]/.test(t)?/^hi/i:/^en/i;
  var good=/natural|neural|online|google uk english female|google us english|aria|jenny|neerja|swara|samantha|zira|female/i;
  return vs.find(function(v){return L.test(v.lang)&&good.test(v.name)})||vs.find(function(v){return L.test(v.lang)})||null;
 },
 eleven:async function(text,key,mood){
  var me=this,id=S.get("v_elvoice")||"EXAVITQu4vr4xnSDxMaL";
  var r=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(id),{method:"POST",headers:{"Content-Type":"application/json","xi-api-key":key},body:JSON.stringify({text:text,model_id:"eleven_flash_v2_5",voice_settings:{stability:0.35,similarity_boost:0.8,style:0.5}})});
  if(!r.ok)throw new Error("HTTP "+r.status);
  var ab=await r.arrayBuffer();
  if(!me.ctx)throw new Error("no audio");
  await me.ctx.resume();
  var buf=await me.ctx.decodeAudioData(ab),src=me.ctx.createBufferSource(),an=me.ctx.createAnalyser(),d;
  an.fftSize=256;d=new Uint8Array(an.fftSize);src.buffer=buf;src.playbackRate.value=(mood==="mad"?1.08:(mood==="shy"?0.95:1));
  src.connect(an);an.connect(me.ctx.destination);
  var iv=setInterval(function(){an.getByteTimeDomainData(d);var s=0;for(var i=0;i<d.length;i++){var x=(d[i]-128)/128;s+=x*x}me.level=Math.min(1,Math.sqrt(s/d.length)*5)},60);
  src.onended=function(){clearInterval(iv);me.finish()};
  src.start();
 },
 browser:function(text,mood){
  var me=this;
  if(!window.speechSynthesis){me.finish();return}
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text),v=me.pick(text);
  if(v){u.voice=v;u.lang=v.lang}
  u.pitch=1.4;u.rate=mood==="mad"?1.12:(mood==="shy"?.92:1.02);
  u.onend=u.onerror=function(){me.finish()};
  speechSynthesis.speak(u);
 },
 speak:async function(text,mood){
  var me=this,key=S.get("v_el")||"";
  me.stop();me.speaking=true;me.state("speaking");
  if(key){
   try{await me.eleven(text,key,mood);return}
   catch(e){if(!me.warned){me.warned=true;me.state("elfail")}}
  }
  me.browser(text,mood);
 }
};

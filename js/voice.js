var Voice={
 rec:null,on:false,muted:false,speaking:false,lang:"en-IN",onText:null,onState:null,level:null,ctx:null,warned:false,unlocked:false,pending:null,
 SR:window.SpeechRecognition||window.webkitSpeechRecognition,
 state:function(s){if(this.onState)this.onState(s)},
 start:function(){
  if(!this.SR&&!(window.Ear&&Ear.ok())){this.state("nosr");return}
  this.on=true;this.listen();
 },
 fallback:function(){this.state("earfail");this.listen()},
 unlock:function(){
  var me=this;
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC&&!me.ctx)me.ctx=new AC();if(me.ctx&&me.ctx.resume)me.ctx.resume()}catch(e){}
  try{if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}}catch(e){}
  me.unlocked=true;
  if(me.pending){var p=me.pending;me.pending=null;me.speak(p[0],p[1])}
 },
 plain:function(t){return t.replace(/\[(giggles?|chuckles)\]/gi,"hehe, ").replace(/\[(laughs[^\]]*|starts laughing)\]/gi,"haha, ").replace(/\[(sighs|exhales)\]/gi,"hmm, ").replace(/\[gasps?\]/gi,"oh! ").replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim()},
 fix:function(t){return t.replace(/\b(jey|hay|hei)\b/gi,"hey").replace(/\b(veronika|varonica|veronic|weronica|beronica)\b/gi,"Veronica")},
 rate:function(m){return({mad:1.12,excited:1.1,surprised:1.1,nervous:1.08,playful:1.06,jealous:1.05,annoyed:1.05,hopeful:.98,grateful:.96,love:.94,embarrassed:.93,shy:.92,guilty:.92,sad:.9,hurt:.9,lonely:.9,cozy:.9,bored:.88,sleepy:.86,worried:.95,caring:.94,tender:.92,protective:1,admiring:1.04,determined:1.04,relieved:.96,disappointed:.9,amused:1.06,insecure:.92,content:.94})[m]||1},
 listen:function(){
  var me=this;
  if(!me.on||me.muted||me.speaking)return;
  if(window.Ear&&Ear.ok()){if(me.rec){var r0=me.rec;me.rec=null;try{r0.onend=null;r0.abort()}catch(e){}}Ear.start();return}
  if(me.rec||!me.SR)return;
  var r=new me.SR();me.rec=r;r.lang=me.lang;r.continuous=true;r.interimResults=false;r.maxAlternatives=3;
  r.onstart=function(){me.state("listening")};
  r.onresult=function(e){var res=e.results[e.results.length-1];if(res.isFinal){var b=res[0];for(var k=1;k<res.length;k++)if(res[k].confidence>b.confidence)b=res[k];var t=b.transcript.trim();if(t&&me.onText)me.onText(t)}};
  r.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){me.on=false;me.state("blocked")}};
  r.onend=function(){me.rec=null;if(me.on&&!me.muted&&!me.speaking)setTimeout(function(){me.listen()},350)};
  try{r.start()}catch(e){me.rec=null}
 },
 stop:function(){if(window.Ear){Ear.on=false;Ear.reset()}if(this.rec){var r=this.rec;this.rec=null;try{r.onend=null;r.abort()}catch(e){}}},
 setMuted:function(m){this.muted=m;if(m){this.stop();this.state("muted")}else this.listen()},
 interrupt:function(){var me=this;try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}if(me.src){var s=me.src;me.src=null;try{s.onended=null;s.stop()}catch(e){}}if(me.speaking)me.finish()},
 elKeys:function(){return(S.get("v_el")||"").split(/\s+/).filter(function(k){return k.length>15})},
 elIdx:0,elCool:{},
 finish:function(){var me=this;clearInterval(me.iv);me.src=null;me.speaking=false;me.level=null;me.state("idle");setTimeout(function(){me.listen()},400)},
 pick:function(t){
  var vs=speechSynthesis.getVoices()||[],L=/[\u0900-\u097F]/.test(t)?/^hi/i:/^en/i;
  var sv=S.get("v_voice");if(sv){var fv=vs.find(function(v){return v.name===sv});if(fv)return fv}
  var good=/natural|neural|online|google uk english female|google us english|aria|jenny|neerja|swara|samantha|zira|female/i;
  return vs.find(function(v){return L.test(v.lang)&&good.test(v.name)})||vs.find(function(v){return L.test(v.lang)})||null;
 },
 eleven:async function(text,key,mood){
  var me=this,id=S.get("v_elvoice")||"EXAVITQu4vr4xnSDxMaL";
  var r=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+encodeURIComponent(id),{method:"POST",headers:{"Content-Type":"application/json","xi-api-key":key},body:JSON.stringify({text:text,model_id:"eleven_v3",voice_settings:{stability:0.5}})});
  if(!r.ok)throw new Error("HTTP "+r.status);
  var ab=await r.arrayBuffer();
  if(!me.ctx)throw new Error("no audio");
  await me.ctx.resume();
  var buf=await me.ctx.decodeAudioData(ab),src=me.ctx.createBufferSource(),an=me.ctx.createAnalyser(),d;
  an.fftSize=256;d=new Uint8Array(an.fftSize);src.buffer=buf;src.playbackRate.value=Math.min(1.1,Math.max(0.9,me.rate(mood)));
  src.connect(an);an.connect(me.ctx.destination);
  var iv=me.iv=setInterval(function(){an.getByteTimeDomainData(d);var s=0;for(var i=0;i<d.length;i++){var x=(d[i]-128)/128;s+=x*x}me.level=Math.min(1,Math.sqrt(s/d.length)*5)},60);
  src.onended=function(){clearInterval(iv);me.finish()};
  me.src=src;src.start();
 },
 browser:function(text,mood){
  var me=this;
  if(!window.speechSynthesis){me.finish();return}
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(me.plain(text)),v=me.pick(text);
  if(v){u.voice=v;u.lang=v.lang}
  u.pitch=parseFloat(S.get("v_pitch"))||1.4;u.rate=me.rate(mood)*1.02;
  u.onend=u.onerror=function(){me.finish()};
  speechSynthesis.speak(u);
 },
 speak:async function(text,mood){
  var me=this,ks=me.elKeys();
  if(!me.unlocked){me.pending=[text,mood];me.state("needtap");return}
  me.stop();me.speaking=true;me.state("speaking");
  for(var i=0;i<ks.length;i++){
   var k=ks[(me.elIdx+i)%ks.length];if((me.elCool[k]||0)>Date.now())continue;
   try{await me.eleven(text,k,mood);me.elIdx=(me.elIdx+i)%ks.length;return}
   catch(e){me.elCool[k]=Date.now()+(/40[12]|429/.test(String(e.message))?900000:60000)}
  }
  if(ks.length&&!me.warned){me.warned=true;me.state("elfail")}
  me.browser(text,mood);
 }
};

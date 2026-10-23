var Voice={
 rec:null,on:false,muted:false,speaking:false,lang:"en-IN",onText:null,onState:null,
 SR:window.SpeechRecognition||window.webkitSpeechRecognition,
 state:function(s){if(this.onState)this.onState(s)},
 start:function(){
  if(!this.SR){this.state("nosr");return}
  this.on=true;
  try{if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}}catch(e){}
  this.listen();
 },
 listen:function(){
  var me=this;
  if(!me.on||me.muted||me.speaking||me.rec||!me.SR)return;
  var r=new me.SR();me.rec=r;r.lang=me.lang;r.continuous=true;r.interimResults=false;
  r.onstart=function(){me.state("listening")};
  r.onresult=function(e){
   var res=e.results[e.results.length-1];
   if(res.isFinal){var t=res[0].transcript.trim();if(t&&me.onText)me.onText(t)}
  };
  r.onerror=function(e){
   if(e.error==="not-allowed"||e.error==="service-not-allowed"){me.on=false;me.state("blocked")}
  };
  r.onend=function(){me.rec=null;if(me.on&&!me.muted&&!me.speaking)setTimeout(function(){me.listen()},350)};
  try{r.start()}catch(e){me.rec=null}
 },
 stop:function(){if(this.rec){var r=this.rec;this.rec=null;try{r.onend=null;r.abort()}catch(e){}}},
 setMuted:function(m){this.muted=m;if(m){this.stop();this.state("muted")}else this.listen()},
 pick:function(t){
  var vs=speechSynthesis.getVoices()||[],L=/[\u0900-\u097F]/.test(t)?/^hi/i:/^en/i;
  var pref=/female|zira|samantha|aria|jenny|heera|neerja|swara|google uk english female|google us english|karen|tessa|moira/i;
  return vs.find(function(v){return L.test(v.lang)&&pref.test(v.name)})||vs.find(function(v){return L.test(v.lang)})||null;
 },
 speak:function(text,mood){
  var me=this;
  if(!window.speechSynthesis){return}
  speechSynthesis.cancel();me.stop();me.speaking=true;me.state("speaking");
  var u=new SpeechSynthesisUtterance(text),v=me.pick(text);
  if(v){u.voice=v;u.lang=v.lang}
  u.pitch=1.25;u.rate=mood==="mad"?1.12:(mood==="shy"?.92:1);
  var done=function(){me.speaking=false;me.state("idle");setTimeout(function(){me.listen()},400)};
  u.onend=done;u.onerror=done;
  speechSynthesis.speak(u);
 }
};

var DB={
 open:function(){return new Promise(function(res,rej){var r=indexedDB.open("veronica",1);r.onupgradeneeded=function(){r.result.createObjectStore("v")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})},
 put:async function(k,v){var d=await this.open();return new Promise(function(res,rej){var t=d.transaction("v","readwrite");t.objectStore("v").put(v,k);t.oncomplete=res;t.onerror=function(){rej(t.error)}})},
 get:async function(k){var d=await this.open();return new Promise(function(res,rej){var q=d.transaction("v").objectStore("v").get(k);q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)}})}
};
var Face={
 amt:0,tgt:0,cur:"calm",urls:{},
 set:function(src){var f=$("face");if(src){f.src=src;f.style.display="";$("empty").style.display="none"}},
 loadVids:async function(){
  var me=this;
  for(var s of["idle","talk","angry","happy"]){
   try{var b=await DB.get("vid_"+s);if(b){if(me.urls[s])URL.revokeObjectURL(me.urls[s]);me.urls[s]=URL.createObjectURL(b)}}catch(e){}
  }
  if(Object.keys(me.urls).length)$("empty").style.display="none";
  me.update();
 },
 saveVid:async function(slot,file){await DB.put("vid_"+slot,file);await this.loadVids()},
 update:function(){
  var u=this.urls,v=$("vid"),sl,m=this.cur;
  if(!(u.idle||u.talk||u.angry||u.happy)){v.style.display="none";return}
  if(Voice.speaking)sl=(/^(mad|pout|jealous|annoyed)$/.test(m)&&u.angry)?"angry":(/^(happy|laugh|excited|proud|love|playful|hopeful|grateful|surprised|amused|content|relieved|determined|tender|admiring)$/.test(m)&&u.happy)?"happy":(u.talk?"talk":"idle");
  else sl="idle";
  var src=u[sl]||u.idle||u.talk||u.happy||u.angry;
  if(v.getAttribute("data-s")!==src){v.setAttribute("data-s",src);v.src=src}
  v.style.display="";var p=v.play();if(p&&p.catch)p.catch(function(){});
 },
 mood:function(m){
  var EM=this.EM,e=EM[m];this.theme(m);$("stage").classList.toggle("tremble",m==="nervous");$("stage").classList.toggle("sulk",/^(jealous|pout|annoyed|hurt)$/.test(m));
  this.cur=m;$("fx").className=m;$("stage").classList.toggle("laugh",m==="laugh");this.update();
  if(!e)return;
  for(var i=0;i<3;i++)setTimeout(function(){var s=document.createElement("span");s.className="fl";s.textContent=e;s.style.left=(15+Math.random()*70)+"%";$("stage").appendChild(s);setTimeout(function(){s.remove()},2300)},i*350);
 },
 fxClass:function(c,ms){var s=$("stage");s.classList.add(c);setTimeout(function(){s.classList.remove(c)},ms)},
 pop:function(e,n){for(var i=0;i<n;i++)setTimeout(function(){var s=document.createElement("span");s.className="fl";s.textContent=e;s.style.left=(15+Math.random()*70)+"%";$("stage").appendChild(s);setTimeout(function(){s.remove()},2300)},i*300)},
 blush:function(){this.fxClass("blushing",1800);this.pop("😳",1);if(navigator.vibrate)navigator.vibrate(15)},
 giggle:function(){this.fxClass("giggling",600);this.pop("😊",1);if(navigator.vibrate)navigator.vibrate([12,30,12])},
 wink:function(){this.pop("😉",1)},
 startSpeakFx:function(m){
  var me=this;me.stopSpeakFx();
  me.fxt=setInterval(function(){
   var r=Math.random();
   if(/^(shy|love|embarrassed|grateful|cozy|tender|admiring|caring)$/.test(m)){if(r<.6)me.blush();else me.pop("💗",1)}
   else if(/^(laugh|happy|excited|playful|surprised|hopeful|amused|content|relieved|determined)$/.test(m)){if(r<.55)me.giggle();else if(r<.8)me.pop("✨",1);else me.wink()}
   else if(/^(jealous|pout|mad|annoyed)$/.test(m)){if(r<.5)me.pop("💢",1);else me.fxClass("giggling",500)}
   else if(m==="proud")me.pop("🌟",1);
   else if(m==="curious")me.pop("❓",1);
   else if(/^(sleepy|bored)$/.test(m))me.pop("💤",1);
   else if(/^(worried|sad|hurt|lonely|nervous|guilty|disappointed|insecure)$/.test(m))me.pop("💧",1);
   else if(r<.3)me.wink();else if(r<.55)me.blush();
  },1500+Math.random()*1000);
 },
 stopSpeakFx:function(){clearInterval(this.fxt)},
 EM:{happy:"💗",excited:"✨",shy:"😳",laugh:"😂",love:"💕",proud:"🌟",curious:"❓",worried:"🥺",sleepy:"💤",sad:"💧",pout:"😤",jealous:"😒",mad:"💢",surprised:"😲",playful:"😜",hurt:"💔",lonely:"🌙",grateful:"🙏",nervous:"😬",hopeful:"🌈",annoyed:"😑",cozy:"☕",bored:"🥱",embarrassed:"🙈",guilty:"😞",caring:"🤗",protective:"🛡️",admiring:"😍",determined:"💪",relieved:"😅",disappointed:"😔",amused:"😄",tender:"🥰",insecure:"😟",content:"😊"},
 COL:{calm:"#6ea8ff",happy:"#ff5fa2",excited:"#e0891a",shy:"#ff6b9a",laugh:"#e5892c",love:"#ff3d8b",proud:"#cf8f12",curious:"#4f9be8",worried:"#7b86c9",sleepy:"#6a5acd",sad:"#4a6fd0",pout:"#e4577c",jealous:"#3fae6a",mad:"#e53950",surprised:"#19a9bd",playful:"#ff7a45",hurt:"#7a5aa8",lonely:"#5a78b8",grateful:"#e0759a",nervous:"#8a78c8",hopeful:"#2fb8a0",annoyed:"#d4682a",cozy:"#c7835a",bored:"#7d8898",embarrassed:"#ff5c7a",guilty:"#8a6fbd",caring:"#d98c5f",protective:"#4f8fd6",admiring:"#ff6fae",determined:"#e8742a",relieved:"#46b39a",disappointed:"#6f7fa8",amused:"#f0a63a",tender:"#ff7fa8",insecure:"#8f86c9",content:"#5fb98a"},
 emoji:function(m){return this.EM[m]||""},
 theme:function(m){
  document.documentElement.style.setProperty("--pk",this.COL[m]||"#ff5fa2");
  $("chipe").textContent=this.EM[m]||"😌";$("chipn").textContent=m;
  var c=$("chip");c.classList.remove("pop");void c.offsetWidth;c.classList.add("pop");
 },
 init:function(){
  var me=this;
  setInterval(function(){me.tgt=Voice.speaking?(Voice.level!=null?Voice.level:0.2+Math.random()*0.8):0},70);
  (function loop(){
   me.amt+=(me.tgt-me.amt)*0.35;document.documentElement.style.setProperty("--lv",me.amt.toFixed(2));
   var f=$("face");
   if(f.style.display!=="none"&&!$("stage").classList.contains("laugh"))f.style.transform=me.amt>0.03?"scale("+(1+me.amt*0.022).toFixed(4)+") translateY("+(me.amt*2).toFixed(1)+"px)":"";
   requestAnimationFrame(loop);
  })();
  me.loadVids();
 }
};

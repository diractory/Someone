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
  if(Voice.speaking)sl=((m==="mad"||m==="pout")&&u.angry)?"angry":((m==="happy"||m==="laugh")&&u.happy)?"happy":(u.talk?"talk":"idle");
  else sl="idle";
  var src=u[sl]||u.idle||u.talk||u.happy||u.angry;
  if(v.getAttribute("data-s")!==src){v.setAttribute("data-s",src);v.src=src}
  v.style.display="";var p=v.play();if(p&&p.catch)p.catch(function(){});
 },
 mood:function(m){
  var EM={happy:"💗",shy:"😳",laugh:"😂",pout:"😤",mad:"💢",sad:"💧"},e=EM[m];
  this.cur=m;$("fx").className=m;$("stage").classList.toggle("laugh",m==="laugh");this.update();
  if(!e)return;
  for(var i=0;i<3;i++)setTimeout(function(){var s=document.createElement("span");s.className="fl";s.textContent=e;s.style.left=(15+Math.random()*70)+"%";$("stage").appendChild(s);setTimeout(function(){s.remove()},2300)},i*350);
 },
 init:function(){
  var me=this;
  setInterval(function(){me.tgt=Voice.speaking?(Voice.level!=null?Voice.level:0.2+Math.random()*0.8):0},70);
  (function loop(){
   me.amt+=(me.tgt-me.amt)*0.35;
   var f=$("face");
   if(f.style.display!=="none"&&!$("stage").classList.contains("laugh"))f.style.transform=me.amt>0.03?"scale("+(1+me.amt*0.022).toFixed(4)+") translateY("+(me.amt*2).toFixed(1)+"px)":"";
   requestAnimationFrame(loop);
  })();
  me.loadVids();
 }
};

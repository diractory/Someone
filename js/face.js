var Face={
 amt:0,tgt:0,
 set:function(src){var f=$("face");if(src){f.src=src;f.style.display="";$("empty").style.display="none"}},
 mood:function(m){
  var EM={happy:"💗",shy:"😳",laugh:"😂",pout:"😤",mad:"💢",sad:"💧"},e=EM[m];
  $("fx").className=m;$("stage").classList.toggle("laugh",m==="laugh");
  if(!e)return;
  for(var i=0;i<3;i++)setTimeout(function(){var s=document.createElement("span");s.className="fl";s.textContent=e;s.style.left=(15+Math.random()*70)+"%";$("stage").appendChild(s);setTimeout(function(){s.remove()},2300)},i*350);
 },
 init:function(){
  var me=this;
  setInterval(function(){me.tgt=Voice.speaking?0.2+Math.random()*0.8:0},90);
  (function loop(){
   me.amt+=(me.tgt-me.amt)*0.3;
   var f=$("face");
   if(f.style.display!=="none"&&!$("stage").classList.contains("laugh"))f.style.transform=me.amt>0.03?"scale("+(1+me.amt*0.022).toFixed(4)+") translateY("+(me.amt*2).toFixed(1)+"px)":"";
   requestAnimationFrame(loop);
  })();
 }
};

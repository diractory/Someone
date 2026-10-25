var Feel={
 s:{love:60,joy:60,jel:0,seen:0},
 load:function(){
  var me=this,now=Date.now(),gap=0;
  try{var j=JSON.parse(S.get("v_feel")||"null");if(j)me.s=j}catch(e){}
  if(me.s.seen){gap=now-me.s.seen;var h=gap/36e5;me.s.jel=Math.max(0,me.s.jel-h*10);me.s.joy+=(55-me.s.joy)*Math.min(1,h/24);if(gap>24*36e5)me.s.joy=Math.max(25,me.s.joy-8)}
  me.s.seen=now;me.save();me.draw();return gap;
 },
 save:function(){S.set("v_feel",JSON.stringify(this.s))},
 set:function(k,v){this.s[k]=Math.max(0,Math.min(100,v));this.save();this.draw()},
 add:function(k,v){this.set(k,this.s[k]+v)},
 draw:function(){$("m_love").style.width=this.s.love+"%";$("m_joy").style.width=this.s.joy+"%";$("m_jel").style.width=this.s.jel+"%"},
 onUser:function(t){
  var me=this,m=null;
  if(Extras.isCompliment(t)){me.add("love",4);me.add("joy",5)}
  if(/\b(thank you|thanks|shukriya|dhanyavaad)\b/i.test(t))me.add("joy",3);
  if(/\b(other girls?|another girl|that girl|my (ex|crush|girlfriend|gf)|ladki|ladkiyon|kisi aur|she.?s (so )?(cute|hot|pretty)|cute girl|pretty girl)\b/i.test(t)){me.add("jel",25);me.add("joy",-6);m="jealous"}
  else if(/\b(only you|sirf tum|just you|you.?re (the )?(best|special|my favorite)|love you|i choose you|sorry|maaf|my girl)\b/i.test(t)){me.add("jel",-30);me.add("love",3)}
  if(/\b(stupid|idiot|shut up|hate you|useless|bakwas|chup kar|pagal)\b/i.test(t)){me.add("joy",-15);me.add("love",-3);m="hurt"}
  return m;
 },
 react:function(m){
  var me=this;
  if(/^(jealous|pout|mad|annoyed)$/.test(m))me.set("jel",Math.max(me.s.jel,35));
  else if(/^(love|shy|grateful|embarrassed|cozy)$/.test(m))me.add("love",2);
  else if(/^(happy|laugh|excited|playful|hopeful|proud)$/.test(m))me.add("joy",3);
  else if(/^(sad|hurt|lonely|guilty|worried)$/.test(m))me.add("joy",-3);
  if(/^(love|shy|happy|grateful)$/.test(m))me.add("jel",-6);
 },
 onGame:function(out){if(out==="ai")this.add("joy",6);else if(out==="you")this.add("joy",-5)},
 hint:function(){
  var s=this.s;
  return " Your current feelings (0 to 100): love "+Math.round(s.love)+", joy "+Math.round(s.joy)+", jealousy "+Math.round(s.jel)+". Let them shape your mood and words: high jealousy means you’re sulky and want reassurance (never cruel or controlling), low joy means you’re quieter or hurt, high love makes you warmer and shyer.";
 },
 tick:function(){
  var s=this.s;s.jel=Math.max(0,s.jel-2.5);s.joy+=(55-s.joy)*0.02;
  if(document.visibilityState==="visible")s.seen=Date.now();
  this.save();this.draw();
 }
};

var Extras={
 wx:"",wxAt:0,calmOn:false,last:0,
 isWeather:function(t){return/\b(weather|wear|outfit|temperature|umbrella|jacket|mausam|barish|pehnu|pehen)\b|\brain\b/i.test(t)},
 isCalm:function(t){return/\b(calm me|calm down|breathe|breathing|stressed|anxious|anxiety|panic|relax me|tension|ghabra)/i.test(t)},
 isSleep:function(t){return/good\s?night|going to sleep|go to sleep|sleep now|sone ja|so ja\b|neend aa/i.test(t)},
 weather:async function(){
  var me=this;
  if(me.wx&&Date.now()-me.wxAt<600000)return me.wx;
  try{
   var p=await new Promise(function(ok,no){navigator.geolocation.getCurrentPosition(ok,no,{timeout:10000,maximumAge:600000})});
   var u="https://api.open-meteo.com/v1/forecast?latitude="+p.coords.latitude+"&longitude="+p.coords.longitude+"&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1";
   var j=await(await fetch(u)).json(),c=j.current,d=j.daily;
   me.wx=" Live weather where the user is right now: "+c.temperature_2m+"°C, feels like "+c.apparent_temperature+"°C, wind "+c.wind_speed_10m+" km/h, rain now "+c.precipitation+" mm; today high "+d.temperature_2m_max[0]+"°C, low "+d.temperature_2m_min[0]+"°C, rain chance "+d.precipitation_probability_max[0]+"%. Use it for sweet, practical outfit advice.";
  }catch(e){
   me.wx=" The weather could not be fetched (location permission or internet). Say so honestly and ask the user for their temperature or city.";
  }
  me.wxAt=Date.now();return me.wx;
 },
 local:function(t){
  var me=this,nm=(typeof NAME!=="undefined"&&NAME)?", "+NAME:"";
  if(me.isSleep(t))return{mood:"shy",say:"Goodnight"+nm+". Sleep well. I’ll be right here when you wake up.",run:function(){setTimeout(function(){Voice.setMuted(true);$("night").style.display="flex"},7000)}};
  if(me.isCalm(t))return{mood:"calm",say:"I’m right here with you. Breathe with me, nice and slow.",run:function(){me.calm()}};
  return null;
 },
 calm:function(){
  var me=this,ph=[["Breathe in…",4000,1.45],["Hold…",3000,1.45],["Breathe out…",6000,0.8]],n=0,ring=$("ring"),cue=$("cue");
  me.calmOn=true;$("calm").style.display="flex";
  (function step(){
   if(!me.calmOn||n>=15){me.stopCalm();return}
   var p=ph[n%3];n++;cue.textContent=p[0];ring.style.transition="transform "+(p[1]/1000)+"s ease-in-out";ring.style.transform="scale("+p[2]+")";
   if(navigator.vibrate)navigator.vibrate(p[0][0]==="B"&&p[0][9]==="o"?[40,60,40]:30);
   me.timer=setTimeout(step,p[1]);
  })();
 },
 stopCalm:function(){this.calmOn=false;clearTimeout(this.timer);$("calm").style.display="none";$("ring").style.transform="scale(.8)"},
 initTouch:function(){
  var me=this,sx=0,sy=0,dist=0,down=false;
  var st=$("stage");
  $("calmoff").onclick=function(){me.stopCalm()};
  $("night").onclick=function(){$("night").style.display="none";Voice.setMuted(false);add("v","Good morning, sleepyhead.")};
  st.addEventListener("pointerdown",function(e){if(e.target.closest("button"))return;down=true;sx=e.clientX;sy=e.clientY;dist=0});
  st.addEventListener("pointermove",function(e){if(down)dist=Math.max(dist,Math.hypot(e.clientX-sx,e.clientY-sy))});
  st.addEventListener("pointerup",function(){
   if(!down)return;down=false;
   var stroke=dist>60,R=stroke?[["shy","You’re making me blush."],["happy","Okay okay, I’m blushing now."]]:[["shy","Hehe, that tickles!"],["laugh","Hey! What was that for?"],["happy","Mm, hi you."]],r=R[Math.floor(Math.random()*R.length)];
   if(navigator.vibrate)navigator.vibrate(stroke?[20,40,20]:25);
   Face.mood(r[0]);
   if(!busy&&!Voice.speaking&&Date.now()-me.last>4000){me.last=Date.now();Voice.speak(r[1],r[0])}
  });
 }
};

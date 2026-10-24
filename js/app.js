var hist=[],notes=[];
try{hist=JSON.parse(S.get("v_hist")||"[]")}catch(e){}
try{notes=JSON.parse(S.get("v_notes")||"[]")}catch(e){}
var NAME=S.get("v_name")||"",busy=false,mood="calm";
Voice.lang=S.get("v_lang")||"en-IN";

function status(t){$("status").textContent=t}
function add(r,t){var d=document.createElement("div");d.className="m "+(r==="me"?"u":"v");d.textContent=t;$("log").appendChild(d);$("log").scrollTop=1e9;return d}
function addAction(a){var el=add("v","");var l=document.createElement("a");l.className="btn";l.href=a.url;l.textContent=a.label;el.appendChild(l);$("log").scrollTop=1e9}
function save(){S.set("v_hist",JSON.stringify(hist.slice(-30)));S.set("v_notes",JSON.stringify(notes.slice(-60)))}

Voice.onState=function(s){
 var m={listening:"Listening… just talk",speaking:"Veronica is talking…",muted:"Mic is muted",idle:"Listening…",blocked:"Mic is blocked. Allow it for this page, or type.",nosr:"Voice input isn’t supported in this browser. Type instead.",elfail:"Sweet voice unavailable (key or credits). Using the phone voice."};
 if(!busy||s==="speaking"||s==="elfail")status(m[s]||"");
 $("mute").classList.toggle("on",s==="listening"||s==="idle");
 Face.update();
};

async function ask(text){
 text=(text||"").trim();if(!text||busy)return;
 busy=true;add("me",text);hist.push({r:"me",t:text});
 var act=Actions.match(text);
 if(act){
  hist.push({r:"v",t:act.say});add("v",act.say);addAction(act);save();Face.mood("happy");busy=false;Voice.speak(act.say,"happy");return;
 }
 var loc=Extras.local(text);
 if(loc){hist.push({r:"v",t:loc.say});add("v",loc.say);save();Face.mood(loc.mood);busy=false;Voice.speak(loc.say,loc.mood);loc.run();return}
 var wx=Extras.isWeather(text)?await Extras.weather():"";
 status("Veronica is thinking…");
 var out="";
 try{
  out=await Brain.ask(hist,CFG.persona+wx+(NAME?" The user’s name is "+NAME+".":" You don’t know the user’s name yet; ask for it sweetly once.")+(notes.length?" Things you remember about the user: "+notes.join("; ")+".":""));
 }catch(e){
  hist.pop();busy=false;Face.mood("sad");
  add("v",e.nokeys?"I need a free key first. Open ⚙ and paste one.":"I couldn’t answer: "+String(e.msg||"unknown problem").slice(0,150));
  status(Voice.on?"Listening…":"Type to Veronica");return;
 }
 var mm=out.match(/\[(happy|shy|laugh|pout|mad|sad|calm)\]/i);mood=mm?mm[1].toLowerCase():"calm";
 var nm=out.match(/\[name:([^\]]{1,30})\]/i);if(nm){NAME=nm[1].trim();S.set("v_name",NAME)}
 var re=/\[remember:([^\]]{1,120})\]/gi,rm;while((rm=re.exec(out)))notes.push(rm[1].trim());
 out=out.replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim()||"Hmm?";
 Face.mood(mood);add("v",out);hist.push({r:"v",t:out});save();busy=false;
 Voice.speak(out,mood);
}
Voice.onText=ask;

$("wakebtn").onclick=function(){$("wake").style.display="none";Voice.start();if(!Brain.keys().length){status("Open ⚙ and add a free key");$("set").style.display="block"}};
$("mute").onclick=function(){if(!Voice.on){Voice.start();return}Voice.setMuted(!Voice.muted)};
$("send").onclick=function(){var v=$("txt").value;$("txt").value="";ask(v)};
$("txt").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$("send").onclick()}});
$("gear").onclick=function(){$("keys").value=S.get("v_keys")||"";$("nm").value=NAME;$("lang").value=Voice.lang;$("elkey").value=S.get("v_el")||"";$("elvoice").value=S.get("v_elvoice")||"";$("set").style.display="block"};
$("done").onclick=function(){
 S.set("v_keys",$("keys").value);NAME=$("nm").value.trim();S.set("v_name",NAME);
 Voice.lang=$("lang").value;S.set("v_lang",Voice.lang);S.set("v_el",$("elkey").value.trim());S.set("v_elvoice",$("elvoice").value.trim());
 Voice.warned=false;Brain.cool={};$("set").style.display="none";if(Voice.on){Voice.stop();Voice.listen()}
};
$("clr").onclick=function(){hist=[];notes=[];save();$("log").innerHTML="";add("v","Fresh start. Hi again!")};
$("exp").onclick=function(){
 var b=new Blob([JSON.stringify({v:1,hist:hist,notes:notes,name:NAME})],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(b);a.download="veronica-backup.json";a.click();
};
$("imp").onchange=function(e){
 var f=e.target.files[0];if(!f)return;
 f.text().then(function(t){var d=JSON.parse(t);hist=d.hist||[];notes=d.notes||[];NAME=d.name||NAME;S.set("v_name",NAME);save();$("log").innerHTML="";hist.slice(-12).forEach(function(m){add(m.r,m.t)});status("Backup restored")}).catch(function(){status("That backup file didn’t work")});
};
["idle","talk","angry","happy"].forEach(function(s){
 $("vid_"+s).onchange=function(e){var f=e.target.files[0];if(f)Face.saveVid(s,f).then(function(){status("Saved the "+s+" video")}).catch(function(){status("Couldn’t save that video. Try a shorter one.")})};
});
$("pic").onchange=function(e){
 var f=e.target.files[0];if(!f)return;
 var img=new Image(),u=URL.createObjectURL(f);
 img.onload=function(){var s=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);var d=c.toDataURL("image/jpeg",.86);Face.set(d);if(!S.set("v_img",d))status("Shown, but too big to keep. Pick a smaller picture.");URL.revokeObjectURL(u)};
 img.src=u;
};

Face.init();Extras.initTouch();Face.set(S.get("v_img"));
hist.slice(-12).forEach(function(m){add(m.r,m.t)});
if(!hist.length){Face.mood("happy");add("v","Hi, I’m Veronica. Just talk to me, I’m listening. What should I call you?")}

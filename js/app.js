var hist=[];try{hist=JSON.parse(S.get("v_hist")||"[]")}catch(e){}
var NAME=S.get("v_name")||"",busy=false,mood="calm";
Voice.lang=S.get("v_lang")||"en-IN";

function status(t){$("status").textContent=t}
function add(r,t){var d=document.createElement("div");d.className="m "+(r==="me"?"u":"v");d.textContent=t;$("log").appendChild(d);$("log").scrollTop=1e9}
function save(){S.set("v_hist",JSON.stringify(hist.slice(-30)))}

Voice.onState=function(s){
 var m={listening:"Listening… just talk",speaking:"Veronica is talking…",muted:"Mic is muted",idle:"Listening…",blocked:"Mic is blocked. Allow it for this page, or type.",nosr:"Voice input isn’t supported in this browser. Type instead."};
 if(!busy||s==="speaking")status(m[s]||"");
 $("mute").classList.toggle("on",s==="listening"||s==="idle");
};

async function ask(text){
 text=(text||"").trim();if(!text||busy)return;
 busy=true;add("me",text);hist.push({r:"me",t:text});status("Veronica is thinking…");
 var out="";
 try{
  out=await Brain.ask(hist,CFG.persona+(NAME?" The user’s name is "+NAME+".":" You don’t know the user’s name yet; ask for it sweetly once."));
 }catch(e){
  hist.pop();busy=false;Face.mood("sad");
  add("v",e.nokeys?"I need a free key first. Open ⚙ and paste one.":"I couldn’t answer: "+String(e.msg||"unknown problem").slice(0,150));
  Voice.state(Voice.on?"idle":"nosr");if(!Voice.on)status("Type to Veronica");return;
 }
 var mm=out.match(/\[(happy|shy|laugh|pout|mad|sad|calm)\]/i);mood=mm?mm[1].toLowerCase():"calm";
 var nm=out.match(/\[name:([^\]]{1,30})\]/i);if(nm){NAME=nm[1].trim();S.set("v_name",NAME)}
 out=out.replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim()||"Hmm?";
 Face.mood(mood);add("v",out);hist.push({r:"v",t:out});save();busy=false;
 if(window.speechSynthesis)Voice.speak(out,mood);
}
Voice.onText=ask;

$("wakebtn").onclick=function(){$("wake").style.display="none";Voice.start();if(!Brain.keys().length){status("Open ⚙ and add a free key");$("set").style.display="block"}};
$("mute").onclick=function(){if(!Voice.on){Voice.start();return}Voice.setMuted(!Voice.muted)};
$("send").onclick=function(){var v=$("txt").value;$("txt").value="";ask(v)};
$("txt").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$("send").onclick()}});
$("gear").onclick=function(){$("keys").value=S.get("v_keys")||"";$("nm").value=NAME;$("lang").value=Voice.lang;$("set").style.display="block"};
$("done").onclick=function(){
 S.set("v_keys",$("keys").value);NAME=$("nm").value.trim();S.set("v_name",NAME);
 Voice.lang=$("lang").value;S.set("v_lang",Voice.lang);Brain.cool={};
 $("set").style.display="none";if(Voice.on){Voice.stop();Voice.listen()}
};
$("clr").onclick=function(){hist=[];save();$("log").innerHTML="";add("v","Fresh start. Hi again!")};
$("pic").onchange=function(e){
 var f=e.target.files[0];if(!f)return;
 var img=new Image(),u=URL.createObjectURL(f);
 img.onload=function(){var s=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);var d=c.toDataURL("image/jpeg",.86);Face.set(d);if(!S.set("v_img",d))status("Shown, but too big to keep. Pick a smaller picture.");URL.revokeObjectURL(u)};
 img.src=u;
};

Face.init();Face.set(S.get("v_img"));
hist.slice(-12).forEach(function(m){add(m.r,m.t)});
if(!hist.length){Face.mood("happy");add("v","Hi, I’m Veronica. Just talk to me, I’m listening. What should I call you?")}

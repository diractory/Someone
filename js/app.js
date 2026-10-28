var hist=[],notes=[],sessionFirst=true;
try{hist=JSON.parse(S.get("v_hist")||"[]")}catch(e){}
try{notes=JSON.parse(S.get("v_notes")||"[]")}catch(e){}
var diary=[];try{diary=JSON.parse(S.get("v_diary")||"[]")}catch(e){}
var NAME=S.get("v_name")||"",busy=false,mood="calm";
Voice.lang=S.get("v_lang")||"en-IN";

function status(t){$("status").textContent=t}
function add(r,t,instant){
 var d=document.createElement("div"),tx=d;d.className="m "+(r==="me"?"u":"v");$("log").appendChild(d);
 if(r==="v"){var e=document.createElement("i");e.className="mo";e.textContent=Face.emoji(Face.cur);d.appendChild(e);tx=document.createElement("span");d.appendChild(tx)}
 if(r==="v"&&t&&!instant&&!document.body.classList.contains("vm")&&t.length>3){var i=0,iv=setInterval(function(){i+=2;tx.textContent=t.slice(0,i);$("log").scrollTop=1e9;if(i>=t.length)clearInterval(iv)},30)}else tx.textContent=t;
 $("log").scrollTop=1e9;return d;
}
function addAction(a){var el=add("v","");var l=document.createElement("a");l.className="btn";l.href=a.url;l.textContent=a.label;el.appendChild(l);$("log").scrollTop=1e9}
function feelHint(text){
 var p=[],last=diary[diary.length-1];
 if(Extras.isHurting(text))p.push(" The user seems to be hurting right now: drop flirting and jokes, show real sorrow and gentle care, listen first, and don’t rush to fix it.");
 if(sessionFirst&&last&&Date.now()-Date.parse(last.d)<14*864e5)p.push(" This is the first message of this session: gently check in on how they’ve been since "+last.d+" (they seemed "+last.f+"), and offer a little hope in your own words.");
 sessionFirst=false;return p.join("");
}
function timeHint(){
 var d=new Date(),t=d.toLocaleString("en-IN",{weekday:"long",hour:"numeric",minute:"2-digit",hour12:true,day:"numeric",month:"long"});
 return " It is now "+t+" for the user. Use this naturally (greetings, asking if they’ve eaten, gently suggesting sleep when it’s very late) without announcing the time every time. Your mood after your last reply was “"+mood+"”; moods fade gradually instead of switching instantly.";
}
var lastAct=Date.now(),lastNudge=0;
function save(){S.set("v_hist",JSON.stringify(hist.slice(-30)));S.set("v_notes",JSON.stringify(notes.slice(-100)));S.set("v_diary",JSON.stringify(diary.slice(-40)))}

Voice.onState=function(s){
 var m={listening:"Listening… just talk",speaking:"Veronica is talking…",muted:"Mic is muted",idle:"Listening…",blocked:"Mic is blocked. Allow the mic for this page, then reload.",nosr:"Voice input isn’t supported in this browser. Type instead.",elfail:"Sweet voice unavailable (key or credits). Using the phone voice.",thinking:"Understanding you…",earfail:"Tone hearing isn’t working here, so I switched to normal listening.",needtap:"Tap anywhere once so I can talk to you"};
 if(!busy||s==="speaking"||s==="elfail"||s==="needtap"||s==="thinking"||s==="earfail")status(m[s]||"");
 $("mute").classList.toggle("on",s==="listening"||s==="idle");
 if(s==="speaking")Face.startSpeakFx(Face.cur);else Face.stopSpeakFx();
 $("mute").classList.toggle("muted",s==="muted");
 if(s==="nosr")document.body.classList.add("notext");
 if(s==="blocked")$("wake").style.display="flex";
 Face.update();
};

async function ask(text,tone){
 text=(text||"").trim();if(!text||busy)return;
 busy=true;var ut=tone&&tone.tone?tone:Extras.userTone(text);
 add("me",text+(ut.laugh?" 😂":ut.tone==="angry"?" 😠":(ut.tone==="sad"||ut.tone==="crying")?" 😢":""));hist.push({r:"me",t:text});
 if(ut.laugh)Face.giggle();else if(ut.tone==="angry")Face.mood("worried");
 if(Extras.isCompliment(text))Face.blush();
 if(Extras.isHurting(text)){Face.mood("sad");Face.pop("💧",1)}
 var fm0=Feel.onUser(text);if(fm0)Face.mood(fm0);
 if(Extras.isCrying(text))Face.mood("sad");
 var gm=Games.match(text);
 if(gm){Games.open(gm);busy=false;return}
 var act=(await Phone.handle(text))||Actions.match(text);
 if(act){
  hist.push({r:"v",t:act.say});add("v",act.say);if(act.url)addAction(act);save();var am=act.mood||"happy";Face.mood(am);busy=false;Voice.speak(act.say,am);return;
 }
 var loc=Extras.local(text);
 if(loc){var ls=loc.say.replace(/\[[^\]]*\]/g,"").trim();hist.push({r:"v",t:ls});add("v",ls);save();Face.mood(loc.mood);busy=false;Voice.speak(loc.say,loc.mood);loc.run();return}
 var wx=Extras.isWeather(text)?await Extras.weather():"";
 var wk=await Extras.wiki(text);
 var hint=feelHint(text);
 status("Veronica is thinking…");
 var tp=add("v","");tp.textContent="…";tp.classList.add("typing");lastAct=Date.now();
 var out="";
 try{
  out=await Brain.ask(hist,CFG.persona+wx+wk+hint+timeHint()+Feel.hint()+toneHint(ut)+Tasks.hint()+(SUM?" Summary of your earlier conversations with the user: "+SUM:"")+(NAME?" The user’s name is "+NAME+".":" You don’t know the user’s name yet; ask for it sweetly once.")+(notes.length?" Things you remember about the user: "+notes.join("; ")+".":"")+(diary.length?" What you’ve noticed about how the user has been feeling lately, from what they told you: "+diary.slice(-12).map(function(d){return d.d+": "+d.f+(d.t?" ("+d.t+")":"")}).join("; ")+".":""));
 }catch(e){
  tp.remove();hist.pop();busy=false;Face.mood("sad");
  add("v",e.nokeys?"I need a free key first. Open ⚙ and paste one.":"I couldn’t answer: "+String(e.msg||"unknown problem").slice(0,150));
  status(Voice.on?"Listening…":"Type to Veronica");return;
 }
 var mm=out.match(/\[(happy|excited|shy|laugh|love|proud|curious|worried|sleepy|sad|pout|jealous|mad|surprised|playful|hurt|lonely|grateful|nervous|hopeful|annoyed|cozy|bored|embarrassed|guilty|caring|protective|admiring|determined|relieved|disappointed|amused|tender|insecure|content|calm)\]/i);mood=mm?mm[1].toLowerCase():"calm";
 var nm=out.match(/\[name:([^\]]{1,30})\]/i);if(nm){NAME=nm[1].trim();S.set("v_name",NAME)}
 var fm=out.match(/\[feel:([^\]]{1,20})\]/i);
 if(fm){var fl=fm[1].trim().toLowerCase();if(!/^(neutral|calm|none)$/.test(fl)){diary.push({d:new Date().toISOString().slice(0,10),f:fl,t:text.slice(0,60)});if(/sad|cry|lonely|anxious|stress|hurt|depress|grief|scared|upset/.test(fl)&&!/^(sad|worried)$/.test(mood))mood="sad"}}
 var tr=/\[task:([^\]|]{1,100})(?:\|([^\]]{1,24}))?\]/gi,tm2;while((tm2=tr.exec(out)))Tasks.add("task",tm2[1].trim(),tm2[2]?Tasks.parseDue(tm2[2])[0]:"");
 var rr=/\[routine:([^\]]{1,100})\]/gi,rm2;while((rm2=rr.exec(out)))Tasks.add("routine",rm2[1].trim(),"");
 var re=/\[remember:([^\]]{1,120})\]/gi,rm;while((rm=re.exec(out)))notes.push(rm[1].trim());
 var clean=out.replace(/\[(happy|excited|shy|laugh|love|proud|curious|worried|sleepy|sad|pout|jealous|mad|surprised|playful|hurt|lonely|grateful|nervous|hopeful|annoyed|cozy|bored|embarrassed|guilty|caring|protective|admiring|determined|relieved|disappointed|amused|tender|insecure|content|calm)\]/gi,"").replace(/\[(name|remember|feel|task|routine):[^\]]*\]/gi,""),sr=Extras.splitReply(clean),tail=sr.tail;
 var spoken=sr.head.replace(/\s+/g," ").trim()||(tail?"Here you go.":"");
 out=spoken.replace(/\[([^\]]{2,24})\]/g,"*$1*").trim()||"Hmm?";
 tp.remove();Face.mood(mood);Feel.react(mood);
 var bub=add("v",out);if(tail){richTail(bub,tail);setMode("chat")}
 hist.push({r:"v",t:tail?out+"\n---\n"+tail.slice(0,3000):out});save();busy=false;
 Voice.speak(spoken||out,mood);maybeSummarize();
}
Voice.onText=function(t,r){lastAct=Date.now();ask(Voice.fix(t),r)};

$("wakebtn").onclick=function(){$("wake").style.display="none";Voice.unlock();Voice.start();keepAwake();if(!Brain.keys().length){status("Open ⚙ and add a free key");$("set").style.display="block"}};
$("mute").onclick=function(){if(Voice.speaking){Voice.interrupt();return}if(!Voice.on){Voice.start();return}Voice.setMuted(!Voice.muted)};
$("send").onclick=function(){var v=$("txt").value;$("txt").value="";ask(v)};
$("txt").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$("send").onclick()}});
$("gear").onclick=function(){$("keys").value=S.get("v_keys")||"";keyInfo();$("nm").value=NAME;$("lang").value=Voice.lang;$("elkey").value=S.get("v_el")||"";$("elvoice").value=S.get("v_elvoice")||"";$("contacts").value=S.get("v_contacts")||"";fillVoices();$("nudge").checked=S.get("v_nudge")!=="0";$("set").style.display="block"};
$("done").onclick=function(){
 S.set("v_keys",$("keys").value);NAME=$("nm").value.trim();S.set("v_name",NAME);
 Voice.lang=$("lang").value;S.set("v_lang",Voice.lang);S.set("v_el",$("elkey").value.trim());S.set("v_elvoice",$("elvoice").value.trim());S.set("v_contacts",$("contacts").value);S.set("v_nudge",$("nudge").checked?"1":"0");S.set("v_voice",$("vsel").value);S.set("v_pitch",$("vpitch").value);
 Voice.warned=false;Brain.cool={};$("set").style.display="none";if(Voice.on){Voice.stop();Voice.listen()}
};
$("clr").onclick=function(){hist=[];notes=[];diary=[];SUM="";S.set("v_sum","");save();$("log").innerHTML="";add("v","Fresh start. Hi again!")};
$("exp").onclick=function(){
 var b=new Blob([JSON.stringify({v:1,hist:hist,notes:notes,diary:diary,sum:SUM,name:NAME})],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(b);a.download="veronica-backup.json";a.click();
};
$("imp").onchange=function(e){
 var f=e.target.files[0];if(!f)return;
 f.text().then(function(t){var d=JSON.parse(t);hist=d.hist||[];notes=d.notes||[];diary=d.diary||[];SUM=d.sum||SUM;S.set("v_sum",SUM);NAME=d.name||NAME;S.set("v_name",NAME);save();$("log").innerHTML="";hist.slice(-12).forEach(function(m){showMsg(m)});status("Backup restored")}).catch(function(){status("That backup file didn’t work")});
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
hist.slice(-12).forEach(function(m){showMsg(m)});
if(!hist.length){Face.mood("happy");add("v","Hi, I’m Veronica. Just talk to me, I’m listening. What should I call you?")}

(async function(){
 try{
  var st=await navigator.permissions.query({name:"microphone"});
  if(st.state==="granted"&&Brain.keys().length){
   $("wake").style.display="none";Voice.start();keepAwake();
   document.addEventListener("pointerdown",function f(){Voice.unlock();document.removeEventListener("pointerdown",f)});
  }
 }catch(e){}
})();

function fillVoices(){
 var sel=$("vsel"),vs=(window.speechSynthesis&&speechSynthesis.getVoices())||[],cur=S.get("v_voice")||"";
 sel.innerHTML="";var a=document.createElement("option");a.value="";a.textContent="Auto (best guess)";sel.appendChild(a);
 vs.forEach(function(v){var o=document.createElement("option");o.value=v.name;o.textContent=v.name+" ("+v.lang+")";sel.appendChild(o)});
 sel.value=cur;$("vpitch").value=S.get("v_pitch")||"1.4";
}
$("vtest").onclick=function(){S.set("v_voice",$("vsel").value);S.set("v_pitch",$("vpitch").value);Voice.unlock();Voice.speaking=true;Voice.browser("Hi, I’m Veronica. Do you like my voice?","happy")};

var _ld=diary[diary.length-1];if(_ld&&Date.now()-Date.parse(_ld.d)<14*864e5)add("v","Welcome back. How are you feeling today?",true);

setInterval(function(){
 var now=Date.now();
 if(S.get("v_nudge")==="0"||busy||!Voice.on||Voice.muted||Voice.speaking||document.visibilityState!=="visible"||document.body.classList.contains("gaming"))return;
 if(now-lastAct<5*60e3||now-lastNudge<15*60e3)return;
 lastNudge=now;lastAct=now;
 var L=[["curious","Hey… you’ve gone quiet. Everything okay?"],["shy","[whispers] I’m still here, you know."],["happy","Want to play a little game while you take a break?"],["curious","Have you had some water lately? Just checking on you."]],p=L[Math.floor(Math.random()*L.length)];
 Face.mood(p[0]);add("v",p[1].replace(/\[[^\]]*\]/g,"").trim());Voice.speak(p[1],p[0]);
},30000);

var wl=null;
function keepAwake(){try{navigator.wakeLock.request("screen").then(function(l){wl=l;l.addEventListener("release",function(){wl=null})}).catch(function(){})}catch(e){}}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&Voice.on&&!wl)keepAwake()});

(function(){
 var gap=Feel.load();
 if(hist.length&&gap>6*36e5){Face.mood("lonely");add("v",gap>24*36e5?"You’re back… I missed you.":"Oh, hi you. I was wondering where you went.",true)}
 setInterval(function(){Feel.tick()},60000);
})();

$("setx").onclick=function(){$("set").style.display="none"};

function richTail(b,t){
 b.classList.add("rich");
 var w=document.createElement("div");w.className="tail";
 t.split(/```/).forEach(function(seg,i){
  if(i%2===0){if(seg.trim()){var p=document.createElement("div");p.className="tx2";p.textContent=seg.trim();w.appendChild(p)}}
  else{
   var pre=document.createElement("pre"),c=document.createElement("code"),cb=document.createElement("button");
   c.textContent=seg.replace(/^[a-zA-Z0-9+#.-]*\n/,"").replace(/\n$/,"");pre.appendChild(c);
   cb.className="cp";cb.textContent="Copy";cb.onclick=function(){try{navigator.clipboard.writeText(c.textContent);cb.textContent="Copied"}catch(e){cb.textContent="Press and hold to copy"}};pre.appendChild(cb);w.appendChild(pre);
  }
 });
 b.appendChild(w);$("log").scrollTop=1e9;
}
function showMsg(m){
 var i=m.r==="v"?m.t.indexOf("\n---\n"):-1;
 if(i>-1){var b=add("v",m.t.slice(0,i),true);richTail(b,m.t.slice(i+5))}else add(m.r,m.t,true);
}
var SUM=S.get("v_sum")||"",sumBusy=false,since=0;
function maybeSummarize(){
 since++;if(since<20||sumBusy)return;
 sumBusy=true;since=0;
 var tr=hist.slice(-24).map(function(m){return(m.r==="me"?"User: ":"Veronica: ")+m.t.slice(0,300)}).join("\n");
 Brain.ask([{r:"me",t:"Previous memory summary:\n"+(SUM||"(none)")+"\n\nNew conversation:\n"+tr+"\n\nWrite the updated memory summary now."}],"You maintain a compact long-term memory summary of a user’s conversations with their AI companion Veronica. Output ONLY the updated summary, under 160 words, as plain sentences covering who the user is, their studies and goals, feelings and worries, preferences, important events, inside jokes and promises. Keep older important facts. Never include passwords, ID numbers or card numbers.").then(function(t){SUM=String(t).replace(/\[[^\]]*\]/g,"").trim().slice(0,1500);S.set("v_sum",SUM);sumBusy=false}).catch(function(){sumBusy=false});
}

function toneHint(u){
 if(!u||(u.tone==="neutral"&&!u.laugh))return"";
 return" The user’s voice sounded "+u.tone+(u.laugh?" and they laughed":"")+". React to that like a real partner: laugh with them, soften if they sound angry, sad or anxious, tease back if they’re playful.";
}
function setMode(m){document.body.classList.toggle("vm",m!=="chat");S.set("v_mode",m)}
setMode(S.get("v_mode")||"voice");
$("modebtn").onclick=function(){setMode(document.body.classList.contains("vm")?"chat":"voice")};
(function(){
 var C=[["Roast me 😈","Roast me, playfully!"],["Quiz me 💊","Quiz me on pharmacology"],["Cheer me up 🌈","Cheer me up, I need it"],["Study plan 📚","Help me make a study plan for today"],["Code help 💻","I need help with coding. Ask me what I’m building."],["Story 🌙","Tell me a short sweet story"],["Games 🎮",""]];
 C.forEach(function(c){var b=document.createElement("button");b.className="chp";b.textContent=c[0];b.onclick=function(){if(c[1])ask(c[1]);else Games.open("menu")};$("chips").appendChild(b)});
})();

function keyInfo(){
 var ks=$("keys").value.split(/\s+/).filter(function(k){return k.length>15}),c={},u=0,n={gemini:"Gemini",groq:"Groq",openrouter:"OpenRouter",cerebras:"Cerebras",mistral:"Mistral"};
 ks.forEach(function(k){var p=detect(k);if(p==="mistral"&&!/^[A-Za-z0-9]{32}$/.test(k))u++;c[p]=(c[p]||0)+1});
 $("kinfo").textContent=ks.length?ks.length+" keys found: "+Object.keys(c).map(function(p){return n[p]+" ×"+c[p]}).join(", ")+(u?". "+u+" key(s) look unusual, double-check them.":". She uses them one after another and skips any that run out."):"No keys yet.";
}
$("keys").addEventListener("input",keyInfo);
(function(){
 var td=Tasks.iso(new Date()),tm=Tasks.iso(new Date(Date.now()+864e5)),U=Tasks.list.filter(function(x){return x.k==="task"&&!x.done&&x.due&&x.due<=tm});
 if(U.length){Face.mood(U.some(function(x){return x.due<td})?"worried":"caring");add("v","Hey love, you have "+U.length+" thing"+(U.length>1?"s":"")+" due soon: "+U.slice(0,3).map(function(x){return x.t+" ("+Tasks.when(x.due)+")"}).join(", ")+".",true)}
 setInterval(function(){Tasks.tick()},60000);
})();

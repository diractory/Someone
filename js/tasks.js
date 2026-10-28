var Tasks={
 list:[],lastSay:0,
 DAYS:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],
 MON:["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"],
 load:function(){try{this.list=JSON.parse(S.get("v_tasks")||"[]")}catch(e){this.list=[]}},
 save:function(){S.set("v_tasks",JSON.stringify(this.list.slice(-100)))},
 iso:function(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)},
 parseDue:function(s){
  var t=" "+s+" ",now=new Date(),d=null,m,me=this;
  function go(n,re){d=new Date(now);d.setDate(d.getDate()+n);t=t.replace(re," ")}
  if(/\b(?:due |by |on )?(?:day after tomorrow|parso)\b/i.test(t))go(2,/\b(?:due |by |on )?(?:day after tomorrow|parso)\b/i);
  else if(/\b(?:due |by |on )?(?:tomorrow|kal)\b/i.test(t))go(1,/\b(?:due |by |on )?(?:tomorrow|kal)\b/i);
  else if(/\b(?:due |by |on )?(?:today|aaj)\b/i.test(t))go(0,/\b(?:due |by |on )?(?:today|aaj)\b/i);
  else if((m=t.match(/\b(?:due |by |on )?in (\d+) days?\b/i))){d=new Date(now);d.setDate(d.getDate()+(+m[1]));t=t.replace(m[0]," ")}
  else if((m=t.match(/\b(?:due |by |on |next )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i))){var i=me.DAYS.indexOf(m[1].toLowerCase());d=new Date(now);d.setDate(d.getDate()+((i-now.getDay()+7)%7||7));t=t.replace(m[0]," ")}
  else if((m=t.match(/\b(?:due |by |on )?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i))){d=new Date(now.getFullYear(),me.MON.indexOf(m[2].toLowerCase()),+m[1]);if(d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))d.setFullYear(d.getFullYear()+1);t=t.replace(m[0]," ")}
  return[d?me.iso(d):"",t.replace(/\s+/g," ").replace(/\b(due|by|on|for)\s*$/i,"").trim()];
 },
 when:function(due){
  var a=new Date(due+"T00:00:00"),n=new Date(),b=new Date(n.getFullYear(),n.getMonth(),n.getDate()),k=Math.round((a-b)/864e5);
  if(k===0)return"today";if(k===1)return"tomorrow";if(k===-1)return"yesterday";if(k<0)return(-k)+" days ago";if(k<7)return"on "+this.DAYS[a.getDay()];
  return a.getDate()+" "+this.MON[a.getMonth()];
 },
 add:function(k,t,due){
  t=String(t).trim().slice(0,100);if(!t)return false;
  var low=t.toLowerCase();
  if(this.list.some(function(x){return!x.done&&x.k===k&&x.t.toLowerCase()===low}))return false;
  this.list.push({id:Date.now()+Math.random(),k:k,t:t,due:due||"",done:false,rem:0});this.save();this.render();return true;
 },
 find:function(q){
  var w=q.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(x){return x.length>2}),best=null,bs=0;
  this.list.forEach(function(x){if(x.done)return;var h=x.t.toLowerCase(),s=0;w.forEach(function(y){if(h.indexOf(y)>-1)s++});if(s>bs){bs=s;best=x}});
  return bs>0?best:null;
 },
 match:function(text){
  var me=this,s=text.trim().replace(/[.!?]+$/,""),m,kind=null,rest=null;
  m=s.match(/^(?:add|new|create|save)\s+(?:a\s+|my\s+)?(homework|assignment|task|exam|test|routine|reminder)\s*(?:to my (?:list|tasks?|routine))?\s*[:\-,]?\s*(.+)$/i);
  if(m){kind=m[1].toLowerCase();rest=m[2]}
  else if((m=s.match(/^add\s+(.+?)\s+to my routine$/i))){kind="routine";rest=m[1]}
  else if((m=s.match(/^remind me (?:to|about|that)\s+(.+)$/i))){kind="reminder";rest=m[1]}
  if(kind){
   var routine=kind==="routine",due="",txt=rest;
   if(!routine){var dr=me.parseDue(rest);due=dr[0];txt=dr[1]||rest}
   if(kind==="homework"||kind==="assignment")txt="Homework: "+txt;else if(kind==="exam"||kind==="test")txt="Exam: "+txt;
   var ok=me.add(routine?"routine":"task",txt,due);
   return{mood:"proud",say:ok?"Added “"+txt+"”"+(due?", due "+me.when(due):"")+". I’ll keep an eye on it for you, okay?":"I already have that one on your list.",run:function(){}};
  }
  if(/^(?:what(?:'s| is| are)?\s+(?:my\s+)?(?:pending|tasks?|homework|to ?do|routine)|(?:show|list|read)\s+(?:my\s+)?(?:tasks?|homework|routine|to ?do)|my (?:tasks?|homework|routine)|kya pending hai)/i.test(s)){
   var P=me.list.filter(function(x){return x.k==="task"&&!x.done}),line;
   if(!P.length)line="Nothing pending right now. Tell me about your homework and I’ll keep track.";
   else line="You have "+P.length+" pending: "+P.slice(0,4).map(function(x){return x.t+(x.due?", due "+me.when(x.due):"")}).join("; ")+(P.length>4?"; and more on your list.":".");
   return{mood:P.length?"caring":"happy",say:line,run:function(){me.open()}};
  }
  if((m=s.match(/^(?:mark|done|complete|completed|finished|finish)\s+(.+?)(?:\s+(?:as\s+)?(?:done|complete|completed|finished))?$/i))){
   var t1=me.find(m[1]);
   if(t1){t1.done=true;me.save();me.render();return{mood:"admiring",say:"Proud of you! “"+t1.t+"” is done.",run:function(){}}}
  }
  if((m=s.match(/^(?:delete|remove)\s+(?:the\s+)?(?:task\s+)?(.+)$/i))){
   var t2=me.find(m[1]);
   if(t2){me.list=me.list.filter(function(x){return x!==t2});me.save();me.render();return{mood:"calm",say:"Okay, removed “"+t2.t+"”.",run:function(){}}}
  }
  return null;
 },
 hint:function(){
  var me=this,P=me.list.filter(function(x){return x.k==="task"&&!x.done}).slice(0,10).map(function(x){return x.t+(x.due?" (due "+me.when(x.due)+")":"")}),R=me.list.filter(function(x){return x.k==="routine"}).slice(0,10).map(function(x){return x.t});
  if(!P.length&&!R.length)return"";
  return" Today is "+me.iso(new Date())+". The user’s pending homework and tasks: "+(P.join("; ")||"none")+". Their regular routine: "+(R.join("; ")||"not shared yet")+". Care for them like a loving girlfriend with a gentle, motherly side: remind about homework, meals, water and sleep when it fits, encourage without nagging in every message, and celebrate when they finish things.";
 },
 tick:function(){
  var me=this,now=Date.now(),td=me.iso(new Date()),tm=me.iso(new Date(now+864e5)),h=new Date().getHours(),line=null,mood="caring",care;
  if(S.get("v_nudge")==="0"||busy||Voice.speaking||document.visibilityState!=="visible"||document.body.classList.contains("gaming"))return;
  if(now-lastAct<120000||now-me.lastSay<20*60000)return;
  var P=me.list.filter(function(x){return x.k==="task"&&!x.done&&x.due&&x.due<=tm&&now-(x.rem||0)>3*3600000}).sort(function(a,b){return a.due>b.due?1:-1});
  if(P.length){
   var x=P[0];x.rem=now;me.save();
   if(x.due<td){mood="worried";line="[sighs] Love, “"+x.t+"” was due "+me.when(x.due)+". Did you finish it? Tell me if you did, or let’s plan it now."}
   else if(x.due===td){mood="hopeful";line="Your “"+x.t+"” is due today. Have you started? I believe in you."}
   else{mood="caring";line="Just a reminder, “"+x.t+"” is due tomorrow. Even twenty minutes now will help."}
  }else{
   try{care=JSON.parse(S.get("v_care")||"{}")}catch(e){care={}}
   if(care.d!==td)care={d:td};
   if(h>=13&&h<15&&!care.lunch){care.lunch=1;mood="caring";line="Have you eaten yet? Don’t skip meals just because you’re busy, okay?"}
   else if(h>=20&&h<22&&!care.dinner){care.dinner=1;mood="caring";line="Dinner time, love. Eat something proper, then you can get back to studying."}
   else if((h>=23||h<2)&&!care.night){care.night=1;mood="tender";line="[whispers] It’s getting late. Sleep soon, okay? Tomorrow-you needs the rest."}
   if(line)S.set("v_care",JSON.stringify(care));
  }
  if(!line)return;
  me.lastSay=now;lastAct=now;Face.mood(mood);add("v",line.replace(/\[[^\]]*\]/g,"").trim());Voice.speak(line,mood);
 },
 open:function(){this.render();$("tasks").style.display="block"},
 render:function(){
  var me=this,L=$("tklist"),R=$("tkroutine"),td=me.iso(new Date()),tm=me.iso(new Date(Date.now()+864e5));
  if(!L||!R)return;L.innerHTML="";R.innerHTML="";
  me.list.slice().sort(function(a,b){return((a.done?1:0)-(b.done?1:0))||((a.due||"9")>(b.due||"9")?1:-1)}).forEach(function(x){
   var row=document.createElement("div"),cb=document.createElement("input"),sp=document.createElement("span"),dl=document.createElement("button");
   row.className="tk"+(x.done?" done":"")+(!x.done&&x.due&&x.due<td?" over":(!x.done&&x.due&&x.due<=tm?" soon":""));
   cb.type="checkbox";cb.checked=x.done;cb.onchange=function(){x.done=cb.checked;me.save();me.render()};
   sp.textContent=x.t;if(x.due){var d=document.createElement("small");d.className="due";d.textContent=" · "+me.when(x.due);sp.appendChild(d)}
   dl.className="del";dl.textContent="✕";dl.setAttribute("aria-label","Delete");dl.onclick=function(){me.list=me.list.filter(function(y){return y!==x});me.save();me.render()};
   row.appendChild(cb);row.appendChild(sp);row.appendChild(dl);(x.k==="routine"?R:L).appendChild(row);
  });
  if(!L.children.length)L.innerHTML='<p class="note">Nothing yet. Tell Veronica, or add one above.</p>';
  if(!R.children.length)R.innerHTML='<p class="note">Tell her your daily routine, like “add study 6 to 8 to my routine”.</p>';
 },
 init:function(){
  var me=this;me.load();
  $("taskbtn").onclick=function(){me.open()};
  $("tkx").onclick=function(){$("tasks").style.display="none"};
  $("tka").onclick=function(){
   var t=$("tkt").value.trim(),k=$("tkk").value,d=$("tkd").value;if(!t)return;
   if(k==="task"&&!d){var p=me.parseDue(t);d=p[0];t=p[1]||t}
   me.add(k,t,k==="task"?d:"");$("tkt").value="";$("tkd").value="";
  };
  me.render();
 }
};
Tasks.init();

var Games={
 st:{w:0,l:0,d:0,s:0},cur:null,last:0,onGive:null,
 init:function(){
  var me=this;
  try{var j=JSON.parse(S.get("v_gst")||"null");if(j)me.st=j}catch(e){}
  $("gamebtn").onclick=function(){me.open("menu")};
  $("gclose").onclick=function(){me.close()};
  $("gback").onclick=function(){me.menu()};
  window.addEventListener("resize",function(){me.fit()});
  $("gctl").onclick=function(e){var a=e.target.dataset&&e.target.dataset.a;if(a==="menu")me.menu();else if(a==="again")me.start(me.cur);else if(a==="give"&&me.onGive)me.onGive()};
 },
 fit:function(){
  var g=$("games"),h=g.clientHeight-$("ghead").offsetHeight-$("gmsg").offsetHeight-$("gctl").offsetHeight-28,w=g.clientWidth-8,s=Math.floor(Math.max(200,Math.min(w,h)));
  $("gb").style.setProperty("--bs",s+"px");
 },
 save:function(){S.set("v_gst",JSON.stringify(this.st))},
 pick:function(a){return a[Math.floor(Math.random()*a.length)]},
 match:function(t){
  var s=t.toLowerCase(),v=/\b(play|let.?s|khel|khelo|wanna|chalo|start)\b/.test(s);
  if(/\bquiz me\b|pharm\w* quiz/.test(s))return"pq";
  if(!v)return null;
  if(/\bchess\b/.test(s))return"chess";
  if(/tic.?tac.?toe/.test(s))return"ttt";
  if(/connect.?(4|four)/.test(s))return"c4";
  if(/rock.?paper.?scissors/.test(s))return"rps";
  if(/truth.?(or|and).?dare/.test(s))return"tod";
  if(/\briddles?\b/.test(s))return"riddle";
  if(/would.?you.?rather/.test(s))return"wyr";
  if(/(20|twenty).?questions/.test(s))return"q20";
  if(/\b(games?|khel)\b/.test(s))return"menu";
  return null;
 },
 open:function(g){
  document.body.classList.add("gaming");
  if(g==="tod"){this.close();ask("Let’s play truth or dare! Start by giving me one, then we take turns. Keep it fun and sweet.");return}
  if(g==="wyr"){this.close();ask("Let’s play Would You Rather! Ask me a fun one first, then we take turns.");return}
  if(g==="q20"){this.close();ask("Let’s play 20 questions. I’ll think of something and you guess by asking yes or no questions. Wait, you think of something instead and I’ll guess by asking yes or no questions. Ready, I’ll start!");return}
  if(g==="pq"){this.close();ask("Quiz me on B.Pharm subjects, one question at a time. Start with a pharmacology question, wait for my answer, then tell me if I’m right and explain briefly. Mix subjects as we go.");return}
  if(g==="riddle"){this.close();ask("Give me a fun riddle to solve, and tell me if I’m right or wrong after I answer.");return}
  if(!g||g==="menu")this.menu();else{this.say("Ooh, you’re on! Let’s play.","excited");this.start(g)}
 },
 close:function(){document.body.classList.remove("gaming");this.cur=null;this.onGive=null},
 say:function(t,m){
  var d=t.replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim();
  $("gmsg").textContent=d;this.fit();Face.mood(m);add("v",d,true);Voice.speak(t,m);
 },
 chat:function(t,m){if(Date.now()-this.last>9000&&!Voice.speaking){this.last=Date.now();this.say(t,m)}},
 menu:function(){
  var me=this,st=me.st;
  me.cur=null;me.onGive=null;$("gtitle").textContent="Games";$("gctl").innerHTML="";
  $("gmsg").textContent="You "+st.l+" · Veronica "+st.w+" · Draws "+st.d;
  $("gb").innerHTML='<div class="menu"><button class="gbtn" data-g="chess">♚︎ Chess</button><button class="gbtn" data-g="ttt">❌ Tic-Tac-Toe</button><button class="gbtn" data-g="c4">🔴 Connect Four</button><button class="gbtn" data-g="rps">✊ Rock Paper Scissors</button><button class="gbtn" data-g="tod">🎭 Truth or Dare</button><button class="gbtn" data-g="pq">💊 Pharmacy Quiz</button><button class="gbtn" data-g="riddle">🧩 Riddles</button><button class="gbtn" data-g="wyr">🤔 Would You Rather</button><button class="gbtn" data-g="q20">❓ 20 Questions</button></div>';
  $("gb").onclick=function(e){var g=e.target.dataset&&e.target.dataset.g;if(g)me.open(g)};
 },
 start:function(g){
  this.cur=g;this.onGive=null;
  $("gctl").innerHTML='<button class="gbtn" data-a="give">Give up</button><button class="gbtn" data-a="menu">Menu</button>';
  if(g==="chess")this.chess();else if(g==="ttt")this.ttt();else if(g==="c4")this.c4();else if(g==="rps")this.rps();
  this.fit();
 },
 finish:function(out){
  var st=this.st,line,m;if(window.Feel)Feel.onGame(out);
  if(out==="ai"){st.w++;st.s=0;m=this.pick(["happy","excited","laugh"]);line=this.pick(["[giggles] I won! Hehe, I actually won!","[laughs] Yay, that one’s mine! Don’t pout, rematch?","I win~ [giggles] Come on, one more game?"])}
  else if(out==="you"){
   st.l++;st.s++;
   if(st.s===1){m="sad";line=this.pick(["[sighs] Aww… you got me. That was really good.","[sighs] Okay, okay, you win this one…"])}
   else if(st.s===2){m="pout";line=this.pick(["Wait, again?! [sighs] I’m not happy about this…","Hmph. Twice in a row? I’m getting a little grumpy."])}
   else if(Math.random()<.5){m="mad";line="Ugh! You keep beating me! Rematch, right now!"}
   else{m="sad";line="[sighs] I keep losing… am I really that bad at this?"}
  }else{st.d++;m="curious";line=this.pick(["Hmm, a draw. Not bad, you.","A draw! We’re evenly matched."])}
  this.save();$("gmsg").textContent=line.replace(/\[[^\]]*\]/g,"").trim();
  this.say(line,m);
  $("gctl").innerHTML='<button class="gbtn" data-a="again">Play again</button><button class="gbtn" data-a="menu">Menu</button>';
 },
 chess:function(){
  var me=this,s=CH.init(),sel=-1,tg=[],over=false,thinking=false,gb=$("gb");
  var G={K:"♚",Q:"♛",R:"♜",B:"♝",N:"♞",P:"♟"};
  $("gtitle").textContent="Chess · you are white";
  function render(){
   var h='<div class="bd ch">',i,p,r,c,cl;
   for(i=0;i<64;i++){p=s.b[i];r=i>>3;c=i&7;
    cl="sq "+((r+c)%2?"dk":"lt")+(i===sel?" sel":"")+(tg.indexOf(i)>-1?" tg":"")+(p?(CH.col(p)==="w"?" pw":" pb"):"");
    h+='<div class="'+cl+'" data-sq="'+i+'">'+(p?G[p.toUpperCase()]+"\uFE0E":"")+'</div>';
   }
   gb.innerHTML=h+"</div>";
  }
  function after(mover){
   var ms=CH.legal(s);
   if(!ms.length){over=true;render();if(CH.inCheck(s))me.finish(mover==="w"?"you":"ai");else me.finish("draw");return true}
   if(s.n>=200){over=true;me.finish("draw");return true}
   return false;
  }
  function aiMove(){
   var m=CH.best(s);thinking=false;if(!m||over)return;
   var cap=s.b[m.t];s=CH.apply(s,m);render();
   if(after("b"))return;
   if(CH.inCheck(s))me.chat(me.pick(["[giggles] Check!","Check~ [giggles] Watch out!"]),"happy");
   else if(cap&&/[QR]/.test(cap)&&Math.random()<.5)me.chat(me.pick(["[giggles] Hehe, I took that!","Mine now~"]),"happy");
  }
  gb.onclick=function(e){
   if(over||thinking||me.cur!=="chess")return;
   var el=e.target.closest(".sq");if(!el)return;
   var i=+el.dataset.sq,p=s.b[i];
   if(sel>-1&&tg.indexOf(i)>-1){
    var from=sel,m=CH.legal(s).filter(function(x){return x.f===from&&x.t===i})[0];
    s=CH.apply(s,m);sel=-1;tg=[];render();
    if(after("w"))return;
    if(CH.inCheck(s))me.chat(me.pick(["[gasps] Hey! That’s check!","Eek, check! Okay, okay…"]),"worried");
    thinking=true;setTimeout(aiMove,400);return;
   }
   if(p&&CH.col(p)==="w"){sel=i;tg=CH.legal(s).filter(function(x){return x.f===i}).map(function(x){return x.t})}else{sel=-1;tg=[]}
   render();
  };
  me.onGive=function(){if(!over){over=true;me.finish("ai")}};
  render();
 },
 ttt:function(){
  var me=this,b=Array(9).fill(""),over=false,L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  $("gtitle").textContent="Tic-Tac-Toe · you are ❌";
  function win(b){for(var i=0;i<8;i++){var l=L[i];if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return b[l[0]]}return b.indexOf("")<0?"d":""}
  function mm(b,t){
   var w=win(b);if(w==="O")return 1;if(w==="X")return -1;if(w==="d")return 0;
   var best=t==="O"?-2:2;
   for(var i=0;i<9;i++)if(!b[i]){b[i]=t;var v=mm(b,t==="O"?"X":"O");b[i]="";if(t==="O"?v>best:v<best)best=v}
   return best;
  }
  function ai(){
   var free=[],i;for(i=0;i<9;i++)if(!b[i])free.push(i);
   if(Math.random()<.3)return me.pick(free);
   var bs=-2,bm=[];
   for(i=0;i<free.length;i++){b[free[i]]="O";var v=mm(b,"X");b[free[i]]="";if(v>bs){bs=v;bm=[free[i]]}else if(v===bs)bm.push(free[i])}
   return me.pick(bm);
  }
  function render(){var h='<div class="bd t3">';for(var i=0;i<9;i++)h+='<div class="tc" data-i="'+i+'">'+(b[i]==="X"?"❌":b[i]==="O"?"⭕":"")+"</div>";$("gb").innerHTML=h+"</div>"}
  function end(){var w=win(b);if(!w)return false;over=true;render();me.finish(w==="O"?"ai":w==="X"?"you":"draw");return true}
  $("gb").onclick=function(e){
   var i=e.target.dataset&&e.target.dataset.i;if(i===undefined||over||b[+i]||me.cur!=="ttt")return;
   b[+i]="X";render();if(end())return;
   setTimeout(function(){if(over)return;b[ai()]="O";render();end()},350);
  };
  me.onGive=function(){if(!over){over=true;me.finish("ai")}};
  render();
 },
 c4:function(){
  var me=this,R=6,C=7,g=[],over=false,busy2=false,i,D=[[0,1],[1,0],[1,1],[1,-1]];
  for(i=0;i<R*C;i++)g.push(0);
  $("gtitle").textContent="Connect Four · you are 🔴";
  function drop(g,c,p){for(var r=R-1;r>=0;r--)if(!g[r*C+c]){g[r*C+c]=p;return r}return -1}
  function full(g){for(var c=0;c<C;c++)if(!g[c])return false;return true}
  function four(g,p){
   for(var r=0;r<R;r++)for(var c=0;c<C;c++)for(var k=0;k<4;k++){var n=0;
    for(var j=0;j<4;j++){var rr=r+D[k][0]*j,cc=c+D[k][1]*j;if(rr<0||rr>=R||cc<0||cc>=C||g[rr*C+cc]!==p)break;n++}
    if(n===4)return true}
   return false;
  }
  function score(g){
   var s=0,r,c,k,j,a,u,ok,rr,cc,v;
   for(r=0;r<R;r++)for(c=0;c<C;c++)for(k=0;k<4;k++){a=0;u=0;ok=true;
    for(j=0;j<4;j++){rr=r+D[k][0]*j;cc=c+D[k][1]*j;if(rr<0||rr>=R||cc<0||cc>=C){ok=false;break}v=g[rr*C+cc];if(v===2)a++;else if(v===1)u++}
    if(ok&&!(a&&u)){if(a===3)s+=5;else if(a===2)s+=2;if(u===3)s-=6;else if(u===2)s-=2}}
   for(r=0;r<R;r++)if(g[r*C+3]===2)s+=3;
   return s;
  }
  function ab(g,d,a,b,p){
   if(four(g,2))return 1000+d;if(four(g,1))return -1000-d;if(d===0||full(g))return score(g);
   var order=[3,2,4,1,5,0,6],i,c,h,v,best=p===2?-1e9:1e9;
   for(i=0;i<7;i++){c=order[i];if(g[c])continue;h=g.slice();drop(h,c,p);v=ab(h,d-1,a,b,p===2?1:2);
    if(p===2){if(v>best)best=v;if(best>a)a=best}else{if(v<best)best=v;if(best<b)b=best}
    if(a>=b)break}
   return best;
  }
  function aiCol(){
   var c,f=[];for(c=0;c<C;c++)if(!g[c])f.push(c);
   if(Math.random()<.18)return me.pick(f);
   var best=-1e9,bc=[],h,v;
   for(i=0;i<f.length;i++){h=g.slice();drop(h,f[i],2);v=ab(h,3,-1e9,1e9,1);if(v>best){best=v;bc=[f[i]]}else if(v===best)bc.push(f[i])}
   return me.pick(bc);
  }
  function render(){
   var h='<div class="bd c4g">',r,c,v;
   for(r=0;r<R;r++)for(c=0;c<C;c++){v=g[r*C+c];h+='<div class="cc c'+v+'" data-c="'+c+'"></div>'}
   $("gb").innerHTML=h+"</div>";
  }
  function end(p){over=true;render();me.finish(p===1?"you":p===2?"ai":"draw")}
  $("gb").onclick=function(e){
   var c=e.target.dataset&&e.target.dataset.c;if(c===undefined||over||busy2||g[+c]||me.cur!=="c4")return;
   drop(g,+c,1);render();
   if(four(g,1))return end(1);if(full(g))return end(0);
   busy2=true;
   setTimeout(function(){var c2=aiCol();drop(g,c2,2);render();busy2=false;if(four(g,2))end(2);else if(full(g))end(0)},400);
  };
  me.onGive=function(){if(!over){over=true;me.finish("ai")}};
  render();
 },
 rps:function(){
  var me=this,y=0,a=0,over=false,E={r:"✊",p:"✋",s:"✌️"};
  $("gtitle").textContent="Rock Paper Scissors";
  function draw(msg){
   $("gb").innerHTML='<div class="rps"><p>First to 3 wins</p><p class="big">You '+y+' – '+a+' Veronica</p><p class="big">'+(msg||"Pick one")+'</p><div><button class="gbtn" data-k="r">✊</button><button class="gbtn" data-k="p">✋</button><button class="gbtn" data-k="s">✌️</button></div></div>';
  }
  draw();
  $("gb").onclick=function(e){
   var k=e.target.dataset&&e.target.dataset.k;if(!k||over||me.cur!=="rps")return;
   var m=me.pick(["r","p","s"]),res=k===m?0:((k==="r"&&m==="s")||(k==="p"&&m==="r")||(k==="s"&&m==="p"))?1:-1;
   if(res>0)y++;else if(res<0)a++;
   var msg=E[k]+" vs "+E[m]+(res>0?" · you win this round":res<0?" · I win this round":" · draw");
   if(y===3||a===3){over=true;draw(msg);me.finish(y===3?"you":"ai");return}
   draw(msg);
   if(res<0&&Math.random()<.5)me.chat("[giggles] Got you!","happy");else if(res>0&&Math.random()<.4)me.chat("Hmph! Lucky.","pout");
  };
  me.onGive=function(){if(!over){over=true;me.finish("ai")}};
 }
};
Games.init();

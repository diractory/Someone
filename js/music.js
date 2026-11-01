var Music={
 DEFAULT:"Good Vibes | happy upbeat motivation energetic | https://open.spotify.com/playlist/6t0KlEnK1CZTbOn3Edn6qK\nLove and Soothing | romantic love soothing | https://open.spotify.com/playlist/2JqWpSuY1MzMTXsANe2ZgZ\nOld Classics | old retro classic kishore | https://open.spotify.com/playlist/4eiy225245KOvqTSzu2TYO\nSad and Comforting | sad old comfort | https://open.spotify.com/playlist/49stokSygRdVQgqDksIE6D",
 lib:[],cur:null,queue:null,resume:false,f:"all",t:null,
 load:function(){
  var me=this;me.lib=[];
  (S.get("v_music")===null?me.DEFAULT:S.get("v_music")).split("\n").forEach(function(l){var p=l.split("|").map(function(x){return x.trim()});if(p.length>=3&&p[2])me.lib.push({t:p[0],m:p[1].toLowerCase(),u:p.slice(2).join("|")})});
 },
 kind:function(u){return/\.(mp3|m4a|ogg|wav|aac|flac|opus)(\?|$)/i.test(u)?"audio":/spotify/i.test(u)?"spotify":/youtu\.?be/i.test(u)?"youtube":"link"},
 holding:function(){var a=$("aud");return!!(a&&this.cur&&!a.paused&&!a.ended)},
 find:function(q){
  var w=q.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(x){return x.length>2}),best=null,bs=0;
  this.lib.forEach(function(x){var h=x.t.toLowerCase(),s=0;w.forEach(function(y){if(h.indexOf(y)>-1)s++});if(s>bs){bs=s;best=x}});
  return bs>0?best:null;
 },
 want:function(s){
  if(/\b(sad|cry|crying|lonely|hurt|heartbroken|down|depress|depressed|upset|dukhi)\b/.test(s))return["sad","comfort","calm","soothing"];
  if(/\b(comfort|anxious|stress|stressed|tense|panic|relax|calm)\b/.test(s))return["calm","comfort","soothing","sad"];
  if(/\b(cheer|happy|party|dance|energy|energetic|upbeat|excited|workout|motivate|motivation|motivational|pump)\b/.test(s))return["motivation","happy","upbeat","energetic"];
  if(/\b(love|romantic|romance|date|tender)\b/.test(s))return["romantic","love","soothing"];
  if(/\b(old|retro|classic|classics|kishore|purane|purana)\b/.test(s))return["retro","classic","old"];
  if(/\b(sleep|bed|night|neend)\b/.test(s))return["sleep","calm","soothing"];
  if(/\b(study|focus|concentrate|read)\b/.test(s))return["study","focus","calm"];
  return null;
 },
 auto:function(want){
  var lib=this.lib,i,c;if(!lib.length)return null;
  if(want)for(i=0;i<want.length;i++){c=lib.filter(function(x){return x.m.indexOf(want[i])>-1});if(c.length)return c[Math.floor(Math.random()*c.length)]}
  return lib[Math.floor(Math.random()*lib.length)];
 },
 reply:function(song,w){
  var comfort=!!(w&&(w[0]==="calm"||w[0]==="comfort"||w[0]==="sad")),cheer=!!(w&&(w[0]==="happy"||w[0]==="motivation"));
  var r={mood:comfort?"tender":cheer?"excited":"happy",say:(comfort?"I’m right here with you. This one always helps: ":cheer?"Okay, let’s lift that mood. Playing ":"Here’s one I like: ")+song.t+"."};
  if(this.kind(song.u)==="audio")this.queue=song;else{r.label="Play “"+song.t+"”";r.url=song.u}
  return r;
 },
 match:function(t){
  var me=this,s=t.toLowerCase().replace(/[.!?,]/g,"").trim(),m,song,w;
  if(me.cur&&/^(stop|pause|band karo|rok do)(?: the)?(?: music| song| gaana| playing)?$/.test(s))return{mood:"calm",say:"Okay, music off.",run:function(){me.stop()}};
  if(me.cur&&/^(next|skip)(?: song| track| gaana)?$/.test(s))return{mood:"happy",say:"Okay, next one.",run:function(){me.next()}};
  if((m=s.match(/^(?:play|chala|lagao)\s+(.+)$/))&&!/\b(something|some|any|anything|songs?|music|playlist|gaana)\b/.test(m[1])&&(song=me.find(m[1])))return me.reply(song,null);
  if(/\b(play|put on|chala|lagao|sunao)\b.*\b(songs?|music|gaana|gane|playlist|something)\b/.test(s)||/\b(songs?|music) (to|for|that)\b/.test(s)||/^(comfort|cheer|motivate) me(?: up)? with (?:a )?(?:song|music)/.test(s)){
   if(!me.lib.length)return{mood:"hopeful",say:"I’d love to play something for you, but your music library is empty. Add your playlist in settings, under Music library."};
   w=me.want(s)||(window.Feel&&Feel.s.joy<40?["calm","comfort","soothing"]:null);
   return me.reply(me.auto(w),w);
  }
  return null;
 },
 play:function(s){
  var me=this,a=$("aud");
  me.cur=s;a.src=s.u;a.volume=1;me.resume=false;
  var p=a.play();
  if(p&&p.then)p.then(function(){Voice.stop();Voice.state("music");me.draw()}).catch(function(){me.draw()});
  me.draw();
 },
 cont:function(){var a=$("aud");if(!this.cur)return;var p=a.play();if(p&&p.catch)p.catch(function(){});Voice.stop();Voice.state("music");this.draw()},
 stop:function(){var a=$("aud");a.pause();this.cur=null;this.resume=false;clearTimeout(this.t);this.draw();Voice.listen()},
 next:function(auto){
  var me=this,c=me.cur,pool=me.lib.filter(function(x){return me.kind(x.u)==="audio"&&x!==c&&(!c||x.m===c.m)});
  if(pool.length)me.play(pool[Math.floor(Math.random()*pool.length)]);else if(auto)me.stop();
 },
 talk:function(){
  var me=this,a=$("aud");a.pause();me.resume=true;Voice.listen();
  clearTimeout(me.t);me.t=setTimeout(function(){if(!busy&&!Voice.speaking&&me.resume){me.resume=false;me.cont()}},12000);
 },
 afterSpeech:function(){
  var me=this;
  if(me.queue){var s=me.queue;me.queue=null;me.play(s);return true}
  if(me.resume){me.resume=false;me.cont();return true}
  return false;
 },
 duck:function(on){var a=$("aud");if(a&&this.cur&&!a.paused)a.volume=on?0.2:1},
 hint:function(){
  if(!this.lib.length)return"";
  return" The user’s music library (title, mood): "+this.lib.slice(0,25).map(function(x){return x.t+" ("+x.m+")"}).join("; ")+". To play one add [play:exact title] after the mood tag, chosen to fit how they feel: soothing and calm when they are sad, anxious or crying, upbeat when they want cheering up, romantic in tender moments, focus songs for study. Say in a few words why you picked it. To stop music add [stop-music]. Never write out song lyrics.";
 },
 draw:function(){
  var a=$("aud"),mp=$("mp");
  if(!this.cur){mp.style.display="none";return}
  mp.style.display="flex";$("mpt").textContent="♪ "+this.cur.t;$("mpp").textContent=a.paused?"▶":"⏸";
 },
 render:function(){
  var me=this,L=$("mlist"),F=$("mfilter");if(!L)return;
  var moods=["all"].concat(me.lib.map(function(x){return x.m}).filter(function(v,i,arr){return v&&arr.indexOf(v)===i}));
  F.innerHTML="";
  moods.forEach(function(m){var b=document.createElement("button");b.className="chp"+(m===me.f?" on":"");b.textContent=m;b.onclick=function(){me.f=m;me.render()};F.appendChild(b)});
  L.innerHTML="";
  me.lib.filter(function(x){return me.f==="all"||x.m===me.f}).forEach(function(s){
   var row=document.createElement("div"),sp=document.createElement("span"),sm=document.createElement("small"),b=document.createElement("button");
   row.className="tk";sp.textContent=s.t;sm.className="due";sm.textContent=" · "+s.m;sp.appendChild(sm);
   b.className="chp";b.textContent=me.kind(s.u)==="audio"?"▶ Play":"Open";
   b.onclick=function(){$("music").style.display="none";if(me.kind(s.u)==="audio")me.play(s);else window.open(s.u,"_blank")};
   row.appendChild(sp);row.appendChild(b);L.appendChild(row);
  });
  if(!L.children.length)L.innerHTML='<p class="note">No songs yet. Add your playlist in Settings, under Music library.</p>';
 },
 init:function(){
  var me=this,a=$("aud");me.load();me.render();
  $("musicbtn").onclick=function(){me.render();$("music").style.display="block"};
  $("musx").onclick=function(){$("music").style.display="none"};
  $("mpp").onclick=function(){if(a.paused){var p=a.play();if(p&&p.catch)p.catch(function(){});Voice.stop();Voice.state("music")}else{a.pause();Voice.listen()}me.draw()};
  $("mpn").onclick=function(){me.next()};
  $("mpx").onclick=function(){me.stop()};
  a.onended=function(){me.next(true)};
  a.onpause=function(){me.draw()};a.onplay=function(){me.draw()};
 }
};
Music.init();

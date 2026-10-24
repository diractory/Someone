var Actions={
 apps:{whatsapp:"com.whatsapp",instagram:"com.instagram.android",youtube:"com.google.android.youtube",spotify:"com.spotify.music",telegram:"org.telegram.messenger",gmail:"com.google.android.gm",maps:"com.google.android.apps.maps",chrome:"com.android.chrome",snapchat:"com.snapchat.android",facebook:"com.facebook.katana"},
 alias:{"whats app":"whatsapp","insta":"instagram","you tube":"youtube","google maps":"maps","map":"maps","gmail":"gmail","mail":"gmail"},
 match:function(t){
  var s=t.toLowerCase().replace(/[.!?,]/g,"").trim(),m;
  if((m=s.match(/^(?:search|google)\s+(.+)$/)))return{label:"Search “"+m[1]+"”",url:"https://www.google.com/search?q="+encodeURIComponent(m[1]),say:"Okay, tap the button and I’ll show you the results."};
  if((m=s.match(/^play\s+(.+?)(?:\s+on\s+youtube)?$/)))return{label:"Play “"+m[1]+"”",url:"https://www.youtube.com/results?search_query="+encodeURIComponent(m[1]),say:"Mm, nice choice. Tap the button and it’s yours."};
  if(!/\b(open|launch|start|kholo|khol|chalu)\b/.test(s))return null;
  var names=Object.keys(this.apps).concat(Object.keys(this.alias));
  for(var i=0;i<names.length;i++){
   if(s.indexOf(names[i])>-1){
    var key=this.alias[names[i]]||names[i],nice=key.charAt(0).toUpperCase()+key.slice(1);
    return{label:"Open "+nice,url:"intent://#Intent;package="+this.apps[key]+";end",say:"Sure. Tap the button and I’ll open "+nice+" for you."};
   }
  }
  return null;
 }
};

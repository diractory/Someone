var Actions={
 apps:{whatsapp:"com.whatsapp",instagram:"com.instagram.android",youtube:"com.google.android.youtube",spotify:"com.spotify.music",telegram:"org.telegram.messenger",gmail:"com.google.android.gm",maps:"com.google.android.apps.maps",chrome:"com.android.chrome",snapchat:"com.snapchat.android",facebook:"com.facebook.katana"},
 alias:{"whats app":"whatsapp","insta":"instagram","you tube":"youtube","google maps":"maps","map":"maps","gmail":"gmail","mail":"gmail"},
 contacts:function(){
  var o={};(S.get("v_contacts")||"").split("\n").forEach(function(l){var p=l.split("=");if(p.length>1){var n=p[0].trim().toLowerCase(),v=p.slice(1).join("=").replace(/[^\d+]/g,"");if(/^\d{10}$/.test(v))v="+91"+v;if(n&&v)o[n]=v}});return o;
 },
 find:function(name){
  var c=this.contacts(),n=name.toLowerCase().trim();if(c[n])return[n,c[n]];
  var k=Object.keys(c).filter(function(x){return x.indexOf(n)>-1||n.indexOf(x)>-1});return k.length?[k[0],c[k[0]]]:null;
 },
 match:function(t){
  var s=t.toLowerCase().replace(/[.!?,]/g,"").trim(),m;
  if((m=s.match(/^(?:call|phone|dial)\s+(?:karo\s+)?(.+)$/))||(m=s.match(/^(.+?)\s+ko\s+(?:call|phone)(?:\s+karo)?$/))){
   var f=this.find(m[1]);
   if(!f)return{say:"I don’t have “"+m[1]+"” in your contacts yet. Add them in settings, like Mom=+919876543210."};
   return{label:"Call "+f[0],url:"tel:"+f[1],say:"Okay, tap the button and I’ll call "+f[0]+" for you."};
  }
  if((m=s.match(/^(?:message|msg|text|whatsapp)\s+(\S+)\s+(?:that\s+|ki\s+)?(.+)$/))){
   var g=this.find(m[1]);
   if(!g)return{say:"I don’t have “"+m[1]+"” in your contacts yet. Add them in settings, like Mom=+919876543210."};
   return{label:"WhatsApp "+g[0],url:"https://wa.me/"+g[1].replace(/^\+/,"")+"?text="+encodeURIComponent(m[2]),say:"Written. Tap the button, check it, and press send."};
  }
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

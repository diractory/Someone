var Phone={
 ts:null,
 SET:[[/air ?plane|aeroplane|flight mode/,"AIRPLANE_MODE_SETTINGS","Airplane mode"],[/wi-?fi/,"WIFI_SETTINGS","Wi-Fi"],[/bluetooth/,"BLUETOOTH_SETTINGS","Bluetooth"],[/brightness|display/,"DISPLAY_SETTINGS","Display"],[/volume|sound|silent|do not disturb|dnd/,"SOUND_SETTINGS","Sound"],[/battery saver|power saving/,"BATTERY_SAVER_SETTINGS","Battery saver"],[/location|gps/,"LOCATION_SOURCE_SETTINGS","Location"],[/hotspot|mobile data|internet data/,"WIRELESS_SETTINGS","Network"]],
 handle:async function(t){
  var s=t.toLowerCase().replace(/[.!?,]/g,"").trim(),m,i,short=s.split(/\s+/).length<=8;
  var verb=/\b(turn|switch|toggle|on|off|enable|disable|open|chalu|band|kholo|karo|start|stop)\b/.test(s);
  if(short&&verb&&/\b(flash ?light|torch)\b/.test(s)){
   var on=!/\b(off|band|stop)\b/.test(s),ok=await this.torch(on);
   return{mood:ok?"happy":"worried",say:ok?(on?"Flashlight on. Let there be light.":"Flashlight off."):"I couldn’t reach the flashlight. Your browser may not allow it, or the camera permission is off."};
  }
  if(short&&/\bbattery\b/.test(s)&&/(how much|level|percent|kitni|status|charge|left)/.test(s)&&!/saver/.test(s)){
   try{var b=await navigator.getBattery();return{mood:"calm",say:"Your battery is at "+Math.round(b.level*100)+" percent"+(b.charging?" and charging.":".")}}
   catch(e){return{mood:"worried",say:"Your browser won’t tell me the battery level."}}
  }
  if((m=s.match(/^(?:navigate|directions?|route|take me)(?: to)?\s+(.+)$/)))return{label:"Navigate to "+m[1],url:"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(m[1]),say:"Okay, tap the button and Maps will guide you."};
  if((m=s.match(/^sms\s+(\S+)\s+(.+)$/))){
   var f=Actions.find(m[1]);if(!f)return{say:"I don’t have “"+m[1]+"” in your contacts yet."};
   return{label:"SMS "+f[0],url:"sms:"+f[1]+"?body="+encodeURIComponent(m[2]),say:"Drafted. Tap the button, check it, and press send."};
  }
  if(/^(copy|copy that|copy the code|copy this)$/.test(s)){
   var c=document.querySelectorAll("#log pre code");
   if(c.length){try{await navigator.clipboard.writeText(c[c.length-1].textContent);return{mood:"happy",say:"Copied the last code to your clipboard."}}catch(e){}}
   return{mood:"worried",say:"I couldn’t copy that. Tap the Copy button on the code box."};
  }
  if(short&&verb)for(i=0;i<this.SET.length;i++)if(this.SET[i][0].test(s))return{label:"Open "+this.SET[i][2]+" settings",url:"intent:#Intent;action=android.settings."+this.SET[i][1]+";end",say:"I can’t flip "+this.SET[i][2]+" myself, because Android doesn’t let web pages change settings. Tap the button and it takes you right to the switch."};
  return null;
 },
 torch:async function(on){
  try{
   if(!on){if(this.ts){this.ts.getTracks().forEach(function(x){x.stop()});this.ts=null}return true}
   var st=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}),tr=st.getVideoTracks()[0],c=tr.getCapabilities&&tr.getCapabilities();
   if(!c||!c.torch){st.getTracks().forEach(function(x){x.stop()});return false}
   await tr.applyConstraints({advanced:[{torch:true}]});this.ts=st;return true;
  }catch(e){return false}
 }
};

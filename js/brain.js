var Brain={
 idx:0,cool:{},
 keys:function(){return(S.get("v_keys")||"").split(/\s+/).filter(function(k){return k.length>15})},
 msgs:function(hist,asst){
  var out=[];
  hist.slice(-24).forEach(function(m){
   var role=m.r==="me"?"user":asst,last=out[out.length-1],tt=m.t.replace(/\*([^*]{2,24})\*/g,"[$1]");
   if(last&&last.role===role)last.text+="\n"+tt;else out.push({role:role,text:tt});
  });
  while(out.length&&out[0].role!=="user")out.shift();
  return out;
 },
 call:async function(key,hist,sys){
  var p=detect(key),c=CFG.providers[p],ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},30000),r,j,text="";
  try{
   if(p==="gemini"){
    var ms=this.msgs(hist,"model").map(function(m){return{role:m.role,parts:[{text:m.text}]}});
    r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+c.model+":generateContent",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:ms,generationConfig:{temperature:1,maxOutputTokens:2000}})});
    j=await r.json().catch(function(){return{}});
    if(r.ok)text=((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[]).map(function(x){return x.text||""}).join("");
   }else{
    var os=[{role:"system",content:sys}].concat(this.msgs(hist,"assistant").map(function(m){return{role:m.role,content:m.text}}));
    r=await fetch(c.url,{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:c.model,messages:os,temperature:1,max_tokens:1200})});
    j=await r.json().catch(function(){return{}});
    if(r.ok)text=(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||"";
   }
   if(!r.ok)throw{status:r.status,msg:(j.error&&(j.error.message||j.error))||("HTTP "+r.status)};
   if(!text)throw{status:0,msg:"empty reply"};
   return text;
  }finally{clearTimeout(t)}
 },
 PRI:{gemini:0,groq:1,cerebras:2,openrouter:3,mistral:4},fails:{},links:[],
 order:function(){
  var me=this,ks=me.keys(),n=Math.max(1,ks.length),r;
  if(S.get("v_pref")==="0"){r=me.idx%n;return ks.slice(r).concat(ks.slice(0,r))}
  return ks.map(function(k,i){return[k,i]}).sort(function(a,b){return(me.PRI[detect(a[0])]-me.PRI[detect(b[0])])||(a[1]-b[1])}).map(function(x){return x[0]});
 },
 bad:function(k,e){var f=(this.fails[k]=(this.fails[k]||0)+1),base=(e&&(e.status===401||e.status===403))?600000:60000;this.cool[k]=Date.now()+Math.min(base*Math.pow(2,f-1),1800000)},
 good:function(k){this.fails[k]=0;if(S.get("v_pref")==="0")this.idx++},
 ask:async function(hist,sys){
  var me=this,ks=me.order(),last=null,i,k,text;
  if(!ks.length)throw{nokeys:true};
  for(i=0;i<ks.length;i++){
   k=ks[i];if((me.cool[k]||0)>Date.now())continue;
   try{text=await me.call(k,hist,sys);me.good(k);return text}catch(e){last=e;me.bad(k,e)}
  }
  throw last||{msg:"All keys are resting. Try again in a minute."};
 },
 askWeb:async function(hist,sys){
  var me=this,ks=me.order().filter(function(k){return detect(k)==="gemini"&&(me.cool[k]||0)<=Date.now()}),i,k,r,j,ctl,t,c,text,seen,ms=me.msgs(hist,"model").map(function(m){return{role:m.role,parts:[{text:m.text}]}});
  me.links=[];
  for(i=0;i<ks.length;i++){
   k=ks[i];ctl=new AbortController();t=setTimeout(function(){ctl.abort()},40000);
   try{
    r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+CFG.providers.gemini.model+":generateContent",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","x-goog-api-key":k},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:ms,tools:[{google_search:{}}],generationConfig:{temperature:1,maxOutputTokens:2000}})});
    j=await r.json().catch(function(){return{}});
    if(!r.ok)throw{status:r.status,msg:(j.error&&j.error.message)||("HTTP "+r.status)};
    c=j.candidates&&j.candidates[0];text=((c&&c.content&&c.content.parts)||[]).map(function(p){return p.text||""}).join("");
    if(!text)throw{status:0,msg:"empty reply"};
    seen={};me.links=((c.groundingMetadata&&c.groundingMetadata.groundingChunks)||[]).filter(function(x){return x.web&&x.web.uri&&!seen[x.web.uri]&&(seen[x.web.uri]=1)}).slice(0,4).map(function(x){return{title:x.web.title||"Source",uri:x.web.uri}});
    clearTimeout(t);me.good(k);return text;
   }catch(e){clearTimeout(t);me.bad(k,e)}
  }
  return me.ask(hist,sys);
 }
};

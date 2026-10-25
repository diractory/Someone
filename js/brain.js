var Brain={
 idx:0,cool:{},
 keys:function(){return(S.get("v_keys")||"").split(/\s+/).filter(function(k){return k.length>15})},
 msgs:function(hist,asst){
  var out=[];
  hist.slice(-17).forEach(function(m){
   var role=m.r==="me"?"user":asst,last=out[out.length-1],tt=m.t.replace(/\*([^*]{2,24})\*/g,"[$1]");
   if(last&&last.role===role)last.text+="\n"+tt;else out.push({role:role,text:tt});
  });
  while(out.length&&out[0].role!=="user")out.shift();
  return out;
 },
 call:async function(key,hist,sys){
  var p=detect(key),c=CFG.providers[p],ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},20000),r,j,text="";
  try{
   if(p==="gemini"){
    var ms=this.msgs(hist,"model").map(function(m){return{role:m.role,parts:[{text:m.text}]}});
    r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+c.model+":generateContent",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:ms,generationConfig:{temperature:1,maxOutputTokens:700}})});
    j=await r.json().catch(function(){return{}});
    if(r.ok)text=((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[]).map(function(x){return x.text||""}).join("");
   }else{
    var os=[{role:"system",content:sys}].concat(this.msgs(hist,"assistant").map(function(m){return{role:m.role,content:m.text}}));
    r=await fetch(c.url,{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:c.model,messages:os,temperature:1,max_tokens:300})});
    j=await r.json().catch(function(){return{}});
    if(r.ok)text=(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||"";
   }
   if(!r.ok)throw{status:r.status,msg:(j.error&&(j.error.message||j.error))||("HTTP "+r.status)};
   if(!text)throw{status:0,msg:"empty reply"};
   return text;
  }finally{clearTimeout(t)}
 },
 ask:async function(hist,sys){
  var ks=this.keys(),n=ks.length,last=null;
  if(!n)throw{nokeys:true};
  for(var i=0;i<n;i++){
   var k=ks[(this.idx+i)%n];
   if((this.cool[k]||0)>Date.now())continue;
   try{var text=await this.call(k,hist,sys);this.idx=(this.idx+i)%n;return text}
   catch(e){last=e;this.cool[k]=Date.now()+((e.status===401||e.status===403)?600000:45000)}
  }
  throw last||{msg:"All keys are resting. Try again in a minute."};
 }
};

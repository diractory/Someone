var Cmds={
 list:function(){
  var o=[];
  (S.get("v_cmds")||"").split("\n").forEach(function(l){var i=l.indexOf("=>");if(i>0){var p=l.slice(0,i).trim().toLowerCase().replace(/[.!?,]/g,""),a=l.slice(i+2).trim();if(p&&a)o.push([p,a])}});
  return o;
 },
 match:function(t){
  var s=t.toLowerCase().replace(/[.!?,]/g,"").replace(/\s+/g," ").trim(),L=this.list(),i,p;
  for(i=0;i<L.length;i++){p=L[i][0];if(s===p||(p.split(" ").length>=2&&s.indexOf(p)>-1))return this.run(L[i][1])}
  return null;
 },
 run:function(a){
  var r={mood:"happy",say:""};
  a.split(";").forEach(function(x){
   x=x.trim();var m=x.match(/^(say|open|play|call|mood)\s*:\s*(.+)$/i);if(!m)return;
   var k=m[1].toLowerCase(),v=m[2].trim(),sg,f;
   if(k==="say")r.say=(r.say?r.say+" ":"")+v;
   else if(k==="mood")r.mood=v.toLowerCase();
   else if(k==="open"){if(/^(javascript|data|vbscript):/i.test(v))return;r.url=/^(https?|tel|sms|mailto|spotify|whatsapp|geo|vnd\.youtube):/i.test(v)?v:"https://"+v;r.label="Open "+v.replace(/^https?:\/\//,"").slice(0,26)}
   else if(k==="play"){sg=Music.find(v);if(sg){if(Music.kind(sg.u)==="audio")Music.queue=sg;else{r.url=sg.u;r.label="Play “"+sg.t+"”"}}}
   else if(k==="call"){f=Actions.find(v);if(f){r.url="tel:"+f[1];r.label="Call "+f[0]}}
  });
  if(!r.say)r.say="Okay!";
  return r;
 }
};

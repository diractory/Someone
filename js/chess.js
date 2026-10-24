var CH=(function(){
 var N=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],K=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],B=[[-1,-1],[-1,1],[1,-1],[1,1]],R=[[-1,0],[1,0],[0,-1],[0,1]];
 var VAL={p:100,n:320,b:330,r:500,q:900,k:0};
 function col(p){return p===p.toUpperCase()?"w":"b"}
 function init(){var b=Array(64).fill(null),back="rnbqkbnr";for(var c=0;c<8;c++){b[c]=back[c];b[8+c]="p";b[48+c]="P";b[56+c]=back[c].toUpperCase()}return{b:b,t:"w",c:{K:1,Q:1,k:1,q:1},ep:-1,n:0}}
 function att(b,sq,by){
  var r=sq>>3,c=sq&7,i,d,rr,cc,p,pr=by==="w"?r+1:r-1;
  for(d=-1;d<=1;d+=2){cc=c+d;if(pr>=0&&pr<8&&cc>=0&&cc<8&&b[pr*8+cc]===(by==="w"?"P":"p"))return true}
  for(i=0;i<8;i++){rr=r+N[i][0];cc=c+N[i][1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(by==="w"?"N":"n"))return true}
  for(i=0;i<8;i++){rr=r+K[i][0];cc=c+K[i][1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(by==="w"?"K":"k"))return true}
  var D=[B,R];
  for(var k=0;k<2;k++)for(i=0;i<4;i++){rr=r+D[k][i][0];cc=c+D[k][i][1];
   while(rr>=0&&rr<8&&cc>=0&&cc<8){p=b[rr*8+cc];if(p){var u=p.toLowerCase();if(col(p)===by&&(u==="q"||(k===0&&u==="b")||(k===1&&u==="r")))return true;break}rr+=D[k][i][0];cc+=D[k][i][1]}}
  return false;
 }
 function pseudo(s){
  var b=s.b,t=s.t,ms=[],sq,p,r,c,u,i,rr,cc,to,q,d,dirs,dr,sr,pr;
  for(sq=0;sq<64;sq++){
   p=b[sq];if(!p||col(p)!==t)continue;r=sq>>3;c=sq&7;u=p.toLowerCase();
   if(u==="p"){
    dr=t==="w"?-1:1;sr=t==="w"?6:1;pr=t==="w"?0:7;rr=r+dr;if(rr<0||rr>7)continue;
    if(!b[rr*8+c]){ms.push({f:sq,t:rr*8+c,p:rr===pr});if(r===sr&&!b[(r+2*dr)*8+c])ms.push({f:sq,t:(r+2*dr)*8+c})}
    for(d=-1;d<=1;d+=2){cc=c+d;if(cc<0||cc>7)continue;to=rr*8+cc;q=b[to];
     if(q&&col(q)!==t)ms.push({f:sq,t:to,p:rr===pr});else if(!q&&to===s.ep)ms.push({f:sq,t:to,e:1})}
   }else if(u==="n"||u==="k"){
    dirs=u==="n"?N:K;
    for(i=0;i<8;i++){rr=r+dirs[i][0];cc=c+dirs[i][1];if(rr<0||rr>7||cc<0||cc>7)continue;to=rr*8+cc;q=b[to];if(!q||col(q)!==t)ms.push({f:sq,t:to})}
    if(u==="k"){
     if(t==="w"&&sq===60){
      if(s.c.K&&!b[61]&&!b[62]&&b[63]==="R"&&!att(b,60,"b")&&!att(b,61,"b"))ms.push({f:60,t:62,cs:1});
      if(s.c.Q&&!b[59]&&!b[58]&&!b[57]&&b[56]==="R"&&!att(b,60,"b")&&!att(b,59,"b"))ms.push({f:60,t:58,cs:1});
     }
     if(t==="b"&&sq===4){
      if(s.c.k&&!b[5]&&!b[6]&&b[7]==="r"&&!att(b,4,"w")&&!att(b,5,"w"))ms.push({f:4,t:6,cs:1});
      if(s.c.q&&!b[3]&&!b[2]&&!b[1]&&b[0]==="r"&&!att(b,4,"w")&&!att(b,3,"w"))ms.push({f:4,t:2,cs:1});
     }
    }
   }else{
    dirs=u==="b"?B:u==="r"?R:B.concat(R);
    for(i=0;i<dirs.length;i++){rr=r+dirs[i][0];cc=c+dirs[i][1];
     while(rr>=0&&rr<8&&cc>=0&&cc<8){to=rr*8+cc;q=b[to];if(!q)ms.push({f:sq,t:to});else{if(col(q)!==t)ms.push({f:sq,t:to});break}rr+=dirs[i][0];cc+=dirs[i][1]}}
   }
  }
  return ms;
 }
 function apply(s,m){
  var b=s.b.slice(),p=b[m.f],t=s.t,c={K:s.c.K,Q:s.c.Q,k:s.c.k,q:s.c.q},ep=-1;
  b[m.f]=null;
  if(m.e)b[(m.f>>3)*8+(m.t&7)]=null;
  if(m.cs){if(m.t>m.f){b[m.t-1]=b[m.t+1];b[m.t+1]=null}else{b[m.t+1]=b[m.t-2];b[m.t-2]=null}}
  b[m.t]=m.p?(t==="w"?"Q":"q"):p;
  if((p==="P"||p==="p")&&Math.abs(m.t-m.f)===16)ep=(m.f+m.t)/2;
  if(p==="K"){c.K=0;c.Q=0}if(p==="k"){c.k=0;c.q=0}
  if(m.f===63||m.t===63)c.K=0;if(m.f===56||m.t===56)c.Q=0;if(m.f===7||m.t===7)c.k=0;if(m.f===0||m.t===0)c.q=0;
  return{b:b,t:t==="w"?"b":"w",c:c,ep:ep,n:s.n+1};
 }
 function king(b,t){return b.indexOf(t==="w"?"K":"k")}
 function inCheck(s){return att(s.b,king(s.b,s.t),s.t==="w"?"b":"w")}
 function legal(s){
  var ms=pseudo(s),out=[],i,ns,o=s.t==="w"?"b":"w";
  for(i=0;i<ms.length;i++){ns=apply(s,ms[i]);if(!att(ns.b,king(ns.b,s.t),o))out.push(ms[i])}
  return out;
 }
 function ev(s){
  var v=0,b=s.b,i,p,u,r,c,x,cen;
  for(i=0;i<64;i++){p=b[i];if(!p)continue;u=p.toLowerCase();r=i>>3;c=i&7;x=VAL[u];cen=7-(Math.abs(c-3.5)+Math.abs(r-3.5));
   if(u==="n"||u==="b")x+=cen*3;else if(u==="p")x+=(p==="P"?6-r:r-1)*5+((c>1&&c<6)?3:0);else if(u==="q")x+=cen;
   v+=col(p)==="w"?x:-x}
  return s.t==="w"?v:-v;
 }
 function ord(s,m){var q=s.b[m.t];return q?VAL[q.toLowerCase()]*10-VAL[s.b[m.f].toLowerCase()]:0}
 function nega(s,d,a,b){
  var ms=legal(s);
  if(!ms.length)return inCheck(s)?-99000-d:0;
  if(d===0)return ev(s);
  ms.sort(function(x,y){return ord(s,y)-ord(s,x)});
  for(var i=0;i<ms.length;i++){var v=-nega(apply(s,ms[i]),d-1,-b,-a);if(v>a)a=v;if(a>=b)break}
  return a;
 }
 function best(s){
  var ms=legal(s),sc=[],i,mx=-1e9,pool=[];
  if(!ms.length)return null;
  for(i=0;i<ms.length;i++){var v=-nega(apply(s,ms[i]),1,-1e9,1e9);sc.push(v);if(v>mx)mx=v}
  for(i=0;i<ms.length;i++)if(sc[i]>=mx-25)pool.push(ms[i]);
  return pool[Math.floor(Math.random()*pool.length)];
 }
 return{init:init,legal:legal,apply:apply,inCheck:inCheck,best:best,col:col};
})();

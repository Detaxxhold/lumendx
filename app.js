var lang="en";
var LANGS={en:"English",ru:"Русский",ky:"Кыргызча"};
var SUF={en:" football",ru:" футбол",ky:" футбол"};
var results=[],cur="",TM={},MM={};
var LEG1="<span style='color:var(--ac)'>■</span> Champions League &nbsp;<span style='color:#f5a623'>■</span> Europa League &nbsp;<span style='color:#4caf50'>■</span> Conference League &nbsp;<span style='color:#e53935'>■</span> Relegation";
var LEG2="<span style='color:var(--ac)'>■</span> Round of 16 &nbsp;<span style='color:#f5a623'>■</span> Playoff &nbsp;<span style='color:#e53935'>■</span> Out";
var LG={
 PD:{n:"La Liga",z:[4,5,6,18],l:LEG1},
 PL:{n:"Premier League",z:[4,5,6,18],l:LEG1},
 SA:{n:"Serie A",z:[4,5,6,18],l:LEG1},
 BL1:{n:"Bundesliga",z:[4,5,6,17],l:LEG1},
 FL1:{n:"Ligue 1",z:[4,5,6,17],l:LEG1},
 CL:{n:"Champions League",z:[8,24,24,25],l:LEG2},
 DED:{n:"Eredivisie",z:[0,0,0,999],l:""},
 PPL:{n:"Primeira Liga",z:[0,0,0,999],l:""},
 ELC:{n:"Championship",z:[0,0,0,999],l:""},
 BSA:{n:"Brasileirão",z:[0,0,0,999],l:""}
};
var MAIN=["PD","PL","SA","BL1","FL1","CL"];
var OT=["DED","PPL","ELC","BSA"];

/* ===== Icons ===== */
function ic(p){return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var BALL=ic('<circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z"/><path d="M12 3v5M15.5 10.5L20 9M14.2 14.5l2.8 3.8M9.8 14.5L7 18.3M8.5 10.5L4 9"/>');

/* ===== Settings core ===== */
var ACC={gold:["#d4a64a","#a8751c","#1a1200","#ffffff"],green:["#3ddc84","#12a150","#04210f","#ffffff"],blue:["#3b6bff","#2a52e0","#ffffff","#ffffff"],red:["#ff6b6b","#d62f2f","#2a0505","#ffffff"],purple:["#8b5cf6","#6d3fd6","#ffffff","#ffffff"]};
function sGet(k,d){try{var v=localStorage.getItem("s_"+k);return v===null?(k=="acc"?"blue":d):v}catch(e){return k=="acc"?"blue":d}}
function sSet(k,v){try{localStorage.setItem("s_"+k,v)}catch(e){}}
function applyAll(){
 var m=sGet("mode","dark");
 var light=m=="light"||(m=="system"&&window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches);
 document.body.classList.toggle("light",light);
 var ac=ACC[sGet("acc","blue")]||ACC.blue;
 document.body.style.setProperty("--ac",light?ac[1]:ac[0]);
 document.body.style.setProperty("--acd",light?ac[3]:ac[2]);
 var z={s:"0.9",m:"1",l:"1.15"}[sGet("fs","m")]||"1";
 document.getElementById("app").style.zoom=z;
 document.body.classList.toggle("nt",sGet("nt","0")=="1");
 document.body.classList.toggle("ns",sGet("ns","0")=="1");
}

/* ===== Wikipedia search ===== */
function api(p){
 var u="https://"+lang+".wikipedia.org/w/api.php?format=json&origin=*";
 for(var k in p)u+="&"+k+"="+encodeURIComponent(p[k]);
 return fetch(u).then(function(r){return r.json()});
}
function clean(s){return s.replace(/<[^>]+>/g,"").replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&#039;/g,"'")}
function search(exact){
 var q=document.getElementById("q").value.trim();
 var app=document.getElementById("app");
 if(!q)return;
 cur="";navOn(0);setupLeagues();
 app.innerHTML="<div class='msg'>Searching...</div>";
 api({action:"query",list:"search",srsearch:exact?q:q+SUF[lang],srlimit:20,srprop:"snippet"}).then(function(d){
  results=d.query.search;
  if(!results.length){app.innerHTML="<div class='msg'>Nothing found. Try another word or language.</div>";return}
  app.innerHTML=results.map(function(r,i){
   return "<div class='res' onclick='openArt("+i+")'><h3>"+clean(r.title)+"</h3><p>"+clean(r.snippet)+"...</p></div>"}).join("");
  window.scrollTo(0,0);
 }).catch(function(){app.innerHTML="<div class='msg'>No internet or error. Try again.</div>"});
}
function openArt(i){
 var title=results[i].title;
 var app=document.getElementById("app");
 app.innerHTML="<div class='msg'>Loading...</div>";
 api({action:"query",prop:"extracts|pageimages",explaintext:1,exsectionformat:"plain",piprop:"thumbnail",pithumbsize:700,titles:title,redirects:1}).then(function(d){
  var pg=d.query.pages;var p=pg[Object.keys(pg)[0]];
  var s="<div class='art'><button class='back' onclick='back()'>← Back</button>";
  if(p.thumbnail)s+="<img src='"+p.thumbnail.source+"'>";
  s+="<h1>"+p.title+"</h1>";
  (p.extract||"No text.").split("\n").forEach(function(l){
   l=l.trim();if(!l)return;
   if(l.length<60&&!/[.!?]$/.test(l))s+="<h2>"+l.replace(/=/g,"")+"</h2>";
   else s+="<p>"+l+"</p>"});
  s+="<p><a target='_blank' href='https://"+lang+".wikipedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_"))+"'>Open on Wikipedia →</a></p></div>";
  app.innerHTML=s;window.scrollTo(0,0);
 }).catch(function(){app.innerHTML="<div class='msg'>Error. Try again.</div>"});
}
function back(){
 document.getElementById("app").innerHTML=results.map(function(r,i){
  return "<div class='res' onclick='openArt("+i+")'><h3>"+clean(r.title)+"</h3><p>"+clean(r.snippet)+"...</p></div>"}).join("");
}

/* ===== Top bars ===== */
function setup(){
 document.getElementById("langs").innerHTML=Object.keys(LANGS).map(function(l){
  return "<button class='"+(l==lang?"on":"")+"' onclick='setLang(\""+l+"\")'>"+LANGS[l]+"</button>"}).join("");
 setupLeagues();
}
function setupLeagues(){
 var h=MAIN.map(function(k){return "<button class='liga-btn"+(k==cur?" sel":"")+"' onclick='openLeague(\""+k+"\")'>"+LG[k].n+"</button>"}).join("");
 var more=cur&&MAIN.indexOf(cur)<0;
 h+="<button class='liga-btn"+(more?" sel":"")+"' onclick='openMore()'>More</button>";
 document.getElementById("leagues").innerHTML=h;
}
function setLang(l){lang=l;setup();if(document.getElementById("q").value)search()}
function openMore(){
 cur="MORE";navOn(0);setupLeagues();
 var s="<div class='art'><button class='back' onclick='home()'>← Back to Home</button><h1>More leagues</h1><div style='display:flex;flex-wrap:wrap;gap:8px'>"+OT.map(function(k){return "<button class='liga-btn' onclick='openLeague(\""+k+"\")'>"+LG[k].n+"</button>"}).join("")+"</div></div>";
 document.getElementById("app").innerHTML=s;
 window.scrollTo(0,0);
}

/* ===== League pages ===== */
function fd(name){
 return fetch("data/"+cur+"_"+name+".json?t="+Date.now()).then(function(r){
  if(!r.ok)throw new Error("Data is not ready yet. Try again later.");
  return r.json()});
}
function fdc(code,name){
 return fetch("data/"+code+"_"+name+".json?t="+Date.now()).then(function(r){if(!r.ok)throw new Error("x");return r.json()});
}
function cr(t){
 if(!t||!t.crest)return "";
 var u=t.crest,p=u.replace(/\.svg$/,".png");
 return "<img class='cr' src='"+p+"' alt='' loading='lazy' onerror=\"if(this.src!=='"+u+"'){this.src='"+u+"'}else{this.remove()}\">";
}
function nm(t){return t.shortName||t.name||"?"}
function shell(code,bk,lbl){
 document.getElementById("app").innerHTML="<div class='art'><button class='back' onclick='"+bk+"'>"+lbl+"</button><h1>"+LG[code].n+"</h1><div class='liga-nav'><button class='liga-nav-btn' id='n1' onclick='tabTable()'>Table</button><button class='liga-nav-btn' id='n2' onclick='tabMatches()'>Matches</button><button class='liga-nav-btn' id='n3' onclick='tabScorers()'>Scorers</button><button class='liga-nav-btn' id='n4' onclick='tabStats()'>Stats</button></div><div id='lc'></div></div>";
}
function openLeague(code){
 cur=code;navOn(0);setupLeagues();
 shell(code,"home()","← Back to Home");
 tabTable();window.scrollTo(0,0);
}
function act(id){
 ["n1","n2","n3","n4"].forEach(function(x){var e=document.getElementById(x);if(e)e.classList.toggle("active",x==id)});
 document.getElementById("lc").innerHTML="<div class='msg'>Loading...</div>";
}
function fail(e){document.getElementById("lc").innerHTML="<div class='msg'>"+(e.message||"Error.")+"</div>"}
function mrow(k,v){
 return "<div style='display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--bd)'><span style='color:var(--mu)'>"+k+"</span><b style='text-align:right'>"+v+"</b></div>";
}

/* ----- Table ----- */
function tabTable(){
 act("n1");
 var z=LG[cur].z;
 fd("standings").then(function(d){
  var t=d.standings[0].table;
  var s="<div class='sub'>Season "+d.season.startDate.slice(0,4)+"/"+d.season.endDate.slice(2,4)+(d.season.currentMatchday?" · Matchday "+d.season.currentMatchday:"")+"</div>";
  s+="<div class='tw'><table class='st'><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr>";
  t.forEach(function(r){
   var p=r.position;
   var c=p>=z[3]?"rel":p<=z[0]?"cl":p<=z[1]?"el":p<=z[2]?"co":"";
   var gd=r.goalDifference>0?"+"+r.goalDifference:r.goalDifference;
   s+="<tr class='"+c+"'><td>"+p+"</td><td style='cursor:pointer' onclick='openTeam("+r.team.id+")'>"+cr(r.team)+nm(r.team)+"</td><td>"+r.playedGames+"</td><td>"+r.won+"</td><td>"+r.draw+"</td><td>"+r.lost+"</td><td>"+gd+"</td><td class='pts'>"+r.points+"</td></tr>"});
  s+="</table></div><div class='legend'>"+LG[cur].l+"<br>Tap a team name to see its matches.</div>";
  document.getElementById("lc").innerHTML=s;
 }).catch(fail);
}

/* ----- Matches ----- */
function card(m){
 MM[m.id]=m;
 var h=m.score.fullTime.home,a=m.score.fullTime.away;
 var d=new Date(m.utcDate);
 var ds=d.toLocaleDateString(undefined,{day:"numeric",month:"short"})+" "+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
 var sc=(h===null||a===null)?"vs":h+" - "+a;
 return "<div class='mc' style='cursor:pointer' onclick='openMatch("+m.id+")'><div class='d'>Matchday "+m.matchday+" · "+ds+"</div><div class='r'><div class='t'>"+cr(m.homeTeam)+nm(m.homeTeam)+"<br>"+cr(m.awayTeam)+nm(m.awayTeam)+"</div><div class='sc'>"+sc+"</div></div></div>";
}
function openMatch(id){
 var m=MM[id];if(!m)return;
 var s=m.score||{},ft=s.fullTime||{},ht=s.halfTime||{},pn=s.penalties;
 var has=ft.home!==null&&ft.home!==undefined;
 var d=new Date(m.utcDate);
 var when=d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})+" · "+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
 var stt={FINISHED:"Finished",TIMED:"Scheduled",SCHEDULED:"Scheduled",IN_PLAY:"Live",PAUSED:"Half-time",POSTPONED:"Postponed",CANCELLED:"Cancelled"}[m.status]||m.status;
 var ref=(m.referees&&m.referees.length)?m.referees.map(function(r){return r.name}).join(", "):"-";
 var win=s.winner=="HOME_TEAM"?nm(m.homeTeam):s.winner=="AWAY_TEAM"?nm(m.awayTeam):s.winner=="DRAW"?"Draw":"-";
 var big=has?ft.home+" - "+ft.away:"vs";
 var x="<button class='back' onclick='tabMatches()'>← Back to matches</button>";
 x+="<div style='display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:center;margin:10px 0 18px'>";
 x+="<div style='flex:1'><img src='"+(m.homeTeam.crest||"")+"' style='width:56px;height:56px;object-fit:contain' onerror=\"this.style.display='none'\"><div style='font-weight:bold;margin-top:6px'>"+nm(m.homeTeam)+"</div></div>";
 x+="<div class='sc' style='font-size:26px;padding:10px 16px'>"+big+"</div>";
 x+="<div style='flex:1'><img src='"+(m.awayTeam.crest||"")+"' style='width:56px;height:56px;object-fit:contain' onerror=\"this.style.display='none'\"><div style='font-weight:bold;margin-top:6px'>"+nm(m.awayTeam)+"</div></div></div>";
 x+=mrow("Status",stt)+mrow("Date",when);
 if(m.matchday)x+=mrow("Matchday",m.matchday);
 if(m.stage)x+=mrow("Stage",String(m.stage).replace(/_/g," "));
 if(has&&ht&&ht.home!==null&&ht.home!==undefined)x+=mrow("Half-time",ht.home+" - "+ht.away);
 if(has)x+=mrow("Full-time",ft.home+" - "+ft.away);
 if(pn&&pn.home!==null&&pn.home!==undefined)x+=mrow("Penalties",pn.home+" - "+pn.away);
 if(has)x+=mrow("Winner",win);
 x+=mrow("Referee",ref);
 if(m.venue)x+=mrow("Venue",m.venue);
 document.getElementById("lc").innerHTML=x;
 window.scrollTo(0,0);
}
var MD=null,MDL="",DS=[],ALLM=[];
function tabMatches(){
 act("n2");
 fd("matches").then(function(d){
  ALLM=d.matches||[];
  DS=ALLM.map(function(m){return m.matchday||0}).filter(function(v,i,a){return a.indexOf(v)===i}).sort(function(a,b){return a-b});
  if(MDL!==cur){MD=null;MDL=cur}
  if(MD===null||DS.indexOf(MD)<0){
   var nx=ALLM.filter(function(m){return m.status!="FINISHED"&&m.status!="CANCELLED"}).sort(function(a,b){return a.utcDate<b.utcDate?-1:1});
   MD=nx.length?(nx[0].matchday||0):DS[DS.length-1];
  }
  showMD();
 }).catch(fail);
}
function showMD(){
 var top=DS[DS.length-1];
 var s="<div style='display:flex;align-items:center;gap:8px;margin-bottom:10px'><button class='liga-btn' onclick='stepMD(-1)'>←</button><div style='flex:1;text-align:center;font-weight:bold'>"+(MD?"Matchday "+MD+" / "+top:"Knockout")+"</div><button class='liga-btn' onclick='stepMD(1)'>→</button></div>";
 s+="<div style='display:flex;gap:6px;overflow:auto;padding-bottom:10px'>"+DS.map(function(v){return "<button class='liga-btn"+(v==MD?" sel":"")+"' onclick='setMD("+v+")'>"+(v||"KO")+"</button>"}).join("")+"</div>";
 var list=ALLM.filter(function(m){return (m.matchday||0)==MD}).sort(function(a,b){return a.utcDate<b.utcDate?-1:1});
 s+=list.map(card).join("")||"<div class='msg'>No matches.</div>";
 document.getElementById("lc").innerHTML=s;
}
function setMD(v){MD=v;showMD()}
function stepMD(n){var i=DS.indexOf(MD)+n;if(i>=0&&i<DS.length){MD=DS[i];showMD()}}

/* ----- Team page ----- */
function openTeam(id){
 act("n1");
 fd("matches").then(function(d){
  var ms=d.matches.filter(function(m){return m.homeTeam.id==id||m.awayTeam.id==id}).sort(function(a,b){return a.utcDate<b.utcDate?-1:1});
  if(!ms.length){document.getElementById("lc").innerHTML="<button class='back' onclick='tabTable()'>← Back to table</button><div class='msg'>No matches found.</div>";return}
  var tm=ms[0].homeTeam.id==id?ms[0].homeTeam:ms[0].awayTeam;
  TM[id]={name:tm.name||nm(tm),crest:tm.crest||""};
  var fin=ms.filter(function(m){return m.status=="FINISHED"});
  var up=ms.filter(function(m){return m.status!="FINISHED"&&m.status!="CANCELLED"&&m.status!="POSTPONED"});
  var w=0,dr=0,l=0,gf=0,ga=0,form=[];
  fin.forEach(function(m){
   var home=m.homeTeam.id==id;
   var a=home?m.score.fullTime.home:m.score.fullTime.away;
   var b=home?m.score.fullTime.away:m.score.fullTime.home;
   if(a===null||b===null)return;
   gf+=a;ga+=b;
   if(a>b){w++;form.push("W")}else if(a==b){dr++;form.push("D")}else{l++;form.push("L")}
  });
  var fc={W:"#4caf50",D:"#f5a623",L:"#e53935"};
  var f5=form.slice(-5).map(function(x){return "<span style='display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;border-radius:50%;background:"+fc[x]+";color:#fff;font-weight:bold;font-size:13px;margin-right:6px'>"+x+"</span>"}).join("");
  var x="<button class='back' onclick='tabTable()'>← Back to table</button>";
  x+="<div style='text-align:center;margin:6px 0 16px'><img src='"+TM[id].crest+"' style='width:72px;height:72px;object-fit:contain' onerror=\"this.style.display='none'\"><h2 style='margin:8px 0 0;color:var(--tx)'>"+TM[id].name+"</h2><button class='favb' id='favb' onclick='favBtn("+id+")'>"+(favHas(id,cur)?"★ In favorites":"☆ Add to favorites")+"</button></div>";
  x+="<div style='display:flex;justify-content:space-around;text-align:center;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:14px 6px;margin-bottom:12px'>";
  x+="<div><b style='font-size:20px;color:#4caf50'>"+w+"</b><br><span style='color:var(--mu);font-size:12px'>Wins</span></div>";
  x+="<div><b style='font-size:20px;color:#f5a623'>"+dr+"</b><br><span style='color:var(--mu);font-size:12px'>Draws</span></div>";
  x+="<div><b style='font-size:20px;color:#e53935'>"+l+"</b><br><span style='color:var(--mu);font-size:12px'>Losses</span></div>";
  x+="<div><b style='font-size:20px'>"+gf+":"+ga+"</b><br><span style='color:var(--mu);font-size:12px'>Goals</span></div></div>";
  if(f5)x+="<div class='sub'>Form (last 5)</div><div>"+f5+"</div>";
  x+="<div class='sub'>Upcoming</div>"+(up.slice(0,5).map(card).join("")||"<div class='msg'>No matches.</div>");
  x+="<div class='sub'>Results</div>"+(fin.slice(-10).reverse().map(card).join("")||"<div class='msg'>No results yet.</div>");
  document.getElementById("lc").innerHTML=x;
  window.scrollTo(0,0);
 }).catch(fail);
}
function favBtn(id){
 var t=TM[id];if(!t)return;
 favToggle(id,cur,t.name,t.crest);
 var b=document.getElementById("favb");
 if(b)b.textContent=favHas(id,cur)?"★ In favorites":"☆ Add to favorites";
}

/* ----- League stats ----- */
function tabStats(){
 act("n4");
 fd("matches").then(function(d){
  var f=d.matches.filter(function(m){return m.status=="FINISHED"&&m.score.fullTime.home!==null&&m.score.fullTime.home!==undefined});
  if(!f.length){document.getElementById("lc").innerHTML="<div class='msg'>No finished matches yet.</div>";return}
  var g=0,hw=0,dw=0,aw=0,o25=0,bt=0,big=f[0],bg=-1,T={};
  f.forEach(function(m){
   var h=m.score.fullTime.home,a=m.score.fullTime.away,t=h+a;
   g+=t;
   if(h>a)hw++;else if(h==a)dw++;else aw++;
   if(t>2)o25++;
   if(h>0&&a>0)bt++;
   if(t>bg){bg=t;big=m}
   [[m.homeTeam,h,a],[m.awayTeam,a,h]].forEach(function(z){
    var k=z[0].id;
    if(!T[k])T[k]={t:z[0],gf:0,ga:0,cs:0};
    T[k].gf+=z[1];T[k].ga+=z[2];
    if(z[2]==0)T[k].cs++;
   });
  });
  var arr=Object.keys(T).map(function(k){return T[k]});
  var att=arr.slice().sort(function(a,b){return b.gf-a.gf})[0];
  var def=arr.slice().sort(function(a,b){return a.ga-b.ga})[0];
  var csx=arr.slice().sort(function(a,b){return b.cs-a.cs})[0];
  var n=f.length;
  function pc(v){return Math.round(v*100/n)+"%"}
  var s="<div class='sub'>League stats</div>";
  s+=mrow("Matches played",n)+mrow("Goals",g)+mrow("Goals per match",(g/n).toFixed(2))+mrow("Home wins",pc(hw))+mrow("Draws",pc(dw))+mrow("Away wins",pc(aw))+mrow("Over 2.5 goals",pc(o25))+mrow("Both teams scored",pc(bt));
  s+="<div class='sub'>Teams</div>";
  s+=mrow("Best attack",cr(att.t)+nm(att.t)+" ("+att.gf+")")+mrow("Best defence",cr(def.t)+nm(def.t)+" ("+def.ga+" conceded)")+mrow("Most clean sheets",cr(csx.t)+nm(csx.t)+" ("+csx.cs+")");
  s+="<div class='sub'>Highest scoring match</div>"+card(big);
  document.getElementById("lc").innerHTML=s;
 }).catch(fail);
}

/* ----- Scorers and player profile ----- */
var SCL=[];
function pimg(name){
 if(sGet("ds","0")=="1")return Promise.resolve("");
 return fetch("https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&generator=search&gsrlimit=1&gsrsearch="+encodeURIComponent(name+" footballer")+"&prop=pageimages&piprop=thumbnail&pithumbsize=120").then(function(r){return r.json()}).then(function(d){
  var p=d.query&&d.query.pages;if(!p)return "";
  var k=Object.keys(p)[0];
  return p[k].thumbnail?p[k].thumbnail.source:"";
 }).catch(function(){return ""});
}
function pAge(dob){
 if(!dob)return "-";
 var b=new Date(dob),n=new Date();
 var a=n.getFullYear()-b.getFullYear();
 var m=n.getMonth()-b.getMonth();
 if(m<0||(m==0&&n.getDate()<b.getDate()))a--;
 return a;
}
function tabScorers(){
 act("n3");
 fd("scorers").then(function(d){
  SCL=d.scorers;
  var s="<div class='sub'>Top scorers · tap a player</div>";
  SCL.forEach(function(x,i){
   s+="<div class='res' style='display:flex;gap:12px;align-items:center' onclick='openPlayer("+i+")'><img id='ph"+i+"' alt='' style='width:64px;height:64px;border-radius:50%;object-fit:cover;background:var(--soft);flex:none'><div><h3>"+(i+1)+". "+x.player.name+"</h3><p>"+cr(x.team)+nm(x.team)+"<br>Goals: "+x.goals+" | Assists: "+(x.assists||0)+" | Matches: "+x.playedMatches+"</p></div></div>";
  });
  document.getElementById("lc").innerHTML=s;
  SCL.forEach(function(x,i){
   pimg(x.player.name).then(function(src){
    var e=document.getElementById("ph"+i);
    if(e&&src)e.src=src;
   });
  });
 }).catch(fail);
}
function openPlayer(i){
 var x=SCL[i],p=x.player,pm=x.playedMatches||0;
 var h="<button class='back' onclick='tabScorers()'>← Back to scorers</button>";
 h+="<div style='text-align:center;margin:6px 0 14px'><img id='ppx' alt='' style='width:110px;height:110px;border-radius:50%;object-fit:cover;background:var(--soft)'><h2 style='margin:10px 0 2px;color:var(--tx)'>"+p.name+"</h2><div>"+cr(x.team)+nm(x.team)+"</div></div>";
 h+=mrow("Age",p.dateOfBirth?pAge(p.dateOfBirth)+" ("+p.dateOfBirth+")":"-");
 h+=mrow("Nationality",p.nationality||"-");
 h+=mrow("Position",p.position||p.section||"-");
 if(p.shirtNumber)h+=mrow("Shirt number",p.shirtNumber);
 h+=mrow("Matches",pm)+mrow("Goals",x.goals)+mrow("Assists",x.assists||0);
 if(x.penalties)h+=mrow("Penalties",x.penalties);
 if(pm)h+=mrow("Goals per match",(x.goals/pm).toFixed(2));
 h+="<div class='sub'>About</div><div id='pbio' style='line-height:1.7;color:var(--mu)'>Loading...</div>";
 document.getElementById("lc").innerHTML=h;
 window.scrollTo(0,0);
 if(sGet("ds","0")=="1"){document.getElementById("pbio").textContent="Data saver is on.";return}
 var u="https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&generator=search&gsrlimit=1&gsrsearch="+encodeURIComponent(p.name+" footballer")+"&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400&exintro=1&explaintext=1&exsentences=4";
 fetch(u).then(function(r){return r.json()}).then(function(d){
  var e=document.getElementById("pbio");
  var pg=d.query&&d.query.pages;
  if(!pg){if(e)e.textContent="No Wikipedia info found.";return}
  var q=pg[Object.keys(pg)[0]];
  if(e){
   e.textContent=q.extract||"No info.";
   e.insertAdjacentHTML("beforeend","<br><br><a target='_blank' style='color:var(--ac)' href='https://en.wikipedia.org/wiki/"+encodeURIComponent(q.title.replace(/ /g,"_"))+"'>Open on Wikipedia →</a><br><small>Photo and text come from Wikipedia and may sometimes be about another person.</small>");
  }
  var im=document.getElementById("ppx");
  if(im&&q.thumbnail)im.src=q.thumbnail.source;
 }).catch(function(){var e=document.getElementById("pbio");if(e)e.textContent="Could not load."});
}

/* ===== Favorites ===== */
function favGet(){try{return JSON.parse(localStorage.getItem("fav")||"[]")}catch(e){return []}}
function favSet(a){try{localStorage.setItem("fav",JSON.stringify(a))}catch(e){}}
function favHas(id,code){return favGet().some(function(f){return f.id==id&&f.code==code})}
function favToggle(id,code,name,crest){
 var a=favGet(),i=-1;
 a.forEach(function(f,k){if(f.id==id&&f.code==code)i=k});
 if(i>=0)a.splice(i,1);else a.push({id:id,code:code,name:name,crest:crest});
 favSet(a);
}
function favOpen(code,id){
 cur=code;setupLeagues();
 shell(code,"setTab(3)","← Favorites");
 navOn(3);
 openTeam(id);
}
function favDel(i){var a=favGet();a.splice(i,1);favSet(a);favPage()}
function favPage(){
 var a=favGet();
 var app=document.getElementById("app");
 if(!a.length){app.innerHTML="<div class='art'><h1>Favorites</h1><div class='msg'>No favorite teams yet.<br>Open a league, tap a team name in the table, then press the star button.</div></div>";return}
 var s="<div class='art'><h1>Favorites</h1>";
 a.forEach(function(f,i){
  s+="<div class='res' style='display:flex;align-items:center;gap:12px' onclick='favOpen(\""+f.code+"\","+f.id+")'><img src='"+f.crest+"' style='width:44px;height:44px;object-fit:contain' onerror=\"this.style.display='none'\"><div style='flex:1'><h3 style='margin:0 0 4px'>"+f.name+"</h3><p id='fn"+i+"'>"+(LG[f.code]?LG[f.code].n:"")+"</p></div><button class='liga-btn' onclick='event.stopPropagation();favDel("+i+")'>✕</button></div>";
 });
 app.innerHTML=s+"</div>";
 a.forEach(function(f,i){
  fdc(f.code,"matches").then(function(d){
   var up=d.matches.filter(function(m){return (m.homeTeam.id==f.id||m.awayTeam.id==f.id)&&m.status!="FINISHED"&&m.status!="CANCELLED"&&m.status!="POSTPONED"}).sort(function(x,y){return x.utcDate<y.utcDate?-1:1})[0];
   var e=document.getElementById("fn"+i);
   if(e&&up){
    var home=up.homeTeam.id==f.id;
    var opp=home?up.awayTeam:up.homeTeam;
    var dt=new Date(up.utcDate);
    e.innerHTML=(LG[f.code]?LG[f.code].n:"")+"<br>Next: "+(home?"vs ":"at ")+nm(opp)+" · "+dt.toLocaleDateString(undefined,{day:"numeric",month:"short"})+" "+dt.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
   }
  }).catch(function(){});
 });
}

/* ===== Calendar ===== */
var calD=new Date(),calAll=[];
function calKey(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function calStep(n){calD=new Date(calD.getFullYear(),calD.getMonth(),calD.getDate()+n);calShow()}
function calPage(){
 calD=new Date();
 document.getElementById("app").innerHTML="<div class='art'><h1>Calendar</h1><div id='cc'><div class='msg'>Loading...</div></div></div>";
 Promise.all(Object.keys(LG).map(function(c){return fdc(c,"matches").then(function(d){return {c:c,m:d.matches}}).catch(function(){return {c:c,m:[]}})})).then(function(r){calAll=r;calShow()});
}
function calShow(){
 var k=calKey(calD);
 var s="<div style='display:flex;align-items:center;gap:8px;margin-bottom:10px'><button class='liga-btn' onclick='calStep(-1)'>←</button><div style='flex:1;text-align:center;font-weight:bold'>"+calD.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"long"})+"</div><button class='liga-btn' onclick='calStep(1)'>→</button></div>";
 var any=false;
 calAll.forEach(function(g){
  var ms=g.m.filter(function(m){return calKey(new Date(m.utcDate))==k}).sort(function(a,b){return a.utcDate<b.utcDate?-1:1});
  if(!ms.length)return;
  any=true;
  s+="<div class='sub'>"+LG[g.c].n+"</div>";
  s+=ms.map(function(m){
   var h=m.score.fullTime.home,a=m.score.fullTime.away;
   var sc=(h===null||a===null||h===undefined)?new Date(m.utcDate).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):h+" - "+a;
   return "<div class='mc'><div class='r'><div class='t'>"+cr(m.homeTeam)+nm(m.homeTeam)+"<br>"+cr(m.awayTeam)+nm(m.awayTeam)+"</div><div class='sc'>"+sc+"</div></div></div>";
  }).join("");
 });
 if(!any)s+="<div class='msg'>No matches on this day. Use the arrows.</div>";
 document.getElementById("cc").innerHTML=s;
}

/* ===== Quiz ===== */
var qzQ=[],qzI=0,qzS=0;
function qzShuf(a){return a.slice().sort(function(){return Math.random()-0.5})}
function qzOpts(right,pool){
 var o=qzShuf(pool.filter(function(x){return x!=right})).slice(0,3);
 o.push(right);return qzShuf(o);
}
function qzStart(){
 document.getElementById("app").innerHTML="<div class='art'><h1>Quiz</h1><div id='qc'><div class='msg'>Loading...</div></div></div>";
 Promise.all(["PD","PL","SA","BL1","FL1"].map(function(c){
  return Promise.all([fdc(c,"standings"),fdc(c,"scorers")]).then(function(r){return {c:c,t:r[0].standings[0].table,s:r[1].scorers}}).catch(function(){return null});
 })).then(function(r){
  var q=[];
  r.filter(Boolean).forEach(function(L){
   var nz=L.t.map(function(x){return nm(x.team)});
   var n=LG[L.c].n;
   if(L.t.length>3&&L.t[0].points>L.t[1].points){q.push({q:"Who is first in "+n+" now?",a:nm(L.t[0].team),o:qzOpts(nm(L.t[0].team),nz)})}
   var g=L.t.slice().sort(function(x,y){return y.goalsFor-x.goalsFor});
   if(g.length>3&&g[0].goalsFor>g[1].goalsFor){q.push({q:"Which team has scored the most goals in "+n+"?",a:nm(g[0].team),o:qzOpts(nm(g[0].team),nz)})}
   if(L.s.length>3&&L.s[0].goals>L.s[1].goals){
    var pn=L.s.map(function(x){return x.player.name});
    q.push({q:"Who is the top scorer in "+n+"?",a:pn[0],o:qzOpts(pn[0],pn)});
   }
  });
  qzQ=qzShuf(q).slice(0,10);qzI=0;qzS=0;
  if(!qzQ.length){document.getElementById("qc").innerHTML="<div class='msg'>No data yet.</div>";return}
  qzShow();
 });
}
function qzShow(){
 var c=document.getElementById("qc");
 if(qzI>=qzQ.length){c.innerHTML="<div class='msg' style='font-size:22px'>Result: "+qzS+" / "+qzQ.length+"</div><button class='qb' style='text-align:center' onclick='qzStart()'>Play again</button>";return}
 var q=qzQ[qzI];
 c.innerHTML="<div class='sub'>Question "+(qzI+1)+" / "+qzQ.length+"</div><h2>"+q.q+"</h2>"+q.o.map(function(o,i){return "<button class='qb' onclick='qzAns("+i+")'>"+o+"</button>"}).join("");
}
function qzAns(i){
 var q=qzQ[qzI];
 if(q.o[i]==q.a)qzS++;
 document.querySelectorAll("#qc .qb").forEach(function(b,k){b.disabled=true;if(q.o[k]==q.a)b.style.borderColor="#4caf50";else if(k==i)b.style.borderColor="#e53935"});
 setTimeout(function(){qzI++;qzShow()},900);
                                                                           }

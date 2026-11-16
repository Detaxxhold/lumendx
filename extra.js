/* ===== Header ===== */
var ico=function(p,s){return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'};
document.querySelector("header").innerHTML=`<div class="hb2"><button onclick="setTab(5)">${ico('<path d="M4 7h16M4 12h16M4 17h16"/>',26)}</button><div class="logo2" onclick="home()"><svg viewBox="0 0 24 24" width="16" height="16" fill="#f5c242"><path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4z"/></svg><b>LUMEN<i>DX</i></b><small>FOOTBALL • LIVE • MORE</small></div><div class="hic"><button onclick="srToggle()">${ico('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',24)}</button><button onclick="thToggle()">${ico('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',24)}</button></div></div><div id="srb"><input id="q" placeholder="Messi, Real Madrid, World Cup..." onkeydown="if(event.key=='Enter')search()"><button id="go" onclick="search()">Search</button></div><div class="langs" id="langs" style="display:none"></div>`;
function srToggle(){var s=document.getElementById("srb");s.classList.toggle("on");if(s.classList.contains("on"))document.getElementById("q").focus()}
function thToggle(){var l=document.body.classList.contains("light");sSet("mode",l?"dark":"light");applyAll()}

/* ===== Bottom navigation ===== */
var NAVI=[
 ["Home",ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>')],
 ["Matches",BALL],
 ["Calendar",ic('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>')],
 ["Favorites",ic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>')],
 ["Statistics",ic('<path d="M5 20V10M12 20V4M19 20v-7"/>')],
 ["Settings",ic('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>')]
];
function buildNav(){
 var d=document.createElement("div");d.id="bn";
 d.innerHTML=NAVI.map(function(t,i){return `<button id="bt${i}" class="${i==0?"on":""}" onclick="setTab(${i})"><b>${t[1]}</b>${t[0]}</button>`}).join("");
 document.body.appendChild(d);
}
function navOn(i){for(var k=0;k<6;k++){var e=document.getElementById("bt"+k);if(e)e.classList.toggle("on",k==i)}}
function setTab(i){
 navOn(i);cur="";setupLeagues();
 document.getElementById("srb").classList.remove("on");
 if(i==0)home();else if(i==1)gridPage("Matches","m");else if(i==2)calPage();else if(i==3)favPage();else if(i==4)statsPage();else setPage();
 window.scrollTo(0,0);
}

/* ===== Home ===== */
var HM=null,hmC="PD";
function hmLoad(){
 if(HM)return Promise.resolve(HM);
 return Promise.all(Object.keys(LG).map(function(c){
  return fdc(c,"matches").then(function(d){return {c:c,m:d.matches||[],e:(d.competition&&d.competition.emblem)||""}}).catch(function(){return {c:c,m:[],e:""}});
 })).then(function(r){HM=r;return r});
}
function gridPage(title,t){
 document.getElementById("app").innerHTML=`<div class="art"><h1>${title}</h1><div class="lts" id="gp"><div class="msg">Loading...</div></div></div>`;
 hmLoad().then(function(r){
  var g=document.getElementById("gp");if(!g)return;
  g.innerHTML=r.map(function(L){return `<div class="lt" onclick="lgOpen('${L.c}','${t}')">${L.e?`<img src="${L.e}" onerror="this.style.display='none'">`:""}${LG[L.c].n}</div>`}).join("");
 });
}
function lgOpen(code,t){
 cur=code;setupLeagues();
 shell(code,"setTab(1)","← Back");
 navOn(1);
 tabMatches();
 window.scrollTo(0,0);
}
function hmGo(code,id){cur=code;setupLeagues();shell(code,"home()","← Back to Home");navOn(0);openMatch(id);window.scrollTo(0,0)}
function heroSlide(c,e,m){
 MM[m.id]=m;
 var dt=new Date(m.utcDate);
 var today=calKey(dt)==calKey(new Date());
 var when=(today?"Today":dt.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"}))+", "+dt.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
 return `<div class="hero">${e?`<img class="wm" src="${e}" onerror="this.style.display='none'">`:""}<span class="bdg">${LG[c].n}</span><div class="hcs"><img src="${m.homeTeam.crest||""}" onerror="this.style.display='none'"><img src="${m.awayTeam.crest||""}" onerror="this.style.display='none'"></div><h2>${nm(m.homeTeam)}<br><span>vs ${nm(m.awayTeam)}</span></h2><div class="hd">${when}</div><button class="hb" onclick="hmGo('${c}',${m.id})">View Match →</button></div>`;
}
function tcard(c,m){
 MM[m.id]=m;
 var h=m.score.fullTime.home,a=m.score.fullTime.away;
 var has=h!==null&&h!==undefined;
 var tm=new Date(m.utcDate).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
 var lab=m.status=="FINISHED"?"FT":(has?"In play":tm);
 return `<div class="tc" onclick="hmGo('${c}',${m.id})"><div class="tl">${LG[c].n} · ${lab}</div><div class="tr">${cr(m.homeTeam)}<span>${nm(m.homeTeam)}</span><b>${has?h:""}</b></div><div class="tr">${cr(m.awayTeam)}<span>${nm(m.awayTeam)}</span><b>${has?a:""}</b></div></div>`;
}
function pickHero(r){
 var now=Date.now(),up=[];
 r.forEach(function(L){L.m.forEach(function(m){
  if(m.status=="FINISHED"||m.status=="CANCELLED"||m.status=="POSTPONED")return;
  var t=new Date(m.utcDate).getTime();
  if(t<now-3*3600000)return;
  up.push({c:L.c,e:L.e,m:m,t:t});
 })});
 up.sort(function(a,b){return a.t-b.t});
 var out=[],seen={};
 up.forEach(function(x){if(out.length<4&&!seen[x.c]){seen[x.c]=1;out.push(x)}});
 return {hero:out,up:up};
}
function hmFill(r){
 var box=document.getElementById("hmH");if(!box)return;
 var P=pickHero(r);
 box.innerHTML=P.hero.length?P.hero.map(function(x){return heroSlide(x.c,x.e,x.m)}).join(""):`<div class="hero"><span class="bdg">LUMENDX</span><h2>Football<br><span>world</span></h2><div class="hd">No upcoming matches yet.</div></div>`;
 var dots=document.getElementById("hmD");
 dots.innerHTML=P.hero.map(function(x,i){return `<i class="${i==0?"on":""}"></i>`}).join("");
 box.onscroll=function(){var i=Math.round(box.scrollLeft/(box.clientWidth+10));Array.prototype.forEach.call(dots.children,function(d,k){d.classList.toggle("on",k==i)})};
 var tk=calKey(new Date()),today=[];
 r.forEach(function(L){L.m.forEach(function(m){if(calKey(new Date(m.utcDate))==tk)today.push({c:L.c,m:m,t:new Date(m.utcDate).getTime()})})});
 var list=today.length?today:P.up.slice(0,10);
 list.sort(function(a,b){return a.t-b.t});
 var th=document.getElementById("hmTT");if(th)th.textContent=today.length?"Matches today":"Upcoming matches";
 var tb=document.getElementById("hmT");
 if(tb)tb.innerHTML=list.map(function(x){return tcard(x.c,x.m)}).join("")||`<div class="msg">No matches.</div>`;
 var lb=document.getElementById("hmL");
 if(lb)lb.innerHTML=r.filter(function(L){return MAIN.indexOf(L.c)>=0}).map(function(L){return `<div class="lt" onclick="openLeague('${L.c}')">${L.e?`<img src="${L.e}" onerror="this.style.display='none'">`:""}${LG[L.c].n}</div>`}).join("")+`<div class="lt" onclick="openMore()">${ico('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',34)}All Leagues</div>`;
 hmTab(hmC);
}
function hmTab(c){
 hmC=c||hmC;
 var el=document.getElementById("hmS");if(!el)return;
 var em="";(HM||[]).forEach(function(L){if(L.c==hmC)em=L.e});
 var chips=["PD","PL","SA","BL1","FL1"].map(function(k){return `<button class="liga-btn${k==hmC?" sel":""}" onclick="hmTab('${k}')">${LG[k].n}</button>`}).join("");
 el.innerHTML=`<div class="hch">${em?`<img src="${em}" onerror="this.style.display='none'">`:""}<b>${LG[hmC].n}</b><button class="btn2" onclick="openLeague('${hmC}')">Standings →</button></div><div class="hs" style="margin-bottom:10px">${chips}</div><div id="hmST"><div class="msg">Loading...</div></div>`;
 var want=hmC;
 fdc(hmC,"standings").then(function(d){
  var e=document.getElementById("hmST");if(!e||want!=hmC)return;
  var t=d.standings[0].table.slice(0,5);
  var s="<div class='tw'><table class='st'><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr>";
  t.forEach(function(r){
   var p=r.position,c2=p<=4?"cl":p==5?"el":p==6?"co":"";
   var gd=r.goalDifference>0?"+"+r.goalDifference:r.goalDifference;
   s+="<tr class='"+c2+"'><td>"+p+"</td><td>"+cr(r.team)+nm(r.team)+"</td><td>"+r.playedGames+"</td><td>"+r.won+"</td><td>"+r.draw+"</td><td>"+r.lost+"</td><td>"+gd+"</td><td class='pts'>"+r.points+"</td></tr>";
  });
  e.innerHTML=s+"</table></div>";
 }).catch(function(){var e=document.getElementById("hmST");if(e)e.innerHTML="<div class='msg'>Data is not ready yet.</div>"});
}
function home(){
 cur="";navOn(0);setupLeagues();
 document.getElementById("srb").classList.remove("on");
 var q=document.getElementById("q");if(q)q.value="";
 document.getElementById("app").innerHTML=`<div id="hh"><div class="hrs" id="hmH"><div class="hero"><div class="msg">Loading...</div></div></div><div class="dots" id="hmD"></div><div class="hsec"><b><i class="dot"></i><span id="hmTT">Matches</span></b><button class="hl" onclick="setTab(2)">See all →</button></div><div class="hs" id="hmT"></div><div class="hsec"><b>Leagues</b></div><div class="hs" id="hmL"></div><div class="hc" id="hmS"></div></div>`;
 hmLoad().then(hmFill);
}

/* ===== Settings ===== */
var sI={
 pal:ic('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/>'),
 glb:ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
 db:ic('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'),
 home:ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
 eye:ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
 lst:ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
 str:ic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
 trs:ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
 inf:ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
 set:ic('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>')
};
var ARW='<span style="font-size:22px">›</span>';
function srow(i,t,d,r,c){
 return '<div class="str"'+(c?' onclick="'+c+'"':'')+'><div class="ri">'+i+'</div><div class="rt"><b>'+t+'</b>'+(d?'<small>'+d+'</small>':'')+'</div><div class="rv">'+r+'</div></div>';
}
function stgl(key,inv,t,d,i){
 var on=inv?sGet(key,"0")!="1":sGet(key,"0")=="1";
 return srow(i,t,d,'<div class="tg2'+(on?' on':'')+'"></div>','stTog(\''+key+'\')');
}
function ssec(t,i){return '<div class="sth">'+i+'<span>'+t+'</span></div>'}
function stTog(k){sSet(k,sGet(k,"0")=="1"?"0":"1");applyAll();setPage()}
function stAcc(k){sSet("acc",k);applyAll();setPage()}
function stClose(){var e=document.getElementById("stm");if(e)e.remove()}
function stSet(k,v){
 sSet(k,v);
 if(k=="wl"&&LANGS[v]){lang=v;setup()}
 applyAll();stClose();setPage();
}
function sheet(title,html){
 stClose();
 var d=document.createElement("div");d.id="stm";
 d.setAttribute("onclick","if(event.target===this)stClose()");
 d.innerHTML='<div class="sh"><h3>'+title+'</h3>'+html+'</div>';
 document.body.appendChild(d);
}
function stOpen(key){
 var cfg={
  mode:["Theme",[["dark","Dark"],["light","Light"],["system","System"]],"dark"],
  fs:["Font size",[["s","Small"],["m","Medium"],["l","Large"]],"m"],
  wl:["Search language",[["en","English"],["ru","Русский"],["ky","Кыргызча"]],"en"],
  dl:["Start page",[["","Home"]].concat(Object.keys(LG).map(function(k){return [k,LG[k].n]})),""]
 }[key];
 var cv=sGet(key,cfg[2]);
 sheet(cfg[0],cfg[1].map(function(o){return '<div class="sho" onclick="stSet(\''+key+'\',\''+o[0]+'\')"><span>'+o[1]+'</span><i class="rd'+(cv==o[0]?' on':'')+'"></i></div>'}).join(""));
}
function stAbout(){
 sheet("About LUMENDX",'<p style="line-height:1.7;color:var(--mu)">LUMENDX is a football web app.<br><br>Football data: football-data.org<br>Photos and articles: Wikipedia<br>Data updates every hour.</p>');
}
function stClearFav(){if(confirm("Clear favorite teams?")){favSet([]);setPage()}}
function stResetAll(){
 if(!confirm("Reset all settings?"))return;
 ["mode","acc","fs","dl","wl","ds","nt","ns"].forEach(function(k){try{localStorage.removeItem("s_"+k)}catch(e){}});
 lang="en";setup();applyAll();setPage();
}
function setPage(){
 var m=sGet("mode","dark");
 var light=m=="light"||(m=="system"&&window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches);
 var ac=sGet("acc","blue");
 var dl=sGet("dl","");
 var online=navigator.onLine;
 var dots=["blue","green","red","gold","purple"].map(function(k){return '<span class="'+(k==ac?'on':'')+'" style="background:'+ACC[k][0]+'" onclick="stAcc(\''+k+'\')"></span>'}).join("");
 var h='<div class="art" style="padding-bottom:10px"><h1 style="margin:6px 0 2px">Settings</h1><div style="color:var(--mu);font-size:14px">Customize your LUMENDX experience</div>';
 h+='<div class="stbn"><div><b>LUMEN<i>DX</i></b><small>FOOTBALL • LIVE • MORE</small></div><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e9eefc"/><path d="M50 30l17 12-6 20H39l-6-20z" fill="#12214f"/><path d="M50 30V8M67 42l24-8M61 62l14 20M39 62L25 82M33 42L9 34" stroke="#12214f" stroke-width="3" fill="none"/><circle cx="50" cy="50" r="48" fill="none" stroke="#8fa6e6" stroke-width="2"/></svg></div>';
 h+='<div class="stcd"><div class="stlg">LD</div><div style="flex:1"><b style="font-size:19px">LUMENDX</b><br><small style="color:var(--mu)">v1.0</small></div><div class="stpl'+(online?'':' off')+'">'+(online?'● Online':'● Offline')+'</div></div>';
 h+=ssec("Appearance",sI.set);
 h+='<div class="stg"><div class="str" onclick="stOpen(\'mode\')"><div class="thb'+(light?' l':'')+'"><i>✓</i></div><div class="rt"><b>Theme</b><small>'+{dark:"Dark",light:"Light",system:"System"}[m]+'</small></div><div class="rv">'+ARW+'</div></div>';
 h+=srow(sI.pal,"Accent color","Choose your favorite color",'<div class="acd">'+dots+'</div>');
 h+=srow('Aa',"Font size","Adjust text size",'<span>'+{s:"Small",m:"Medium",l:"Large"}[sGet("fs","m")]+'</span>'+ARW,"stOpen('fs')")+'</div>';
 h+=ssec("Language & Data",sI.glb);
 h+='<div class="stg">'+srow(sI.glb,"Search language","Wikipedia articles and photos",'<span>'+(LANGS[sGet("wl","en")]||"English")+'</span>'+ARW,"stOpen('wl')");
 h+=stgl("ds",false,"Data saver","Use less mobile data (no player photos)",sI.db)+'</div>';
 h+=ssec("Home screen",sI.home);
 h+='<div class="stg">'+stgl("nt",true,"Matches today","Show today\'s matches on Home",sI.eye);
 h+=stgl("ns",true,"League table","Show standings on Home",sI.lst);
 h+=srow(sI.home,"Start page","Opens when you launch the app",'<span>'+(dl&&LG[dl]?LG[dl].n:"Home")+'</span>'+ARW,"stOpen('dl')")+'</div>';
 h+=ssec("Other",sI.inf);
 h+='<div class="stg">'+srow(sI.str,"Favorites","Your favorite teams",'<span>'+favGet().length+'</span>'+ARW,"setTab(3)");
 h+=srow(sI.trs,"Storage","Clear your favorite teams",ARW,"stClearFav()");
 h+=srow(sI.inf,"About LUMENDX","App information",ARW,"stAbout()")+'</div>';
 h+='<button class="strs" onclick="stResetAll()">Reset all settings</button></div>';
 document.getElementById("app").innerHTML=h;
}

/* ===== Statistics ===== */
var SD={},selS="PD",moreOn=false;
var MAINS=["PD","PL","SA","BL1","FL1"],EXTRA=["CL","DED","PPL","ELC","BSA"];
var TRO='<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>';
var BAR='<path d="M5 20V10M12 20V4M19 20v-7"/>';
function sdGet(c){
 if(SD[c])return Promise.resolve(SD[c]);
 return fdc(c,"standings").then(function(d){SD[c]=d;return d}).catch(function(){return null});
}
function emb(c){var d=SD[c];return d&&d.competition&&d.competition.emblem?d.competition.emblem:""}
function lastN(p){return p.lastName||String(p.name).split(" ").slice(-1)[0]}
function stTop(){
 var h=MAINS.map(function(c){
  var e=emb(c);
  return '<div class="slt'+(c==selS?' sel':'')+'" onclick="statsPage(\''+c+'\')">'+(e?'<img src="'+e+'" onerror="this.style.display=\'none\'">':'')+'<span>'+LG[c].n+'</span></div>';
 }).join("");
 var more=EXTRA.indexOf(selS)>=0||moreOn;
 h+='<div class="slt'+(more?' sel':'')+'" onclick="stMore()"><b style="font-size:20px;line-height:1">•••</b><span>More</span></div>';
 var a=document.getElementById("stl");if(a)a.innerHTML=h;
 var x=document.getElementById("stx");
 if(x)x.innerHTML=moreOn?'<div class="sl">'+EXTRA.map(function(c){return '<button class="liga-btn'+(c==selS?' sel':'')+'" onclick="statsPage(\''+c+'\')">'+LG[c].n+'</button>'}).join("")+'</div>':'';
}
function stMore(){moreOn=!moreOn;stTop()}
function stFull(code,w){
 cur=code;navOn(4);setupLeagues();
 shell(code,"setTab(4)","← Statistics");
 if(w=="t")tabTable();else if(w=="s")tabScorers();else tabStats();
 window.scrollTo(0,0);
}
function stBody(code){
 Promise.all([sdGet(code),fdc(code,"matches").catch(function(){return null}),fdc(code,"scorers").catch(function(){return null})]).then(function(r){
  if(selS!=code)return;
  var sd=r[0],md=r[1],sc=r[2],out="";
  if(sd&&sd.standings&&sd.standings[0]){
   var t=sd.standings[0].table.slice(0,5);
   var yr=sd.season.startDate.slice(0,4)+"/"+sd.season.endDate.slice(2,4);
   out+='<div class="scd"><div class="sch">'+ic(TRO)+'<span style="flex:1">League Table</span><span class="spill">'+yr+'</span></div><div class="tw"><table class="st"><tr><th>#</th><th style="text-align:left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>';
   t.forEach(function(x){
    var gd=x.goalDifference>0?"+"+x.goalDifference:x.goalDifference;
    out+='<tr class="'+(x.position==1?'f1':'')+'"><td>'+x.position+'</td><td style="text-align:left;font-weight:bold;white-space:nowrap">'+cr(x.team)+nm(x.team)+'</td><td>'+x.playedGames+'</td><td>'+x.won+'</td><td>'+x.draw+'</td><td>'+x.lost+'</td><td>'+gd+'</td><td><b>'+x.points+'</b></td></tr>';
   });
   out+='</table></div><button class="btn2" style="width:100%;margin-top:10px" onclick="stFull(\''+code+'\',\'t\')">Full table →</button></div>';
  }
  var a3=[],b3=[];
  if(sc&&sc.scorers&&sc.scorers.length){
   var L=sc.scorers;
   a3=L.slice(0,3);
   b3=L.slice().sort(function(a,b){return (b.assists||0)-(a.assists||0)||b.goals-a.goals}).slice(0,3);
   var pc=function(arr,key,pf){return arr.map(function(x,i){return '<div class="pr"><b class="pn">'+(i+1)+'</b><img id="'+pf+i+'" alt=""><span class="pm">'+lastN(x.player)+'</span><b>'+(key=="g"?x.goals:(x.assists||0))+'</b></div>'}).join("")};
   out+='<div class="s2"><div class="scd"><div class="sch" style="font-size:17px">'+BALL+'<span style="flex:1">Top Scorers</span><span class="sar" onclick="stFull(\''+code+'\',\'s\')">›</span></div>'+pc(a3,"g","sps")+'</div><div class="scd"><div class="sch" style="font-size:17px">'+ic(BAR)+'<span style="flex:1">Top Assists</span><span class="sar" onclick="stFull(\''+code+'\',\'s\')">›</span></div>'+pc(b3,"a","spa")+'</div></div>';
  }
  if(md&&md.matches){
   var f=md.matches.filter(function(m){return m.status=="FINISHED"&&m.score.fullTime.home!==null&&m.score.fullTime.home!==undefined});
   if(f.length){
    var g=0,hw=0,dw=0,aw=0,bt=0,cs=0;
    f.forEach(function(m){
     var h=m.score.fullTime.home,a=m.score.fullTime.away;
     g+=h+a;
     if(h>a)hw++;else if(h==a)dw++;else aw++;
     if(h>0&&a>0)bt++;
     if(h==0)cs++;
     if(a==0)cs++;
    });
    var n=f.length;
    var pp=function(v){return Math.round(v*100/n)+"%"};
    var tile=function(k,v){return '<div class="sst"><small>'+k+'</small><b>'+v+'</b></div>'};
    out+='<div class="scd"><div class="sch" style="font-size:18px">'+ic('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>')+'<span>Season Stats</span></div><div class="ssg">'+tile("Matches",n)+tile("Goals",g)+tile("Avg. goals",(g/n).toFixed(2))+tile("Clean sheets",cs)+'</div><div class="ssg" style="margin-top:8px">'+tile("Home wins",pp(hw))+tile("Draws",pp(dw))+tile("Away wins",pp(aw))+tile("Both scored",pp(bt))+'</div><button class="btn2" style="width:100%;margin-top:12px" onclick="stFull(\''+code+'\',\'x\')">Detailed stats →</button></div>';
   }
  }
  out+='<button class="btn2" style="width:100%;margin-top:14px" onclick="qzStart()">Football quiz →</button>';
  var el=document.getElementById("sbody");
  if(el)el.innerHTML=out;
  a3.forEach(function(x,i){pimg(x.player.name).then(function(s){var e=document.getElementById("sps"+i);if(e&&s)e.src=s})});
  b3.forEach(function(x,i){pimg(x.player.name).then(function(s){var e=document.getElementById("spa"+i);if(e&&s)e.src=s})});
 });
}
function statsPage(code){
 if(code)selS=code;
 if(EXTRA.indexOf(selS)>=0)moreOn=true;
 navOn(4);
 document.getElementById("app").innerHTML='<div class="art" style="padding:0"><div class="sbn"><svg viewBox="0 0 24 24" width="54" height="54" fill="var(--ac)"><rect x="3" y="12" width="5" height="9" rx="1.5"/><rect x="10" y="6" width="5" height="15" rx="1.5"/><rect x="17" y="2" width="5" height="19" rx="1.5"/></svg><div><h1>Statistics</h1><p>Latest football statistics and data</p></div></div><div class="sl" id="stl"></div><div id="stx"></div><div id="sbody"><div class="msg">Loading...</div></div></div>';
 stTop();
 Promise.all(MAINS.concat([selS]).map(sdGet)).then(stTop);
 stBody(selS);
}

/* ===== Start ===== */
var wl0=sGet("wl","en");
if(LANGS[wl0])lang=wl0;
setup();
buildNav();
applyAll();
var dl0=sGet("dl","");
if(dl0&&LG[dl0])openLeague(dl0);else home();

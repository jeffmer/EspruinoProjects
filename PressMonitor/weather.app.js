if (!P2.setUI) eval(STOR.read("setui.js"));
eval(STOR.read("zambretti.js"));
eval(STOR.read("moon.js"));
eval(require("Storage").read("tide.js"));
var tideinfo = STOR.readJSON("tideinfo.json",1)||{place:"Sea", hightide:"2024-04-08T19:07:00"};


var W = g.getWidth();
var H = g.getHeight();

var weather = "Waiting for Forecast";

var MOON = getmoon();

function drawBat(v){
  var s = 39;
  x = W-44; y = 2;
  g.fillRect(x,y+2,x+s-4,y+21);
  g.clearRect(x+2,y+4,x+s-6,y+19);
  g.fillRect(x+s-3,y+10,x+s,y+14);
  g.fillRect(x+4,y+6,x+4+Math.ceil(v*(s-12)/100),y+17);
}

function drawBlue(){
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 2);
}

function drawCharging(){
  g.drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),W-62,2);
}

function drawAlarm(){
  g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),W/2,2);
}

function drawANCS(){
  g.drawImage(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"),30,2);
}

function drawReading(x,y){
    g.setFontAlign(-1,-1).setFontVector(16);
    g.drawString("Temp: "+READING.temp.toFixed(1)+"C",x,y);
    g.drawString("Humd: "+READING.humidity.toFixed(0)+"%",x,y+20);
    g.drawString("Press: "+READING.pressure.toFixed(0)+"hPa",x,y+40);
}

function drawClock(x,y){
    var now=Date();
    d=now.toString().split(' ');
    var min=d[4].substr(3,2);
    var sec=d[4].substr(-2);
    var tm=d[4].substring(0,5);
    var hr=d[4].substr(0,2);
    lastmin=min;
    g.setFontAlign(0,0);
    g.setFontVector(36);
    g.drawString(tm,x,y);
    g.setFontVector(18);
    var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
    g.drawString(dt,x,y+28);
}

var tdisp = 0;

var TIDE = getTideClock(tideinfo.hightide,125,61);

function drawDisp(){
  g.clearRect(0,0,W-1,H-1);
  g.setColor(1);
  drawBat(E.getBattery());
  if (P2.alarmset) drawAlarm();
  MOON.draw(W-82,2)
  if (E.charging) drawCharging();
  if (NRF.getSecurityStatus().connected) drawBlue();
  if (NRF.ancsIsActive()) drawANCS();
  if (tdisp==0) {
    g.drawLine(1,30,W-2,30);
    g.drawLine(W/2-5,30,W/2-5,106);
    drawClock(60,H/2-10);
    drawReading(W/2,40);
    weather = zambretti(PressD.trend(),READING.pressure);
    g.drawRect(1,106,W-2,120);
    g.setFontAlign(0,0).setFont("6x8",1).drawString(weather,W/2,113);
  } else {
    g.setFontVector(24);
    g.setFontAlign(1,1).drawString("Tides",245,120);
    g.setFontAlign(-1,1).drawString(tideinfo.place,5,120);
    TIDE.draw(); 
  }
  g.flip();
}

NRF.on("connect", function(a){
  drawBlue();
  setTimeout(()=>{if (NRF.ancsIsActive()) {drawANCS();g.flip();}},1000);
  g.flip();
});
  
NRF.on("disconnect", function(a){
  drawDisp();
});

E.on("charging",function(v){
  if (v) 
    drawCharging();
  else
    g.clearRect(W-62,2,W-45,25);
  g.flip();
});

var iRef;

function doDisp(id){
  if (iRef) clearInterval(iRef);
  if (id<=0){
    drawDisp();
    iRef = setInterval(drawDisp,30000);
  } else if (id==1)
    Press.draw();
  else if (id==2)
    PressD.draw();
  else if (id==3)
    Temp.draw();
  else if (id==4)
    Humd.draw();
  else
    g.clear();
}

doDisp(tdisp);

P2.setUI("leftright",(v)=>{
  if (v) {
    tdisp += v;
    if (tdisp>4) tdisp=4;
    if (tdisp<-1) tdisp=-1;
  }
  else tdisp=0;
  doDisp(tdisp);
});

global.SCREENACCESS = {
  request:function(){
    doDisp(5);
  },
  release:function(){
    doDisp(tdisp);
  }
}

eval(STOR.read("ancs.js"));
startancs();

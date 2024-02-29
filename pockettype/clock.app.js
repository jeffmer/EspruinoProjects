var W = g.getWidth();
var H = g.getHeight();

function drawBat(v){
  var s = 39;
  x = W-44; y = 2;
  g.fillRect(x,y+2,x+s-4,y+21);
  g.clearRect(x+2,y+4,x+s-6,y+19);
  g.fillRect(x+s-3,y+10,x+s,y+14);
  g.fillRect(x+4,y+6,x+4+Math.ceil(v*(s-12)/100),y+17);
}

function drawBlue(){
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 100);
}

function drawCharging(){
  g.drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),W-62,2);
}

function drawANCS(){
  g.drawImage(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"),W-30,H-30);
}

function drawAlarm(){
    g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),W-30,48);
}
    
function drawClock(){
  var now=Date();
  d=now.toString().split(' ');
  var min=d[4].substr(3,2);
  var sec=d[4].substr(-2);
  var tm=d[4].substring(0,5);
  var hr=d[4].substr(0,2);
  lastmin=min;
  g.clearRect(0,0,W-1,H-1);
  g.setFontAlign(0,0);
  g.setFontVector(48);
  g.drawString(tm,W/2,H/2-6);
  g.setFontVector(24);
  g.setColor(g.theme.fg2); 
  var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
  g.drawString(dt,W/2,H/2+28);
  g.setFontAlign(-1,-1);
  g.setFontVector(16);
  g.drawString(""+E.getTemperature().toFixed(1)+"C",4,4);
  drawBat(E.getBattery());
  if (E.charging) drawCharging();
  if (NRF.getSecurityStatus().connected) drawBlue();
  if (NRF.ancsIsActive()) {drawANCS();E.setConsole(Terminal);}
  if (P2.alarmset) drawAlarm();
  g.flip();
}

NRF.on("connect", function(a){
  drawBlue();
  setTimeout(()=>{if (NRF.ancsIsActive()) {drawANCS();g.flip();}},1000);
  g.flip();
});
  
NRF.on("disconnect", function(a){
  g.clearRect(4,100,20,120);
  g.clearRect(W-30,H-30,259,121);
  g.flip();
});

E.on("charging",function(v){
  if (v) 
    drawCharging();
  else
    g.clearRect(W-62,2,W-45,25);
  g.flip();
});

drawClock();
var ticker = setInterval(drawClock,30000);

global.SCREENACCESS = {
  withApp:true,
  request:function(){
  },
  release:function(){
  }
}

setWatch(function (){
  load("launch.js");
},BTN1,{edge:"falling",repeat:true});
 

eval(STOR.read("ancs.js"));
startancs();

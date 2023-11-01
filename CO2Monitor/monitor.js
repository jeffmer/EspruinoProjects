/* This code is in .boot0
SPI1.setup({sck:D2, mosi:D28, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D30,
  ce:D31,
  rst:D29
});
*/
eval(STOR.read("scd41.js"));

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


var connected = false;

function drawBlue(){
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 2);
}

function drawCharging(){
  g.drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),W-62,2);
}

READING = {co2:400, temp:20.1, humid:90};

function drawReading(x,y){
    if(SCD41.dataready()) READING = SCD41.readMeas();
    g.setFontAlign(-1,-1).setFontVector(16);
    g.drawString("CO2 : "+READING.co2+"ppm",x,y);
    g.drawString("Temp: "+READING.temp.toFixed(1)+"C",x,y+20);
    g.drawString("Humd: "+READING.humid.toFixed(0)+"%",x,y+40);
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
    g.setFontVector(20);
    var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
    g.drawString(dt,x,y+24);
}

function drawDisp(){
  g.clearRect(0,0,W-1,H-1);
  drawClock(60,H/2-4);
  drawBat(E.getBattery());
  if (E.charging) drawCharging();
  if (connected) drawBlue();
  g.fillRect(W/2-8,H/2-24,W/2-4,H/2+28);
  drawReading(W/2+4,H/2-24);
  g.flip();
}

NRF.on("connect", function(a){
  drawBlue();
  connected=true;
  g.flip();
});
  
NRF.on("disconnect", function(a){
  g.clearRect(4,100,20,120);
  connected=false;
  g.flip();
});

E.on("charging",function(v){
  if (v) 
    drawCharging();
  else
    g.clearRect(W-62,2,W-45,25);
  g.flip();
});

E.on("kill",function(){SCD41.stopMeas();});

SCD41.setTempOffset(0);
SCD41.startLowPowerMeas();
drawDisp();
setInterval(drawDisp,30000);

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
eval(STOR.read("trend.js"));

var W = g.getWidth();
var H = g.getHeight();

var CO2 = new Trend("CO2","ppm",0,2000);
var Humd = new Trend("Humd","%",0,100);
var Temp = new Trend("Temp","C",10,30);

E.on("kill",function(){
  CO2.save();
  Humd.save();
  Temp.save();
});

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
    g.setFontAlign(-1,-1).setFontVector(16);
    g.drawString("CO2 : "+READING.co2+"ppm",x,y);
    g.drawString("Temp: "+READING.temp.toFixed(1)+"C",x,y+20);
    g.drawString("Humd: "+READING.humid.toFixed(0)+"%",x,y+40);
}

var flash;

function start_flash(led1,led2){
  if (flash) return;
  var phase = true;
  flash = setInterval(function() {
    phase=!phase;
    led = phase?led1:led2;
    led.set();
    setTimeout(()=>led.reset(),100);
  }, 5000);
}

function end_flash(){
  if (flash) flash = clearInterval(flash);
}

function oneShot(){
  SCD41.oneShotMeas();
  setTimeout(function(){
    if(SCD41.dataready()) READING = SCD41.readMeas();
    end_flash();
    var co2 = READING.co2
    if (co2>1000 && co2<1200 )
      start_flash(LED2,LED2);
    else if (co2>=1200 && co2 <1400)
      start_flash(LED2,LED1);
    else if (co2>1400)
      start_flash(LED1,LED1);
  },5000);
}

function record(){
  CO2.record(READING.co2);
  Humd.record(READING.humid);
  Temp.record(READING.temp);
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
    g.drawString(dt,x,y+28);
}

function drawDisp(){
  g.clearRect(0,0,W-1,H-1);
  drawClock(60,H/2-6);
  drawBat(E.getBattery());
  if (E.charging) drawCharging();
  if (connected) drawBlue();
  g.fillRect(W/2-7,H/2-24,W/2-5,H/2+28);
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

SCD41.setTempOffset(0.5);
oneShot();
setInterval(oneShot,300000);
setTimeout(()=>record(),5500);
setInterval(record,600000)

var tdisp = 0;
var iRef;

function doDisp(id){
  if (iRef) clearInterval(iRef);
  if (id==0){
    drawDisp();
    iRef = setInterval(drawDisp,30000);
  } else if (id==1) 
    CO2.draw();
  else if (id==2)
    Humd.draw();
  else if (id==3)
    Temp.draw();
}

doDisp(tdisp);

setWatch(function(){
  tdisp = (tdisp+1) % 4;
  doDisp(tdisp);
},BTN1,{repeat:true,edge:"falling"});


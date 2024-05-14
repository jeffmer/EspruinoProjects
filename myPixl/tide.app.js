
eval(require("Storage").read("tide.js"));
var tideinfo = STOR.readJSON("tideinfo.json",1)||{place:"Cleder", hightide:"2024-04-08T19:07:00"};

var TIDE = getTideClock(tideinfo.hightide,185,61);

const W = g.getWidth();
const H = g.getHeight();

function drawClock(x,y){
    var now=Date();
    d=now.toString().split(' ');
    var min=d[4].substr(3,2);
    var sec=d[4].substr(-2);
    var tm=d[4].substring(0,5);
    var hr=d[4].substr(0,2);
    lastmin=min;
    g.setFontAlign(-1,-1);
    g.setFontVector(30);
    g.drawString(tm,x,y);
    g.setFontVector(18);
    var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
    g.drawString(dt,x,y+27);
}

function drawAll() {
    g.clearRect(0,0,W-1,H-1);
    g.setColor(3);
    g.setFontAlign(-1,-1);
    g.setFontVector(20);
    g.drawString("Tides:-",5,5);
    g.setFontVector(30).drawString(tideinfo.place,5,30);;
    drawClock(5,70);
    // draw dial   
    TIDE.draw();
    g.flip();
``}
 
drawAll();
setInterval(drawAll,30000);




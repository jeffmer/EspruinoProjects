var W = g.getWidth();
var H = g.getHeight();

function drawReading(x,y,n,d){
    co2 = d.getInt16(0,false);
    temp= d.getInt16(2,false)/10;
    humid = d.getUint8(4);
    bat  = d.getUint8(5);
    g.setFontAlign(-1,-1).setFontVector(15);
    g.drawString(n,x,y);
    g.drawString("CO2 : "+co2+"ppm",x,y+16);
    g.drawString("Temp: "+temp.toFixed(1)+"C",x,y+32);
    g.drawString("Humd: "+humid+"%",x,y+48);
    g.drawString("Bat: "+bat+"%",x,y+64);
}

function showStatus(s){
  g.setFontAlign(0,-1).setFont("Vector",18).drawString("Monitor",125,4);
  g.fillRect(125,30,126,110);
  g.setFont("6x8",1).setFontAlign(0,-1).drawString(s,125,110,true).flip();
}

function scanForDevices() {
    g.clear();
    showStatus("*** Scanning ***");
    NRF.findDevices(function(devs) {
      var idx = 0;
      devs.forEach(function(dev) {
        if (dev.manufacturer!=0x590) return;
        var d = new DataView(dev.manufacturerData);
        drawReading(8+(idx%2)*125,28,dev.name,d);
        idx++;
      });
      if (!idx) 
          showStatus("*** no devices found ***");
      else
          g.clearRect(0,110,249,121);
      g.flip();
    }, 2000); // scan for 1 sec
  }
  
scanForDevices();
setInterval(scanForDevices,120000);
eval(STOR.read("trend.js"));

var W = g.getWidth();
var H = g.getHeight();

function drawReading(x,y,n,d,sel){
  function highlight(v,s,x,y){
    if (v) g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).clearRect(x,y,x+g.stringWidth(s),y+g.getFontHeight());
    g.drawString(s,x,y);
    if (v) g.setColor(g.theme.fg).setBgColor(g.theme.bg);
  }
  co2 = d.getInt16(0,false);
  temp= d.getInt16(2,false)/10;
  humid = d.getUint8(4);
  bat  = d.getUint8(5);
  g.setFontAlign(-1,-1).setFont("8x16",1);
  g.drawString(n,x,y);
  highlight(sel==0,"CO2 : "+co2+"ppm",x,y+16);
  highlight(sel==1,"Temp: "+temp.toFixed(1)+"C",x,y+32);
  highlight(sel==2,"Humd: "+humid+"%",x,y+48);
  g.drawString("Bat: "+bat+"%",x,y+64);
}

function showStatus(s){
  g.setFontAlign(0,-1).setFont("12x20",1).drawString("Monitor",125,4);
  g.fillRect(125,30,126,110);
  g.setFont("6x8",1).setFontAlign(0,-1).drawString(s,125,110,true).flip();
}

var DEVS = [];
var selected = 0;
var selitem = 0;
var items =['CO2', 'Temp', 'Humd'];

function drawAll(){
  var i = 0;
  g.clear();
  g.setFontAlign(0,-1).setFont("12x20",1).drawString("Monitor",125,4);
  g.fillRect(125,30,126,110);
  DEVS.forEach(function(e){
    drawReading(10+(i%2)*125,28,e.name,e.data,selected==i?selitem:-1);
    ++i;
  });
  g.fillRect(20+120*selected,112,100+120*selected,119);
  g.flip();
}

function scanForDevices() {
  g.clear();
  showStatus("*** Scanning ***");
  NRF.findDevices(function(devs) {
    var idx = 0;
    devs.forEach(function(dev) {
      if (dev.manufacturer!=0x590) return;
      var d = new DataView(dev.manufacturerData);
      DEVS[idx] = {name:dev.name,data:d};
      idx++;
    });
    if (!idx) 
        showStatus("*** no devices found ***");
    else
        drawAll();
  }, 2000); // scan for 1 sec
}


function getHistory(devname,itemname){
  var uart;
  NRF.requestDevice({ filters: [{ name: devname }] }).then(function(device) {
    return require("ble_uart").connect(device);
  }).then(function(u) {
    uart = u;
    // Optional - wait 0.5 second for any data in the BLE buffer
    // to be sent - otherwise it may interfere with the result from
    // eval
    return new Promise(function(r) { setTimeout(r, 500); });
  }).then(function() {  
    return uart.eval(itemname);
  }).then(function(data) {
    C = new Trend();
    C.restore(data);
    C.draw();
    delete C;
    uart.disconnect();
  }).catch(function(err){
    E.showMessage(err,{title:"ERROR"});
  });
}

setWatch(function (){
  selected = (selected+1) % 2;
  drawAll();
},BTN3,{edge:"falling",repeat:true});

setWatch(function (){
  if (DEVS[selected]) {
    getHistory(DEVS[selected].name,items[selitem]);
    E.showMessage("Connecting to:\n"+DEVS[selected].name,{title:"Monitor"});
  }
},BTN2,{edge:"falling",repeat:true});

setWatch(function (){
  selitem = (selitem+1) % 3;
  drawAll();
},BTN1,{edge:"falling",repeat:true});
  
scanForDevices();
setInterval(scanForDevices,120000);
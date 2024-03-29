eval(STOR.read("trend.js"));

var W = g.getWidth();
var H = g.getHeight();
var DEVS = [];
var selected = 0;
var selitem = 0;
var items =['CO2', 'Temp', 'Humd', 'PressD'];
var NITEMS = 3;


function highlight(v,s,x,y){
    function setc(v){
        return g.setColor(v?g.theme.fgH:g.theme.fg).setBgColor(v?g.theme.bgH:g.theme.bg);
    }
    g.setFontAlign(-1,-1).setFont("8x16",1);
    setc(v).clearRect(x,y,x+g.stringWidth(s),y+g.getFontHeight()).drawString(s,x,y);
    if(v) setc(false);
}

function drawReading(x,y,d,sel){
  var co2 = d.getInt16(0,false);
  var temp= d.getInt16(2,false)/10;
  var humid = d.getUint8(4);
  var bat  = d.getUint8(5);
  if (d.byteLength>6) {
    NITEMS=4;
    press = d.getInt16(6,false);
  } else {
    NITEMS=3;
    if (selitem>=NITEMS) selitem = NITEMS-1;
  }
  highlight(sel==0,"CO2 : "+co2+"ppm",x,y);
  highlight(sel==1,"Temp: "+temp.toFixed(1)+"C",x,y+16);
  highlight(sel==2,"Humd: "+humid+"%",x,y+32);
  if (d.byteLength>6) highlight(sel==3,"Press: "+press+"hPa",x,y+48);
  g.drawString("Bat: "+bat+"%",x,y+(d.byteLength>6?64:48));
}

function showStatus(s){
  g.setFontAlign(0,-1).setFont("12x20",1).drawString("Monitor",125,4);
  g.fillRect(125,30,126,110);
  g.setFont("6x8",1).setFontAlign(0,-1).drawString(s,125,110,true).flip();
}

function drawAll(){
  var i = 0;
  g.clear();
  g.setFontAlign(0,-1).setFont("12x20",1).drawString("Monitor",125,4);
  g.fillRect(125,30,126,110);
  DEVS.forEach(function(e){
    highlight(selected==i,e.name,10,28+16*i);
    ++i;
  });
  if(DEVS[selected]) 
     drawReading(135,28,DEVS[selected].data,selitem);
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

P2.setUI("leftright",(v)=>{
    if(!v){
      if (DEVS[selected]) {
        getHistory(DEVS[selected].name,items[selitem]);
        E.showMessage("Connecting to:\n"+DEVS[selected].name,{title:"Monitor"});
      }
    } else if (v<0){
      selitem = (selitem+1) % NITEMS;
      drawAll();
    } else {
      selected = (selected+1) % 2;
      drawAll();
    }
})

/*
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
  selitem = (selitem+1) % NITEMS;
  drawAll();
},BTN1,{edge:"falling",repeat:true});
*/
scanForDevices();
setInterval(scanForDevices,120000);
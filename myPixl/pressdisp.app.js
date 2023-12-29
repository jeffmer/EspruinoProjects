eval(STOR.read("trend.js"));

var W = g.getWidth();
var H = g.getHeight();

function drawReading(x,y,n,sel){
  function highlight(v,s,x,y){
    if (v) g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).clearRect(x,y,x+g.stringWidth(s),y+g.getFontHeight());
    g.drawString(s,x,y);
    if (v) g.setColor(g.theme.fg).setBgColor(g.theme.bg);
  }
  g.setFontAlign(-1,-1).setFont("8x16",1);
  g.drawString(n,x,y);
  highlight(sel==0,"Press (hPa)",x,y+16);
  highlight(sel==1,"Temp  (C)",x,y+32);
  highlight(sel==2,"Humd  (%)",x,y+48);
  highlight(sel==3,"PressD(hPa)",x,y+64);
}

var DEVS = ["Puck.js 6bfc"];
var selected = 0;
var selitem = 0;
var items =['Press', 'Temp', 'Humd', 'PressD'];

function drawAll(){
  var i = 0;
  g.clear();
  g.setFontAlign(0,-1).setFont("12x20",1).drawString("Pressure Monitor",125,4);
  g.fillRect(125,30,126,110);
  DEVS.forEach(function(e){
    drawReading(10+(i%2)*125,28,e,selected==i?selitem:-1);
    ++i;
  });
  g.fillRect(20+120*selected,112,100+120*selected,119);
  g.flip();
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
    getHistory(DEVS[selected],items[selitem]);
    E.showMessage("Connecting to:\n"+DEVS[selected],{title:"Monitor"});
  }
},BTN2,{edge:"falling",repeat:true});

setWatch(function (){
  selitem = (selitem+1) % 4;
  drawAll();
},BTN1,{edge:"falling",repeat:true});
  
drawAll();
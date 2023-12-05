D14.reset(); //enable battery voltage read
D13.reset(); //high charging rate

var STOR = require("Storage");
var settings = STOR.readJSON("settings.json",1)||{invert:true, rotated:true};

SPI1.setup({sck:D2, mosi:D3, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D29,
  ce:D4,
  rst:D28,
  rotated:settings.rotated,
});
g.theme= {fg:1,bg:0,fg2:1,bg2:0,fgH:0,bgH:1,dark:true};
g.invert(settings.invert);

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

function batV(){
  return (analogRead(D31)*9.74);
}

E.getBattery = function (){
    var bv = batV();
    bp = bv<3.248088 ? 0 :  Math.ceil((bv-3.120712)*100);
    return bp<=100 ? bp : 100;
};

E.charging = false;

setWatch(
    function(){
      v = !D17.read();
      if (v!=E.charging){
        E.charging = v;
        E.emit("charging",v);
      }
    },D17, {repeat:true,edge:"both"});

P2 = {}; // environment 
P2.appRect = { x: 0, y: 0, w: 240, h: 122, x2: 249, y2: 121 };

setWatch( 
  function(e){
    if ((e.time-e.lastTime)>0.75) load("launch.js");
  },BTN1, {repeat:true,edge:"falling"});

require("Roboto15").add(Graphics)

E.showMessage = function(msg,options) {
  if ("string" == typeof options)
    options = { title : options };
  options = options||{};
  g.reset().clearRect(P2.appRect); // clear screen
  g.setFont("Roboto15",1).setFontAlign(0,-1);
  var Y = P2.appRect.y;
  var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
  var titleLines = g.wrapString(options.title, W-2);
  var msgLines = g.wrapString(msg||"", W-2);
  var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2;
  if (options.img) {
    var im = g.imageMetrics(options.img);
    g.drawImage(options.img,(W-im.width)/2,y - im.height/2);
    y += 4+im.height/2;
  }
  g.drawString(msgLines.join("\n"),W/2,y);  
  if (options.title)
    g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
      clearRect(0,Y,W-1,Y+4+titleLines.length*FH).
      drawString(titleLines.join("\n"),W/2,Y+2);
  g.flip(); // force immediate show of message
}
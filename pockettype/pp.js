var settings = STOR.readJSON("settings.json",1)||{invert:true, rotated:false};

eval(STOR.read("ST7302R.js"))

SPI1.setup({sck:D31, mosi:D29, baud: 20000000}); 

var g = ST7302({
  spi:SPI1,
  dc:D39,
  ce:D33,
});

var h = ST7302({
  spi:SPI1,
  dc:D39,
  ce:D34,
});

global["\xff"].gfx = h;

eval(STOR.read("keyboard.js"));

KEYBOARD.device = Terminal;
KEYBOARD.init();

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

function batV(){
  var v = 0;
  for (var i = 0; i<4; ++i) v+=E.getAnalogVRef();
  return v/4;
}

E.getBattery = function (){
    var v = batV();
    var pc = 0;
    if (v>=3.95) pc = 80 + (v-3.95)*20/(4.2-3.95); // 80%+
    else if (v>=3.7) pc = 10 + (v-3.7)*70/(3.95-3.7); // 10%+ is linear
    else pc = (v-3.3)*10/(3.7-3.3); // 0%+
    pc = Math.ceil(pc);
    return pc>100?100:pc;
};

if (NRF.getSecurityStatus().connected) 
   E.setConsole(Bluetooth)
else
   E.setConsole(Terminal);

NRF.on("connect", function(a){
  E.setConsole(Bluetooth);
});

NRF.on("disconnect", function(a){
  E.setConsole(Terminal);
});

g.theme= {fg:1,bg:0,fg2:1,bg2:0,fgH:0,bgH:1,dark:true};
g.invert(settings.invert);
P2 = {}; // environment 
P2.appRect = { x: 0, y: 0, w: 240, h: 122, x2: 249, y2: 121 };

require("Font8x16").add(Graphics);


P2.setUI = function(mode, cb) {
    function doit(v){
      switch(v){
        case 0: break;
        case 1: cb(-1);break;
        case 2: cb(1);break;
        case 3: break;
        case 4: cb();break;
        case 99: load("launch.js");
      }
    }
    KEYBOARD.removeAllListeners("key");
    KEYBOARD.on("key",doit);
}

P2.setUI();


E.showMessage = function(msg,options) {
  if ("string" == typeof options)
    options = { title : options };
  options = options||{};
  g.reset().clearRect(P2.appRect); // clear screen
  g.setFont("8x16",1).setFontAlign(0,-1);
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
  g.setColor(g.theme.fg).setBgColor(g.theme.bg);
}
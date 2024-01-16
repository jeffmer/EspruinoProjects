var STOR = require("Storage");

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
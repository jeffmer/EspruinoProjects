D14.reset(); //enable battery voltage read
D13.reset(); //high charging rate

SPI1.setup({sck:D2, mosi:D3, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D29,
  ce:D4,
  rst:D28
});

global["\xff"].gfx = g;

var STOR = require("Storage");

var SENSI2C = new I2C();
SENSI2C.setup({scl:D47,sda:D46,bitrate:200000});

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

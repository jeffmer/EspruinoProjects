

D25.reset(); D24.set(); //PCB Antenna
SPI1.setup({sck:D26, mosi:D27, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D34,
  ce:D40,
  rst:D33
});

global["\xff"].gfx = g;

var STOR = require("Storage");

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

function batV(){
  return (analogRead(D5)*4.524);
}

E.getBattery = function (){
    var bv = batV();
    bp = bv<3.248088 ? 0 :  Math.ceil((bv-3.120712)*100);
    return bp<=100 ? bp : 100;
};

E.charging = false;

setWatch(
    function(){
      v = D12.read();
      if (v!=E.charging){
        E.charging = v;
        E.emit("charging",v);
      }
    },D12, {repeat:true,edge:"both"});

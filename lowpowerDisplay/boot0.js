SPI1.setup({sck:D2, mosi:D28, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D30,
  ce:D31,
  rst:D29
});

global["\xff"].gfx = g;

var STOR = require("Storage");

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

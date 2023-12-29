

var STOR = require("Storage");

var SENSI2C = new I2C();
SENSI2C.setup({scl:D31,sda:D30,bitrate:100000});

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}



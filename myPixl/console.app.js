KEYS = new I2C();
KEYS.setup({scl:D46, sda:D47, bitrate:100000});

function read(){
  v = KEYS.readFrom(0x5F,1)[0];
  if (v!=0) return String.fromCharCode(v);
}

function init() {
  setInterval(()=>{
    var c = read(); 
    if (c) {
      Terminal.inject(c);
    }
  },200);
  E.setConsole(Terminal);
}

init();
E.on("kill",()=>E.setConsole(USB));
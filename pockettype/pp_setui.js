// ENTER:0, UP:1, DOWN:2, LEFT:3,RIGHT:4,ESC:99,

var P2 = {} //dummy

P2.setUI = function(mode, cb) {
    function doit(v){
      switch(v){
        case 0: cb(); break;
        case 1: cb(1); break;
        case 2: cb(-1);break;
        case 3: cb(-1);break;
        case 4: cb(1);break;
        case 99: load("launch.js");
      }
    }
    KEYBOARD.removeAllListeners("key");
    KEYBOARD.on("key",doit);
}
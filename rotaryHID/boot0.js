pinMode(D28,"input_pullup");
E.kickWatchdog();
setInterval(()=>{
  if(D28.read()) E.kickWatchdog();
},5000);
E.enableWatchdog(10, false);

function flash(pin){
    pin.set();
    setTimeout(()=>{pin.reset();},500);
}
function delayms(d) {
    var t = getTime()+d/1000; 
    while(getTime()<t);
}
var STOR = require("Storage");

NRF.on("connect",()=>{flash(LED3);});
NRF.on("disconnect",()=>{flash(LED1);});

delayms(2000);

if (D28.read()){
  flash(LED3);
  if (STOR.read("main.js")) eval(STOR.read("main.js"));
} else {
  flash(LED2);
}


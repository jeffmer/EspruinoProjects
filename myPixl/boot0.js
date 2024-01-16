
function KickWd(){
  if (!BTN2.read()) E.kickWatchdog();
}
var wdint=setInterval(KickWd,5000);
E.enableWatchdog(15, false);

if (!BTN3.read()) {
  eval(require("Storage").read("p2.js"));
}

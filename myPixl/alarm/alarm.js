// Chances are boot0.js got run already and scheduled *another*
// 'load(alarm.js)' - so let's remove it first!
if (P2.alarm) P2.alarm = clearTimeout(P2.alarm);

function formatTime(t) {
  var hrs = 0|t;
  var mins = Math.round((t-hrs)*60);
  return hrs+":"+("0"+mins).substr(-2);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

if (!E.showPrompt) eval(STOR.read("prompt.js"));

function showAlarm(alarm) {
  var msg = formatTime(alarm.hr);
  if (alarm.msg)
    msg += "\n"+alarm.msg;
  E.showPrompt(msg,{
    title:"ALARM!",
    buttons : {"Sleep":true,"Ok":false} // default is sleep so it'll come back in 10 mins
  }).then(function(sleep) {
    P2.alarmStop();
    if (sleep) {
      if(alarm.ohr===undefined) alarm.ohr = alarm.hr;
      alarm.hr += 10/60; // 10 minutes
    } else {
      alarm.last = (new Date()).getDate();
      if (alarm.ohr!==undefined) {
          alarm.hr = alarm.ohr;
          delete alarm.ohr;
      }
      if (!alarm.rp) alarm.on = false;
    }
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    load("clock.app.js");
  });
  function buzz() {
    P2.alarmStart();
    setTimeout(()=>{
        P2.alarmStop();
        if(alarm.as) { // auto-snooze
            setTimeout(buzz, 600000);
        }
      },30000);
  }
  buzz();
}

// Check for alarms
var day = (new Date()).getDate();
var hr = getCurrentHr()+10000; // get current time - 10s in future to ensure we alarm if we've started the app a tad early
var alarms = require("Storage").readJSON("alarm.json",1)||[];
var active = alarms.filter(a=>a.on&&(a.hr<hr)&&(a.last!=day));
if (active.length) {
  // if there's an alarm, show it
  active = active.sort((a,b)=>a.hr-b.hr);
  setTimeout(()=>{showAlarm(active[0]);},500);
} else {
  // otherwise just go back to default app
   load("clock.app.js");
}

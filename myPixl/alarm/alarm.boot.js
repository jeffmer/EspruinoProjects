// check for alarms
(function() {
  var alarms = STOR.readJSON('alarm.json',1)||[];
  var time = new Date();
  var active = alarms.filter(a=>a.on);
  if (active.length) {
    active = active.sort((a,b)=>(a.hr-b.hr)+(a.last-b.last)*24);
    var hr = time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
    if (!STOR.read("alarm.js")) {
      console.log("No alarm app!");
      STOR.write('alarm.json',"[]");
    } else {
      var t = 3600000*(active[0].hr-hr);
      if (active[0].last == time.getDate() || t < 0) t += 86400000;
      if (t<1000) t=1000;
      /* execute alarm at the correct time. We avoid execing immediately
      since this code will get called AGAIN when alarm.js is loaded. alarm.js
      will then clearInterval() to get rid of this call so it can proceed
      normally. */
      P2.alarm = setTimeout(function() {
        load("alarm.js");
      },t);
    }
  }
})();



if (!E.showPrompt) eval(STOR.read("prompt.js"));
if (!global.Blink) eval(STOR.read("blink.js"));

function startancs() {

  var s = STOR.readJSON("widancs.json",1)||{settings:{enabled:false, category:[1,2,4]}};
  var ENABLED = s.settings.enabled;
  var CATEGORY = s.settings.category;

  var notifyqueue = [];
  var current = {cat:0,uid:0};
    
  var screentimeout;
  var inalert = false;
  
  var blink = new Blink([LED2],5000,100);

  function release_screen(){
    blink.stop();
    screentimeout= setTimeout(() => { 
        SCREENACCESS.release(); 
        screentimeout = undefined; 
        inalert=false; 
        next_notify();
    }, 500);
  } 

var unicodeRemap = {
    '2019':"'",
    '260':"A",
    '261':"a",
    '262':"C",
    '263':"c",
    '268':"C",
    '269':"c",
    '270':"D",
    '271':"d",
    '280':"E",
    '281':"e",
    '282':"E",
    '283':"e",
    '321':"L",
    '322':"l",
    '323':"N",
    '324':"n",
    '327':"N",
    '328':"n",
    '344':"R",
    '345':"r",
    '346':"S",
    '347':"s",
    '352':"S",
    '353':"s",
    '356':"T",
    '357':"t",
    '377':"Z",
    '378':"z",
    '379':"Z",
    '380':"z",
    '381':"Z",
    '382':"z",
  };

  var replacer = ""; //(n)=>print('Unknown unicode '+n.toString(16));

  function displaymsg(m){
    blink.start();
    //we may already be displaying a prompt, so clear it
    E.showPrompt();
    if (screentimeout) clearTimeout(screentimeout);
    SCREENACCESS.request();
    var ttl = E.decodeUTF8(m.title, unicodeRemap, replacer);
    var msg = E.decodeUTF8(m.message, unicodeRemap, replacer);
    if (current.cat!=1){
      E.showAlert(msg,ttl).then(()=>{
        if (NRF.getSecurityStatus().connected) NRF.ancsAction(current.uid,0);
        release_screen();
      });
    } else {
      E.showPrompt(msg,{title:ttl,buttons:{"Accept":true,"Cancel":false}}).then((r)=>{
        if (NRF.getSecurityStatus().connected) NRF.ancsAction(current.uid,r);
        release_screen();
      });
    }
  }  

  var notifyTO;
  function getnotify(d){
    if (d.event!="add") return;
    if (notifyTO) clearTimeout(notifyTO);
    if(!CATEGORY.includes(d.category)) return; 
    var len = notifyqueue.length;
    if (d.category == 1) { // it's a call so pre-empt
        if (inalert) {notifyqueue.push(current); inalert=false;}
        notifyqueue.push({cat:d.category, uid:d.uid});
    } else if (len<32)
        notifyqueue[len] = {cat:d.category, uid:d.uid};
    notifyTO = setTimeout(next_notify,1000);
  }

  function next_notify(){
    if(notifyqueue.length==0 || inalert) return;
    inalert=true;
    current = notifyqueue.pop();
    NRF.ancsGetNotificationInfo(current.uid).then(
      (m)=>{displaymsg(m);}
    ).catch(function(e){
      inalert = false;
      next_notify();
      E.showMessage("ANCS: "+e,"ERROR");
    });
  }
  

  if (!NRF.ancsIsActive()) NRF.disconnect(); // disconnect as it may be stuck in uart only service
  if (ENABLED && typeof SCREENACCESS!='undefined') {
    E.on("ANCS", getnotify);
    NRF.setServices(undefined,{ancs:true,cts:true});
  }
  
}


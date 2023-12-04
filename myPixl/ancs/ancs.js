

if (!E.showPrompt) eval(STOR.read("prompt.js"));

function startancs() {

  var s = STOR.readJSON("widancs.json",1)||{settings:{enabled:false, category:[1,2,4]}};
  var ENABLED = s.settings.enabled;
  var CATEGORY = s.settings.category;

  var notifyqueue = [];
  var current = {cat:0,uid:0};
    
  var screentimeout;
  var inalert = false;
  
  function release_screen(){
    screentimeout= setTimeout(() => { 
        SCREENACCESS.release(); 
        screentimeout = undefined; 
        inalert=false; 
        next_notify();
    }, 500);
  } 

  var unicodeRemap = {
    '2019':"'"
  };
  var replacer = ""; //(n)=>print('Unknown unicode '+n.toString(16));

  function displaymsg(m){
    //we may already be displaying a prompt, so clear it
    E.showPrompt();
    if (screentimeout) clearTimeout(screentimeout);
    Bangle.setLCDPower(1);
    SCREENACCESS.request();
    Bangle.buzz();
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
  }  function draw(){
    var img = E.toArrayBuffer(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"));
    if (stage>1) g.drawImage(img,g.getWidth()-40,g.getHeigth()-24);
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

  var stage = 0    
  function draw(){
    var img = E.toArrayBuffer(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"));
    g.setColor((stage>1)?1:0).drawImage(img,g.getWidth()-30,g.getHeight()-30).flip();
    g.setColor(1);
  }

  E.showAlert = function(msg,title) {
    return E.showPrompt(msg,{title:title,buttons:{Ok:1}});
  }
  
  function changed(){
    stage = NRF.getSecurityStatus().connected ? 2 : 1;
    draw();
  }
  
  if (ENABLED && typeof SCREENACCESS!='undefined') {
    E.setConsole("USB", {force:true});
    console.log("Starting ANCS");
    E.on("ANCS", getnotify);
    NRF.on('connect',changed);
    NRF.on('disconnect',changed);
    NRF.setServices(undefined,{ancs:true});
    stage = NRF.getSecurityStatus().connected ? 2 : 1;
  }
  
}

/*
WARNING: PM: PM_EVT_ERROR_UNEXPECTED 2
WARNING: PM: PM_EVT_ERROR_UNEXPECTED 3
*/

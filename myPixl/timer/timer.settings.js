(function(back) {

  var s = STOR.readJSON("timer.json",1)||{mins:0, secs:10};

  function save() {
    STOR.write("timer.json", s);
  }
  

 function showMain(){
    return E.showMenu({
      "Minutes" : {
        value : s.mins,
        min:0,max:59,step:1,wrap:true,
        onchange : v => { s.mins=v; }
      },
      "Seconds" : {
        value : s.secs,
        min:0,max:59,step:1,wrap:true,
        onchange : v => { s.secs=v; }
      },
      '< Back': ()=>{save();back();}
    });
  }
  
  showMain();
});
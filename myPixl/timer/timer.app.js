require("Font5x9Numeric7Seg").add(Graphics);

var s = STOR.readJSON("timer.json",1)||{mins:0, secs:10};

var counter = s.mins*60 + s.secs;

function draw() {
  const m = Math.floor(counter / 60);
  const s = Math.floor(counter % 60);
  function st(d){ return d < 10 ? `0${d}` : d.toString();}
  g.clearRect(0,0,249,100);
  g.setFont("5x9Numeric7Seg",6);
  g.setFontAlign(0,0).drawString(st(m)+":"+st(s),125,61).flip();
}

function countDown() {
  --counter;
  draw();
  if (counter <= 0 && ticker) {
    ticker = clearInterval(ticker);
    P2.blinker.start();
  }
}

var ticker = undefined;

function initialise(){
  if (ticker) ticker = clearInterval(ticker);
  P2.blinker.stop();
  counter = s.mins*60 + s.secs;
  draw();
}

setWatch(function (){
    initialise();
    ticker = setInterval(countDown,1000);
},BTN3,{edge:"rising",repeat:true});

setWatch(initialise,BTN2,{edge:"rising",repeat:true});

setWatch(function (){
  load("clock.app.js");
},BTN1,{edge:"rising",repeat:true});

g.setFont("8x16");
g.setFontAlign(-1,-1).drawString("Start",10,104);
g.setFontAlign(0,-1).drawString("Reset",125,104);
g.setFontAlign(1,-1).drawString("Back",240,104);
draw();
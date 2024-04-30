

function drawBat(g,v){
  var s = 39;
  x = g.getWidth()-44; y = 2;
  g.fillRect(x,y+2,x+s-4,y+21);
  g.clearRect(x+2,y+4,x+s-6,y+19);
  g.fillRect(x+s-3,y+10,x+s,y+14);
  g.fillRect(x+4,y+6,x+4+Math.ceil(v*(s-12)/100),y+17);
}

var cx = 125;
var cy = 61;

Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
  var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
  return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0], 
    {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};

function dial(g,r) {
  for (let a=0;a<360;a+=6)
  if (a % 90 == 0) 
    g.drawRotRect(6,r-8,r,a);
  else if (a % 30 == 0)
    g.drawRotRect(4,r-8,r,a);
  else 
    g.drawRotRect(2,r-5,r,a);
}

var minuteDate;
var secondDate;

function onSecond(notfirst) {
        let hh = g.drawRotRect.bind(g,5,4,43);
        let mh = g.drawRotRect.bind(g,3,4,50);
        let sh = g.drawRotRect.bind(g,2,3,52);
        g.setColor(g.theme.bg);
        sh(secondDate.getSeconds()*6);
        if (secondDate.getSeconds() === 0 || notfirst) {
            hh(minuteDate.getHours()*30 + minuteDate.getMinutes()/2);
            mh(minuteDate.getMinutes()*6);
            minuteDate = new Date();
        }
        g.setColor(g.theme.fg);
        hh(minuteDate.getHours()*30 + minuteDate.getMinutes()/2);
        mh(minuteDate.getMinutes()*6);
        secondDate = new Date();
        sh(secondDate.getSeconds()*6);
        g.fillCircle(cx, cy, 4);
        g.flip();
    }

  
function drawWidgets(){
  g.clearRect(0,0,50,30);
  g.setFontAlign(-1,-1);
  g.setFontVector(16);
  g.drawString(""+E.getTemperature().toFixed(1)+"C",4,4);
  drawBat(g,E.getBattery());
}

function draw(g){
    g.invert(true);
    drawWidgets();
    dial(g,60);
    secondDate = minuteDate = new Date();
    onSecond(true);
    g.flip();
}

draw(g);
setInterval(onSecond,1000);
setInterval(drawWidgets,30000);

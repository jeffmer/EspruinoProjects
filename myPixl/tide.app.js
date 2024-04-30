


const p = Math.PI/2;
const PRad = Math.PI/180;
const HIGHTIDE = Math.floor(Date.parse("2024-04-08T19:07:00")/1000);
const W = g.getWidth();
const H = g.getHeight();
const CX = 185;
const CY = H/2;

function tideangle(){
    t = (Math.floor(Date.now()/1000)-HIGHTIDE)%44714;
    return Math.floor(360*t/44714);

}

function dialmark(r) {
    const m = ['Hi','5','4','3','2','1','Lo','5','4','3','2','1'];
    g.setColor(3);
    g.setFont("8x16",1).setFontAlign(0,0);
    for (i=0;i<12;i++){
        var a = i*30*PRad;
        var x = CX+Math.sin(a)*r;
        var y = CY-Math.cos(a)*r;
        g.drawString(m[i],x,y);
        x = CX+Math.sin(a)*(r-11);
        y = CY-Math.cos(a)*(r-11);
        g.fillRect(x-1,y-1,x+1,y+1);
    }
    g.drawCircle(CX,CY,r-11);

}

function hand(angle, r1,r2, r3) {
    const a = angle*PRad;
    g.fillPoly([
        CX+Math.sin(a)*r1,
        CY-Math.cos(a)*r1,
        CX+Math.sin(a+p)*r3,
        CY-Math.cos(a+p)*r3,
        CX+Math.sin(a)*r2,
        CY-Math.cos(a)*r2,
        CX+Math.sin(a-p)*r3,
        CY-Math.cos(a-p)*r3]);
}

var lastPos;
var currPos;

function onMinute() {
    g.setColor(0);
    hand(lastpos, -10, 36, 5);
    currpos = tideangle();
    g.setColor(3);
    hand(currpos, -8, 36, 5);
    lastpos = currpos;
    g.setColor(0,0,0);
    g.fillCircle(CX,CY,2);
    g.flip();
    }

function drawClock(x,y){
    var now=Date();
    d=now.toString().split(' ');
    var min=d[4].substr(3,2);
    var sec=d[4].substr(-2);
    var tm=d[4].substring(0,5);
    var hr=d[4].substr(0,2);
    lastmin=min;
    g.setFontAlign(-1,-1);
    g.setFontVector(30);
    g.drawString(tm,x,y);
    g.setFontVector(18);
    var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
    g.drawString(dt,x,y+27);
}

function drawAll() {
    g.clearRect(0,0,W-1,H-1);
    g.setColor(3);
    g.setFontAlign(-1,-1);
    g.setFontVector(20);
    g.drawString("Tides:-",5,5);
    g.setFontVector(30).drawString(" Cleder",5,30);;
    drawClock(5,70);
    currpos = lastpos = tideangle();
    // draw dial   
    dialmark(49);
    onMinute();
}
 
drawAll();
setInterval(drawAll,30000);




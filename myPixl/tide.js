
function getTideClock(hightide,x,y) {
    const p = Math.PI/2;
    const PRad = Math.PI/180;
    const HIGHTIDE = Math.floor(Date.parse(hightide)/1000);

    const CX = x;
    const CY = y;

    function tideangle(){
        t = (Math.floor(Date.now()/1000)-HIGHTIDE)%44714;
        return Math.floor(360*t/44714);

    }

    function dialmark(r) {
        const m = ['Hi','5','4','3','2','1','Lo','5','4','3','2','1'];
        g.setColor(1);
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

    function onMinute() {
        dialmark(49);
        var currpos = tideangle();
        hand(currpos, -8, 36, 5);
        g.setColor(0);
        g.fillCircle(CX,CY,2);
        g.setColor(0);
    }

        return {draw:onMinute}
}

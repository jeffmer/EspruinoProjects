/* record and display monitored variable trend
* record every 10  minutes and store for 24 hours
*/


class Trend {

    constructor(title,units,minv,maxv){
        this.title =title;
        this.units = units;
        this.minv = minv;
        this.maxv = maxv;
        this.restore();
    }

    save(){
        STOR.writeJSON(this.title+".json",this);
    }

    restore(){
        saved = STOR.readJSON(this.title+".json");
        if (saved){
            this.values = new Uint16Array(saved.values);
            this.next = saved.next;
            this.dim = saved.dim;
            saved=null;
        } else {
            this.values = new Uint16Array(144);
            this.next = 0;
            this.dim = this.dimension();
        }
    }
    
    dimension(){
      var rng = this.maxv-this.minv;
      if (rng<10) return 1000;
      else if (rng<100) return 100;
      else if (rng<1000) return 10;
      return 1;
    }
  
    tostr(val){
        return (val/this.dim).toFixed(this.dim<100?0:1);
    }

    record(val){
        v = Math.round(val*this.dim);
        this.values[this.next] = v;
        this.next=(this.next+1)%144;
    }

    draw(){
        var W = g.getWidth();
        var H = g.getHeight();
        var XOFF = 75;
        var YOFF = 110;
        var minv = this.minv*this.dim;
        var maxv = this.maxv*this.dim;
        var incv = Math.floor((maxv-minv)/10);
        var vals = this.values;
        var start = this.next;
        g.clearRect(0,0,W-1,H-1);
        g.setFont("Vector",18);
        g.setFontAlign(-11,-1).drawString(this.title,4,8);
        g.setFont("Vector",14).drawString("("+this.units+")",4,28);
        // x-axis
        g.setFontAlign(0,-1).setFont("4x6",1);
        g.drawLine(XOFF,110,XOFF+144,110);
        for(var i=0;i<=24;i+=2){
            var x = XOFF+i*6;
            g.drawLine(x,YOFF+1,x,YOFF+3);
            g.drawString(""+(24-i),x,114);
        }
        // y-axis
        g.setFontAlign(1,0).setFont("4x6",1);
        g.drawLine(XOFF,YOFF-100,XOFF,YOFF);
        for(i=0;i<=10;i++){
            var y= 110-i*10;
            g.drawLine(XOFF-4,y,XOFF-1,y);
            g.drawString(this.tostr(minv+i*incv),XOFF-5,y);
        }
        // values
        g.setFontAlign(-1,0).setFont("4x6",1);
        var scale = (100/(maxv-minv));
        var v0 = vals[(start)%144];
        var iv0 = Math.round((v0-minv)*scale);
        for(i=1;i<144;i++){
            var v = vals[(start+i)%144];
            var iv = Math.round((v-minv)*scale);
            g.drawLine(XOFF+i-1,YOFF-iv0,XOFF+i,YOFF-iv);
            v0 = v;
            iv0 = iv;
        }
        g.drawString(this.tostr(v0),XOFF+i+2,YOFF-iv0);
        g.flip();
    }

}


/*
var T = new Trend("Temp","oC",10,30);

for (var i = 0; i<144; i+=1) T.record((20*i/144)+10);

T.draw();
*/

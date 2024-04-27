/* record and display monitored variable trend
* record every 10  minutes and store for 24 hours
* or every hour for 6 days
*/


class Trend {

    constructor(title,units,minv,maxv,dim){
        this.title =title;
        this.units = units;
        this.minv = minv;
        this.maxv = maxv;
        this.dim = dim;
        this.days= false;
        this.restore();
    }

    save(){
        STOR.writeJSON(this.title+".json",this);
    }

    restore(saved){
        if (!saved) saved = STOR.readJSON(this.title+".json");
        if (saved){
            if (!this.title) this.title = saved.title;
            this.values = new Uint16Array(saved.values);
            this.next = saved.next;
            this.dim = saved.dim;
            if(saved.days) this.days = saved.days;
            if(!this.units) this.units = saved.units;
            if(!this.minv) this.minv = saved.minv;
            if(!this.maxv) this.maxv = saved.maxv;
            saved=null;
        } else {
            if(!this.dim) this.dim = this.dimension();
            this.values = new Uint16Array(144);        
            this.next = 0;
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

    trend(){
        var current = Math.round(this.values[this.next+143]/this.dim);
        var prev = Math.round(this.values[this.next+142]/this.dim);
        return current>prev? 1: current<prev ? -1 : 0;
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
        g.setFontAlign(-1,-1).drawString(this.title.substr(0,5),4,8);
        g.setFont("Vector",14).drawString("("+this.units+")",4,28);
        g.setFont("Vector",12).drawString(this.days?"days":"hours",4,104);
        // x-axis
        g.setFontAlign(0,-1).setFont("4x6",1);
        g.drawLine(XOFF,110,XOFF+144,110);
        if (this.days)
        for(var i=0;i<=6;i++){
            var x = XOFF+i*24;
            g.drawLine(x,YOFF+1,x,YOFF+3);
            g.drawString(""+(6-i),x,114);
        } else
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


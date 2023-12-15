class Horn {
    constructor(pin,high,low,period){
        this.pin = pin;
        this.high =high;
        this.low = low;
        this.period = period;
    } 

    freq(f) { 
        if (f===0) digitalWrite(this.pin,0);
        else analogWrite(this.pin, 0.5, { freq: f } );
    }

    start(){
        var highlow = true;
        this.freq(this.low);
        this.ticker = setInterval(function(){
          this.freq(highlow?this.high:this.low);
          highlow=!highlow;
        }.bind(this),this.period);
    }
      
    stop(){
        if (this.ticker) this.ticker = clearInterval(this.ticker);
        this.freq(0);
    }
}

// horn = new Horn(D5,392,261,500);
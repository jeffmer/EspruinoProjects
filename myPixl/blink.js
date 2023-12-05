class Blink {
    constructor(led,period,ontime){
        this.led =led;
        this.period = period;
        this.ontime = ontime;
    }  
    flash(){
      this.led.set();
      setTimeout(()=>this.led.reset(),this.ontime);
    } 
    start(){
        this.flash();
        this.ticker = setInterval(()=>this.flash(),this.period);
    }
    stop(){
        if (this.ticker) this.ticker = clearTimeout(this.ticker);
    }
}



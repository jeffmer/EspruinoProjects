class Blink {
    constructor(leds,period,ontime){
        this.leds =leds;
        this.lno = 0;
        this.period = period;
        this.ontime = ontime;
    }  
    flash(){
      led = this.leds[this.lno];
      this.lno = (this.lno+1)%this.leds.length;
      led.set();
      setTimeout(()=>led.reset(),this.ontime);
    } 
    start(){
        this.flash();
        this.ticker = setInterval(()=>this.flash(),this.period);
    }
    stop(){
        if (this.ticker) this.ticker = clearTimeout(this.ticker);
    }
}



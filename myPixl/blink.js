class Blink {
    constructor(led1,led2,led3,period,ontime){
        this.leds =[led1,led2,led3];
        this.lno = 0;
        this.period = period;
        this.ontime = ontime;
    }  
    flash(){
      led = this.leds[this.lno];
      this.lno = (this.lno+1)%3;
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



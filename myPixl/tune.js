
class Tune {
    constructor(pin,notes,period){
        this.pin = pin;
        this.notes = notes;
        this.period = period;
    } 

     pitch(c){
     this.freq({
          'a':220.00,'b':246.94,'c':261.63,
          'd':293.66,'e':329.63,'f':349.23,
          'g':392.00,
          'A':440.00,'B':493.88,'C':523.25,
          'D':587.33,'E':659.26,'F':698.46,
          'G':783.99,
          ' ':0
        }[c]);
    }
    
    freq(f) { 
        if (f===0) digitalWrite(this.pin,0);
        else analogWrite(this.pin, 0.5, { freq: f } );
    }

    beep(f,d){
        this.freq(f);
        setTimeout(this.freq.bind(this,0),d);
    }

    play(){
        step = 0;
        this.ticker = setInterval(function(){
          this.pitch(this.notes[step]);
          step = (step+1)%this.notes.length;
        }.bind(this),this.period);
    }
      
    stop(){
        if (this.ticker) this.ticker = clearInterval(this.ticker);
        this.freq(0);
    }
}

/*
var tune = "abcdefgABCDEFG  ";
T = new Tune(D5,tune,200);
*/
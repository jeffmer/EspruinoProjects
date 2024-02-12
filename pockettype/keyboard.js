
/*     RELEASED:0, PRESSED:1, HOLD:2, */

var kb = require("ble_hid_kb");

const K = kb.KEY;

var KEYMAP = [];

KEYMAP[0] = new Uint8Array([
    K.TAB,   K.Q,    K.W,   K.E,    K.R,      K.T,      K.Y,       K.U,       K.I,         K.O,      K.P,         K.BACKSPACE,
    K.ESC,   K.A,    K.S,   K.D,    K.F,      K.G,      K.H,       K.J,       K.K,         K.L,      K.SEMICOLON, K.SQUOTE,
    K.SHIFT, K.Z,    K.X,   K.C,    K.V,      K.B,      K.N,       K.M,       K.COMMA,     K.DOT,    K.SLASH,     K.ENTER, 
    K.CAPS,  K.CTRL, K.ALT, K.GUI,  K.LOWER,  K.SPACE,  K.SPACE,   K.RAISE,   K.LEFT,      K.DOWN,   K.UP,      K.RIGHT, 
]);

KEYMAP[1] = new Uint8Array([
    K.TILDE, K.ONE,  K.TWO, K.THREE, K.FOUR,  K.FIVE,   K.SIX,     K.SEVEN,   K.EIGHT,     K.NINE,   K.ZERO,      K.BACKSPACE,
    K.DELETE,K.F1,    K.F2,   K.F3,    K.F4,    K.F5,   K.F6,      K.MINUS, K.EQUALS, K.LSQUARE, K.RSQUARE, K.BACKSLASH,
    K.SHIFT, K.F7,    K.F8,   K.F9,    K.F10,   K.F12,  K.N,       K.M,       K.COMMA,     K.DOT,    K.SLASH,     K.ENTER, 
    K.CAPS,  K.CTRL, K.GUI, K.ALT,   K.LOWER, K.SPACE,  K.SPACE,   K.RAISE,   K.LEFT,      K.DOWN,   K.UP,        K.RIGHT, 
]);

var ASCII = [
   "\x09qwertyuiop\x08\x1Basdfghjkl;\'\0zxcvbnm,./\r\0\0\0\0\0\0  \0\0\0\0\0",
   "\x09QWERTYUIOP\x08\x1BASDFGHJKL:\"\0ZXCVBNM<>?\r\0\0\0\0\0\0  \0\0\0\0\0",
   "\`1234567890\x08\0\0\0\0\0\0\0-=[]\\\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
   "~!@#$%^&*()\x08\\0\0\0\0\0\0\0_+{}|\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
];

global.KEYBOARD = {
    NONE:0, ENTER:1, UP:2, DOWN:3, LEFT:4,RIGHT:5,ESC:99,
    COLS:[D2,D47,D45,D43,D10,D9,D36,D11,D24,D22,D20,D8],
    ROWS:[D6,D17,D32,D38],
    keystate:new Uint8Array(48),
    events:new Uint8Array(24),
    alive:0,
    modifiers:0,
    layer:0,
    toConsole:false,
    toBLE:false,
    ticker:undefined,
    device:undefined,

    getch: function(key,shifted){
        var s ="";
        if (this.layer==0) s = shifted?ASCII[1][key]:ASCII[0][key];
        else if (this.layer==1) s = shifted?ASCII[3][key]:ASCII[2][key];
        return s;
    },

    modify:function(m,e){
        if (e) this.modifiers|=m; else this.modifiers&= ~(m);
    },

    action:function(k,e){
        if (e==2 ) return;
        var actcode = 0;
        switch(k) {
            case 12:
                if (e==1) actcode = this.ESC;
                break;
            case 35:
                if (e==1) actcode = this.ENTER;
                break;
            case 36:
                if (e==1) {
                    this.toConsole=!this.toConsole;
                    LED1.write(this.toConsole);
                }
                return;
            case 40:
                this.modify(kb.MODIFY.SHIFT,e);
                if (e==1) this.layer=1;
                if (e==0) this.layer=0;
                return;
            case 43:
                if (e==1) this.layer=1;
                if (e==0) this.layer=0;
                return;
            case 44:
                if (e==1) actcode = this.LEFT;
                break;
            case 45:
                if (e==1) actcode = this.DOWN;
                break;
            case 46:
                if (e==1) actcode = this.UP;
                break;
            case 47:
                if (e==1) actcode = this.RIGHT;
                break; 
        }   
        var key = KEYMAP[this.layer>=1?1:0][k];
        if (key>=224){
            if (key==224) this.modify(kb.MODIFY.CTRL,e);
            else if (key ==225) this.modify(kb.MODIFY.SHIFT,e);
            else if (key ==226) this.modify(kb.MODIFY.ALT,e);
            else if (key ==227) this.modify(kb.MODIFY.GUI,e);
        } else {
            if (e) {
 //               console.log("xy:",k,"key: ",key, " Modifier: ",this.modifiers);
                  if (this.toBLE) kb.tap(key,this.modifiers);
                  var c = this.getch(k,this.modifiers&kb.MODIFY.SHIFT,this.layer);
                  if (this.toConsole){
                    if (this.device) this.device.inject(c);
                  } else {
                    this.emit("key",{act:actcode,char:c});
                  }
            }
        }
    },

    scan: function() {
       "jit";
        var equeue= this.events;
        var qi = 0;
        for(var c=0;c<12;++c){
            var cp = this.COLS[c]; cp.set();
            for(var r=0;r<4;++r) {
                let kn = r*12+c;
                let ks = this.keystate[kn];
                if (this.ROWS[r].read()) {
                    if (ks==0) 
                        {equeue[qi++] = kn; equeue[qi++]=1;}
                    else if (ks>5 && ks!=15) 
                        {equeue[qi++] = kn; equeue[qi++]=2;ks=15;}
                    if (ks<=5) ++ks;
                } else {
                    if (ks>0) {equeue[qi++] = kn; equeue[qi++]=0; ks=0;}
                }
                this.keystate[kn]=ks;
            }
            cp.reset();
        }
        this.alive = qi>0? 0 : this.alive+1;
        return qi;
    },

    scanproc:function(){
      var qi = this.scan();
      var kq = this.events;
      var i = 0;
      while (i<qi) {
         this.action(kq[i++],kq[i++]);
      }
      if (this.alive>50) this.sleep();
    },

    sleep:function(){
        function restart() {clearWatch();this.init();}
        if(this.ticker) this.ticker = clearInterval(this.ticker);
        this.COLS.forEach(function (p){p.set();});
        for (let i=0;i<this.ROWS.length;i++)
            setWatch(restart.bind(this),this.ROWS[i],{edge:"both"});
    },

    init:function(){
        this.alive=0;
        this.COLS.forEach(function (p){p.reset();});
        this.ROWS.forEach(function (p){pinMode(p,"input_pulldown");});
        this.ticker = setInterval(this.scanproc.bind(this),100);
    }
};

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

/*

KEYBOARD.init();

NRF.setServices(undefined, { hid : kb.report });

NRF.setAdvertising([
  {}, // include original Advertising packet
  [   // second packet containing 'appearance'
    2, 1, 6,  // standard Bluetooth flags
    3,3,0x12,0x18, // HID Service
    3,0x19,0xc1,0x03 // Appearance: Keyboard
        // 0xc2,0x03 : 0x03C2 Mouse
        // 0xc3,0x03 : 0x03C3 Joystick
  ]
]);
*/
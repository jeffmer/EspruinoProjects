
/*     RELEASED:0, PRESSED:1, HOLD:2, */

var kb = require("ble_hid_kb");

const K = kb.KEY;

var KEYMAP = new Uint8Array([
    K.ESC,   K.Q,    K.W,   K.E,    K.R,     K.T,      K.Y,      K.U,     K.I,     K.O,    K.P,         K.BACKSPACE,
    K.TAB,   K.A,    K.S,   K.D,    K.F,     K.G,      K.H,      K.J,     K.K,     K.L,    K.SEMICOLON, K.ENTER,
    K.SHIFT, K.Z,    K.X,   K.C,    K.V,     K.B,      K.N,      K.M,     K.COMMA, K.DOT,  K.UP,        K.SLASH, 
    K.CAPS,  K.CTRL, K.GUI, K.ALT,  K.LOWER, K.SPACE,  K.SPACE,  K.RAISE, K.ALT,   K.LEFT, K.DOWN,      K.RIGHT, 
]);

var KEYLOW  ="\x1Bqwertyuiop\x08\x09asdfghjkl;\r\0zxcvbnm,.\0/\0\0\0\0\0  \0\0\0\0\0";
var KEYHIGH ="\x1BQWERTYUIOP\x08\x09ASDFGHJKL:\r\0ZXCVBNM<>\0?\0\0\0\0\0  \0\0\0\0\0";

function usb_write(key,shifted){
    var s = shifted?KEYHIGH[key]:KEYLOW[key];
    USB.write(s);
}

global.KEYBOARD = {
    COLS:[D2,D47,D45,D43,D10,D9,D36,D11,D24,D22,D20,D8],
    ROWS:[D6,D17,D32,D38],
    keystate:new Uint8Array(48),
    events:new Uint8Array(24),
    modifiers:0,
    modify:function(m,e){
        if (e) this.modifiers|=m; else this.modifiers&= ~(m);
    },
    action:function(k,e){
        if (e==2) return;
        var key = KEYMAP[k];
        if (key>=224){
            if (key==224) this.modify(kb.MODIFY.CTRL,e);
            else if (key ==225) this.modify(kb.MODIFY.SHIFT,e);
            else if (key ==226) this.modify(kb.MODIFY.ALT,e);
            else if (key ==227) this.modify(kb.MODIFY.GUI,e);
        } else {
            if (e) {
 //               console.log("xy:",k,"key: ",key, " Modifier: ",this.modifiers);
 //               kb.tap(key,this.modifiers);
                  usb_write(k,this.modifiers&kb.MODIFY.SHIFT);
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
                    if (ks==0) {equeue[qi++] = kn; equeue[qi++]=1;}
                    else if (ks>5 && ks!=15) {equeue[qi++] = kn; equeue[qi++]=2;ks=15;}
                    if (ks<=5) ++ks;
                } else {
                    if (ks>0) {equeue[qi++] = kn; equeue[qi++]=0; ks=0;}
                }
                this.keystate[kn]=ks;
            }
            cp.reset();
        }
        return qi;
    },
    scanproc:function(){
      var qi = this.scan();
      var kq = this.events;
      var i = 0;
      while (i<qi) {
         this.action(kq[i++],kq[i++]);
       }
    },
    init:function(){
        this.COLS.forEach(function (p){p.reset();});
        this.ROWS.forEach(function (p){pinMode(p,"input_pulldown");});
        setInterval(this.scanproc.bind(this),100);
    }
};

function timeit(fn){
  var start = getTime();
  fn();
  print(""+((getTime()-start)*1000).toFixed(1)+"ms");
}

KEYBOARD.init();
USB.setConsole(true);
/*
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
function createEncoder(pinA,pinB){
  pinMode(pinA,"input_pullup");
  pinMode(pinB,"input_pullup"); 
  var a0=pinA.read(), c0=pinB.read(), incr0 =0, second=false;
  var OBJ = {};

  function handler () {
    var a = pinA.read();
    var b = pinB.read();
    if (a != a0) {              // A changed
      a0 = a;
      if (b != c0) {
        c0 = b;
        var incr = (a == b)?1:-1;
        if (incr!=incr0 || !second) OBJ.emit("change",incr);
        incr0=incr; second = !second;
      }
    }
  }
  setWatch(handler,pinA,{repeat:true,edge:"both"});
  return OBJ;
}
  
function createSwitch(pinA){
  pinMode(pinA,"input_pullup");
  var OBJ = {};
  var state = pinA.read();
  
  function handler(){
    var ns = pinA.read();
    if (state!=ns){
      OBJ.emit("change",!ns);
      state=ns;
    }
  }
  setWatch(handler,pinA,{repeat:true,edge:"both"});
  return OBJ;
}

//HID report for Mouse device
var report = new Uint8Array([
  0x05, 0x01, 0x09, 0x02, 0xA1, 0x01,
  0x09, 0x01, 0xA1, 0x00, 0x05, 0x09,
  0x19, 0x01, 0x29, 0x03, 0x15, 0x00,
  0x25, 0x01, 0x95, 0x03, 0x75, 0x01,
  0x81, 0x02, 0x95, 0x01, 0x75, 0x05,
  0x81, 0x01, 0x05, 0x01, 0x09, 0x30,
  0x09, 0x31, 0x09, 0x38, 0x15, 0x81, 
  0x25, 0x7F, 0x75, 0x08, 0x95, 0x03,   
  0x81, 0x06, 0xC0, 0x09, 0x3c, 0x05,
  0xff, 0x09, 0x01, 0x15, 0x00, 0x25,
  0x01, 0x75, 0x01, 0x95, 0x02, 0xb1,
  0x22, 0x75, 0x06, 0x95, 0x01, 0xb1,
  0x01,   0xc0 ]
);
NRF.setServices(undefined, { hid :report });

var ROT = createEncoder(D29,D30);
ROT.on("change",(wheel)=>NRF.sendHIDReport([0,0,0,wheel,0,0,0,0],()=>{}));

var SW = createSwitch(D28);
SW.on("change",(sw)=>NRF.sendHIDReport([sw?1:0,0,0,0,0,0,0,0],()=>{}));
  
  
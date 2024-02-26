function drawBlue(){
    g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 100);
}

NRF.removeAllListeners("connect");
NRF.removeAllListeners("disconnect");

NRF.on("connect", function(a){
    KEYBOARD.toBLE = true;
    drawBlue();
    g.flip();
  });
    
NRF.on("disconnect", function(a){
    KEYBOARD.toBLE = false;
    g.clearRect(4,100,20,120);
    g.flip();
});

// Test App

require("FontVGA16").add(Graphics);

function keys(s){
  var ks = "";
  for(var i=0;i<s.length;i++){
    ks = ks + s.charAt(i) + " ";
  }
  return ks;
}

function draw(w,o,x,y){
 w.setFont("VGA16",1)
 .setFontAlign(-1,-1)
 .drawString(keys(ASCII[3].slice(o,o+12)),x,y)
 .drawString(keys(ASCII[2].slice(o,o+12)),x,y+20)
 .drawString(keys(ASCII[0].slice(o,o+12)),x,y+40)
 .flip();
}

g.clear().setFont("Vector",24).setFontAlign(0,-1).drawString("Bluetooth Keyboard",125,10);
draw(g,0,40,50);
h.clear();
draw(h,12,40,35);


if (NRF.getSecurityStatus().connected) NRF.disconnect();

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

E.on("kill",()=>{NRF.disconnect();KEYBOARD.toBLE=false;});
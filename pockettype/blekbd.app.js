function drawBlue(){
    g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 100);
}

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

g.clear().setFont("Vector",24).setFontAlign(0,0).drawString("Bluetooth Keyboard",125,60).flip();

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
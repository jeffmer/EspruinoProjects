// Low power display module - j.n.magee 2023
// for source of native code see file c-code.c
var code = (function(){
    var bin=atob("Len3Tx1MAJN8RE/wAgonaE/wDA5P8AgMT/ABCJBCKtyQ+/r5APABBA5GAZQAm55CH9yW+/71DvsF9DQbAZvE8QsEZAADuQE0fSMD+wWVlPv8+wXrRQXL8QILXUQE8AcEF/gFsAj6BPQr6gQEfFUBNtznATDS5wOwvejwj3QBAAAt6fdPHUwAk3xET/ACCidoT/AMDk/wCAxP8AEIkEIq3JD7+vkA8AEEDkYBlACbnkIf3Jb7/vUO+wX0NBsBm8TxCwRkAAO5ATR9IwP7BZWU+/z7BetFBcvxAgtdRATwBwQX+AWwCPoE9ETqCwR8VQE23OcBMNLnA7C96PCP9AAAADC1DCUQ8AEPkfv19E/wAgOQ+/PzBfsE8KHrAAHB8QsBT/B9AE/qQQEA+wQzCL8BMQPrQwMIIJH78PDA8QIAA0QB8AcBASA6sQhKekQA+gHxEmjQXAFDB+AFSnpEAPoB8RJo0Fwg6gEB0VQwvTIAAAAiAAAAAUt7RBhgcEcGAAAAAAAAAA==");
    return {
      setpx:E.nativeCall(257, "void(int, int, int)", bin),
      fill:E.nativeCall(129, "void(int,int,int,int)", bin),
      clear:E.nativeCall(1, "void(int,int,int,int)", bin),
      setbuf:E.nativeCall(373, "void(int)", bin),
    };
  })();

var LCD_WIDTH = 250;
var LCD_HEIGHT = 122;

screenbuf = new Uint8Array(Math.ceil(LCD_HEIGHT/12)*(LCD_WIDTH/2)*3); // cols*rows*3 - 24 pixel chunks
var addrbuf = E.getAddressOf(screenbuf,true);
if (!addrbuf) throw new Error("Not a Flat String"); 

code.setbuf(addrbuf);

function fillpx(x1,y1,x2,y2,c){
    if (c!=0){
        code.fill(x1,y1,x2,y2);
    } else {
        code.clear(x1,y1,x2,y2);
    }
}

function init(spi, dc, ce, rst, callback) {
    function cmd(c,d) {
        dc.reset();
        spi.write(c, ce);
        if (d!==undefined) {
        dc.set();
        spi.write(d, ce);
        }
    }
    function delay_ms(d) {var t = getTime()+d/1000; while(getTime()<t);}
    if (rst) {
        digitalPulse(rst,0,10);
    } else {
        cmd(0x01); 
    }
    delay_ms(150); // delay 150 ms
    cmd(0xEB,0x02);// Enable NVM
    cmd(0xD7,0x68);// NVM Load Control
    cmd(0xD1,0x01);// Booster enable
    cmd(0xC0,0x80); // Gate Voltage Setting VGH=12V; VGL=-5V
    cmd(0xC1,[0x28,0x28,0x28,0x28,0x14,0x00]);  // Source Voltage Control 1
    cmd(0xC2);      // Source Voltage Control 2
    cmd(0xCB,0x14); // VCOMH Voltage Setting 4V
    cmd(0xB4,[0xE5,0x77,0xF1,0xFF,0xFF,0x4F,0xF1,0xFF,0xFF,0x4F]); // Update Period Gate EQ Control
    cmd(0xB0,0x64); // Duty Setting
    cmd(0xB2,0x01,0x04); // frame rate 32Hz high power 4 Hz low power
    cmd(0x11);  // Out of sleep mode
    delay_ms(100);
    cmd(0xC7,[0xA6,0xE9]); // OSC Enable
    cmd(0x36,0x20); // Memory Data Access Control
    cmd(0x3A,0x11); // Data Format Select
    cmd(0xB8,0x09); // Panel Setting
    cmd(0xD0,0x1F); // Unknown command??
    cmd(0x20);      // Display Inversion Off
    cmd(0x29);      // Display on
    cmd(0xB9,0xE3);  // Clear RAM
    delay_ms(100);
    cmd(0xB9,0x23);  // Source Setting Off
    cmd(0x72,0x00);   // Destress Off??
    cmd(0x39);       // Low Power Mode ON
    delay_ms(100);
    return cmd;
}

exports.connect = function(options) {
    command = init(options.spi, options.dc, options.ce, options.rst);
    var g = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 1, {setPixel:code.setpx,fillRect:fillpx});
    g.flip = function() {
        command(0x2A,[25,35]); 
        command(0x2B,[0,124]);
        command(0x2c,screenbuf);
    };
    g.invert = function(v) {
        command(v ? 0x21 : 0x20);
    };
    return g;
}

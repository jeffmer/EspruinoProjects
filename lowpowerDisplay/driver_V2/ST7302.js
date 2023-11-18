// Low power display module - j.n.magee 2023
// for source of native code see file c-codev3.c

var code = (function(){
    var bin=atob("LenwT4mw2xACk2RLe0SQRhtoBJNiS3tEyhDT+ACQAZJP8AwKQEUA87aAAiOQ+/PzA5MEmwGeA0QGkwDwAQOD8AEDB5MCm55CAPOjgPojc0MGmtFc8wAB8CACBZMB8BAH07IB8EAOIfB/DAAl/7IAk1/6jv5f+oz8BZvsGJT7+vMaRgr7E0QHm8TxCwRD6kQEA5tP8H0LC/sCM0/q5AsD60MDy/ECC5tEBPAHBAcsGfgLMDPRpbnMB0y/Q/CAAwPwfwOKB0y/Q/AgAwPw3wNMB0y/Q/AIAwPw9wMKBxvVF+AXsUPwgAMB4APwfwMAmhKxQ/AgAwHgA/DfA77xAA8C0EPwCAMB4APw9wO88QAPAtBD8AIDNeAD8P0DMuClucwHTL9D8EADA/C/A4oHTL9D8BADA/DvA0wHTL9D8AQDA/D7AwoHG9UX4BexQ/BAAwHgA/C/AwCaErFD8BADAeAD8O8DvvEADwLQQ/AEAwHgA/D7A7zxAA8C0EPwAQMB4APw/gMENQgtCfgLMH/0da8BNljnATBG5wmwvejwj7ABAACiAQAAAUt7RBhgcEcWAAAAAUt7RBhgcEcGAAAAAAAAAAAAAAA=");
    return {
      update:E.nativeCall(1, "void(int,int,int,int)", bin),
      setscrnbuf:E.nativeCall(433, "void(int)", bin),
      setimgbuf:E.nativeCall(421, "void(int)", bin),
    };
  })();

var LCD_WIDTH = 250;
var LCD_HEIGHT = 122;

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
    function getaddr(buf){
        var a = E.getAddressOf(buf,true);
        if (!a) throw new Error("ST7302 -buffer not a Flat String");
        return a;
    }
    command = init(options.spi, options.dc, options.ce, options.rst);
    screenbuf = new Uint8Array(Math.ceil(LCD_HEIGHT/12)*(LCD_WIDTH/2)*3); // cols*rows*3 - 24 pixel chunks
    code.setscrnbuf(getaddr(screenbuf)); 
    g = Graphics.createArrayBuffer(250,128,1,{vertical_byte:true,msb:false});
    code.setimgbuf(getaddr(g.buffer));
    g.flip = function() {
        a = g.getModified(true)
        if (a) {
            code.update(a.x1,a.y1,a.x2,a.y2)
            command(0x2A,[25,35]); 
            command(0x2B,[0,124]);
            command(0x2c,screenbuf);
        }
    };
    g.invert = function(v) {
        command(v ? 0x21 : 0x20);
    };
    return g;
}

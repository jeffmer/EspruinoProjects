

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

    rst.reset();
    delay_ms(100);
    rst.set();
    delay_ms(250); // delay 250 ms
    cmd(0xEB,0x02);// Enable NVM
    cmd(0xD7,0x68);// NVM Load Control
    cmd(0xD1,0x01);// Booster enable
    cmd(0xC0,0x80); // Gate Voltage Setting VGH=12V; VGL=-5V
    cmd(0xC1,[0x28,0x28,0x28,0x28,0x14,0x00]);  // Source Voltage Control 1
    cmd(0xC2);      // Source Voltage Control 2
    cmd(0xCB,0x14); // VCOMH Voltage Setting 4V
    cmd(0xB4,[0xE5,0x77,0xF1,0xFF,0xFF,0x4F,0xF1,0xFF,0xFF,0x4F]); // Update Period Gate EQ Control
    cmd(0xB0,0x64); // Duty Setting
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

SPI1.setup({sck:D2, mosi:D1, baud: 10000000});

var command = init(SPI1,D30,D29,D31);

function invert(v){
    command(v ? 0x21 : 0x20);
}

screenbuf = new Uint8Array(Math.ceil(LCD_HEIGHT/12)*(LCD_WIDTH/2)*3); // cols*rows*3 - 24 pixel chunks
var addrbuf = E.getAddressOf(screenbuf,true);
if (!addrbuf) throw new Error("Not a Flat String"); 
/*
function setPixel(x,y,c){
    var row = Math.floor(x/2);
    var col = Math.floor(y/12);
    bit = x%2==0 ? (1+((11 - y%12)<<1)) : (11 - y%12)<<1;
    var index = 3*(col*LCD_WIDTH/2 + row)+(2-Math.floor(bit/8));
    if (c!=0){
        screenbuf[index] |= 1<<(bit%8); 
    } else {
        screenbuf[index] &= ~(1<<(bit%8));
    }
}
*/

var code = E.compiledC(`
//void setpx(int, int, int)
//void fill(int,int,int,int)
//void clear(int,int,int,int)
//void setbuf(int)

static unsigned char *BUFFER;

void setbuf(unsigned char *buf){
  BUFFER = buf;
}

void setpx(int x, int y, int c) {
    int row = x/2;
    int col = y/12;
    int bit = x%2==0 ? (1+((11 - y%12)<<1)) : (11 - y%12)<<1;
    int index = 3*(col*125 + row)+(2-(bit/8));
    if (c!=0){
        BUFFER[index] |= 1<<(bit%8); 
    } else {
        BUFFER[index] &= ~(1<<(bit%8));
    }
}

void fill(int x1, int y1, int x2, int y2) {
    for (int x=x1; x<=x2; ++x) {
        for (int y=y1; y<=y2; ++y) {
                int row = x/2;
                int col = y/12;
                int bit = x%2==0 ? (1+((11 - y%12)<<1)) : (11 - y%12)<<1;
                int index = 3*(col*125 + row)+(2-(bit/8));
                BUFFER[index] |= 1<<(bit%8); 
        }
    }
}

void clear(int x1, int y1, int x2, int y2) {
    for (int x=x1; x<=x2; ++x) {
        for (int y=y1; y<=y2; ++y) {
                int row = x/2;
                int col = y/12;
                int bit = x%2==0 ? (1+((11 - y%12)<<1)) : (11 - y%12)<<1;
                int index = 3*(col*125 + row)+(2-(bit/8));
                BUFFER[index] &= ~(1<<(bit%8)); 
        }
    }
}

`);

code.setbuf(addrbuf);

function fillpx(x1,y1,x2,y2,c){
    if (c!=0){
        code.fill(x1,y1,x2,y2);
    } else {
        code.clear(x1,y1,x2,y2);
    }
}

function flush(){
    command(0x2A,[25,35]); 
    command(0x2B,[0,124]);
    command(0x2c,screenbuf);
}

g = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 1, {setPixel:code.setpx,fillRect:fillpx});


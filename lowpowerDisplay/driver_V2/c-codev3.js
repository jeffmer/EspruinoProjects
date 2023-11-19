var code = E.compiledC(`
//void update(int,int,int,int)
//void setscrnbuf(int)
//void setimgbuf(int)

static unsigned char *SCREEN;
static unsigned char *IMAGE;

void setscrnbuf(unsigned char *buf){
    SCREEN = buf;
}

void setimgbuf(unsigned char *buf){
    IMAGE = buf;
}

void update(int x1, int y1, int x2, int y2) {
    y1 = y1>>3;
    y2 = y2>>3;
    for (int x=x1; x<=x2; ++x) {
        int row = x/2;
        for (int by=y1; by<=y2; by++) {          //for every image byte
            unsigned char c = IMAGE[(by*250)+x];
            // low nibble
            int y = by<<3;
            int col = y/12;
            int bit = (~x)&1 | (11 - y%12)<<1;
            int index = 3*(col*125 + row)+(2-(bit>>3));
            unsigned char s = SCREEN[index];
            if ((bit&7)==7) {
                s = (c & 1)>0 ? s | 0x80 : s &= 0x7F;
                s = (c & 2)>0 ? s | 0x20 : s &= 0xDF;
                s = (c & 4)>0 ? s | 0x08 : s &= 0xF7;
                s = (c & 8)>0 ? s | 0x02 : s &= 0xFD;
            } else {
                s = (c & 1)>0 ? s | 0x40 : s &= 0xBF;
                s = (c & 2)>0 ? s | 0x10 : s &= 0xEF;
                s = (c & 4)>0 ? s | 0x04 : s &= 0xFB;
                s = (c & 8)>0 ? s | 0x01 : s &= 0xFE;
            }
            SCREEN[index]=s;
            // high nibble
            y += 4;
            col = y/12;
            bit = (~x)&1 | (11 - y%12)<<1;
            index = 3*(col*125 + row)+(2-(bit>>3));
            s = SCREEN[index];
            if ((bit&7)==7) {
                s = (c & 16)>0 ? s | 0x80 : s &= 0x7F;
                s = (c & 32)>0 ? s | 0x20 : s &= 0xDF;
                s = (c & 64)>0 ? s | 0x08 : s &= 0xF7;
                s = (c & 128)>0 ? s | 0x02 : s &= 0xFD;
            } else {
                s = (c & 16)>0 ? s | 0x40 : s &= 0xBF;
                s = (c & 32)>0 ? s | 0x10 : s &= 0xEF;
                s = (c & 64)>0 ? s | 0x04 : s &= 0xFB;
                s = (c & 128)>0 ? s | 0x01 : s &= 0xFE;
            }
            SCREEN[index]=s;          
        }
    }
}


`);
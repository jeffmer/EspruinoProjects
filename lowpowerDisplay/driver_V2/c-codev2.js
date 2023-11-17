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
        for (int by=y1; by<=y2; by++) {
            unsigned char c = IMAGE[(by*250)+x];
            for (int i = 0; i<8; i+=4 ) { //for each nibble
                int y = i+(by<<3);
                int col = y/12;
                int bit = (~x)&1 | (11 - y%12)<<1;
                int index = 3*(col*125 + row)+(2-(bit>>3));
                unsigned char s = SCREEN[index];
                bit &= 7; // equiv %8
                for (int j=i;j<i+4;j++){
                    if ((c & (1<<j))>0)
                        s |= 1<<bit;
                    else
                        s &= ~(1<<bit);
                    bit-=2;
                }
                SCREEN[index]=s;
            } 
        }
    }
}

`);
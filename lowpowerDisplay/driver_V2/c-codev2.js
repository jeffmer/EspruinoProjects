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
    int by1 = y1>>3, by2 = y2>>3;
    for (int x=x1; x<=x2; ++x) {
        int row = x/2;
        for (int by=by1; by<=by2; ++by) {
            unsigned char ib = IMAGE[(by*250)+x];
            for (int i = 0; i<8; i++ ) {
                int y = i+(by<<3);
                int col = y/12;
                int bit = (~x)&1 | (11 - y%12)<<1;
                int index = 3*(col*125 + row)+(2-(bit>>3));
                unsigned char c = ib & (1<<i);
                if (c>0)
                    SCREEN[index] |= 1<<(bit%8);
                else
                    SCREEN[index] &= ~(1<<(bit%8));
            } 
        }
    }
}

`);
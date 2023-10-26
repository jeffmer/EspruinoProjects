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
    for (int x=x1; x<=x2; ++x) {
        for (int y=y1; y<=y2; ++y) {
            int row = x/2;
            int col = y/12;
            int bit = (~x)&1 | (11 - y%12)<<1;
            int index = 3*(col*125 + row)+(2-(bit/8));
            unsigned char c = IMAGE[(y//8)*250+x] & (1<<y%8)
            if (c>0)
                SCREEN[index] |= 1<<(bit%8);
            else
                SCREEN[index] &= ~(1<<(bit%8)); 
        }
    }
}

`);
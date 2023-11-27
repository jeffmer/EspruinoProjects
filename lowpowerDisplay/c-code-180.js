var code = E.compiledC(`
//int  update(int,int,int,int)
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

int update(int x1, int y1, int x2, int y2) {
    for (int x=x1; x<=x2; x++) {
        int rx = 249-x;
        int row = rx/2;
        for (int y=y1; y<y2; y++) {
            int ry = 121-y;
            int col = ry/12;
            int bit = (~(249-rx))&1 | (11 - ry%12)<<1;
            int index = 3*(col*125 + row)+(2-(bit/8));
            unsigned char c = IMAGE[(y/8)*250+x] & (1<<y%8);
            if (c>0)
                SCREEN[index] |= 1<<(bit%8);
            else
                SCREEN[index] &= ~(1<<(bit%8)); 
        }
    }
}

`);
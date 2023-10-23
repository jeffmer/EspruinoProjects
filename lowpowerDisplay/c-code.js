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
/*
var board = E.compiledC(`
// void init(int,int)
// int alive(int,int)
// int getcell(int,int)
// void setcell(int,int)
// int readcell(int,int)
// void clearcell(int,int)
// void nextgen(void)

__attribute__((section(".text"))) unsigned int genA[32];
__attribute__((section(".text"))) unsigned int genB[32];
__attribute__((section(".text"))) unsigned int *cur;
__attribute__((section(".text"))) unsigned int *fut;
__attribute__((section(".text")))  int Xmax;
__attribute__((section(".text")))  int Ymax;

void init(int XN, int YN){
   Xmax = XN-1;
   Ymax = YN-1;
   cur = &genA[0];
   fut = &genB[0];
}

int getcell(int x, int y) {
  if (x<0 || x>Xmax || y<0 || y>Ymax) return 0;
  unsigned int cell = cur[y];
  return  (cell & 1<<x) ? 1 : 0;
}

int readcell(int x, int y) {
  unsigned int cell = fut[y];
  return  (cell & 1<<x) ? 1 : 0;
}

void setcell(int x, int y) {
  fut[y] = fut[y] | 1<<x;
}

void clearcell(int x, int y) {
  fut[y] = fut[y] & ~(1<<x);
}

int alive(int x ,int y) {
    int nc = getcell(x-1,y-1) + getcell(x,y-1) + getcell(x+1,y-1)
            + getcell(x-1,y) + getcell(x+1,y)
            + getcell(x-1,y+1) + getcell(x,y+1) + getcell(x+1,y+1);
    return (getcell(x,y) && nc==2 || nc==3)?1:0;
}

void nextgen() {
  unsigned int *tmp = cur;
  cur = fut; fut = tmp;
  for (int y=0; y<=Ymax; y++)
  for (int x=0; x<=Xmax; x++)
    if (alive(x,y)) setcell(x,y); else clearcell(x,y);
}

`);
*/
var board = (function(){
  var bin=atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGS3tEGmgBIwP6APBS+CEwI+oAA0L4ITBwRwC/6v7//wVLe0QaaAEjA/oA8FL4ITAYQ0L4IQBwR8r+//8GS3tEGmgBIwP6APBS+CEwGEIUvwEgACBwRwC/rv7//wAoFNsLS3tEWmiQQg/cACkN25pokUIK3NpoASMD+gDwUvghMBhCFL8BIAAgcEcAIHBHAL+K/v//Len4QwHx/zgA8f85BUYORkhGQUb/99j/QUYERihG//fT/28cQUYERDhG//fN/zFGBERIRv/3yP8xRgREOEb/98P/BvEBCAREQUZIRv/3vP9BRgREKEb/97f/QUYERDhG//ey/zFGBEQoRv/3rf8IsQIsBNDjHlhCWEG96PiDASC96PiD+LURSxFPe0QAJdpoGWjZYBpgHEZ/RKNonUIU3AAme2ieQg7cKUYwRv/3qP8pRhixMEb/92n/AuAwRv/3Vf8BNu3nATXn5/i9zv3//8D9//8GS3tEA/EQAgE4ATnaYAPxkAJYYJlgGmBwRwC/gv3//w==");
  return {
    init:E.nativeCall(633, "void(int,int)", bin),
    alive:E.nativeCall(421, "int(int,int)", bin),
    getcell:E.nativeCall(365, "int(int,int)", bin),
    setcell:E.nativeCall(305, "void(int,int)", bin),
    readcell:E.nativeCall(333, "int(int,int)", bin),
    clearcell:E.nativeCall(273, "void(int,int)", bin),
    nextgen:E.nativeCall(553, "void(void)", bin),
  };
})();

var XN = Math.floor((g.getWidth()-10)/8);
var YN = Math.floor((g.getHeight()-2)/8);

var buf = Graphics.createArrayBuffer(XN*8,YN*8,1,{msb:true});

function flip(c) {
 h.setColor(c);
 h.drawImage({width:XN*8,height:YN*8,bpp:1,buffer:buf.buffer},(g.getWidth()-XN*8)/2,5);
 buf.clear();
 h.flip();
}

function initBoard(){
    "ram";
    board.init(XN,YN);
    var Xm = XN-1;
    var Ym = YN-1;
    for (let y = 0; y<Ym; ++y)
    for (let x = 0; x<Xm; ++x) {
        var r = Math.random()<0.5?1:0;
        if (r==1){
          board.setcell(x,y);
        } else {
          board.clearcell(x,y);
        }
    } 
    flip(h.theme.fg2);
}

function drawBoard(){
  "ram";
  var Xm = XN-1;
  var Ym = YN-1;
  for (let y = 0; y<Ym; ++y)
  for (let x = 0; x<Xm; ++x) {
      if (board.readcell(x,y)){
          var Xr=8*x;
          var Yr=8*y;
          buf.fillRect(Xr,Yr, Xr+6,Yr+6);
      } 
  } 
  flip(h.theme.fg2);
}

function next(){
  board.nextgen();
  drawBoard();
}

var intervalRef = null;
var generation=0;

function stopdraw() {
    if(intervalRef) {clearInterval(intervalRef);}
  }
  
function startdraw() {
    intervalRef = setInterval(next,1000);
}

function restart(){
  stopdraw();
  g.clear();
  generation=0;
  initBoard();
  drawBoard();
  startdraw();
}

g.setFont("Vector",24)
 .setFontAlign(0,0)
 .drawString("Game of Life",125,61)
 .flip();

restart();


 
  
    
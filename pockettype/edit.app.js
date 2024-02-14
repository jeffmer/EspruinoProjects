var lines = STOR.read("test.txt").split("\n");

function drawWindow(from,c,r){
    g.clear();
    g.setFont("6x8").setFontAlign(-1,-1);
    var n = lines.length > 15 ? 15 : lines.length;
    for (var i=0; i<n; i++){
        var x = c*6;
        var y = r*8;
        g.drawString(lines[from+i].slice(0,39),2,i*8);
        g.drawRect(x,y,x+6,y+8);
    }
    g.flip(); 
}

var start = 0;
var row = 0;
var col = 0;

function move(v){
    function inc(i,n){++i; return i>n ? n : i; }
    function dec(i,n){--i; return i<n ? n : i; }
    switch(v){
      case KEYBOARD.NONE: break;
      case KEYBOARD.ENTER: break;
      case KEYBOARD.UP: row = dec(row,start); break
      case KEYBOARD.DOWN: row = inc(row,start+15); break;
      case KEYBOARD.LEFT: col = dec(col,0); break
      case KEYBOARD.RIGHT:col = inc(col,39); break
    }
    drawWindow(start,col,row);
}

P2.setUI("arrows",(v)=>{
    move(v);
});

drawWindow(start);



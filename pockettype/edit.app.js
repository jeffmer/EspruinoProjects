eval(STOR.read("menu.js"));
if (!E.showPrompt) eval(STOR.read("prompt.js"));

var EDITOR = {
    dirty:true,
    toprow:0,
    leftcol:0,
    maxrow:15,
    maxcol:40,
    row:0,
    col:0,
    total:0,
    lines:undefined,
    filename:undefined,

    open:function(fn){
        this.filename = fn;
        this.lines = STOR.read(fn).split("\n");
        if (this.lines) this.total = this.lines.length;
    },


    adjrow:function(v){
        var r = this.row+v;
        this.row = r<0 ? 0 : r>=this.total ? this.total-1 : r;
        if(this.row<this.toprow) 
            {this.toprow = this.row; this.dirty=true;}
        else if (this.row >= this.toprow+this.maxrow)
            {this.toprow = this.row-this.maxrow+1; this.dirty=true;}
        this.adjcol(0);
    },

    adjcol:function(v){
        var c = this.col+v;
        var max = this.lines[this.row].length;
        if (max == 0 ) this.col = 0;
        else this.col = c<0 ? 0 : c>=max ? max-1 : c;
        if(this.col<this.leftcol) 
            {this.leftcol = this.col; this.dirty=true;}
        else if (this.col >= this.leftcol+this.maxcol)
            {this.leftcol = this.col-this.maxcol+1; this.dirty=true;}
    },

    draw:function(){
        g.clear();
        g.setColor(1).setFont("6x8").setFontAlign(-1,-1);
        var n = this.total > this.maxrow ? this.maxrow : this.total;
        var bs = this.leftcol;
        var es = this.leftcol+this.maxcol;
        var cursrow = this.row-this.toprow;
        var curscol = this.col-this.leftcol;
        var curschar = this.lines[this.row].charAt(this.col);
        for (var i =0; i<n; i++) {
            var ll = this.lines[this.toprow+i];
            g.drawString(ll.slice(bs,es),2,i*8);
            if (es<ll.length) g.fillRect(244,i*8+2,249,i*8+6);
            if (i==cursrow){
                var x = curscol*6;
                var y = cursrow*8;
                g.fillRect(x,y,x+6,y+8).setColor(0).drawString(curschar,x,y);
                g.setColor(1);
            }
        }   
        g.flip(); 
        this.dirty = false;
    }
}


function move(v){
    switch(v){
      case KEYBOARD.NONE: break;
      case KEYBOARD.ENTER: break;
      case KEYBOARD.UP:   EDITOR.adjrow(-1); break
      case KEYBOARD.DOWN: EDITOR.adjrow(1);; break;
      case KEYBOARD.LEFT: EDITOR.adjcol(-1);; break
      case KEYBOARD.RIGHT:EDITOR.adjcol(1);; break
    }
    EDITOR.draw();
}

function startEdit(fn){
    P2.setUI("arrows",(v)=>{
        move(v);
    });
    EDITOR.open(fn);
    EDITOR.draw();
}

function edit_file(fn) {
    E.showPrompt("Edit\n"+fn+"?", {buttons: {"No":false,"Yes":true}}).then(function(v) {
      if (v) startEdit(fn);
      else E.showMenu(filesmenu);
    });
  }

function init(){
    var files = STOR.list(/\.js$/);
    files.sort((a,b)=>{
    if (a<b) return -1;
    if (a>b) return 1;
    return 0;
    });
    function edit_file(fn) {
        E.showPrompt("Edit\n"+fn+"?", {buttons: {"No":false,"Yes":true}}).then(function(v) {
          if (v) startEdit(fn);
          else E.showMenu(filesmenu);
        });
    }
    const filesmenu = {
        '': { 'title': 'Open File' }
        };
        if (files.length > 0) {
        files.reduce((menu, file) => {
            menu[file] = () => {edit_file(file)};
            return menu;
        }, filesmenu);  
        filesmenu['Exit>'] = ()=>load("launch.js");  
    }
    E.showMenu(filesmenu);
}

init();


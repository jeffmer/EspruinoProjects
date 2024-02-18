eval(STOR.read("menu.js"));
if (!E.showPrompt) eval(STOR.read("prompt.js"));

var EDITOR = {
    toprow:0,
    leftcol:0,
    maxrow:15,
    maxcol:40,
    row:0,
    col:-1,
    total:0,
    lines:undefined,
    filename:undefined,

    open:function(fn){
        this.filename = fn;
        this.lines = STOR.read(fn).split("\n");
        if (this.lines) this.total = this.lines.length;
    },

    create:function(fn){
        this.filename = fn;
        this.lines = [""];
        this.total = this.lines.length;
    },

    adjrow:function(v){
        var r = this.row+v;
        this.row = r<0 ? 0 : r>=this.total ? this.total-1 : r;
        if(this.row<this.toprow) 
            {this.toprow = this.row;}
        else if (this.row >= this.toprow+this.maxrow)
            {this.toprow = this.row-this.maxrow+1;}
        this.adjcol(0);
    },
    // this.col = 0 is beginning of line
    adjcol:function(v){
        var c = this.col+v;
        var max = this.lines[this.row].length;
        if (max == 0 ) this.col = 0;
        else this.col = c<0 ? 0: c>max ? max: c;
        if(this.col<this.leftcol) 
            {this.leftcol = this.col<0 ? 0 :this.col;}
        else if (this.col >= this.leftcol+this.maxcol)
            {this.leftcol = this.col-this.maxcol+1;}
    },

    insertLine:function(){
        var line = this.lines[this.row];
        this.lines[this.row] = line.slice(0,this.col);
        this.lines.splice(this.row+1,0,line.slice(this.col));
        this.total = this.lines.length;
        this.col = 0;
        this.adjrow(1);
    },

    delChar:function(){
        var line = this.lines[this.row];
        if (line.length) {
           if (this.col>0){
            this.lines[this.row] = line.slice(0,this.col-1) + line.slice(this.col);
            this.adjcol(-1)  
           } else if (this.row>0) {
                this.col = this.lines[this.row-1].length;
                this.lines[this.row-1]=this.lines[this.row-1] + line;
                this.lines.splice(this.row,1);
                this.total = this.lines.length;
                this.adjrow(-1);
           }          
        } else if (this.row>0){
            this.col = this.lines[this.row-1].length;
            this.lines.splice(this.row,1);
            this.total = this.lines.length;
            this.adjrow(-1);
        }    
    },

    addChar:function(c){
        if (c=="\0") return;
        var line = this.lines[this.row];
        this.lines[this.row] = line.slice(0,this.col) + c + line.slice(this.col);
        this.adjcol(1); 
    },

    draw:function(){
        g.clear();
        g.setColor(1).setFont("6x8").setFontAlign(-1,-1);
        var n = this.total > this.maxrow ? this.maxrow : this.total;
        var bs = this.leftcol;
        var es = this.leftcol+this.maxcol;
        var cursrow = this.row-this.toprow;
        var curscol = this.col-this.leftcol;
        var curschar = this.col<this.lines[this.row].length? this.lines[this.row].charAt(this.col):" ";
        for (var i =0; i<n; i++) {
            var ll = this.lines[this.toprow+i];
            g.drawString(ll.slice(bs,es),2,i*8);
            if (es<ll.length) g.fillRect(248,i*8+2,249,i*8+6);
            if (i==cursrow){
                var x = (curscol)*6;
                var y = cursrow*8;
                g.fillRect(x,y,x+6,y+8).setColor(0).drawString(curschar,x,y);
                g.setColor(1);
            }
        }   
        g.flip(); 
        this.dirty = false;
    }
}

function exec(){
    eval(EDITOR.lines.join("\n"));
}

function save(){
    STOR.write(EDITOR.filename,EDITOR.lines.join("\n"));
}

function command() {
    E.showPrompt("Command", {buttons: {"Exit":0,"Save":1,"Run":2,"Cancel":3}}).then(function(v) {
        if (v==0) load("launch.js");
        else if (v==1) save();
        else if (v==2) exec();
        P2.setUI("arrows",(v)=>{
            move(v);
        });
        EDITOR.draw();
    });
}

function move(v){
    switch(v.act){
      case KEYBOARD.NONE: EDITOR.addChar(v.char);break;
      case KEYBOARD.BACKSPACE: EDITOR.delChar();break;
      case KEYBOARD.ENTER: EDITOR.insertLine();break;
      case KEYBOARD.UP:   EDITOR.adjrow(-1); break;
      case KEYBOARD.DOWN: EDITOR.adjrow(1); break;
      case KEYBOARD.LEFT: EDITOR.adjcol(-1);break;
      case KEYBOARD.RIGHT:EDITOR.adjcol(1); break;
      case KEYBOARD.ESC:command();return;
    }
    EDITOR.draw();
}

function startEdit(fn,nf){
    P2.setUI("arrows",(v)=>{
        move(v);
    });
    if (nf) EDITOR.create(fn);
    else EDITOR.open(fn);
    EDITOR.draw();
}

function init(){
    var files = STOR.list(/\.js$/);
    files.sort((a,b)=>{
    if (a<b) return -1;
    if (a>b) return 1;
    return 0;
    });
    const filesmenu = {
        '': { 'title': 'Open File' }
        };
        filesmenu["New File>"] = ()=>startEdit("test.app.js",true);
        if (files.length > 0) {
        files.reduce((menu, file) => {
            menu[file] = () => {startEdit(file,false)};
            return menu;
        }, filesmenu);  
        filesmenu['Exit>'] = ()=>load("launch.js");  
    }
    E.showMenu(filesmenu);
}

init();


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
    // this.col = -1 is beginning of line
    adjcol:function(v){
        var c = this.col+v;
        var max = this.lines[this.row].length;
        if (max == 0 ) this.col = -1;
        else this.col = c<-1 ? -1 : c>=max ? max-1 : c;
        if(this.col<this.leftcol) 
            {this.leftcol = this.col<0 ? 0 :this.col;}
        else if (this.col >= this.leftcol+this.maxcol)
            {this.leftcol = this.col-this.maxcol+1;}
    },

    insertLine:function(){
        var line = this.lines[this.row];
        this.lines[this.row] = line.slice(0,this.col+1);
        this.lines.splice(this.row+1,0,line.slice(this.col+1,));
        this.total = this.lines.length;
        this.adjrow(1);
    },

    delChar:function(){
        var line = this.lines[this.row];
        if (line.length) {
           if (this.col>=0){
            this.lines[this.row] = line.slice(0,this.col) + line.slice(this.col+1);
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
        this.lines[this.row] = line.slice(0,this.col+1) + c + line.slice(this.col+1);
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
        var curschar = this.col>=0 ? this.lines[this.row].charAt(this.col):" ";
        for (var i =0; i<n; i++) {
            var ll = this.lines[this.toprow+i];
            g.drawString(ll.slice(bs,es),6,i*8);
            if (es<ll.length) g.fillRect(246,i*8+2,249,i*8+6);
            if (i==cursrow){
                var x = (curscol+1)*6;
                var y = cursrow*8;
                g.fillRect(x,y,x+6,y+8).setColor(0).drawString(curschar,x,y);
                g.setColor(1);
            }
        }   
        g.flip(); 
        this.dirty = false;
    }
}

function exit_editor() {
    E.showPrompt("Exit Editor", {buttons: {"Save&Exit":0,"Exit":1,"Cancel":2}}).then(function(v) {
      if (v==0) load("launch.js");
      else if (v==1) {console.log("save file and exit"); load("launch.js");}
      else {
        P2.setUI("arrows",(v)=>{
            move(v);
        });
        EDITOR.draw();
      }
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
      case KEYBOARD.ESC:exit_editor();return;
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
    function edit_file(fn) {
        E.showPrompt("Edit\n"+fn+"?", {buttons: {"No":false,"Yes":true}}).then(function(v) {
          if (v) startEdit(fn,false);
          else E.showMenu(filesmenu);
        });
    }
    const filesmenu = {
        '': { 'title': 'Open File' }
        };
        filesmenu["New File>"] = ()=>startEdit("test.app.js",true);
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


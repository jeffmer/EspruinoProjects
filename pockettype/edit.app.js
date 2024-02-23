eval(STOR.read("menu.js"));
if (!E.showPrompt) eval(STOR.read("prompt.js"));

var EDITOR = {
    toprow:0,
    leftcol:0,
    maxrow:15,
    maxcol:40,
    row:0,
    col:0,
    total:0,
    lines:undefined,
    filename:undefined,
    chunk:{br:0,bc:0,er:0,ec:0},
    selecting:false,
    highlighting:false,
    
    select(ctrl){
        if (ctrl && !this.selecting){
            this.selecting = true;
            this.highlighting = true;
            this.chunk = {br:this.row,bc:this.col,er:this.row,ec:this.col};
        } else if (this.selecting && !ctrl) this.selecting = false;
    },
    
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
        if (this.selecting) this.chunk.er = this.row;
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
        if (this.selecting) this.chunk.ec = this.col;
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
        function draw_cursor(o,c,r,lls){
            var y = (r-o.toprow)*8;
            var x = (c-o.leftcol)*6;
            var curschar = c<lls[r].length? lls[r].charAt(c):" ";
            g.fillRect(x,y,x+6,y+8).setColor(0).drawString(curschar,x,y);
            g.setColor(1);
        }
        function draw_highline(o,bc,ec,r,lls){
            if (r<o.toprow) return;
            else if (r>=o.toprow+o.maxrow) return;
            else if (ec<o.leftcol) return;
            else if (bc>=o.leftcol+this.maxcol) return;
            bc = bc<o.leftcol ? o.leftcol : bc;
            ec = ec>=o.leftcol+this.maxcol ?o.leftcol+this.maxcol:ec;
            var y = (r-o.toprow)*8;
            var x0 = (bc-o.leftcol)*6;
            var x1 = (ec-o.leftcol)*6;
            g.fillRect(x0,y,x1,y+8).setColor(0).drawString(lls[r].slice(bc,ec),x0,y);
            g.setColor(1);        
        }
        function draw_highlight(o,p,lls){
            for (var r = p.br; r<=p.er; r++){
                draw_highline(o,r==p.br?p.bc:0,r==p.er?p.ec:lls[r].length,r,lls);
            }
        }
        g.clear();
        g.setColor(1).setFont("6x8").setFontAlign(-1,-1);
        var n = this.total > this.maxrow ? this.maxrow : this.total;
        var bs = this.leftcol;
        var es = this.leftcol+this.maxcol;
        for (var i =0; i<n; i++) {
            var ll = this.lines[this.toprow+i]; 
            if (typeof ll === "undefined") break;
            g.drawString(ll.slice(bs,es),2,i*8);
            if (es<ll.length) g.fillRect(248,i*8+2,249,i*8+6); 
        } 
        draw_cursor(this,this.col,this.row,this.lines);
        if (this.highlighting) draw_highlight(this,this.chunk,this.lines);
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
    var shift = v.mod & kb.MODIFY.SHIFT;
    EDITOR.select(v.mod & kb.MODIFY.CTRL);
    switch(v.act){
      case KEYBOARD.NONE: EDITOR.addChar(v.char);break;
      case KEYBOARD.BACKSPACE: EDITOR.delChar();break;
      case KEYBOARD.ENTER: EDITOR.insertLine();break;
      case KEYBOARD.UP:  EDITOR.adjrow(shift?-15:-1); break;
      case KEYBOARD.DOWN: EDITOR.adjrow(shift?15:1); break;
      case KEYBOARD.LEFT: EDITOR.adjcol(shift?-40:-1);break;
      case KEYBOARD.RIGHT:EDITOR.adjcol(shift?40:1); break;
      case KEYBOARD.ESC:command();return;
    }
    EDITOR.draw();
h}

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




var apps = STOR.list(/\.app.js$/).map(app=>{return app.split('.')[0];});

apps.sort((a,b)=>{
  if (a<b) return -1;
  if (a>b) return 1;
  return 0;
});
                                      
const icons = {};

if (apps.length > 0) {
  apps.reduce((arr, app) => {
    arr[app] = STOR.read(app+".icon");
    return arr;
  }, icons);     
}

var Napps = apps.length;
var Npages = Math.ceil(Napps/4);
var maxPage = Npages-1;
var selected = -1;
var page = 0;
const XOFF = 5;
const YOFF = 45;
const CELL = 60;

function draw_icon(p,n,selected) {
    var x = (n%4)*CELL+XOFF; 
    var y = YOFF;
    g.setColor(1);
    var name = apps[p*4+n]
    try{g.drawImage(icons[name],x+6,y);} catch(e){}
    g.setFontAlign(0,-1,0).setFont("6x8",1);
    g.drawString(name,x+CELL/2,y+50);
    if (selected) g.drawRect(x,y,x+CELL-1,y+CELL-1);
}

var SELECTED = -1;

function drawAll(){
  g.clear();
  g.setFontAlign(0,-1).setFont("Vector",18).drawString("Pocket Espruino",125,10);
  for (var i=0;i<Napps;++i)
    draw_icon(0,i,SELECTED==i);
  g.flip();
}

P2.setUI("updown",(v)=>{
  if (v) {
    if (SELECTED<0) SELECTED=0;
    else SELECTED = v>0?(SELECTED+1)%4 : (SELECTED-1)<0 ? 3 : SELECTED-1;
    drawAll();
  }
  else if (SELECTED>=0) load(apps[SELECTED]+".app.js");
});


drawAll();


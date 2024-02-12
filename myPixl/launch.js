
if (!P2.setUI) eval(STOR.read("setui.js"));

var apps = STOR.list(/\.app.js$/).map(app=>{return app.split('.')[0];});

apps.sort((a,b)=>{
  if (a<b) return -1;
  if (a>b) return 1;
  return 0;
});
                                      
const icons = {};

if (apps.length > 0) {
  apps.reduce((arr, app) => {
    var icon = STOR.read(app+".icon");
    arr[app] = icon?icon:STOR.read("anapp.icon");
    return arr;
  }, icons);     
}

var Napps = apps.length;
var SELECTED = 0;
var Wstart = 0;
const XOFF = 5;
const YOFF = 45;
const CELL = 60;

function draw_icon(p,n,selected) {
    var x = p*CELL+XOFF; 
    var y = YOFF;
    g.setColor(1);
    var name = apps[n]
    try{g.drawImage(icons[name],x+6,y);} catch(e){}
    g.setFontAlign(0,-1,0).setFont("6x8",1);
    g.drawString(name,x+CELL/2,y+50);
    if (selected) g.drawRect(x,y,x+CELL-1,y+CELL-1);
}


function drawAll(){
  g.clear();
  g.setFontAlign(0,-1).setFont("Vector",18).drawString("Pocket Espruino",125,10);
  if (SELECTED>Wstart+3) Wstart+=(SELECTED-Wstart-3);
  else if (SELECTED<Wstart) Wstart-=(Wstart-SELECTED);
  for (var i=0;i<4;++i)
    draw_icon(i,i+Wstart,SELECTED==(i+Wstart));
  g.flip();
}

P2.setUI("leftright",(v)=>{
  if (SELECTED<0) SELECTED=0;
  if (v) {
    SELECTED+=v;
    SELECTED = SELECTED<0?0:SELECTED>=Napps?Napps-1:SELECTED;
    drawAll();
  }
  else if (SELECTED>=0) load(apps[SELECTED]+".app.js");
});


drawAll();


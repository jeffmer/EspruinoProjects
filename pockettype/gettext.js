E.getText = function(msg,title) {
  var g = h;
  var name = "";
  function draw() {
    g.reset().setFont("8x16",1).setFontAlign(0,-1);
    var Y = P2.appRect.y;
    var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
    var titleLines = g.wrapString(title, W-2);
    var msgLines = g.wrapString(msg||"", W-2);
    var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2 - 24;
    if (titleLines)
      g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
        clearRect(0,Y,W-1,Y+titleLines.length*FH).
        drawString(titleLines.join("\n"),W/2,Y+2);
    g.setColor(g.theme.fg).setBgColor(g.theme.bg).
      drawString(msgLines.join("\n"),W/2,y);
    y += msgLines.length*FH;
    g.clearRect(50,y,200,y+FH+4);
    g.drawRect(50,y,200,y+FH+4);
    g.drawString(name,125,y+2);
    g.flip();
  }
  g.reset().clear().flip(); // clear screen
  if (!msg) {
    P2.setUI(); // remove watches
    return Promise.resolve();
  }
  draw();

  return new Promise(resolve=>{
    P2.setUI("arrows", key=>{
      var ctrl = key.mod & kb.MODIFY.CTRL;  
      if (key.act == KEYBOARD.ENTER) {
          E.getText(); // remove
          resolve(name);
      } else if (key.act == KEYBOARD.NONE) {
         if (!ctrl) name = name + key.char;
         draw();
      } else if (key.act == KEYBOARD.BACKSPACE) {
         name = name.slice(0,-1);
         draw();
      }
    });
  });
};

/*
E.getText("Enter File Name:","New File").then((s)=>console.log("file name:",s));
*/

if (!P2.setUI) eval(STOR.read("setui.js"));

E.showPrompt = function(msg,options) {
    if (!options) options={};
    if (!options.buttons)
      options.buttons = {"Yes":true,"No":false};
    var btns = Object.keys(options.buttons);
    if (!options.selected)
      options.selected = 0;
    function draw() {
      g.reset().setFont("6x15",1).setFontAlign(0,-1);
      var Y = P2.appRect.y;
      var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
      var titleLines = g.wrapString(options.title, W-2);
      var msgLines = g.wrapString(msg||"", W-2);
      var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2 - 24;
      if (options.img) {
        var im = g.imageMetrics(options.img);
        g.drawImage(options.img,(W-im.width)/2,y - im.height/2);
        y += 4+im.height/2;
      }
      if (titleLines)
        g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
          clearRect(0,Y,W-1,Y+titleLines.length*FH).
          drawString(titleLines.join("\n"),W/2,Y+2);
      g.setColor(g.theme.fg).setBgColor(g.theme.bg).
        drawString(msgLines.join("\n"),W/2,y);
      y += msgLines.length*FH+32;
  
      var buttonWidths = 0;
      var buttonPadding = 16;
      g.setFontAlign(0,0);
      btns.forEach(btn=>buttonWidths += buttonPadding+g.stringWidth(btn));
      if (buttonWidths>W) { // if they don't fit, use smaller font
        g.setFont("6x8");
        buttonWidths = 0;
        btns.forEach(btn=>buttonWidths += buttonPadding+g.stringWidth(btn));
      }
      var x = (W-buttonWidths)/2;
      btns.forEach((btn,idx)=>{
        var w = g.stringWidth(btn);
        x += (buttonPadding+w)/2;
        var bw = 2+w/2;
        var poly = [x-bw,y-12,
                    x+bw,y-12,
                    x+bw+4,y-8,
                    x+bw+4,y+8,
                    x+bw,y+12,
                    x-bw,y+12,
                    x-bw-4,y+8,
                    x-bw-4,y-8,
                    x-bw,y-12];
        g.setColor(idx==options.selected ? g.theme.bgH : g.theme.bg).fillPoly(poly).setColor(idx==options.selected ? g.theme.fgH : g.theme.fg).drawPoly(poly).drawString(btn,x,y+1);
        x += (buttonPadding+w)/2;
      });
      g.flip();
    }
    g.reset().clearRect(P2.appRect); // clear screen
    if (!msg) {
      P2.setUI(); // remove watches
      return Promise.resolve();
    }
    draw();
    return new Promise(resolve=>{
      P2.setUI({mode: "leftright", remove: options.remove, redraw:draw, back:options.back}, dir=>{
        if (dir<0) {
          if (options.selected>0) {
            options.selected--;
            draw();
          }
        } else if (dir>0) {
          if (options.selected<btns.length-1) {
            options.selected++;
            draw();
          }
        } else {
          E.showPrompt(); // remove
          resolve(options.buttons[btns[options.selected]]);
        }
      });
    });
  }
  
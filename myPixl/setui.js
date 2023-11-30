P2.setUI = function(mode, cb) {
    var options = {};
    if ("object"==typeof mode) {
      options = mode;
      mode = options.mode;
      if (!mode) throw new Error("Missing mode in setUI({...})");
    }
    var redraw = true;
    if (global.WIDGETS && WIDGETS.back) {
      redraw = false;
      WIDGETS.back.remove(mode && options.back);
    }
    if (P2.btnWatches) {
      P2.btnWatches.forEach(clearWatch);
      delete P2.btnWatches;
    }
    delete P2.touchHandler;
    delete P2.uiRedraw;
    delete P2.CLOCK;
    if (P2.uiRemove) {
      let r = P2.uiRemove;
      delete P2.uiRemove; // stop recursion if setUI is called inside uiRemove
      r();
    }
    g.reset();// reset graphics state, just in case
    if (!mode) return;
    if (mode=="updown") {
      P2.btnWatches = [
        setWatch(function() { cb(-1); }, BTN1, {repeat:1,edge:"falling"}),
        setWatch(function() { cb(1); }, BTN3, {repeat:1,edge:"falling"}),
        setWatch(function() { cb(); }, BTN2, {repeat:1,edge:"falling"})
      ];
    } else if (mode=="leftright") {
      P2.btnWatches = [
        setWatch(function() { cb(-1); }, BTN1, {repeat:1,edge:"falling"}),
        setWatch(function() { cb(1); }, BTN3, {repeat:1,edge:"falling"}),
        setWatch(function() { cb(); }, BTN2, {repeat:1,edge:"falling"})
      ];
    } else if (mode=="clock") {
      P2.CLOCK=1;
      P2.btnWatches = [
        setWatch(P2.showLauncher, BTN2, {repeat:1,edge:"falling"})
      ];
    } else if (mode=="clockupdown") {
      P2.CLOCK=1;
      P2.btnWatches = [
        setWatch(function() { cb(-1); }, BTN1, {repeat:1,edge:"falling"}),
        setWatch(function() { cb(1); }, BTN3, {repeat:1,edge:"falling"}),
        setWatch(P2.showLauncher, BTN2, {repeat:1,edge:"falling"})
      ];
    } else if (mode=="custom") {
      if (options.clock) P2.CLOCK=1;
      if (options.btn) {
        P2.btnWatches = [
          setWatch(function() { options.btn(1); }, BTN1, {repeat:1,edge:"falling"}),
          setWatch(function() { options.btn(2); }, BTN2, {repeat:1,edge:"falling"}),
          setWatch(function() { options.btn(3); }, BTN3, {repeat:1,edge:"falling"})
        ];
      } else if (options.clock) {
        P2.btnWatches = [
          setWatch(P2.showLauncher, BTN2, {repeat:1,edge:"falling"})
        ];
      }
    } else
      throw new Error("Unknown UI mode "+E.toJS(mode));
    if (options.remove) // handler for removing the UI (intervals/etc)
      P2.uiRemove = options.remove;
    if (options.redraw) // handler for redrawing the UI
      P2.uiRedraw = options.redraw;
  }
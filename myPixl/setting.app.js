eval(STOR.read("menu.js"));
if (!E.showAlert) eval(STOR.read("prompt.js"));

  function showSettingsMenu(){
    const smenu = {
      "" : { "title" : "Settings" },
      'Invert Display': {
        value: settings.invert,
        format: () => (settings.invert ? 'Yes' : 'No'),
        onchange: () => {settings.invert = !settings.invert;}
      },
      'Rotate Display': {
        value: settings.rotated,
        format: () => (settings.rotated ? 'Yes' : 'No'),
        onchange: () => {settings.rotated = !settings.rotated;}
      },
      'Sync Time':function() {
          if (NRF.ctsIsActive()) {
            E.showMessage("Syncing time with iPhone",{title:"settings"});
            NRF.ctsGetTime().then(function(e){
              ctsUpdate(e);
              load("clock.app.js");
            });
          } else  
          E.showMessage("CTS SErvice not Active",{title:"settings"});
      },
      'App Settings>':showAppSettingsMenu,
      "Exit" : function() { STOR.writeJSON("settings.json",settings); load("launch.js");}
    }
    E.showMenu(smenu);
  }

  function showAppSettingsMenu() {
    let appmenu = {
      '': { 'title': 'App Settings' },
      '< Back':showSettingsMenu,
    }
    const apps = STOR.list(/\.settings\.js$/)
      .map(s => s.substr(0, s.length-12))
      .map(id => {
        const a=STOR.readJSON(id+'.info',1) || {name: id};
        return {id:id,name:a.name,sortorder:a.sortorder};
      })
      .sort((a, b) => {
        const n = (0|a.sortorder)-(0|b.sortorder);
        if (n) return n; // do sortorder first
        if (a.name<b.name) return -1;
        if (a.name>b.name) return 1;
        return 0;
      })
    if (apps.length === 0) {
      appmenu['No app has settings'] = () => { };
    }
    apps.forEach(function (app) {
      appmenu[app.name] = () => { showAppSettings(app) };
    })
    E.showMenu(appmenu)
  }
  function showAppSettings(app) {
    const showError = msg => {
      E.showMessage(`${app.name}:\n${msg}!\n\nBTN1 to go back`);
      setWatch(showAppSettingsMenu, BTN1, { repeat: false });
    }
    let appSettings = STOR.read(app.id+'.settings.js');
    try {
      appSettings = eval(appSettings);
    } catch (e) {
      console.log(`${app.name} settings error:`, e)
      return showError('Error in settings');
    }
    if (typeof appSettings !== "function") {
      return showError('Invalid settings');
    }
    try {
      // pass showAppSettingsMenu as "back" argument
      appSettings(()=>showAppSettingsMenu());
    } catch (e) {
      console.log(`${app.name} settings error:`, e)
      return showError('Error in settings');
    }
  }
  
showSettingsMenu();
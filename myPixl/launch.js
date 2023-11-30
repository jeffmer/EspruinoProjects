eval(STOR.read("menu.js"));

var apps = STOR.list(/\.app.js$/).map(app=>{return app.split('.')[0];});
                                      
const appsmenu = {
'': { 'title': 'Programs' }
};
  if (apps.length > 0) {
    apps.reduce((menu, app) => {
      menu[app] = () => {load(app+".app.js")};
      return menu;
    }, appsmenu);     
  }

  appsmenu["Settings>"] = ()=>showSettingsMenu();


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
      "Exit" : function() { STOR.writeJSON("settings.json",settings); E.showMenu(appsmenu);}
    }
    E.showMenu(smenu);
  }

E.showMenu(appsmenu);
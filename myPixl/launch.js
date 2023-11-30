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

E.showMenu(appsmenu);
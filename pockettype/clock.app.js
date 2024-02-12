(() => {

  function getApp(g){
  
    var W = g.getWidth();
    var H = g.getHeight();
    var scale = 0.6;

    function drawBat(v){
      var s = 39;
      x = W-44; y = 2;
      g.fillRect(x,y+2,x+s-4,y+21);
      g.clearRect(x+2,y+4,x+s-6,y+19);
      g.fillRect(x+s-3,y+10,x+s,y+14);
      g.fillRect(x+4,y+6,x+4+Math.ceil(v*(s-12)/100),y+17);
    }

    function drawBlue(){
      g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 4, 100);
    }

    function drawCharging(){
      g.drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),W-62,2);
    }
        
    function drawClock(){
      var now=Date();
      d=now.toString().split(' ');
      var min=d[4].substr(3,2);
      var sec=d[4].substr(-2);
      var tm=d[4].substring(0,5);
      var hr=d[4].substr(0,2);
      lastmin=min;
      g.clear();
      g.setFontAlign(0,0);
      g.setFontVector(48);
      g.drawString(tm,W/2,H/2-6);
      g.setFontVector(24);
      g.setColor(g.theme.fg2); 
      var dt=d[0]+" "+d[2]+" "+d[1];//+" "+d[3];
      g.drawString(dt,W/2,H/2+28);
      g.setFontAlign(-1,-1);
      g.setFontVector(16);
      g.drawString(""+E.getTemperature().toFixed(1)+"C",4,4);
      drawBat(E.getBattery());
      if (E.charging) drawCharging();
      if (NRF.getSecurityStatus().connected) drawBlue();
      g.flip();
    }

    NRF.on("connect", function(a){
      drawBlue();
      g.flip();
    });
      
    NRF.on("disconnect", function(a){
      g.clearRect(4,100,20,120);
      g.flip();
    });
    
    var ticker;

    function startClock(){
      drawClock();
      ticker = setInterval(drawClock,30000);
    }

    function endClock(){
      if (ticker) ticker = clearInterval(ticker);
    }

    return {begin:startClock, end:endClock};
  }
  
  return getApp;
  
  })();
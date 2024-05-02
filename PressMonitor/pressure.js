var SENSI2C = new I2C();
SENSI2C.setup({scl:D47,sda:D46,bitrate:200000});

eval(STOR.read("bme280.js"));
eval(STOR.read("trend.js"));

var Press = new Trend("Press","hPa",970,1050,10);
var PressD = new Trend("PressD","hPa",970,1050,10);
PressD.days = true;
var Humd = new Trend("Humd","%",0,100);
var Temp = new Trend("Temp","C",10,30);
var period = STOR.readJSON("period.json",1)||{remaining:0,cycle:0};
var READING = STOR.readJSON("READING.json",1)||{};

E.on("kill",function(){
    Press.save();
    PressD.save();
    Humd.save();
    Temp.save();
    STOR.writeJSON("period.json",period);
    STOR.writeJSON("READING.json",READING);
});  

function oneShot(){
    READING = BME280.getData();
    Press.record(READING.pressure);
    if (period.cycle==0) PressD.record(READING.pressure);
    period.cycle = (period.cycle+1)%6;
    Humd.record(READING.humidity);
    Temp.record(READING.temp);
} 

BME280.init()

function everyPeriod(){
  --period.remaining;
  if (period.remaining<=0){
    period.remaining=10;
    oneShot();
  }
}

setInterval(everyPeriod,60000);

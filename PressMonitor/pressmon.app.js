eval(STOR.read("bme280.js"));
eval(STOR.read("trend.js"));

var Press = new Trend("Press","hPa",970,1050,10);
var PressD = new Trend("PressD","hPa",970,1050,10);
PressD.days = true;
var Humd = new Trend("Humd","%",0,100);
var Temp = new Trend("Temp","C",10,30);

E.on("kill",function(){
    Press.save();
    PressD.save();
    Humd.save();
    Temp.save();
});  

var READING = {}
var cycle = 0;

function oneShot(){
    READING = BME280.getData();
    Press.record(READING.pressure);
    if (cycle==0) PressD.record(READING.pressure);
    cycle = (cycle+1)%6;
    Humd.record(READING.humidity);
    Temp.record(READING.temp);
} 

BME280.init()

oneShot();
setInterval(oneShot,600000);
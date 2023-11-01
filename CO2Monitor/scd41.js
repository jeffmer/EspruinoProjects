//driver for Sensiron SCD41 CO2 sensor

var crc_code = (function(){
    var bin=atob("grADEo34BQCN+AQw/yAAIgGr01xYQAgjEPCADwPx/zNP6kAAGL+A8DEAE/D/A8Cy8tEBMgIq69ECsHBH");
    return {
      gencrc:E.nativeCall(1, "int(int)", bin),
    };
  })();
  

var SENSI2C = new I2C();
SENSI2C.setup({scl:D42,sda:D43,bitrate:200000});

global.SCD41 = {
    delay_ms:function(d) {var t = getTime()+d/1000; while(getTime()<t);},
    wcd:function(v){
        var cbuf = new Uint8Array([v>>8,v]);
        SENSI2C.writeTo(0x62,cbuf);
    },
    startMeas:function(){this.wcd(0x21b1);},
    startLowPowerMeas:function(){this.wcd(0x21ac);},
    stopMeas:function(){this.wcd(0x3f86);},
    readMeas:function(){
        this.wcd(0xec05);
        this.delay_ms(1);
        var resp = SENSI2C.readFrom(0x62,9);
        var ppm = (resp[0]<<8)+resp[1];
        var t   = -45+175*((resp[3]<<8)+resp[4])/65535;
        var rh  = 100*((resp[6]<<8)+resp[7])/65535;
        return {co2:ppm, temp:t, humid:rh};
    },
    dataready:function(){
        this.wcd(0xe4b8);
        this.delay_ms(1);
        var resp = SENSI2C.readFrom(0x62,3);
        return (((resp[0]<<8)+resp[1])&0x7ff) != 0;
    },
    setTempOffset(v){
        val = Math.floor(v*65535/175);
        var cbuf = new Uint8Array([0x24,0x1d,val>>8,val,crc_code.gencrc(val)]);
        SENSI2C.writeTo(0x62,cbuf);
        this.delay_ms(1);
    },
    getTempOffset(){
        this.wcd(0x2318);
        this.delay_ms(1);
        var resp = SENSI2C.readFrom(0x62,3);
        return 175*((resp[0]<<8)+resp[1])/65535;
    }

};


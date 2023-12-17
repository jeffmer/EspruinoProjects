/* Convert two UInt8 value into one "signed" number */
function convS16(data, offs) {
    var value = (data[offs+1] << 8) + data[offs];
    if (value & 0x8000) value -= 65536;
    return value;
  }

var BME280 = {
    read:function(reg, len) { // read
        SENSI2C.writeTo(0x76, reg);
        return SENSI2C.readFrom(0x76, len);
      },
    write:function(reg, data) { // write
        SENSI2C.writeTo(0x76, [reg, data]);
      },
    readCoefficients:function() {
        var data = new Uint8Array(24+1+7);
        data.set(this.read(0x88, 24), 0);
        data.set(this.read(0xA1, 1), 24);
        data.set(this.read(0xE1, 7), 25);
        this.dT = [/*empty element*/,(data[1] << 8) | data[0],
                    convS16(data,2),
                    convS16(data,4)];
        this.dP = [/*empty element*/,(data[7] << 8) | data[6],
                    convS16(data,8),
                    convS16(data,10),
                    convS16(data,12),
                    convS16(data,14),
                    convS16(data,16),
                    convS16(data,18),
                    convS16(data,20),
                    convS16(data,22)];
        this.dH = [/*empty element*/,data[24],
                    convS16(data,25),
                    data[27],
                    (data[28] << 4) | (0x0F & data[29]),
                    (data[30] << 4) | ((data[29] >> 4) & 0x0F),
                    data[31]]; 
      },
      setPower:function(on) {
        var r = this.read(0xF4,1)[0]; // ctrl_meas_reg
        if (on) r |= 3; // normal mode
        else r &= ~3; // sleep mode
        this.write(0xF4,r)
      },
      readRawData:function() {
        this.startmeas();
        var data = this.read(0xF7, 8);
        this.pres_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4);
        this.temp_raw = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4);
        this.hum_raw = (data[6] << 8) | data[7];
      },
      calibration_T:function(adc_T) {
        var var1, var2, T;
        var dT = this.dT;
        var1 = ((adc_T) / 16384.0 - (dT[1]) / 1024.0) * (dT[2]);
        var2 = (((adc_T) / 131072.0 - (dT[1]) / 8192.0) * ((adc_T) / 131072.0 - (dT[1]) / 8192.0)) * (dT[3]);
        this.t_fine = (var1 + var2);
        T = (var1 + var2) / 5120.0;
        return T * 100;
      },
      calibration_P:function(adc_P) {
        var var1, var2, p;
        var dP = this.dP;
        var1 = (this.t_fine / 2.0) - 64000.0;
        var2 = var1 * var1 * (dP[6]) / 32768.0;
        var2 = var2 + var1 * (dP[5]) * 2.0;
        var2 = (var2 / 4.0) + ((dP[4]) * 65536.0);
        var1 = ((dP[3]) * var1 * var1 / 524288.0 + (dP[2]) * var1) / 524288.0;
        var1 = (1.0 + var1 / 32768.0) * (dP[1]);
        if (var1 === 0.0) {
          return 0; // avoid exception caused by division by zero
        }
        p = 1048576.0 - adc_P;
        p = (p - (var2 / 4096.0)) * 6250.0 / var1;
        var1 = (dP[9]) * p * p / 2147483648.0;
        var2 = p * (dP[8]) / 32768.0;
        p = p + (var1 + var2 + (dP[7])) / 16.0;
        return p;
      },
      calibration_H:function(adc_H) {
        var v_x1;
        var dH = this.dH;
        v_x1 = (this.t_fine - (76800));
        v_x1 = (((((adc_H << 14) - ((dH[4]) << 20) - ((dH[5]) * v_x1)) +
          (16384)) >> 15) * (((((((v_x1 * (dH[6])) >> 10) *
            (((v_x1 * (dH[3])) >> 11) + (32768))) >> 10) + (2097152)) *
          (dH[2]) + 8192) >> 14));
        v_x1 = (v_x1 - (((((v_x1 >> 15) * (v_x1 >> 15)) >> 7) * (dH[1])) >> 4));
        v_x1 = E.clip(v_x1,0,419430400);
        return (v_x1 >> 12);
      },
      getData:function() {
        this.readRawData();
        return {
           temp : this.calibration_T(this.temp_raw) / 100.0,
           pressure : this.calibration_P(this.pres_raw) / 100.0,
           humidity : this.calibration_H(this.hum_raw) / 1024.0
        };
      },
      init:function(){
        var osrs_t = 1;  //Temperature oversampling x 1
        var osrs_p = 1;  //Pressure oversampling x 1
        var osrs_h = 1;  //Humidity oversampling x 1
        var mode = 1;    //Forced mode
        var t_sb = 5;    //Tstandby 1000ms
        var filter = 0;  //Filter off
        var spi3w_en = 0;//3-wire SPI Disable
        this.config_reg = (t_sb << 5) | (filter << 2) | spi3w_en;
        this.ctrl_hum_reg = osrs_h;
        this.ctrl_meas_reg = (osrs_t << 5) | (osrs_p << 2) | mode;
        this.write(0xF2, this.ctrl_hum_reg);
        this.write(0xF4, this.ctrl_meas_reg);
        this.write(0xF5, this.config_reg);
        this.readCoefficients();
    },
    startmeas:function(){
        this.write(0xF2, this.ctrl_hum_reg);
        this.write(0xF4, this.ctrl_meas_reg);
        this.write(0xF5, this.config_reg);
    }  
}

/*
function coeff(){
  console.log(BME280.dT);
  console.log(BME280.dP);
  console.log(BME280.dH);
}

BME280.init()

function doit(){
  console.log(BME280.getData()); 
}
*/
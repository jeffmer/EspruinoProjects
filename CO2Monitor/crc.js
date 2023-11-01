//driver for Sensiron SCD41 CO2 sensor

var crc_code = E.compiledC(`
//int gencrc(int)

int gencrc(int val, int count) {
    unsigned char data[2];
    data[0] = val>>8;
    data[1] = val;
    int current_byte;
    unsigned char crc = 0xFF;
    unsigned char crc_bit;
    // calculates 8-Bit checksum with given polynomial 
    for (current_byte = 0; current_byte < 2; ++current_byte) {
        crc ^= (data[current_byte]);
        for (crc_bit = 8; crc_bit > 0; --crc_bit) {
            if (crc & 0x80)
                crc = (crc << 1) ^ 0x31;
            else
                crc = (crc << 1);
        }
    }
    return crc;
}
`);


function doit(v){
  var num = crc_code.gencrc(v);
  print("val: ",v.toString(16)," crc: ",num.toString(16));
}

doit(0x6667);

SPI1.setup({sck:D2, mosi:D1, baud: 10000000}); 

var g = require("ST7302").connect({
  spi:SPI1,
  dc:D30,
  ce:D29,
  rst:D31
});

g.setFont("Vector",36);
g.drawString("Hello, World",20,20);
g.flip();

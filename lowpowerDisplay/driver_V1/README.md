## ST7302 driver Version 1

This version of the driver uses a screen buffer but no image buffer.

It takes 550ms to render the example clock face with widgets.

30ms to do a `g.clear();g.flip()`  of which `g.flip` takes 10ms. 

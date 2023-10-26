## ST7302 driver Version 2

This version of the driver uses a screen buffer (4125 bytes) and an image buffer (4000 bytes).

It takes 146ms to render the example clock face with widgets.

73ms to do a `g.clear();g.flip()`  of which `g.flip` takes 49ms. 

However, partial updates are faster as only the modified part of the image buffer is is written to the screen buffer.

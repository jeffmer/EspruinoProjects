## ST7302 driver Version 2

This version of the driver uses a screen buffer (4125 bytes) and an image buffer (4000 bytes).

It takes 146ms to render the example clock face with widgets.

73ms to do a `g.clear();g.flip()`  of which `g.flip` takes 49ms. 

However, partial updates are faster as only the modified part of the image buffer is is written to the screen buffer.

### Updated Version 2

The recent commit improves the performance at the expense of a more complex update routine. 

It now takes 127ms to render the example with `g.flip` taking 31ms.


### and....

Unrolling the inner loop in update gives:

121ms to render the example with `g.flip` taking 24 ms.


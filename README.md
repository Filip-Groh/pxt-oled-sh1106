# Library for SH1106 OLED displays
## Display class
* Uses top left corner as point [0, 0]
* First 4 pixels from left are out of screen
* You can rewrite chip data or you can blend data together

### Methods
* Use clear() for clearing the screen (turns everything black)
* Use drawPoint() to turn one pixel white
* Use drawHLine() to draw strait horizontal line
* Use clearVLine() to erase only one column of display
* Use drawLine() to draw line from any point to any point, slow if possible use drawHLine()
* Use drawRectangle() to draw rectangle
* Use writeString() to write characters into 8 diffrent lines (max char per line: 22)

## SH1106 chip interface
* Allows to access chip directly and perform commands
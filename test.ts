input.onButtonPressed(Button.A, function () {
    OLED.fillScreen()
})
input.onButtonPressed(Button.AB, function () {
    OLED.clear()
})
input.onButtonPressed(Button.B, function () {
    OLED.testCode()
})
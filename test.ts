input.onButtonPressed(Button.A, function () {
    OLED.fillRect(
        0,
        0,
        127,
        63,
        1
    )
})
input.onButtonPressed(Button.AB, function () {
    OLED.clear()
})
input.onButtonPressed(Button.B, function () {
    OLED.showString(
        0,
        0,
        "Hello!",
        1
    )
})
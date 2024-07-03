namespace OLED {
    let font = [0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x00000000, 0x000002e0, 0x00018060, 0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060,
        0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200, 0x00021080, 0x00000100, 0x00111110, 0x0007462e, 0x00087e40,
        0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88, 0x00119531, 0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00,
        0x0008a880, 0x00052940, 0x00022a20, 0x0022d422, 0x00e4d62e, 0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf,
        0x000094bf, 0x00cac62e, 0x000f909f, 0x000047f1, 0x0017c629, 0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e,
        0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21, 0x0007c20f, 0x00744107, 0x01f4111f, 0x000d909b, 0x00117041,
        0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440, 0x01084210, 0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c,
        0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2, 0x000c109f, 0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e,
        0x000e085e, 0x00064a4c, 0x0002295e, 0x000f2944, 0x0001085c, 0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e,
        0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0, 0x000013f1, 0x00841080, 0x0022d422];

    let _I2CAddr = 0;
    let _screen = pins.createBuffer(1025);
    let _buf2 = pins.createBuffer(2);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    let _ZOOM = 0;

    function cmd1(d: number) {
        let n = d % 256;
        pins.i2cWriteNumber(_I2CAddr, n, NumberFormat.UInt16BE);
    }

    function cmd2(d1: number, d2: number) {
        _buf3[0] = 0;
        _buf3[1] = d1;
        _buf3[2] = d2;
        pins.i2cWriteBuffer(_I2CAddr, _buf3);
    }

    function cmd3(d1: number, d2: number, d3: number) {
        _buf4[0] = 0;
        _buf4[1] = d1;
        _buf4[2] = d2;
        _buf4[3] = d3;
        pins.i2cWriteBuffer(_I2CAddr, _buf4);
    }

    function set_pos(col: number = 0, page: number = 0) {
        cmd1(0xb0 | page) // page number
        //        let c = col * (_ZOOM + 1)
        let c = col * (_ZOOM + 1) + 2 // for SH1106
        cmd1(0x00 | (c % 16)) // lower start column address
        cmd1(0x10 | (c >> 4)) // upper start column address    
    }

    // clear bit
    function clrbit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    /**
     * set pixel in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param color is dot color, eg: 1
     */
    //% blockId="OLED_PIXEL" block="set pixel at x %x|y %y|color %color"
    //% weight=70 blockGap=8
    //% parts=OLED trackArgs=0
    export function pixel(x: number, y: number, color: number = 1) {
        let page = y >> 3
        let shift_page = y % 8
        let ind = x * (_ZOOM + 1) + page * 128 + 1
        let b = (color) ? (_screen[ind] | (1 << shift_page)) : clrbit(_screen[ind], shift_page)
        _screen[ind] = b
        set_pos(x, page)
        if (_ZOOM) {
            _screen[ind + 1] = b
            _buf3[0] = 0x40
            _buf3[1] = _buf3[2] = b
            pins.i2cWriteBuffer(_I2CAddr, _buf3)
        }
        else {
            _buf2[0] = 0x40
            _buf2[1] = b
            pins.i2cWriteBuffer(_I2CAddr, _buf2)
        }
    }

    /**
     * show text in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param s is the text will be show, eg: 'Hello!'
     * @param color is string color, eg: 1
     */
    //% blockId="OLED_SHOWSTRING" block="show string at x %x|y %y|text %s|color %color"
    //% weight=80 blockGap=8
    //% parts=OLED trackArgs=0
    export function showString(x: number, y: number, s: string, color: number = 1) {
        let col = 0
        let p = 0
        let ind2 = 0
        let maxLength = _ZOOM ? 12 : 25
        let stringLength = s.length <= maxLength ? s.length : maxLength
        for (let stringNo = 0; stringNo < stringLength; stringNo++) {
            p = font[s.charCodeAt(stringNo)]
            for (let i = 0; i < 5; i++) {
                col = 0
                for (let j = 0; j < 5; j++) {
                    if (p & (1 << (5 * i + j)))
                        col |= (1 << (j + 1))
                }
                ind2 = (x + stringNo) * 5 * (_ZOOM + 1) + y * 128 + i * (_ZOOM + 1) + 1
                if (color == 0)
                    col = 255 - col
                _screen[ind2] = col
                if (_ZOOM)
                    _screen[ind2 + 1] = col
            }
        }
        set_pos(x * 5, y)
        let indX = x * 5 * (_ZOOM + 1) + y * 128
        let buf = _screen.slice(indX, ind2 + 1)
        buf.shift(-1)
        buf[0] = 0x40
        pins.i2cWriteBuffer(_I2CAddr, buf)
    }

    /**
     * show a number in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param num is the number will be show, eg: 12
     * @param color is number color, eg: 1
     */
    //% blockId="OLED_NUMBER" block="show a Number at x %x|y %y|number %num|color %color"
    //% weight=80 blockGap=8
    //% parts=OLED trackArgs=0
    export function showNumber(x: number, y: number, num: number, color: number = 1) {
        showString(x, y, num.toString(), color)
    }

    /**
     * draw a horizontal line
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param len is the length of line, eg: 10
     * @param color is line color, eg: 1
     */
    //% blockId="OLED_HLINE" block="draw a horizontal line at x %x|y %y|number %len|color %color"
    //% weight=71 blockGap=8
    //% parts=OLED trackArgs=0
    export function hline(x: number, y: number, len: number, color: number = 1) {
        for (let k = x; k < (x + len); k++)
            pixel(k, y, color)
    }

    /**
     * draw a vertical line
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param len is the length of line, eg: 10
     * @param color is line color, eg: 1
     */
    //% blockId="OLED_VLINE" block="draw a vertical line at x %x|y %y|number %len|color %color"
    //% weight=72 blockGap=8
    //% parts=OLED trackArgs=0
    export function vline(x: number, y: number, len: number, color: number = 1) {
        for (let l = y; l < (y + len); l++)
            pixel(x, l, color)
    }

    /**
     * draw a rectangle
     * @param x1 is X alis, eg: 0
     * @param y1 is Y alis, eg: 0
     * @param x2 is X alis, eg: 60
     * @param y2 is Y alis, eg: 30
     * @param color is line color, eg: 1
     */
    //% blockId="OLED_RECT" block="draw a rectangle at x1 %x1|y1 %y1|x2 %x2|y2 %y2|color %color"
    //% weight=73 blockGap=8
    //% parts=OLED trackArgs=0
    export function rect(x1: number, y1: number, x2: number, y2: number, color: number = 1) {
        if (x1 > x2)
            x1 = [x2, x2 = x1][0];
        if (y1 > y2)
            y1 = [y2, y2 = y1][0];
        hline(x1, y1, x2 - x1 + 1, color)
        hline(x1, y2, x2 - x1 + 1, color)
        vline(x1, y1, y2 - y1 + 1, color)
        vline(x2, y1, y2 - y1 + 1, color)
    }

    /**
     * fill a rectangle
     * @param x1 is X alis, eg: 0
     * @param y1 is Y alis, eg: 0
     * @param x2 is X alis, eg: 60
     * @param y2 is Y alis, eg: 30
     * @param color is line color, eg: 1
     */
    //% blockId="OLED_FILLRECT" block="fillRect at x1 %x1|y1 %y1|x2 %x2|y2 %y2|color %color"
    //% weight=73 blockGap=8
    //% parts=OLED trackArgs=0
    export function fillRect(x1: number, y1: number, x2: number, y2: number, color: number = 1) {
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                pixel(x, y)
            }
        }
    }
    /**
     * invert display
     * @param d true: invert / false: normal, eg: true
     */
    //% blockId="OLED_INVERT" block="invert display %d"
    //% weight=65 blockGap=8
    //% parts=OLED trackArgs=0
    export function invert(d: boolean = true) {
        let q = (d) ? 0xA7 : 0xA6
        cmd1(q)
    }

    /**
     * draw / redraw screen
     */
    //% blockId="OLED_DRAW" block="draw"
    //% weight=64 blockGap=8
    //% parts=OLED trackArgs=0
    export function draw() {
        for (let drawPage = 0; drawPage <= 7; drawPage++) {
            set_pos(0, drawPage)
            let drawBuf = pins.createBuffer(129)
            drawBuf = _screen.slice(drawPage * 128 + 1, (drawPage + 1) * 128)
            drawBuf.shift(-1)
            drawBuf[0] = 0x40
            pins.i2cWriteBuffer(_I2CAddr, drawBuf)
        }
    }

    /**
     * clear screen
     */
    //% blockId="OLED_CLEAR" block="clear"
    //% weight=63 blockGap=8
    //% parts=OLED trackArgs=0
    export function clear() {
        _screen.fill(0)
        _screen[0] = 0x40
        draw()
    }

    /**
     * turn on screen
     */
    //% blockId="OLED_ON" block="display on"
    //% weight=62 blockGap=8
    //% parts=OLED trackArgs=0
    export function on() {
        cmd1(0xAF)
    }

    /**
     * turn off screen
     */
    //% blockId="OLED_OFF" block="display off"
    //% weight=61 blockGap=8
    //% parts=OLED trackArgs=0
    export function off() {
        cmd1(0xAE)
    }

    /**
     * zoom mode
     * @param d true zoom / false normal, eg: true
     */
    //% blockId="OLED_ZOOM" block="zoom %d"
    //% weight=60 blockGap=8
    //% parts=OLED trackArgs=0
    export function zoom(d: boolean = true) {
        _ZOOM = (d) ? 1 : 0
        cmd2(0xd6, _ZOOM)
    }

    /**
     * OLED initialize
     * @param addr is i2c addr, eg: 60
     */
    //% blockId="OLED_initialize" block="initialize OLED"
    //% weight=100 blockGap=8
    //% parts=OLED trackArgs=0
    export function initialize() {
        _I2CAddr = 60;
        _ZOOM = 0
        cmd1(0xAE)       // SSD1306_DISPLAYOFF
        cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
        cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
        cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
        cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
        cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
        cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
        cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
        cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
        cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
        cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
        cmd1(0xc8)       // SSD1306_COMSCANDEC
        cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
        cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
        cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
        cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
        cmd1(0xA6)       // SSD1306_NORMALDISPLAY
        cmd2(0xD6, _ZOOM)    // zoom off
        cmd1(0xAF)       // SSD1306_DISPLAYON
        clear()
    }
}
OLED.initialize()

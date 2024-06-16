namespace SH1106 {
    const chipAdress = 0x3C

    export enum PumpVoltage {
        V604 = 0,
        V704 = 1,
        V800 = 2,
        V900 = 3
    }

    export enum OscillatorPercentile {
        Minus25Percent = 0,
        Minus20Percent = 1,
        Minus15Percent = 2,
        Minus10Percent = 3,
        Minus5Percent = 4,
        Default = 5,
        Plus5Percent = 6,
        Plus10Percent = 7,
        Plus15Percent = 8,
        Plus20Percent = 9,
        Plus25Percent = 10,
        Plus30Percent = 11,
        Plus35Percent = 12,
        Plus40Percent = 13,
        Plus45Percent = 14,
        Plus50Percent = 15
    }

    export enum PreCharge {
        DCLK1 = 1,
        DCLK2 = 2,
        DCLK3 = 3,
        DCLK4 = 4,
        DCLK5 = 5,
        DCLK6 = 6,
        DCLK7 = 7,
        DCLK8 = 8,
        DCLK9 = 9,
        DCLK10 = 10,
        DCLK11 = 11,
        DCLK12 = 12,
        DCLK13 = 13,
        DCLK14 = 14,
        DCLK15 = 15
    }

    export enum DisCharge {
        DCLK1 = 1,
        DCLK2 = 2,
        DCLK3 = 3,
        DCLK4 = 4,
        DCLK5 = 5,
        DCLK6 = 6,
        DCLK7 = 7,
        DCLK8 = 8,
        DCLK9 = 9,
        DCLK10 = 10,
        DCLK11 = 11,
        DCLK12 = 12,
        DCLK13 = 13,
        DCLK14 = 14,
        DCLK15 = 15
    }

    export enum PadConfiguration {
        Sequential = 0x02,
        Alternative = 0x12
    }

    type State = {
        isBusy: boolean,
        isDisplayOn: boolean
    }

    function command(cmd: number) {
        let buffer = pins.createBuffer(2)
        buffer[0] = 0x00
        buffer[1] = cmd
        pins.i2cWriteBuffer(chipAdress, buffer)
    }

    export function write(data: Buffer) {
        startReadModifyWriteMode()
        let buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer.concat(data))
        stopReadModifyWriteMode()
    }

    export function read(length: number): Buffer {
        startReadModifyWriteMode()
        let buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer)
        let data = pins.i2cReadBuffer(chipAdress, length, false)
        stopReadModifyWriteMode()
        return data
    }

    export function readStatus(): State {
        let buffer = pins.createBuffer(1)
        buffer[0] = 0x00
        pins.i2cWriteBuffer(chipAdress, buffer)

        buffer = pins.i2cReadBuffer(chipAdress, 1, false)
        let data = buffer.getUint8(0)
        console.logValue("data", data)
        return {
            isBusy: !!(data >> 7),
            isDisplayOn: !((data & 0x40) >> 6)
        }
    }

    export function displayOff() {
        command(0x0AE)
    }

    export function displayOn() {
        command(0x0AF)
    }

    export function setColumnAddress(address: number) {
        command(address & 0x0F)
        command(address >> 4 + 0x10)
    }

    export function normalDisplayColor() {
        command(0xA6)
    }

    export function inverseDisplayColor() {
        command(0xA7)
    }

    export function forceDisplayOn() {
        command(0xA5)
    }

    export function forceDisplayOff() {
        command(0xA4)
    }

    export function flipDisplayDirection() {
        command(0xC8)
    }

    export function normalDisplayDirection() {
        command(0xC0)
    }

    export function setVoltagePump(pumpVoltage: PumpVoltage) {
        command(0x30 + pumpVoltage)
    }

    export function setDisplayStartLine(startLine: number) {
        command(0x40 + startLine)
    }

    export function setContrast(contrast: number) {
        command(0x81)
        command(contrast)
    }

    export function setMultiplexRation(multiplexRation: number) {
        command(0xA8)
        command(multiplexRation)
    }

    export function setDCToDCOff() {
        displayOff()
        command(0xAD)
        command(0x8A)
    }

    export function setDCToDCOn() {
        displayOff()
        command(0xAD)
        command(0x8B)
    }

    export function setPageAddress(address: number) {
        command(0xB0 + address)
    }

    export function setDisplayOffset(offset: number) {
        command(0xD3)
        command(offset)
    }

    export function setDisplayClock(divideRatio: number, oscillatorPercentile: OscillatorPercentile) {
        command(0xD5)
        command(oscillatorPercentile << 4 + divideRatio)
    }

    export function setPreChargeDisChargePeriod(preCharge: PreCharge, disCharge: DisCharge) {
        command(0xD9)
        command(disCharge << 4 + preCharge)
    }

    export function setCommonPadsHardwareConfiguration(padConfiguration: PadConfiguration) {
        command(0xDA)
        command(padConfiguration)
    }

    export function setVCOMDeselectLevel(deselectLevel: number) {
        command(0xDB)
        command(deselectLevel)
    }

    export function startReadModifyWriteMode() {
        command(0xE0)
    }

    export function stopReadModifyWriteMode() {
        command(0xEE)
    }

    export function normalSegmentRemaping() {
        command(0xA0)
    }

    export function reverseSegmentRemaping() {
        command(0xA1)
    }
}

Display.init()
Display.clear()
Display.drawHLine(10, 10, 50)





namespace Display {
    const width: number = 128
    const height: number = 64

    export function init() {
        SH1106.displayOff()      
        SH1106.setMultiplexRation(0x3F)
        SH1106.setDisplayOffset(0)
        SH1106.setDisplayStartLine(0)  
        SH1106.setPageAddress(0)
        SH1106.setColumnAddress(0)
        SH1106.setVoltagePump(SH1106.PumpVoltage.V800)
        SH1106.setContrast(0xFF)
        SH1106.normalSegmentRemaping()
        SH1106.forceDisplayOff()
        SH1106.normalDisplayDirection()
        SH1106.setDCToDCOn()
        SH1106.normalDisplayColor()
        SH1106.setDisplayClock(0, SH1106.OscillatorPercentile.Default)
        SH1106.setPreChargeDisChargePeriod(SH1106.PreCharge.DCLK2, SH1106.DisCharge.DCLK2)
        SH1106.setCommonPadsHardwareConfiguration(SH1106.PadConfiguration.Alternative)
        SH1106.setVCOMDeselectLevel(0x35)
        SH1106.displayOn()
    }

    export function clear() {
        for(let page: number = 0; page < 8; page++) {
            let buffer = pins.createBuffer(width)
            buffer.fill(0x00, 0, width)
            SH1106.setPageAddress(page)
            SH1106.setColumnAddress(0)
            SH1106.write(buffer)
        }
    }

    export function drawHLine(x: number, y: number, length: number) {
        SH1106.setPageAddress(Math.floor(y / 8))
        SH1106.setColumnAddress(x)
        let buffer = pins.createBuffer(length)
        buffer.fill(2 ** (y % 8), 0, length)
        SH1106.write(buffer)
    }

    function drawShape(pixels: Array<Array<number>>) {
        let x1 = width
        let y1 = height
        let x2 = 0
        let y2 = 0
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i][0] < x1) {
                x1 = pixels[i][0]
            }
            if (pixels[i][0] > x2) {
                x2 = pixels[i][0]
            }
            if (pixels[i][1] < y1) {
                y1 = pixels[i][1]
            }
            if (pixels[i][1] > y2) {
                y2 = pixels[i][1]
            }
        }
        let page1 = Math.floor(y1 / 8)
        let page2 = Math.floor(y2 / 8)
        let line = pins.createBuffer(1)
        for (let x = x1; x <= x2; x++) {
            for (let page = page1; page <= page2; page++) {
                line[0] = 0x00
                for (let i = 0; i < pixels.length; i++) {
                    if (pixels[i][0] === x) {
                        if (Math.floor(pixels[i][1] / 8) === page) {
                            line[0] |= Math.pow(2, (pixels[i][1] % 8))
                        }
                    }
                }
                if (line[0] !== 0x00) {
                    SH1106.setColumnAddress(x)
                    // command(SSD1306_SETCOLUMNADRESS)
                    // command(x)
                    // command(x + 1)
                    SH1106.setPageAddress(page)
                    // command(SSD1306_SETPAGEADRESS)
                    // command(page)
                    // command(page + 1)
                    SH1106.write(line)
                }
            }
        }
    }

    export function drawLine(x0: number, y0: number, x1: number, y1: number) {
        let pixels: Array<Array<number>> = []
        let kx: number, ky: number, c: number, i: number, xx: number, yy: number, dx: number, dy: number;
        let targetX = x1
        let targetY = y1
        x1 -= x0; kx = 0; if (x1 > 0) kx = +1; if (x1 < 0) { kx = -1; x1 = -x1; } x1++;
        y1 -= y0; ky = 0; if (y1 > 0) ky = +1; if (y1 < 0) { ky = -1; y1 = -y1; } y1++;
        if (x1 >= y1) {
            c = x1
            for (i = 0; i < x1; i++, x0 += kx) {
                pixels.push([x0, y0])
                c -= y1; if (c <= 0) { if (i != x1 - 1) pixels.push([x0 + kx, y0]); c += x1; y0 += ky; if (i != x1 - 1) pixels.push([x0, y0]); }
                if (pixels.length > 20) {
                    drawShape(pixels)
                    pixels = []
                    drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        } else {
            c = y1
            for (i = 0; i < y1; i++, y0 += ky) {
                pixels.push([x0, y0])
                c -= x1; if (c <= 0) { if (i != y1 - 1) pixels.push([x0, y0 + ky]); c += y1; x0 += kx; if (i != y1 - 1) pixels.push([x0, y0]); }
                if (pixels.length > 20) {
                    drawShape(pixels)
                    pixels = []
                    drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        }
        drawShape(pixels)
    }

    export function drawRectangle(x0: number, y0: number, x1: number, y1: number) {
        drawLine(x0, y0, x1, y0)
        drawLine(x0, y1, x1, y1)
        drawLine(x0, y0, x0, y1)
        drawLine(x1, y0, x1, y1)
    }
}
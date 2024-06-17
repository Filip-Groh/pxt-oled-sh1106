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
        command(address >> 4 | 0x10)
        command(address & 0x0F)
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

Display.drawChar(0, 0, "A")






namespace Display {
    const width: number = 132
    const height: number = 64
    let font = hex`
    0000000000
    3E5B4F5B3E
    3E6B4F6B3E
    1C3E7C3E1C
    183C7E3C18
    1C577D571C
    1C5E7F5E1C
    00183C1800
    FFE7C3E7FF
    0018241800
    FFE7DBE7FF
    30483A060E
    2629792926
    407F050507
    407F05253F
    5A3CE73C5A
    7F3E1C1C08
    081C1C3E7F
    14227F2214
    5F5F005F5F
    06097F017F
    006689956A
    6060606060
    94A2FFA294
    08047E0408
    10207E2010
    08082A1C08
    081C2A0808
    1E10101010
    0C1E0C1E0C
    30383E3830
    060E3E0E06
    0000000000
    00005F0000
    0007000700
    147F147F14
    242A7F2A12
    2313086462
    3649562050
    0008070300
    001C224100
    0041221C00
    2A1C7F1C2A
    08083E0808
    0080703000
    0808080808
    0000606000
    2010080402
    3E5149453E
    00427F4000
    7249494946
    2141494D33
    1814127F10
    2745454539
    3C4A494931
    4121110907
    3649494936
    464949291E
    0000140000
    0040340000
    0008142241
    1414141414
    0041221408
    0201590906
    3E415D594E
    7C1211127C
    7F49494936
    3E41414122
    7F4141413E
    7F49494941
    7F09090901
    3E41415173
    7F0808087F
    00417F4100
    2040413F01
    7F08142241
    7F40404040
    7F021C027F
    7F0408107F
    3E4141413E
    7F09090906
    3E4151215E
    7F09192946
    2649494932
    03017F0103
    3F4040403F
    1F2040201F
    3F4038403F
    6314081463
    0304780403
    6159494D43
    007F414141
    0204081020
    004141417F
    0402010204
    4040404040
    0003070800
    2054547840
    7F28444438
    3844444428
    384444287F
    3854545418
    00087E0902
    18A4A49C78
    7F08040478
    00447D4000
    2040403D00
    7F10284400
    00417F4000
    7C04780478
    7C08040478
    3844444438
    FC18242418
    18242418FC
    7C08040408
    4854545424
    04043F4424
    3C4040207C
    1C2040201C
    3C4030403C
    4428102844
    4C9090907C
    4464544C44
    0008364100
    0000770000
    0041360800
    0201020402
    3C2623263C
    1EA1A16112
    3A4040207A
    3854545559
    2155557941
    2154547841
    2155547840
    2054557940
    0C1E527212
    3955555559
    3954545459
    3955545458
    0000457C41
    0002457D42
    0001457C40
    F0292429F0
    F0282528F0
    7C54554500
    2054547C54
    7C0A097F49
    3249494932
    3248484832
    324A484830
    3A4141217A
    3A42402078
    009DA0A07D
    3944444439
    3D4040403D
    3C24FF2424
    487E494366
    2B2FFC2F2B
    FF0929F620
    C0887E0903
    2054547941
    0000447D41
    3048484A32
    384040227A
    007A0A0A72
    7D0D19317D
    2629292F28
    2629292926
    30484D4020
    3808080808
    0808080838
    2F10C8ACBA
    2F102834FA
    00007B0000
    08142A1422
    22142A1408
    AA005500AA
    AA55AA55AA
    000000FF00
    101010FF00
    141414FF00
    1010FF00FF
    1010F010F0
    141414FC00
    1414F700FF
    0000FF00FF
    1414F404FC
    141417101F
    10101F101F
    1414141F00
    101010F000
    0000001F10
    1010101F10
    101010F010
    000000FF10
    1010101010
    101010FF10
    000000FF14
    0000FF00FF
    00001F1017
    0000FC04F4
    1414171017
    1414F404F4
    0000FF00F7
    1414141414
    1414F700F7
    1414141714
    10101F101F
    141414F414
    1010F010F0
    00001F101F
    0000001F14
    000000FC14
    0000F010F0
    1010FF10FF
    141414FF14
    1010101F00
    000000F010
    FFFFFFFFFF
    F0F0F0F0F0
    FFFFFF0000
    000000FFFF
    0F0F0F0F0F
    3844443844
    7C2A2A3E14
    7E02020606
    027E027E02
    6355494163
    3844443C04
    407E201E20
    06027E0202
    99A5E7A599
    1C2A492A1C
    4C7201724C
    304A4D4D30
    3048784830
    BC625A463D
    3E49494900
    7E0101017E
    2A2A2A2A2A
    44445F4444
    40514A4440
    40444A5140
    0000FF0103
    E080FF0000
    08086B6B08
    3612362436
    060F090F06
    0000181800
    0000101000
    3040FF0101
    001F01011E
    00191D1712
    003C3C3C3C
    0000000000`

    export function init() {
        SH1106.displayOff()      
        SH1106.setMultiplexRation(0x3F)
        SH1106.setDisplayOffset(0)
        SH1106.setDisplayStartLine(0)  
        SH1106.setPageAddress(0)
        SH1106.setColumnAddress(0)
        SH1106.setVoltagePump(SH1106.PumpVoltage.V800)
        SH1106.setContrast(0xFF)
        SH1106.reverseSegmentRemaping()
        SH1106.forceDisplayOff()
        SH1106.flipDisplayDirection()
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

    // export function drawVLine(x: number, y: number, length: number) {
    //     for (let page: number = Math.ceil(y / 8); page < Math.ceil((length + y) / 8); page++) {
    //         SH1106.setPageAddress(page)
    //         SH1106.setColumnAddress(x)
    //         let buffer = pins.createBuffer(1)
    //         buffer[0] = 0xFF
    //         SH1106.write(buffer)
    //     }
    // }

    // export function drawVLine(x: number, y: number, length: number) {
    //     for(let page: number = 0; page < Math.ceil((length - y) / 8); page++) {
    //         SH1106.setPageAddress(Math.floor(y / 8) + page)
    //         SH1106.setColumnAddress(x)
    //         let buffer = pins.createBuffer(1)
    //         buffer[0] = 0xFF //^ y % 8
    //         SH1106.write(buffer)
    //     }
    // }

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

    export function drawChar(x: number, page: number, char: string) {
        SH1106.setColumnAddress(x)
        SH1106.setPageAddress(page)
        let line = pins.createBuffer(6)
        for (let i = 0; i < 5; i++) {
            let charIndex = char.charCodeAt(0)
            let charNumber = font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + i)
            console.logValue("charNumber", charNumber)
            line[i] = charNumber
        }
        line[5] = 0x00
        SH1106.write(line)
    }

    export function writeString(x: number, page: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            if (x > width - 6) {
                page++
            }
            drawChar(x, page, str.charAt(i))
            x += 6
        }
    }
}
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

    export function draw(new_data: Buffer) {
        startReadModifyWriteMode()
        let buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer)
        let old_data = pins.i2cReadBuffer(chipAdress, new_data.length, false)

        old_data.toArray(NumberFormat.UInt8LE).forEach((value: number, index: number) => {
            new_data[index] |= value
        })
        pins.i2cWriteBuffer(chipAdress, buffer.concat(new_data))
        stopReadModifyWriteMode()
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
        address %= 132
        command(address >> 4 + 0x10)
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
        startLine %= 64
        command(0x40 + startLine)
    }

    export function setContrast(contrast: number) {
        contrast %= 256
        command(0x81)
        command(contrast)
    }

    export function setMultiplexRation(multiplexRation: number) {
        multiplexRation %= 64
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
        address %= 8
        command(0xB0 + address)
    }

    export function setDisplayOffset(offset: number) {
        offset %= 64
        command(0xD3)
        command(offset)
    }

    export function setDisplayClock(divideRatio: number, oscillatorPercentile: OscillatorPercentile) {
        divideRatio %= 16
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
        deselectLevel %= 65
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

enum DrawMode {
    Overwrite,
    Blend
}

class Display {
    private font: Buffer
    private font_text: string = "00000000003E5B4F5B3E3E6B4F6B3E1C3E7C3E1C183C7E3C181C577D571C1C5E7F5E1C00183C1800FFE7C3E7FF0018241800FFE7DBE7FF30483A060E2629792926407F050507407F05253F5A3CE73C5A7F3E1C1C08081C1C3E7F14227F22145F5F005F5F06097F017F006689956A606060606094A2FFA29408047E040810207E201008082A1C08081C2A08081E101010100C1E0C1E0C30383E3830060E3E0E06000000000000005F00000007000700147F147F14242A7F2A12231308646236495620500008070300001C2241000041221C002A1C7F1C2A08083E080800807030000808080808000060600020100804023E5149453E00427F400072494949462141494D331814127F1027454545393C4A49493141211109073649494936464949291E0000140000004034000000081422411414141414004122140802015909063E415D594E7C1211127C7F494949363E414141227F4141413E7F494949417F090909013E414151737F0808087F00417F41002040413F017F081422417F404040407F021C027F7F0408107F3E4141413E7F090909063E4151215E7F09192946264949493203017F01033F4040403F1F2040201F3F4038403F631408146303047804036159494D43007F4141410204081020004141417F04020102044040404040000307080020545478407F284444383844444428384444287F385454541800087E090218A4A49C787F0804047800447D40002040403D007F1028440000417F40007C047804787C080404783844444438FC1824241818242418FC7C08040408485454542404043F44243C4040207C1C2040201C3C4030403C44281028444C9090907C4464544C4400083641000000770000004136080002010204023C2623263C1EA1A161123A4040207A385454555921555579412154547841215554784020545579400C1E5272123955555559395454545939555454580000457C410002457D420001457C40F0292429F0F0282528F07C545545002054547C547C0A097F4932494949323248484832324A4848303A4141217A3A42402078009DA0A07D39444444393D4040403D3C24FF2424487E4943662B2FFC2F2BFF0929F620C0887E090320545479410000447D413048484A32384040227A007A0A0A727D0D19317D2629292F28262929292630484D4020380808080808080808382F10C8ACBA2F102834FA00007B000008142A142222142A1408AA005500AAAA55AA55AA000000FF00101010FF00141414FF001010FF00FF1010F010F0141414FC001414F700FF0000FF00FF1414F404FC141417101F10101F101F1414141F00101010F0000000001F101010101F10101010F010000000FF101010101010101010FF10000000FF140000FF00FF00001F10170000FC04F414141710171414F404F40000FF00F714141414141414F700F7141414171410101F101F141414F4141010F010F000001F101F0000001F14000000FC140000F010F01010FF10FF141414FF141010101F00000000F010FFFFFFFFFFF0F0F0F0F0FFFFFF0000000000FFFF0F0F0F0F0F38444438447C2A2A3E147E02020606027E027E0263554941633844443C04407E201E2006027E020299A5E7A5991C2A492A1C4C7201724C304A4D4D303048784830BC625A463D3E494949007E0101017E2A2A2A2A2A44445F444440514A444040444A51400000FF0103E080FF000008086B6B083612362436060F090F06000018180000001010003040FF0101001F01011E00191D1712003C3C3C3C0000000000"

    public width: number = 132
    public height: number = 64

    public drawMode: DrawMode = DrawMode.Blend

    public constructor () {
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

        this.processFont()
    }

    private processFont() {
        this.font = pins.createBuffer(this.font_text.length / 2)
        for (let i: number = 0; i < this.font_text.length; i += 2) {
            this.font.setNumber(NumberFormat.UInt8BE, i / 2, parseInt(this.font_text.substr(i, 2), 16))
        }
    }

    public clear() {
        SH1106.setColumnAddress(0)
        for (let page: number = 0; page < 8; page++) {
            let buffer = pins.createBuffer(this.width)
            buffer.fill(0x00, 0, this.width)
            SH1106.setPageAddress(page)
            this.drawCall(buffer, DrawMode.Overwrite)
        }
    }

    public drawPoint(x: number, y: number) {
        SH1106.setColumnAddress(x)
        SH1106.setPageAddress(Math.floor(y / 8))
        let buffer = pins.createBuffer(1)
        buffer[0] = 2 ** (y % 8)
        this.drawCall(buffer, this.drawMode)
    }

    public drawHLine(x: number, y: number, length: number) {
        SH1106.setPageAddress(Math.floor(y / 8))
        SH1106.setColumnAddress(x)
        let buffer = pins.createBuffer(length)
        buffer.fill(2 ** (y % 8), 0, length)
        this.drawCall(buffer, this.drawMode)
    }

    public drawVLine(x: number, y: number, length: number) {
        for (let currentY: number = y; currentY < y + length; currentY++) {
            this.drawPoint(x, currentY)
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
    }

    public drawLine(x0: number, y0: number, x1: number, y1: number) {
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
                    this.drawShape(pixels)
                    pixels = []
                    this.drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        } else {
            c = y1
            for (i = 0; i < y1; i++, y0 += ky) {
                pixels.push([x0, y0])
                c -= x1; if (c <= 0) { if (i != y1 - 1) pixels.push([x0, y0 + ky]); c += y1; x0 += kx; if (i != y1 - 1) pixels.push([x0, y0]); }
                if (pixels.length > 20) {
                    this.drawShape(pixels)
                    pixels = []
                    this.drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        }
        this.drawShape(pixels)
    }

    public drawRectangle(x0: number, y0: number, x1: number, y1: number) {
        this.drawHLine(x0, y0, x1 - x0)
        this.drawHLine(x0, y1, x1 - x0)
        this.drawLine(x0, y0, x0, y1)
        this.drawLine(x1, y0, x1, y1)
    }

    public writeString(x: number, page: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            if (x > this.width - 6) {
                page++
            }
            this.drawChar(x, page, str.charAt(i))
            x += 6
        }
    }

    private drawShape(pixels: Array<Array<number>>) {
        let x1 = this.width
        let y1 = this.height
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
                    SH1106.setPageAddress(page)
                    this.drawCall(line, this.drawMode)
                }
            }
        }
    }

    private drawChar(x: number, page: number, char: string) {
        SH1106.setColumnAddress(x)
        SH1106.setPageAddress(page)
        let line = pins.createBuffer(6)
        for (let i = 0; i < 5; i++) {
            let charIndex = char.charCodeAt(0)
            let charNumber = this.font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + i)
            line[i] = charNumber
        }
        line[5] = 0x00
        this.drawCall(line, this.drawMode)
    }

    private drawCall(data: Buffer, mode: DrawMode) {
        switch(mode) {
            case DrawMode.Overwrite: 
                SH1106.write(data)
                break
            case DrawMode.Blend:
                SH1106.draw(data)
                break
        }
    }
}

let display: Display = new Display()
display.clear()
display.drawVLine(10, 10, 40)
// display.drawRectangle(5, 5, 132 - 5, 64 - 5)
// display.drawLine(5, 5, 132 - 5, 64 - 5)
// display.writeString(10, 10, "Hello world!")
// display.drawPoint(20, 40)
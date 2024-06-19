namespace SH1106 {
    const chipAdress: number = 0x3C

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

    function command(cmd: number): void {
        let buffer: Buffer = pins.createBuffer(2)
        buffer[0] = 0x00
        buffer[1] = cmd
        pins.i2cWriteBuffer(chipAdress, buffer)
    }

    export function write(data: Buffer): void {
        startReadModifyWriteMode()
        let buffer: Buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer.concat(data))
        stopReadModifyWriteMode()
    }

    export function read(length: number): Buffer {
        startReadModifyWriteMode()
        let buffer:  Buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer)
        let data: Buffer = pins.i2cReadBuffer(chipAdress, length, false)
        stopReadModifyWriteMode()
        return data
    }

    export function draw(new_data: Buffer): void {
        startReadModifyWriteMode()
        let buffer: Buffer = pins.createBuffer(1)
        buffer[0] = 0x40
        pins.i2cWriteBuffer(chipAdress, buffer)
        let old_data: Buffer = pins.i2cReadBuffer(chipAdress, new_data.length, false)

        old_data.toArray(NumberFormat.UInt8LE).forEach((value: number, index: number): void => {
            new_data[index] |= value
        })
        pins.i2cWriteBuffer(chipAdress, buffer.concat(new_data))
        stopReadModifyWriteMode()
    }

    export function readStatus(): State {
        let buffer: Buffer = pins.createBuffer(1)
        buffer[0] = 0x00
        pins.i2cWriteBuffer(chipAdress, buffer)

        buffer = pins.i2cReadBuffer(chipAdress, 1, false)
        let data: number = buffer.getUint8(0)
        return {
            isBusy: !!(data >> 7),
            isDisplayOn: !((data & 0x40) >> 6)
        }
    }

    export function displayOff(): void {
        command(0x0AE)
    }

    export function displayOn(): void {
        command(0x0AF)
    }

    export function setColumnAddress(address: number): void {
        address %= 132
        command(address >> 4 + 0x10)
        command(address & 0x0F)
    }

    export function normalDisplayColor(): void {
        command(0xA6)
    }

    export function inverseDisplayColor(): void {
        command(0xA7)
    }

    export function forceDisplayOn(): void {
        command(0xA5)
    }

    export function forceDisplayOff(): void {
        command(0xA4)
    }

    export function flipDisplayDirection(): void {
        command(0xC8)
    }

    export function normalDisplayDirection(): void {
        command(0xC0)
    }

    export function setVoltagePump(pumpVoltage: PumpVoltage): void {
        command(0x30 + pumpVoltage)
    }

    export function setDisplayStartLine(startLine: number): void {
        startLine %= 64
        command(0x40 + startLine)
    }

    export function setContrast(contrast: number): void {
        contrast %= 256
        command(0x81)
        command(contrast)
    }

    export function setMultiplexRation(multiplexRation: number): void {
        multiplexRation %= 64
        command(0xA8)
        command(multiplexRation)
    }

    export function setDCToDCOff(): void {
        displayOff()
        command(0xAD)
        command(0x8A)
    }

    export function setDCToDCOn(): void {
        displayOff()
        command(0xAD)
        command(0x8B)
    }

    export function setPageAddress(address: number): void {
        address %= 8
        command(0xB0 + address)
    }

    export function setDisplayOffset(offset: number): void {
        offset %= 64
        command(0xD3)
        command(offset)
    }

    export function setDisplayClock(divideRatio: number, oscillatorPercentile: OscillatorPercentile): void {
        divideRatio %= 16
        command(0xD5)
        command(oscillatorPercentile << 4 + divideRatio)
    }

    export function setPreChargeDisChargePeriod(preCharge: PreCharge, disCharge: DisCharge): void {
        command(0xD9)
        command(disCharge << 4 + preCharge)
    }

    export function setCommonPadsHardwareConfiguration(padConfiguration: PadConfiguration): void {
        command(0xDA)
        command(padConfiguration)
    }

    export function setVCOMDeselectLevel(deselectLevel: number): void {
        deselectLevel %= 65
        command(0xDB)
        command(deselectLevel)
    }

    export function startReadModifyWriteMode(): void {
        command(0xE0)
    }

    export function stopReadModifyWriteMode(): void {
        command(0xEE)
    }

    export function normalSegmentRemaping(): void {
        command(0xA0)
    }

    export function reverseSegmentRemaping(): void {
        command(0xA1)
    }
}
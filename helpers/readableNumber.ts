import numbro from "numbro"

export function readableNumber(num: number): string {
    if(num < 1000) return num.toFixed(0)

    return numbro(num).format({
        average: true,
        mantissa: 1
    })
}
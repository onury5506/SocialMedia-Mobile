export function getCharacterLength(str:string) {
    return [...str].length;
}

export function subString(str:string, start:number, end:number) {
    return [...str].slice(start, end).join('');
}
import { isUndefined } from 'lodash';

export function json(first: any) { return JSON.stringify(first) }
export function encodeURI(first: any): string { return encodeURI(isUndefined(first) ? "" : encodeURI(first)) }
export function add() {
    var args = Array.from(arguments).splice(0, arguments.length - 1)
    return args.reduce((p, c) => p + c, typeof (args[0]) === "number" ? 0 : "")
}
export function or() {
    return (
        Array.from(arguments)
            .splice(0, arguments.length - 1)
            .find(function (i) {
                return !!i;
            }) || arguments[arguments.length - 2]
    );
}
export function and() {
    let i, j, out, ref;
    out = arguments[0];
    for (i = j = 1, ref = arguments.length - 1; j < ref; i = j += 1) {
        out = out && arguments[i];
        if (!out) {
            return out;
        }
    }
    return out;
}
export function eq(v1: any, v2: any) {
    return v1 === v2;
}
export function isArrayEmpty(lst: [any]) {
    if (!lst || !lst.length) return true
    return false
}
export function toFixed(precision: number, val: any) {
    val = parseFloat(val);
    if (isNaN(val)) return "";
    return (+(Math.round(+(val + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}
process.env.CONSOLE_LOG_JSON_NO_NEW_LINE_CHARACTERS="true";
//import { LoggerAdaptToConsole } from "console-log-json";
//if(process.env.NODE_ENV !== "development"){
//    LoggerAdaptToConsole()
//}

interface Logger {
    error: (text: string, ...args: any[]) => void;
    warn: (text: string, ...args: any[]) => void;
    info: (text: string, ...args: any[]) => void;
}

export function initLogger(prefix: string): Logger {
    prefix = `[${prefix.split('/dist/')[1]}]`
    return {
        error(text: string) {
            var args = Array.from(arguments)
            //args.shift()
            //args.unshift(`${(new Date()).toISOString()} error [${prefix}] ${text}`)
            args.unshift(prefix)
            console.error.apply(console, args as any)
        },
        warn(text: string) {
            var args = Array.from(arguments)
            //args.shift()
            //args.unshift(`${(new Date()).toISOString()} warn [${prefix}] ${text}`)
            args.unshift(prefix)
            console.warn.apply(console, args as any)
        },
        info(text: string, ...args: any[]) {
            var args = Array.from(arguments)
            //args.shift()
            //args.unshift(`${(new Date()).toISOString()} info [${prefix}] ${text}`)
            args.unshift(prefix)
            console.info.apply(console, args as any)
        },
    };
}

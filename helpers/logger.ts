interface Logger {
    error: (text: string, ...args: any[]) => void;
    warn: (text: string, ...args: any[]) => void;
    info: (text: string, ...args: any[]) => void;
}

export function initLogger(prefix: string): Logger {
    return {
        error(text: string) {
            var args = Array.from(arguments)
            args.shift()
            args.unshift(`${(new Date()).toISOString()} error [${prefix}] ${text}`)
            console.error.apply(console, args as any)
        },
        warn(text: string) {
            var args = Array.from(arguments)
            args.shift()
            args.unshift(`${(new Date()).toISOString()} warn [${prefix}] ${text}`)
            console.warn.apply(console, args as any)
        },
        info(text: string, ...args: any[]) {
            var args = Array.from(arguments)
            args.shift()
            args.unshift(`${(new Date()).toISOString()} info [${prefix}] ${text}`)
            console.info.apply(console, args as any)
        },
    };
}


var NULL_LOGGER = () => { };
var DEFAULT_LOGGER = console.log;

var logger: (msg: string) => void = DEFAULT_LOGGER;

export function log(...s: any[]) {
    logger(s.join(''));
}

export declare var enabled: boolean;
Object.defineProperty(exports, 'enabled', {
    set: enabled => {
        logger = enabled ? DEFAULT_LOGGER : NULL_LOGGER
    }
});


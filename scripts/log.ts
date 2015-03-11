
var NULL_LOGGER = () => { };
var DEFAULT_LOGGER = console.log;

var logger: (msg: string) => void = DEFAULT_LOGGER;

interface Log {
    (...s: any[]): void;
    enabled: boolean;
}

var log = (...s: any[]): void => {
    logger(s.join(''));
}

Object.defineProperty(log, 'enabled', {
    set: enabled => {
        logger = enabled ? DEFAULT_LOGGER : NULL_LOGGER;
    }
});

var casted = <Log>log;
export = casted;
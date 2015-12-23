
const NULL_LOGGER = () => { /* do nothing */ };
const DEFAULT_LOGGER = console.log;

let logger: (msg: string) => void = DEFAULT_LOGGER;

interface Log {
    (...s: any[]): void;
    enabled: boolean;
}

const log = (...s: any[]): void => {
    logger(s.join(''));
};

Object.defineProperty(log, 'enabled', {
    set: enabled => {
        logger = enabled ? DEFAULT_LOGGER : NULL_LOGGER;
    }
});

const casted = <Log>log;
export = casted;
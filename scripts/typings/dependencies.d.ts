declare module 'icy' {
    export interface Metadata {
        StreamTitle?: string;
    }

    export function get(url: string, response: any): void;
    export function parse(data: any): Metadata;
}

declare module 'sanitize-filename' {
    function sanitize(name: string): string;
    export = sanitize;
}

declare module 'ffmetadata' {
    export interface Options {
        'id3v2.3'?: boolean;
    }

    export function write(file: string, data: any, opts: Options, callback: (err: Error) => void): any;
}

declare module 'playlist-parser' {
    export interface Track {
        file: string;
    }
    export interface Parser {
        parse(data: string): Track[];
    }
    export var PLS: Parser;
    export var M3U: Parser;
}

declare module 'homedir' {
    function get(user?: string): string;
    export = get;
}
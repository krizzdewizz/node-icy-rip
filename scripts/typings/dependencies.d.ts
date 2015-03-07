declare module 'icecast' {
    export function get(icyUrl: string, res: any): void;
    export function parse(s: any): any;
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
}


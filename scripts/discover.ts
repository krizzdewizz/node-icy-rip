const http = require('./follow-redirects').http;
import parsers = require('playlist-parser');

export interface Callback {
    (url: string, err?: Error): void;
}

export function discoverIcyUrl(url: string, callback: Callback): void {
    tryPlaylist(url, (icyUrl: string, err: Error) => {
        const req = http.get(icyUrl, (res: any) => {
            req.abort();
            callback(http.lastRedirectUrl || icyUrl);
        });

        req.on('error', err => {
            if (err.code === 'HPE_INVALID_CONSTANT') { // thrown by node http because of ICY response -> assume found
                callback(icyUrl);
            } else {
                callback(url, err);
            }
        });
    });
}

function parserFromContentType(contentType: string): parsers.Parser {
    if (contentType.indexOf('pls') >= 0) {
        return parsers.PLS;
    } else if (contentType.indexOf('m3u') >= 0 || contentType.indexOf('audio/x-mpegurl') >= 0) {
        return parsers.M3U;
    } else {
        return undefined;
    }
}

function tryPlaylist(url: string, callback: Callback): void {

    const req = http.get(url, (response: any) => {
        const contentType: string = response.headers['content-type'] || '';
        const parser = parserFromContentType(contentType);
        if (!parser) {
            callback(url); // not a known playlist.
            req.abort();
            return;
        }

        let buf = '';
        response.on('data', (data: string) => {
            buf += data;
        });

        response.on('end', () => {
            const playlist = parser.parse(buf);
            if (playlist && playlist[0] && playlist[0].file) {
                callback(playlist[0].file);
            } else {
                callback(url, new Error('no file in pls.'));
            }
        });

        response.on('error', (err: Error) => {
            callback(url, err);
        });
    });

    req.on('error', (err: Error) => {
        callback(url, new Error('not a pls (' + err + ')'));
    });
}

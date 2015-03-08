var http = require('./follow-redirects').http;
import parsers = require('playlist-parser');

export interface Callback {
    (url: string, err?: Error): void;
}

export function discoverIcyUrl(url: string, callback: Callback): void {
    __get(url,(icyUrl: string, err: Error) => {
        var req = http.get(icyUrl,(res: any) => {
            req.abort();
            callback(http.lastRedirectUrl || icyUrl);
        });

        req.on('error',(err: Error) => {
            if (err['code'] === 'HPE_INVALID_CONSTANT') {
                callback(icyUrl);
            } else {
                callback(url, err);
            }
        });
    });
}

function __get(url: string, callback: Callback): void {

    var req = http.get(url,(response: any) => {
        var contentType: string = response.headers['content-type'] || '';
        if (contentType.indexOf('pls') == 0) {
            callback(url); // not a pls.
            return;
        }

        var buf = '';
        response.on('data',(data: string) => {
            buf += data;
        });

        response.on('end',() => {
            var playlist = parsers.PLS.parse(buf);
            if (playlist && playlist[0] && playlist[0].file) {
                callback(playlist[0].file);
            } else {
                callback(url, new Error('no file in pls.'));
            }
        });

        response.on('error',(err: Error) => {
            callback(url, err);
        });
    });

    req.on('error',(err: Error) => {
        callback(url, new Error('not a pls (' + err + ')'));
    });
}

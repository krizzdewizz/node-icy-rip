import http = require('http');
var parsers = require('playlist-parser');

export interface Callback {
    (url: string, err?: Error): void;
}

export function get(url: string, callback: Callback): void {

    var req = http.get(url,(response: http.ClientResponse) => {
        var contentType: string = response.headers['content-type'] || '';
        if (contentType.indexOf('pls') == 0) {
            callback(url, new Error('not a pls.'));
            return;
        }

        var buf = '';
        response.on('data',(data: string) => {
            buf += data;
        });

        response.on('end',() => {
            var playlist: any[] = parsers.PLS.parse(buf);
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

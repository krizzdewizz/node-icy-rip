import parsers = require('playlist-parser');
var http = require('../follow-redirects').http;

var callback = (url, err?) => {
    console.log('uuuuuuu=' + url + ', e='+err);
};

var url = 'http://yp.shoutcast.com/sbin/tunein-station.m3u?id=175821';

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



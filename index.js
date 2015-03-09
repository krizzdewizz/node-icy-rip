var icy = require('./scripts/icy');
var path = require('path');
icy.main({
    //url: 'http://85.25.86.69:8000', // icecast stream
//    url: 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=709809', // with redirects
    url: 'http://yp.shoutcast.com/sbin/tunein-station.m3u?id=175821', // m3u
    outputFolder: path.join(__dirname, 'recordings')
});

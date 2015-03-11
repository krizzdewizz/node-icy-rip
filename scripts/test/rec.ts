import path = require('path');
import icy = require('../icy');

icy.main({
    //url: 'http://85.25.86.69:8000', // icecast stream
    url: 'http://173.193.14.170:9008', // airlesss
    //    url: 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=709809', // with redirects
    //url: 'http://yp.shoutcast.com/sbin/tunein-station.m3u?id=175821', // m3u
    outputFolder: path.join(process.cwd(), 'recordings'),
    teeToStdout: false
});

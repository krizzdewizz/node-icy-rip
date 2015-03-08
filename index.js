var icy = require('./scripts/icy');
var path = require('path');
icy.main({
    url: 'http://85.25.86.69:8000', // icecast stream
//    url: 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=709809', // with redirects
    outputFolder: path.join(__dirname, 'recordings')
});


function repeat(s, times) {
    var all = '';
    for (var i = 0; i < times; i++) {
        all += s;
    }
    return all;
}

var counter = 0;
var lastLen = 0;
function progress(fileName, length) {
    counter++;
    var n = length * 0.007 + counter;
    
    var msg = fileName + repeat('.', n);
    var back = repeat('\b', lastLen);
    
    counter = counter % 10;
    
    var q = String.fromCharCode(27) + '[2K' + back;
    
    process.stdout.write(q);
    process.stdout.write(msg);

    lastLen = msg.length;
}


setInterval(function () {
    progress('aaaa', 1000);
}, 500);
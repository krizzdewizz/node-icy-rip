
function repeat(s: string, times: number): string {
    var all = '';
    for (var i = 0; i < times; i++) {
        all += s;
    }
    return all;
}

var ERASE = String.fromCharCode(27) + '[2K';
var counter = 1;
var lastLineLength = 0;
var reverse = false;

export function task(msg: string): void {

    var back = ERASE + repeat('\b', lastLineLength);
    var line = msg + ' ' + repeat('.', counter);

    process.stdout.write(back);
    process.stdout.write(line);

    counter += reverse ? -1 : 1;
    if (counter > 20 || counter < 1) {
        reverse = !reverse;
    }

    lastLineLength = line.length;
}

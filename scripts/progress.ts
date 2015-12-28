
function repeat(s: string, times: number): string {
    let all = '';
    for (let i = 0; i < times; i++) {
        all += s;
    }
    return all;
}

const ERASE = String.fromCharCode(27) + '[2K';
let counter = 1;
let lastLineLength = 0;
let reverse = false;

export function task(msg: string): void {

    const back = ERASE + repeat('\b', lastLineLength);
    const line = msg + ' ' + repeat('.', counter);

    process.stdout.write(back);
    process.stdout.write(line);

    counter += reverse ? -1 : 1;
    if (counter > 20 || counter < 1) {
        reverse = !reverse;
    }

    lastLineLength = line.length;
}

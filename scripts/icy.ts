import icecast = require('icecast');
import fs = require('fs');
import path = require('path');
import output = require('./output');
import discover = require('./discover');
import progress = require('./progress');
import log = require('./log');

export interface Args {
    url: string;
    outputFolder: string;
    teeToStdout: boolean;
}

export function main(args?: Args) {
    args = args || parseProcessArgs();

    if (!args) {
        log.log('Usage: icy-rip <url> [optional output folder][-t writes audio data to stdout]');
        return;
    }

    var terminate = false;
    var sigInts = 0;
    var teeToStdout = args.teeToStdout;
    var doNothing = () => { };
    var writeToStdout: (data: any) => void = teeToStdout ? data => process.stdout.write(data) : doNothing;
    var progressTask: (msg: string) => void = teeToStdout ? doNothing : progress.task;

    if (teeToStdout) {
        process.stdout.on('error', doNothing);
    }

    log.enabled = !teeToStdout;

    fixMaxEventListenersWarning();

    process.on('SIGINT',() => {
        terminate = true;
        log.log('\nWriting last packet before terminating.\n');
        if (sigInts++ > 3) {
            process.exit();
        }
    });

    discover.discoverIcyUrl(args.url,(icyUrl, err) => {

        if (err) {
            log.log('Discover says: ' + err);
        }

        icecast.get(icyUrl,(res: any) => {

            log.log('Recording from ' + icyUrl);
            log.log(formatHeaders(res.headers));

            var genre = res.headers['icy-genre'] || '';
            var album = res.headers['icy-name'] || '';

            var outFile: output.File;

            res.on('metadata', function (metadata: any) { // do not => 
                var meta = icecast.parse(metadata);
                var newTitle = meta.StreamTitle;
                var trackNumberOffset = 0;
                if (outFile && outFile.streamTitle !== newTitle) {
                    if (outFile.isInitialFileWithoutMetadata) {
                        outFile.deleteOnClose = true;
                        trackNumberOffset = -1;
                    }
                    outFile.close();
                    outFile = undefined;
                }

                if (!outFile) {
                    outFile = new output.File(args.outputFolder, trackNumberOffset, album, genre, newTitle);
                }
            });

            res.on('data',(data: Buffer) => {

                if (!outFile) {
                    outFile = new output.File(args.outputFolder, 0, album, genre, '');
                    outFile.isInitialFileWithoutMetadata = true;
                }

                progressTask(outFile.fileName);

                outFile.write(data);
                writeToStdout(data);

                if (terminate) {
                    output.onFileCompleted = process.exit;
                    outFile.close();
                }
            });
        });
    });
}

interface Parsed {
    args: string[];
    tee: boolean;
}

function findTee(args: string[]): Parsed {
    var all: string[] = [];
    var tee = false;
    args.forEach(it => {
        if (it === '-t') {
            tee = true;
        } else {
            all.push(it);
        }
    });
    return { args: all, tee: tee };
}

export function parseProcessArgs(): Args {
    var parsed = findTee(process.argv);
    var args = parsed.args;
    if (args.length < 3) {
        return undefined;
    }

    var folder = args[3];
    if (!folder) {
        folder = path.join(process.cwd(), 'recordings');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }

    return { url: args[2], outputFolder: folder, teeToStdout: parsed.tee };
}

function formatHeaders(headers: any): string {
    return Object.keys(headers).map(k => k + ': ' + headers[k]).join('\n');
}

function fixMaxEventListenersWarning(): void {
    try {
        // http://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
        require('events').EventEmitter.prototype._maxListeners = 100;
    } catch (e) {
        log.log(e);
    }
}
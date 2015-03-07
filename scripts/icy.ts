///<reference path="./typings/dependencies.d.ts" />
import icecast = require('icecast');
import http = require('http');
import fs = require('fs');
import path = require('path');
import output = require('./output');
import playlist = require('./playlist');
import progress = require('./progress');

export interface Args {
    url: string;
    outputFolder: string;
}

export function main(args?:Args) {
    args = args || parseArgs();

    if (!args) {
        console.log('usage: icy <url> <optional output folder>');
        return;
    }

    var terminate = false;
    process.on('SIGINT',() => {
        terminate = true;
    });

    playlist.get(args.url,(icyUrl, err) => {

        if (err) {
            console.log('url may not a pls. Trying to record directly from url (' + err + ')');
        }

        console.log('reading from ' + icyUrl);

        icecast.get(icyUrl,(res: http.ClientResponse) => {

            console.log('headers:', res.headers);

            var now = new Date().toISOString().slice(0, 10);
            var genre = res.headers['icy-genre'] || '';
            var album = res.headers['icy-name'] || '';
            album += ' - ' + now;

            var fileIndex = 1;
            var outFile: output.File;

            res.on('metadata', function (metadata: any) { // do not => 
                var meta = icecast.parse(metadata);
                console.log('metadata:', meta);

                var newTitle = meta['StreamTitle'];

                if (outFile && outFile.streamTitle !== newTitle) {
                    outFile.close();
                    outFile = undefined;
                }

                if (!outFile) {
                    outFile = new output.File(args.outputFolder, fileIndex, album, genre, newTitle);
                    fileIndex++;
                }
            });

            res.on('data',(data: Buffer) => {

                if (!outFile) {
                    // did not yet receive metadata
                    outFile = new output.File(args.outputFolder, 0, album, genre, '');
                }

                progress.task(outFile.fileName);

                outFile.write(data);

                if (terminate) {

                    output.onFileCompleted = process.exit;

                    outFile.close();
                }
            });
        });
    });
}

function parseArgs(): Args {
    var args = process.argv;
    if (args.length < 3) {
        return undefined;
    }

    var folder: string;
    if (args[3]) {
        folder = args[3];
    } else {
        folder = path.join(process.cwd(), 'recordings');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }

    return { url: args[2], outputFolder: folder };
}
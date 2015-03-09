import icecast = require('icecast');
import fs = require('fs');
import path = require('path');
import output = require('./output');
import discover = require('./discover');
import progress = require('./progress');

export interface Args {
    url: string;
    outputFolder: string;
}

export function main(args?: Args) {
    args = args || parseProcessArgs();

    if (!args) {
        console.log('usage: icy-rip <url> <optional output folder>');
        return;
    }

    var terminate = false;
    var sigInts = 0;
    process.on('SIGINT',() => {
        terminate = true;
        if (sigInts++ > 3) {
            process.exit();
        }
    });

    discover.discoverIcyUrl(args.url,(icyUrl, err) => {

        if (err) {
            console.log('discover says: ' + err);
        }

        console.log('recording from ' + icyUrl);

        icecast.get(icyUrl,(res: any) => {

            console.log('headers:' + JSON.stringify(res.headers));

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

function parseProcessArgs(): Args {
    var args = process.argv;
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

    return { url: args[2], outputFolder: folder };
}
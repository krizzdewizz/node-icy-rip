import fs = require('fs');
import path = require('path');
import sanitize = require('sanitize-filename');
import ffmetadata = require('ffmetadata');
import childProcess = require('child_process');
import log = require('./log');

function fixName(name: string): string {
    //log.log(name);
    return sanitize(name);
    //return name.replace(/[^a-z0-9 \-\(\)\.]/gi, '_');
}

var DELETE_SMALL_FILES = false; // may set to true when debugging
var MIN_FILE_SIZE = 1024 * 1000; // 1M

export var onFileCompleted: () => void = () => { };

var ffmpegReady = undefined;

function ffmpegTest(callback: (ok: boolean) => void): void {

    if (ffmpegReady !== undefined) {
        callback(ffmpegReady);
        return;
    }

    var cp = childProcess.spawn('ffmpeg', ['-version']);
    var ok = true;
    cp.on('error', err => {
        log.log('\'ffmpeg\' was not found. You may need to install it or ensure that it is found in the path. ID3 tagging will be disabled (' + err + ')');
        ok = false;
    });
    cp.on('close',() => {
        ffmpegReady = ok;
        callback(ok);
    });
}

export class File {
    artist: string = 'artist';
    title: string = 'track';
    isInitialFileWithoutMetadata: boolean = false;
    deleteOnClose: boolean = false;

    private file: string;
    private outStream: fs.WriteStream;
    private trackNumber: number; // starting at 1

    constructor(folder: string, trackNumberOffset: number, public album: string, public genre: string, public streamTitle: string) {
        if (streamTitle) {
            var segs = streamTitle.split('-');
            if (segs.length > 0) {
                this.artist = segs[0].trim();
            }
            if (segs.length > 1) {
                this.title = segs[1].trim();
            }
        }

        var albumFolder = path.join(folder, fixName(album));
        if (!fs.existsSync(albumFolder)) {
            fs.mkdirSync(albumFolder);
        }

        this.trackNumber = fs.readdirSync(albumFolder).length + 1 + trackNumberOffset;
        this.createStream(albumFolder);
    }

    get fileName(): string {
        return path.basename(this.file);
    }

    private createStream(folder: string): void {
        var index = 0;
        var file: string;
        do {
            file = this.getUniqueFileName(folder, index);
            index++;
        } while (fs.existsSync(file));

        this.file = file;
        this.outStream = fs.createWriteStream(file, { flags: 'w' });
        this.outStream.once('close',() => {

            if (this.deleteOnClose || DELETE_SMALL_FILES && fs.statSync(this.file).size < MIN_FILE_SIZE) {
                fs.unlinkSync(this.file);
                onFileCompleted();
            } else {
                this.writeId3Tags(err => {
                    if (err) {
                        log.log('Error writing ID3 tags: ' + err);
                    }
                    onFileCompleted();
                });
            }
        });
    }

    write(data: Buffer): void {
        this.outStream.write(data);
    }

    close(): void {
        this.outStream.close();
    }

    private writeId3Tags(callback: (err: Error) => void): void {

        ffmpegTest(ok => {
            if (!ok) {
                return;
            }

            setTimeout(() => {
                // http://wiki.multimedia.cx/index.php?title=FFmpeg_Metadata
                var data = {
                    title: this.title,
                    artist: this.artist,
                    album: this.album,
                    genre: this.genre,
                    track: this.trackNumber,
                    date: new Date().getFullYear()
                };
                ffmetadata.write(this.file, data, { 'id3v2.3': true }, callback);
            }, 800);
        });
    }

    private getUniqueFileName(folder: string, index: number): string {
        var name = [this.trackNumber, this.artist, this.title].join(' - ');
        if (index > 0) {
            name += ' (' + index + ')';
        }
        name = fixName(name) + '.mp3';
        return path.join(folder, name);
    }
}

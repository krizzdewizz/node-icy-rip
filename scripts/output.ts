import fs = require('fs');
import path = require('path');
import sanitize = require('sanitize-filename');
import ffmetadata = require('ffmetadata');
import childProcess = require('child_process');

function fixName(name: string): string {
    //console.log(name);
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

    var cp = childProcess.spawn('ffmpeg');
    var ok = true;
    cp.on('error', err => {
        console.error('\'ffmpeg\' was not found. You may need to install it or ensure that it is found in the path. ID3 tagging will be disabled (' + err + ')');
        ok = false;
    });
    cp.on('close',() => {
        ffmpegReady = ok;
        callback(ok);
    });
}

export class File {
    artist = 'artist';
    title = 'track';

    private file: string;
    private outStream: fs.WriteStream;
    private index: number;

    constructor(folder: string, public album: string, public genre: string, public streamTitle: string) {
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

        this.index = fs.readdirSync(albumFolder).length + 1;
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
        this.outStream.on('close', () => {

            if (DELETE_SMALL_FILES && fs.statSync(this.file).size < MIN_FILE_SIZE) {
                fs.unlinkSync(this.file);
                onFileCompleted();
            } else {
                this.writeId3Tags(err => {
                    if (err) {
                        console.error('error writing id3 tags: ' + err);
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
                callback(new Error('ffmpeg not found'));
                return;
            }

            // http://wiki.multimedia.cx/index.php?title=FFmpeg_Metadata
            var data = {
                artist: this.artist,
                album: this.album,
                track: this.title,
                genre: this.genre,
                year: new Date().getFullYear()
            };

            ffmetadata.write(this.file, data, { 'id3v2.3': true }, callback);
        });
    }

    private getUniqueFileName(folder: string, index: number): string {
        var name = [this.index, this.artist, this.title].join(' - ');
        if (index > 0) {
            name += ' (' + index + ')';
        }
        name = fixName(name) + '.mp3';
        return path.join(folder, name);
    }
}

# icy-rip
NodeJS CLI tool for ripping SHOUTcast/Icecast radio streams to individual audio files.

## Installation

Install with `npm`:

``` bash
$ npm install icy-rip -g
```

## Recording

``` bash
$ icy-rip <url> [optional output folder][-t]
```

Where `url` can be a SHOUTcast/Icecast stream, a PLS or M3U playlist.
if `optional output folder` is missing, files will be placed in a `recordings` folder underneath the current directory.
If `-t` is given, the raw audio data is written also to stdout, to be consumed by other programs such as `mpg123`.

``` bash
$ icy-rip http://1.2.3.4:5678 -t | mpg123 -
```

To cancel recording, press `ctrl+c`.

## ID3 tags
In order to add ID3 tags to the recorded files, `ffmpeg` must be present on the system path.

## From where to get an url?
You may want to visit the SHOUTcast website, copy the Winamp (PLS) or M3U url to the clipboard and paste it to the shell window:

![SHOUTcast directory](https://raw.githubusercontent.com/krizzdewizz/node-icy-rip/master/doc/urlsource.png)

## Settings
More settings can be configured by providing a JavaScript file/NodeJS module named `.icy-rip.js` at these locations:
- current working directory.
- user's home directory. See [here](https://www.npmjs.com/package/homedir) for locations depending to your OS.

The module exports the settings object:
```
module.exports = {

    /**
     * Filter a track from recording.
     * @param headers all headers (see console output when recording) and a 'title' property
     * @return truthy to record the track, falsy to skip the track
     */
    filter: function(headers) {
        return headers['icy-genre'].match(/ambient/gi) && headers.title.match(/prelude/gi);
    }
};

```

# icy-rip
NodeJS CLI tool for ripping SHOUTcast/Icecast radio streams to individual audio files.

Installation
------------

Install with `npm`:

``` bash
$ npm install icy-rip -g
```

Recording
---------

``` bash
$ icy-rip <url> <optional output folder>
```

Where `url` can be a SHOUTcast/Icecast stream, a PLS or M3U playlist.
if `optional output folder` is missing, files will be placed in a `recordings` folder underneath the current directory.

To cancel recording, press `ctrl+c`.

ID3 tags
--------
In order to add ID3 tags to the recorded files, <a href="https://www.ffmpeg.org" target="_blank">ffmpeg</a> must be present on the system path.

From where to get an url?
-------------------------
You may want to visit the <a href="http://shoutcast.com/" target="_blank">SHOUTcast</a> website, copy the url to the clipboard and paste it to shell window:

![SHOUTcast directory](https://raw.githubusercontent.com/krizzdewizz/node-icy-rip/master/doc/urlsource.png)
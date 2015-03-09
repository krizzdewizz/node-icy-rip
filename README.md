# icy-rip
NodeJS CLI tool for ripping SHOUTcast/Icecast radio streams to individual audio files.

Installation
------------

Install with `npm`:

``` bash
$ npm install -g icy-rip
```

Recording
---------

``` bash
$ icy-rip <url> <optional output folder>
```

Where `url` can be a SHOUTcast/Icecast stream, a PLS or M3U playlist.
if `optional output folder` is missing, files will be placed in a `recordings` folder underneath the current directory.

ID3 tags
--------
In order to add id3 tags to the recorded files, [ffmpeg](https://www.ffmpeg.org "ffmpeg") must be installed on your system.

# node-icy-rip
### NodeJS CLI tool for ripping SHOUTcast/Icecast radio streams to individual audio files.


node-icecast
============
### NodeJS module for parsing and/or injecting metadata into SHOUTcast/Icecast radio streams
[![Build Status](https://secure.travis-ci.org/TooTallNate/node-icecast.png)](http://travis-ci.org/TooTallNate/node-icecast)

asdsds

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

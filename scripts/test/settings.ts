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
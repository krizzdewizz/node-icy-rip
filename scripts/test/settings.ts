exports = {
    /**
     * Called whenever a new track is detected.
     * @param headers all 'icy-*' headers (look for 'icy-' in console output when recording) and a 'title' property
     * @return truthy to record the track, falsy to skip the track
     */
    filter: function(headers) {
        return headers['icy-genre'].match(/ambient/gi) && headers.title.match(/prelude/gi);
    }
};
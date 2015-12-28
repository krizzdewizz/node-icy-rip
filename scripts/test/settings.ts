module.exports = {

    /**
     * Filter a track from recording.
     * @param track info about the track: { title: "track title" }
     * @return truthy to record the track, falsy to skip the track
     */
    filter: function(track) {
        return track.title.match(/prelude/gi);
    }
};
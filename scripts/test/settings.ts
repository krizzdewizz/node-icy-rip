/**
 * Sample settings file.
 */
exports.filter = function(headers) {
    return headers['icy-genre'].match(/ambient/gi);
    // return headers.title.match(/prelude/gi);
};

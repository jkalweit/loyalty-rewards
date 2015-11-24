/// <reference path='./typings/tsd.d.ts' />
var fs = require('fs');
var path = require('path');
var FilePersistence = (function () {
    function FilePersistence(filename, directory) {
        if (directory === void 0) { directory = 'data'; }
        this.filename = filename;
        this.directory = directory;
    }
    FilePersistence.prototype.get = function (callback) {
        var path = this.buildFilePath();
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    callback(null);
                }
                else {
                    console.error('Failed to read ' + path + ': ' + err);
                    callback(null);
                }
            }
            else {
                callback(JSON.parse(data));
            }
        });
    };
    FilePersistence.prototype.persist = function (data) {
        var _this = this;
        var path = this.buildFilePath();
        console.log(path);
        fs.mkdir(this.directory, null, function (err) {
            if (err) {
                // ignore the error if the folder already exists
                if (err.code != 'EEXIST') {
                    console.error('Failed to create folder ' + _this.directory + ': ' + err);
                    return;
                }
            }
            fs.writeFile(path, JSON.stringify(data), function (err) {
                if (err) {
                    console.error('Failed to write ' + path + ': ' + err);
                }
            });
        });
    };
    FilePersistence.prototype.buildFilePath = function () {
        return path.join(this.directory, this.filename + '.json');
    };
    return FilePersistence;
})();
exports.FilePersistence = FilePersistence;

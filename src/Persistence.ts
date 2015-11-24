/// <reference path='./typings/tsd.d.ts' />

import fs = require('fs');
import path = require('path');

export class FilePersistence {
    filename: string;
    directory: string;

    constructor(filename: string, directory: string = 'data') {
      this.filename = filename;
      this.directory = directory;
    }

    get(callback: (data: any) => void) {
        var path = this.buildFilePath();

        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    callback(null);
                } else {
                    console.error('Failed to read ' + path + ': ' + err);
                    callback(null);
                }
            } else {
                callback(JSON.parse(data));
            }
        });
    }

    persist(data: any) {
        var path = this.buildFilePath();
        console.log(path);
        fs.mkdir(this.directory, null, (err) => {
            if (err) {
                // ignore the error if the folder already exists
                if (err.code != 'EEXIST') {
                    console.error('Failed to create folder ' + this.directory + ': ' + err);
                    return;
                }
            }

            fs.writeFile(path, JSON.stringify(data), (err) => {
                if (err) {
                    console.error('Failed to write ' + path + ': ' + err);
                }
            });
        });
    }

    buildFilePath(): string {
        return path.join(this.directory, this.filename + '.json');
    }
}

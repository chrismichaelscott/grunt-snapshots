/*
 * grunt-snapshots
 * https://github.com/llkats/grunt-snapshots
 *
 * Copyright (c) 2013 Lydia Katsamberis
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var phantom = require('phantom');

    grunt.registerMultiTask('snapshots', 'Take a screenshot of a URL', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            url: 'http://www.google.com',
            filename: 'google',
            path: 'tmp/default/screenshots',
            extension: 'png',
            timestamp: false,
            unique: false,
            width: 1024,
            height: 900,
            zoomFactor: 1,
            delay: 300
        });

        // function for generating random strings so files don't get overwritten
        var randomString = function(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        };

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        phantom.create(function(ph) {
            ph.createPage(function(page) {

                page.onError = function(msg, trace) {
                    console.log(msg);
                    trace.forEach(function(item) {
                        console.log('  ', item.file, ':', item.line);
                    });
                };

                var newID;
                if (options.unique) {
                    newID = '-' + randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                }
                else if (options.timestamp) { // timestamp option for filenames
                    newID = '-' + Date.now();
                }
                else {
                    newID = '';
                }

                var address = options.url;
                var output = options.path + '/' + options.filename + newID + '.' + options.extension;
                page.viewportSize = {
                    width: options.width,
                    height: options.height
                };

                page.zoomFactor = options.zoomFactor;

                page.open(address, function(status) {
                    if (status !== 'success') {
                        console.log('Unable to load the address!');
                        ph.exit(1);
                    }
                    else {
                        setTimeout(function() {
                            page.render(output);
                            ph.exit();
                        }, options.delay);
                    }
                });
            });
        });
    });

};

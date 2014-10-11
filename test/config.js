// Test configuration for edp-test
// Generated on Mon Sep 15 2014 14:54:44 GMT+0800 (中国标准时间)
module.exports = {

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['jasmine2', 'esl'],


    // list of files / patterns to load in the browser
    files: [
        'test/specs/**/*.js'
    ],


    // list of files to exclude
    exclude: [

    ],

    // optionally, configure the reporter
    coverageReporter: {
        // text-summary | text | html | json | teamcity | cobertura | lcov
        // lcovonly | none | teamcity
        type : 'text|html',
        dir : 'test/coverage/'
    },

    // web server port
    port: 8120,


    // enable / disable watching file and executing tests whenever any file changes
    watch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - Firefox
    // - Opera
    // - Safari
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
        'Chrome'
        // 'Firefox'
        // 'Safari',
        // 'PhantomJS'
    ],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    requireConfig: {
        baseUrl: '../src',
        paths: {}
    }
};

var fs = require('fs');
var moduleConf = __dirname + '/../module.conf';
module.exports.requireConfig.packages = JSON.parse(fs.readFileSync(moduleConf)).packages;

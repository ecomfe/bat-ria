/**
 * @file 各种钩子扩展
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var URI = require('urijs');

    function getAderArgMap() {
        var user = require('../system/user');
        var aderId = user.ader && user.ader.id
            || URI.parseQuery(document.location.search).aderId;
        return aderId ? { aderId: aderId } : {};
    }

    function activate() {
        var io = require('../io/serverIO');

        io.hooks.filterIndexUrl = function(url) {
            return URI(url).addQuery(getAderArgMap()).toString();
        };

        io.hooks.beforeRequest = function(options) {
            var url = options.url;
            var argMap = getAderArgMap();
            if (argMap) {
                options.url = URI(url).addQuery(argMap).toString();
            }
        }
    }

    return {
        activate: require('underscore').once(activate)
    };
});

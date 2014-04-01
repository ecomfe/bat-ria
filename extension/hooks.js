/**
 * @file 各种钩子扩展
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var URI = require('urijs');
    var loading = require('../ui/loading');

    var isAderRequired = true;
    function getAderArgMap() {
        if (!isAderRequired) {
            return {};
        }
        var user = require('../system/user');
        var aderId = user.ader && user.ader.id
            || URI.parseQuery(document.location.search).aderId
            || user.visitor && user.visitor.id;
        return aderId ? { aderId: aderId } : {};
    }

    function activate(opt_isAderRequired) {
        var io = require('../io/serverIO');
        isAderRequired = opt_isAderRequired !== false;

        io.hooks.filterIndexUrl = function(url) {
            return URI(url).addQuery(getAderArgMap()).toString();
        };

        io.hooks.beforeRequest = function(options) {
            var url = options.url;
            var argMap = getAderArgMap();
            if (argMap) {
                options.url = URI(url).addQuery(argMap).toString();
            }

            loading.show();
        };

        io.hooks.afterComplete = function() {
            loading.hide();
        };

        var ajax = require('er/ajax');
        ajax.hooks.beforeSend = function(xhr) {
            xhr.setRequestHeader('X-Request-By', 'ERApplication');
        };
    }

    return {
        activate: require('underscore').once(activate)
    };
});

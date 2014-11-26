/**
 * @file 各种钩子扩展
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    var uri = require('urijs');
    var loading = require('../ui/loading');

    function getAderArgMap() {
        var user = require('../system/user');
        var aderId = user.getAderId();
        return u.purify({
            aderId: aderId
        });
    }

    /**
     * 可用的钩子名称如下：
     * - SHOW_LOADING
     * - ADD_ADER_ID
     * - ADD_ER_REQUEST_HEADER
     *
     * 默认全部启用
     */
    var hooks = {
        SHOW_LOADING: true,
        ADD_ADER_ID: true,
        ADD_ER_REQUEST_HEADER: true
    };

    /**
     * 激活扩展
     *
     * @param {Object} options 需要启用的钩子扩展，默认为都启用，键名为钩子名称，键值为falsy值时禁用
     */
    function activate(options) {

        // 设定默认值
        u.extend(hooks, options);

        var io = require('../io/serverIO');

        if (hooks.ADD_ADER_ID) {
            io.hooks.filterIndexUrl = function(url) {
                return uri(url).addQuery(getAderArgMap()).toString();
            };

            var Uploader = require('../ui/Uploader');
            Uploader.prototype.filterAction = function (action) {
                var argMap = getAderArgMap();
                if (argMap) {
                    action = uri(action).addQuery(argMap).toString();
                }
                return action;
            };
        }

        io.hooks.beforeRequest = function(options) {
            if (hooks.ADD_ADER_ID) {
                var url = options.url;
                var argMap = getAderArgMap();
                if (argMap) {
                    options.url = uri(url).addQuery(argMap).toString();
                }
            }

            if (options.showLoading !== false && hooks.SHOW_LOADING) {
                loading.show();
            }

            return options;
        };

        if (hooks.SHOW_LOADING) {
            io.hooks.afterComplete = function() {
                loading.hide();
            };
        }

        if (hooks.ADD_ER_REQUEST_HEADER) {
            var ajax = require('er/ajax');
            ajax.hooks.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-Request-By', 'ERApplication');
            };
        }
    }

    return {
        activate: u.once(activate)
    };
});

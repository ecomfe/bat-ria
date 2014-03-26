/**
 * @file 请求发送器
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    var u = require('underscore');

    var io = {};

    io.hooks = {};

    var DEFAULT_SERVER_ERROR = {
        'success': 'false',
        'message': {
            'global': '服务器错误'
        }
    };

    function gotoIndex() {
        var url = '/index.html';

        if (typeof io.hooks.filterIndexUrl === 'function') {
            url = io.hooks.filterIndexUrl(url);
        }

        document.location.href = url;
    }

    function requestSuccessHandler(data) {
        if (typeof io.hooks.adaptResponse === 'function') {
            data = io.hooks.adaptResponse(data);
        }

        if (data.success !== 'true') {
            var message = data.message;
            var title;
            var content;
            var onok;
            var needAlert = true;

            if (message.global) {
                title = '系统提示';
                content = message.global;
            }
            else if (message.noSession) {
                title = '系统超时';
                content = message.noSession;
                onok = gotoIndex;
            }
            else if (typeof message.redirect !== 'undefined') {
                if (message.redirect === '') {
                    title = '登录超时';
                    content = '登录超时，请重新登录！';
                    onok = function() {
                        window.location.reload(true);
                    };
                }
                else {
                    window.location.href = message.redirect;
                    return;
                }
            }
            else if (!message.field) {
                title = '系统提示';
                content = '请求失败(未知错误)';
            }
            // field error
            else {
                needAlert = false;
            }

            if (needAlert) {
                Dialog.alert({
                    title: title,
                    content: content,
                    onok: onok
                });
            }
            if (typeof io.hooks.afterFailure === 'function') {
                io.hooks.afterFailure(message);
            }
            requestCompleteHandler(message);
            return Deferred.rejected(message);
        }
        // success
        else {
            if (typeof io.hooks.afterSuccess === 'function') {
                io.hooks.afterSuccess(data);
            }
            var result = data.page || data.result;
            requestCompleteHandler(result);
            return Deferred.resolved(result);
        }
    }

    function requestFailureHandler(data) {
        requestCompleteHandler(data);
        return requestSuccessHandler(DEFAULT_SERVER_ERROR);
    }

    function requestCompleteHandler(data) {
        if (typeof io.hooks.afterComplete === 'function') {
            io.hooks.afterComplete(data);
        }
        return data;
    }

    io.request = function(url, data, options) {
        var defaults = {
            url: url,
            data: data,
            dataType: 'json'
        };

        options = options
            ? u.defaults(options, defaults)
            : defaults;

        if (typeof io.hooks.beforeRequest === 'function') {
            io.hooks.beforeRequest(options);
        }

        return ajax.request(options)
            .then(
                requestSuccessHandler,
                requestFailureHandler
            );
    };

    io.get = function(url, data, options) {
        return this.request(url, data, {
            method: 'GET'
        });
    };

    io.post = function(url, data, options) {
        return this.request(url, data, {
            method: 'POST'
        });
    };

    // return模块
    return io;
});

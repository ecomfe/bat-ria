/**
 * @file 请求发送器
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    var u = require('underscore');
    var loc = require('../location');

    var io = {};

    /**
     * 常规请求流程中的hook如下：
     *
     * io.request(url, data, options)
     *   │
     *   ├───── io.hooks.beforeRequest(data) ───┐
     *   │                                      │
     *   │<────────────── data ─────────────────┘
     *   │
     *   ├───── io.hooks.afterResponse(data) ───┐
     *   │                                      │
     *   │<────────────── data ─────────────────┘
     *   │
     *   └─────────────────┐
     *   ┌──── success ────♦──── failure ────┐
     *   │                                   │
     *   ├─ io.hooks.afterSuccess(data) ─┐   ├─ io.hooks.afterFailure(message) ─┐
     *   │                               │   │                                  │
     *   │<──────────── data ────────────┘   │<───────────── message ───────────┘
     *   │                                   │
     *   ├───────────────────────────────────┘
     *   ●
     */
    io.hooks = {};

    /**
     * 后端返回的结果代码对应的类型
     *
     * @enum {string}
     */
    var CodeType = {
        0: 'SUCCESS',
        1: 'GLOBAL',
        2: 'FIELD',
        3: 'REDIRECT',
        4: 'NO_SESSION'
    };

    /**
     * 最小的自定义错误代码
     * 小于此代码的均保留为预定义类型，大于等于此代码作为自定义处理
     *
     * @type {number}
     */
    var MINIMAL_CUSTOM_FAIL_CODE = 100;

    var SERVER_ERROR = getGlobalError('服务器错误');
    var PARSE_ERROR = getGlobalError('数据解析失败');
    var SCHEMA_ERROR = getGlobalError('数据格式错误');
    var UNKNOWN_ERROR = getGlobalError('未知错误');

    /**
     * 生成全局错误对象
     *
     * @param {string} message 错误提示信息
     * @return {Object} 全局错误对象
     */
    function getGlobalError(message) {
        return {
            success: false,
            message: {
                global: message
            }
        };
    }

    /**
     * 适配新NMP接口返回的结果
     *
     * @param {Object} data 后端返回的数据对象
     * @return {Object} 转换过后符合前端逻辑的对象
     */
    io.prepareResponse = function (data) {
        if (typeof data.code !== 'undefined') { // 有code时认为是新版接口
            var status = CodeType[data.code];

            if (!status) {
                if (data.code < MINIMAL_CUSTOM_FAIL_CODE) { // 非预定义类型，未知错误
                    return UNKNOWN_ERROR;
                }
                else { // 自定义类型错误
                    var message = data.message || {};
                    message.code = data.code;
                    return {
                        success: false,
                        message: message
                    };
                }
            }
            else {
                if (status === 'SUCCESS') {
                    var result = {
                        success: true,
                        message: data.message,
                        result: data.result || data.page
                    };

                    return u.purify(result);
                }
                else {
                    return {
                        success: false,
                        message: data.message
                    };
                }
            }
        }
        else if (typeof data.success !== 'undefined') {
            return data;
        }
        else {
            return SCHEMA_ERROR;
        }
    };

    /**
     * 跳转到主页
     */
    function gotoIndex() {
        var url = '/index.html';

        if (typeof io.hooks.filterIndexUrl === 'function') {
            url = io.hooks.filterIndexUrl(url) || url;
        }

        loc.assign(url);
    }

    /**
     * 处理服务端响应成功的情况
     *
     * @param {Object} rawData 转换后的后端响应对象
     * @return {meta.Promise} 处理后的Promise
     */
    function requestSuccessHandler(rawData) {
        var data = io.prepareResponse(rawData);

        if (typeof io.hooks.afterResponse === 'function') {
            data = io.hooks.afterResponse(data) || data;
        }

        if ((data.success + '') !== 'true') {
            var message = data.message;
            var title;
            var content;
            var onok;
            var needAlert = true;

            if (typeof message.global !== 'undefined') {
                title = '系统提示';
                content = message.global;
            }
            else if (typeof message.noSession !== 'undefined') {
                title = '系统超时';
                content = message.noSession;
                onok = gotoIndex;
            }
            else if (typeof message.redirect !== 'undefined') {
                if (message.redirect === '') {
                    title = '登录超时';
                    content = '登录超时，请重新登录！';
                    onok = function() {
                        loc.reload(true);
                    };
                }
                else {
                    loc.assign(message.redirect);
                    return;
                }
            }
            else if (typeof message.field !== 'undefined' || typeof message.code !== 'undefined') {
                // 字段错误不需要弹窗提示，直接在表单中处理
                // 自定义错误也在后面的过程中自行处理
                needAlert = false;
            }
            else { // last resort
                title = '系统提示';
                content = '未知错误';
            }

            if (needAlert) {
                Dialog.alert(u.purify({
                    title: title,
                    content: content,
                    onok: onok
                }));
            }

            if (typeof io.hooks.afterFailure === 'function') {
                message = io.hooks.afterFailure(message) || message;
            }

            message = requestCompleteHandler(message) || message;

            return Deferred.rejected(message);
        }
        else { // 成功状态
            if (typeof io.hooks.afterSuccess === 'function') {
                data = io.hooks.afterSuccess(data) || data;
            }
            var result = data.page || data.result;
            result = requestCompleteHandler(result) || result;
            return Deferred.resolved(result);
        }
    }

    /**
     * 处理服务端响应失败的情况
     * 转换为成功响应，返回错误提示处理
     *
     * @param {meta.Promise} fakeXHR 请求的Promise
     * @return {meta.Promise} 处理后的Promise
     */
    function requestFailureHandler(fakeXHR) {
        var status = fakeXHR.status;

        var error;
        if (status < 200 || (status >= 300 && status !== 304)) { // 服务器没有正常返回
            error = SERVER_ERROR;
        }
        else {
            error = PARSE_ERROR;
        }

        return requestSuccessHandler(error);
    }

    /**
     * 处理服务端响应完成的情况
     * 不管成功失败均执行
     *
     * @param {Object|meta.Promise} data 成功时为返回的数据对象，失败时为请求Promise
     * @return {Mixed} 处理后的输入参数
     */
    function requestCompleteHandler(data) {
        if (typeof io.hooks.afterComplete === 'function') {
            data = io.hooks.afterComplete(data) || data;
        }
        return data;
    }

    /**
     * 向服务端发起请求
     *
     * @param {string} url 请求URL
     * @param {Object} data 请求参数
     * @param {Object} options 请求选项
     * @return {meta.Promise} 请求Promise
     */
    io.request = function(url, data, options) {
        var defaults = {
            url: url,
            data: data,
            dataType: 'json',
            charset: 'utf-8'
        };

        options = options
            ? u.defaults(options, defaults)
            : defaults;

        options.data = u.extend(options.data, data);

        if (typeof io.hooks.beforeRequest === 'function') {
            options = io.hooks.beforeRequest(options) || options;
        }

        return ajax.request(options)
            .then(
                requestSuccessHandler,
                requestFailureHandler
            );
    };

    /**
     * 以GET方式向服务端发起请求
     *
     * @param {string} url 请求URL
     * @param {Object} data 请求参数
     * @param {Object} options 请求选项
     * @return {meta.Promise} 请求Promise
     */
    io.get = function(url, data, options) {
        u.extend(options, {
            method: 'GET'
        });
        return this.request(url, data, options);
    };

    /**
     * 以POST方式向服务端发起请求
     *
     * @param {string} url 请求URL
     * @param {Object} data 请求参数
     * @param {Object} options 请求选项
     * @return {meta.Promise} 请求Promise
     */
    io.post = function(url, data, options) {
        u.extend(options, {
            method: 'POST'
        });
        return this.request(url, data, options);
    };

    // return模块
    return io;
});

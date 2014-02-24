/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 * 
 * @ignore
 * @file ECMA工具模块
 * @author Justineo
 */
define(
    function (require) {
        var u = require('underscore');
        var moment = require('moment');
        var io = require('./io/serverIO');
        var util = {};

        util.genRequesters = function (apiConfig) {
            var config = u.clone(apiConfig);
            u.each(config, function (url, name) {
                config[name] = function (data) {
                    return io.post(url, data);
                };
            });
            return config;
        };

        util.getTimeRange = function (beginTime, endTime, options) {

            // 只有一个参数时，认为是options
            if (arguments.length === 1) {
                options = beginTime;
            }

            var defaults = {
                inputFormat: 'YYYYMMDDHHmmss',
                outputFormat: 'Date'
            };

            options = u.defaults(options || {}, defaults);

            var begin;
            var end;

            // 解析输入，没有则使用默认时间
            if (beginTime && endTime) {
                begin = moment(beginTime, options.inputFormat);
                end = moment(endTime, options.inputFormat);
            }
            else {
                var now = moment().startOf('day');

                // 默认前七天
                begin = now.clone().subtract('days', 7);
                end = now.clone().subtract('day', 1).endOf('day');
            }

            // 处理输出
            if (options.outputFormat.toLowerCase() === 'date') {
                begin = begin.toDate();
                end = end.toDate();
            }
            else {
                begin = begin.format(options.outputFormat);
                end = end.format(options.outputFormat);
            }
            return {
                begin: begin,
                end: end
            };
        };

        util.toMap = function (list, key, opt_converter) {
            var i, item, k,
                map = {},
                converter = opt_converter;

            for (i = list.length; i--;) {
                item = list[i];
                k = item[key];
                    
                if (k != null) {
                    if (u.isFunction(converter)) {
                        var keyValue = converter(item);
                        map[keyValue.key] = keyValue.value;
                    } else if (u.isString(converter)) {
                        map[k] = item[converter];
                    } else {
                        map[k] = item;
                    }
                }
            }
            return map;
        };

        util.genListLink = function (link) {
            var defaults = {
                className: 'list-operation'
            };
            link = u.defaults(link, defaults);
            var attrs = {
                href: link.url,
                'class': link.className || 'list-operation'
            }
            if (link.target && link.target.toLowerCase() !== '_self') {
                attrs.target = link.target;
            }

            attrs = u.map(attrs, function (val, key) {
                return key + '="' + u.escape(val) + '"';
            });

            return '<a ' + attrs.join(' ') + '>'
                + u.escape(link.text) + '</a>';
        };

        util.genListCommand = function (command) {
            var defaults = {
                tagName: 'span',
                className: 'list-operation'
            };
            command = u.defaults(command, defaults);
            var attrs = {
                'class': command.className || 'list-operation',
                'data-command': command.type
            };

            if (command.index != null) {
                attrs['data-command-args'] = command.index;
            }

            attrs = u.map(attrs, function (val, key) {
                return key + '="' + u.escape(val) + '"';
            });

            var tagName = u.escape(command.tagName);
            return '<' + tagName + ' ' + attrs.join(' ') + '>'
                + u.escape(command.text) + '</' + tagName + '>';
        };

        util.genListOperations = function (operations, config) {
            config = config || {};
            var html = u.map(
                operations,
                function (operation) {
                    if (operation.url) {
                        return util.genListLink(operation);
                    }
                    else {
                        return util.genListCommand(operation);
                    }
                }
            );

            return html.join(config.separator || '<span class="list-operation-separator">|</span>');
        };

        /**
         * 下载文件
         * @param {string} url 文件地址.
         */
        util.download = function (url) {
            var divId = '__DownloadContainer__';
            var formId = '__DownloadForm__';
            var iframeId = '__DownloadIframe__';
            var tpl = [
                '<form action="${url}" method="post" id="${formId}" ',
                    'name="${formId}" target="${iframeId}"></form>',
                '<iframe src="about:blank" id="${iframeId}" name="${iframeId}">',
                '</iframe>'
            ].join('');

            function getUrlWithAderId() {
                var URI = require('urijs');
                var user = require('./system/user');
                var aderId = user.ader && user.ader.id
                    || URI.parseQuery(document.location.search).aderId;
                var query = aderId ? { aderId: aderId } : {};
                return URI(url).addQuery(query).toString();
            }

            function getDownloadContainer() {
                var div = document.getElementById(divId);
                if (!div) {
                    div = document.createElement('div'),
                    div.id = divId;
                    div.style.display = 'none';
                    document.body.appendChild(div);
                }
                return div;
            }

            var ctner = getDownloadContainer();
            var render = require('etpl').compile(tpl);
            ctner.innerHTML = render({
                url: getUrlWithAderId(url),
                formId: formId,
                iframeId: iframeId
            });
            document.getElementById(formId).submit();
        };

        return util;
    }
);

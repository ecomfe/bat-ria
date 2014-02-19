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

        util.getDisplayDuration = function (beginTime, endTime) {
            if (beginTime && endTime) {
                return {
                    begin: moment(beginTime, 'YYYYMMDD').toDate(),
                    end: moment(endTime, 'YYYYMMDD').toDate()
                };
            }

            var now = moment().startOf('day');

            // 默认前七天
            var begin = now.clone().subtract('days', 7).toDate();
            var end = now.clone().subtract('day', 1).toDate();

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

        return util;
    }
);

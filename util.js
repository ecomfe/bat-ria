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

        return util;
    }
);

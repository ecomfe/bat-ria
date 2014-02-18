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
        var io = require('./io/serverIO');
        var util = {};

        util.genRequesters = function(apiConfig) {
            var config = u.clone(apiConfig);
            u.each(config, function(url, name) {
                config[name] = function(data) {
                    return io.post(url, data);
                };
            });
            return config;
        };

        return util;
    }
);

/**
 * @file [Please input file description]
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');

    var map = {};
    /**
     * [Please input module description]
     */
    var exports = {
        get: function (key) {
            return map[key];
        },

        set: function (key, value) {
            map[key] = value;
        },

        remove: function (key) {
            delete map[key];
        },

        init: function (constants) {
            u.extend(map, constants);
        }
    };
    
    // return模块
    return exports;
});

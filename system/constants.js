/**
 * @file [Please input file description]
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    
    /**
     * [Please input module description]
     */
    var exports = {
        init: function(constants) {
            u.extend(this, constants);
        }
    };
    

    // return模块
    return exports;
});

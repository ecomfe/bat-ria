/**
 * @file [Please input file description]
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    
    /**
     * [Please input module description]
     */
    var exports = {
        init: function(session) {
            this.visitor = session.visitor;
            this.ader = session.adOwner;
        }
    };

    // return模块
    return exports;
});

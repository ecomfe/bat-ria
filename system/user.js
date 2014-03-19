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

            if (session.visitor && session.adOwner) {
                this.visitor = session.visitor;
                this.ader = session.adOwner;
            }
            else {
                this.visitor = session;
            }

        }
    };

    // return模块
    return exports;
});

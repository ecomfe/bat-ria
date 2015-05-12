/**
 * @file 403页 Action
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var Action = require('er/Action');

    /**
     * 403页 Action
     *
     * @extends er.Action
     * @constructor
     */
    var exports = {};

    exports.modelType = require('./ForbiddenModel');
    exports.viewType = require('./ForbiddenView');

    var ForbiddenAction = require('eoo').create(Action, exports);
    return ForbiddenAction;
});

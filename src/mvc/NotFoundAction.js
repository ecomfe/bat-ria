/**
 * @file 404页 Action
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var Action = require('er/Action');

    /**
     * 404页 Action
     *
     * @extends er.Action
     * @constructor
     */
    var exports = {};

    exports.modelType = require('./NotFoundModel');
    exports.viewType = require('./NotFoundView');

    var NotFoundAction = require('eoo').create(Action, exports);
    return NotFoundAction;
});

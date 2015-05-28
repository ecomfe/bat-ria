/**
 * @file 403页 View
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('../tpl!../tpl/forbidden.tpl.html');

    var View = require('er/View');

    /**
     * 403页 View
     *
     * @extends er.View
     * @constructor
     */
    var exports = {};

    /**
     * @inheritDoc
     */
    exports.template = 'TPL_forbidden';

    var ForbiddenView = require('eoo').create(View, exports);
    return ForbiddenView;
});

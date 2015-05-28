/**
 * @file 404页 View
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('../tpl!../tpl/not_found.tpl.html');

    var View = require('er/View');

    /**
     * 404页 View
     *
     * @extends er.View
     * @constructor
     */
    var exports = {};

    /**
     * @inheritDoc
     */
    exports.template = 'TPL_not_found';

    var NotFoundView = require('eoo').create(View, exports);
    return NotFoundView;
});

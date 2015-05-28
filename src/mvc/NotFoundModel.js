/**
 * @file 404页 Model
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var Model = require('er/Model');

    /**
     * 404页 Model
     *
     * @param {Object} [context] 初始化时的数据
     *
     * @constructor
     * @extends er.Model
     */
    var exports = {};

    var NotFoundModel = require('eoo').create(Model, exports);
    return NotFoundModel;
});

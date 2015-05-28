/**
 * @file 403页 Model
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var Model = require('er/Model');

    /**
     * 403页 Model
     *
     * @param {Object} [context] 初始化时的数据
     *
     * @constructor
     * @extends er.Model
     */
    var exports = {};

    var ForbiddenModel = require('eoo').create(Model, exports);
    return ForbiddenModel;
});

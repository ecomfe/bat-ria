/**
 * @file mvc模块Specs
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var UIModel = require('ef/UIModel');
    var BaseModel = require('mvc/BaseModel');
    var u = require('underscore');
    var model = new BaseModel();

    describe('`BaseModel`', function () {
        it('should be derived from `ef/UIModel`', function () {
            expect(model instanceof UIModel).toBe(true);
        });


    });
});

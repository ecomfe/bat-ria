/**
 * @file mvc模块Specs
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var Action = require('er/Action');
    var u = require('underscore');
    var BaseAction = require('mvc/BaseAction');
    var BaseModel = require('mvc/BaseModel');
    var loc = require('location');
    var action = new BaseAction();

    describe('`BaseAction`', function () {
        it('should be derived from `er/Action`', function () {
            expect(action instanceof Action).toBe(true);
        });

        describe('going back', function () {
            var ref = '#refererAction';
            var def = '#defaultAction';

            beforeEach(function () {
                spyOn(loc, 'back').and.callFake(u.noop);
                spyOn(action, 'redirect').and.callFake(u.noop);
            });

            it('should redirect correctly with referer', function () {
                action.context = {};
                action.context.referrer = ref;
                action.back();
                expect(action.redirect.calls.mostRecent().args[0]).toBe(ref);

                action.back(true);
                expect(action.redirect.calls.mostRecent().args[0]).toBe(ref);

                action.back('#defaultAction');
                expect(action.redirect.calls.mostRecent().args[0]).toBe(ref);

                action.back('#defaultAction', true);
                expect(action.redirect.calls.mostRecent().args[0]).toBe(ref);
            });

            it('should redirect correctly without referer', function () {
                action.context = {};

                action.back();
                expect(loc.back).not.toHaveBeenCalled();
                expect(action.redirect).not.toHaveBeenCalled();

                action.back(true);
                expect(loc.back).toHaveBeenCalled();

                action.back(def);
                expect(action.redirect.calls.mostRecent().args[0]).toBe(def);

                action.back(def, true);
                expect(action.redirect.calls.mostRecent().args[0]).toBe(def);
            });
        });

        describe('creating model', function () {
            it('should be able to create a model derived from BaseModel', function () {
                var model = action.createModel();
                expect(model instanceof BaseModel).toBe(true);
            });
        });
    });
});

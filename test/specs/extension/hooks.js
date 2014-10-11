/**
 * @file hooks specs
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    var URI = require('urijs');
    var loading = require('ui/loading');
    var io = require('io/serverIO');
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');

    function fakeRequest() {
        var deferred = new Deferred();
        deferred.promise.abort = function () {
            this.aborted = true;
            deferred.reject('abort');
        };
        return deferred.promise;
    }

    describe('`hooks` not activated', function () {
        beforeEach(function () {
            spyOn(ajax, 'request').and.callFake(fakeRequest);
            spyOn(loading, 'show').and.callFake(u.noop);
        });

        it('should not show loading dialog upon request', function () {
            io.request('//fakeURL');
            expect(loading.show).not.toHaveBeenCalled();
        });
    });

    describe('`hooks` activated', function () {
        require('extension/hooks').activate();

        describe('`SHOW_LOADING`', function () {
            beforeEach(function () {
                spyOn(ajax, 'request').and.callFake(fakeRequest);
                spyOn(loading, 'show').and.callFake(u.noop);
            })

            it('should show loading dialog before any server request', function () {
                io.request('//fakeURL');
                expect(loading.show).toHaveBeenCalled();
            });

            it('should be overrided if single request sets the corresponding option to false', function () {
                io.request('//fakeURL', {}, { showLoading: false })
                expect(loading.show).not.toHaveBeenCalled();
            });
        });

    });
});

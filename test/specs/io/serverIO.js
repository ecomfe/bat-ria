/**
 * @file io模块Specs
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    var u = require('underscore');
    var loc = require('location');
    var io = require('io/serverIO');

    require('extension/underscore').activate();

    function fakeRequest() {
        var deferred = new Deferred();
        deferred.promise.abort = function () {
            this.aborted = true;
            deferred.reject('abort');
        };
        return deferred.promise;
    }

    var CODE_MAP = {
        0: 'SUCCESS',
        1: 'GLOBAL',
        2: 'FIELD',
        3: 'REDIRECT',
        4: 'NO_SESSION'
    };

    function getNewNMPResponse(code, result) {
        var response = {
            code: code
        };

        if (code !== 0) { // Fail
            response.message = {};

            var messageKey = u.camelize(CODE_MAP[code] || CODE_MAP[1]);
            response.message[messageKey] = result || 'ERROR';
        }
        else {
            message =
            response.result = result || {};
        }

        return response;
    }

    beforeEach(function () {
        // global mockups
        Deferred.prototype.syncModeEnabled = true;

        spyOn(Dialog, 'alert').and.callFake(u.noop);
        Dialog.alert.calls.reset();
    });

    describe('io/serverIO', function () {

        describe('`prepareResponse` method', function () {

            it('should be a function', function () {
                expect(typeof io.prepareResponse).toBe('function');
            });

            it('should handle successful responses correctly', function () {
                var result = {
                    id: 1
                };
                var success = io.prepareResponse(getNewNMPResponse(0, result));

                expect(success).toEqual({
                    success: true,
                    result: result
                });
            });

            it('should handle predefined errors correctly', function () {

                var global = io.prepareResponse(getNewNMPResponse(1));
                expect(global).toEqual({
                    success: false,
                    message: {
                        global: 'ERROR'
                    }
                });

                var field = io.prepareResponse(getNewNMPResponse(2, {
                    id: 'ERROR'
                }));
                expect(field).toEqual({
                    success: false,
                    message: {
                        field: {
                            id: 'ERROR'
                        }
                    }
                });

                var redirect = io.prepareResponse(getNewNMPResponse(3));
                expect(redirect).toEqual({
                    success: false,
                    message: {
                        redirect: 'ERROR'
                    }
                });

                var noSession = io.prepareResponse(getNewNMPResponse(4));
                expect(noSession).toEqual({
                    success: false,
                    message: {
                        noSession: 'ERROR'
                    }
                });
            });

            it('should handle schema errors correctly', function () {
                var malformed = io.prepareResponse({
                    hello: 'world'
                });

                expect(malformed).toEqual({
                    success: false,
                    message: {
                        global: '数据格式错误'
                    }
                });
            });

            it('should handle unkown error code correctly', function () {
                var unknown = io.prepareResponse({
                    code: 42
                });

                expect(unknown).toEqual({
                    success: false,
                    message: {
                        global: '未知错误'
                    }
                });
            });

            it('should inject error code in response when custom error occurs', function () {
                var custom = io.prepareResponse({
                    code: 100,
                    message: {
                        custom: 'ERROR'
                    }
                });

                expect(custom).toEqual({
                    success: false,
                    message: {
                        custom: 'ERROR',
                        code: 100
                    }
                });
            });

        });

        describe('`request` method', function () {

            it('should be a function', function () {
                expect(typeof io.request).toBe('function');
            });

            describe('sending requests', function () {
                beforeEach(function () {
                    spyOn(ajax, 'request').and.callFake(fakeRequest);
                });

                it('should have default options including `charset` and `dataType`', function () {
                    io.request('//fakeURL', {});

                    var options = ajax.request.calls.mostRecent().args[0];
                    expect(options.charset).toBe('utf-8');
                    expect(options.dataType).toBe('json');
                });

                it('should use specified options over default ones', function () {
                    io.request('//fakeURL', {}, {
                        charset: 'gbk'
                    });

                    var options = ajax.request.calls.mostRecent().args[0];
                    expect(options.charset).toBe('gbk');
                });

                it('should call `ajax.request` with correct data option', function () {
                    var data = {
                        id: 1
                    };
                    var options = {
                        data: {
                            name: 'Steve'
                        }
                    };
                    io.request('//fakeURL', data, options);

                    var requestOptions = ajax.request.calls.mostRecent().args[0];
                    expect(options.data).toEqual({
                        id: 1,
                        name: 'Steve'
                    });
                });
            });

            describe('handling responses', function () {
                it('should handle success correctly', function (done) {
                    var result = {
                        code: 0,
                        result: {
                            id: 1
                        }
                    };

                    spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                    io.request('//fakeURL')
                        .done(function (data) {
                            expect(data).toEqual({
                                id: 1
                            });
                        })
                        .ensure(done);

                });

                describe('handling failures', function () {
                    it('should handle invalid server status correctly', function (done) {
                        var fakeXHR = {
                            status: 500
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.rejected(fakeXHR));

                        io.request('//fakeURL')
                            .fail(function (message) {
                                expect(message).toEqual({
                                    global: '服务器错误'
                                });
                            })
                            .ensure(done);
                    });

                    it('should handle parse error correctly', function (done) {
                        var fakeXHR = {
                            status: 200
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.rejected(fakeXHR));

                        io.request('//fakeURL')
                            .fail(function (message) {
                                expect(message).toEqual({
                                    global: '数据解析失败'
                                });
                            })
                            .ensure(done);
                    });

                    it('should handle global failures correctly', function (done) {
                        var message = {
                            global: '全局错误'
                        };
                        var result = {
                            code: 1,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual(message);
                                expect(Dialog.alert.calls.mostRecent().args[0]).toEqual({
                                    title: '系统提示',
                                    content: '全局错误'
                                });
                            })
                            .ensure(done);
                    });

                    it('should handle field failures correctly', function (done) {
                        var message = {
                            field: {
                                username: '用户名已经存在'
                            }
                        };
                        var result = {
                            code: 2,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual(message);
                                expect(Dialog.alert.calls.any()).toBe(false);
                            })
                            .ensure(done);
                    });

                    it('should handle redirect failures correctly (reload if no location specified)', function (done) {
                        var message = {
                            redirect: ''
                        };
                        var result = {
                            code: 3,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));
                        spyOn(loc, 'reload').and.callFake(u.noop);

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual(message);

                                var alertArg = Dialog.alert.calls.mostRecent().args[0];
                                expect(alertArg.title).toBe('登录超时');
                                expect(alertArg.content).toBe('登录超时，请重新登录！');

                                alertArg.onok();
                                expect(loc.reload).toHaveBeenCalledWith(true);
                            })
                            .ensure(done);
                    });

                    it('should handle redirect failures correctly (redirect to specified location)', function (done) {
                        var message = {
                            redirect: '//fakeURL'
                        };
                        var result = {
                            code: 3,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));
                        spyOn(loc, 'assign').and.callFake(u.noop);

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual(message);

                                var alertArg = Dialog.alert.calls.mostRecent().args[0];
                                expect(alertArg.title).toBe('登录超时');
                                expect(alertArg.content).toBe('登录超时，请重新登录！');

                                alertArg.onok();
                                expect(loc.assign).toHaveBeenCalledWith(message.redirect);
                            })
                            .ensure(done);
                    });

                    it('should handle no session failures correctly', function (done) {
                        var message = {
                            noSession: '系统超时，请重新登录！'
                        };
                        var result = {
                            code: 4,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));
                        spyOn(loc, 'assign').and.callFake(u.noop);

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual(message);

                                var alertArg = Dialog.alert.calls.mostRecent().args[0];
                                expect(alertArg.title).toBe('系统超时');
                                expect(alertArg.content).toBe('系统超时，请重新登录！');

                                alertArg.onok();
                                expect(loc.assign).toHaveBeenCalledWith('/index.html');
                            })
                            .ensure(done);
                    });

                    it('should handle custom failures correctly', function (done) {
                        var message = {
                            custom: '自定义错误'
                        };
                        var result = {
                            code: 100,
                            message: message
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg.custom).toBe('自定义错误');
                                expect(msg.code).toBe(100);
                                expect(Dialog.alert.calls.any()).toBe(false);
                            })
                            .ensure(done);
                    });

                    it('should treat other failures as unknown failures', function (done) {
                        var result = {
                            success: false,
                            message: {}
                        };

                        spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                        io.request('//fakeURL')
                            .fail(function (msg) {
                                expect(msg).toEqual({});

                                var alertArg = Dialog.alert.calls.mostRecent().args[0];
                                expect(alertArg.title).toBe('系统提示');
                                expect(alertArg.content).toBe('未知错误');
                            })
                            .ensure(done);
                    });
                });

            });
        });

        describe('shorthand request methods', function () {
            beforeEach(function () {
                spyOn(ajax, 'request').and.callFake(fakeRequest);
            });

            describe('`get` method', function () {
                it('should always called as `GET` request despite `option.method`', function () {
                    io.get('//fakeURL', {}, {
                        method: 'POST'
                    });

                    var options = ajax.request.calls.mostRecent().args[0];
                    expect(options.method).toBe('GET');
                });
            });

            describe('`post` method', function () {
                it('should always called as `POST` request despite `option.method`', function () {
                    io.post('//fakeURL', {}, {
                        method: 'GET'
                    });

                    var options = ajax.request.calls.mostRecent().args[0];
                    expect(options.method).toBe('POST');
                });
            });
        });

        describe('hooks', function () {
            it('should be able to change ajax options before request', function () {
                spyOn(ajax, 'request').and.callFake(fakeRequest);

                var before = io.hooks.beforeRequest;

                io.hooks.beforeRequest = function (options) {
                    return u.extend(options, {
                        data: {}
                    });
                };

                io.request('//fakeURL');
                expect(ajax.request.calls.mostRecent().args[0].data).toEqual({});

                io.hooks.beforeRequest = before;
            });

            it('should be able to change response data after response', function (done) {
                var result = {
                    code: 0,
                    result: {
                        id: 1
                    }
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                var after = io.hooks.afterResponse;

                io.hooks.afterResponse = function (data) {
                    return u.extend(data, {
                        success: false,
                        message: {
                            global: 'ERROR'
                        }
                    });
                };

                io.request('//fakeURL')
                    .fail(function (message) {
                        expect(message.global).toBe('ERROR');
                    })
                    .ensure(function () {
                        io.hooks.afterResponse = after;
                    })
                    .ensure(done);

            });

            it('should be able to change index location before redirecting to index', function (done) {
                var message = {
                    noSession: '系统超时，请重新登录！'
                };
                var result = {
                    code: 4,
                    message: message
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));
                spyOn(loc, 'assign').and.callFake(u.noop);

                var filter = io.hooks.filterIndexUrl;

                io.hooks.filterIndexUrl = function (url) {
                    return url + '?id=1';
                };

                io.request('//fakeURL')
                    .fail(function (msg) {
                        expect(msg).toEqual(message);

                        var alertArg = Dialog.alert.calls.mostRecent().args[0];
                        expect(alertArg.title).toBe('系统超时');
                        expect(alertArg.content).toBe('系统超时，请重新登录！');

                        alertArg.onok();
                        expect(loc.assign).toHaveBeenCalledWith('/index.html?id=1');
                    })
                    .ensure(function () {
                        io.hooks.filterIndexUrl = filter;
                    })
                    .ensure(done);
            });

            it('should be able to change data after success', function (done) {
                var result = {
                    code: 0,
                    result: {
                        id: 1
                    }
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                var after = io.hooks.afterSuccess;

                io.hooks.afterSuccess = function (data) {
                    return u.extend(data, {
                        result: {
                            id: 1024
                        }
                    });
                };

                io.request('//fakeURL')
                    .done(function (data) {
                        expect(data.id).toBe(1024);
                    })
                    .ensure(function () {
                        io.hooks.afterSuccess = after;
                    })
                    .ensure(done);

            });

            it('should be able to change message after failure', function (done) {
                var result = {
                    code: 1,
                    message: {
                        global: 'OUCH'
                    }
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                var after = io.hooks.afterFailure;

                io.hooks.afterFailure = function (message) {
                    return u.extend(message, {
                        global: 'OOPS'
                    });
                };

                io.request('//fakeURL')
                    .fail(function (message) {
                        expect(message.global).toBe('OOPS');
                    })
                    .ensure(function () {
                        io.hooks.afterFailure = after;
                    })
                    .ensure(done);
            });

            it('should be able to change result data after complete', function (done) {
                var result = {
                    code: 0,
                    result: {
                        id: 1
                    }
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                var after = io.hooks.afterComplete;

                io.hooks.afterComplete = function (data) {
                    if (data.global) {
                        return u.extend(data, {
                            global: 'OOPS'
                        });
                    }
                    else {
                        return u.extend(data, {
                            id: 1024
                        });
                    }
                };

                io.request('//fakeURL')
                    .done(function (data) {
                        expect(data.id).toBe(1024);
                    })
                    .ensure(function () {
                        io.hooks.afterComplete = after;
                    })
                    .ensure(done);
            });

           it('should be able to change result data after complete', function (done) {
                var result = {
                    code: 1,
                    message: {
                        global: 'OUCH'
                    }
                };

                spyOn(ajax, 'request').and.returnValue(Deferred.resolved(result));

                var after = io.hooks.afterComplete;

                io.hooks.afterComplete = function (data) {
                    if (data.global) {
                        return u.extend(data, {
                            global: 'OOPS'
                        });
                    }
                    else {
                        return u.extend(data, {
                            id: 1024
                        });
                    }
                };

                io.request('//fakeURL')
                    .done(function (message) {
                        expect(message.global).toBe('OOPS');
                    })
                    .ensure(function () {
                        io.hooks.afterComplete = after;
                    })
                    .ensure(done);
            });
        });
    });
});

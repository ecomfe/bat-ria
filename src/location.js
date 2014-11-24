/**
 * @file 封装window.location和window.history部分操作
 * @author Justineo
 */
define(function(require) {

    var loc = {};

    loc.assign = function (url) {
        window.location.assign(url);
    };

    loc.redirect = location.assign;

    loc.replace = function (url) {
        window.location.replace(url);
    };

    loc.reload = function (isForce) {
        window.location.reload(isForce);
    };

    loc.back = function () {
        window.history.back();
    };

    loc.forward = function () {
        window.history.forward();
    };

    loc.forward = function (step) {
        window.history.go(step);
    };

    return loc;
});

/**
 * @file 封装window.location部分操作
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

    return loc;
});

/**
 * @file 封装window.location和window.history部分操作
 * @author Justineo
 */

define(function(require) {

    var loc = {};

    /**
     * window.location.assign
     *
     * @param {string} url 跳转URL
     */
    loc.assign = function (url) {
        window.location.assign(url);
    };

    /**
     * assign 的别名
     *
     * @param {string} url 跳转URL
     */
    loc.redirect = location.assign;

    /**
     * window.location.replace
     *
     * @param {string} url 跳转URL
     */
    loc.replace = function (url) {
        window.location.replace(url);
    };

    /**
     * window.location.reload
     *
     * @param {boolean} isForce 是否强制刷新
     */
    loc.reload = function (isForce) {
        window.location.reload(isForce);
    };

    /**
     * window.history.back
     */
    loc.back = function () {
        window.history.back();
    };

    /**
     * window.history.forward
     */
    loc.forward = function () {
        window.history.forward();
    };

    /**
     * window.history.go
     *
     * @param {boolean} step 前进/后退步数
     */
    loc.go = function (step) {
        window.history.go(step);
    };

    return loc;
});

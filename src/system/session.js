/**
 * @file 会话数据暂存
 * @deprecated 请用 "../storage.js" 代替
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {

    var session = {};

    var exports = {

        /**
         * 读取会话数据
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         * @return {*} 特定的会话数据
         */
        get: function (key) {
            return session[key];
        },

        /**
         * 设置会话数据
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         * @param {*} value 会话数据的值
         */
        set: function (key, value) {
            session[key] = value;
        },

        /**
         * 测试会话是否有指定键名的内容
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         * @return {boolean} 是否包含指定的键名
         */
        has: function (key) {
            return session.hasOwnProperty(key);
        },

        /**
         * this.get
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         * @return {*} 特定的会话数据
         */
        getItem: function (key) {
            return this.get(key);
        },

        /**
         * this.set
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         * @param {*} value 会话数据的值
         */
        setItem: function (key, value) {
            this.set(key, value);
        },

        /**
         * this.removeItem
         *
         * @deprecated
         *
         * @param {string} key 会话数据的键名
         */
        removeItem: function (key) {
            this.set(key, undefined);
        },

        /**
         * this.clear
         *
         * @deprecated
         */
        clear: function () {
            session = {};
        }
    };

    // return模块
    return exports;
});

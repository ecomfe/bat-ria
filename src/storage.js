/**
 * @file 封装locStorage的操作
 * @author Chestnut
 */

define(function (require) {
    var exports = {};
    var moment = require('moment');
    var session = require('./system/session');

    /**
     * 获取对应store
     *
     * @param {string} type 存储类型
     * @return {Object|Storage} 存储器
     */
    function getStore(type) {
        var store;
        switch (type) {
            case 'local':
                store = localStorage;
                break;
            case 'session':
                store = sessionStorage;
                break;
            case 'context':
            default:
                store = session;
                break;
        }
        return store;
    }

    /**
     * storage.set
     *
     * @param {string} key 存入的key
     * @param {string} value 存入的value
     * @param {Object} options 可选配置
     * @param {string} [options.type=context] 默认context，可选local，session
     * @param {Moment|Date|string} [options.expire] 到期时间，默认无限
     */
    exports.set = function (key, value, options) {
        options = options || {};
        var store = getStore(options.type);
        var expire = options.expire;

        store.setItem(
            key,
            value
                + (expire
                    ? '|' + moment(expire).valueOf()
                    : ''
                )
        );
    };

    /**
     * storage.get
     *
     * @param {string} key 存入的key
     * @param {Object} [options] 设置
     * @param {string} [options.type=context] 默认context，可选local，session
     * @param {boolean} [options.isPop=false] 获取成功是否移除
     * @param {boolean} [options.isIgnoreExpire=false] 是否忽略过期时间
     * @return {string|null} 存在且未过期或忽略过期返回字符串，否则返回null
     */
    exports.get = function (key, options) {
        options = options || {};
        var store = getStore(options.type);

        var valueWithExpire = store.getItem(key);
        if (valueWithExpire == null) {
            // 没这个值只能直接返回，处理都做不了，不好写一起
            return null;
        }

        options = options || {};
        valueWithExpire = valueWithExpire.split(/\|([^|]+)$/);
        var value = valueWithExpire[0];
        var expire = valueWithExpire[1] && parseInt(valueWithExpire[1], 10);
        var isExpired = moment(expire).isValid() && moment().diff(moment(expire)) > 0;

        // 有值而且没过期或者不管或者没设置
        if (options.isIgnoreExpire || !expire || !isExpired) {
            options.isPop && store.removeItem(key);
            return value;
        }
        else {
            // 过期了
            store.removeItem(key);
            return null;
        }
    };

    /**
     * storage.remove 清除指定key的键值对
     *
     * @param {string} key 存入的key
     * @param {Object} options 可选配置
     * @param {string} [options.type=context] 默认context，可选local，session
     */
    exports.remove = function (key, options) {
        options = options || {};
        var store = getStore(options.type);
        store.removeItem(key);
    };

    /**
     * storage.key 获取nth个key的名字
     * 仅限local和session使用
     *
     * @param {number} nth 第几个
     * @param {Object} options 可选配置
     * @param {string} options.type 可选local，session
     * @return {string|null} nth值的key或null
     */
    exports.key = function (nth, options) {
        options = options || {};
        if (options.type === 'local') {
            return localStorage.key(nth);
        }
        else if (options.type === 'session') {
            return sessionStorage.key(nth);
        }
        else {
            return null;
        }
    };

    /**
     * storage.clear 清除指定存储器
     *
     * @param {Object} options 可选配置
     * @param {string} [options.type=context] 默认context，可选local，session
     */
    exports.clear = function (options) {
        options = options || {};
        var store = getStore(options.type);
        store.clear();
    };

    return exports;
});

/**
 * @file 用户信息模块
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {

    var u = require('underscore');
    var permission = require('er/permission');
    var URI = require('urijs');
    var auth = require('./auth');

    var DEFAULT_OPTIONS = {
        selfKey: 'visitor',
        userKey: 'adOwner',
        idKey: 'aderId'
    };

    /**
     * 用户信息模块
     */
    var exports = {
        options: DEFAULT_OPTIONS,

        mergeOptions: function (options) {
            u.extend(this.options, options);
        },

        init: function (session) {
            var options = this.options;
            if (session[options.selfKey]) {
                this.visitor = session[options.selfKey];
            }
            if (session[options.userKey]) {
                this.ader = session[options.userKey];
            }
            if (!session[options.selfKey] && !session[options.userKey]) {
                this.visitor = session;
            }

            // 如果配置了权限信息，需要初始化 `er/permission`
            var auth = this.visitor.auth;
            if (auth) {
                permission.add(u.mapObject(auth, function (value) {
                    return value !== 'none';
                }));
            }
        },

        getVisitor: function () {
            return this.visitor || null;
        },

        getVisitorId: function () {
            return this.visitor && this.visitor.id;
        },

        getAder: function () {
            return this.ader || null;
        },

        getAderId: function () {
            var idKey = this.options.idKey;
            return this.ader && this.ader.id
                || URI.parseQuery(document.location.search)[idKey];
        },

        getAderArgMap: function () {
            var id = this.getAderId();
            var args = {};
            args[this.options.idKey] = id;
            return u.purify(args);
        },

        getAuthMap: function () {
            var authMap = this.visitor && this.visitor.auth;

            return authMap || null;
        },

        getAuthType: function (authId) {
            return auth.get(authId, this.getAuthMap());
        },

        getAuth: function (authId) {
            var authType = this.getAuthType(authId);
            return {
                type: authType,
                id: authId,
                isReadOnly: authType === auth.AuthType.READONLY,
                isEditable: authType === auth.AuthType.EDITABLE,
                isVisible: authType !== auth.AuthType.NONE,
                isNone: authType === auth.AuthType.NONE
            };
        }
    };

    // return模块
    return exports;
});

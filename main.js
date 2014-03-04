/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config = require('common/config');
        var u = require('underscore');

        function activateExtensions() {
            require('./extension/hooks').activate();
            require('./extension/underscore').activate();
        }

        function initErConfigs() {
            var erConfig = require('er/config');
            erConfig.indexURL = config.index;
        }

        /**
         * 初始化系统启动
         *
         * @inner
         */
        function loadData() {
            var io = require('./io/serverIO');
            var Deferred = require('er/Deferred');

            var api = require('./util').genRequesters(config.api);

            return Deferred.all(api.user(), api.constants());
        }

        function initData(session, constants) {
            var user = require('./system/user');
            user.init(session);

            var consts = require('./system/constants');
            var localConstants = require('common/constants');
            consts.init(u.extend(localConstants, constants));
        }

        function erStart() {
            initErConfigs();

            // 启动er
            require('er').start();
        }

        function start() {
            // 先激活插件，后面的功能会使用
            activateExtensions();

            return loadData()
                .then(initData)
                .then(erStart);
        }

        return {
            start: start
        };
    }
);

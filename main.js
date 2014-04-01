/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config = require('common/config');
        var u = require('underscore');
        var util = require('ecma/util');

        function activateExtensions() {
            require('./extension/hooks').activate(config.isAderRequired);
            require('./extension/underscore').activate();
            require('./extension/ui').activate();
        }

        function initApiConfig() {
            // init api requesters
            var requesters = u.filterObject(config.api, function (path) {
                // 跳过以`/download`结尾的路径 
                return !/\/download$/.test(path);
            });
            config.api = u.extend(
                config.api,
                util.genRequesters(requesters)
            );
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
            var Deferred = require('er/Deferred');

            return Deferred.all(
                config.api.user(),
                config.api.constants()
            );
        }

        function initData(session, constants) {
            // init user
            var user = require('./system/user');
            user.init(session);

            // init constants
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

            // 对API配置进行一下封装
            initApiConfig();

            return loadData()
                .then(initData)
                .then(erStart);
        }

        return {
            start: start
        };
    }
);

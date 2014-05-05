/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config;
        var u = require('underscore');
        var util = require('./util');

        require('./extension/hooks').activate();
        require('./extension/underscore').activate();

        function initApiConfig() {
            // init api requesters
            var requesters = u.filterObject(
                config.api,
                config.isRequester || function (path) {
                    // 默认跳过以`/download`结尾的路径 
                    return !/\/download$/.test(path);
                }
            );
            config.api = u.extend(
                config.api,
                util.genRequesters(requesters)
            );
        }

        function initErConfigs() {
            var erConfig = require('er/config');
            erConfig.indexURL = config.index;
            erConfig.systemName = config.systemName;
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

        function start(riaConfig) {

            config = riaConfig;

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

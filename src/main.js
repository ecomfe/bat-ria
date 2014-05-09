/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {

        var config;
        var u = require('underscore');
        var util = require('./util');

        require('./extension/underscore').activate();
        require('./extension/hooks').activate();
        require('./extension/ui').activate();

        /**
         * 初始化API请求器
         *
         * @ignore
         */
        function initApiConfig() {
            var requesters = u.filterObject(
                config.api,
                config.isRequester || function (path) {
                    // 默认跳过以`/download`和`/upload`结尾的路径 
                    return !/\/(?:up|down)load$/.test(path);
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
         * @ignore
         */
        function loadData() {
            var Deferred = require('er/Deferred');

            return Deferred.all(
                config.api.user(),
                config.api.constants()
            );
        }

        /**
         * 默认读取用户信息和系统常量后初始化对应模块
         *
         * @ignore
         */
        function initData(session, constants) {
            // 初始化用户信息
            var user = require('./system/user');
            user.init(session);

            // 初始化系统常量
            var consts = require('./system/constants');
            var localConstants = require('common/constants');
            consts.init(u.extend(localConstants, constants));
        }

        /**
         * 启动ER
         *
         * @ignore
         */
        function init() {

            // 初始化主导航栏
            if (config.nav && config.navId) {
                require('./ui/navigator').init(config.navId, config.nav);
            }

            initErConfigs();

            // 启动er
            require('er').start();
        }

        /**
         * RIA启动入口
         *
         * @ignore
         */
        function start(riaConfig) {

            config = riaConfig;

            // 对API配置进行一下封装
            initApiConfig();

            // 读取必要信息后初始化系统
            return loadData()
                .then(initData)
                .then(init);
        }

        return {
            start: start
        };
    }
);

/**
 * @file 入口模块
 * @author Justineo(justice360@gmail.com)
 */

define(
    function (require) {
        /**
         * 引入各业务模块的Action配置
         * 如果期望添加action时工具自动配置，请保持requireConfigs名称不变
         *
         * @inner
         */
        function requireConfigs() {
            require('hello/config');
        }

        function activateExtensions() {
            require('./extension/hooks').activate();
            require('./extension/underscore').activate();
        }

        function initErConfigs() {
            var config = require('er/config');
            config.indexURL = '/hello/world';
        }
        
        // 引入各业务模块的Action配置
        requireConfigs();

        activateExtensions();

        initErConfigs();

        function start(session, constants) {

            var user = require('./system/user');
            var consts = require('./system/constants');

            user.init(session.result);
            consts.init(constants.result);

            var visitor = user.visitor;

            var ui = require('esui');
            // 这里需要手动载入控件
            require('esui/Panel');
            require('esui/Label');
            ui.init(document.body);

            var username = ui.get('username');
            username.set('text', visitor.username);
            var userPanel = ui.get('user-info');
            userPanel.show();

            // 启动er
            require('er').start();
        }


        /**
         * 初始化系统启动
         *
         * @inner
         */
        function init() {
            var io = require('./io/serverIO');
            var Deferred = require('er/Deferred');
            var loading = Deferred.all(
                io.post('/data/system/session'),
                io.post('/data/system/constants')
            );

            loading.then(start);
        }

        return {
            init: init
        };
    }
);

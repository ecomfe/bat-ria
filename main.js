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
        
        activateExtensions();

        initErConfigs();

        function start(session, constants) {

            var user = require('./system/user');
            user.init(session);

            var consts = require('./system/constants');
            var clientConsts = require('common/constants');
            consts.init(u.extend(clientConsts, constants));

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

            var api = require('./util').genRequesters(config.api);

            var loading = Deferred.all(api.user(), api.constants());

            loading.then(start);
        }

        return {
            init: init
        };
    }
);

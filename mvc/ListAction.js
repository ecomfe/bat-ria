/**
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @ignore
 * @file 列表Action基类
 * @author Justineo
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('./BaseAction');
        var util = require('er/util');
        var u = require('underscore');
        var URL = require('er/URL');

        /**
         * 列表Action基类
         *
         * @param {string} [entityName] 负责的实体名称
         * @extends BaseAction
         * @constructor
         */
        function ListAction(entityName) {
            BaseAction.apply(this, arguments);
        }

        util.inherits(ListAction, BaseAction);

        ListAction.prototype.modelType = './ListModel';

        /**
         * 进行查询
         *
         * @param {Object} args 查询参数
         */
        ListAction.prototype.performSearch = function (args) {
            // 去除默认参数值
            var defaultArgs = this.model.getDefaultArgs();
            args = u.purify(args, defaultArgs);

            var event = this.fire('search', { args: args });
            if (!event.isDefaultPrevented()) {
                this.redirectForSearch(args);
            }
        };

        /**
         * 进行查询引起的重定向操作
         *
         * @param {Object} args 查询参数
         */
        ListAction.prototype.redirectForSearch = function (args) {
            var path = this.model.get('url').getPath();
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        };

        /**
         * 获取指定页码的跳转URL
         *
         * @param {Object} page 指定的分页信息
         * @param {Object} page.pageNo 指定的页码
         * @param {Object} page.pageSize 指定的每页显示数
         * @return {string}
         */
        ListAction.prototype.getURLForPage = function (page) {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();
            
            query = u.extend(query, page);

            // 第一页省去页码参数，且如果每页数量变化，回到第一页
            // 只有pagesizechange时会有pageSize这项
            if (page.pageNo === 1 || page.pageSize) {
                query = u.omit(query, 'pageNo');
            }

            return require('er/URL').withQuery(path, query).toString();
        };

        /**
         * 查询的事件处理函数
         *
         * @param {Object} e 事件对象
         * @ignore
         */
        function search(e) {
            this.performSearch(e.args);
        }

        /**
         * 带上查询参数重新加载第1页
         *
         * @param {this} {ListAction} Action实例
         */
        function reloadWithSearchArgs() {
            var args = this.view.getSearchArgs();
            this.performSearch(args);
        }

        /**
         * 前往指定页
         *
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.page 前往的页码
         * @ignore
         */
        function forwardToPage(e) {
            var event = this.fire('pagechange', { page: e.page });
            if (!event.isDefaultPrevented()) {
                var url = this.getURLForPage({ pageNo: e.page});
                this.redirect(url);
            }
        }

        /**
         * 更新每页显示条数
         *
         * @param {mini-event.Event} e 事件对象
         * @param {number} e.pageSize 每页显示条目数
         * @ignore
         */
        function updatePageSize(e) {
            var event = this.fire('pagesizechange', { pageSize: e.pageSize });
            if (!event.isDefaultPrevented()) {
                var url = this.getURLForPage({ pageSize: e.pageSize });
                this.redirect(url);
            }
        };

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        ListAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('search', search, this);
            this.view.on('pagesizechange', updatePageSize, this);
            this.view.on('pagechange', forwardToPage, this);
        };

        /**
         * 根据布局变化重新调整自身布局
         */
        ListAction.prototype.adjustLayout = function () {
            this.view.adjustLayout();
        };
        
        return ListAction;
    }
);

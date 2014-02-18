/**
 * @file [Please Input File Description]
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    // require template
    require('tpl!ecma/tpl/list.tpl.html');

    var BaseView = require('./BaseView');
    var u = require('underscore');
    
    /**
     * [Please Input View Description]
     * 
     * @constructor
     */
    function ListView() {
        BaseView.apply(this, arguments);
    }
    
    ListView.prototype.uiProperties = {};

    ListView.prototype.uiEvents = {};

    /**
     * 收集查询参数并触发查询事件
     *
     * @param {ListView} this 当前视图实例
     * @param {mini-event.Event} e 控件事件对象
     */
    ListView.prototype.submitSearch = function (e) {
        var args = this.getSearchArgs();

        // 如果是表格排序引发的，把新的排序放进去
        if (e.type === 'sort') {
            args.orderBy = e.field.field;
            args.order = e.order;
        }

        // 总是带上每页显示数
        args.pageSize = this.get('pager').get('pageSize');

        this.fire('search', { args: args });
    };

    /**
     * 获取查询参数，默认是取`filter`表单的所有数据，加上表格的排序字段
     *
     * @return {Object}
     */
    ListView.prototype.getSearchArgs = function () {
        // 获取表单的字段
        var form = this.get('filter');
        var args = form ? form.getData() : {};
        // 加上原本的排序方向和排序字段名
        args.order = this.model.get('order');
        args.orderBy = this.model.get('orderBy');

        var keyword = this.get('keyword');
        if (keyword) {
            // 关键词去空格
            args.keyword = u.trim(keyword.getValue());
        }
        
        return args;
    };

    ListView.prototype.getPageSize = function() {
        var pager = this.get('pager');
        return pager.get('pageSize');
    };

    /**
     * 更新每页显示数
     *
     * @param {mini-event.Event} e 事件对象
     * @ignore
     */
    function updatePageSize(e) {
        var pageSize = e.target.get('pageSize');
        this.fire('pagesizechange', { pageSize: pageSize });
    }

    /**
     * 更新页码
     *
     * @param {mini-event.Event} e 事件对象
     * @ignore
     */
    function updatePageIndex(e) {
        var page = e.target.get('page');
        this.fire('pagechange', { page: page });
    }

    ListView.prototype.bindEvents = function() {
        var pager = this.get('pager');
        if (pager) {
            // 切换每页大小
            pager.on('pagesizechange', updatePageSize, this);
            pager.on('pagechange', updatePageIndex, this);
        }

        var table = this.get('table');
        if (table) {
            // 表格排序触发查询
            table.on('sort', this.submitSearch, this);
        }

        var filter = this.get('filter');
        if (filter) {
            // 多条件查询
            filter.on('submit', this.submitSearch, this);
        }

        BaseView.prototype.bindEvents.apply(this, arguments);
    };

    require('er/util').inherits(ListView, BaseView);
    return ListView;
});

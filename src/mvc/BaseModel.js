/**
 * @file 业务`Model`基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    var UIModel = require('ef/UIModel');

    /**
     * 业务`Model`基类
     *
     * @class mvc.BaseModel
     * @extends ef.UIModel
     */
    var exports = {};

    /**
     * 合并默认数据源
     *
     * @protected
     * @method mvc.BaseModel#mergeDefaultDatasource
     */
    exports.mergeDefaultDatasource = function () {
        if (!this.datasource) {
            this.datasource = this.defaultDatasource;
            return;
        }

        // 管它有没有必要，先深复制一份，这样下面就不会为各种情况纠结，
        // `datasource`大不到哪里去，深复制不影响性能
        var datasource = u.deepClone(this.datasource) || {};
        var defaultDatasource = u.deepClone(this.defaultDatasource);

        // 默认数据源可能是对象或者数组，当前的数据源也可能是对象或数组，按以下规则：
        //
        // - 默认数组 + 当前数组：将当前数组连接到默认的最后
        // - 默认数组 + 当前对象：将当前对象加到默认的最后
        // - 默认对象 + 当前数组：将默认放在数组第1个
        // - 默认对象 + 当前对象：做对象的合并
        if (u.isArray(defaultDatasource)) {
            // 默认数组 + 当前数组
            if (u.isArray(datasource)) {
                datasource = defaultDatasource.concat(datasource);
            }
            // 默认数组 + 当前对象
            else {
                datasource = defaultDatasource.push(datasource);
            }
        }
        else {
            // 默认对象 + 当前数组
            if (u.isArray(datasource)) {
                if (!u.contains(datasource, defaultDatasource)) {
                    // 其它的数据项有可能会依赖这个属性，因此需要放在最前面
                    datasource.unshift(defaultDatasource);
                }
            }
            // 默认对象 + 当前对象
            else {
                u.defaults(datasource, defaultDatasource);
            }
        }

        this.datasource = datasource;
    };

    /**
     * @override
     */
    exports.load = function () {
        this.mergeDefaultDatasource();

        return this.$super(arguments);
    };


    /**
     * api请求
     */
    exports.requesters = {};

    /**
     * 获取api请求，默认直接返回`this.requesters`
     *
     * @return {Object}
     */
    exports.getRequesters = function () {
        return this.requesters;
    };

    /**
     * 注册api，将api的名称添加`request`前缀，注册到model的属性下边
     */
    exports.registerRequester = function () {
        var me = this;
        u.each(this.requesters, function (requester, reqName) {
            me['request' + reqName.charAt(0).toUpperCase() + reqName.slice(1)] = requester;
        });
    };

    var BaseModel = require('eoo').create(UIModel, exports);
    return BaseModel;
});

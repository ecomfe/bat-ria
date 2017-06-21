/**
 * @file 表单类型`Model`基类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(function (require) {
    var BaseModel = require('./BaseModel');
    var u = require('underscore');
    var datasource = require('er/datasource');

    /**
     * 表单类型`Model`基类
     *
     * @class mvc.FormModel
     * @extends BaseModel
     */
    var exports = {};

    /**
     * 表单初始数据请求器
     *
     * @protected
     * @member mvc.FormModel#formRequester
     * @type {?function}
     */
    exports.formRequester = null;

    /**
     * 表单提交请求器
     *
     * @protected
     * @member mvc.FormModel#submitRequester
     * @type {function}
     */
    exports.submitRequester = null;

    /**
     * 默认请求参数，针对{@link mvc.FormModel#formRequester}的请求发送
     *
     * @protected
     * @member mvc.FormModel#defaultArgs
     * @type {Object}
     */
    exports.defaultArgs = {};

    /**
     * @override
     */
    exports.constructor = function () {
        this.$super(arguments);

        // 页面类型，三种取值： create、edit、detail
        // 一个规范的表单页面命名应该是以 create、edit、detail 之一结尾的，此处将这种“结尾”取出来，作为pageType
        var path = this.get('url').getPath();
        var pageType = path.slice(path.lastIndexOf('/') + 1);
        this.set('pageType', pageType);
    };

    /**
     * 获取默认请求参数，针对formData的请求发送，默认直接返回`this.defaultArgs`
     *
     * @protected
     * @method mvc.FormModel#getDefaultArgs
     * @return {Object}
     */
    exports.getDefaultArgs = function () {
        return this.defaultArgs;
    };

    /**
     * @override
     */
    exports.defaultDatasource = {
        rule: datasource.constant(require('./rule')),
        formData: {
            retrieve: function (model) {
                if (model.get('formData')) {
                    return model.get('formData');
                }
                else {
                    var formRequester = model.formRequester;
                    if (formRequester) {
                        return formRequester(model.getDefaultArgs()).fail(function () {
                            return {};
                        });
                    }
                    return {};
                }
            },
            dump: false
        }
    };

    /**
     * 获取缺省数据
     *
     * @protected
     * @method mvc.FormModel#getDefaultData
     * @return {Object}
     */
    exports.getDefaultData = function () {
        return this.get('formData');
    };

    /**
     * 获取最后提交使用的数据
     *
     * @public
     * @method mvc.FormModel#getSubmitData
     * @param {Object} formData 从表单中取得的数据
     * @return {Object} 合并后用来提交的数据
     */
    exports.getSubmitData = function (formData) {
        var data = u.extend(formData, this.getExtraData());
        data = this.prepareData(data);
        return data;
    };

    /**
     * 为表单数据附加数据(比如上传文件的url)
     *
     * @protected
     * @method mvc.FormModel#getExtraData
     * @return {Object} 附加数据
     */
    exports.getExtraData = function () {
        return {};
    };

    /**
     * 准备提交数据
     * 提交前可对所有数据进行操作，比如转换数据格式
     *
     * @protected
     * @method mvc.FormModel#prepareData
     * @param {Object} data 提交的数据
     * @return {Object} 处理完毕的数据
     */
    exports.prepareData = function (data) {
        return this.filterData(data);
    };

    /**
     * 准备提交数据
     * 提交前可对所有数据进行操作，比如转换数据格式
     *
     * @protected
     * @method mvc.FormModel#filterData
     * @deprecated v0.2.2起废弃。名字起得不好，后面使用{@link mvc.FormModel#prepareData}替代
     * @param {Object} data 提交的数据
     * @return {Object} 处理完毕的数据
     */
    exports.filterData = function (data) {
        return data;
    };

    /**
     * 表单数据是否改动过，默认未改动，取消时直接返回
     * 如果需要提示已修改请按需实现此功能
     *
     * @public
     * @method mvc.FormModel#validateSubmitData
     * @param {Object} present 新表单数据
     * @return {boolean} 是否有变动
     */
    exports.isFormDataChanged = function (present) {
        return false;
    };

    /**
     * 检验表单数据有效性，除了控件自动检测之外的逻辑可以在这里扩展
     *
     * @protected
     * @method mvc.FormModel#isFormDataChanged
     * @param {Object} submitData 提交的数据，包含extraData
     * @return {Object|true}
     *         返回object形式为
     *         {
     *             name1: message1
     *             name2: message2
     *         }
     *         的`fieldError`内容，可以触发`FormView`的`notifyErrors`
     *         返回`true`则验证通过
     */
    exports.validateSubmitData = function (submitData) {
        return true;
    };

    var FormModel = require('eoo').create(BaseModel, exports);
    return FormModel;
});

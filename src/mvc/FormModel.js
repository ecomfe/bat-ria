/**
 * @file 表单类型`Model`基类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(function (require) {
    var BaseModel = require('./BaseModel');
    var u = require('underscore');
    var util = require('er/util');
    var datasource = require('er/datasource');

    /**
     * 表单类型`Model`基类
     *
     * @extends BaseModel
     * @constructor
     */
    function FormModel() {
        BaseModel.apply(this, arguments);
    }

    util.inherits(FormModel, BaseModel);

    /**
     * 表单初始数据请求器
     *
     * @type {?function}
     */
    FormModel.prototype.formRequester = null;

    /**
     * 表单提交请求器
     *
     * @type {function}
     */
    FormModel.prototype.submitRequester = null;

    /**
     * 默认请求参数，针对formData的请求发送
     *
     * @type {Object}
     * @protected
     */
    FormModel.prototype.defaultArgs = {};

    /**
     * 获取默认请求参数，针对formData的请求发送，默认直接返回`this.defaultArgs`
     *
     * @return {Object}
     * @protected
     */
    FormModel.prototype.getDefaultArgs = function () {
        return this.defaultArgs;
    };

    /**
     * @inheritDoc
     */
    FormModel.prototype.defaultDatasource = {
        rule: datasource.constant(require('./rule')),
        formData: {
            retrieve: function (model) {
                if (model.get('formData')) {
                    return model.get('formData');
                }
                else {
                    var formRequester = model.formRequester;
                    if (formRequester) {
                        return formRequester(model.getDefaultArgs());
                    }
                    else {
                        return {};
                    }
                }
            },
            dump: false
        }
    };

    /**
     * 获取缺省数据
     *
     * @return {Object}
     */
    FormModel.prototype.getDefaultData = function () {
        return this.get('formData');
    };

    /**
     * 获取最后提交使用的数据
     *
     * @param {Object} formData 从表单中取得的数据
     * @return {Object} 合并后用来提交的数据
     */
    FormModel.prototype.getSubmitData = function (formData) {
        var data = u.extend(formData, this.getExtraData());
        data = this.filterData(data);
        return data;
    };

    /**
     * 为表单数据附加数据(比如上传文件的url)
     *
     * @return {Object} 附加数据
     */
    FormModel.prototype.getExtraData = function () {
        return {};
    };

    /**
     * 准备提交数据
     * 提交前可对所有数据进行操作，比如转换数据格式
     *
     * @param {Object} data 提交的数据
     * @return {Object} 处理完毕的数据
     */
    FormModel.prototype.prepareData = function(data) {
        return this.filterData(data);
    };

    /**
     * 准备提交数据
     * 提交前可对所有数据进行操作，比如转换数据格式
     *
     * @deprecated since v0.2.2 名字起得不好，后面使用`prepareData`替代
     * @param {Object} data 提交的数据
     * @return {Object} 处理完毕的数据
     */
    FormModel.prototype.filterData = function(data) {
        return data;
    };

    /**
     * 表单数据是否改动过，默认未改动，取消时直接返回
     * 如果需要提示已修改请按需实现此功能
     *
     * @param {Object} present 新表单数据
     * @return {boolean} 是否有变动
     */
    FormModel.prototype.isFormDataChanged = function (present) {
        return false;
    };

    /**
     * 检验表单数据有效性，除了控件自动检测之外的逻辑可以在这里扩展
     *
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
    FormModel.prototype.validateSubmitData = function (submitData) {
        return true;
    };

    return FormModel;
});

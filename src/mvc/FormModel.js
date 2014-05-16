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
                    var defaultArgs = model.defaultArgs;
                    if (formRequester) {
                        return formRequester(defaultArgs);
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
     * @return {Object}
     */
    FormModel.prototype.getSubmitData = function (formData) {
        var data = u.extend(formData, this.getExtraData());
        data = this.filterData(data);
        return data;
    };

    /**
     * 为表单数据附加数据(比如上传文件的url)
     *
     * @param {Object} 附加数据
     */
    FormModel.prototype.getExtraData = function () {
        return {};
    };

    /**
     * 过滤提交数据
     * 提交前可对所有数据进行操作，比如转换数据格式
     *
     * @param {Object} 
     */
    FormModel.prototype.filterData = function(data) {
        return data;
    };

    /**
     * 表单数据是否改动过
     *
     * @param {Object} 新表单数据
     * @return {Boolean}
     */
    FormModel.prototype.isFormDataChanged = function (present) {
        var original = this.get('formData');
        return !u.isEqual(present, original);
    };

    /**
     * 检验表单数据有效性，除了控件自动检测之外的逻辑可以在这里扩展
     *
     * @param {Object} submitData 提交的数据，包含extraData
     * @return {meta.FieldError[] | true} 
     *         {field: {name: message}}
     *         返回`true`则验证通过
     */
    FormModel.prototype.validateSubmitData = function (submitData) {
        return true;
    };

    return FormModel;
});

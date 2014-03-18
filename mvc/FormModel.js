/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 * 
 * @file FormModel基类
 * @author chestnutchen(chenli11@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var u = require('underscore');
        var util = require('er/util');
        var datasource = require('er/datasource');

        /**
         * 表单数据模型基类
         *
         * @extends BaseModel
         * @constructor
         */
        function FormModel() {
            BaseModel.apply(this, arguments);
        }

        util.inherits(FormModel, BaseModel);

        /**
         * 表单默认数据配置
         *
         * @rule 常用的校验规则
         * @formRequester 常规的缺省表单数据promise (可选)
         *
         */
        FormModel.prototype.formRequester = null;
        
        // 提交接口的promise的生成函数
        FormModel.prototype.sumbitRequester = null;

        // 默认请求参数，针对defaultFormData的请求发送
        FormModel.prototype.defaultArgs = {};

        FormModel.prototype.defaultDatasource = {
            rule: datasource.constant(require('./rule')),
            defaultFormData: {
                retrieve: function (model) {
                    if (model.get('defaultFormData')) {
                        return model.get('defaultFormData');
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
            return this.get('defaultFormData');
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
        FormModel.prototype.isFormDataChanged = function (formData) {
            var original = this.get('defaultFormData');
            return !u.isEqual( u.purify(formData, null, true), u.purify(original, null, true));
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
    }
);

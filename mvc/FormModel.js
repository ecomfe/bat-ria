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

        var datasource = require('er/datasource');
        FormModel.prototype.defaultDatasource = {
            rule: datasource.constant(require('./rule')),
            defaultFormData: {
                retrieve: function (model) {
                    var formRequester = model.formRequester;
                    if (formRequester) {
                        //var defaultParam = model.defaultParam;
                        return formRequester().then(function(data){
                            var res = data.result;
                            return res;
                        });
                    }
                    else {
                        return datasource.constant({});
                    }
                },
                dump: false
            }
        };

        /**
         * 获取缺省获取数据
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
            return data;
        };

        /**
         * 为表单数据附加数据
         *
         * @param {Object} 附加数据
         */
        FormModel.prototype.getExtraData = function () {
            return {};
        };

        /**
         * 过滤提交数据
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
            return !u.isEqual(formData, original);
        }

        /**
         * 检验表单数据有效性
         *
         * @param {Object} formData 提交的数据
         * @return {meta.FieldError[] | true} 返回`true`则验证通过，否则返回错误集合
         */
        FormModel.prototype.validateFormData = function (formData) {
            return true;
        };

        return FormModel;
    }
);

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

        /**
         * 表单缺省数据处理函数
         * 提供给需要转换key或者value换算的情况
         *
         * @param {Object} 服务器成功响应的result对象
         * @return {Object} 处理完成的数据
         */
        FormModel.prototype.manageDefaultData = function (data) {
            return data;
        }

        /**
         * 其他数据处理函数
         * 提供给需要转换key或者value换算的情况
         *
         * @param {Object} 服务器成功响应的result对象
         * @return {Object} 处理完成的数据
         */
        FormModel.prototype.manageOtherData = function (data) {
            return data;
        }

        /**
         * 其他数据的补丁函数
         * 多个请求发送会丢失key值，暂时这么打补丁把key补回来
         *
         * @param {arguments} Promise传入回调提供的参数
         * @return {arguments} Promise传入回调提供的参数
         */
        function _patchData () {
            return arguments;
        }

        /**
         * 表单默认数据配置
         * rule 常用的校验规则
         * defaultFormData 常规的缺省表单数据
         * otherData 其他补充数据(支持多接口获取)
         */
        FormModel.prototype.defaultDatasource = {
            rule: datasource.constant(require('./rule')),
            defaultFormData: {
                retrieve: function (model) {
                    var formRequester = model.formRequester;
                    if (formRequester) {
                        //var defaultParam = model.defaultParam;
                        return formRequester()
                        .then( model.manageDefaultData );
                    }
                    else {
                        return datasource.constant('');
                    }
                },
                dump: false
            },
            indirectData: [
                {
                    otherData: {
                        retrieve: function (model) {
                            var extraRequester = model.extraRequester;
                            if (extraRequester) {
                                if (typeof extraRequester == 'object') {
                                    var temp = [];
                                    u.each(extraRequester, function (api, key) {
                                        temp.push(api());
                                    });
                                    return require('er/Deferred').all(
                                        temp
                                    ).then( _patchData );
                                }
                                else {
                                    return extraRequester().then( model._patchData );
                                }
                            }
                            else {
                                return datasource.constant('');
                            }
                        },
                        dump: false
                    }
                },
                {
                    patchData: {
                        retrieve: function (model) {
                            var extraRequester = model.extraRequester;
                            if (extraRequester && typeof extraRequester == 'object') {
                                var keys = u.keys(extraRequester);
                                var indirectData = model.get('otherData');
                                patchData = u.object(keys, indirectData);

                                var otherData = model.manageOtherData(patchData);
                                model.set('otherData', otherData, {'slient': true});
                            }
                            return datasource.constant('');
                        },
                        dump: true
                    }
                }
            ]
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
            return !u.isEqual( u.purify(formData, null, true), original);
        }

        /**
         * 检验表单数据有效性
         *
         * @param {Object} submitData 提交的数据，包含extraData
         * @return {meta.FieldError[] | true} 返回`true`则验证通过，否则返回错误集合
         */
        FormModel.prototype.validateSubmitData = function (formData) {
            return true;
        };

        return FormModel;
    }
);

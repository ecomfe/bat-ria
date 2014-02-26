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
         * 提供给需要转换key或者value换算、数据间依赖计算的情况
         *
         * @param {Object} 服务器成功响应的result对象，多个请求数据则为config为key的map
         * @return {Object} 处理完成的数据
         */
        FormModel.prototype.manageDefaultData = function (data) {
            return data;
        }

        /**
         * 缺省数据的补丁函数
         * 多个请求发送会丢失key值，暂时这么打补丁把key补回来
         *
         * @param {arguments} Promise传入回调提供的参数
         * @return {arguments} Promise传入回调提供的参数
         */
        function _patchData() {
            return arguments;
        }

        /**
         * 表单默认数据配置
         *
         * @rule 常用的校验规则
         *
         * @defaultFormData 常规的缺省表单数据 (支持多接口并发) (可选)
         * 配置要求 model.formRequester {function | Object} 
         *
         * 格式：
         * function: 
         *      function () { io.request() }
         * Object:
         *      { 
         *          defaultFormData: function () { 
         *              io.request() 
         *          }, 
         *          ...
         *      }
         *
         * 若formRequester为Object，则必须（MUST）有一个key为defaultFormData
         */
        FormModel.prototype.defaultDatasource = {
            rule: datasource.constant(require('./rule')),
            indirectData: [
                {
                    defaultFormData: {
                        retrieve: function (model) {
                            var formRequester = model.formRequester;
                            if (formRequester) {
                                if (typeof formRequester == 'object') {
                                    var requests = [];
                                    u.each(formRequester, function (api, key) {
                                        requests.push(api());
                                    });
                                    return require('er/Deferred').all(
                                        requests
                                    ).then( _patchData );
                                }
                                else {
                                    return formRequester().then( model.manageDefaultData );
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
                    patch: {
                        retrieve: function (model) {
                            var formRequester = model.formRequester;
                            if (formRequester && typeof formRequester == 'object') {
                                var keys = u.keys(formRequester);
                                var indirectData = model.get('defaultFormData');
                                patchData = u.object(keys, indirectData);

                                var defaultData = model.manageDefaultData(patchData);
                                u.each(defaultData, function (data, key) {
                                    model.set( key, data, {'silent': true} );
                                })
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

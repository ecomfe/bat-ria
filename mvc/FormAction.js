/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 * 
 * @file FormAction基类
 * @author chestnutchen(chenli11@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var Deferred = require('er/Deferred');
        var BaseAction = require('./BaseAction');

        /**
         * 表单Action基类
         *
         * @extends BaseAction
         * @constructor
         */
        function FormAction() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(FormAction, BaseAction);

        FormAction.prototype.modelType = require('./FormModel');

        /**
         * 当前页面的分类，始终为`"form"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        FormAction.prototype.category = 'form';

        /**
         * 设置表单提交成功后显示的信息，如果值为`null`或`undefined`则表示不显示任何信息
         *
         * 如果该字段有内容，则系统使用该字段与提交表单后服务器返回的数据进行模板格式化，
         * 因此可以使用服务器返回的字段为占位符。模板使用`underscore.template`方法
         *
         * @type {string | false | null}
         */
        FormAction.prototype.toastMessage = '';

        /**
         * 获取表单提交成功后显示的信息
         *
         * 默认提示信息为“保存成功”
         *
         * @param {Object} result 提交后服务器端返回的信息
         * @return {string}
         */
        FormAction.prototype.getToastMessage = function (result) {
            return '保存成功';
        };

        /**
         * 处理提交数据时发生的错误，默认无行为，如验证信息显示等需要实现此方法
         *
         * @param {Object} 服务器返回的message
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        FormAction.prototype.handleSubmitError = function () {
            return true;
        };

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} result 提交成功后返回的内容
         */
        FormAction.prototype.handleSubmitResult = function (result) {
            // 默认成功后跳转回列表页
            var toast = this.getToastMessage(result);
            if (toast) {
                this.view.showToast(toast);
            }
        };

        /**
         * 执行提交成功后的跳转操作
         *
         * @param {Object} result 提交后服务器返回的数据
         */
        FormAction.prototype.redirectAfterSubmit = function (result) {
            // 默认返回列表页
            return false;
        };

        /**
         * 处理提交错误
         *
         */
        function _handleError() {
        }

        /**
         * 处理本地的验证错误
         *
         * @param {meta.FieldError[]} errors 本地验证得到的错误集合
         * @return {Mixed} 处理完后的返回值，返回对象的情况下将显示错误，
         * 其它情况认为没有本地的验证错误，将进入正常的提交流程
         */
        FormAction.prototype.handleLocalValidationErrors = function (errors) {
            var wrappedError = {
                fields: errors
            };
            this.view.notifyErrors(wrappedError);

            return wrappedError;
        };

        /**
         * 设置取消编辑时的提示信息标题
         *
         * @type {string}
         */
        FormAction.prototype.cancelConfirmTitle = '确认取消编辑';

        /**
         * 获取取消编辑时的提示信息标题
         *
         * @return {string}
         */
        FormAction.prototype.getCancelConfirmTitle = function () {
            return this.cancelConfirmTitle;
        };

        /**
         * 设置取消编辑时的提示信息内容
         *
         * @type {string}
         */
        FormAction.prototype.cancelConfirmMessage =
            '取消编辑将不保留已经填写的数据，确定继续吗？';

        /**
         * 获取取消编辑时的提示信息内容
         */
        FormAction.prototype.getCancelConfirmMessage = function () {
            return this.cancelConfirmMessage;
        };

        function _cancel() {
            var submitCancelEvent = this.fire('submitcancel');
            var handleFinishEvent = this.fire('handlefinish');

            this.view.rollbackFormData();

            if (!submitCancelEvent.isDefaultPrevented()
                && !handleFinishEvent.isDefaultPrevented()
            ) {
                this.redirectAfterCancel();
            }
        }

        /**
         * 取消编辑
         */
        FormAction.prototype.cancelEdit = function () {
            var formData = this.view.getFormData();

            if (this.model.isFormDataChanged(formData)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitConfirm(options)
                    .then(u.bind(_cancel, this));
            }
        };

        /**
         * 在取消编辑后重定向
         */
        FormAction.prototype.redirectAfterCancel = function () {
            return;
        };

        /**
         * 提交表单
         *
         * @param {object} 表单原始数据
         */
        FormAction.prototype.submit = function (formData) {
            var submitData = this.model.getSubmitData(formData);
            var localValidationResult = this.model.validateFormData(submitData);
            if (typeof localValidationResult === 'object') {
                var handleResult = this.handleLocalValidationErrors(localValidationResult);
                return Deferred.rejected(handleResult);
            }

            try {
                var submitRequester = this.model.submitRequester;
                return submitRequester(submitData)
                    .then(
                        u.bind(this.handleSubmitResult, this),
                        u.bind(_handleError, this)
                    );
            }
            catch (ex) {
                return Deferred.rejected(ex);
            }
        };

        FormAction.prototype.submitHook = function () {
            this.view.disableSubmit();
            var formData = this.view.getFormData();

            require('er/Deferred')
                .when(this.submit(formData))
                .ensure(this.view.enableSubmit());
        }

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        FormAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('submit', this.submitHook, this);
            this.view.on('cancel', this.cancelEdit, this);
        };
        
        return FormAction;
    }
);

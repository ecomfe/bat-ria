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
        var u = require('../extension/underscore');
        var Deferred = require('er/Deferred');
        var BaseAction = require('./BaseAction');
        var locator = require('er/locator');

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
            var message = this.toastMessage;
            if (message == null) {
                return '';
            }

            if (message) {
                return u.template(message, result || {});
            }
            else {
                return '保存成功';
            }
        };

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} result 提交成功后返回的内容
         */
        FormAction.prototype.handleSubmitResult = function (result) {
            var toast = this.getToastMessage(result);
            if (toast) {
                this.view.showToast(toast);
            }
            if (typeof this.redirectAfterSubmit === 'function') {
                this.redirectAfterSubmit(result);
            }
        };

        /**
         * 执行提交成功后的跳转操作
         * 在有referrer的情况下跳转至referrer
         * 在没有referrer的情况下history.back()
         *
         * 可在业务action里边重写
         *
         * @param {Object} result 提交后服务器返回的数据
         */
        FormAction.prototype.redirectAfterSubmit = function (result) {
            this.back(true);
        };

        /**
         * 处理提交错误
         *
         * @param {Object} 失败时的message对象
         */
        FormAction.prototype.handleSubmitError = function (message) {
            if (message && message.field) {
                this.view.notifyErrors(message.field);
            }
            this.view.showToast('保存失败');
        };

        /**
         * 处理本地的验证错误
         * 没有name的controls请自行扩展处理
         *
         * @param {meta.FieldError[]} errors 本地验证得到的错误集合
         * @return {Mixed} 处理完后的返回值，返回对象的情况下将显示错误
         */
        FormAction.prototype.handleLocalValidationErrors = function (errors) {
            if (typeof errors === 'object') {
                this.view.notifyErrors(errors);
                return errors;
            }
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
         *
         * @return {string}
         */
        FormAction.prototype.getCancelConfirmMessage = function () {
            return this.cancelConfirmMessage;
        };

        /**
         * 取消编辑的操作
         * TODO: 把回滚表单数据放到reset按钮的逻辑里边
         * submitcancel 回滚表单数据，使用原始数据重新填充
         * aftercancel 执行取消编辑后重定向操作
         */
        FormAction.prototype.cancel = function () {
            var submitCancelEvent = this.fire('submitcancel');

            if (!submitCancelEvent.isDefaultPrevented()) {
                this.view.rollbackFormData();
            }

            var handleFinishEvent = this.fire('aftercancel');

            if (!handleFinishEvent.isDefaultPrevented()) {
                this.redirectAfterCancel();
            }
        };

        /**
         * 取消编辑时的确认提示
         */
        FormAction.prototype.cancelEdit = function () {
            var formData = this.view.getFormData();

            if (this.model.isFormDataChanged(formData)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitConfirm(options)
                    .then(u.bind(this.cancel, this));
            }
            else {
                this.cancel();
            }
        };

        /**
         * 在取消编辑后重定向
         * 在有referrer的情况下跳转至referrer
         * 在没有referrer的情况下history.back()
         *
         * 可在业务action里边重写
         */
        FormAction.prototype.redirectAfterCancel = function () {
            this.back(true);
        };

        /**
         * 提交表单
         *
         * @param {object} 表单数据
         */
        FormAction.prototype.submit = function (submitData) {
            var localValidationResult = this.model.validateSubmitData(submitData);
            if (localValidationResult !== true) {
                var handleResult = this.handleLocalValidationErrors(localValidationResult);
                return Deferred.rejected(handleResult);
            }

            var handleBeforeSubmit = this.fire('beforesubmit');

            if (!handleBeforeSubmit.isDefaultPrevented()) {
                try {
                    var submitRequester = this.model.submitRequester;
                    return submitRequester(submitData)
                        .then(
                            u.bind(this.handleSubmitResult, this),
                            u.bind(this.handleSubmitError, this)
                        );
                }
                catch (ex) {
                    return Deferred.rejected(ex);
                }
            }
        };

        /**
         * 提交表单前锁定提交，完成提交操作后释放提交
         */
        FormAction.prototype.submitEdit = function () {
            this.view.disableSubmit();
            var formData = this.view.getFormData();
            var submitData = this.model.getSubmitData(formData);

            require('er/Deferred')
                .when(this.submit(submitData))
                .ensure(this.view.enableSubmit());
        };

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        FormAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('submit', this.submitEdit, this);
            this.view.on('cancel', this.cancelEdit, this);
        };
        
        return FormAction;
    }
);

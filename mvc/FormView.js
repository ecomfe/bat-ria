/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 * 
 * @file FormView基类
 * @author chestnutchen(chenli11@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var util = require('er/util');
        var BaseView = require('./BaseView');
        var u = require('underscore');

        // 使用表单视图，有以下要求：
        //
        // - 有id为`form`的`Form`控件
        // - 所有触发提交的按钮，会触发`form`的`submit`事件
        // 
        // 可选：
        // 
        // - 可以有一个id为`cancel`的按钮，点击后会触发`cancel`事件

        /**
         * 表单视图基类
         *
         * @extends BaseView
         * @constructor
         */
        function FormView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(FormView, BaseView);

        /**
         * 从表单中获取数据
         *
         * @return {Object}
         */
        FormView.prototype.getFormData = function () {
            var form = this.get('form');
            return form ? form.getData() : {};
        };

        /**
         * 回滚表单数据
         *
         * @param {Object} key：value形式的数据 key和input的name一一对应
         */
        FormView.prototype.rollbackFormData = function () {
            this.setFormData(this.model.getDefaultData());
        };

        /**
         * 设置表单数据
         *
         * @param {Object} key：value形式的数据 key和input的name一一对应
         */
        FormView.prototype.setFormData = function (formData) {
            var form = this.get('form');
            inputs = form.getInputControls();
            u.each(inputs, function (input, index) {
                var key = input.name;
                if (formData) {
                    if (u.has(formData, key)) {
                        input.setValue(formData[key]);
                    }
                }
            });
            this.setExtraFormData(formData);
        };

        /**
         * 设置表单额外数据
         * 这个接口提供给不是input的控件去扩展，自个玩去
         * 不知道是不是又是可以砍掉的接口
         *
         * @param {Object} key：value形式的数据 key和input的name一一对应
         */
        FormView.prototype.setExtraFormData = function (formData) {
            return;
        };

        /**
         * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
         *
         * @param {Object} errors 错误信息，每个key为控件`name`，value为`errorMessage`
         */
        FormView.prototype.notifyErrors = function (errors) {
            if (typeof errors !== 'object') {
                return;
            }

            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var form = this.get('form');

            u.each(errors, function (field, message){
                var state = new ValidityState(false, message);
                var validity = new Validity();
                validity.addState('invalid', state);

                var input = form.getInputControls(field)[0];
                if (input && typeof input.showValidity === 'function') {
                    input.showValidity(validity);
                }
            });
        };

        /**
         * 取消编辑
         */
        function cancelEdit() {
            this.fire('cancel');
        }

        /**
         * 提交数据
         */
        function submit() {
            this.fire('submit');
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        FormView.prototype.bindEvents = function () {
            var form = this.get('form');
            if (form) {
                form.on('submit', submit, this);
            }

            var cancelButton = this.get('cancel');
            if (cancelButton) {
                cancelButton.on('click', cancelEdit, this);
            }

            BaseView.prototype.bindEvents.apply(this, arguments);
        };
        
        /**
         * 禁用提交操作
         */
        FormView.prototype.disableSubmit = function () {
            if (this.viewContext) {
                this.getGroup('submit').disable();
            }
        };

        /**
         * 启用提交操作
         */
        FormView.prototype.enableSubmit = function () {
            if (this.viewContext) {
                this.getGroup('submit').enable();
            }
        };

        return FormView;
    }
);

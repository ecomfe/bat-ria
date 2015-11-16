/**
 * @file 让输入控件在特定事件下自动校验rule
 * @author feibinyang
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var Extension = require('esui/Extension');
        var InputControl = require('esui/InputControl');

        /**
         * 让输入控件在特定事件下自动校验rule
         *
         * @param {Object} [options] 配置项
         * @extends esui.Extension
         * @constructor
         */
        function AutoValidate(options) {
            options = options || {};
            if (typeof options.events === 'string') {
                options.events = u.map(
                    lib.splitTokenList(options.events),
                    lib.trim
                );
            }

            Extension.apply(this, arguments);
        }

        /**
         * 扩展的类型，始终为`"AutoValidate"`
         *
         * @type {string}
         * @override
         */
        AutoValidate.prototype.type = 'AutoValidate';

        /**
         * 指定用于提交表单的事件名称，默认为`change`和`input`事件
         *
         * @type {string[]}
         */
        AutoValidate.prototype.events = ['change', 'input'];

        /**
         * 验证rule
         *
         * @param {esui.Control} this 触发事件的控件
         * @ignore
         */
        function validate() {
            if (this.target instanceof InputControl) {
                // target是InputControl类型时，才有校验意义
                this.target.validate();
            }
            else {
                throw new Error('Current target is not a InputControl type.');
            }
        }

        /**
         * 激活扩展
         *
         * @override
         */
        AutoValidate.prototype.activate = function () {
            u.each(
                this.events,
                function (eventName) {
                    this.target.on(eventName, validate, this);
                },
                this
            );
            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消激活
         *
         * @override
         */
        AutoValidate.prototype.inactivate = function () {
            u.each(
                this.events,
                function (eventName) {
                    this.target.un(eventName, validate, this);
                },
                this
            );

            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(AutoValidate, Extension);
        require('esui').registerExtension(AutoValidate);
        return AutoValidate;
    }
);

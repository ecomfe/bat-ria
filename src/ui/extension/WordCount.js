/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 计算文本框可输入字符的扩展(包含字符数和字节数两种检查)
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var Validity = require('esui/validator/Validity');
        var Extension = require('esui/Extension');

        /**
         * 计算文本框可输入字符的扩展
         *
         * @param {Object} [options] 配置项
         * @extends esui.Extension
         * @constructor
         */
        function WordCount(options) {
            Extension.apply(this, arguments);
        }

        /**
         * 扩展的类型，始终为`"WordCount"`
         *
         * @type {string}
         * @override
         */
        WordCount.prototype.type = 'WordCount';

        /**
         * 设置未输入字符时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示可输入字符个数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @type {string}
         */
        WordCount.prototype.initialTemplate = '最多可输入${available}个${unit}';

        /**
         * 设置还可以输入字符时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示剩余字符个数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @type {string}
         */
        WordCount.prototype.remainingTemplate = '还可输入${available}个${unit}';

        /**
         * 设置已超出可输入字符限制时的提示信息模板，可用以下占位符：
         *
         * - `${available}`：表示超出的字符数
         * - `${current}`：表示已输入的字符个数
         * - `${max}`：表示最大可输入字符个数
         *
         * @type {string}
         */
        WordCount.prototype.exceededTemplate = '已超出${available}个${unit}';

        /**
         * 获取提示信息
         *
         * @param {Object} data 长度计算的相关数据
         * @param {number} data.available 还可输入的字符个数，已超出时为负数
         * @param {number} data.current 已经输入的字符个数
         * @param {number} data.max 最大可输入的字符个数
         * @return {string}
         * @protected
         */
        WordCount.prototype.getHintMessage = function (data) {
            var template;
            var unit = '字符';
            if (this.target.get('maxByteLength')) {
                unit = '字节';
            }
            data.unit = unit;
            if (!data.current) {
                template = this.initialTemplate;
            }
            else if (data.available >= 0) {
                template = this.remainingTemplate;
            }
            else {
                template = this.exceededTemplate;
                data.available = -data.available;
            }

            return lib.format(template, data);
        };

        /**
         * 获取最大可输入字符数(字节数)
         * 当控件属性中有maxByteLength为字节数检查
         * 当控件属性中有maxLength和length时为字符数检查
         *
         * @return {number}
         * @protected
         */
        WordCount.prototype.getLengths = function () {
            var target = this.target;
            var maxLength = target.get('maxByteLength') || target.get('maxLength') || target.get('length');
            var value = target.getValue();
            var currentLength = value.length;
            if (target.get('maxByteLength')) {
                // 正则来源于esui中MaxByteLengthRule.js
                // 获取当前字节数
                currentLength = value.replace(/[^\x00-\xff]/g, 'xx').length;
            }
            return {
                maxLength: maxLength,
                currentLength: currentLength
            };
        };

        /**
         * 检查长度并显示提示信息
         *
         * @ignore
         */
        function checkLength() {
            var lengths = this.getLengths();

            var data = {
                max: lengths.maxLength,
                current: lengths.currentLength,
                available: lengths.maxLength - lengths.currentLength
            };

            var validState = data.available < 0 ? 'error' : 'hint';
            var message = this.getHintMessage(data);

            var validity = new Validity();
            validity.setCustomValidState(validState);
            validity.setCustomMessage(message);

            this.target.showValidity(validity);
        }

        /**
         * 激活扩展
         *
         * @override
         */
        WordCount.prototype.activate = function () {
            var target = this.target;
            var maxLength = target.get('maxByteLength') || target.get('maxLength') || target.get('length');

            if (maxLength) {
                this.target.on('input', checkLength, this);
                this.target.on('afterrender', checkLength, this);
            }

            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消激活
         *
         * @override
         */
        WordCount.prototype.inactivate = function () {
            this.target.un('input', checkLength, this);
            this.target.un('afterrender', checkLength, this);

            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(WordCount, Extension);
        require('esui').registerExtension(WordCount);
        return WordCount;
    }
);

/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file UI组件模块扩展
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * 加载并配置验证规则
         *
         * @ignore
         */
        function initializeValidationRules() {
            // 加载所有验证规则
            var MaxLengthRule = require('esui/validator/MaxLengthRule');
            var MinLengthRule = require('esui/validator/MinLengthRule');
            var RequiredRule = require('esui/validator/RequiredRule');
            var PatternRule = require('esui/validator/PatternRule');
            var MaxRule = require('esui/validator/MaxRule');
            var MinRule = require('esui/validator/MinRule');

            RequiredRule.prototype.errorMessage = '请填写${title}';

            var INTEGER_REGEX = {
                '^\\d+$': true,
                '/^\\d+$/': true
            };
            var FLOAT_REGEX = {
                '^\\d+(\\.\\d{1,2})?$': true,
                '/^\\d+(\\.\\d{1,2})?$/': true
            };
            var NUMBER_REGEX = u.extend({}, INTEGER_REGEX, FLOAT_REGEX);

            function getRangeErrorMessage(control) {
                var min = control.get('min');
                var max = control.get('max');
                var pattern = control.get('pattern') + '';

                if (min != null && max != null
                    && NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    // 把数字变成3位一个逗号的
                    var regex = /\B(?=(\d{3})+(?!\d))/g;
                    var start = (min + '').replace(regex, ',');
                    var end = (max + '').replace(regex, ',');

                    // 根据正则选择整数或浮点数的信息
                    if (INTEGER_REGEX.hasOwnProperty(pattern)) {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的整数';
                    }
                    else {
                        return u.escape(control.get('title')) + '请填写'
                            + '≥' + start + '且≤' + end + '的数字，'
                            + '最多可保存至小数点后两位';
                    }
                }
                else {
                    return null;
                }
            }

            var Rule = require('esui/validator/Rule');

            MaxLengthRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            MinLengthRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };
            
            MaxRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            MinRule.prototype.getErrorMessage = function (control) {
                if (control.get('maxErrorMessage')) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };

            PatternRule.prototype.getErrorMessage = function (control) {
                var pattern = control.get('pattern') + '';
                if (control.get('patternErrorMessage')
                    || !NUMBER_REGEX.hasOwnProperty(pattern)
                ) {
                    var getErrorMessage = Rule.prototype.getErrorMessage;
                    getErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return Rule.prototype.getErrorMessage.apply(this, arguments);
            };
        }

        /**
         * 为几个控件添加链接模式的内容模板
         *
         * @ignore
         */
        function addControlLinkMode() {
            var CommandMenu = require('esui/CommandMenu');

            CommandMenu.prototype.linkTemplate =
                '<a target="${target}" href="${href}">${text}</a>';

            CommandMenu.prototype.getItemHTML = function (item) {
                var data = {
                    text: lib.encodeHTML(item.text),
                    href: item.href && lib.encodeHTML(item.href),
                    target: item.target || '_self'
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.itemTemplate;
                return lib.format(template, data);
            };

            var Tab = require('esui/Tab');

            Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';

            Tab.prototype.getContentHTML = function (item) {
                var data = {
                    title: lib.encodeHTML(item.title),
                    href: item.href && lib.encodeHTML(item.href)
                };
                var template = item.href
                    ? this.linkTemplate
                    : this.contentTemplate;
                return lib.format(template, data);
            };
        }

        function addPanelAppendContentSupport() {
            var Panel = require('esui/Panel');

            Panel.prototype.appendContent = function (html) {
                var panel = this;
                var container = document.createElement('div');
                container.innerHTML = html;

                var children = [].slice.call(container.childNodes, 0);
                var options = u.extend({}, panel.renderOptions, {
                    viewContext: panel.viewContext,
                    parent: panel
                });
                u.each(children, function (child) {
                    panel.main.appendChild(child);
                    require('esui').init(panel.main, options);
                });
            };
        }

        function activate() {
            initializeValidationRules();
            addControlLinkMode();
            addPanelAppendContentSupport();
        }

        return {
            activate: u.once(activate)
        };
    }
);

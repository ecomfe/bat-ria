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
        var Control = require('esui/Control');

        /**
         * 加载并配置验证规则
         *
         * @ignore
         */
        function initializeValidationRules() {
            // 加载所有验证规则
            require('esui/validator/MaxByteLengthRule');
            require('esui/validator/MinByteLengthRule');
            require('esui/validator/MaxLengthRule');
            require('esui/validator/MinLengthRule');
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
            var defaultGetErrorMessage = Rule.prototype.getErrorMessage;

            function getErrorMessage(control) {
                if (control.get(this.type + 'ErrorMessage')) {
                    return defaultGetErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }

                return defaultGetErrorMessage.apply(this, arguments);
            }

            MaxRule.prototype.getErrorMessage = getErrorMessage;
            MinRule.prototype.getErrorMessage = getErrorMessage;
            PatternRule.prototype.getErrorMessage = function (control) {
                var pattern = control.get('pattern') + '';
                if (control.get('patternErrorMessage') || !NUMBER_REGEX.hasOwnProperty(pattern)) {
                    return defaultGetErrorMessage.apply(this, arguments);
                }
                var rangeErrorMessage = getRangeErrorMessage(control);
                if (rangeErrorMessage) {
                    return rangeErrorMessage;
                }
                return defaultGetErrorMessage.apply(this, arguments);
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

        /**
         * 激活全局ESUI扩展
         *
         * @ignore
         */
        function initializeGlobalExtensions() {
            var ui = require('esui');
            var globalExtensions = [
                // { type: 'CustomData', options: {} }
            ];

            u.each(globalExtensions, function (extension) {
                ui.attachExtension(extension.type, extension.options);
            });
        }

        /**
         * esui升级前region的过渡扩展
         * 增加获取最大地域个数的方法
         * 增加多选状态下是否处于全选状态的判断
         * 增加获取选中文本的方法
         * 增加获取rawValue的时候即使省下边没有全选也把省份id返回的方法（adrc地区格式需求）
         * 增加设置rawValue时去掉非子节点的省份，并返回选中文本的方法（adrc地区格式需求）
         *
         * @ignore
         */
        function addRegionExtension() {
            var Region = require('esui/Region');

            Region.prototype.getMaxRegionSize = function () {
                if (!this.maxRegionSize) {
                    this.maxRegionSize = u.size(this.regionDataIndex);
                }
                return this.maxRegionSize;
            };

            Region.prototype.isAllSelected = function () {
                if (this.mode === 'multi') {
                    return this.getMaxRegionSize() === this.getRawValue().length;
                }
                // 不是多选就直接返回false吧
                return false;
            };

            /*
             * 获取地区的文本
             *
             * @param isFilterParentNode {boolean} 是不是要把有子节点省份的文本过滤掉
             * @param region {array} 指定地区的id范围，默认使用已选地区
             * @return {string} 选中的地区的文本
             */
            Region.prototype.getRegionText = function (isFilterParentNode, region) {
                var me = this;
                var rawValue = region || this.getRawValue();
                var regionTextArr = [];
                if (isFilterParentNode) {
                    u.each(rawValue, function (id) {
                        var item = me.regionDataIndex[id];
                        if (!item.children) {
                            var tmpText =  item.text;
                            if (tmpText) {
                                regionTextArr.push(tmpText);
                            }
                        }
                    });
                }
                else {
                    u.each(rawValue, function (id) {
                        var tmpText = me.regionDataIndex[id] && me.regionDataIndex[id].text;
                        if (tmpText) {
                            regionTextArr.push(tmpText);
                        }
                    });
                }

                return regionTextArr.join(',');
            };

            /*
             * 主要用于adrc地域获取要发送到后端的值
             *
             * @return {array} 不论省是不是全选都得带上的一个地区id数组
             */
            Region.prototype.getRawValueWithProv = function () {
                var me = this;
                var rawValue = this.getRawValue();
                var returnRawValue = [];
                u.each(rawValue, function (id) {
                    var node = me.regionDataIndex[id];
                    // 检查叶子节点
                    if (node && !node.children) {
                        // 如果不是最深叶节点，那就是我们要的特殊的省
                        if (node.level !== 4) {
                            returnRawValue.push(id);
                        }
                        else {
                            // 深度为4就是最深的叶节点，是个市，把它的省也搞进来
                            returnRawValue.push(id);
                            returnRawValue.push(node.parent.id);
                        }
                    }
                });
                return u.uniq(returnRawValue);
            };

            /*
             * 主要用于adrc设置控件值
             *
             * @param rawValue {array} 地区的id数组
             * @return {string} 返回这些地区的展示文本，不包含省份以上的文本
             */
            Region.prototype.setRawValueWithoutProv = function (rawValue) {
                if (typeof rawValue === 'string' && rawValue.length) {
                    rawValue = rawValue.split(',');
                }
                var me = this;
                var regionTextArr = [];
                var rawValueToBeSet = [];
                u.each(rawValue, function (id) {
                    var node = me.regionDataIndex[id];
                    if (node && !node.children) {
                        regionTextArr.push(node.text);
                        rawValueToBeSet.push(node.id);
                    }
                });
                this.setRawValue(rawValueToBeSet);
                return regionTextArr.join(',');
            };
        }

        /**
         * esui升级前Crumb的过渡扩展，增加global-redirect的功能
         *
         * @ignore
         */
        function addCrumbGlobalRedirect() {
            var Crumb = require('esui/Crumb');

            /**
             * 链接节点的内容HTML模板
             *
             * 模板中可以使用以下占位符：
             *
             * - `{string} text`：文本内容，经过HTML转义
             * - `{string} href`：链接地址，经过HTML转义
             * - `{string} scope`：当Crumb在一个子action中时是否global跳转，经过HTML转义
             *       值为`global`时全局跳转，其他值或空在子action中跳转
             *
             * @type {string}
             * @override
             */
            Crumb.prototype.linkNodeTemplate =
                '<a class="${classes}" href="${href}" data-redirect="${scope}">${text}</a>';

            /**
             * 获取节点的HTML内容
             *
             * @param {meta.CrumbItem} node 节点数据项
             * @param {number} index 节点索引序号
             * @return {string}
             *
             * @override
             */
            Crumb.prototype.getNodeHTML = function (node, index) {
                var classes = this.helper.getPartClasses('node');
                if (index === 0) {
                    classes.push.apply(
                        classes,
                        this.helper.getPartClasses('node-first')
                    );
                }
                if (index === this.path.length - 1) {
                    classes.push.apply(
                        classes,
                        this.helper.getPartClasses('node-last')
                    );
                }

                var template = node.href
                    ? this.linkNodeTemplate
                    : this.textNodeTemplate;
                var data = {
                    href: u.escape(node.href),
                    scope: u.escape(node.scope),
                    text: u.escape(node.text),
                    classes: classes.join(' ')
                };
                return lib.format(template, data);
            };
        }

        function addTreeNodeTitle() {
            var Tree = require('esui/Tree');

            Tree.prototype.itemTemplate = '<span title="${text}">${text}</span>';
        }

        function fixSidebarHide() {
            var Sidebar = require('esui/Sidebar');

            /**
             * 隐藏控件
             */
            Sidebar.prototype.hide = function () {
                Control.prototype.hide.call(this);

                var mat = lib.g(this.helper.getId('mat'));
                if (mat) {
                    mat.style.display = 'none';
                }

                // 隐藏主区域
                this.main.style.display = 'none';

                // minibar
                var miniBar = lib.g(this.helper.getId('minibar'));
                if (miniBar) {
                    miniBar.style.display = 'none';
                }
            };
        }

        function activate() {
            initializeValidationRules();
            addControlLinkMode();
            initializeGlobalExtensions();
            addRegionExtension();
            addCrumbGlobalRedirect();
            addTreeNodeTitle();
            fixSidebarHide();
        }

        return {
            activate: u.once(activate)
        };
    }
);

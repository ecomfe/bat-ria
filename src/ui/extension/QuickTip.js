/**
 * @file 为控件提供方便的Tip显示
 * @author Justineo(justice360@gmail.com)
 */
define(
    function (require) {
        var lib = require('../lib');
        var ui = require('esui');
        var u = require('underscore');
        var Extension = require('esui/Extension');

        require('esui/TipLayer');

        var exports = {};

        // BIG BROTHER IS WATCHING YOU
        var tipId = 0x1984;

        /**
         * 为控件快速添加Tip显示
         *
         * 使用此扩展，鼠标移入控件后如果悬浮在带有`"data-title"`属性的元素内，会按其
         * 内容显示相应Tip。内容可以通过引用的方式读取扩展对象中的`data`属性。
         *
         * 例如控件`tip`属性为：
         *
         *     { del: '点击进行<strong>删除（不可恢复）</strong>' }
         *
         * 书写HTML模板时需添加：
         *
         *     data-ui-extension-tip-type="QuickTip"
         *     data-ui-extension-tip-data="@tipData" <- 当使用引用方式读取时必传
         *
         * 控件内有元素：
         *
         *     <button data-title="点击进行编辑">编辑</button>
         *     <button data-title="@del">删除</button>
         *
         * 即会在鼠标移到元素上时，出现一个Tip控件，提示内容按`data-title`设置给出。
         *
         * @extends esui.Extension
         * @constructor
         */
        exports.constructor = function () {
            Extension.apply(this, arguments);
        };

        /**
         * 扩展的类型，始终为`"QuickTip"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'QuickTip';

        function getProperty(target, path) {
            var value = target;
            for (var i = 0; i < path.length; i++) {
                value = value[path[i]];
            }

            return value;
        }

        exports.getTipContent = function (element) {
            var content = element.getAttribute('data-title');

            // 引用目标控件的属性值
            if (content.charAt(0) === '@') {
                var path = content.substring(1).split('.');
                var data = this.data;
                if (!data) {
                    return '';
                }
                var value = data[path[0]];
                return path.length > 1
                    ? getProperty(value, path.slice(1))
                    : value;
            }
            // 字符串直接量
            return content;
        };

        /**
         * 创建`Tip`控件并附加到相应元素上
         *
         * @param {HTMLElement} element 需要`Tip`的元素
         */
        exports.showTip = function (element) {
            var content = this.getTipContent(element);
            content = typeof content === 'string' ? {content: content} : content;
            var tip = this.current;

            // 每个扩展只支持同时显示一个Tip
            if (!tip) {
                var options = {
                    id: 'ui-tip-' + tipId++,
                    viewContext: this.target.viewContext,
                    arrow: true
                };
                u.extend(options, content);
                tip = ui.create('TipLayer', options);
                tip.appendTo(document.body);
                this.current = tip;
            }
            else {
                tip.setProperties(content);
            }

            var attachOptions = {
                targetDOM: element,
                showMode: 'over',
                delayTime: 200,
                positionOpt: {
                    top: 'top',
                    right: 'left'
                }
            };
            tip.attachTo(attachOptions);
            tip.show(element, attachOptions.positionOpt);
        };



        /**
         * 鼠标移入的逻辑
         *
         * @param {Event} evt 事件对象
         */
        function mouseEnterHandler(evt) {
            var target = evt.target;
            this.showTip(target);
        }

        /**
         * 鼠标移出的逻辑
         *
         * @param {Event} evt 事件对象
         */
        function mouseLeaveHandler(evt) {
            if (this.current) {
                this.current.hide();
            }
        }

        /**
         * 激活扩展
         *
         * @override
         */
        exports.activate = function () {
            Extension.prototype.activate.apply(this, arguments);

            this.mouseEnterHandler = u.bind(mouseEnterHandler, this);
            this.mouseLeaveHandler = u.bind(mouseLeaveHandler, this);
            lib.on(this.target.main, '[data-title]', 'mouseenter', this.mouseEnterHandler);
            lib.on(this.target.main, '[data-title]', 'mouseleave', this.mouseLeaveHandler);
        };

        /**
         * 取消扩展的激活状态
         *
         * @override
         */
        exports.inactivate = function () {
            if (this.current) {
                this.current.dispose();
            }
            lib.un(this.target.main, 'mouseenter', this.mouseOverHandler);
            lib.un(this.target.main, 'mouseleave', this.mouseLeaveHandler);

            Extension.prototype.inactivate.apply(this, arguments);
        };

        var QuickTip = require('eoo').create(Extension, exports);
        ui.registerExtension(QuickTip);

        return QuickTip;
    }
);

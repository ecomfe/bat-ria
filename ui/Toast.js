/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 简易信息提示控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * Toast控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function Toast(options) {
            Control.apply(this, arguments);
        }

        Toast.defaultProperties = {
            duration: 3000,
            autoShow: true,
            disposeOnHide: true
        };

        Toast.prototype.type = 'Toast';

        /**
         * 创建主元素
         *
         * @override
         * @protected
         */
        Toast.prototype.createMain = function () {
            return document.createElement('aside');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Toast.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, Toast.defaultProperties, options);
            if (properties.content == null) {
                properties.content = this.main.innerHTML;
            }
            this.setProperties(properties);
        };

        var tempalte = '<p id="${id}" class="${classes}"></p>';

        /**
         * 初始化结构
         *
         * @override
         * @protected
         */
        Toast.prototype.initStructure = function () {
            this.main.innerHTML = lib.format(
                tempalte,
                {
                    id: helper.getId(this, 'content'),
                    classes: helper.getPartClasses(this, 'content').join(' ')
                }
            );
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Toast.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'content',
                paint: function (toast, content) {
                    var container = toast.main.firstChild;
                    container.innerHTML = content;
                    if (toast.autoShow) {
                        toast.show();
                    }
                }
            },
            // 为了拿到`oldValue`，必须使用一个函数
            function (changes, changesIndex) {
                // 没有`changesIndex`是第一次渲染，只有直接给了`status`才用
                if (!changesIndex) {
                    if (this.status) {
                        helper.addStateClasses(this, this.status);
                    }
                    return;
                }

                var status = changesIndex.status;
                if (status) {
                    if (status.oldValue) {
                        helper.removeStateClasses(this, status.oldValue);
                    }
                    if (status.newValue) {
                        helper.addStateClasses(this, status.newValue);
                    }
                }
            }
        );

        /**
         * 显示提示信息
         *
         * @override
         * @public
         */
        Toast.prototype.show = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }

            // 如果已经移出DOM了，要移回来
            if (!this.main.parentNode || !this.main.parentElement) {
                document.body.appendChild(this.main);
            }

            Control.prototype.show.apply(this, arguments);
            this.fire('show');
            clearTimeout(this.timer);
            if (!isNaN(this.duration) && this.duration !== Infinity) {
                this.timer = setTimeout(
                    lib.bind(this.hide, this), 
                    this.duration
                );
            }
        };

        /**
         * 隐藏提示信息
         *
         * @override
         * @public
         */
        Toast.prototype.hide = function () {
            Control.prototype.hide.apply(this, arguments);
            clearTimeout(this.timer);
            this.fire('hide');
            if (this.disposeOnHide) {
                this.dispose();
            }
        };

        /**
         * 让当前控件和DOM脱离但暂不销毁，可以单例时用
         *
         * @public
         */
        Toast.prototype.detach = function () {
            lib.removeNode(this.main);
        };

        /**
         * 销毁控件
         *
         * @override
         * @protected
         */
        Toast.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            
            Control.prototype.dispose.apply(this, arguments);
            this.detach();
        };

        /**
         * 快捷显示信息的方法
         *
         * @parma {string} content 显示的内容
         * @param {Object} options 其它配置项
         *
         * @public
         */
        Toast.show = function (content, options) {
            options = lib.extend({ content: content, autoShow: true }, options);
            var toast = new Toast(options);
            toast.appendTo(document.body);
            return toast;
        };

        lib.inherits(Toast, Control);
        require('esui').register(Toast);
        return Toast;
    }
);

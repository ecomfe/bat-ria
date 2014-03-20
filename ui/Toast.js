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

        var maskIdPrefix = 'ctrl-mask';

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
            disposeOnHide: true,
            mask: false
        };

        Toast.prototype.type = 'Toast';

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

        function getZIndex(elem) {
            var zIndex = lib.getComputedStyle(elem, 'z-index');
            if (zIndex === '' || zIndex == null) {
                if (elem.currentStyle) {
                    zIndex = elem.currentStyle.zIndex; //zIndex总是绝对值，所以可以从这里取
                } else {
                    zIndex = 0;
                }
            }
        }

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

            if (this.mask) {
                var zIndex = getZIndex(this.main);
                showMask(this, zIndex - 1);
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
            if (this.mask) {
                hideMask(this);
            }
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
         * 显示遮盖层
         * @param {ui.Toast} Toast 控件对象
         */
        function showMask(toast, zIndex) {
            var mask = getMask(toast);
            var clazz = [];
            var maskClass = helper.getPartClasses(toast, 'mask').join(' ');

            clazz.push(maskClass);

            mask.className = clazz.join(' ');
            mask.style.display = 'block';
            mask.style.zIndex = zIndex;
        }


        /**
         * 隐藏遮盖层
         * @param {ui.Toast} Toast 控件对象
         */
        function hideMask(toast) {
            var mask = getMask(toast);
            if ('undefined' != typeof mask) {
                lib.removeNode(mask);
            }
        }

        /**
         * 遮盖层初始化
         * 
         * @param {string} maskId 遮盖层domId
         * @inner
         */
        function initMask(maskId) {
            var el = document.createElement('div');
            el.id = maskId;
            document.body.appendChild(el);
        }


        /**
         * 获取遮盖层dom元素
         *
         * @param {ui.Toast} 控件对象
         * @inner
         * @return {HTMLElement} 获取到的Mask元素节点.
         */
        function getMask(control) {
            var dialogId = helper.getId(control);
            var id = maskIdPrefix + '-' + dialogId;
            var mask = lib.g(id);

            if (!mask) {
                initMask(id);
            }

            return lib.g(id);
        }

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

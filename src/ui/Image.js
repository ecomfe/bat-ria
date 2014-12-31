/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 图片类内容查看面板
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * 图片类内容查看面板
         *
         * @param {Object} [options] 初始化参数
         * @extends esui.Control
         * @constructor
         */
        function Image(options) {
            Control.apply(this, arguments);
        }

        Image.prototype.type = 'Image';

        var extentionTypes = {
            '.jpg': true, '.jpeg': true, '.gif': true,
            '.bmp': true, '.tif': true, '.tiff': true, '.png': true
        }

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Image.defaultProperties = {
            imageType: 'auto',
            width: '',
            height: '',
            maxWidth: '',
            maxHeight: ''
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Image.prototype.createMain = function () {
            return document.createElement('figure');
        };

        /**
         * 初始化参数
         *
         * @param {Object} [options] 构造函数传入的参数
         * @override
         * @protected
         */
        Image.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, Image.defaultProperties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Image.prototype.initStructure = function () {
            this.helper.addDOMEvent(this.main, 'click', this.displayFullSize);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Image.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: ['url', 'width', 'height'],
                paint: function (image, url) {
                    if (!url) {
                        image.restoreInitialState();
                        return;
                    }

                    var html = image.getPreviewHTML();
                    var main = image.main;
                    main.innerHTML = html;

                    var newImg = image.helper.getPart('img');
                    if (newImg) {
                        if (image.maxWidth) {
                            main.style.maxWidth = image.maxWidth.indexOf('%') === -1
                                ? image.maxWidth + 'px'
                                : image.maxWidth;
                        }
                        else if (image.width) {
                            main.style.height = image.height + 'px';
                        }

                        if (image.maxHeight) {
                            main.style.maxHeight = image.maxHeight.indexOf('%') === -1
                                ? image.maxHeight + 'px'
                                : image.maxHeight;
                        }
                        else if (image.height) {
                            main.style.width = image.width + 'px';
                        }
                    }

                    image.removeState('empty');
                }
            }
        );

        /**
         * 恢复最初状态，即不显示任何内容
         */
        Image.prototype.restoreInitialState = function () {
            this.url = null;
            this.main.innerHTML = '';
            this.addState('empty');
        };

        /**
         * 校验是否为可预览类型
         *
         * @return {boolean} 返回是否能预览该扩展类型
         */
        Image.prototype.checkExtension = function () {
            var match = /\.\w+$/.exec(this.url);
            if (!match) {
                return false;
            }

            var extension = match[0];

            if (this.imageType !== 'auto') {
                return extension === this.imageType;
            }
            else {
                return !!extentionTypes[extension];
            }
        };

        var imageTemplate = '<img src="${url}" id="${id}"/>';

        /**
         * 获取预览的HTML
         *
         * @return {string} 预览的HTML内容
         * @ignore
         */
        Image.prototype.getPreviewHTML = function () {
            var type = this.checkExtension();

            if (!type) {
                return '<strong>无法预览该格式</strong>';
            }

            var data = {
                id: this.helper.getId('img'),
                url: this.url
            };

            return lib.format(imageTemplate, data);
        };

        /**
         * 显示全尺寸图片
         */
        Image.prototype.displayFullSize = function () {
            if (!this.url) {
                return;
            }

            var mask = this.helper.createPart('full-size-mask');
            document.body.appendChild(mask);

            var content = this.helper.createPart('full-size-content');
            content.innerHTML = this.getPreviewHTML();

            document.body.appendChild(content);

            var close = this.helper.createPart('full-size-close');
            close.innerHTML = '×';
            document.body.appendChild(close);

            this.helper.addDOMEvent(mask, 'click', this.cancelFullSize);
            this.helper.addDOMEvent(close, 'click', this.cancelFullSize);
        };

        /**
         * 取消全尺寸显示
         */
        Image.prototype.cancelFullSize = function () {
            var mask = this.helper.getPart('full-size-mask');
            lib.removeNode(mask);

            var content = this.helper.getPart('full-size-content');
            lib.removeNode(content);

            var close = this.helper.getPart('full-size-close');
            this.helper.clearDOMEvents(close);
            lib.removeNode(close);
        };

        lib.inherits(Image, Control);
        require('esui').register(Image);
        return Image;
    }
);

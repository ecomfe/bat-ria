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
        };

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Image.defaultProperties = {
            width: '',
            height: '',
            maxWidth: '',
            maxHeight: '',
            extentionTypes: extentionTypes
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

                    var html = image.getPreviewHTML(image.helper.getId('img'));
                    var main = image.main;
                    main.innerHTML = html;

                    var newImg = image.helper.getPart('img');
                    function setOffset() {
                        var offset = lib.getOffset(this);
                        !image.height && (main.style.height = offset.height + 'px');
                        !image.width && (main.style.width = offset.width + 'px');
                    }

                    // 1. 默认maxWidth/maxHeight的优先级比width/height高
                    // 2. 该控件以按比例缩放图片为前提，img上默认样式只设置maxWidth/maxHeight，
                    //    值继承控件容器的maxWidth/maxHeight，因此需要保证容器上有maxWidth/maxHeight
                    // 3. 如果设置了width/height，则会保证img居中
                    if (newImg) {
                        if (image.maxWidth) {
                            main.style.maxWidth = image.maxWidth.indexOf('%') === -1
                                ? image.maxWidth + 'px'
                                : image.maxWidth;
                        }
                        else if (image.width) {
                            if (image.width.indexOf('%') === -1) {
                                main.style.width = image.width + 'px';
                                main.style.maxWidth = image.width + 'px';   // 给img标签继承用
                            }
                            else {
                                main.style.width = image.width;
                                main.style.maxWidth = '100%';               // 给img标签继承用
                            }
                        }

                        if (image.maxHeight) {
                            main.style.maxHeight = image.maxHeight.indexOf('%') === -1
                                ? image.maxHeight + 'px'
                                : image.maxHeight;
                        }
                        else if (image.height) {
                            if (image.height.indexOf('%') === -1) {
                                main.style.height = image.height + 'px';
                                main.style.maxHeight = image.height + 'px';  // 给img标签继承用
                            }
                            else {
                                main.style.height = image.height;
                                main.style.maxHeight = '100%';               // 给img标签继承用
                            }
                        }

                        // 如果定死容器高宽，会保证图片居中
                        if (image.height || image.width) {
                            lib.addClass(main, 'ui-image-fixed');
                            newImg.complete
                                ? setOffset.call(newImg)
                                : newImg.onload = setOffset;
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
            return !!this.extentionTypes[extension];
        };

        var imageTemplate = '<img src="${url}" id="${id}" alt="${alt}" />';

        /**
         * 获取预览的HTML
         * @param  {string} id img的id
         * @return {string} 预览的HTML内容
         * @ignore
         */
        Image.prototype.getPreviewHTML = function (id) {
            var type = this.checkExtension();

            if (!type) {
                return '<strong>无法预览该格式</strong>';
            }

            var data = {
                id: id,
                url: this.url
            };
            this.alt && (data.alt = this.alt);

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
            content.innerHTML = this.getPreviewHTML(this.helper.getId('img-full-size'));

            document.body.appendChild(content);

            var close = this.helper.createPart('full-size-close');
            close.innerHTML = '×';
            document.body.appendChild(close);

            this.helper.addDOMEvent(content, 'click', this.cancelFullSize);
            this.helper.addDOMEvent(mask, 'click', this.cancelFullSize);
            this.helper.addDOMEvent(close, 'click', this.cancelFullSize);
        };

        /**
         * 取消全尺寸显示
         * @param {Object} e 点击事件
         */
        Image.prototype.cancelFullSize = function (e) {
            if (e.target.nodeName !== 'IMG') {
                var mask = this.helper.getPart('full-size-mask');
                this.helper.clearDOMEvents(mask);
                lib.removeNode(mask);

                var content = this.helper.getPart('full-size-content');
                this.helper.clearDOMEvents(content);
                lib.removeNode(content);

                var close = this.helper.getPart('full-size-close');
                this.helper.clearDOMEvents(close);
                lib.removeNode(close);
            }
        };

        lib.inherits(Image, Control);
        require('esui').register(Image);
        return Image;
    }
);

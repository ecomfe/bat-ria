/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Uploader控件
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var InputControl = require('esui/InputControl');
        var uri = require('urijs');
        var u = require('underscore');

        require('./Image');

        // var FILE_TYPES = ['auto', 'image', 'flash'];

        /**
         * Uploader控件
         *
         * @param {Object=} options 初始化参数
         * @extends InputControl
         * @constructor
         * @public
         */
        function Uploader(options) {
            InputControl.apply(this, arguments);
        }

        Uploader.prototype.type = 'Uploader';

        var extentionTypes = {
            image: {
                '.jpg': true, '.jpeg': true, '.gif': true,
                '.bmp': true, '.tif': true, '.tiff': true, '.png': true
            },

            flash: {
                '.flv': true, '.swf': true
            }
        };

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            width: 80,
            height: 25,
            action: '',                // uploader提交的地址
            fileType: 'auto',
            dataKey: 'filedata',
            args: {},                  // 在post参数中添加额外内容
            fileInfo: {},
            outputType: 'url',         // `url|previewUrl`表示提交一个路径，`content`表示提交文件内容
            method: 'POST',
            text: '点击上传',
            overrideText: '重新上传',
            busyText: '正在上传...',
            completeText: '上传完成',
            placeholder: '未选择文件',
            preview: false,
            autoUpload: true,
            extentionTypes: extentionTypes
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Uploader.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 修改action属性的过滤器（扩展点）
         * 可以通过该方法添加get的参数
         *
         * @param {string} action 文件发送的表单action URL
         * @return {string} 修改后的URL
         */
        Uploader.prototype.filterAction = function (action) {
            return action;
        };

        /**
         * 处理额外的参数配置
         *
         * @param {*} args 额外的参数配置，可以是一个序列化的参数串或一个{ key: value }对象
         * @return {Array} 额外参数的数组
         */
        function buildExtraArgs(args) {
            // 会存在一些额外的参数配置
            var extraArgs = [];
            // 现在开始解析args
            var keyAndValues = [];
            if (args) {
                if (typeof args === 'string') {
                    keyAndValues = args.split('&');
                    u.each(keyAndValues, function (keyAndValue) {
                        keyAndValue = keyAndValue.split('=');
                        if (keyAndValue.length === 2) {
                            extraArgs.push({
                                name: u.escape(keyAndValue[0]),
                                value: u.escape(keyAndValue[1])
                            });
                        }
                    });
                }
                else if (typeof args === 'object') {
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            extraArgs.push({
                                name: u.escape(key),
                                value: u.escape(args[key])
                            });
                        }
                    }
                }
            }
            return extraArgs;
        }

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Uploader.prototype.initOptions = function (options) {
            var properties = {
                action: ''
            };
            lib.extend(properties, Uploader.defaultProperties, options);

            if (lib.isInput(this.main)) {
                if (!options.accept) {
                    properties.accept = lib.getAttribute(this.main, 'accept');
                }
                if (!options.name) {
                    properties.name = this.main.name;
                }
            }
            else if (this.main.nodeName.toLowerCase() === 'form') {
                if (!options.action) {
                    properties.action = this.main.action;
                }
                if (!options.method && lib.hasAttribute(this.main, 'method')) {
                    properties.method = this.main.method;
                }
            }

            if (typeof properties.accept === 'string') {
                properties.accept = properties.accept.split(',');
            }

            if (properties.autoUpload === 'false') {
                properties.autoUpload = false;
            }

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Uploader.prototype.initStructure = function () {
            if (this.main.nodeName.toLowerCase() !== 'form') {
                this.helper.replaceMain();
            }

            // 往全局下加个函数，用于上传成功后回调
            // TODO: 抛弃IE7的话能改成`postMessage`实现
            this.callbackName = helper.getGUID('');
            if (!window.esuiShowUploadResult) {
                window.esuiShowUploadResult = {};
            }
            window.esuiShowUploadResult[this.callbackName] = lib.bind(this.showUploadResult, this);

            var containerClasses = this.helper.getPartClassName('input-container');
            var indicatorClasses = this.helper.getPartClassName('indicator');
            var buttonClasses = this.helper.getPartClassName('button');
            var iframeId = this.helper.getId('iframe');
            var labelClasses = this.helper.getPartClassName('label');
            var extraArgClasses = this.helper.getPartClassName('extra-args');

            /* eslint-disable fecs-indent */
            var html = [
                '<div id="' + this.helper.getId('input-container') + '" ',
                    'class="' + containerClasses + '">',
                    // 按钮
                    '<span id="' + this.helper.getId('button') + '" ',
                        'class="' + buttonClasses + '">',
                    '</span>',
                    // sessionToken
                    // '<input type="hidden" name="sessionToken" ',
                    //     'value="' + this.getSessionToken() + '" ',
                    // '/>',
                    // 文件上传框
                    '<input type="file" ',
                    'id="' + this.helper.getId('input') + '" ',
                    (this.dataKey ? 'name="' + u.escape(this.dataKey) + '" ' : ' '),
                    '/>'
            ];
            /* eslint-enable fecs-indent */
            // 从附加参数里构造
            var extraArgs = buildExtraArgs(this.args);
            if (extraArgs.length) {
                html.push(
                    '<div id="' + this.helper.getId('extraArgs') + '"',
                        'class="' + extraArgClasses + '">'
                );
                u.each(extraArgs, function (arg) {
                    html.push(
                        '<input type="hidden" name="' + arg.name + '" ',
                            'value="' + arg.value + '"',
                        '/>'
                    );
                });
                html.push(
                    '</div>'
                );
            }
            html.push(
                '</div>',
                // 指示器
                // 虽然`<progress>`更合适，但基本无法写样式，所以改用`<span>`
                '<div id="' + this.helper.getId('indicator-wrapper') + '"',
                    'class="' + indicatorClasses + '">',
                    '<span id="' + this.helper.getId('indicator') + '">',
                    '</span>',
                '</div>',
                '<div id="' + this.helper.getId('label') +
                    '"',
                    'class="' + labelClasses + '">' + this.placeholder +
                '</div>',
                // 用来偷偷上传的`<iframe>`元素
                '<iframe id="' + iframeId + '" name="' + iframeId + '"',
                ' src="about:blank"></iframe>'
            );

            this.main.innerHTML = html.join('');

            // 放个表单在远放，有用
            var form = this.helper.createPart('form', 'form');
            form.setAttribute('enctype', 'multipart/form-data');
            form.target = iframeId;
            document.body.appendChild(form);

            var input = this.helper.getPart('input');
            this.helper.addDOMEvent(input, 'change', lib.bind(this.receiveFile, this));
        };

        /**
         * 转换为上传完成状态
         *
         * @param {Object} info 成功结果
         */
        function setStateToComplete(info) {
            if (info && u.size(info) > 0) {
                this.removeState('busy');
                this.addState('complete');

                // 下次再上传的提示文字要变掉
                this.addState('uploaded');
                var button = this.helper.getPart('button');
                button.innerHTML = u.escape(this.overrideText);

                var label = this.helper.getPart('label');
                // 各种兼容。。。
                label.innerHTML = u.escape(this.getFileName()
                    || info.url
                    || info.previewUrl
                    || ''
                );

                // 清掉可能存在的错误信息
                var validity = new Validity();
                this.showValidity(validity);

                this.fire('change');
                if (this.preview) {
                    this.showPreview(info);
                }
            }
        }

        /**
         * 清空上传图像
         *
         * 清空操作主要做两件事
         * 1. 清空各类状态
         * 2. 清空Uploader的fileInfo
         * 3. 清空input的value
         */
        function removeFile() {
            // 由于无法控制外部会在什么时候调用清空接口
            // 因此需要将所有状态移除
            this.removeState('busy');
            this.removeState('complete');
            this.removeState('uploaded');
            var validity = new Validity();
            var state = new ValidityState(true, '');
            validity.addState('', state);
            this.showValidity(validity);

            // 重置显示文字
            this.helper.getPart('button').innerHTML = u.escape(this.text);
            // 重置显示文字
            this.helper.getPart('label').innerHTML = u.escape(this.placeholder);

            // 清空上传记录
            this.fileInfo = {};
            this.rawValue = '';

            // <input type="file"/>的value在IE下无法直接通过操作属性清除，需要替换一个input控件
            // 复制节点属性
            var newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.id = this.helper.getId('input');
            newInput.name = this.dataKey;
            // 清理注册事件
            var input = this.helper.getPart('input');
            this.helper.removeDOMEvent(input, 'change');
            // 更新子节点
            this.main.firstChild.replaceChild(newInput, input);
            // 注册事件
            this.helper.addDOMEvent(newInput, 'change', lib.bind(this.receiveFile, this));
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Uploader.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'args',
                paint: function (uploader, args) {
                    if (args) {
                        var html = [];
                        var extraArgs = buildExtraArgs(args);
                        if (extraArgs.length) {
                            u.each(extraArgs, function (arg) {
                                html.push(
                                    '<input type="hidden" name="' + arg.name + '" ',
                                        'value="' + arg.value + '"',
                                    '/>'
                                );
                            });
                            var extraArgsWrapper = uploader.helper.getPart('extraArgs');
                            extraArgsWrapper.innerHTML = html.join('');
                        }
                    }
                }
            },
            {
                name: ['method', 'action'],
                paint: function (uploader, method, action) {
                    var form = uploader.helper.getPart('form');
                    form.method = method;
                    action = uri(action).addQuery({
                        'callback': 'parent.esuiShowUploadResult["' + uploader.callbackName + '"]'
                    }).toString();
                    form.action = uploader.filterAction(action);
                }
            },
            {
                name: ['text', 'overrideText'],
                paint: function (uploader, text, overrideText) {
                    var button = uploader.helper.getPart('button');
                    var html = uploader.hasState('uploaded')
                        ? u.escape(overrideText)
                        : u.escape(text);
                    button.innerHTML = html;
                }
            },
            {
                name: ['busyText', 'completeText'],
                paint: function (uploader, busyText, completeText) {
                    var indicator = uploader.helper.getPart('indicator');
                    var html = uploader.hasState('busy')
                        ? u.escape(busyText)
                        : u.escape(completeText);
                    indicator.innerHTML = html;
                }
            },
            {
                name: 'accept',
                paint: function (uploader, accept) {
                    var input = uploader.helper.getPart('input');
                    if (accept) {
                        lib.setAttribute(input, 'accept', accept.join(','));
                    }
                    else {
                        lib.removeAttribute(input, 'accept');
                    }
                }
            },
            {
                name: ['disabled', 'readOnly'],
                paint: function (uploader, disabled, readOnly) {
                    var input = uploader.helper.getPart('input');
                    input.disabled = disabled;
                    if (readOnly && (readOnly !== 'false' || readOnly !== false)) {
                        input.disabled = 'disabled';
                    }
                }
            },
            {
                name: ['width', 'height'],
                paint: function (uploader, width, height) {
                    var widthWithUnit = width + 'px';
                    var heightWithUnit = height + 'px';

                    uploader.main.style.height = heightWithUnit;

                    var container = uploader.helper.getPart('input-container');
                    container.style.height = heightWithUnit;
                    container.style.width = widthWithUnit;

                    var button = uploader.helper.getPart('button');
                    button.style.lineHeight = heightWithUnit;

                    var indicator = uploader.helper.getPart('indicator');
                    indicator.style.lineHeight = heightWithUnit;

                    var label = uploader.helper.getPart('label');
                    label.style.lineHeight = heightWithUnit;
                }
            },
            {
                name: 'rawValue',
                paint: function (uploader, rawValue) {
                    if (rawValue) {
                        uploader.fileInfo = {};
                        uploader.rawValue = rawValue;
                        uploader.fileInfo[uploader.outputType] = rawValue;
                        setStateToComplete.call(uploader, uploader.fileInfo);
                        // 不需要停留在完成提示
                        uploader.removeState('complete');
                    }
                }
            },
            {
                name: 'fileInfo',
                paint: function (uploader, fileInfo) {
                    if (u.isEqual(fileInfo, {})) {
                        // 允许用户使用 set('fileInfo', {}) 方式清空上传内容
                        removeFile.call(uploader);
                        return;
                    }
                    else if (u.isObject(fileInfo)) {
                        uploader.fileInfo = fileInfo;
                        uploader.rawValue = fileInfo[uploader.outputType] || fileInfo.previewUrl;
                        setStateToComplete.call(uploader, uploader.fileInfo);
                        // 不需要停留在完成提示
                        uploader.removeState('complete');
                    }
                }
            }
        );

        /**
         * 检查文件格式是否正确，不正确时直接提示
         *
         * @param {string} filename 上传的文件的文件名
         * @return {boolean}
         * @protected
         */
        Uploader.prototype.checkFileFormat = function (filename) {
            if (this.accept) {
                // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                // 因此把逻辑写在控件内部了
                var extension = filename.split('.');
                extension = '.' + extension[extension.length - 1].toLowerCase();

                var isValid = false;
                for (var i = 0; i < this.accept.length; i++) {
                    var acceptPattern = this.accept[i].toLowerCase();
                    if (acceptPattern === extension) {
                        isValid = true;
                        break;
                    }

                    // image/*之类的，表示一个大类
                    if (acceptPattern.slice(-1)[0] === '*') {
                        var extensionType = acceptPattern.split('/')[0];
                        var targetExtensions = this.extentionTypes[extensionType];
                        if (targetExtensions
                            && targetExtensions.hasOwnProperty(extension)
                        ) {
                            isValid = true;
                            break;
                        }
                    }
                }

                if (!isValid) {
                    var message = this.acceptErrorMessage
                        || '仅接受以下文件格式：' + this.accept.join(',');
                    this.notifyFail(message);
                }

                return isValid;
            }
            else {
                return true;
            }
        };

        /**
         * 提交文件上传
         */
        Uploader.prototype.submit = function () {
            // IE有个BUG，如果在一个`<form>`中有另一个`<form>`，
            // 那么就不能修改内层`<form>`的`innerHTML`值，
            // 因此我们把内层`<form>`单独写在某个地方，
            // 当需要提交时，把所有的`<input>`丢到这个`<form>`下，
            // 提交完毕后再拿回来
            this.showUploading();
            var inputs = this.helper.getPart('input-container');
            var form = this.helper.getPart('form');
            form.appendChild(inputs);
            form.submit();
            this.main.insertBefore(inputs, this.main.firstChild);
        };

        /**
         * 上传文件
         *
         * @protected
         */
        Uploader.prototype.receiveFile = function () {
            var input = this.helper.getPart('input');
            var fileName = input.value;
            if (fileName && this.checkFileFormat(fileName)) {
                this.fire('receive');
                if (this.autoUpload) {
                    this.submit();
                }
            }
        };

        /**
         * 提示用户正在上传
         *
         * @protected
         */
        Uploader.prototype.showUploading = function () {
            this.removeState('complete');
            if (this.busyText) {
                this.addState('busy');

                var indicator = this.helper.getPart('indicator');
                indicator.innerHTML = u.escape(this.busyText);
            }
        };

        /**
         * 显示上传结果
         *
         * @param {Object} options 上传结果
         * @protected
         */
        Uploader.prototype.showUploadResult = function (options) {
            // 如果成功，`options`格式为：
            // {
            //    "success": "true" | true,
            //    "message": {},
            //    "result": {
            //        "content": "231",
            //        "url": "http://baidu.com"
            //    }
            // }
            //
            // 或`code`格式
            //
            // {
            //    "code": 0,
            //    "message": {},
            //    "result": {
            //        "content": "231",
            //        "url": "http://baidu.com"
            //    }
            // }
            //
            // 如果上传失败，`options`必须是以下格式
            // {
            //    "success": "false" | false,
            //    "message": "错误信息"
            // }
            // 及sdk兼容格式
            // {
            //    "success": "false" | false,
            //    "message": {
            //         "ERROR": "错误信息"
            //    }
            // }
            //
            // 或`code`格式:
            //
            // {
            //    "code": 1,
            //    "message": "错误信息"
            // }
            // 及sdk兼容格式
            // {
            //    "code": 1,
            //    "message": {
            //         "ERROR": "错误信息"
            //    }
            // }
            var result = options.result;
            if (options.success === false || options.success === 'false' || options.code === 1) {
                if (typeof options.message === 'object' && options.message.ERROR) {
                    this.notifyFail(options.message.ERROR);
                }
                else {
                    this.notifyFail(options.message);
                }
            }
            else if (result) {
                this.fileInfo = result;
                this.rawValue = result.content || result.url || result.previewUrl || '';
                this.fire('complete');
                this.notifyComplete(options.result);
            }
        };

        /**
         * 通知上传失败
         *
         * @param {string} message 失败消息
         * @protected
         */
        Uploader.prototype.notifyFail = function (message) {
            this.clear();
            var fail = this.fire('fail', message);
            if (!fail.isDefaultPrevented()) {
                var validity = new Validity();
                var state = new ValidityState(false, message);
                validity.addState('upload', state);
                this.showValidity(validity);
            }
            this.removeState('busy');
        };

        /**
         * 通知上传完成
         *
         * @param {Object} info 成功结果
         * @protected
         */
        Uploader.prototype.notifyComplete = function (info) {
            setStateToComplete.call(this, info);

            if (this.completeText) {
                // 提示已经完成
                var indicator = this.helper.getPart('indicator');
                indicator.innerHTML = u.escape(this.completeText);
            }
            // 一定时间后回到可上传状态
            this.timer = setTimeout(
                lib.bind(this.removeState, this, 'complete'),
                1000
            );
        };

        /**
         * 显示预览
         *
         * @param {Object} info 预览信息
         * @protected
         */
        Uploader.prototype.showPreview = function (info) {
            if (!info) {
                info = this.fileInfo;
            }

            if (this.previewContainer) {
                var container = this.viewContext.get(this.previewContainer);
                if (!container) {
                    return;
                }

                var properties = {
                    imageType: info ? info.type : (this.fileType || 'auto'),
                    url: this.getPreviewUrl(),
                    width: info ? info.width : null,
                    height: info ? info.height : null
                };
                container.setProperties(properties);
            }
        };

        /**
         * 获取后端返回的信息
         * @return {Object} 后端返回的结构体
         */
        Uploader.prototype.getFileInfo = function () {
            return this.fileInfo || null;
        };

        Uploader.prototype.getRawValueProperty = Uploader.prototype.getRawValue;

        /**
         * 获取用户选择的文件名
         *
         * @return {string}
         */
        Uploader.prototype.getFileName = function () {
            if (this.fileInfo && this.fileInfo.fileName) {
                return this.fileInfo.fileName;
            }
            else {
                var input = this.helper.getPart('input');
                var value;
                value = input.value;
                return value.split('\\').pop() || '';
            }
        };

        /**
         * 获取上传的文件的预览URL，只有成功上传后才能获取
         *
         * @return {string}
         * @protected
         */
        Uploader.prototype.getPreviewUrl = function () {
            return this.fileInfo ? (this.fileInfo.previewUrl || this.fileInfo.url) : '';
        };

        /**
         * 获取反CSRF的Token
         *
         * @return {string}
         * @protected
         */
        // Uploader.prototype.getSessionToken = function () {
        //     return '';
        // };

        /**
         * 清空input文件内容
         */
        Uploader.prototype.clear = function () {
            this.set('fileInfo', {});
        };

        /**
         * 清空input文件内容
         * 兼容之前的版本
         *
         * @deprecated
         */
        Uploader.prototype.reset = Uploader.prototype.clear;

        /**
         * 销毁控件
         *
         * @override
         */
        Uploader.prototype.dispose = function () {
            var form = this.helper.getPart('form');
            lib.removeNode(form);
            delete window.esuiShowUploadResult[this.callbackName];

            InputControl.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Uploader, InputControl);
        require('esui').register(Uploader);
        return Uploader;
    }
);

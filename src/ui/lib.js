/**
 * @file UI基础库扩展
 * @author Justineo(justice360@gmail.com)
 */
define(
    function (require) {
        /**
         * 工具对象
         * @singleton
         */
        var u = require('underscore');
        var lib = require('esui/lib');
        var libx = {};

        /**
         * Events
         */
        var event = {};

        /**
         * 获取事件对象
         * @param {Event|undefined} event 事件对象
         * @return {HTMLElement} 事件对象
         */
        event.getEvent = function (evt) {
            return evt || window.event;
        };

        /**
         * 获取事件相关目标对象
         * @param {Event|undefined} event 事件对象
         * @return {HTMLElement} 事件相关目标对象
         */
        event.getRelatedTarget = function (evt) {
            evt = event.getEvent(evt);
            return evt.relatedTarget || evt.fromElement || evt.toElement;
        };

        /**
         * 为DOM元素添加事件，支持代理
         *
         * 本方法 *不处理* DOM事件执行顺序
         *
         * @param {HTMLElement|string} element DOM元素或其id
         * @param {string} [selector] 选择器，在代理事件时用来选择被代理元素
         * @param {string} type 事件类型， *不能* 带有`on`前缀
         * @param {Function} listener 事件处理函数
         */
        libx.on = function (element, selector, type, listener) {
            // function (element, type, listener)
            if (arguments.length === 3) {
                lib.on(element, selector /* type */, type /* listener */);
            }
            // function (element, selector, type, listener)
            else if (arguments.length === 4) {
                if (type === 'mouseenter' || type === 'mouseleave') {
                    var actualType = {
                        mouseenter: 'mouseover',
                        mouseleave: 'mouseout'
                    }[type];
                    lib.on(element, actualType, function (evt) {
                        var target = event.getTarget(evt);
                        var related = event.getRelatedTarget(evt);
                        var match;

                        while (target && !(match = dom.matches(target, selector)) && target !== element) {
                            target = target.parentNode;
                        }

                        if ( match && target !== related && !lib.dom.contains(target, related) ) {
                            listener.call(element, {
                                target: target,
                                relatedTarget: related,
                                stopPropagation: function () {
                                    lib.event.stopPropagation(evt);
                                },
                                preventDefault: function () {
                                    lib.event.preventDefault(evt);
                                }
                            });
                        }
                    });
                }
                else {
                    lib.on(element, type, function (evt) {
                        if (dom.matches(event.getTarget(evt), selector)) {
                            listener.call(element, evt);
                        }
                    });
                }
            }
        };

        u.defaults(event, lib.event);

        /**
         * DOM
         */
        var dom = {};

        /**
         * 判断一个元素是否能匹配某个选择器
         *
         * @param {Element} element 需要判断的元素
         * @param {string} selector 选择器字符串
         * @return {boolean} 是否匹配
         */
        dom.matches = function (element, selector) {
            // 按国内市场占有率排序
            var nativeMatches = element.webkitMatchesSelector
                || element.msMatchesSelector
                || element.matches
                || element.mozMatchesSelector;
            if (nativeMatches) {
                return nativeMatches.call(element, selector);
            }

            // polyfill form https://developer.mozilla.org/en-US/docs/Web/API/Element.matches#Polyfill
            var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
            var i = 0;

            while (matches[i] && matches[i] !== element) {
                i++;
            }

            return matches[i] ? true : false;
        };

        u.defaults(dom, lib.dom);

        u.extend(libx, {
            event: event,
            dom: dom
        });

        return u.defaults(libx, lib);
    }
);

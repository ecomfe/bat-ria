/**
 * Copyright 2014 Baidu Inc. All rights reserved.
 * 
 * @file Navigator
 * @author chestnutchen(chenli11@baidu.com)
 * @date $DATE$
 */
define(function (require) {
    var u = require('underscore');
    var locator = require('er/locator');
    var permission = require('er/permission');
    var lib = require('esui/lib');

    /**
     * @class Navigator
     *
     * 导航单例
     * 使用当前er action path来进行匹配确定是否高亮
     * include规则进行匹配
     * exclude规则进行过滤
     *
     * @usage
     * 在html中放一个div或者ul元素，<ul id="nav" class="nav"></ul>
     * 初始化er前
     * req('bat-ria/ui/navigator').init('nav', globalConfig.nav);
     *
     * @singleton
     */
     function Navigator () {}

     Navigator.prototype.config = null;
     Navigator.prototype.navItems = {};
     Navigator.prototype.subNavs = {};

    /**
     * 初始化导航
     *
     * @param {String} domId  dom元素id
     * @param {Array} config  配置数组
     *
     * @cfg {String} [config.text]  导航文本
     * @cfg {String} [config.url]  er内部hash路径
     * @cfg {String} [config.externalUrl]  外部路径，优先跳转
     * @cfg {Array} [config.include]  需要高亮该导航的action路径规则
     * @cfg {Array} [config.exclude]  不需要高亮该导航的action路径规则
     * @cfg {Array} [config.children]  子导航，结构和config中每一项保持一致
     * 
     * @sample:
     * [{
     *      text: '主页',
     *      url: '/',                           // redirect using er/locator
     *      externalUrl: '',                    // redirect using url navigation
     *      include: [
     *          /\/validation\/check\/create/,  // can be a regexp
     *          '/validation/check/edit'        // string of url either
     *      ],
     *      exclude: [
     *          '/validation/check/update'
     *      ],
     *      auth: 'auth.promotion',             // authority to display nav item
     *      children: []                        // child navigator
     * }]
     */
     Navigator.prototype.init = function (domId, config) {
        if (!config) {
            unexceptedError('Navigator config is null!');
            return;
        }

        this.main = document.getElementById(domId);
        if (!this.main) {
            unexceptedError('Can not find navigator main element!');
            return;
        }

        var nav = null;
        this.config = config;

        if (this.main.tagName.toLowerCase() === 'ul') {
            nav = this.main;
        }
        else {
            nav = document.createElement('ul');
            this.main.appendChild(nav);
        }

        createNavElements(this.config, this.navItems, nav);

        locator.on('redirect', u.bind(this.handleRedirect, this));

        this.handleRedirect({
            url: location.hash.slice(1)
        });

    };

    /**
     * locator redirect的时候处理navigator的主要逻辑
     * 先将对应一级导航高亮
     * 如果该导航下有二级导航，创建或者显示出来，并高亮二级导航对应元素
     */
    Navigator.prototype.handleRedirect = function (e) {
        var me = this;
        u.some(this.config, function (item, index) {
            var navItems = me.navItems;
            var subNavs = me.subNavs;
            var children = item.children || '';

            if (isActive(e.url, item)) {
                activateNavElement(navItems, navItems[index], index, 'nav-item-current');

                if (children.length) {
                    subNavs[index] = subNavs[index] || {};
                    createOrShowSubNav(item.children, navItems, subNavs, me.main, index);

                    u.some(children, function (subItem, subIndex) {
                        if (isActive(e.url, subItem)) {
                            var subNavItems = subNavs[index].navItems;
                            activateNavElement(subNavItems, subNavItems[subIndex],
                                subIndex, 'nav-sub-item-current');

                            return true;
                        }
                    });
                }
                else {
                    toggleSubNav(subNavs);
                }

                return true;
            }
        });
    };

    /**
     * 高亮当前导航元素
     *
     * @navItems {object} 缓存导航的集合，传入来记录当前高亮的索引
     * @element {object} 要高亮的元素
     * @index {string} 要高亮的导航索引
     * @className {string} 通过添加和移除current className来更换高亮样式
     */
    function activateNavElement(navItems, element, index, className) {
        if (!u.isNumber(navItems.activeIndex)) {
            navItems.activeIndex = index;
        }
        else if (u.isNumber(index)) {
            lib.removeClass(navItems[navItems.activeIndex], className);
            navItems.activeIndex = index;
        }

        lib.addClass(element, className);
    }

    /**
     * 展示或隐藏二级导航
     *
     * @navItems {object} 缓存导航的集合，传入来记录当前高亮的索引
     * @element {object} 要高亮的元素，不传表示隐藏所有
     * @index {string} 要高亮的导航索引
     */
    function toggleSubNav(navItems, element, index) {
        var className = 'nav-sub-current';

        if (!element && u.isNumber(navItems.activeIndex)) {
            lib.removeClass(navItems[navItems.activeIndex].nav, className);
            navItems.activeIndex = null;
        }
        else if (u.isNumber(index)) {
            if (!u.isNumber(navItems.activeIndex)) {
                navItems.activeIndex = index;
            }
            else {
                lib.removeClass(navItems[navItems.activeIndex].nav, className);
                navItems.activeIndex = index;
            }

            lib.addClass(element, className);
        }
    }

    /**
     * 创建nav元素
     * 
     * @config {object} globalconfig
     * @navItems {object} 缓存nav元素的对象
     * @nav {object} nav父元素
     * @isSub {string} '' 或 'sub-'，主导航或二级子导航 
     */
    function createNavElements(config, navItems, nav, isSub) {
        isSub = isSub || '';
        u.each(config, function (item, index) {
            if (!item.auth || permission.isAllow(item.auth)) {
                var url = item.externalUrl || ('#' + item.url);
                var element = document.createElement('li');
                var separate = '';

                element.className = 'nav-' + isSub + 'item';
                element.innerHTML = '<a href="' + url + '">'
                                        + '<span>' + u.escape(item.text) + '</span>'
                                    + '</a>';

                nav.appendChild(element);
                if (isSub && index < u.size(config) - 1) {
                    separate = document.createElement('li');
                    separate.className = 'nav-sub-item nav-sub-separate';
                    separate.innerHTML = '|';
                    nav.appendChild(separate);
                }

                navItems[index] = element;
            }
        });
    }

    /**
     * 创建二级nav元素，如果存在，直接展示
     *
     * @config {object} config.children，某个主导航的二级导航配置
     * @navItems {object} 缓存一级导航的对象，用来计算位置
     * @subNavs {object} 缓存二级导航的对象
     * @parentNav {object} 一级导航容器
     * @index {string} 一级导航navElement的index
     */
    function createOrShowSubNav(config, navItems, subNavs, main, index) {
        var className = 'nav-sub-current';
        var ul = subNavs[index].nav;

        if (!u.isObject(ul)) {
            ul = document.createElement('ul');
            ul.className = 'nav-sub';
            lib.insertAfter(ul, main);

            subNavs[index].nav = ul;
            subNavs[index].navItems = {};
            createNavElements(config, subNavs[index].navItems, ul, 'sub-');
        }

        toggleSubNav(subNavs, subNavs[index].nav, index);

        // 二级导航位置的计算，二级导航的长度默认为去除最右子元素的边距后的剩余长度
        // 然后将二级导航的垂直平分线与一级导航子元素对齐
        var navOffset = lib.getOffset(main);
        var navItemOffset = lib.getOffset(navItems[index]);
        var subNavOffset = lib.getOffset(ul);
        var middleOfNavItem = navItemOffset.left + navItemOffset.width / 2;
        var marginLeft = (middleOfNavItem - subNavOffset.width / 2);
        if (marginLeft < -navOffset.left + 10) {
            marginLeft = -navOffset.left + 10;
        }
        ul.style.cssText = 'margin-left: ' + marginLeft + 'px';
    }

    /**
     * 验证url是否匹配
     *
     * @url {string} 当前页面的er path
     * @patterns {RegExp | string} 验证的表达式或path
     */
    function testUrlIn(url, patterns) {
        return u.some(patterns, function(pattern) {
            if (u.isFunction(pattern.test)) {
                return pattern.test(url);
            }
            else {
                return pattern === url;
            }
        });
    }

    /**
     * 验证url是否命中某个导航元素config的规则
     *
     * @url {string} 当前页面的er path
     * @patterns {RegExp | string} 验证的表达式或path
     */
    function isActive(url, item) {
        return !testUrlIn(url, item.exclude || []) && testUrlIn(url, item.include || []);
    }

    function unexceptedError(message) {
        throw {
            name: 'System Error',
            message: message ? message : 'Unknow Error'
        };
    }

    var commonNavigator = new Navigator(); 

    return {
        init: u.bind(commonNavigator.init, commonNavigator)
    };

});
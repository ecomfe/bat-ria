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
    // var URL = require('er/URL');
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
     Navigator.prototype.activeIndex = null;
     Navigator.prototype.navItems = {};

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
     * @cfg {Array} [config.children]  子导航，结构和config中每一项保持一致，TODO
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
     *      children: []                        // TODO: add it
     * }]
     */
     Navigator.prototype.init = function (domId, config) {
        if (!config) {
            unexceptedError('Navigator config is null!');
            return;
        }

        var main = document.getElementById(domId);
        if (!main) {
            unexceptedError('Can not find navigator main element!');
            return;
        }

        var nav = null;
        this.config = config;

        if (main.tagName.toLowerCase() === 'ul') {
            nav = main;
        }
        else {
            nav = document.createElement('ul');
            main.appendChild(nav);
        }

        var me = this;
        u.each(config, function (item, index) {
            if (!item.auth || permission.isAllow(item.auth)) {
                var url = item.externalUrl || ('#' + item.url);
                var element = createNavElement(index, item.text, url);
                nav.appendChild(element);
                me.navItems[index] = element;
            }
        });

        locator.on('redirect', u.bind(this.handleRedirect, this));

        var index = location.href.indexOf('#');
        var url = (index !== -1 ? location.href.slice(index + 1) : '');
        this.handleRedirect({
            url: url
        });

    };

    Navigator.prototype.handleRedirect = function (e) {
        var me = this;
        var url = URL.parse(e.url).getPath();
        u.some(this.config, function (item, index) {
            var include = item.include || [];
            var exclude = item.exclude || [];
            if (!testUrlIn(url, exclude) && testUrlIn(url, include)) {
                me.activeTab(index);
                return true;
            }
        });
    };

    Navigator.prototype.activeTab = function (index) {
        var item = this.navItems[index];
        if (this.activeIndex === null) {
            this.activeIndex = index;
        }
        else {
            lib.removeClass(this.navItems[this.activeIndex], 'nav-item-current');
            this.activeIndex = index;
        }
        lib.addClass(item, 'nav-item-current');
    };

    function createNavElement(index, text, url) {
        var li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML =  '<a href="' + url + '" data-nav-index="' + index + '">'
                            + '<span>' + u.escape(text) + '</span>'
                        + '</a>';
        return li;
    }

    function testUrlIn(url, patterns) {
        return u.some(patterns, function (pattern) {
            if (typeof pattern.test === 'function') {
                return pattern.test(url);
            }
            else {
                return pattern === url;
            }
        });
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

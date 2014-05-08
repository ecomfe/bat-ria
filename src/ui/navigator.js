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
    var URL = require('er/URL');
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
     * req('bat-ria/ui/Navigator').init('nav', globalConfig.nav);
     *
     * @singleton
     */
     function Navigator () {}

     Navigator.prototype.config = null;
     Navigator.prototype.activeIndex = null;
     Navigator.prototype.navItems = [];

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

        var me = this;
        this.config = config;

        var nav = document.createElement('ul');
        nav.className = 'nav';

        u.each(config, function (item, index) {
            if (!item.auth || permission.isAllow(item.auth)) {
                var url = (item.externalUrl ? item.externalUrl : '#' + item.url);
                var element = createNavElement(index, item.text, url);
                nav.appendChild(element);
                me.navItems.push(element);
            }
        });

        main.appendChild(nav);

        locator.on('redirect', u.bind(this.handleRedirect, this));

        this.handleRedirect({
            url: location.hash.slice(1)
        });

    };

    Navigator.prototype.handleRedirect = function (e) {
        var me = this;
        u.each(this.config, function (item, index) {
            var include = item.include || [];
            var exclude = item.exclude || [];
            if (include.length > exclude.length && exclude.length) {
                if ( !testUrlIn(e.url, exclude) && testUrlIn(e.url, include) ) {
                    me.activeTab(index);
                }
            }
            else if ( testUrlIn(e.url, include) ) {
                me.activeTab(index);
            }
        });
    };

    Navigator.prototype.activeTab = function (index) {
        var item = this.navItems[index];
        if (this.activeIndex == null) {
            this.activeIndex = index;
        }
        else {
            lib.removeClass(this.navItems[this.activeIndex], 'nav-item-current');
            this.activeIndex = index;
        }
        lib.addClass(item, 'nav-item-current');
    };

    function createNavElement (index, text, url) {
        var li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML =  '<a href="' + url + '" data-nav-index="' + index + '">'
                            + '<span>' + u.escape(text) + '</span>'
                        + '</a>';
        return li;
    }

    function testUrlIn (url, rule) {
        res = false;
        u.every(rule, function (r) {
            if (typeof r == 'object' && r.test) {
                if (r.test(url)){
                    res = true;
                    return;
                }
            }
            else if (r == url) {
                res = true;
                return;
            }
        });
        return res;
    }

    function unexceptedError (message) {
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
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
    var URL = require('er/URL');
    var lib = require('esui/lib');
    var commonNavigator;

    function CommonNavigator () {}

    CommonNavigator.prototype.config = null;
    CommonNavigator.prototype.activedIndex = null;
    CommonNavigator.prototype.navItems = [];

    /**
     * 初始化导航
     *
     * @param domId {String} dom元素id 
     * @param config {Array} 
     * 
     * [{
     *      text: '主页',
     *      location: {
     *          redirectUrl: '/',
     *          pattern: /\/validation/,          //(可选)
     *          include: [
     *              '/validation/check/create',
     *              '/validation/check/edit'
     *          ],
     *          exclude: [
     *              '/validation/check/update'
     *          ]
     *      }
     * }]
     *
     * 使用当前er path来进行匹配确定是否高亮
     * 先检查include里边的内容，如有匹配则高亮该nav item
     * 如果没有填写include，使用pattern匹配，并检查exclude
     * 如果不在exclude中则高亮该nav item
     *
     * @usage
     * req('bat-ria/ui/Navigator').init('nav', globalConfig.nav);
     *
     */
    CommonNavigator.prototype.init = function (domId, config) {
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
        nav.className = 'ui-nav-navigator';

        u.each(config, function (item, index) {
            var location = item.location || {};
            var element = createNavElement(index, item.text)
            nav.appendChild(element);
            me.navItems.push(element);
        });

        main.appendChild(nav);

        lib.on(nav, 'click', u.bind(this.handleClickTab, this));
        locator.on('redirect', u.bind(this.handleRedirect, this));

        this.handleRedirect({
            url: location.hash.slice(1)
        });

    };

    CommonNavigator.prototype.handleRedirect = function (e) {
        var me = this;
        u.each(this.config, function (item, index) {
            var location = item.location || {};
            var include = location.include;
            var exclude = location.exclude;
            var pattern = location.pattern;
            if (include && include.length) {
                u.each(include, function (url, index) {
                    if (e.url == url) {
                        me.activeTab(index);
                    }
                });
            }
            else if (pattern && pattern.test(e.url)) {
                var ignore = false;
                if (exclude && exclude.length) {
                    u.each(exclude, function (url, index) {
                        if (e.url == url) {
                            ignore = true;
                        }
                    });
                }
                if (!ignore) {
                    me.activeTab(index);
                }
            }
        });
    };

    CommonNavigator.prototype.activeTab = function (index) {
        var item = this.navItems[index];
        if (this.activedIndex == null) {
            this.activedIndex = index;
        }
        else {
            lib.removeClass(this.navItems[this.activedIndex], 'ui-nav-item-active');
            this.activedIndex = index;
        }
        lib.addClass(item, 'ui-nav-item-active');
    };

    CommonNavigator.prototype.handleClickTab = function (e) {
        e = e || window.event;
        if (e && e.target) {
            var index = e.target.getAttribute('nav-index');
            locator.redirect(this.config[index].location.redirectUrl);
        }
    }

    function createNavElement (index, text) {
        var element = document.createElement('li');
        //var span = document.createElement('span');
        element.className = 'ui-nav-item';
        element.setAttribute('nav-index', index);
        //span.setAttribute('nav-index', index);
        //span.appendChild(document.createTextNode(text));
        element.appendChild(document.createTextNode(text));
        //element.appendChild(span);
        return element;
    }

    function unexceptedError (message) {
        throw {
            name: 'System Error',
            message: message ? message : 'Unknow Error'
        }
    }

    if (commonNavigator) {
        return commonNavigator;
    }
    else {
        commonNavigator = new CommonNavigator();
        return commonNavigator;
    }

});
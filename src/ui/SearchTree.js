/**
 * JN 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 搜索树控件
 * @author loutongbing(loutongbing@baidu.com)
 */

define(
    function (require) {
        require('esui/Tree');
        require('esui/Label');
        require('esui/Panel');
        require('esui/SearchBox');
        var painter = require('esui/painters');
        var ui = require('esui/main');
        var lib = require('esui/lib');
        var u = require('underscore');
        var TreeStrategy = require('./SearchTreeStrategy');
        var InputControl = require('esui/InputControl');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function SearchTree(options) {
            InputControl.apply(this, arguments);
        }
        lib.inherits(SearchTree, InputControl);

        /**
         * 控件类型，始终为`"SearchTree"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        SearchTree.prototype.type = 'SearchTree';
        SearchTree.prototype.styleType = 'SearchTree';

        SearchTree.prototype.initOptions = function (options) {
            var properties = {
                // 数据源
                datasource: null,
                // 树的相关属性
                defaultExpand: true,
                wideToggleArea: false,
                onlyLeafSelect: false,
                allowUnselectNode: false,
                hideRoot: true,
                treeSkin: 'flat',
                height: '200',
                width: '200',
                // 是否有搜索功能
                hasSearchBox: true,
                // 这个字段是对腿部信息的填充
                itemName: '结果',
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果',
                // 是否刷新数据时保持搜索状态
                holdState: false
            };


            if (options.hasSearchBox === 'false') {
                options.hasSearchBox = false;
            }

            if (options.holdState === 'false') {
                options.holdState = false;
            }

            lib.extend(properties, options);
            // properties.width = Math.max(200, properties.width);
            this.setProperties(properties);

        };

        /**
         * @override
         */
        SearchTree.prototype.initStructure = function () {
            /* eslint-disable fecs-indent */
            var tpl = [
                // 内容
                '<div data-ui="type:Panel;childName:body;"',
                ' class="${bodyClass}">',
                    '${searchInput}',
                    // 搜索结果列表区
                    '<div data-ui="type:Panel;childName:content"',
                    ' class="${contentClass}">',
                        // 结果为空提示
                        '<div data-ui="type:Label;childName:emptyText"',
                        ' class="${emptyTextClass}">${emptyText}</div>',
                        // 结果列表
                        '<div data-ui="type:Panel;childName:queryList"',
                        ' class="${queryListClass}">',
                        '</div>',
                    '</div>',
                '</div>'
            ];
            /* eslint-enable fecs-indent */

            var helper = this.helper;
            var searchInput = '';
            if (this.hasSearchBox) {
                var searchBoxWidth = this.width - 45;
                // var searchBoxWidth = 150;
                searchInput = [
                    // 搜索区
                    '<div data-ui="type:Panel;childName:searchBoxArea"',
                    ' class="${searchWrapperClass}">',
                    '<div data-ui="type:SearchBox;childName:itemSearch;"',
                    ' data-ui-skin="magnifier"',
                    ' data-ui-width="' + searchBoxWidth + '">',
                    '</div>',
                    '</div>',
                    // 搜索结果概要
                    '<div data-ui="type:Panel;',
                    'childName:generalQueryResultArea"',
                    ' class="${generalQueryResultClass}"',
                    ' id="${queryResultId}">',
                    '<span class="${linkClass}" id="${linkId}">清空</span>',
                    '共找到<span id="${queryResultCountId}"></span>个',
                    '</div>'
                ].join('\n');

                searchInput = lib.format(
                    searchInput,
                    {
                        searchWrapperClass:
                            helper.getPartClassName('search-wrapper'),
                        generalQueryResultClass:
                            helper.getPartClassName('query-result-general'),
                        queryResultCountId: helper.getId('result-count'),
                        linkClass: helper.getPartClassName('clear-query-link'),
                        linkId: helper.getId('clear-query')
                    }
                );
            }

            this.main.style.width = this.width + 'px';
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    bodyClass: helper.getPartClassName('body'),
                    searchInput: searchInput,
                    contentClass: helper.getPartClassName('content-wrapper'),
                    emptyTextClass: helper.getPartClassName('empty-text'),
                    emptyText: this.emptyText,
                    queryListClass: helper.getPartClassName('query-list')
                }
            );

            this.initChildren();

            var clearQueryLink = helper.getPart('clear-query');
            if (clearQueryLink) {
                helper.addDOMEvent(
                    clearQueryLink,
                    'click',
                    u.bind(this.clearQuery, this)
                );
            }

            var searchBox = this.getSearchBox();
            if (searchBox) {
                searchBox.on('search', this.search, this);
            }

            lib.addClass(
                this.main,
                'ui-searchtree'
            );
        };

        SearchTree.prototype.search = function (e) {
            var keyword = lib.trim(e.target.getValue());
            // 查询
            this.queryItem(keyword);
            // 更新概要搜索结果区
            this.refreshResult();
            // 更新状态
            this.addState('queried');
            // 调整高度
            this.adjustHeight();
        };

        SearchTree.prototype.refreshResult = function () {
            var count = this.getCurrentStateItemsCount();
            this.helper.getPart('result-count').innerHTML = count;
        };

        /**
         * 清除搜索结果
         * @return {false} 阻止默认行为
         * @ignore
         */
        SearchTree.prototype.clearQuery = function () {
            // 更新状态
            this.removeState('queried');

            // 清空搜索框
            var searchBox = this.getSearchBox();
            if (searchBox) {
                searchBox.set('text', '');
            }

            // 清空数据
            this.clearData();

            // 概要搜索结果区归零
            this.refreshResult();

            // 更新备选区
            this.refreshContent();
            // 调整高度
            this.adjustHeight();
            if (this.curSeleId) {
                this.selectItem(this.curSeleId, true);
            }
            return false;
        };
        /**
         * 获取结果列表承载容器控件，列表在它里面
         * @return {ui.Panel}
         * @ignore
         */
        SearchTree.prototype.getContent = function () {
            var body = this.getChild('body');
            if (body) {
                return body.getChild('content');
            }
            return null;
        };

        SearchTree.prototype.getKeyword = function () {
            var searchBox = this.getSearchBox();
            var isQuery = this.isQuery();
            if (searchBox && isQuery) {
                return lib.trim(searchBox.getValue());
            }
            return null;
        };

        /**
         * 获取结果列表控件
         * @return {ui.TreeForSelector | ui.ListForSelector}
         * @ignore
         */
        SearchTree.prototype.getQueryList = function () {
            var content = this.getContent();
            if (content) {
                return content.getChild('queryList');
            }
            return null;
        };
        /**
         * 获取搜索控件
         * @return {ui.Panel}
         * @ignore
         */
        SearchTree.prototype.getSearchBox = function () {
            var searchBoxArea =
                this.getChild('body').getChild('searchBoxArea');
            if (searchBoxArea) {
                return searchBoxArea.getChild('itemSearch');
            }
        };

        /**
         * 判断是否处于query状态
         * @return {boolean}
         */
        SearchTree.prototype.isQuery = function () {
            return this.hasState('queried');
        };

        /**
         * 调整高度。
         * 出现搜索信息时，结果区域的高度要变小，才能使整个控件高度不变
         *
         */
        SearchTree.prototype.adjustHeight = function() {
            // 用户设置总高度
            var settingHeight = this.height;

            // 头部高度 contentHeight + border
            var headHeight = 28;

            // 是否有搜索框
            var searchBoxHeight = this.hasSearchBox ? 45 : 0;

            // 是否有腿部信息
            var footHeight = this.hasFoot ? 25 : 0;

            var content = this.getContent().main;
            if (settingHeight === 'auto') {
                content.style.height = 'auto';
            }
            else {
                // 结果区高度 = 总高度 - 头部高度 - 搜索框高度 - 腿部高度
                var contentHeight =
                    settingHeight - headHeight - searchBoxHeight - footHeight;

                // 处于query状态时，会有一个30px的概要信息区
                if (this.isQuery()) {
                    contentHeight -= 30;
                }


                content.style.height = contentHeight + 'px';
            }

        };

        /**
         * 手动刷新
         *
         * @ignore
         */
        SearchTree.prototype.refresh = function () {
            // 刷新搜索区
            if (this.hasSearchBox) {
                // 有的时候需要保留搜索状态
                if (this.holdState && this.isQuery()) {
                    var keyword = this.getKeyword();
                    // 根据关键字获取结果
                    this.queryItem(keyword);
                }
                else {
                    // 清空搜索区
                    this.clearQuery();
                    // 重建数据
                    this.adaptData();
                    // 构建选区
                    this.refreshContent();
                }
            }
            else {
                // 重建数据
                this.adaptData();
                // 构建选区
                this.refreshContent();
            }

            // 更新高度
            this.adjustHeight();
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        SearchTree.prototype.repaint = painter.createRepaint(
            SearchTree.prototype.repaint,
            {
                name: 'datasource',
                paint: function (control, datasource) {
                    control.refresh();
                }
            }
        );
        /**
         * 适配数据，创建一个全集扁平索引
         *
         * @ignore
         */
        SearchTree.prototype.adaptData = function () {
            // 这是一个不具备任何状态的东西
            this.allData = this.datasource;
            // 一个扁平化的索引
            // 其中包含父节点信息，以及节点选择状态
            var indexData = {};
            if (this.allData && this.allData.children) {
                indexData[this.allData.id] = {
                    parentId: null,
                    node: this.allData,
                    isSelected: false
                };
                walkTree(
                    this.allData,
                    this.allData.children,
                    function (parent, child) {
                        indexData[child.id] = {
                            parentId: parent.id,
                            node: child,
                            isSelected: false
                        };
                    }
                );
            }
            this.indexData = indexData;
        };

        /**
         * 刷新备选区
         * @override
         */
        SearchTree.prototype.refreshContent = function () {
            var treeData = this.isQuery() ? this.queriedData : this.allData;
            if (!treeData
                || !treeData.children
                || !treeData.children.length) {
                this.addState('empty');
            }
            else {
                this.removeState('empty');
            }

            if (!treeData || !treeData.children) {
                return;
            }

            var queryList = this.getQueryList();
            var tree = queryList.getChild('tree');
            if (!tree) {
                var options = {
                    childName: 'tree',
                    datasource: treeData,
                    allowUnselectNode: this.allowUnselectNode,
                    strategy:
                        new TreeStrategy(
                            {
                                onlyLeafSelect: this.onlyLeafSelect,
                                defaultExpand: this.defaultExpand
                            }
                        ),
                    wideToggleArea: this.wideToggleArea,
                    hideRoot: this.hideRoot,
                    selectMode: 'single',
                    skin: this.treeSkin
                };
                if (this.getItemHTML) {
                    options.getItemHTML = this.getItemHTML;
                }
                tree = ui.create('Tree', options);
                queryList.addChild(tree);
                tree.appendTo(queryList.main);

                var me = this;
                var indexData = this.indexData;
                tree.on(
                    'selectnode',
                    function (e) {
                        var node = e.node;
                        me.selectItem(node.id, true);
                        me.fire('change');
                    }
                );

                tree.on(
                    'unselectnode',
                    function (e) {
                        var node = e.node;
                        if (indexData[node.id]) {
                            indexData[node.id].isSelected = false;
                        }
                    }
                );
            }
            else {
                tree.setProperties({
                    'datasource': u.deepClone(treeData),
                    'keyword': this.getKeyword()
                });
            }

        };

        /**
         * 撤销选择当前项
         * @param {ui.SearchTree} control 类实例
         * @ignore
         */
        function unselectCurrent(control) {
            var curId = control.curSeleId;
            // 撤销当前选中项
            if (curId) {
                var treeList = control.getQueryList().getChild('tree');
                treeList.unselectNode(curId);
                control.curSeleId = null;
            }
        }

        /**
         * 获取指定状态的叶子节点，递归
         *
         * @param {Array=} data 检测的数据源
         * @param {boolean} isSelected 选择状态还是未选状态
         * @return {Array} 子节点数组
         * @ignore
         */
        SearchTree.prototype.getLeafItems = function (data, isSelected) {
            var leafItems = [];
            var me = this;
            var indexData = this.indexData;
            u.each(data, function (item) {
                if (isLeaf(item)) {
                    var indexItem = indexData[item.id];
                    var valid = (isSelected === indexItem.isSelected);
                    if (valid) {
                        leafItems.push(item);
                    }
                }
                else {
                    leafItems = u.union(
                        leafItems,
                        me.getLeafItems(item.children, isSelected)
                    );
                }
            });

            return leafItems;
        };
        /**
         * 选择或取消选择
         *   如果控件是单选的，则将自己置灰且将其他节点恢复可选
         *   如果控件是多选的，则仅将自己置灰
         * @param {Object} id 结点对象id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         * @ignore
         */
        SearchTree.prototype.selectItem = function (id, toBeSelected) {
            var tree = this.getQueryList().getChild('tree');
            // 完整数据
            var indexData = this.indexData;
            var item = indexData[id];

            if (!item) {
                return;
            }

            // 如果是单选，需要将其他的已选项置为未选
            if (toBeSelected) {
                unselectCurrent(this);
                // 赋予新值
                this.curSeleId = id;
            }

            item.isSelected = toBeSelected;
            if (toBeSelected) {
                tree.selectNode(id, true);
            }
            else {
                tree.unselectNode(id);
            }
        };

        /**
         * 或许当前已选择的数据
         *
         * @return {Object}
         * @public
         */
        SearchTree.prototype.getSelectedItem = function () {
            var me = this;
            return u.find(
                me.indexData,
                function(item) {
                    return item.node.id === me.curSeleId;
                }
            ).node;
        };
        /**
         * 或许当前已选择的id
         *
         * @return {Object}
         * @public
         */
        SearchTree.prototype.getSelectedId = function () {
            return this.curSeleId;
        };

        /**
         * 清空搜索的结果
         *
         */
        SearchTree.prototype.clearData = function() {
            // 清空数据
            this.queriedData = {};
        };

        /**
         * 搜索含有关键字的结果
         *
         * @param {string} keyword 关键字
         */
        SearchTree.prototype.queryItem = function (keyword) {
            var filteredTreeData = [];
            filteredTreeData = queryFromNode(keyword, this.allData);
            // 更新状态
            this.queriedData = {
                id: '-1', text: '符合条件的结果', children: filteredTreeData
            };
            this.addState('queried');
            this.refreshContent();
            if (this.curSeleId) {
                this.selectItem(this.curSeleId, true);
            }
        };

        /**
         * 供递归调用的搜索方法
         *
         * @param {string} keyword 关键字
         * @param {Object} node 节点对象
         * @return {Array} 结果集
         */
        function queryFromNode(keyword, node) {
            var filteredTreeData = [];
            var treeData = node.children;
            u.each(
                treeData,
                function (data, key) {
                    var filteredData;
                    // 命中，先保存副本
                    if (data.text.indexOf(keyword) !== -1) {
                        filteredData = u.clone(data);
                    }
                    // 如果子节点也有符合条件的，那么只把符合条件的子结点放进去
                    if (data.children && data.children.length) {
                        var filteredChildren = queryFromNode(keyword, data);
                        if (filteredChildren.length > 0) {
                            if (!filteredData) {
                                filteredData = u.clone(data);
                            }
                            filteredData.children = filteredChildren;
                        }
                    }

                    if (filteredData) {
                        filteredTreeData.push(filteredData);
                    }
                }
            );
            return filteredTreeData;
        }

        /**
         * 一个遍历树的方法
         *
         * @param {Object} parent 父节点
         * @param {Array} children 需要遍历的树的孩子节点
         * @param {Function} callback 遍历时执行的函数
         * @ignore
         */
        function walkTree(parent, children, callback) {
            u.each(
                children,
                function (child, key) {
                    callback(parent, child);
                    walkTree(child, child.children, callback);
                }
            );
        }

        function isLeaf(node) {
            return !node.children;
        }

        function getLeavesCount(node) {
            // 是叶子节点，但不是root节点
            if (isLeaf(node)) {
                // FIXME: 这里感觉不应该hardcode，后期想想办法
                if (!node.id || node.id === '-1' || node.id === '0') {
                    return 0;
                }
                return 1;
            }
            var count = u.reduce(
                node.children,
                function (sum, child) {
                    return sum + getLeavesCount(child);
                },
                0
            );
            return count;
        }


        /**
         * 获取当前状态的显示个数
         *
         * @return {number}
         * @override
         */
        SearchTree.prototype.getCurrentStateItemsCount = function () {
            var node = this.isQuery() ? this.queriedData : this.allData;
            if (!node) {
                return 0;
            }
            var count = getLeavesCount(node);
            return count;
        };


        require('esui').register(SearchTree);
        return SearchTree;
    }
);

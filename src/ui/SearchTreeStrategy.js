/**
 * Bat-ria (Branding Ad Team)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 搜索树的数据交互策略类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var TreeStrategy = require('esui/TreeStrategy');

        /**
         * 树的数据交互策略
         *
         * @param {Object=} options 初始化参数
         * @param {boolean=} options.defaultExpand 节点是否展开，默认为`true`
         * @param {boolean=} options.onlyLeafSelect 是否只有子节点可选，默认为`false`
         * @constructor
         * @extends esui.TreeStrategy
         */
        function SearchTreeStrategy(options) {
            var defaults = {
                onlyLeafSelect: false,
                defaultExpand: true
            };
            lib.extend(this, defaults, options);
        }

        lib.inherits(SearchTreeStrategy, TreeStrategy);

        /**
         * 开启选中/取消选中相关的策略
         *
         * @param {Tree} tree 控件实例
         * @override
         * @protected
         */
        SearchTreeStrategy.prototype.enableSelectStrategy = function (tree) {
            var me = this;
            tree.on(
                'select',
                function (e) {
                    var canSelect = true;
                    var isLeafNode = me.isLeafNode(e.node);
                    if (me.onlyLeafSelect && !isLeafNode) {
                        canSelect = false;
                    }

                    if (canSelect) {
                        this.selectNode(e.node.id);
                    }
                }
            );
            tree.on(
                'unselect',
                function (e) {
                    if (tree.get('allowUnselectNode')) {
                        tree.unselectNode(e.node.id);
                    }
                }
            );
        };

        return SearchTreeStrategy;
    }
);

/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 饼图封装控件
 * @author loutongbing(loutongbing@baidu.com)
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        require('echarts/chart/pie');
        var BaseChart = require('./BaseChart');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function PieChart(options) {
            BaseChart.apply(this, arguments);
        }

        lib.inherits(PieChart, BaseChart);


        PieChart.prototype.type = 'PieChart';
        PieChart.prototype.styleType = 'Chart';

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        PieChart.prototype.repaint = helper.createRepaint(
            BaseChart.prototype.repaint
        );

       /**
         * 初始化图表数据
         *
         * @override
         */
        PieChart.prototype.initChartOptions = function (originSeries) {
            return {
                animation: false,
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}<br/>{a} : {c} ({d}%)'
                },
                series: [
                    {
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '50%'],
                        data: originSeries.data,
                        name: originSeries.name,
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'outer',
                                    formatter: function () {
                                        // 由于 echarts 此次提交：
                                        // https://github.com/ecomfe/echarts/commit/151e7a87a661ccd1e4cab69d325f65ad7c28cb8e#diff-135257ccc0491223777def3de1ebba18，
                                        // 导致此处 formatter 回调函数的参数发生了变化。
                                        // 为了保证与最新版本 echarts 兼容，做一下 arguments 参数判断
                                        var args = arguments;
                                        if (args.length === 1) {
                                            return (args[0].percent - 0).toFixed(0) + '%';
                                        }
                                        if (args.length === 4) {
                                            return (args[3] - 0).toFixed(0) + '%';
                                        }
                                    }
                                },
                                labelLine: {
                                    show: true
                                }
                            }

                        }
                    }
                ]
            };
        };


        require('esui').register(PieChart);

        return PieChart;

    }
);

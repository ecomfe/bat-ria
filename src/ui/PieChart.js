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
                        type:'pie',
                        radius: '55%',
                        center: ['50%', '50%'],
                        data : originSeries.data,
                        name: originSeries.name,
                        itemStyle: {
                            normal: {
                                label: {
                                    position: 'outer',
                                    formatter: function (a, b, c, d) {
                                        return (d - 0).toFixed(0) + '%';
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

/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 线状图封装控件
 * @author lixiang(lixiang05@baidu.com),loutongbing(loutongbing@baidu.com)
        例子：
        ySeries =
        [
            {
                data: [
                    45000, 42000, 50000, 55000,
                    51000, 52000, 55000
                ], // 数据
                name: '广告位展现量', // 索引key
                label: '广告位展现量',
                markLine: {
                    data: [
                        {
                            type: 'average',
                            name: '平均值' }
                    ]
                }
            },
            {
                data: [200, 180, 280, 190, 290, 290, 283],
                name: '点击量', // 索引key
                label: '点击量'
            }
        ];

        xSeries =
        [
          '2013-04-25',
          '2013-04-26',
          '2013-04-27',
          '2013-04-28',
          '2013-04-29',
          '2013-04-30',
          '2013-05-01'
        ];
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var m = require('moment');
        var helper = require('esui/controlHelper');
        require('echarts/chart/line');
        var BaseChart = require('./BaseChart');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function LineChart(options) {
            BaseChart.apply(this, arguments);
        }

        lib.inherits(LineChart, BaseChart);


        LineChart.prototype.type = 'LineChart';
        LineChart.prototype.styleType = 'Chart';

        /**
         * 获得提示层的title
         */
        LineChart.prototype.getTipTitleHtml = function (params) {
            // 如果是日期，则需要显示星期几
            // 取一个数据做抽取就可以
            var title = params[0][1];
            var week = '';
            var date = m(title, 'YYYY-MM-DD');
            if (date.isValid()) {
                week = date.format('dddd');
            }
            title = title + ' ' + week;
            return title;
        };

        /**
         * 格式化y轴某条连续数据
         *
         * @param {Object} serie y轴数据
         * @param {number} index y轴数据索引
         * @return {Object} 返回格式化后的y轴显示所需数据对象
         */
        LineChart.prototype.formatYSeriesData = function (serie, index) {
            serie.yAxisIndex = index;
            serie.type =  'line';
            return serie;
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        LineChart.prototype.repaint = helper.createRepaint(
            BaseChart.prototype.repaint
        );

        /**
         * 创建Y轴数据
         *
         * @param {Array} ySeries 序列数据
         *
         * @return {Array} 坐标集合
         * @override
         */
        LineChart.prototype.buildYAxis = function (ySeries) {
            var yAxis = [];
            for (var i = 0; i < ySeries.length; i++) {
                var serie = ySeries[i];
                // 格式化y轴刻度数据
                var formattedYAxisData = this.formatYAxisData(serie);
                yAxis.push(formattedYAxisData);
            }

            return yAxis;
        };

       /**
         * 初始化图表数据
         *
         * @override
         */
        LineChart.prototype.initChartOptions = function () {
            return {
                tooltip: {
                    trigger: 'axis'
                    // formatter: lib.bind(this.tipFormatter, this)
                },
                legend: {
                    data:['']
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false
                    }
                ]
            };
        };


        require('esui').register(LineChart);

        return LineChart;

    }
);

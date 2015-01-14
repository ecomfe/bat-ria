/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 柱状图封装控件
 * @author lixiang(lixiang05@baidu.com)
 * @edit by loutongbing(loutongbing@baidu.com)
 */

define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var BaseChart = require('./BaseChart');
        require('echarts/chart/bar');
        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function BarChart(options) {
            BaseChart.apply(this, arguments);
        }

        lib.inherits(BarChart, BaseChart);

        BarChart.prototype.type = 'BarChart';
        BarChart.prototype.styleType = 'Chart';

        /**
         * 获得提示层的title
         */
        BarChart.prototype.getTipTitleHtml = function (params, index) {
            var fullText = this.ellipsisToFull[index];
            // 截断换行
            var length = fullText.length;
            var begin = 0;
            var lines = [];
            while (begin < length) {
                lines.push(fullText.substr(begin, 50));
                begin = Math.min(begin + 50, length);
            }
            // 取一个数据做抽取就可以
            return lines.join('<br>');
        };


        /**
         * 格式化y轴显示数据
         * @param {Object} serie y轴数据
         * @return {Object} 返回格式化后的y轴显示所需数据对象
         */
        BarChart.prototype.formatYSeriesData = function (serie, index) {
            return {
                name: serie.label,
                type: 'bar',
                barWidth: 20,
                itemStyle: {
                    normal: {
                        color: serie.color
                    }
                },
                data: serie.data
            };
        };


       /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        BarChart.prototype.repaint = helper.createRepaint(
            BaseChart.prototype.repaint
        );

       /**
         * 初始化图表数据
         *
         * @override
         */
        BarChart.prototype.initChartOptions = function () {
            return {
                tooltip: {
                    trigger: 'axis',
                    formatter: lib.bind(this.tipFormatter, this)
                },
                xAxis: [
                    {
                        type: 'category',
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#333',
                                width: 1,
                                style: 'solid'
                            }
                        }
                    }
                ]
            };
        };


        BarChart.prototype.formatXSeries = function (xSeries) {
            // 里面包含用来显示的截断文字，也有全文字，设置个映射，以后用
            var ellipsisToFull = [];
            var formattedXSeries = [];
            u.each(xSeries, function (serie, index) {
                ellipsisToFull.push(serie.value);
                formattedXSeries.push(serie.text);
            });
            this.ellipsisToFull = ellipsisToFull;
            return formattedXSeries;
        };

        /**
         * 创建Y轴数据
         *
         * @param {Array} ySeries 序列数据
         *
         * @return {Array} 坐标集合
         * @override
         */
        BarChart.prototype.buildYAxis = function (ySeries) {
            var yAxis = [];
            for (var i = 0; i < ySeries.length; i++) {
                var serie = ySeries[i];
                // 格式化y轴刻度数据
                var formattedYAxisData = this.formatYAxisData(serie);
                yAxis.push(formattedYAxisData);
            }

            return yAxis;
        };

        require('esui').register(BarChart);
        return BarChart;
    }
);

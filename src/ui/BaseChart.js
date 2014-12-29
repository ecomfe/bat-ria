/**
 * ADM 2.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 图表基类控件
 * @author lixiang(lixiang05@baidu.com)
 * @edit by loutongbing(loutongbing@baidu.com)
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var echarts = require('echarts');
        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function BaseChart(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(BaseChart, Control);

        BaseChart.prototype.type = 'Chart';

        /**
         * 获得提示层的title
         */
        BaseChart.prototype.getTipTitleHtml = function (params) {
        };

        /**
         * 提示层格式器
         *
         * @param {Array} params 数据
         * @return {string} 格式化后的弹出层html
         * =========================
         * 2013-12-04 星期三
         * <图例色块> 展现量：42,000
         * <图例色块> 点击量：12,000
         * =========================
         */
        BaseChart.prototype.tipFormatter = function(params, axisIndex) {
            axisIndex = +axisIndex.substr(5, 1);
            // yTitle | xValue | yValue
            // [["展现量", "2013-04-26", 42000], ["点击量", "2013-04-26", 180]]

            // 这里包含数据的图例颜色和数据格式
            var legend = this.legend;

            var html = [];
            var title = this.getTipTitleHtml(params, axisIndex);
            html.push(title);
            var styles = ''
                + 'margin-right:5px;'
                + 'display:inline-block;width:10px;height:10px;';
            // 有的时候会有相同的label出现，但是要使用不同的图例
            var usedLabels = {};
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var label = param[0];
                // 用过了，用备用的
                if (usedLabels[label]) {
                    param[0] = param[0] + '_bak';
                }
                var format = legend[param[0]].format;
                var legendColor = legend[param[0]].color;
                var value = param[2];
                if (format === 'money') {
                    value = u.formatNumber(value, 2, '', '&yen;');
                }
                else if (format === 'int') {
                    value = u.formatNumber(value);
                }
                if (format === 'percent') {
                    value = value + '%';
                }

                html.push(''
                    + '<b style="' + styles
                    + 'background:' + legendColor + ';"></b>'
                    + label + '：' + value
                );

                usedLabels[param[0]] = 1;
            }
            return html.join('<br>');
        };

        /**
         * 格式化y轴刻度数据
         *
         * @param {Object} serie y轴数据
         * @return {Object} 返回格式化后的y轴构建所需数据对象
         */
        BaseChart.prototype.formatYAxisData = function (serie) {
            var data = serie.data;
            var splitNumber = this.splitNumber;

            // 按从小到大排下序
            var sortedData = u.sortBy([].slice.call(data), function (item) {
                return +item;
            });


            // 把最大刻度转换成符合比例尺规范的值
            var maxData = sortedData[data.length - 1];
            var average = Math.ceil(maxData / splitNumber);
            // 取最接近average的刻度
            var scale = getNearestScale(this, average);
            var max = scale * splitNumber;

            var formatter = function (serie) {
                return function (value) {
                    if (serie.format === 'percent') {
                        value = value + '%';
                    }
                    else if (serie.format === 'money') {
                        value = u.formatNumber(value, 2);
                    }
                    else if (serie.format === 'int') {
                        value = u.formatNumber(value);
                    }
                    return value;
                };
            };

            return {
                type: 'value',
                axisLabel: {
                    formatter: formatter(serie)
                },
                min: 0,
                max: max,
                splitNumber: splitNumber,
                scale: true,
                splitArea: { show: true }
            };
        };


        /**
         * 获取单位刻度值
         *
         * 控件设置有默认五个基础比例尺 '1, 1.5, 2, 5, 10'
         * 根据目标数据的位数对基础比例尺做加权
         * 比如 215 是三位数，权值是100，加权后的比例尺是
         * '100, 150, 200, 500, 1000'
         * 可以涵盖目标数字。
         * 然后通过比较，获取目标数字所落比例尺区间的最大值，即为最后的单位刻度
         *
         * @param {BaseChart} chart 类实例
         * @param {Object} average 实际平均刻度
         *
         * @return {number} scale 获得的单位刻度
         */
        function getNearestScale(chart, average) {
            var averageStr = average.toString();
            // 位数
            var bits = averageStr.length;
            // 通过平均值的位数计算加权值，比如215的加权就是100
            var power = Math.pow(10, bits - 1);

            // 基础比例尺格式化为数组，默认[1, 1.5, 2, 5, 10]
            var baseScale = chart.scale.split(',');
            var scale;
            for (var i = 0; i < baseScale.length; i++) {
                // 实际比例尺选择范围是基础比例尺乘以加权值
                baseScale[i] = parseFloat(baseScale[i]) * power;
                // 向上取值
                if (average <= baseScale[i]) {
                    scale = baseScale[i];
                    break;
                }
            }

            return scale;
        }

        /**
         * 显示加载提示
         *
         * @param {BaseChart} chart 类实例
         */
        function showLoading(chart) {
            var mask = lib.g(helper.getId(chart, 'loading-mask'));
            helper.addPartClasses(chart, 'loading-mask-show', mask);
        }

        /**
         * 隐藏加载提示
         *
         * @param {BaseChart} chart 类实例
         */
        function hideLoading(chart) {
            var mask = lib.g(helper.getId(chart, 'loading-mask'));
            helper.removePartClasses(chart, 'loading-mask-show', mask);
        }

        /**
         * 绘制图表
         *
         * @param {BaseChart} control 类实例
         */
        function draw(control) {
            if (!control.chartOptions.series) {
                return;
            }
            showLoading(control);
            // 画图表
            var chart = control.chart;
            chart.setOption(control.chartOptions, true);

            // 画坐标
            for (var i = control.ySeries.length - 1; i >= 0; i--) {
                var yAxisName = lib.g(
                    helper.getId(control, 'yaxis-' + (i + 1))
                );
                yAxisName.innerHTML = lib.encodeHTML(
                    control.ySeries[i].label
                );
            }

            hideLoading(control);
        }

        BaseChart.prototype.initOptions = function (options) {
            var properties = {
                scale: '1, 1.5, 2, 5, 10',
                splitNumber: 4,
                loadingText: '正在努力渲染...',
                xSeries: [],
                ySeries: [],
                series: [],
                width: 'auto',
                height: '300'
            };
            lib.extend(properties, options);
            this.setProperties(properties);
        };


        BaseChart.prototype.initStructure = function () {
            var tpl = [
                /**
                 * 这里将chart单独封装在一个层里是考虑，
                 * 未来可能会在控件中封装其它图表外的操作按钮。
                 */
                '<div class="${className}">',
                    '<div id="${chartId}" style="height:${height};width:${width};"></div>',
                    '<div id="${yAxis1Name}" class="${yAxis1NameClass}"></div>',
                    '<div id="${yAxis2Name}" class="${yAxis2NameClass}"></div>',
                    '<div id="${loadingMaskId}" style="line-height:${height};"',
                    ' class="${loadingMask}">${loadingText}</div>',
                '</div>'
            ];
            var chartId = helper.getId(this, 'main');
            var loadingMaskId = helper.getId(this, 'loading-mask');
            var width = 'auto';
            if (this.width !== 'auto') {
                width = this.width + 'px';
            }
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    className:
                        helper.getPartClasses(this, 'frame').join(' '),
                    chartId: chartId,
                    yAxis1Name: helper.getId(this, 'yaxis-1'),
                    yAxis2Name: helper.getId(this, 'yaxis-2'),
                    yAxis1NameClass:
                        helper.getPartClasses(
                            this, 'yaxis-name-left'
                        ).join(''),
                    yAxis2NameClass:
                        helper.getPartClasses(
                            this, 'yaxis-name-right'
                        ).join(''),
                    loadingMaskId: loadingMaskId,
                    loadingMask:
                        helper.getPartClasses(this, 'loading-mask').join(''),
                    loadingText: this.loadingText,
                    height: this.height + 'px',
                    width: width
                }
            );
            var chart = echarts.init(lib.g(chartId));
            this.chart = chart;

            // 绑定resize事件
            helper.addDOMEvent(this, window, 'resize', function () {
                chart.resize();
            });
        };


       /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        BaseChart.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: ['xSeries', 'ySeries'],
                paint: function (chart, xSeries, ySeries) {
                    if (!ySeries || u.isEmpty(ySeries)) {
                        return;
                    }
                    // 如果chart的option还没初始化，先初始化
                    if (!chart.chartOptions) {
                        chart.chartOptions = chart.initChartOptions();
                    }

                    // 更新X轴数据
                    chart.chartOptions.xAxis[0].data =
                        chart.formatXSeries(xSeries);

                    // 跟新Y轴数据
                    // 1. 构建数据
                    var formattedYSeries = [];
                    chart.legend = {};
                    for (var i = 0; i < ySeries.length; i++) {
                        var serie = ySeries[i];
                        // 格式化y轴坐标数据
                        var formattedYSeriesData =
                            chart.formatYSeriesData(serie, i);
                        formattedYSeries.push(formattedYSeriesData);

                        // 更新图例数据
                        if (!chart.legend[serie.label]) {
                            chart.legend[serie.label] = {
                                color: serie.color,
                                format: serie.format
                            };
                        }
                        else {
                            chart.legend[serie.label + '_bak'] = {
                                color: serie.color,
                                format: serie.format
                            };
                        }
                    }

                    // 2. 构建坐标
                    var yAxis = chart.buildYAxis(ySeries);

                    // 开画
                    chart.chartOptions.yAxis = yAxis;
                    chart.chartOptions.series = formattedYSeries;
                    draw(chart);
                }
            },
            {
                name: ['series'],
                paint: function (chart, series) {
                    if (!series || u.isEmpty(series)) {
                        return;
                    }
                    chart.chartOptions = chart.initChartOptions(chart.series);
                    draw(chart);
                }
            }
        );

        BaseChart.prototype.formatXSeries = function (xSeries) {
            return xSeries;
        };

        BaseChart.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }
            Control.prototype.dispose.apply(this, arguments);
        };

        require('esui').register(BaseChart);

        return BaseChart;

    }
);

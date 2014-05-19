/**
 * @file 表单类型`View`基类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(function (require) {
    var util = require('er/util');
    var BaseView = require('./BaseView');
    var u = require('underscore');
    var lib = require('esui/lib');

    /**
     * 使用表单视图，有以下要求：
     *
     * - 有id为`form`的`Form`控件
     * - 所有触发提交的按钮，会触发`form`的`submit`事件
     * 
     * 可选：
     * 
     * - 可以有一个id为`cancel`的按钮，点击后会触发`cancel`事件
     * - 可以有一个id为`reset`的按钮，点击后会触发`reset`事件

    /**
     * 表单类型`View`基类
     *
     * @extends BaseView
     * @constructor
     */
    function FormView() {
        BaseView.apply(this, arguments);
    }

    util.inherits(FormView, BaseView);

    /**
     * 从表单中获取数据
     *
     * @return {Object}
     */
    FormView.prototype.getFormData = function () {
        var form = this.get('form');
        return u.extend(
            {},
            form ? form.getData() : {},
            this.getExtraFormData()
        );
    };

    /**
     * 获取当前表单需要提交的额外数据
     *
     * @return {Object} 表单数据
     */
    FormView.prototype.getExtraFormData = function () {
        return {};
    };

    /**
     * 回滚表单数据
     *
     * @param {Object} key：value形式的数据 key和input的name一一对应
     */
    FormView.prototype.rollbackFormData = function () {
        this.setFormData(this.model.getDefaultData());
    };

    /**
     * 设置表单数据
     *
     * @param {Object} key：value形式的数据 key和input的name一一对应
     */
    FormView.prototype.setFormData = function (formData) {
        var form = this.get('form');
        inputs = form.getInputControls();
        u.each(inputs, function (input, index) {
            var key = input.name;
            if (formData) {
                if (u.has(formData, key)) {
                    input.setValue(formData[key]);
                }
            }
        });
        this.setExtraFormData(formData);
    };

    /**
     * 设置表单额外数据
     * 这个接口提供给不是input的控件去扩展，自个玩去
     *
     * @param {Object} key：value形式的数据 key和input的name一一对应
     */
    FormView.prototype.setExtraFormData = function (formData) {
        return;
    };

     /**
     * 若页面在目标dom元素下方，设置页面scrollTop至该元素
     *
     * @param {Element} validity label的dom元素
     */
    function locateToFirstError(firstErrValidity) {
        var offset = lib.getOffset(firstErrValidity);
        if (lib.page.getScrollTop() > offset.top) {
            document.body.scrollTop = document.documentElement.scrollTop = offset.top - 10;
        }
    }

    /**
     * 向用户通知提交错误信息，默认根据`field`字段查找对应`name`的控件并显示错误信息
     *
     * @param {Object} errors 错误信息，每个key为控件`name`，value为`errorMessage`
     *
     * @fire {Event} scrolltofirsterror 定位至页面第一个出错的控件，
     *      由于是后端或自定义处理的错误，并不会按页面控件顺序排序，需要自己
     *      计算哪一个是第一个出错的控件
     */
    FormView.prototype.notifyErrors = function (errors) {
        if (typeof errors !== 'object') {
            return;
        }

        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var form = this.get('form');
        var firstErrValidity = null;
        var miniOffsetTop = 9999999;

        u.each(errors, function (message, field){
            var state = new ValidityState(false, message);
            var validity = new Validity();
            validity.addState('invalid', state);

            var input = form.getInputControls(field)[0];
            if (input && typeof input.showValidity === 'function') {
                input.showValidity(validity);
            }

            var label = input.getValidityLabel().main;
            if (miniOffsetTop > lib.getOffset(label).top) {
                firstErrValidity = label;
            }
        });

        var e = this.fire('locatetofirsterror', {firstErrValidity: firstErrValidity});
        if (!e.isDefaultPrevented()) {
            locateToFirstError(firstErrValidity);
        }
    };

    /**
     * 重置表单
     */
    function reset() {
        this.fire('reset');
    }

    /**
     * 取消编辑
     */
    function cancelEdit() {
        this.fire('cancel');
    }

    /**
     * 提交数据
     */
    function submit() {
        this.fire('submit');
    }

    /**
     * 处理esui表单控件自动校验出错
     * 定位至第一个出错的控件
     *
     * @param {Object} e esui表单控件触发invalid事件时传入的事件对象
     */
    FormView.prototype.handleAutoValidateInvalid = function (e) {
        var form = e.target;
        u.some(form.getInputControls(), function (input, index) {
            if (!input.checkValidity()) {
                var label = input.getValidityLabel(true).main;
                locateToFirstError(label);
                return true;
            }
        });
    };

    /**
     * 绑定控件事件
     *
     * @override
     */
    FormView.prototype.bindEvents = function () {
        var form = this.get('form');
        if (form) {
            form.on('submit', submit, this);
            form.on('invalid', this.handleAutoValidateInvalid, this); 
        }

        var resetButton = this.get('reset');
        if (resetButton) {
            resetButton.on('click', reset, this);
        }

        var cancelButton = this.get('cancel');
        if (cancelButton) {
            cancelButton.on('click', cancelEdit, this);
        }

        BaseView.prototype.bindEvents.apply(this, arguments);
    };
    
    /**
     * 禁用提交操作
     */
    FormView.prototype.disableSubmit = function () {
        if (this.viewContext) {
            this.getGroup('submit').disable();
        }
    };

    /**
     * 启用提交操作
     */
    FormView.prototype.enableSubmit = function () {
        if (this.viewContext) {
            this.getGroup('submit').enable();
        }
    };

    return FormView;
});

/**
 * @file 表单类型`View`基类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(function (require) {
    var BaseView = require('./BaseView');
    var u = require('underscore');
    var lib = require('esui/lib');

    /**
     * 使用表单视图，有以下要求：
     *
     * - 有id为`form`的`Form`控件
     * - 所有触发提交的按钮，会触发`form`的`submit`事件
     * - 可以使用`Form`控件的`data-ui-auto-validate`属性，
     *   设置为`true`可以在submit之前自动校验含有`name`属性的`InputControl`
     *
     * 可选：
     *
     * - 可以有一个id为`cancel`的按钮，点击后会触发`cancel`事件
     * - 可以有一个id为`reset`的按钮，点击后会触发`reset`事件

    /**
     * 表单类型`View`基类
     *
     * @class mvc.FormView
     * @extends BaseView
     */
    var exports = {};

    /**
     * 从表单中获取数据
     *
     * @public
     * @method mvc.FormView#getFormData
     * @return {Object}
     */
    exports.getFormData = function () {
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
     * @protected
     * @method mvc.FormView#getExtraFormData
     * @return {Object} 表单数据
     */
    exports.getExtraFormData = function () {
        return {};
    };

    /**
     * 回滚表单数据
     *
     * @public
     * @method mvc.FormView#rollbackFormData
     * @param {Object} defaultData key/value形式的数据，key和input的name一一对应
     */
    exports.rollbackFormData = function (defaultData) {
        this.setFormData(defaultData);
    };

    /**
     * 设置表单数据
     *
     * @public
     * @method mvc.FormView#setFormData
     * @param {Object} formData key:value形式的数据 key和input的name一一对应
     */
    exports.setFormData = function (formData) {
        var form = this.get('form');
        var inputs = form.getInputControls();
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
     * @protected
     * @method mvc.FormView#setExtraFormData
     * @param {Object} formData key:value形式的数据 key和input的name一一对应
     */
    exports.setExtraFormData = function (formData) {
        return;
    };

    /**
     * 表单校验
     * 为啥要有这东西？Form控件不是有了吗?
     * 问得好，Form控件的beforevalidate事件（同步）在FormView中已经阻止掉了
     * 然后在FormAction中提供了异步的beforeValidate、validate、afterValidate的扩展点
     * 因此FormView必须自己调validate
     * 这个方法会在FormAction.validite中和FormModel的校验一起做
     * (还不是一堆蛋疼需求导致的...
     *
     * @protected
     * @method mvc.FormView#validate
     * @param  {Object} submitData 上层传入的要提交的数据
     * @return {boolean} 校验是否成功
     */
    exports.validate = function (submitData) {
        var form = this.get('form');
        var isAutoValidate = form.get('autoValidate');
        if (!isAutoValidate) {
            return true;
        }
        return form.validate();
    };

    /**
     * 向用户通知提交错误信息，默认根据`errors`的`key`字段查找对应`name`的控件并显示错误信息
     *
     * @public
     * @method mvc.FormView#notifyErrors
     * @param {Object} errors 错误信息，每个key为控件`name`，value为`errorMessage`
     *
     */
    exports.notifyErrors = function (errors) {
        if (typeof errors !== 'object') {
            return;
        }

        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var form = this.get('form');

        u.each(errors, function (message, field) {
            var state = new ValidityState(false, message);
            var validity = new Validity();
            validity.addState('invalid', state);

            var input = form.getInputControls(field)[0];
            if (input && typeof input.showValidity === 'function') {
                input.showValidity(validity);
            }
        });
    };

    /**
     * 重置表单
     *
     * @event
     * @ignore
     */
    function reset() {
        this.fire('reset');
    }

    /**
     * 取消编辑
     *
     * @event
     * @ignore
     */
    function cancelEdit() {
        this.fire('cancel');
    }

    /**
     * 进入提交前的处理
     *
     * @event
     * @param {Event} e 事件对象
     * @ignore
     */
    function submit(e) {
        e.preventDefault();
        this.fire('submit');
    }

    /**
     * 禁用各类事件的默认逻辑
     *
     * @event
     * @param {Event} e 事件对象
     * @ignore
     */
    function preventDefault(e) {
        e.preventDefault();
    }

    /**
     * 若页面在目标dom元素下方，设置页面scrollTop至该元素
     *
     * @param {Element} element label的dom元素
     * @ignore
     */
    function scrollTo(element) {
        var offset = lib.getOffset(element);
        if (lib.page.getScrollTop() > offset.top) {
            element.scrollIntoView(true);
        }
    }

    /**
     * 处理esui表单控件自动校验出错
     * 定位至第一个出错的控件
     *
     * @protected
     * @method mvc.FormView#handleValidateInvalid
     * @param {Object} form esui表单控件
     * @fire {Event} scrolltofirsterror 定位至页面第一个出错的控件
     */
    exports.handleValidateInvalid = function () {
        var me = this;
        var form = this.get('form');
        u.some(form.getInputControls(), function (input) {
            if (input.hasState('validity-invalid')) {
                var e = me.fire('scrolltofirsterror', {firstErrValidity: input});
                if (!e.isDefaultPrevented()) {
                    scrollTo(input.main);
                }
                return true;
            }
        });
    };

    /**
     * 绑定控件事件
     *
     * @override
     */
    exports.bindEvents = function () {
        var form = this.get('form');
        if (form) {
            form.on('beforevalidate', submit, this);
        }

        var resetButton = this.get('reset');
        if (resetButton) {
            resetButton.on('click', reset, this);
        }

        var cancelButton = this.get('cancel');
        if (cancelButton) {
            cancelButton.on('click', cancelEdit, this);
        }

        this.$super(arguments);
    };

    /**
     * 禁用提交操作
     *
     * @public
     * @method mvc.FormView#disableSubmit
     */
    exports.disableSubmit = function () {
        if (this.viewContext) {
            var form = this.get('form');
            if (form) {
                form.un('beforevalidate', submit, this);
                form.on('beforevalidate', preventDefault, this);
            }
        }
    };

    /**
     * 启用提交操作
     *
     * @public
     * @method mvc.FormView#enableSubmit
     */
    exports.enableSubmit = function () {
        if (this.viewContext) {
            var form = this.get('form');
            if (form) {
                form.on('beforevalidate', submit, this);
                form.un('beforevalidate', preventDefault, this);
            }
        }
    };

    var FormView = require('eoo').create(BaseView, exports);
    return FormView;
});

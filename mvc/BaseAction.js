/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Action基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var Action = require('er/Action');

        /**
         * Action基类，提供实体名称和实体描述的维护
         *
         * @extends er.Action
         * @constructor
         */
        function BaseAction() {
            Action.apply(this, arguments);
        }

        util.inherits(BaseAction, Action);

        /**
         * 创建数据模型对象
         *
         * 此方法会在返回的`Model`中加上`entityDescription`属性
         *
         * @param {Object} args 模型的初始化数据
         * @return {BaseModel}
         * @protected
         * @override
         */
        BaseAction.prototype.createModel = function (args) {
            var model = Action.prototype.createModel.apply(this, arguments);

            // Action基类的默认返回值是一个空对象`{}`，
            // 但是普通的`Model`对象因为方法和属性全在`prototype`上，也会被判断为空
            var Model = require('er/Model');
            if (!(model instanceof Model) && u.isEmpty(model)) {
                var BaseModel = require('./BaseModel');
                model = new BaseModel(args);
            }

            return model;
        };
        
        return BaseAction;
    }
);        

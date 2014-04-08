define(function (require) {
    var u = require('underscore');

    var globalLoading;
    var loadingCount = 0;
    var loadingTimer;

    function showLoading(content, options) {
        if (!globalLoading) {
            // 此处直接new控件出来，
            // 因为这个控件不能属于任何一个业务模块的ViewContext，
            // 不然会随着跳转被销毁，造成下次用不了
            var Toast = require('./Toast');
            var toastOptions = {
                disposeOnHide: false,
                autoShow: false,
                mask: true,
                duration: Infinity,
                skin: 'loading'
            };
            globalLoading = new Toast(toastOptions);
            globalLoading.on(
                'hide', 
                u.bind(globalLoading.detach, globalLoading)
            );
            globalLoading.render();
        }

        var properties = {
            content: content || '正在读取数据，请稍候...',
            status: undefined
        };
        properties = u.extend(properties, options);
        globalLoading.setProperties(properties);
        globalLoading.show();
        loadingCount++;
        return globalLoading;
    }
    function hideLoading() {
        if (globalLoading) {
            loadingCount--;
            if (loadingCount <= 0) {
                loadingCount = 0;
                loadingTimer && clearTimeout(loadingTimer);
                loadingTimer = setTimeout(function () {
                    // 略微等待一段时间再真正隐藏，以免频繁串行请求带来过多闪烁
                    globalLoading.hide();
                }, 500);
            }
        }
    }

    return {
        show: showLoading,
        hide: hideLoading
    };
});

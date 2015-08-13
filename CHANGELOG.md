* 0.2.6
    - 增加 `system/session` 模块
    - `ListView` 原型增加 `batchModify` 方法，提供批量操作在 View 层的扩展点
    - 增加表单元素的字体默认设置
    - `tpl` 模块支持解析 `data-ui` 属性中以集中方式设置的 `type`
    - 修复 `.list-operation` 样式在 Firefox 下的问题
    - 调整了图表控件中 `echarts` 的 `formatter` 参数
    - 修正代码规范

* 0.2.5
    - `QuickTip` 改用 `TipLayer` 的 `manual` 模式
    - `RichBoxGroup` 支持设置 `singleSelect`
    - `Image` 控件支持设置 `max-width` 和 `max-height`，去除 Flash 类型支持，调整样式
    - 修正 `Uploader` 在非自动上传模式下设置 `extraArgs` 时失败的问题
    - 扩展的 `u.constanize` 函数名优化为 `u.constantize`，老名字保留
    - `util.genListLink` 和 `util.genListCommand` 方法 `extra` 选项现在改名为 `data`，对应于生成的 HTML 元素中的 `data-` 前缀属性，`extra` 仍保留。同时增加了 `attr` 选项，对应于无 `data-` 前缀的属性
    - MVC 扩展代码切换为基于 `eoo` 实现
    - ETpl 的依赖升级到 `3.0.0` 以上
    - 增加了 `ListAction` 相关的模板，利用 etpl `3.0.0` 版本后的引用带入功能，支持通过重写 `block` 覆盖
    - 支持列表页和表单页数据请求失败后继续进入 Action
    - 使用 `filterRedirect` 拦截跳转，解决 `ListAction` 作为子 Action 时无法局部刷新的问题
    - 大量代码根据规范优化
    - 优化 `mvc` 模块的 JSDoc 注释

* 0.2.4
    - 修正 `QuickTip` 未能正确处理 `mouseenter` / `mouseleave` 的问题
    - 在 `extension/ui/lib` 中为 `on` 在代理事件时增加了 `mouseenter` / `mouseleave` 的处理

* 0.2.3
    - 增加 `QuickTip` 控件扩展
    - 增加多个 ECharts 图表的控件封装
    - `Uploader` 控件现在成功上传的返回值可以为空对象
    - `ListAction` 在局部刷新后会触发 `listchange` 事件
    - `ListModel` 在局部刷新时会调用一次 `prepare` 方法

* 0.2.2
    - 增加了 `SearchTree` 控件
    - 增加了 `RichBoxGroup` 控件
    - 更新了 `Uploader` 控件的逻辑
    - `util` 列表生成操作时支持配置为禁用的功能
    - 增加了部分单测 case
    - 将 `window` / `history` 相关的逻辑封装到 `location` 模块中
    - 升级了 `system/constants` 模块的逻辑，更健壮

* 0.2.1
    - 优化了样式
    - 增加了 `Sidebar` 的默认处理
    - 增加了 NMP 权限模块的支持
    - 增加了列表页的局部刷新功能和 `AuthPanel` 控件
    - 补充 `system/user` 模块的接口
    - 修复 `TableTip` 的一些问题
    - `navigator` 升级，修复子 Tab 的权限问题导致的跳转错误
    - 系统初始化时增加自定义接口的读取

* 0.2.0
    - 修复 merge 错误
    - 跳升版本

* 0.1.17
    - 修复了 AJAX 请求不发送 NMP 指定 Header 的问题
    - 使得 `io.hooks.*` 返回值用来修改传入参数
    - 修复了 `navigator` 匹配路径为字符串的问题
    - `navigator` 现在支持二级菜单及设置显示隐藏
    - 升级了 `serverIO` 模块，以适配新版本 NMP 接口并更好地显示错误信息
    - 修复了 `extension/underscore` 中的一些 bug
    - 修复了 `mvc/BaseView` 中 `popDialog` 的一些问题
    - 给表单页面增加了多个异步确认扩展点
    - 表单页在验证出错后现在会默认将页面滚动到第一个出错的位置

* 0.1.16
    - 增加了可以对单个请求发送器设定不显示 loading 的功能
    - 对 `underscore` 的依赖升级到 `1.6.0`
    - 升级 `util.genRequesters`，递归进行封装，支持 `Function` 类型值
    - 增加了 `_.typeOf`

* 0.1.15
    - 增加列表页的批量操作功能
    - 修复了导航栏在 IE8 下切换时的显示问题
    - `Panel` 的 `appendContent` 功能可以直接使用 ESUI 新版本，不再额外提供
    - 对 ER 和 ESUI 的版本依赖都升级到 `3.1.0-beta.3`
    - 增加 `CHANGELOG.md`

* 0.1.17
    - 修复了 AJAX 请求不发送 NMP 指定 Header 的问题
    - 使得 `io.hooks.*` 返回值用来修改传入参数
    - 修复了 `navigator` 匹配路径为字符串的问题
    - 升级了 `serverIO` 模块，以适配新版本 NMP 接口并更好地显示错误信息

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

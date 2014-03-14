# BAT-RIA 扩展

## 额外依赖的 edp 包

* urijs

## ESL config

需要增加 `path` 配置：

```
'paths': {
    'tpl': 'common/ecma/tpl',
    'ecma': 'common/ecma'
}
```

## 启动入口

在 `common/main` 中如此通过 MA-RIA 来启动系统：
```javascript
require('ecma/main').start().then(function () {
    // custom system initialization
});
```
`ecma/main` 会请求用户、常量数据后启动 ER，完成后可以进行额外的系统初始化（导航栏、用户信息区域的渲染等）。

## 用户信息和常量接口

`ecma/main` 负责请求后端用户和系统常量接口数据。

两个接口的 URL 需要在 `common/config` 模块下的 `api.user` 和 `api.constants` 中进行配置。

用户数据接口有如下两种情况：

1. 对于可能以他人身份登录系统的情况，`result` 需要符合如下格式：

    ```javascript
    {
        visitor: {
            // 当前登录用户自身信息
        },

        adOwner: {
            // 被登录的广告主的信息
        }
    }

2. 只会有一种身份登录的系统，直接在 `result` 中展开用户信息字段即可（非 1. 中所述情况时自动视作此情况）。

读取完毕后，会在下面两个模块封装对应的数据：

* `ecma/system/user`
* `ecma/system/constants`

`user.visitor` 提供正在访问系统的用户的信息，`user.ader` 用来在管理员以他人身份登录系统时提供被登录用户的信息（可能不存在）。


## util

常用的单纯的数据操作工具被扩展到了 `underscore` 中，参见 `ecma/extension/underscore`。
其他和 ER/ESUI/EF 相关的辅助方法在 `ecma/util` 中。

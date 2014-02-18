# MA-RIA 扩展

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

修改为：
```
<script>
require(['ecma/main'] , function (main) {
    main.init();
});
</script>
```

## 用户信息和常量接口

*待优化*

    ecma/system/user
    ecma/system/constants

分别用来提供用户信息和系统常量相关功能，目前只是简单的从对应接口读取数据来覆盖。

`user.visitor` 提供正在访问系统的用户的信息，`user.ader` 用来在管理员以他人身份登录系统时提供被登录用户的信息。


## util

常用的单纯的数据操作工具被扩展到了 `underscore` 中，参见 `ecma/extension/underscore`。
其他工具方法请添加到 `ecma/util` 中，目前提供 `genRequesters` 来通过配置生成远程数据读取的 `promise`。
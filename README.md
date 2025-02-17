<p align="center">
  <img src="./assets/logo.svg" alt="Logo">
</p>

# wechat-article-exporter

![GitHub stars]
![GitHub forks]
![GitHub License]


在线批量导出微信公众号文章，支持阅读量、评论数据的导出，支持内嵌的音视频导出，无需搭建任何环境，可100%还原文章样式，支持私有部署。

交流群(QQ): `991482155`

## 注意

由于公共代理资源有限，因此推荐 **搭建私有代理节点** 服用，私有代理节点可部署在以下平台：

- [Deno Deploy][Deno Deploy]
- [Cloudflare Workers][Cloudflare Workers]

查看 [搭建私有代理节点](docs/private-proxy.md) 教程。


## :dart: 特性

- [x] 搜索公众号，支持关键字和biz搜索
- [x] 搜索公众号内文章(根据文章标题搜索)
- [x] 导出 html 格式(打包了图片和样式文件，能够保证100%还原文章样式)
- [x] 批量导出 html 格式(zip打包)
- [x] 缓存文章列表数据，减少接口请求次数 (关键字搜索的文章不会进入缓存)
- [x] 支持文章过滤，包括作者、标题、发布时间、原创标识、所属合集等
- [x] 支持合集下载
- [x] 支持内嵌的音视频下载
- [x] 支持图片分享消息
- [x] 支持视频分享消息
- [x] 支持导出评论、阅读量等数据 (需要抓包获取 credentials 信息，[查看操作步骤](docs/credentials.md))
- [ ] 支持订阅机制，根据指定规则自动下载文章


## :hammer: 如何使用

1. 注册一个微信公众号 (已有账号的话跳过)

前往 [微信公众平台] 注册，服务号和订阅号皆可。

2. 二维码扫码登录

进入 [登录页面]，用微信扫描页面上的二维码，然后选择自己的 **公众号** 进行登录。

> 注意，必须选择公众号登录，用小程序登录无法使用。

3. 配置私有代理(推荐)

在设置页面配置私有代理地址，如下所示：

![配置私有代理](assets/config-private-proxy.png)

4. 搜索目标公众号，开始下载文章

通过左上角的公众号切换按钮，搜索自己感兴趣的公众号，如下图所示：

![切换账号]


## :earth_americas: 关于代理节点

数据的下载采用代理池的思路，以便解决跨域、防盗链、加速等一系列问题。

目前公共代理有以下节点:
```
https://wproxy-01.deno.dev
https://wproxy-02.deno.dev
https://wproxy-03.deno.dev
https://wproxy-04.deno.dev
https://wproxy-05.deno.dev
https://wproxy-06.deno.dev
https://wproxy-07.deno.dev
https://wproxy-08.deno.dev
https://wproxy-09.deno.dev
https://wproxy-10.deno.dev
```

> 这些节点全部部署在 Deno Deploy 的免费账户中，每个月有100G的免费额度，超过额度之后需要等到下个周期刷新。
>
> **这些节点仅供测试使用，正式使用请搭建自己的私有节点。**
> 
> 查看 [搭建私有代理节点](docs/private-proxy.md) 教程。


## 关于导出其他格式
本项目暂不支持导出除`html`格式之外的其他格式，很大一部分原因是样式很难保真。如果需要其他格式，可以自行寻找其他格式转换工具。

> PDF格式可参考: https://github.com/colin4k/wechat-article-dl


## 常见问题
请参考 [faq](docs/faq.md) 文档，如果遇到其他使用问题，欢迎在 Issue 中说明。

## :heart: 感谢

- 感谢 [Deno Deploy]、[Cloudflare Workers] 提供免费托管服务
- 感谢 [WeChat_Article] 项目提供原理思路


## :coffee: 支持

如果你觉得本项目帮助到了你，请给作者一个免费的 Star，感谢你的支持！



## :rocket: 部署私有网站
查看 [搭建私有网站](docs/private-deploy.md) 教程。


## 关于后续更新计划

为了项目能够长期健康的发展，后续会推出一些付费服务，具体可查看 issue 中的 [pro计划](https://github.com/wechat-article/wechat-article-exporter/labels/pro%E8%AE%A1%E5%88%92) 标签


## :bulb: 原理

在公众号后台写文章时支持搜索其他公众号的文章功能，以此来实现抓取指定公众号所有文章的目的。


## :memo: 许可

MIT


## :star: Star 历史

[![Star History Chart]][Star History Chart Link]



<!-- Definitions -->

[deploy-badge]: https://img.shields.io/github/actions/workflow/status/jooooock/wechat-article-exporter/.github%2Fworkflows%2Fdeno_deploy.yml?label=Deploy

[deploy]: https://github.com/jooooock/wechat-article-exporter/actions

[Github stars]: https://img.shields.io/github/stars/jooooock/wechat-article-exporter?style=social&label=Star&style=plastic

[Github forks]: https://img.shields.io/github/forks/jooooock/wechat-article-exporter?style=social&label=Fork&style=plastic

[Github License]: https://img.shields.io/github/license/jooooock/wechat-article-exporter?label=License

[微信公众平台]: https://mp.weixin.qq.com/cgi-bin/registermidpage?action=index&lang=zh_CN

[登录页面]: https://wechat-article-exporter.deno.dev/login

[切换账号]: assets/switch-account.png

[Deno Deploy]: https://deno.com/deploy

[Cloudflare Workers]: https://workers.cloudflare.com

[Wechat_Article]: https://github.com/1061700625/WeChat_Article

[Star History Chart]: https://api.star-history.com/svg?repos=jooooock/wechat-article-exporter&type=Timeline

[Star History Chart Link]: https://star-history.com/#jooooock/wechat-article-exporter&Timeline

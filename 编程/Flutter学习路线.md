## 一、学习路线
> 10步，每一个学习步骤都以自己亲身实现写出了Demo为准，光看资料不算完成
  
1. 参考[https://flutterchina.club/setup-macos/](https://flutterchina.club/setup-macos/)，搭建Flutter开发环境，安装默认项目到设备
2. 通读Dart语法一遍：[https://juejin.im/post/5c52a386f265da2de25b5c36](https://juejin.im/post/5c52a386f265da2de25b5c36)，要求上面所有代码，必须自己敲一遍
3. 实现一个简单的HelloWorld页面，目的是熟悉Flutter的项目结构和StatelessWidget组件，通读Flutter的所有UI组件一遍：[https://juejin.im/post/5c18d181f265da611f07a128](https://juejin.im/post/5c18d181f265da611f07a128)，要求记住flutter的常用UI组件的继承关系
4. 实现页面跳转、传参、接收返回值，目的是熟悉Navigator组件
5. 实现一个淘宝-个人中心页面，暂不要求交互，但是页面的样式要大致实现，主要目的是熟悉基本UI组件，尤其是布局、文本、图片，
6. 实现一个淘宝-首页，要求包含交互：下拉刷新和上拉加载更多，主要目的是熟悉复杂列表视图、滚动嵌套、手势
7. 实现一个简单登录页面的Http请求，服务端自己写，主要目的是熟悉Flutter的输入框、Dart的异步编程(async/await/Future)、网络请求、json解析、响应式编程(StatefulWidget/setState)
8. 实现一个简单登录页面的grpc请求，protobuf文件和服务端也自己写，主要目的是熟悉grpc插件的用法
9. 实现读取SP的简单页面，不准用第三方插件，自己用MethodChannel实现Flutter调用原生的功能
10. 实现Flutter项目接入宿主Android容器，主要目的是熟悉Flutter静态路由和Android原生传参给FlutterView

## 二、下一步的调研计划
> 调研必须有输出，实践性的要有代码产出，理论性的要有wiki产出，没有产出的调研，就是耍流氓

1. 写一个国际化的demo，实现多语言切换
2. 写一个自定义View的Demo，熟悉绘图三剑客：canvas、path、paint
3. 写一个网络图片缓存的demo，并了解其实现原理和内存占用
4. 阅读源码，了解Flutter的渲染机制，如何从Widget->Element->RenderObject
5. 了解Dart的异步机制，深入理解async/await/Future的原理
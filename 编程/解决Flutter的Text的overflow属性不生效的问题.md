# 解决Flutter的Text的overflow属性不生效的问题

#Flutter 

今天学习Flutter的Text组件时，遇到了一个问题：Text的`overflow: TextOverflow.ellipsis`属性不生效

目前界面如下：
![](https://upload-images.jianshu.io/upload_images/1458573-4ccacfaa1adbd8ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我想要星标后面的文字在很长的时候，显示为省略号，于是给Text设置了`overflow: TextOverflow.ellipsis`：
```
class _LayoutPageState extends State<LayoutPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("LayoutPage")),
      body: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.star,
              size: 16.0,
              color: Colors.grey,
            ),
            Padding(padding: new EdgeInsets.only(left: 5.0)),
            Text(
              "100010001000100010001000100010001000100010001000100010001000100010001000100010001000100010001000",
              style: new TextStyle(color: Colors.grey, fontSize: 14.0),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            )
          ],
        ),
      ),
    );
  }
}
```

结果却提示Text的布局边界溢出了

![](https://upload-images.jianshu.io/upload_images/1458573-821e62e004f0e21b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最开始，我在Text的外面包了个Expended
```
class _LayoutPageState extends State<LayoutPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("LayoutPage")),
      body: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.star,
              size: 16.0,
              color: Colors.grey,
            ),
            Padding(padding: new EdgeInsets.only(left: 5.0)),
            Expanded(
              child: Text(
                "100010001000100010001000100010001000100010001000100010001000100010001000100010001000100010001000",
                style: new TextStyle(color: Colors.grey, fontSize: 14.0),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            )
          ],
        ),
      ),
    );
  }
}
```

显示结果是正常的
![](https://upload-images.jianshu.io/upload_images/1458573-30a643527eda6ffe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是，当Text的文本很短时，我希望图标和文字居中，现在却是在最左边
![](https://upload-images.jianshu.io/upload_images/1458573-48dfb90983802b15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以Expanded的方案失败。通过这，我们也能看出:
> 凡是添加了Expanded的组件，都会被撑大到全屏，从而导致Row的主轴居中失效。

后来在朋友的提示下，我用Container设置指定宽度的方式，实现了这个需求：
```
class _LayoutPageState extends State<LayoutPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("LayoutPage")),
      body: Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.star,
              size: 16.0,
              color: Colors.grey,
            ),
            Padding(padding: new EdgeInsets.only(left: 5.0)),
            Container(
              width: 60,
              child: Text(
                "1000",
                style: new TextStyle(color: Colors.grey, fontSize: 14.0),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            )
          ],
        ),
      ),
    );
  }
}
```

短文本显示：
![](https://upload-images.jianshu.io/upload_images/1458573-3f235426499b12cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

长文本显示：
![](https://upload-images.jianshu.io/upload_images/1458573-d02636dc62199162.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

虽然不是完全符合我的需求（屏幕宽度还有，但是却省略文字了），但是也在一定程度上满足了。

记录本次解决问题的流程，主要是想提醒自己一定要熟悉Flutter的各种布局组件，以及它的限制，不能想当然。

Text组件本身是没有宽度的，设置overflow属性的话，必须给它指定宽度，可以通过Expanded设置为铺满，也可以通过Container设置为指定宽度。
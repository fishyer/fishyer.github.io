## 一、利用重写的链接

![](http://upload-images.jianshu.io/upload_images/1458573-5f77d5557e413a00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-9e84c6f1d0b71f38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 二、利用js接口
```
webView.addJavascriptInterface(this,"vip");
```
这样就将Activity这个Java对象和vip这个js对象绑定了：
![](http://upload-images.jianshu.io/upload_images/1458573-811a3e6eed70e7cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后，点击Html,执行vip.clickOnAndroid(1)时，会去执行Activity.clickOnAndroid(1)
![](http://upload-images.jianshu.io/upload_images/1458573-4dce5bb963cfc1de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
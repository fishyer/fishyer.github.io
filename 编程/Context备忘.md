#Context继承关系
![](http://upload-images.jianshu.io/upload_images/1458573-146e591ddb1db0b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#Context使用场景
![](http://upload-images.jianshu.io/upload_images/1458573-b9aa05b1efd8a228.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>1. application context 可以启动 Activity， 但是前提是需要创建一个新任务。在某些情况下，我们可以使用这种方式实现某种特殊目的，这种方式会创建一个非标准的回退栈，一般不推荐使用，至少不是一个好的实践。
2. 这个是合法的调用，但是 inflation 获得的 View 只会应用系统的主题，而不是当前 app 的自定义主题。
3. 在 4.2 及以上系统版本中， 允许注册 receiver 为 null 的广播监听，主要目的是为了获取 sticky broadcast 的当前值。
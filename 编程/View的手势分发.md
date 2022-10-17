#1.Touch事件分发流程
---
![Touch事件分发流程](http://upload-images.jianshu.io/upload_images/1458573-beb7bc841f636620.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
特别提醒：
>1. View是没有onInterceptTouchEvent拦截方法的
9. 一般情况下，View都会消耗事件（onTouchEvent返回true），除非它们是不可点击的（clickable和longClickable都为false），那么就会交由父容器的onTouchEvent处理。　
3. 不同控件super里面的处理可能不一样，此时要查看继承的控件的具体处理
4. dispatchTouchEvent返回true时，不会继续分发事件，自己内部处理了所有事件（ACTION_DOWN,ACTION_MOVE,ACTION_UP）,一般不推荐
5. 子View可以调用getParent().requestDisallowInterceptTouchEvent(true), 阻止父ViewGroup对其MOVE或者UP事件进行拦截
6. 点击事件分发过程: dispatchTouchEvent—->OnTouchListener.onTouch—->onTouchEvent–>OnClickListener.onClick，如果在onTouch方法中通过返回true将事件消费掉，onTouchEvent将不会再执行。

#2.Touch事件类型
---
![Touch事件类型](http://upload-images.jianshu.io/upload_images/1458573-4516d347a7e81a00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
特别提醒：
>ACTION_CANCEL一般认为不能由用户主动触发。系统在运行到一定程度下无法继续响应你的后续动作时会产生此事件。一般仅在代码中将其视为异常分支情况处理。

**Move事件接受流程：**
>只有消费了ACTION_DOWN（返回true)，才会收到ACTION_MOVE和ACTION_UP的事件

红色的箭头代表ACTION_DOWN 事件的流向
蓝色的箭头代表ACTION_MOVE 和 ACTION_UP 事件的流向
![](http://upload-images.jianshu.io/upload_images/1458573-50642465d3caee15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#3.View坐标系
小蓝点代表手势点
![View坐标系](http://upload-images.jianshu.io/upload_images/1458573-06dfebe25247135a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#4.Activity的视图框架
一个Touch事件产生后，它的传递过程为： Activity->Window->View。
![](http://upload-images.jianshu.io/upload_images/1458573-2d3b0155eb9ffffb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#参考目录
---
1. [图解 Android 事件分发机制](http://www.jianshu.com/p/e99b5e8bd67b)
2. [Android View和ViewGroup事件分发机制源码分析](http://blog.csdn.net/amazing7/article/details/51274481)
3. [Android MotionEvent详解](http://www.jianshu.com/p/0c863bbde8eb)
4. [Android笔记:触摸事件的分析与总结--MotionEvent对象](http://glblong.blog.51cto.com/3058613/1557683)
5. [自定义View系列教程06--详解View的Touch事件处理](http://blog.csdn.net/lfdfhl/article/details/51559847)
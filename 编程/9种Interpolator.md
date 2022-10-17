> Interpolator 被用来修饰动画效果，定义动画的变化率，可以使存在的动画效果accelerated(加速)，decelerated(减速),repeated(重复),bounced(弹跳)等。

#1.Linear Interpolator / 线性插值器
---
公式: y=t
![](http://upload-images.jianshu.io/upload_images/1458573-8ec647b81c117899.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#2.Accelerate Interpolator / 加速度插值器
---
公式: y=t^(2f)
描述: 加速度参数. f越大，起始速度越慢，但是速度越来越快  
![](http://upload-images.jianshu.io/upload_images/1458573-da677ca6dd071151.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#3.Decelerate Interpolator / 减速插值器>类名: 
---
公式: y=1-(1-t)^(2f)
描述: 加速度参数. f越大，起始速度越快，但是速度越来越慢  
![这里写图片描述](http://upload-images.jianshu.io/upload_images/1458573-179482d192e9d418.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#4.Accelerate Decelerate Interpolator / 先加速后减速插值器
---
公式: y=cos((t+1)π)/2+0.5
![](http://upload-images.jianshu.io/upload_images/1458573-12c5b43d10ef1d92.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#5.Anticipate Interpolator
---
公式: y=(T+1)×t^3–T×t^2
描述: 张力值, 默认为2，T越大，初始的偏移越大，而且速度越快  
![](http://upload-images.jianshu.io/upload_images/1458573-2e065075acb0acbf.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#6.Overshoot Interpolator
---
公式: y=(T+1)x(t1)^3+T×(t1)^2 +1
描述: 张力值，默认为2，T越大，结束时的偏移越大，而且速度越快  
![](http://upload-images.jianshu.io/upload_images/1458573-16223922be701b68.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#7.Anticipate Overshoot Interpolator
---
公式:![](http://upload-images.jianshu.io/upload_images/1458573-1c26911677a24789.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
描述: 张力值tension，默认为2，张力越大，起始和结束时的偏移越大，而且速度越快;额外张力值extraTension，默认为1.5。公式中T的值为tension*extraTension
![这里写图片描述](http://upload-images.jianshu.io/upload_images/1458573-8b93d0c8fb3e6e3d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#8.Bounce Interpolator / 弹跳插值器
---
公式: ![](http://upload-images.jianshu.io/upload_images/1458573-51e9f2777adbe0af.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-7978ff640e7de30a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#9.Cycle Interpolator / 周期插值器
---
公式: y=sin(2π×C×t)
描述: 周期值，默认为1；2表示动画会执行两次  
![](http://upload-images.jianshu.io/upload_images/1458573-0676812cb74f702d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
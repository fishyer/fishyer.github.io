---
link: https://www.notion.so/9-Interpolator-5e05dd54718e4618b47ee9b645438372
notionID: 5e05dd54-718e-4618-b47e-e9b645438372
---
> Interpolator 被用来修饰动画效果，定义动画的变化率，可以使存在的动画效果accelerated(加速)，decelerated(减速),repeated(重复),bounced(弹跳)等。

## 1.Linear Interpolator / 线性插值器

公式: y=t
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070428589.png)


## 2.Accelerate Interpolator / 加速度插值器

公式: y=t^(2f)
描述: 加速度参数. f越大，起始速度越慢，但是速度越来越快  
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070428994.png)


## 3.Decelerate Interpolator / 减速插值器>类名: 

公式: y=1-(1-t)^(2f)
描述: 加速度参数. f越大，起始速度越快，但是速度越来越慢  
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070428487.png)


## 4.Accelerate Decelerate Interpolator / 先加速后减速插值器

公式: y=cos((t+1)π)/2+0.5
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070429192.png)


## 5.Anticipate Interpolator

公式: y=(T+1)×t^3–T×t^2
描述: 张力值, 默认为2，T越大，初始的偏移越大，而且速度越快  
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070429768.png)


## 6.Overshoot Interpolator

公式: y=(T+1)x(t1)^3+T×(t1)^2 +1
描述: 张力值，默认为2，T越大，结束时的偏移越大，而且速度越快  
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070429166.png)


## 7.Anticipate Overshoot Interpolator

公式:
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070430147.png)

描述: 张力值tension，默认为2，张力越大，起始和结束时的偏移越大，而且速度越快;额外张力值extraTension，默认为1.5。公式中T的值为tension*extraTension
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070430982.png)


## 8.Bounce Interpolator / 弹跳插值器

公式: 
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070431735.png)

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070431523.png)

## 9.Cycle Interpolator / 周期插值器

公式: y=sin(2π×C×t)
描述: 周期值，默认为1；2表示动画会执行两次

![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070432335.png)




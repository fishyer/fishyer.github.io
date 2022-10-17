#演示图
![](http://upload-images.jianshu.io/upload_images/1458573-b7ce213f05816e85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/360)

![图片尺寸大于控件尺寸](http://upload-images.jianshu.io/upload_images/1458573-4e468ddb0dbcd11c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/360)


![](http://upload-images.jianshu.io/upload_images/1458573-c9eafd355be4f25e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/240)

![图片尺寸小于控件尺寸](http://upload-images.jianshu.io/upload_images/1458573-f79bf962aed9c5bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/360)

#说明
1. FIT_XY：对原图宽高进行放缩，该放缩不保持原比例来填充满ImageView。
2. MATRIX：不改变原图大小从ImageView的左上角开始绘制，超过ImageView部分不再显示。
3. CENTER：对原图居中显示，超过ImageView部分不再显示。
4. CENTER_CROP：对原图居中显示后进行等比放缩处理，使原图最小边等于ImageView的相应边。
5. CENTER_INSIDE：若原图宽高小于ImageView宽高，这原图不做处理居中显示，否则按比例放缩原图宽(高)是之等于ImageView的宽(高)。
6. FIT_START：对原图按比例放缩使之等于ImageView的宽高，若原图高大于宽则左对齐否则上对其。
7. FIT_CENTER：对原图按比例放缩使之等于ImageView的宽高使之居中显示。
8. FIT_END：对原图按比例放缩使之等于ImageView的宽高，若原图高大于宽则右对齐否则下对其。

>当我们没有在布局文件中使用scaleType属性或者是没有手动调用setScaleType方法时，那么mScaleType的默认值就是FIT_CENTER。
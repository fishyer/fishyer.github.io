---
link: https://www.notion.so/QQ-75134d7b16e24c08b92f87a3ce75c522
notionID: 75134d7b-16e2-4c08-b92f-87a3ce75c522
---
先上效果图：
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202203070639327.gif)


## 1、自定义控件
注意点：
1. 这里引用一个xml文件做为listview的headerView, LayoutInflater. inflate()的时候，注意最后的root为null,而不是this,以防addHeaderView时出问题
2. 初始化defaultScaleHeight时，需要先手动调用measure()方法，否则高度为0
3. 监听overScrollBy(),下拉过度时，放大scaleView
4. 监听onScrollChanged(),scleView被放大了，且正在往上推时,缩小scaleView
5. 有一种特殊情况要注意：当放大后的scaleView.height+listview.height=屏幕高度时，再往上推时，会触发上拉过度，而不会调用onScrollChanged中的缩小方法，此时需要处理下
6. 监听onTouchEvent(),松手后，开始恢复默认状态的动画

```
package com.che.overlistview;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.Transformation;
import android.widget.ListView;

/**
 * 仿QQ空间可拉伸头部特效
 * <p>
 * 作者：余天然 on 16/9/14 下午10:25
 */
public class OverListView extends ListView {

    private View headerView;//头部视图
    private View scaleView;//可拉伸视图
    private View rotateView;//可旋转视图
    private int defaultScaleHeight = 0;//可拉伸视图的默认高度

    public OverListView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(Context context) {
        headerView = LayoutInflater.from(context).inflate(R.layout.view_header, null);
        scaleView = headerView.findViewById(R.id.iv_header);
        rotateView = headerView.findViewById(R.id.iv_icon);
        addHeaderView(headerView);

        //手动调用测量方法
        scaleView.measure(0, 0);
        //调用measure方法之后才能获取宽高,否则的话getMeasuredHeight()=0
        defaultScaleHeight = scaleView.getMeasuredHeight();
    }

    /**
     * 过度滑动
     * <p>
     * 注意：deltaX与deltaY与坐标系方向相反！！！
     *
     * @param deltaX         水平增量（-右拉过度，+左拉过度）
     * @param deltaY         竖直增量（-下拉过度，+上拉过度）
     * @param scrollX
     * @param scrollY
     * @param scrollRangeX
     * @param scrollRangeY
     * @param maxOverScrollX
     * @param maxOverScrollY
     * @param isTouchEvent
     * @return
     */
    @Override
    protected boolean overScrollBy(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX, int scrollRangeY, int maxOverScrollX, int maxOverScrollY, boolean isTouchEvent) {
        //下拉过度时
        if (deltaY < 0) {
            //放大scaleView
            scaleView.getLayoutParams().height = scaleView.getHeight() - deltaY;
            scaleView.requestLayout();
            rotateView.setRotation(rotateView.getRotation() - deltaY);
        }

        //一种特殊情况：当放大后的scaleView.height+listview.height=屏幕高度时，再往上推时，会触发上拉过度，而不会调用onScrollChanged中的缩小方法
        if (deltaY > 0 && scaleView.getHeight() > defaultScaleHeight) {
            //缩小scaleView
            scaleView.getLayoutParams().height = scaleView.getHeight() - deltaY;
            scaleView.requestLayout();
            rotateView.setRotation(rotateView.getRotation() - deltaY);
        }
        return super.overScrollBy(deltaX, deltaY, scrollX, scrollY, scrollRangeX, scrollRangeY, maxOverScrollX, maxOverScrollY, isTouchEvent);
    }

    /**
     * 滑动中
     *
     * @param l
     * @param t
     * @param oldl
     * @param oldt
     */
    @Override
    protected void onScrollChanged(int l, int t, int oldl, int oldt) {
        View header = (View) scaleView.getParent();
        //scleView被放大了，且正在往上推时
        if (scaleView.getHeight() > defaultScaleHeight && header.getTop() < 0) {
            rotateView.setRotation(rotateView.getRotation() + header.getTop());
            //缩小scleView
            scaleView.getLayoutParams().height = scaleView.getHeight() + header.getTop();
            //同时，将header.top设置为0,(之前其实有一部分跑到屏幕上面了)
            header.layout(scaleView.getLeft(), 0, scaleView.getRight(), scaleView.getBottom());
            scaleView.requestLayout();

        }
        super.onScrollChanged(l, t, oldl, oldt);
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        //监听松开手
        if (ev.getAction() == MotionEvent.ACTION_UP) {
            ResetAnimation animation = new ResetAnimation();
            animation.setDuration(300);
            scaleView.startAnimation(animation);
        }
        return super.onTouchEvent(ev);
    }

    /**
     * 松手后恢复默认状态的动画
     */
    class ResetAnimation extends Animation {

        @Override
        protected void applyTransformation(float interpolatedTime, Transformation t) {
            super.applyTransformation(interpolatedTime, t);
            //interpolatedTime:[0,1],表示执行百分比
            //缩小scleView
            scaleView.getLayoutParams().height = calcBetweenValue(scaleView.getHeight(), defaultScaleHeight, interpolatedTime);
            scaleView.requestLayout();
            rotateView.setRotation(calcBetweenValue((int) rotateView.getRotation(), 0, interpolatedTime));
        }
    }

    /**
     * 计算中间值
     *
     * @param src      起始值
     * @param dest     终止值
     * @param progress 进度[0,1]
     * @return
     */
    private int calcBetweenValue(int src, int dest, float progress) {
        return (int) (src + (dest - src) * progress);
    }

}

```

## 2.控件的使用
看，是不是完全就和普通的ListView一样呀！
```
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        OverListView lv = (OverListView) findViewById(R.id.lv);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, getData());
        lv.setAdapter(adapter);
    }

    private List<String> getData() {
        List<String> data = new ArrayList<>();
        data.add("有心课堂");
        data.add("动脑学院");
        data.add("慕课网");
        data.add("极客学院");
        data.add("菜鸟教程");
        data.add("InfoQ");
        data.add("NewImport");
        data.add("Android开发中文站");
        data.add("泡在网上的日子");
        return data;
    }
}
```

## 3.依赖的资源
R.layout.view_header:
```
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <ImageView
        android:id="@+id/iv_header"
        android:layout_width="match_parent"
        android:layout_height="@dimen/header_height"
        android:scaleType="centerCrop"
        android:src="@drawable/header"/>

    <ImageView
        android:id="@+id/iv_icon"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignBottom="@id/iv_header"
        android:layout_margin="10dp"
        android:scaleType="centerCrop"
        android:src="@drawable/icon"/>

</RelativeLayout>
```
R.layout.activity_main:
```
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <com.che.overlistview.OverListView
        android:id="@+id/lv"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"/>

</RelativeLayout>
```

最后，[奉上源码](https://github.com/fishyer/OverListView)，欢迎拍砖！
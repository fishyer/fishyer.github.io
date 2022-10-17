tags: android

## 1、自定义ViewPag er
```
package extra.view;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.widget.RelativeLayout;
import android.widget.Scroller;

import java.util.ArrayList;
import java.util.List;

import extra.util.L;


/**
 * 作者：余天然 on 2015/7/15 13:45
 * 邮箱：yutianran1993@qq.com
 * 博客：http://my.oschina.net/u/2345676/blog
 * 座右铭:知识来自积累,经验源于总结
 * <p/>
 * 备注：自己做的一个ViewPager
 */
public class MySlidingLayout extends RelativeLayout {
    private Scroller scroller;//滚动器

    /**
     * 构造器
     *
     * @param context
     * @param attrs
     */
    public MySlidingLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView();
    }

    /**
     * 初始化视图
     */
    private void initView() {
        scroller = new Scroller(getContext(), new DecelerateInterpolator());
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        screenWidth = getMeasuredWidth();
    }

    List<Integer> childLeft;//记录每个子视图的左边界

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);
        childLeft = new ArrayList<Integer>();

        int left = 0;
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            childLeft.add(left);
            child.layout(left, 0, left + child.getMeasuredWidth(), child.getMeasuredHeight());
            left += child.getMeasuredWidth();//宽度累加
        }
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        return super.dispatchTouchEvent(ev);
    }

    float downX, downY, moveX, moveY, upX, upY;
    int disX, disY;//绝对偏移值（move相对于down）

    float lastX, lastY;
    int disOffX, disOffY;//相对偏移值(move相对于上一次move)


    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();
                L.e("ACTION_DOWN:downX=" + downX + "\tdownY=" + downY);
                doDown();
                break;

            case MotionEvent.ACTION_MOVE:
                moveX = event.getX();
                moveY = event.getY();
                disX = (int) (moveX - downX);
                disY = (int) (moveY - downY);
                //如果是左右滑动就拦截
                if (Math.abs(disX) > Math.abs(disY)) {
                    return true;
                }
        }
        return super.onInterceptTouchEvent(event);
    }


    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();
                L.e("ACTION_DOWN:downX=" + downX + "\tdownY=" + downY);
                doDown();
                break;

            case MotionEvent.ACTION_MOVE:
                moveX = event.getX();
                moveY = event.getY();
                disX = (int) (moveX - downX);
                disY = (int) (moveY - downY);

                if (lastX != 0 && lastY != 0) {
                    disOffX = (int) (moveX - lastX);
                    disOffY = (int) (moveY - lastY);
                }
                lastX = moveX;
                lastY = moveY;
                L.e("ACTION_MOVE:moveX=" + moveX + "\tmoveY=" + moveY + "\tdisX=" + disX + "\tdisY=" + disY + "\tdisOffX=" + disOffX + "\tdisOffY=" + disOffY);
                doMove();
                break;

            case MotionEvent.ACTION_UP:
                upX = event.getX();
                upY = event.getY();
                disX = (int) (upX - downX);
                disY = (int) (upY - downY);
                lastX = 0;
                lastY = 0;
                L.e("ACTION_UP:upX=" + upX + "\tupY=" + upY + "\tdisX=" + disX + "\tdisY=" + disY);
                doUp();
                break;

        }

        return true;
    }

    private void doDown() {
    }

    int screenIndex;//记录当前是哪一个子视图

    private void doMove() {
        L.e("doMove：disOffX=" + disOffX + "\tgetScrollX=" + getScrollX());


        //如果是第一屏，并且偏移值向右,就什么都不做
        if (screenIndex == 0 && disOffX - getScrollX() > 0) {

            return;
        }
        //如果是最后一屏，并且偏移值向左,就什么都不做
        if (screenIndex == getChildCount() - 1 && disOffX - getScrollX() < -childLeft.get(getChildCount() - 1)) {
            return;
        }
        /**
         * 特别注意：视图的滑动值和手势的偏移值是相反的！！！
         */
        scrollBy(-disOffX, 0);
    }

    private void doUp() {
        L.e("doUp:disOffX=" + disOffX + "\tgetMeasuredWidth/2=" + getMeasuredWidth() / 2);

//        //向右偏移==向左滑动，大于半屏时，跳到上一屏
        if (disX >= getMeasuredWidth() / 2 && screenIndex > 0) {
            L.e("跳到上一屏");
            screenIndex--;
        }
//        //向左偏移==向右滑动，大于半屏时，跳到下一屏
        else if (disX <= -getMeasuredWidth() / 2 && screenIndex < getChildCount() - 1) {
            L.e("跳到下一屏");
            screenIndex++;
        }

        //只有滑动过，才恢复屏幕(避免启动无用的scroller)
        if (getScrollX() > 0) {
            scrollerScreen();
        }

    }

    int scrollTime = 500;

    /**
     * 使用scroller换屏（启动滑动动画，具体滑动需要到computeScroll里面执行）
     */
    private void scrollerScreen() {
        //启动滑动（默认时间为250ms,此处我自定义为1000ms）
        scroller.startScroll(getScrollX(), getScrollY(), childLeft.get(screenIndex) - getScrollX(), 0, scrollTime);
        invalidate();
    }


    float screenIndexF;
    int screenWidth;

    /**
     * 绝对滑动（相对于零点的滑动值）
     */
    @Override
    public void scrollTo(int x, int y) {
        super.scrollTo(x, y);
        L.e("scrollTo：x=" + x + "\ty=" + y);

    }


    /**
     * 相对滑动（相对于上一位置的滑动值）
     */
    @Override
    public void scrollBy(int x, int y) {
        super.scrollBy(x, y);
        L.e("scrollBy：x=" + x + "\ty=" + y);


    }

    /**
     * 计算滑动值（每一次重绘会自动调用此方法）
     */
    @Override
    public void computeScroll() {
        super.computeScroll();
        L.e("computeScroll");

        //当滑动完成时，computeScrollOffset()返回false
        if (scroller.computeScrollOffset()) {
            scrollTo(scroller.getCurrX(), 0);
            invalidate();
        }

        screenIndexF = getScrollX() / (float) screenWidth;
        if (iScreenIndexListener != null) {
            iScreenIndexListener.currentScreenIndex(screenIndexF);
        }
        L.e("screenIndexF=" + screenIndexF);
    }

    /**
     * 自定义回调接口,回调当前的屏幕下标数
     */
    interface IScreenIndexListener {
        void currentScreenIndex(float screenIndexF);
    }

    IScreenIndexListener iScreenIndexListener;

    public void setiScreenIndexListener(IScreenIndexListener iScreenIndexListener) {
        this.iScreenIndexListener = iScreenIndexListener;
    }

    public int getScreenIndex() {
        return getScrollX() / screenWidth;
    }

    public void setScreenIndex(int screenIndex) {
        this.screenIndex = screenIndex;
        toIndexScreen(screenIndex);
    }

    /**
     * 使用scrollTo换屏
     */
    public void toIndexScreen(int index) {
        //移动指定视图
        scrollTo(childLeft.get(index), 0);
        invalidate();
    }
}
```

## 2、布局文件
```
<?xml version="1.0" encoding="utf-8"?>

<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <extra.mymenu.MySlidingLayout
        android:id="@+id/sliding"
        android:layout_above="@+id/tabs"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="#ff0000">

            <fragment
                android:name="com.sharkou.superdemo.fragment.M1_BaseFragment"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                tools:layout="@layout/m1_basefragment" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="#00ff00">

            <fragment
                android:name="com.sharkou.superdemo.fragment.M2_WidgetFragment"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                tools:layout="@layout/m2_netfragment" />

        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="#0000ff">

            <fragment
                android:name="com.sharkou.superdemo.fragment.M3_UtilFragment"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                tools:layout="@layout/m3_utilfragment" />


        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="#A349A4">

            <fragment
                android:name="com.sharkou.superdemo.fragment.M4_ModelFragment"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                tools:layout="@layout/m4_modelfragment" />


        </LinearLayout>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="#FFAEC9">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="我是第五个" />


        </LinearLayout>


    </extra.mymenu.MySlidingLayout>

    <TextView
        android:visibility="gone"
        android:id="@+id/tv"
        android:layout_width="200dp"
        android:layout_height="100dp"
        android:layout_centerInParent="true"
        android:background="#A349A4"
        android:padding="20dp"
        android:text="当前的屏幕下标：" />

    <LinearLayout
        android:id="@+id/tabs"
        android:layout_width="match_parent"
        android:layout_height="50dp"
        android:layout_alignParentBottom="true"
        android:background="#ffffff"
        android:orientation="horizontal">

        <TextView
            android:background="#22B14C"
            android:id="@+id/tab01"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center"
            android:text="基础" />

        <TextView
            android:background="#7F7F7F"
            android:id="@+id/tab02"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center"
            android:text="控件" />

        <TextView
            android:background="#7F7F7F"
            android:id="@+id/tab03"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center"
            android:text="工具" />

        <TextView
            android:background="#7F7F7F"
            android:id="@+id/tab04"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center"
            android:text="模块" />

        <TextView
            android:background="#7F7F7F"
            android:id="@+id/tab05"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:gravity="center"
            android:text="其他" />

    </LinearLayout>

</RelativeLayout>
```
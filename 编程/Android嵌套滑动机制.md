tags: 星标

![](http://upload-images.jianshu.io/upload_images/1458573-9d999807d944a5d2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 概览
实现嵌套滑动有三种方案：
1. 纯事件拦截与派发方案
2. 基于NestingScroll机制的实现方案
3. 基于CoordinatorLayout与Behavior的实现方案

第一种方案：灵活性最高，也最繁琐。因为事件的拦截是一锤子买卖，谁拦截了事件，当前手势接下来的事件都会交给拦截者来处理，除非等到下一次Down事件触发。这很不方便多个View对同一个事件进行处理。

第二种方案：其实就是对原始的事件拦截机制做了一层封装，通过子View实现NestedScrollingChild接口，父View实现NestedScrollingParent 接口，并且在子View和父View中都分别有一个NestedScrollingChildHelper、NestedScrollingParentHelper来代理了父子之间的联动，开发者不用关心具体是怎么联动的，这一点很方便。

第三种方案：其实就是对原始的NestedScrolling机制再次做了一层封装。CoordinatorLayout默认实现了NestedScrollingParent接口。第二种方案只能由子View通知父View，但有时候除了需要通知父View，还需要通知兄弟View,这个时候就该是Behavior出场了。

## Touch事件分发流程

![](http://upload-images.jianshu.io/upload_images/1458573-beb7bc841f636620.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关于Touch事件分发流程的使用示例：欢迎查看我的博客：[自定义下拉刷新和上拉加载框架](http://www.jianshu.com/p/dc0004ba5203)

## NestedScrolling简要流程
具体流程可以查看NestedScrollingChildHelper等类的源码

![](http://upload-images.jianshu.io/upload_images/1458573-8de7ad21ecfa0e82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## CoordinatorLayout+ Behavior的流程

![](http://upload-images.jianshu.io/upload_images/1458573-c813897b8110a123.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关于Behavior的使用示例：欢迎查看我的博客：[自定义Behavior,实现滑动卡片](http://www.jianshu.com/p/f0e380129a19)

## NestedScrolling的一个简单示例
### 效果图
当子View滑动到父View边缘时，会带动父View一起滑动。

![](http://upload-images.jianshu.io/upload_images/1458573-c8f6892fad0b743f?imageMogr2/auto-orient/strip)

### 实现代码
#### 嵌套滑动的发起者：子View
主要思路：（用scroll来举例）
1. 实现NestedScrollingChild接口。 
2. 定义NestedScrollingChildHelper变量。 
3. 在实现的NestedScrollingChild每个接口中调用。NestedScrollingChildHelper对应的函数。 
4. setNestedScrollingEnabled(true); 一般在初始化里面调用设置可以嵌套滑动。 
5. onTouchEvent 或者 dispatchTouchEvent 方法里面case ACTION_DOWN 调用startNestedScroll函数 告诉父View开始嵌套滑动。 
6. onTouchEvent 或者 dispatchTouchEvent 方法里面case ACTION_MOVE 调用dispatchNestedPreScroll或者dispatchNestedScroll 这个就视情况而定了告诉父View滑动的情况。 
7. onTouchEvent 或者 dispatchTouchEvent 方法里面case ACTION_UP 调用stopNestedScroll 告诉父View结束嵌套滑动。 
8. 重写onDetachedFromWindow方法，调用NestedScrollingChildHelper的onDetachedFromWindow方法

```
package com.soubu.sample.nestedscrolling;

import android.content.Context;
import android.support.annotation.Nullable;
import android.support.v4.view.NestedScrollingChild;
import android.support.v4.view.NestedScrollingChildHelper;
import android.support.v4.view.ViewCompat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import java.util.Arrays;

/**
 * 嵌套滑动的发起者：子View
 * <p>
 * 作者：余天然 on 2017/3/30 上午10:40
 */
public class NestedChildView extends View implements NestedScrollingChild {

    private final static String TAG = "NestedChildView";

    private float mLastX;//手指在屏幕上最后的x位置
    private float mLastY;//手指在屏幕上最后的y位置

    private float mDownX;//手指第一次落下时的x位置（忽略）
    private float mDownY;//手指第一次落下时的y位置

    private int[] consumed = new int[2];//消耗的距离
    private int[] offsetInWindow = new int[2];//窗口偏移

    private NestedScrollingChildHelper mScrollingChildHelper;

    public NestedChildView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    private void init() {
        mScrollingChildHelper = new NestedScrollingChildHelper(this);
        setNestedScrollingEnabled(true);
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        float x = ev.getX();
        float y = ev.getY();

        int action = ev.getAction();

        switch (action) {
            case MotionEvent.ACTION_DOWN: {

                mDownX = x;
                mDownY = y;
                mLastX = x;
                mLastY = y;
                //当开始滑动的时候，告诉父view
                startNestedScroll(ViewCompat.SCROLL_AXIS_HORIZONTAL | ViewCompat.SCROLL_AXIS_VERTICAL);
                break;
            }

            case MotionEvent.ACTION_MOVE: {
                /*
                mDownY:293.0
                mDownX:215.0
                 */

                int dy = (int) (y - mDownY);
                int dx = (int) (x - mDownX);

                //分发触屏事件给父类处理
                if (dispatchNestedPreScroll(dx, dy, consumed, offsetInWindow)) {
                    //减掉父类消耗的距离
                    dx -= consumed[0];
                    dy -= consumed[1];
                    Log.d(TAG, Arrays.toString(offsetInWindow));
                }

                offsetTopAndBottom(dy);
                offsetLeftAndRight(dx);

                break;
            }

            case MotionEvent.ACTION_UP: {
                stopNestedScroll();
                break;
            }
        }
        mLastX = x;
        mLastY = y;
        return true;
    }

    /**
     * 设置是否允许嵌套滑动
     *
     * @param enabled
     */
    @Override
    public void setNestedScrollingEnabled(boolean enabled) {
        mScrollingChildHelper.setNestedScrollingEnabled(enabled);
    }

    /**
     * 是否允许嵌套滑动
     *
     * @return
     */
    @Override
    public boolean isNestedScrollingEnabled() {
        return mScrollingChildHelper.isNestedScrollingEnabled();
    }

    /**
     * 告诉开始嵌套滑动流程，调用这个函数的时候会去找嵌套滑动的父控件。如果找到了父控件并且父控件说可以滑动就返回true，否则返回false
     * (一般ACTION_DOWN里面调用)
     *
     * @param axes:支持嵌套滚动轴。水平方向，垂直方向，或者不指定
     * @return true 父控件说可以滑动，false 父控件说不可以滑动
     */
    @Override
    public boolean startNestedScroll(int axes) {
        return mScrollingChildHelper.startNestedScroll(axes);
    }

    /**
     * 停止嵌套滑动流程(一般ACTION_UP里面调用)
     */
    @Override
    public void stopNestedScroll() {
        mScrollingChildHelper.stopNestedScroll();
    }

    /**
     * 是否有嵌套滑动对应的父控件
     *
     * @return
     */
    @Override
    public boolean hasNestedScrollingParent() {
        return mScrollingChildHelper.hasNestedScrollingParent();
    }

    /**
     * 在嵌套滑动的子View滑动之后再调用该函数向父View汇报滑动情况。
     *
     * @param dxConsumed     子View水平方向滑动的距离
     * @param dyConsumed     子View垂直方向滑动的距离
     * @param dxUnconsumed   子View水平方向没有滑动的距离
     * @param dyUnconsumed   子View垂直方向没有滑动的距离
     * @param offsetInWindow 出参 如果父View滑动导致子View的窗口发生了变化（子View的位置发生了变化）
     *                       该参数返回x(offsetInWindow[0]) y(offsetInWindow[1])方向的变化
     *                       如果你记录了手指最后的位置，需要根据参数offsetInWindow计算偏移量，才能保证下一次的touch事件的计算是正确的。
     * @return true 如果父View有滑动做了相应的处理, false 父View没有滑动.
     */
    @Override
    public boolean dispatchNestedScroll(int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed, int[] offsetInWindow) {
        return mScrollingChildHelper.dispatchNestedScroll(dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, offsetInWindow);
    }

    /**
     * 在嵌套滑动的子View滑动之前，告诉父View滑动的距离，让父View做相应的处理。
     *
     * @param dx             告诉父View水平方向需要滑动的距离
     * @param dy             告诉父View垂直方向需要滑动的距离
     * @param consumed       出参. 如果不是null, 则告诉子View父View滑动的情况， consumed[0]父View告诉子View水平方向滑动的距离(dx)
     *                       consumed[1]父View告诉子View垂直方向滑动的距离(dy).
     * @param offsetInWindow 可选 length=2的数组，如果父View滑动导致子View的窗口发生了变化（子View的位置发生了变化）
     *                       该参数返回x(offsetInWindow[0]) y(offsetInWindow[1])方向的变化
     *                       如果你记录了手指最后的位置，需要根据参数offsetInWindow计算偏移量，才能保证下一次的touch事件的计算是正确的。
     * @return true 父View滑动了，false 父View没有滑动。
     */
    @Override
    public boolean dispatchNestedPreScroll(int dx, int dy, int[] consumed, int[] offsetInWindow) {
        return mScrollingChildHelper.dispatchNestedPreScroll(dx, dy, consumed, offsetInWindow);
    }

    /**
     * 在嵌套滑动的子View fling之后再调用该函数向父View汇报fling情况。
     *
     * @param velocityX 水平方向的速度
     * @param velocityY 垂直方向的速度
     * @param consumed  true 如果子View fling了, false 如果子View没有fling
     * @return true 如果父View fling了
     */
    @Override
    public boolean dispatchNestedFling(float velocityX, float velocityY, boolean consumed) {
        return mScrollingChildHelper.dispatchNestedFling(velocityX, velocityY, consumed);
    }

    /**
     * 在嵌套滑动的子View fling之前告诉父View fling的情况。
     *
     * @param velocityX 水平方向的速度
     * @param velocityY 垂直方向的速度
     * @return 如果父View fling了
     */
    @Override
    public boolean dispatchNestedPreFling(float velocityX, float velocityY) {
        return mScrollingChildHelper.dispatchNestedPreFling(velocityX, velocityY);
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        mScrollingChildHelper.onDetachedFromWindow();
    }
}
```

#### 嵌套滑动的处理者：父View
主要思路：
1. 实现NestedScrollingParent接口。 
2. 定义NestedScrollingParentHelper变量。 
3. 在实现的NestedScrollingParent几个接口中(onNestedScrollAccepted, onStopNestedScroll, getNestedScrollAxes)调用NestedScrollingParentHelper对应的函数。 
4. 视情况而定onNestedScroll onNestedPreScroll onNestedFling onNestedPreFling 做相应的处理。

```
package com.soubu.sample.nestedscrolling;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.view.NestedScrollingParent;
import android.support.v4.view.NestedScrollingParentHelper;
import android.support.v4.view.ViewCompat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;

import java.util.Arrays;

/**
 * 嵌套滑动的处理者：父View
 * <p>
 * 作者：余天然 on 2017/3/30 上午10:42
 */
public class NestedParentLayout extends FrameLayout implements NestedScrollingParent {

    private static final String TAG = "NestedParentLayout";

    private NestedScrollingParentHelper mScrollingParentHelper;

    public NestedParentLayout(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    private void init() {
        mScrollingParentHelper = new NestedScrollingParentHelper(this);
    }

    /**
     * 有嵌套滑动到来了，问下该父View是否接受嵌套滑动
     *
     * @param child            嵌套滑动对应的父类的子类(因为嵌套滑动对于的父View不一定是一级就能找到的，可能挑了两级父View的父View，child的辈分>=target)
     * @param target           具体嵌套滑动的那个子类
     * @param nestedScrollAxes 支持嵌套滚动轴。水平方向，垂直方向，或者不指定
     * @return 是否接受该嵌套滑动
     */
    @Override
    public boolean onStartNestedScroll(View child, View target, int nestedScrollAxes) {
        Log.d(TAG, "onStartNestedScroll() called with: " + "child = [" + child + "], target = [" + target + "], nestedScrollAxes = [" + nestedScrollAxes + "]");
        return true;
    }

    /**
     * 该父View接受了嵌套滑动的请求该函数调用。onStartNestedScroll返回true该函数会被调用。
     * 参数和onStartNestedScroll一样
     */
    @Override
    public void onNestedScrollAccepted(View child, View target, int nestedScrollAxes) {
        mScrollingParentHelper.onNestedScrollAccepted(child, target, nestedScrollAxes);
    }

    /**
     * 获取嵌套滑动的轴
     *
     * @see ViewCompat#SCROLL_AXIS_HORIZONTAL 垂直
     * @see ViewCompat#SCROLL_AXIS_VERTICAL 水平
     * @see ViewCompat#SCROLL_AXIS_NONE 都支持
     */
    @Override
    public int getNestedScrollAxes() {
        return mScrollingParentHelper.getNestedScrollAxes();
    }

    /**
     * 停止嵌套滑动
     *
     * @param target 具体嵌套滑动的那个子类
     */
    @Override
    public void onStopNestedScroll(View target) {
        mScrollingParentHelper.onStopNestedScroll(target);
    }

    /**
     * 嵌套滑动的子View在滑动之后报告过来的滑动情况
     *
     * @param target       具体嵌套滑动的那个子类
     * @param dxConsumed   水平方向嵌套滑动的子View滑动的距离(消耗的距离)
     * @param dyConsumed   垂直方向嵌套滑动的子View滑动的距离(消耗的距离)
     * @param dxUnconsumed 水平方向嵌套滑动的子View未滑动的距离(未消耗的距离)
     * @param dyUnconsumed 垂直方向嵌套滑动的子View未滑动的距离(未消耗的距离)
     */
    @Override
    public void onNestedScroll(View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {

    }

    /**
     * 在嵌套滑动的子View未滑动之前告诉过来的准备滑动的情况
     *
     * @param target   具体嵌套滑动的那个子类
     * @param dx       水平方向嵌套滑动的子View想要变化的距离
     * @param dy       垂直方向嵌套滑动的子View想要变化的距离
     * @param consumed 这个参数要我们在实现这个函数的时候指定，回头告诉子View当前父View消耗的距离
     *                 consumed[0] 水平消耗的距离，consumed[1] 垂直消耗的距离 好让子view做出相应的调整
     */
    @Override
    public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
        Log.d(TAG, "onNestedPreScroll() called with: " + "dx = [" + dx + "], dy = [" + dy + "], consumed = [" + Arrays.toString(consumed) + "]");
        final View child = target;
        if (dx > 0) {
            if (child.getRight() + dx > getWidth()) {
                dx = child.getRight() + dx - getWidth();//多出来的
                offsetLeftAndRight(dx);
                consumed[0] += dx;//父亲消耗
            }

        } else {
            if (child.getLeft() + dx < 0) {
                dx = dx + child.getLeft();
                offsetLeftAndRight(dx);
                Log.d(TAG, "dx:" + dx);
                consumed[0] += dx;//父亲消耗
            }

        }

        if (dy > 0) {
            if (child.getBottom() + dy > getHeight()) {
                dy = child.getBottom() + dy - getHeight();
                offsetTopAndBottom(dy);
                consumed[1] += dy;
            }
        } else {
            if (child.getTop() + dy < 0) {
                dy = dy + child.getTop();
                offsetTopAndBottom(dy);
                Log.d(TAG, "dy:" + dy);
                consumed[1] += dy;//父亲消耗
            }
        }
    }

    /**
     * 嵌套滑动的子View在fling之后报告过来的fling情况
     *
     * @param target    具体嵌套滑动的那个子类
     * @param velocityX 水平方向速度
     * @param velocityY 垂直方向速度
     * @param consumed  子view是否fling了
     * @return true 父View是否消耗了fling
     */
    @Override
    public boolean onNestedFling(View target, float velocityX, float velocityY, boolean consumed) {
        return false;
    }

    /**
     * 在嵌套滑动的子View未fling之前告诉过来的准备fling的情况
     *
     * @param target    具体嵌套滑动的那个子类
     * @param velocityX 水平方向速度
     * @param velocityY 垂直方向速度
     * @return true 父View是否消耗了fling
     */
    @Override
    public boolean onNestedPreFling(View target, float velocityX, float velocityY) {
        return false;
    }

}
```
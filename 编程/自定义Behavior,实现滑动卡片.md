tags: android

先上效果图：

![](./_image/1458573-7df5c04cc5f3b2e9.gif)

上传GIF图到简书搞了半天，后来发现是文件太大的原因，于是在这个网站压缩了一下：[压缩GIF](http://www.iloveimg.com/zh_cn/compress-image/compress-gif)

至于是怎么录制这个GIF的，很简单:用Vysor同步手机屏幕到电脑上，然后用licecap录制即可。

## 1、自定义视图
注意点：
1. 自定义组合视图+自定义属性，没啥说的
2. 布局中使用了merge标签，（仅可）代替FrameLayout，减少布局层次,注意：这里不用merge会有诡异事件发生！
3. Adapter使用了我自己的一个库，引用和使用参见：[Adapter的封装之路](http://www.jianshu.com/p/f530318be47a)，注意：这里使用ListView会有诡异事件发生！
4. 监听onSizeChanged方法，获取headerHeight
5. 通过注解绑定该控件对应的Behavior

```
package com.che.slidingcard.slidingcard;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.graphics.Rect;
import android.support.design.widget.CoordinatorLayout;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;

import com.che.slidingcard.R;
import com.che.superadapter.SingleAdapter;
import com.che.superadapter.SuperViewHolder;

import java.util.ArrayList;
import java.util.List;

/**
 * 作者：余天然 on 16/9/13 下午11:15
 */
@CoordinatorLayout.DefaultBehavior(SlidingCardBehavior.class)
public class SlidingCardView extends FrameLayout {

    private int headerHeight;

    public SlidingCardView(Context context) {
        this(context, null);
    }

    public SlidingCardView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public SlidingCardView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs, defStyleAttr);
    }

    private void init(final Context context, AttributeSet attrs, int defStyleAttr) {
        LayoutInflater.from(context).inflate(R.layout.view_slidingcard, this);
        TextView textView = (TextView) findViewById(R.id.tv);
        RecyclerView recyclerView = (RecyclerView) findViewById(R.id.rv);

        TypedArray array = context.obtainStyledAttributes(attrs, R.styleable.SlidingCardView, defStyleAttr, 0);
        int color = array.getColor(R.styleable.SlidingCardView_card_color, Color.GREEN);
        String text = array.getString(R.styleable.SlidingCardView_card_text);
        array.recycle();

        textView.setText(text);
        textView.setBackgroundColor(color);

        SingleAdapter<String> adapter = new SingleAdapter<String>(context, R.layout.list_item) {
            @Override
            protected void bindData(SuperViewHolder holder, String item) {
                TextView textView = holder.getView(R.id.text);
                textView.setText(item);
            }
        };
        recyclerView.addItemDecoration(new RecyclerView.ItemDecoration() {
            @Override
            public void getItemOffsets(Rect outRect, View view,
                                       RecyclerView parent, RecyclerView.State state) {
                final int position = parent.getChildViewHolder(view).getAdapterPosition();
                final int offset = parent.getResources()
                        .getDimensionPixelOffset(R.dimen.activity_vertical_margin);
                outRect.set(offset,
                        position == 0 ? offset : 0,
                        offset,
                        offset);
            }
        });
        recyclerView.setLayoutManager(new LinearLayoutManager(context));
        recyclerView.setAdapter(adapter);
        adapter.setData(getData());
    }

    private List<String> getData() {
        List<String> data = new ArrayList<>();
        data.add("Android");
        data.add("Java");
        data.add("Web");
        data.add("PHP");
        data.add("Python");
        data.add("Html");
        data.add("Css");
        data.add("Js");
        return data;
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        if (w != oldw || h != oldh) {
            headerHeight = findViewById(R.id.tv).getMeasuredHeight();
        }
    }

    public int getHeaderHeight() {
        return headerHeight;
    }

}
```

## 2.自定义Behavior
注意点：
1. 首先重写onMeasureChild()，重新测量子控件的宽高，MeasureSpec的用法不熟悉的自己补去：[三杆火枪干掉自定义View](http://www.stay4it.com/course/24)
2. 然后重写onLayoutChild(),重新布局子控件的位置，这里主要是通过offsetTopAndBottom()来设置偏移值来改变位置的
3. onStartNestedScroll()判断方向来决定是否要配合子view做出响应。
4. onNestedPreScroll()与onNestedScroll()执行嵌套滑动之前和之后的处理



```
package com.che.slidingcard.slidingcard;

import android.support.design.widget.CoordinatorLayout;
import android.support.v4.view.ViewCompat;
import android.view.View;

/**
 * 作者：余天然 on 16/9/13 下午11:16
 */
public class SlidingCardBehavior extends CoordinatorLayout.Behavior<SlidingCardView> {

    private int defaultOffset;//默认偏移值

    @Override
    public boolean onMeasureChild(CoordinatorLayout parent, SlidingCardView child, int parentWidthMeasureSpec, int widthUsed, int parentHeightMeasureSpec, int heightUsed) {
        int offset = getChildMeasureOffset(parent, child);
        int height = View.MeasureSpec.getSize(parentHeightMeasureSpec) - offset;
        int heightMeasureSpec = View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY);
        child.measure(parentWidthMeasureSpec, heightMeasureSpec);
        return true;
    }

    @Override
    public boolean onLayoutChild(CoordinatorLayout parent, SlidingCardView child, int layoutDirection) {
        parent.onLayoutChild(child, layoutDirection);
        SlidingCardView previous = getPreviousChild(parent, child);
        if (previous != null) {
            int offset = previous.getTop() + previous.getHeaderHeight();
            child.offsetTopAndBottom(offset);
        }
        defaultOffset = child.getTop();
        return true;
    }

    /**
     * 有嵌套滑动到来了，问下父View是否接受嵌套滑动
     *
     * @param coordinatorLayout
     * @param child             嵌套滑动对应的父类的子类(因为嵌套滑动对于的父View不一定是一级就能找到的，可能挑了两级父View的父View，child的辈分>=target)
     * @param directTargetChild
     * @param target            具体嵌套滑动的那个子类
     * @param nestedScrollAxes  支持嵌套滚动轴。水平方向，垂直方向，或者不指定
     * @return 是否接受该嵌套滑动
     */
    @Override
    public boolean onStartNestedScroll(CoordinatorLayout coordinatorLayout, SlidingCardView child, View directTargetChild, View target, int nestedScrollAxes) {
        //判断监听的方向
        boolean isVertical = (nestedScrollAxes & ViewCompat.SCROLL_AXIS_VERTICAL) != 0;
        return isVertical && child == directTargetChild;
    }

    /**
     * 在嵌套滑动的子View未滑动之前告诉过来的准备滑动的情况
     *
     * @param parent
     * @param child
     * @param target   具体嵌套滑动的那个子类
     * @param dx       水平方向嵌套滑动的子View想要变化的距离
     * @param dy       垂直方向嵌套滑动的子View想要变化的距离
     * @param consumed 这个参数要我们在实现这个函数的时候指定，回头告诉子View当前父View消耗的距离
     *                 consumed[0] 水平消耗的距离，consumed[1] 垂直消耗的距离 好让子view做出相应的调整
     */
    @Override
    public void onNestedPreScroll(CoordinatorLayout parent, SlidingCardView child, View target, int dx, int dy, int[] consumed) {
        if (child.getTop() > defaultOffset) {
            //1、控制自己的滑动
            int minOffset = defaultOffset;
            int maxOffset = defaultOffset + child.getHeight() - child.getHeaderHeight();
            consumed[1] = scroll(child, dy, minOffset, maxOffset);
            //2、控制上面和下面的滑动
            shiftScroll(consumed[1], parent, child);
        }
    }

    /**
     * 嵌套滑动的子View在滑动之后报告过来的滑动情况
     *
     * @param parent
     * @param child
     * @param target       具体嵌套滑动的那个子类
     * @param dxConsumed   水平方向嵌套滑动的子View滑动的距离(消耗的距离)
     * @param dyConsumed   垂直方向嵌套滑动的子View滑动的距离(消耗的距离)
     * @param dxUnconsumed 水平方向嵌套滑动的子View未滑动的距离(未消耗的距离)
     * @param dyUnconsumed 垂直方向嵌套滑动的子View未滑动的距离(未消耗的距离)
     */
    @Override
    public void onNestedScroll(CoordinatorLayout parent, SlidingCardView child, View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
        //1、控制自己的滑动
        int minOffset = defaultOffset;
        int maxOffset = defaultOffset + child.getHeight() - child.getHeaderHeight();
        int scrollY = scroll(child, dyUnconsumed, minOffset, maxOffset);
        //2、控制上面和下面的滑动
        shiftScroll(scrollY, parent, child);
    }

    /**
     * 处理自己的滑动
     *
     * @param child
     * @param dy
     * @param minOffset
     * @param maxOffset
     * @return
     */
    private int scroll(SlidingCardView child, int dy, int minOffset, int maxOffset) {
        int top = child.getTop();
        int offset = clamp(top - dy, minOffset, maxOffset) - top;
        child.offsetTopAndBottom(offset);
        return -offset;
    }

    /**
     * 处理其它的滑动
     *
     * @param scrollY
     * @param parent
     * @param child
     */
    private void shiftScroll(int scrollY, CoordinatorLayout parent, SlidingCardView child) {
        if (scrollY == 0) return;
        if (scrollY > 0) {//往上推
            SlidingCardView current = child;
            SlidingCardView card = getPreviousChild(parent, current);
            while (card != null) {
                int delta = calcOtherOffset(card, current);
                if (delta > 0) {
                    card.offsetTopAndBottom(-delta);
                }
                current = card;
                card = getPreviousChild(parent, current);
            }
        } else {//往下推
            SlidingCardView current = child;
            SlidingCardView card = getNextChild(parent, current);
            while (card != null) {
                int delta = calcOtherOffset(current, card);
                if (delta > 0) {
                    card.offsetTopAndBottom(delta);
                }
                current = card;
                card = getNextChild(parent, current);
            }

        }
    }


    /**
     * 获取卡片的默认偏移值
     *
     * @param parent
     * @param child
     * @return
     */
    private int getChildMeasureOffset(CoordinatorLayout parent, SlidingCardView child) {
        int offset = 0;
        for (int i = 0; i < parent.getChildCount(); i++) {
            View view = parent.getChildAt(i);
            //排除自己
            if (view != child && view instanceof SlidingCardView) {
                SlidingCardView slidingCardView = (SlidingCardView) view;
                offset += slidingCardView.getHeaderHeight();
            }
        }
        return offset;
    }

    /**
     * 计算其它卡片的偏移值
     *
     * @param above
     * @param below
     * @return
     */
    private int calcOtherOffset(SlidingCardView above, SlidingCardView below) {
        return above.getTop() + above.getHeaderHeight() - below.getTop();
    }

    /**
     * 获取上一个卡片
     *
     * @param parent
     * @param child
     * @return
     */
    private SlidingCardView getPreviousChild(CoordinatorLayout parent, SlidingCardView child) {
        int cardIndex = parent.indexOfChild(child);
        for (int i = cardIndex - 1; i >= 0; i--) {
            View view = parent.getChildAt(i);
            if (view instanceof SlidingCardView) {
                return (SlidingCardView) view;
            }
        }
        return null;
    }

    /**
     * 获取下一个卡片
     *
     * @param parent
     * @param child
     * @return
     */
    private SlidingCardView getNextChild(CoordinatorLayout parent, SlidingCardView child) {
        int cardIndex = parent.indexOfChild(child);
        for (int i = cardIndex + 1; i < parent.getChildCount(); i++) {
            View view = parent.getChildAt(i);
            if (view instanceof SlidingCardView) {
                return (SlidingCardView) view;
            }
        }
        return null;
    }

    /**
     * 取上下限之间的值
     *
     * @param i
     * @param minOffset
     * @param maxOffset
     * @return
     */
    private int clamp(int i, int minOffset, int maxOffset) {
        if (i < minOffset) {
            return minOffset;
        } else if (i > maxOffset) {
            return maxOffset;
        } else {
            return i;
        }
    }
}
```

 #3.依赖的资源:
---
R.layout.activity_main:
```
<?xml version="1.0" encoding="utf-8"?>
<android.support.design.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:background="#00F5FF"
    android:layout_height="match_parent">

    <com.che.slidingcard.slidingcard.SlidingCardView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:card_color="#cc3399"
        app:card_text="卡片1"/>

    <com.che.slidingcard.slidingcard.SlidingCardView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:card_color="#99ffcc"
        app:card_text="卡片2"/>

    <com.che.slidingcard.slidingcard.SlidingCardView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:card_color="#33ccff"
        app:card_text="卡片3"/>

    <com.che.slidingcard.slidingcard.SlidingCardView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:card_color="#F4A460"
        app:card_text="卡片4"/>

</android.support.design.widget.CoordinatorLayout>
```

R.layout.view_slidingcard:
```
<?xml version="1.0" encoding="utf-8"?>
<merge
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.support.v7.widget.RecyclerView
        android:id="@+id/rv"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:paddingTop="@dimen/card_header_height"
        android:background="#C0C0C0"/>

    <TextView
        android:id="@+id/tv"
        android:layout_width="match_parent"
        android:layout_height="@dimen/card_header_height"
        android:background="#000000"
        android:gravity="center_vertical"
        android:text="头部"/>


</merge>
```
R.styleable.SlidingCardView:
```
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="SlidingCardView">
        <attr name="card_color" format="color"/>
        <attr name="card_text" format="string"/>
    </declare-styleable>
</resources>
```
R.layout.list_item:
```
<?xml version="1.0" encoding="utf-8"?>
<android.support.v7.widget.CardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="?android:attr/listPreferredItemHeight"
    app:cardCornerRadius="4dp"
    app:cardElevation="2dp"
    android:foreground="?android:attr/selectableItemBackground">
    <TextView
        android:id="@+id/text"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        android:gravity="center_vertical"
        android:textAppearance="?android:attr/textAppearanceLarge"/>

</android.support.v7.widget.CardView>
```

最后，[奉上源码](https://github.com/fishyer/SuperAdapter)，欢迎拍砖！
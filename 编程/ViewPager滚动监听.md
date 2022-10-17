场景：监听ViewPager滚动到最后一页后，继续往后滑动

![](2020-08-03-21-52-50.jpg)

## 1.监听滚动状态
```
viewpager.setOnPageChangeListener(new ViewPager.OnPageChangeListener() {
               @Override
               public void onPageScrollStateChanged(int arg0) {
                    switch (arg0) {
                    case 1:// 手势滑动，空闲中
                         isAutoPlay = false;
                         break;
                    case 2:// 界面切换中
                         isAutoPlay = true;
                         break;
                    case 0:// 滑动结束，即切换完毕或者加载完毕
                              // 当前为最后一张，此时从右向左滑，则切换到第一张
                         if (viewpager.getCurrentItem() == viewpager.getAdapter()
                                   .getCount() - 1 && !isAutoPlay) {
                              viewpager.setCurrentItem(0);
                         }
                         // 当前为第一张，此时从左向右滑，则切换到最后一张
                         else if (viewpager.getCurrentItem() == 0 && !isAutoPlay) {
                              viewpager.setCurrentItem(viewpager.getAdapter()
                                        .getCount() - 1);
                         }
                         break;
                    }
               }
               @Override
               public void onPageScrolled(int arg0, float arg1, int arg2) {
               }
               @Override
               public void onPageSelected(int pageIndex) {
                    currentPageIndex = pageIndex;
                    setBrandTab(pageIndex);
               }
          });
```

## 2.自定义ViewPager
```
package com.example.chechengwang.view;
import android.content.Context;
import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.view.MotionEvent;
public class MyChildViewPager extends ViewPager {
     public MyChildViewPager(Context context, AttributeSet attrs) {
          super(context, attrs);
          initView();
     }
     public MyChildViewPager(Context context) {
          super(context);
          initView();
     }
     private void initView() {
     }
     @Override
     public boolean onTouchEvent(MotionEvent arg0) {
          //通知父控件，自己可以处理，不要拦截了
          getParent().requestDisallowInterceptTouchEvent(true);
          return super.onTouchEvent(arg0);
     }
}
```
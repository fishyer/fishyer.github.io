#1、BaseViewPagerAdapter
```
package com.che.lovecar.ui.check;

import android.support.v4.view.PagerAdapter;
import android.view.View;
import android.view.ViewGroup;

import java.util.List;

/**
 * 作者：余天然 on 2016/10/28 下午7:58
 */
public class BaseViewPagerAdapter extends PagerAdapter {
    private List<View> views;

    public BaseViewPagerAdapter(List<View> views) {
        this.views = views;//构造方法，参数是我们的页卡，这样比较方便。
    }

    @Override
    public void destroyItem(ViewGroup container, int position, Object object) {
        container.removeView(views.get(position));//删除页卡
    }


    @Override
    public Object instantiateItem(ViewGroup container, int position) {  //这个方法用来实例化页卡
        container.addView(views.get(position), 0);//添加页卡
        return views.get(position);
    }

    @Override
    public int getCount() {
        return views.size();//返回页卡的数量
    }

    @Override
    public boolean isViewFromObject(View arg0, Object arg1) {
        return arg0 == arg1;//官方提示这样写
    }
}

```

#2、BaseFragmentPagerAdapter
```
package com.che.lovecar.ui.check;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * 作者：余天然 on 2016/10/28 下午8:03
 */
public class BaseFragmentPagerAdapter extends FragmentPagerAdapter {

    List<Fragment> fragments = new ArrayList<>();

    public BaseFragmentPagerAdapter(FragmentManager fm) {
        super(fm);
    }

    public void setFragments(List<Fragment> datas) {
        this.fragments = datas;
        notifyDataSetChanged();
    }

    @Override
    public Fragment getItem(int position) {
        return fragments.get(position);
    }

    @Override
    public int getCount() {
        return fragments.isEmpty() ? 0 : fragments.size();
    }

}

```
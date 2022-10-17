#1.Fragment生命周期图：
---
![](http://upload-images.jianshu.io/upload_images/680065-92582d8bd3f15a2a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#2.Fragment与Activity生命周期对比图：
---
![](http://upload-images.jianshu.io/upload_images/680065-502af1789ad5ef3c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#3.生命周期分析：
---
1. 当一个fragment被创建的时候，它会经历以下状态.
onAttach()
onCreate()
onCreateView()
onActivityCreated()

2. 当这个fragment对用户可见的时候，它会经历以下状态。
onStart()
onResume()

3. 当这个fragment进入“后台模式”的时候，它会经历以下状态。
onPause()
onStop()

4. 当这个fragment被销毁了（或者持有它的activity被销毁了），它会经历以下状态。
onPause()
onStop()
onDestroyView()
onDestroy()
onDetach()

5. 就像activity一样，在以下的状态中，可以使用Bundle对象保存一个fragment的对象。
onCreate()
onCreateView()
onActivityCreated()

6. fragments的大部分状态都和activity很相似，但fragment有一些新的状态。
onAttached() —— 当fragment被加入到activity时调用（在这个方法中可 以获得所 在的activity）。
onCreateView() —— 当activity要得到fragment的layout时，调用此方法，fragment在其中创建自己的layout(界面)。
onActivityCreated() —— 当activity的onCreated()方法返回后调用此方法
onDestroyView() —— 当fragment中的视图被移除的时候，调用这个方法。
onDetach() —— 当fragment和activity分离的时候，调用这个方法。
---
一旦activity进入resumed状态（也就是running状态），你就可以自由地添加和删除fragment了。因此，只有当activity在resumed状态时，fragment的生命周期才能独立的运转，其它时候是依赖于activity的生命周期变化的。

#4.add、show与hide
---
防止频繁地创建和销毁fragment
```
    private void initFragment() {
        fragments = new ArrayList<>();
        fragments.add(new HomeFragment());
        fragments.add(new FindFragment());
        fragments.add(new NewsFragment());
        fragments.add(new MineFragment());
        setCurFragment(0);
    }

    private void setCurFragment(int pos) {
        LogUtil.print("pos=" + pos);
        FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
        for (int i = 0; i < fragments.size(); i++) {
            Fragment fragment = fragments.get(i);
            if (i == pos) {
                if (fragment.isAdded()) {
                    ft.show(fragment);
                } else {
                    ft.add(R.id.view_content, fragment, String.valueOf(pos));
                }
            } else {
                if (fragment.isAdded()) {
                    ft.hide(fragment);
                }
            }
        }
        ft.commit();
    }
```
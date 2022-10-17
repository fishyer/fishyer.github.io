---
link: https://www.notion.so/Android-Holder-4bb52bc2577b4036be0da67485fa25b2
notionID: 4bb52bc2-577b-4036-be0d-a67485fa25b2
---

相信大家在Android编程中，应该会有一种体验：一个Activity要执行的功能太多了，导致代码有时甚至上千行，极其不方便阅读和修改，这里，面向Holder编程，就是解决这个问题的一个绝佳方案。

所谓面向Holder编程，其实很简单，就是把一个大的复杂的功能或者页面分成几个小的功能分别去实现，下面我们看一张图片来说明面向Holder编程思想：


![](http://upload-images.jianshu.io/upload_images/1458573-0f278543a2fa9c4d?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 一、拆分界面

这里，我们可以将该界面分成6个部分来完成：顶部导航栏、车城头条、车城服务、认证专区、热门推荐、购车攻略。

最后这个界面的布局如下：

```XML
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <com.che.chechengwang.support.view.ObservableScrollView
        android:id="@+id/sv_root"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#ffffff"
        android:overScrollMode="never"
        android:scrollbars="none">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical">

            <!--车城头条-->
            <FrameLayout
                android:id="@+id/fr_carHead"
                android:layout_width="match_parent"
                android:layout_height="wrap_content" />

            <!--车城服务-->
            <FrameLayout
                android:id="@+id/fr_carService"
                android:layout_width="match_parent"
                android:layout_height="wrap_content" />

            <!--认证专区-->
            <FrameLayout
                android:id="@+id/fr_authRegion"
                android:layout_width="match_parent"
                android:layout_height="wrap_content" />

            <!--热门推荐-->
            <FrameLayout
                android:id="@+id/fr_hotRecommend"
                android:layout_width="match_parent"
                android:layout_height="wrap_content" />

            <!--购车攻略-->
            <FrameLayout
                android:id="@+id/fr_buyGuide"
                android:layout_width="match_parent"
                android:layout_height="wrap_content" />

        </LinearLayout>

    </com.che.chechengwang.support.view.ObservableScrollView>

    <!--顶部导航栏-->
    <FrameLayout
        android:id="@+id/fr_searchbar"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />

</FrameLayout>
```


## 二、各个击破

&ensp;&ensp;&ensp;&ensp;下面以"热门推荐"Holder来看看具体实现：

```Java
public class Holder_HotRecommend extends BaseHolder {

    @Bind(R.id.more01)
    View more01;
    @Bind(R.id.more02)
    ImageView more02;
    @Bind(R.id.rl_more)
    RelativeLayout rlMore;
    @Bind(R.id.iv_hot01)
    ImageView ivHot01;
    @Bind(R.id.tv_hot01)
    TextView tvHot01;
    @Bind(R.id.iv_hot02)
    ImageView ivHot02;
    @Bind(R.id.tv_hot02)
    TextView tvHot02;
    @Bind(R.id.iv_hot04)
    ImageView ivHot04;
    @Bind(R.id.tv_hot04)
    TextView tvHot04;
    @Bind(R.id.iv_hot03)
    ImageView ivHot03;
    @Bind(R.id.tv_hot03)
    TextView tvHot03;
    @Bind(R.id.iv_hot05)
    ImageView ivHot05;
    @Bind(R.id.tv_hot05)
    TextView tvHot05;

    @Override
    public View setContentView() {
        return CarHelper.inflate(R.layout.holder_home_hotrecommend);
    }

    public void setRecommend(List<HomeResponse.HotListEntity> hotList) {
        ImageView[] icons = new ImageView[]{ivHot01, ivHot02, ivHot03, ivHot04, ivHot05};
        TextView[] titles = new TextView[]{tvHot01, tvHot02, tvHot03, tvHot04, tvHot05};

        for (int i = 0; i < hotList.size(); i++) {
            HomeResponse.HotListEntity item = hotList.get(i);
            ImagePresenter.display(item.getImg(), icons[i]);
            titles[i].setText(item.getName());
        }
    }
}
```


这里呢，我的Holder_HotRecommend是继承自一个基类BaseHolder,其实这个基类也没做啥，就是定义了加载布局的抽象方法，并注册了Butterknife而已，代码如下：

```Java
public abstract class BaseHolder {

    private View contentView;

    public BaseHolder() {
        contentView = setContentView();
        ButterKnife.bind(this, contentView);
        init();
    }

    //把当前的view返回给父类
    public View getContentView() {
        return contentView;
    }

    //设置根视图
    public abstract View setContentView();

    //执行一些初始化的操作，非必须，所以空实现了，需要的话重写即可
    public void init() {
    }
}
```


## 三、贴到墙上

这里呢，Activity（或Fragment）就像照片墙，我们只需要不断地往上贴照片，具体的照片拍成什么样,那个就不归activity管了。我这里呢，是用一个fragment来做照片墙的，那么如何贴上去呢，我们来看代码：

```Java
public class M1_HomeFragment extends CarBaseFragment {
    @Bind(R.id.fr_carHead)
    FrameLayout frCarHead;
    @Bind(R.id.fr_carService)
    FrameLayout frCarService;
    @Bind(R.id.fr_authRegion)
    FrameLayout frAuthRegion;
    @Bind(R.id.fr_hotRecommend)
    FrameLayout frHotRecommend;
    @Bind(R.id.fr_buyGuide)
    FrameLayout frBuyGuide;
    @Bind(R.id.sv_root)
    ObservableScrollView svRoot;
    @Bind(R.id.fr_searchbar)
    FrameLayout frSearchbar;
    private Holder_SearchBar holderSearchBar;
    private Holder_CarHead holderCarHead;
    private Holder_CarService holderCarService;
    private Holder_AuthRegion holderAuthRegion;
    private Holder_HotRecommend holderHotRecommend;
    private Holder_BuyGuide holderBuyGuide;
    private View mainView;

    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        mainView = inflater.inflate(R.layout.fragment_home_container, null);
        ButterKnife.bind(this, mainView);
        initView();
        initData();
        return mainView;
    }

    private void initView() {
        holderSearchBar = new Holder_SearchBar();
        holderCarHead = new Holder_CarHead();
        holderCarService = new Holder_CarService();
        holderAuthRegion = new Holder_AuthRegion();
        holderHotRecommend = new Holder_HotRecommend();
        holderBuyGuide = new Holder_BuyGuide();

        frSearchbar.addView(holderSearchBar.getContentView());
        frCarHead.addView(holderCarHead.getContentView());
        frCarService.addView(holderCarService.getContentView());
        frAuthRegion.addView(holderAuthRegion.getContentView());
        frHotRecommend.addView(holderHotRecommend.getContentView());
        frBuyGuide.addView(holderBuyGuide.getContentView());
        holderSearchBar.setBannerHeight(DensityUtil.getScreenWidth() * 3 / 5);
        svRoot.setScrollViewListener(holderSearchBar);
    }

    private void initData() {
        HttpPresenter.getHomeInfo(getActivity().hashCode(), new OkHttpUtil.HttpCallBack<HomeResponse>() {
            @Override
            public void onSuccss(HomeResponse homeResponse) {
                LogUtil.print(JsonUtil.getInstance().objToString(homeResponse));

                holderCarHead.setBanner(homeResponse.getBannerList());
                holderCarHead.setHeadInfo(homeResponse.getHeadInfo());

                holderAuthRegion.setAuthList(homeResponse.getAuthList());
                holderAuthRegion.setAcBanner(homeResponse.getActbannerlist());

                holderHotRecommend.setRecommend(homeResponse.getHotList());

                holderBuyGuide.setData(homeResponse.getBuyguideList());
            }

            @Override
            public void onFailure(String error) {

            }
        });

    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        ButterKnife.unbind(this);
        holderCarHead.stopTask();
    }
}
```


这里，其实就是用我们第一步的FrameLayout分别添加了每个Holder的contentView。

这里你也许会说，我的Holder是如何获取网络数据的呢？很简单，因为这里，我们的所有Holder都是同一个数据来源，所以我将获取数据的方法写在了照片墙上，当获取了数据之后，再给holder对象添加一个set方法，将需要的数据给set进去即可。如果我的Holder内中执行某个操作的时候，需要Activity对象，那么很简单，也将Activity对象给set进去。

这里看我的另一个Holder:

```Java
public class Holder_H5 extends BaseHolder {
    @Bind(R.id.wv_content)
    WebView wvContent;
    String url;
    Activity activity;

    @Override
    public View setContentView() {
        return CarHelper.inflate(R.layout.holder_h5);
    }

    public void setUrl(String url) {
        this.url = url;
        initView();
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public void initView() {
        WebSettings setting = wvContent.getSettings();
        setting.setJavaScriptEnabled(true);//支持js
        setting.setLoadWithOverviewMode(true);//自适应手机屏幕
        setting.setUseWideViewPort(true);
        wvContent.setWebViewClient(new MyWebViewClient());
        wvContent.loadUrl(url);
        CarHelper.showDialog(activity);
    }

    private class MyWebViewClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            CarHelper.dismissDialog();
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return super.shouldOverrideUrlLoading(view, url);
        }

    }

}
```


其实这就是一个webview而已，那么在需要使用的地方，我们可以这样用：

```Java
public class M3_HelpSellFragment extends CarBaseFragment {

    @Bind(R.id.fr_content)
    FrameLayout frContent;

    String url="http://m.che.com/m/helpSell.xhtml";

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View mainView = inflater.inflate(R.layout.fragment_helpbuy, null);
        ButterKnife.bind(this, mainView);
        initView();
        return mainView;
    }

    private void initView() {
        Holder_H5 holderH5=new Holder_H5();
        holderH5.setActivity(getActivity());
        holderH5.setUrl(url);
        frContent.addView(holderH5.getContentView());
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        ButterKnife.unbind(this);
    }
}
```


这里，我们先注入一个activity进去，再注入一个url进去，而在setUrl的方法中，我让它又调用了initView方法，这样一个holder_h5贴到墙上了，一个有加载进度条的网页activity就搞定了。

之前也看过别人写的一个一个BaseHolder,它是用的泛型，在构造时就需要你指明数据类型，感觉有点机械，它还帮你自定义了几个方法，但是实践发现，这个几个方法貌似没什么卵用，并不是总会用到，它的代码如下：

```Java
public abstract class BaseHolder<T> {
    private View contentView;//界面
    private T data;//数据的类型

    //初始化的时候 先初始化空间，再把控件 都写到view里面（类似于listview的 view.setTag(holder)）
    public BaseHolder() {
        contentView = initView();
        contentView.setTag(this);
    }
//  读取数据：注意这里的数据已经是  网络加载和json解析完 得到的 数据，
    public void setData(T data) {
        this.data = data;
        refreshView(data);//显示界面
    }
    //把当前的view返回给父类
    public View getView() {
        return contentView;
    }
    /**
     * 初始化各种控件
     * @return view
     */
    protected abstract View initView();
    /**
     * 控件添加各种数据 ，耗时炒作等
     * @param data2
     */
    protected abstract void refreshView(T data);
}
```


详情见[向前冲org的博客](http://blog.csdn.net/wanghao200906/article/details/46819101)

我在设计自己的面向holder编程时，也参考了[Top_Android的博客](http://blog.csdn.net/wanghao200906/article/details/46819101),他也是没有用泛型的。

我觉得用泛型的话、或者自定义方法的话，未免有点限制了，如果不是必须用的话，最好还是不用，哈哈，这就是我的编程逻辑。当然，你要是喜欢有泛型和自定义方法，也同样可以，这并不是重点，不是么？

相信经过以上的示例，你对于面向Holder编程应该已经了解了把，现在看一下我的结构：

![](http://upload-images.jianshu.io/upload_images/1458573-4bcf4276d36e10c0?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

怎么样？还算是比较清楚吧，以后再也不怕改了这一块，不小心让另一块也莫名其妙的变化了。

> 如果你有其它拆分和解耦的妙招，不妨也来说说哦！


PS:其实本来想将里面的set注入换成用Dragger2框架来实现的，不过看了Dragger2 的教程看了半天，发现集成起来太麻烦了，太重了。

---
 <sub>本文档由[瓦雀](https://www.yuque.com/waquehq)创建</sub>
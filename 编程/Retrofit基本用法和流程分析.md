# Retrofit基本用法和流程分析

图片来自：Retrofit分析-漂亮的解耦套路(视频版)
![image](https://yupic.oss-cn-shanghai.aliyuncs.com/20210719192530.png)

## 1.Retrofit基本用法

### 1.初始化

```Java
webInterface = new Retrofit.Builder()
        .baseUrl(hostname)
        .client(client)//这个client是OkHttpClient，以后和Okhttp的基本用法和流程分析中细说
        .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
        .addConverterFactory(GsonConverterFactory.create(new Gson()))
        .build()
        .create(WebInterface.class);
```


### 2.定义网络接口

```Java
public interface WebInterface {

    @POST("/***/index")
    Observable<HomeResponse> getHomeIndex(@Body BaseRequest request);//首页

    @FormUrlEncoded
    @POST("/***/freecall")
    Observable<BaseResponse> freeCall(@Field("phone") String phone);//免费电话

}
```


### 3.在Activity中调用

```Java
dataWork = WebHelper.getWebInterface()
        .getHomeIndex(request)
        .compose(new WebTransformer<>(this))
        .subscribe(new WebSubscriber<IndexResponse>() {
            @Override
            public void onSuccess(IndexResponse response) {
                parseData(response);
            }
        });
```


注意要在onDestroy中解绑：

```Java
@Override
public void onDestroy() {
    super.onDestroy();
    if (dataWork != null) {
        dataWork.isUnsubscribed();
    }
}
```


### 4.在WebTransformer中添加进度条和线程切换

```Java
public class WebTransformer<T> implements Observable.Transformer<T, T> {
    Context context;
    boolean hasDialog = true;

    public WebTransformer(Context context) {
        this.context = context;
    }

    public WebTransformer(Context context, boolean hasDialog) {
        this.context = context;
        this.hasDialog = hasDialog;
    }

    @Override
    public Observable<T> call(Observable<T> observable) {
        return observable.subscribeOn(Schedulers.io())
                .doOnSubscribe(new Action0() {
                    @Override
                    public void call() {
                        if (hasDialog) {
                            DialogHelper.showDialog(context);
                        }
                    }
                })
                .subscribeOn(AndroidSchedulers.mainThread())
                .observeOn(AndroidSchedulers.mainThread());
    }
}
```


### 5.在WebSubscriber中添加统一的错误处理

```Java
public abstract class WebSubscriber<T> extends Subscriber<T> {

    @Override
    public void onCompleted() {
    }

    @Override
    public void onNext(T t) {
        DialogHelper.hideDialog();
        //居然还有的返回值不是继承BaseResponse，我想杀了后台，别拦我
        if (t instanceof BaseResponse) {
            BaseResponse baseResponse = (BaseResponse) t;
            //不要问我为什么这么多code,我也不知道后台怎么想的
            if (baseResponse.getCode() != 0 || baseResponse.getResultCode() != 0 || baseResponse.getReplyCode() != 0) {
                String tip = "";
                //不要问我为什么这么多message,我也不知道后台怎么想的
                if (!TextUtils.isEmpty(baseResponse.getMessage())) {
                    tip = baseResponse.getMessage();
                } else {
                    tip = baseResponse.getRemark();
                }
                ToastHelper.show(tip);
                onFailed(t);
            } else {
                onSuccess(t);
            }
        } else {
            onSuccess(t);
        }
    }

    @Override
    public void onError(Throwable e) {
        DialogHelper.hideDialog();
        if (e instanceof HttpException) {
            ToastHelper.show("网络异常");
            HttpException exception = (HttpException) e;
            if (exception.code() == 404) {
                //没登陆的时候居然返回404，我想杀了后台，别拦我
                SkipManager.gotoLogin();
            }
        }
    }

    //需要个性化的错误处理时，重写它
    protected void onFailed(T t) {

    }

    //正确的回调
    public abstract void onSuccess(T t);

}
```


## 2.Retrofit的优点

### **1.什么是网络框架？** 

业务层-->网络调度层-->网络执行层

这里：**Retrofit是网络调度层** 类似volley, retrofit, android-async-http做具体业务请求、线程切换、数据转换

**OkHttp是网络执行层** 类似HttpClient, HttpUrlConnection做底层网络请求

### **2.为什么用Retrofit?** 

因为Retrofit有：**CallAdapter-请求适配器** ：可以实现多种请求响应形式：同步方式、异步回调方式、RxJava方式**Converter-数据转换器** ：可以自己定义responseBodyConverter和requestBodyConverter,实现加密功能和各种奇葩格式的解析

## 3.Retrofit流程分析

以下分析基于compile 'com.squareup.retrofit2:retrofit:2.0.0-beta4'

1.先看我们初始化时的Retrofit.create()方法

![](http://upload-images.jianshu.io/upload_images/1458573-d74d139c5fbec404.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里用到了动态代理，忘记了的话，可以先看我的博客：[[Java-动态代理](http://blog.csdn.net/fisher0113/article/details/51331938)]([http://blog.csdn.net/fisher0113/article/details/51331938](http://blog.csdn.net/fisher0113/article/details/51331938))

2.通过loadMethodHandler(),创建了MethodHandler


![](http://upload-images.jianshu.io/upload_images/1458573-a79790854380410a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3.进去看下MethodHandler.create()


![](http://upload-images.jianshu.io/upload_images/1458573-ce7ae3d70f84de03.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4.在MethodHandler.create()方法中，创建了CallAdapter


![](http://upload-images.jianshu.io/upload_images/1458573-71d83cc1346d934d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-7fb91007354013cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-a005c0b0252f4495.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-8223358d1098935e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-b1f37376a42471fd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

7.CallAdapter有多种实现，为简单起见，只看ExecutorCallAdapterFactory中对adapter的实现


![](http://upload-images.jianshu.io/upload_images/1458573-56b8688187ce6093.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

8.在ExecutorCallbackCall.enqueue()方法中，


![](http://upload-images.jianshu.io/upload_images/1458573-3852d5ed3b36e7c3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

9.delegate.enqueue()是一个抽象方法


![](http://upload-images.jianshu.io/upload_images/1458573-9c5f97378a4ee3ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实现在OkhttpCall.queue()中，方法太长，截图没截完


![](http://upload-images.jianshu.io/upload_images/1458573-67f2a54227f6b10b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

继续看OkhttpCall.enqueue()方法，这里就是具体执行网络请求的地方，将Okhttp.Callback转换成了一个Retrofit.Callback
为什么有两种Callback？因为一个是网络执行层的Callback,一个是网络调度层的Callback


![](http://upload-images.jianshu.io/upload_images/1458573-a5fd56e922a1570f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

10.这里是如何创建Request的呢？看rawCall的创建方法，通过requestFactory将args转成Request,通过callFactory将request转成Okhttp3.Call
为什么有两种Call？因为一个是网络执行层的Call,一个是网络调度层的Call


![](http://upload-images.jianshu.io/upload_images/1458573-d2093a6c985f3473.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

11.好了，发起网络请求搞定，然后网络响应值是如何解析的呢？
看onRespone回调中的parseResponse()


![](http://upload-images.jianshu.io/upload_images/1458573-6c5b7cbf290e041d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-3bb656cceb338e40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-6600328a221316b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好了，流程分析已经大致搞定了，不过这里通过requestBodyConverter用注解创建Requestbody的过程，还是没找到调用的地方，以后再来找下。

## 参考目录

1. [Retrofit分析-漂亮的解耦套路](http://www.jianshu.com/p/45cb536be2f4)

2. [OkHttp, Retrofit, Volley应该选择哪一个？](http://www.jianshu.com/p/77d418e7b5d6)

---
 <sub>本文档由[瓦雀](https://www.yuque.com/waquehq)创建</sub>
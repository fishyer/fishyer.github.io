tags: 星标

> 本文基于compile 'com.squareup.okhttp3:okhttp:3.0.1'

![OkHttp的时序图](http://upload-images.jianshu.io/upload_images/1458573-b48f7b4793267b2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 1.基本用法
这里我是将Okhttp和Retrofit一起使用的
Okhttp执行底层的网络请求，Retrofit负责网络调度，有关Retrofit的更多可参考我的另一篇博文：[Retrofit基本用法和流程分析](http://www.jianshu.com/p/94ca8a284ebb)
**1.初始化**
```
    public static void init() {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        sClient = new OkHttpClient.Builder()
                .retryOnConnectionFailure(true)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(300, TimeUnit.SECONDS)
                .writeTimeout(300, TimeUnit.SECONDS)
                .cache(new Cache(Constants.HTTP_CACHE_DIR, Constants.CACHE_SIZE))
                .addInterceptor(logging)//第三方的日志拦截器
                .addInterceptor(appIntercepter)//自定义的应用拦截器
                .addNetworkInterceptor(netIntercepter)//自定义的网络拦截器
                .build();
    }

```
**2.添加应用拦截器**
```
    //应用拦截器：主要用于设置公共参数，头信息，日志拦截等,有点类似Retrofit的Converter
    private static Interceptor appIntercepter = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = processRequest(chain.request());
            Response response = processResponse(chain.proceed(request));
            return response;
        }
    };

    //访问网络之前，处理Request(这里统一添加了Cookie)
    private static Request processRequest(Request request) {
        String session = CacheManager.restoreLoginInfo(BaseApplication.getContext()).getSession();
        return request
                .newBuilder()
                .addHeader("Cookie", "JSESSIONID=" + session)
                .build();
    }

    //访问网络之后，处理Response(这里没有做特别处理)
    private static Response processResponse(Response response) {
        return response;
    }
```

这里再奉上一个缓存拦截器：离线读取本地缓存，在线获取最新数据(读取单个请求的请求头，亦可统一设置)。
这里用到了一个[网络状态工具类](http://www.jianshu.com/p/cce92ca94495)
```
    //应用拦截器：设置缓存策略
    private static Interceptor cacheIntercepter = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();

            //无网的时候强制使用缓存
            if (NetUtil.getNetState() == NetUtil.NetState.NET_NO) {
                request = request.newBuilder()
                        .cacheControl(CacheControl.FORCE_CACHE)
                        .build();
            }

            Response response = chain.proceed(request);

            //有网的时候读接口上的@Headers里的配置，你可以在这里进行统一的设置
            if (NetUtil.getNetState() != NetUtil.NetState.NET_NO) {
                String cacheControl = request.cacheControl().toString();
                return response.newBuilder()
                        .header("Cache-Control", cacheControl)
                        .removeHeader("Pragma")
                        .build();
            } else {
                int maxStale = 60 * 60 * 24 * 28; // tolerate 4-weeks stale
                return response.newBuilder()
                        .header("Cache-Control", "public, only-if-cached, max-stale=" + maxStale)
                        .removeHeader("Pragma")
                        .build();
            }
        }

    };
```
OkHttp3中有一个Cache类是用来定义缓存的，此类详细介绍了几种缓存策略,具体可看此类源码。
>1. noCache ：不使用缓存，全部走网络 
2. noStore ： 不使用缓存，也不存储缓存 
3. onlyIfCached ： 只使用缓存 
4. maxAge ：设置最大失效时间，失效则不使用 
5. maxStale ：设置最大失效时间，失效则不使用 
6. minFresh ：设置最小有效时间，失效则不使用 
7. FORCE_NETWORK ： 强制走网络 
8. FORCE_CACHE ：强制走缓存

**关于max-age和max-stale**
max-stale在请求头设置有效，在响应头设置无效。
max-stale和max-age同时设置的时候，缓存失效的时间按最长的算。

我这里借用了别人的一个测试（太懒了，你有兴趣可以自己测试下）：
>**测试结果：**
在请求头中设置了：Cache-Control: public, max-age=60,max-stale=120,响应头的Cache-Control和请求头一样。
1. 在第一次请求数据到一分钟之内，响应头有：Cache-Control: public, max-age=60,max-stale=120
2. 在1分钟到3分钟在之间，响应头有：Cache-Control: public, max-age=60,max-stale=120
Warning: 110 HttpURLConnection "Response is stale"
可以发现多了一个Warning。
3. 三分钟的时候：重新请求了数据，如此循环，如果到了重新请求的节点此时没有网，则请求失败。
另外关于缓存有一个[rxcache](https://github.com/VictorAlbertos/RxCache)也可以试试。

**3.添加网络拦截器**
```
    //网络拦截器：主要用于重试或重写
    private static Interceptor netIntercepter = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            Response response = chain.proceed(request);
            int tryCount = 0;
            while (!response.isSuccessful() && tryCount < sMaxTryCount) {
                tryCount++;
                response = chain.proceed(request);
            }
            return response;
        }
    };
```
关于OkHttp的拦截机制，我觉得这是OkHttp最牛逼的地方之一！
先给大家看个概览图，之后会在OkHttp的特性中详细介绍下。
![OkHttp的拦截机制](http://upload-images.jianshu.io/upload_images/1458573-d7375161cda31f32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**4.简单的异步请求**
```
    private static void testAsync() {
        Request request = new Request.Builder()
                .url("http://baidu.com")
                .build();
        sClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                LogUtil.print(e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
                Headers responseHeaders = response.headers();
                for (int i = 0, size = responseHeaders.size(); i < size; i++) {
                    LogUtil.print(responseHeaders.name(i) + ": " + responseHeaders.value(i));
                }
                LogUtil.print(response.body().string());
            }
        });
    }
```

## 2.OkHttp的特性
Q1:为什么使用OkHttp?
1. 支持HTTP2/SPDY黑科技
2. socket自动选择最好路线，并支持自动重连
3. 拥有自动维护的socket连接池，减少握手次数
4. 拥有队列线程池，轻松写并发
5. 拥有Interceptors轻松处理请求与响应（比如透明GZIP压缩,LOGGING）
6. 基于Headers的缓存策略

Q2:应用拦截器和网络拦截器的区别？
addInterceptor:设置应用拦截器，主要用于设置公共参数，头信息，日志拦截等 
addNetworkInterceptor：设置网络拦截器，主要用于重试或重写

![OkHttp的应用拦截器和网络拦截器](http://upload-images.jianshu.io/upload_images/1458573-76f6b7798a26ec17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

例如：初始请求http://baidu.com 会重定向1次到https://baidu.com 。
则应用拦截器会执行1次，返回的是https的响应
网络拦截器会执行2次，第一次返回http的响应，第二次返回https的响应

应用拦截器：
1. 不需要担心中间过程的响应,如重定向和重试.
2. 总是只调用一次,即使HTTP响应是从缓存中获取.
3. 观察应用程序的初衷. 不关心OkHttp注入的头信息如: If-None-Match.
4. 允许短路而不调用 Chain.proceed(),即中止调用.
5. 允许重试,使 Chain.proceed()调用多次.

 网络拦截器
1. 能够操作中间过程的响应,如重定向和重试.
2. 当网络短路而返回缓存响应时不被调用.
3. 只观察在网络上传输的数据.
4. 携带请求来访问连接.

## 3.OkHttp的流程分析
二话不说，先上几张图:
![OkHttp的请求流程](http://upload-images.jianshu.io/upload_images/1458573-79aa905da482f0e9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![OkHttp的总体设计](http://upload-images.jianshu.io/upload_images/1458573-fed46f02396b5bfe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1.先看初始化时，通过建造者模式创建OkHttpClient
![](http://upload-images.jianshu.io/upload_images/1458573-485be39d9d1e12ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-d26ea2f89ea3070c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2.再看执行请求时，创建Request的方法
![](http://upload-images.jianshu.io/upload_images/1458573-a0ff67721ca7d6f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-25ffa4fd67e7c626.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3.再看异步请求Request的方法,先通过newCall()，将Request转成Call
![](http://upload-images.jianshu.io/upload_images/1458573-9a8068d19a0687ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-d35b260cb6dc71f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


4.然后加入请求队列
![](http://upload-images.jianshu.io/upload_images/1458573-da068b98127c9ec6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5.Call.enqueue()是抽象方法，实现在这：
![](http://upload-images.jianshu.io/upload_images/1458573-d5b8035764b6f3bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6.调用了Dispatcher.enqueue(),通过一个线程池来执行，超过最大请求数后则先加入准备请求的队列中
![](http://upload-images.jianshu.io/upload_images/1458573-6dd2d04f5066e887.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

7.这里的call是一个AsynCall,继承自NamedRunnable
![](http://upload-images.jianshu.io/upload_images/1458573-ae4a4b35a725e88e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

8.在NamedRunnable的run()方法中，调用了execute()抽象方法，于是我们去找它的实现类AsyncCall的execute()方法
![](http://upload-images.jianshu.io/upload_images/1458573-32ef56b1cafa5360.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

9.调用了getResponseWithInterceptorChain()方法
![](http://upload-images.jianshu.io/upload_images/1458573-1a760c0b2a674e7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

10.调用了ApplicationInterceptorChain.proceed(),如果有其他的应用拦截器的话，就会遍历拦截器集合，执行每一个拦截的intercept()方法

而通过前面的自定义应用拦截器，我们知道intercept()中其实也会调用proceed()，这样迭代多次后，最终还是会执行getResponse方法()
![](http://upload-images.jianshu.io/upload_images/1458573-b8a5889e641c8573.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

13.getResponse()这个方法有点长，一次截图截不完
![](http://upload-images.jianshu.io/upload_images/1458573-4fff716b1c8c6029.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-0f418534ceded605.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-3a19e043a3f783bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

14.调用httpEngine.sendRequest()方法,这个方法有点长，一次截图截不完
![](http://upload-images.jianshu.io/upload_images/1458573-15832cfdb8335ba4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-6062b8ceaeaf0346.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-86d8db5b5c20edaa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

15.先从 Cache 中判断当前请求是否可以从缓存中返回
![](http://upload-images.jianshu.io/upload_images/1458573-1da5259697238812.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

16.没有Cache则连接网络
![](http://upload-images.jianshu.io/upload_images/1458573-60ac67db15f3585e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1458573-57ad735a593f45ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

17.调用streamAllocation.newStream()
![](http://upload-images.jianshu.io/upload_images/1458573-5a2c215f9636ef4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

18.寻找可用的socket连接
![](http://upload-images.jianshu.io/upload_images/1458573-d949689b580aef56.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-3be68fe879836cb5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

19.连接到socket连接层
![](http://upload-images.jianshu.io/upload_images/1458573-b2ddfe2911b330cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

20.创建了FramedConnection的实例
![](http://upload-images.jianshu.io/upload_images/1458573-137d5edc6543c16b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](http://upload-images.jianshu.io/upload_images/1458573-c47ba2c7d63e39e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

21.调用了Reader的execute()
![](http://upload-images.jianshu.io/upload_images/1458573-8a5e7bc5a4ac09bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 苍天！越往下面越难找到头绪了，先暂且告一段落吧，以后再来好好深入。

## 参考目录
1. [带你学开源项目：OkHttp--自己动手实现okhttp](https://wingjay.com/2016/07/21/%E5%B8%A6%E4%BD%A0%E5%AD%A6%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%EF%BC%9AOkHttp-%E8%87%AA%E5%B7%B1%E5%8A%A8%E6%89%8B%E5%AE%9E%E7%8E%B0okhttp/)
2. [Okhttp-wiki 之 Interceptors 拦截器](http://www.jianshu.com/p/2710ed1e6b48)
3. [OkHttp3源码分析[综述]](http://www.jianshu.com/p/aad5aacd79bf)
4. [OKHttp源码解析](http://frodoking.github.io/2015/03/12/android-okhttp/)
5. [OkHttp使用教程](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0106/2275.html)
6. [OKHttp源码浅析与最佳实践](http://www.jianshu.com/p/64e256c1dbbf)
7. [OkHttp官方文档](http://www.codexiu.cn/android/blog/24562/#16%E8%AF%B7%E6%B1%82%E9%87%8D%E8%AF%95)
8. [OkHttp3之Cookies管理及持久化](https://segmentfault.com/a/1190000004345545)
9. [Retrofit2.0使用总结及注意事项](http://blog.csdn.net/wbwjx/article/details/51379506)
10. [使用Retrofit和Okhttp实现网络缓存。无网读缓存，有网根据过期时间重新请求](http://www.jianshu.com/p/9c3b4ea108a7)
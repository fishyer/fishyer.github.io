>本文主要应用了OkHttp的Interceptor来实现自定义重试次数，不熟悉Interceptor的朋友可以先看我的另外一篇博文：[Okhttp基本用法和流程分析](http://www.jianshu.com/p/db197279f053)

虽然OkHttp自带retryOnConnectionFailure(true)方法可以实现重试，但是不支持自定义重试次数，所以有时并不能满足我们的需求。

## 1.自定义重试拦截器
```
/**
 * 重试拦截器
 */
public class RetryIntercepter implements Interceptor {

    public int maxRetry;//最大重试次数
    private int retryNum = 0;//假如设置为3次重试的话，则最大可能请求4次（默认1次+3次重试）

    public RetryIntercepter(int maxRetry) {
        this.maxRetry = maxRetry;
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        System.out.println("retryNum=" + retryNum);
        Response response = chain.proceed(request);
        while (!response.isSuccessful() && retryNum < maxRetry) {
            retryNum++;
            System.out.println("retryNum=" + retryNum);
            response = chain.proceed(request);
        }
        return response;
    }
}
```

## 2.测试场景类
```
public class RetryTest {
    String mUrl = "https://www.baidu.com/";
    OkHttpClient mClient;

    @Before
    public void setUp() {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        mClient = new OkHttpClient.Builder()
                .addInterceptor(new RetryIntercepter(3))//重试
                .addInterceptor(logging)//网络日志
                .addInterceptor(new TestInterceptor())//模拟网络请求
                .build();
    }

    @Test
    public void testRequest() throws IOException {
        Request request = new Request.Builder()
                .url(mUrl)
                .build();
        Response response = mClient.newCall(request).execute();
        System.out.println("onResponse:" + response.body().string());
    }

    class TestInterceptor implements Interceptor {

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            String url = request.url().toString();
            System.out.println("url=" + url);
            Response response = null;
            if (url.equals(mUrl)) {
                String responseString = "{\"message\":\"我是模拟的数据\"}";//模拟的错误的返回值
                response = new Response.Builder()
                        .code(400)
                        .request(request)
                        .protocol(Protocol.HTTP_1_0)
                        .body(ResponseBody.create(MediaType.parse("application/json"), responseString.getBytes()))
                        .addHeader("content-type", "application/json")
                        .build();
            } else {
                response = chain.proceed(request);
            }
            return response;
        }
    }

}

```

## 3.输出结果
```
retryNum=0
--> GET https://www.baidu.com/ HTTP/1.1
--> END GET
url=https://www.baidu.com/
<-- 400 null https://www.baidu.com/ (13ms)
content-type: application/json

{"message":"我是模拟的数据"}
<-- END HTTP (35-byte body)
retryNum=1
--> GET https://www.baidu.com/ HTTP/1.1
--> END GET
url=https://www.baidu.com/
<-- 400 null https://www.baidu.com/ (0ms)
content-type: application/json

{"message":"我是模拟的数据"}
<-- END HTTP (35-byte body)
retryNum=2
--> GET https://www.baidu.com/ HTTP/1.1
--> END GET
url=https://www.baidu.com/
<-- 400 null https://www.baidu.com/ (0ms)
content-type: application/json

{"message":"我是模拟的数据"}
<-- END HTTP (35-byte body)
retryNum=3
--> GET https://www.baidu.com/ HTTP/1.1
--> END GET
url=https://www.baidu.com/
<-- 400 null https://www.baidu.com/ (0ms)
content-type: application/json

{"message":"我是模拟的数据"}
<-- END HTTP (35-byte body)
onResponse:{"message":"我是模拟的数据"}
```

## 4.结果分析
1. 这里我用一个TestInterceptor拦截器拦截掉真实的网络请求，实现response.code的自定义
2. 在RetryIntercepter中，通过response.isSuccessful()来对响应码进行判断，循环调用了多次chain.proceed(request)来实现重试拦截
3. 从输出中可以看到，一共请求了4次（默认1次+重试3次）。

## 5.其它实现方式
如果你是使用OkHttp+Retrofit+RxJava，你也可以使用retryWhen操作符：retryWhen(new RetryWithDelay())来实现重试机制

```
public class RetryWithDelay implements Func1<Observable<? extends Throwable>, Observable<?>> {

        private final int maxRetries;
        private final int retryDelayMillis;
        private int retryCount;

        public RetryWithDelay(int maxRetries, int retryDelayMillis) {
            this.maxRetries = maxRetries;
            this.retryDelayMillis = retryDelayMillis;
        }

        @Override
        public Observable<?> call(Observable<? extends Throwable> attempts) {
            return attempts
                    .flatMap(new Func1<Throwable, Observable<?>>() {
                        @Override
                        public Observable<?> call(Throwable throwable) {
                            if (++retryCount <= maxRetries) {
                                // When this Observable calls onNext, the original Observable will be retried (i.e. re-subscribed).
                                LogUtil.print("get error, it will try after " + retryDelayMillis + " millisecond, retry count " + retryCount);
                                return Observable.timer(retryDelayMillis,
                                        TimeUnit.MILLISECONDS);
                            }
                            // Max retries hit. Just pass the error along.
                            return Observable.error(throwable);
                        }
                    });
        }
}
```
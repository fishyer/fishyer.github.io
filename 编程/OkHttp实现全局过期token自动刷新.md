# OkHttp实现全局过期token自动刷新

## 遇到问题

当前开发的 App 遇到一个问题：
当请求某个接口时，由于 token 已经失效，所以接口会报错。
但是产品经理希望 app 能够马上刷新 token ，然后重复请求刚才那个接口，这个过程对用户来说是无感的。

也就是**静默自动登录，然后继续请求：**

请求 A 接口－》服务器返回 token 过期－》请求 token 刷新接口－》请求 A 接口

要实现上述需求的话，大家会如何实现呢？

## 解决方案
思路：
1. 通过拦截器，获取返回的数据
2. 判断token是否过期
3. 如果token过期则刷新token
4. 使用最新的token，重新请求网络数据

```
/**
 * 全局自动刷新Token的拦截器
 * <p>
 * 作者：余天然 on 16/9/5 下午3:31
 */
public class TokenInterceptor implements Interceptor {

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        Response response = chain.proceed(request);
        LogUtil.print("response.code=" + response.code());

        if (isTokenExpired(response)) {//根据和服务端的约定判断token过期
            LogUtil.print("静默自动刷新Token,然后重新请求数据");
            //同步请求方式，获取最新的Token
            String newSession = getNewToken();
            //使用新的Token，创建新的请求
            Request newRequest = chain.request()
                    .newBuilder()
                    .header("Cookie", "JSESSIONID=" + newSession)
                    .build();
            //重新请求
            return chain.proceed(newRequest);
        }
        return response;
    }

    /**
     * 根据Response，判断Token是否失效
     *
     * @param response
     * @return
     */
    private boolean isTokenExpired(Response response) {
        if (response.code() == 404) {
            return true;
        }
        return false;
    }

    /**
     * 同步请求方式，获取最新的Token
     *
     * @return
     */
    private String getNewToken() throws IOException {
        // 通过一个特定的接口获取新的token，此处要用到同步的retrofit请求
        Response_Login loginInfo = CacheManager.restoreLoginInfo(BaseApplication.getContext());
        String username = loginInfo.getUserName();
        String password = loginInfo.getPassword();

        LogUtil.print("loginInfo=" + loginInfo.toString());
        Call<Response_Login> call = WebHelper.getSyncInterface().synclogin(new Request_Login(username, password));
        loginInfo = call.execute().body();
        LogUtil.print("loginInfo=" + loginInfo.toString());

        loginInfo.setPassword(password);
        CacheManager.saveLoginInfo(loginInfo);
        return loginInfo.getSession();
    }
}
```

然后配置下OkHttp
```
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(300, TimeUnit.SECONDS)
                .writeTimeout(300, TimeUnit.SECONDS)
                .cache(new Cache(FileConstants.HTTP_CACHE_DIR, FileConstants.CACHE_SIZE))
                .addInterceptor(interceptor)
//                .addInterceptor(new MockInterceptor())
                .addInterceptor(new TokenInterceptor())
//                .addInterceptor(new RetryIntercepter(3))
                .addInterceptor(logging)
                .build();
```

## 参考目录
1. [Android上使用retrofit+okhttp时token失效的处理方案](http://www.jianshu.com/p/62ab11ddacc8)
2. [RxJava+Retrofit实现全局过期token自动刷新Demo篇](http://alighters.com/blog/2016/08/22/rxjava-plus-retrofitshi-xian-zhi-demo/)
3. [session、cookie、token的区别](http://my.oschina.net/jihan19921016/blog/506473)
4. [关于APP token验证的疑问?](https://www.zhihu.com/question/30267006)
---
link: https://www.notion.so/MVP-d451184fd26346b986b64b59189b67e8
notionID: d451184f-d263-46b9-86b6-4b59189b67e8
---

## 一、单元测试的好处？
1. **提升我们面向对象设计的能力！**
因为有时候，我们不得不注意对象和方法划分的颗粒度，以保证核心业务逻辑的可测试性！
2. **让我们的代码更稳健！**
因为我们可以用测试来覆盖尽可能多的场景。这是真机调试很难做到的。
3. **让开发时的调试更快！**
因为很多时候都不必在手机运行app即可测试了。
3. **让后期的重构更可靠！**
没有测试作为保障的重构都是耍流氓！
## 二、什么是MVP模式？
所谓MVP(Model-View-Presenter)模式。是将APP的结构分为三层：
### view - 界面逻辑层
1. 提供UI交互
2. 在presenter的控制下修改UI。
3. 将业务事件交由presenter处理。

**注意. View层不存储数据，不与Model层交互。**
### presenter - 业务逻辑层
1. 对UI的各种业务事件进行相应处理。也许是与Model层交互，也许自己进行一些计算，也许控制后台Task，Service
2. 对各种订阅事件进行响应，修改UI。
3. 临时存储页面相关数据。

**注意. Presenter内不出现View引用。**
这里我的用法是有View的引用的，不过是抽象引用，没有直接依赖Activity,不然就没法测试Presenter了。
### model - 数据模型层
1. 从网络，数据库，文件，传感器，第三方等数据源读写数据。
2. 对外部的数据类型进行解析转换为APP内部数据交由上层处理。
3. 对数据的临时存储,管理，协调上层数据请求。

如图示，里面的activity，presenter，model均为例子：
![](1458573-1848e12be5ca4f8d.png)
这样将复杂的功能分割为各层内的小问题。各层内功能单一。易于功能修改拓展与Debug。解耦的设计，独立的模块，更有利于分工开发与测试。
## 三、基本用法
我下面的用法中用到了RxJava+Retrofit,
不熟悉RxJava的，可以先看我的博文：[Retrofit基本用法和流程分析](http://www.jianshu.com/p/94ca8a284ebb),
不熟悉Retrofit的，可以先看我的博文：[自定义RxJava之旅](http://www.jianshu.com/p/68160c4bd9dc)
引用了以下测试库：
> testCompile 'junit:junit:4.12'
testCompile 'org.mockito:mockito-all:2.0.2-beta'

下面以我们常见的登录场景为例：
首先定义了一个契约类：
```
/**
 * 契约类
 */
public class LoginContract {
  public interface View {
      void showToast(String message);
  }

  public interface Presenter {
      Observable<LoginResponse> login(String username, String password);
  }
}
```
在后面还会使用这个验证工具类
```
/**
 * 验证工具类
 */
public class ValidateUtil {

  //检查，第一个是表达式，第二个是提示信息
  public static void check(boolean expression, String msg) throws ValidateException {
      if (expression) throw new ValidateException(msg);
  }

  //自定义异常
  public static class ValidateException extends Exception {
      public ValidateException(String message) {
          super(message);
      }
  }
}
```
### 1.界面逻辑层
用Activity或Fragment来作为View层

这个里面是没法用JUnit测试的，因为里面调用了Android的API，需要有模拟器支持，之后准备引用Robolectric来测试androidTest，这个框架自己实现了一套Android的API，可以在java环境调用Android的一些api。
```
/**
 * 界面逻辑
 */
public class LoginActivity extends MyBaseActivity implements LoginContract.View {

  @Bind(R.id.et_password)
  EditText mEtPassword;
  @Bind(R.id.et_username)
  EditText mEtUsername;
  private LoginPresenter mPresenter;
  private Subscription mSubscription;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_login);
      ButterKnife.bind(this);
      mPresenter = new LoginPresenter(this, new UserModel());
  }

  @Override
  public void onDestroy() {
      super.onDestroy();
      if (mSubscription != null) {
          mSubscription.unsubscribe();
      }
  }

  @OnClick(R.id.tv_login)
  public void onClick() {
      String username = mEtUsername.getText().toString();
      String password = mEtPassword.getText().toString();
      Observable<LoginResponse> observable = mPresenter.login(username, password);
      if (observable == null) return;
      mSubscription = observable
              .compose(new WebTransformer<>(this))
              .subscribe(new WebSubscriber<LoginResponse>() {
                  @Override
                  public void onSuccess(LoginResponse response) {
                      parseResponse(response);
                  }
              });
  }

  @Override
  public void showToast(String message) {
      ToastHelper.show(message);
  }

  public void parseResponse(LoginResponse response) {
      SkipManager.gotoOrder(getActivity());
  }
}
```
### 2.业务逻辑层
这个是纯粹的Java类，可以用JUnit测试。

这也是MVP架构的好处，可以很方便我们测试Presenter层的业务逻辑！

```
/**
 * 业务逻辑
 */
public class LoginPresenter implements LoginContract.Presenter {
  private LoginContract.View mView;
  private UserModel mUserModel;

  public LoginPresenter(LoginContract.View view, UserModel userModel) {
      mView = view;
      mUserModel = userModel;
  }

  @Override
  public Observable<LoginResponse> login(String username, String password) {
      try {
          ValidateUtil.check(username.isEmpty(), "用户名没有填写");
          ValidateUtil.check(password.isEmpty(), "密码没有填写");
          return mUserModel.performLogin(username, password);
      } catch (ValidateUtil.ValidateException e) {
          mView.showToast(e.getMessage());
      }
      return null;
  }

}
```
### 3.数据模型层
这个是数据模型层，主要是和网络、数据库、缓存等打交道。

也是没法用JUnit测试的。这个后期也准备用Robolectric来测试看看。

```
/**
 * 用户模型
 */
public class UserModel {
  public Observable<LoginResponse> performLogin(String username, String password) {
      return WebHelper.getWebInterface()
              .login(new LoginRequest(username, password))
              .map(new Func1<LoginResponse, LoginResponse>() {
                  @Override
                  public LoginResponse call(LoginResponse response) {
                      response.setPassword(password);
                      CacheManager.saveLoginInfo(response);
                      return response;
                  }
              });
  }
}
```
### 4.使用JUnit+Mockito来测试Presenter
这里面涉及到JUnit和Mockito的一些简单用法，不熟悉的朋友可以去看看我下面的参考目录
```
/**
 * 测试登录
 */
public class LoginPresenterTest {

  private LoginPresenter mPresenter;
  private LoginContract.View mView;
  private UserModel mModel;

  private String mUsername;
  private String mPassword;

  @Before
  public void setUp() {
      mModel = Mockito.mock(UserModel.class);
      mView = Mockito.mock(LoginContract.View.class);
      mPresenter = new LoginPresenter(mView, mModel);
  }

  //测试没有用户名的场景
  @Test
  public void testLoginNoUserName() {
      mUsername = "";
      mPassword = "12345";
      mPresenter.login(mUsername, mPassword);
      Mockito.verify(mView).showToast("用户名没有填写");
  }

  //测试没有密码的场景
  @Test
  public void testLoginNoPassword() {
      mUsername = "yutianran";
      mPassword = "";
      mPresenter.login(mUsername, mPassword);
      Mockito.verify(mView).showToast("密码没有填写");
  }

  //测试用户名和密码都有的场景
  @Test
  public void testLogin() {
      mUsername = "yutianran";
      mPassword = "12345";
      mPresenter.login(mUsername, mPassword);
      Mockito.verify(mModel).performLogin(mUsername, mPassword);
  }
}
```
run一下这个测试类，输出：
![](1458573-50e18864f47d2fc7.png)

导出为Html即为：
![](1458573-b66a5cf1d8c11ead.png)

当然，我们可以直接run整个test包，运行所有的测试类的，导出则为：
![](1458573-435ac7556d7e0a15.png)

我们还可以使用gradle来运行所有测试类的
> ./gradlew testDebugUnitTest

编译成功后，可在这个目录下查看生成的Html文件
![](1458573-5c8f3f1098887e95.png)

![](1458573-f5473587ad320bf1.png)
## 参考目录
1. [Android单元测试: 首先，从是什么开始](http://chriszou.com/2016/04/13/android-unit-testing-start-from-what.html)
2. [Google原味mvp实践](http://www.jianshu.com/p/dc9733bc3a54)
3. [Android应用中MVP最佳实践](http://www.jianshu.com/p/ed2aa9546c2c)
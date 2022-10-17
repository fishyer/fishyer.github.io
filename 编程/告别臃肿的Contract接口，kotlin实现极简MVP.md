---
link: https://www.notion.so/Contract-kotlin-MVP-a871390d3e414decb40289ae2abd00c8
notionID: a871390d-3e41-4dec-b402-89ae2abd00c8
---

#kotlin

以前，我们参考google的[官方示例](https://github.com/googlesamples/android-architecture)实现MVP，需要定义一个Contract契约类，View和Presenter之间都通过契约类来进行通讯。

例如，Contract接口通常是这样的：（之前的MVP的更多代码，可以查看我之前的文章：[MVP+单元测试探索](https://www.jianshu.com/p/3e3459d0fe25)，这里只列出Contract接口）

```Java
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


但是，在我们的工程实践中，会发现这个契约类的模式有一个最大的弊端：`太臃肿，而且修改太频繁！`

本来接口应该是一种规范，不会经常变动的，但是V和P之间进行通讯却是一个经常会变动的点，往往V修改了之后，都会造成相应的P的变动。尤其是在一个V有多个实现的时候，因为需要和P通讯，所以要把它的方法添加到V接口里面，导致其他V的实现也不得不实现这个方法，哪怕根本用不到！

好在现在有了kotlin，我们可以`利用kotlin的闭包来取代Contract契约类`，直接将View的函数作为参数传给Presenter层，这样的话，P层根本就没必要持有V层的引用了，同理，M层也可以不必再持有P层的引用，这样可以有更大的拓展性。

这样一改的话，我们就将V -> P -> M之间从双向依赖，变成单向依赖了。系统的依赖越少，系统的复杂度越低。所以，虽然说用闭包实现MVP和以前的编码习惯不一样，但是绝对是一本万利的事情！

以前的结构图：V、P、M之间是双向依赖


![](https://upload-images.jianshu.io/upload_images/1458573-19180fbec6efce3e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

现在的结构图：V -> P -> M是单向依赖


![](https://upload-images.jianshu.io/upload_images/1458573-33ee6aae335bf215.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## View层

View层主要就是处理视图逻辑，简单来说就是依赖Android平台的地方。

1. 通过`::showData`就可以获取这个方法的函数引用，然后就可以直接将这个函数引用传递给P了。

2. 直接传lambda表达式也行，但这种的可读性和复用性就不如上面的普通函数那么强了，一般只用于临时的回调，需要多个地方复用的都用普通函数的方式。

```Java
class LoginActivity : BaseActivity() {

    private val loginPresenter = LoginPresenter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        bt_login.setOnClickListener {
            login(et_username.text.toString(), et_password.text.toString())
        }
    }

    fun login(username: String, password: String) {
        //匿名函数
        var showError={ message: String? ->
            tv_user.setText(message?:"空数据")
        }
        //方法的参数，既可以普通函数，也可以是匿名函数，推荐使用普通函数，更具备可读性
        loginPresenter.login(username, password, ::showData, showError)
    }

    //普通函数
    fun showData(user: User) {
        tv_user.setText(user.toString())
    }

}
```


## Presenter层

Presenter层主要处理业务逻辑，简单来说就是所有不依赖于Android平台的。

以后我们最好能对Presenter层进行JUnit单元测试，因为Android的API是依赖于真机的，不便JUnit测试，所以，我们最好不要在Presenter层做强依赖Android的API的事情。`不能做单元测试的P，不是一个设计良好的P!`

```Java
class LoginPresenter {

    private val userModel = UserModel()

    fun login(username: String, password: String, showData: (User) -> Unit, showError: (String?) -> Unit) {
        try {
            //这里可以先执行下参数校验的工作
            ValidateUtil.check(username.isEmpty(), "用户名没有填写")
            ValidateUtil.check(password.isEmpty(), "密码没有填写")
            val user = userModel.login(username, password)
            //这里再也不用持有View层，再调用showData了，直接就可以将showData做为参数传过来，从此告别臃肿的Contract接口
            showData(user)
        } catch (e: Exception) {
            showError(e.message)
        }
    }

}
```


## Model层

Model主要是数据模型层，主要是和网络、数据库、缓存等打交道，一般来说，不要以页面来定义，推荐以功能模块定义，以实现一个Modle层可以提供给多个P使用。（当然了，一个P也是可以有多个Model的，比如说ProductDetailPresenter可以同时持有UserModel、ProductModel等多个Model）

```Java
class UserModel {

    /**
     * 真正获取数据的地方，在这里请求网络
     * @param username
     * @param password
     * @return
     */
    fun login(username: String, password: String): User {
        if(!password.equals("111111")){
            throw RuntimeException("密码错误")
        }
        return User(username, username.hashCode().toString())
    }
}
```


## 测试Presenter

在单元测试里面，我们先只测试Presenter层，主要是大多数业务逻辑都在这里，而且测试它也比较方便快捷。Presenter没问题的话，系统的稳定性一般差不到哪里去。

> 因为在kotlin里面使用Mockito有点问题，我这里就只是列了下测试用例，并调用了一下各种case下的login，但是并没有做断言，这个需要后续研究下：怎么在kotlin中，断言一个方法是否执行了，以及执行时的参数是什么。


以`testLoginWithoutUserName`为例，我们执行后查看控制台，发现输出确实是：密码没有填写，说明用例执行符合预期。

![](https://upload-images.jianshu.io/upload_images/1458573-c1d91107cc3f8c15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 总结

利用闭包来代替Contract接口，可能有的人会觉得没有了View接口的约束，看起来会比较乱，但是考虑到它能化双向依赖为单向依赖，真正实现分层开发，我觉得还是非常值得尝试的。

我们当然希望在开发之前， 就能定义一个清晰的Contract接口，但是，实践告诉我们，这往往很难，Contract接口一改再改是经常有的事。

> 接口往往不是自顶向下设计出来的，而是在开发过程中一步一步搭建出来的。


按照这种闭包模式后，开发P层的人，不需要考虑现在Contract有什么接口方法，只需要考虑我需要一个什么样的函数指针，这个指针是将什么类型转换成什么类型，这就够了。至于你这个函数指针，将来由谁来注入，P层并不关心。这样便于我们站在数据转换的角度，思考问题的本质，而不必纠结于该调用View层的什么方法。以后，完全可以View层是一个人开发，Presenter层是另一个人开发。让善长写UI的人去写UI，善长业务的人去处理业务。

只要在实现的过程中，先知道你需要什么函数，才有函数的提供者，以免过度设计。


```Java
class LoginPresenterTest {
   private val presenter: LoginPresenter= LoginPresenter()

   //测试没有用户名的场景
   @Test
   fun testLoginWithoutUserName() {
       var username = ""
       var password = "111111"
       presenter.login(username, password, ::showData, ::showError)
   }

   //测试没有密码的场景
   @Test
   fun testLoginWithoutPassword() {
       var username = "yutianran"
       var password = ""
       presenter.login(username, password, ::showData, ::showError)
   }

   //测试登录正确的场景
   @Test
   fun testLogin() {
       var username = "yutianran"
       var password = "111111"
       presenter.login(username, password, ::showData, ::showError)
   }

   //测试密码错误的场景

   @Test
   fun testPawwwordIsNotRight() {
       var username = "yutianran"
       var password = "123456"
       presenter.login(username, password, ::showData, ::showError)
   }

   //mock实现
   fun showData(user: User) {
       print(user)
   }

   //mock实现
   fun showError(message: String?) {
       print(message ?: "空数据")
   }


```



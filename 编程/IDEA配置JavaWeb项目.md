tags: 教程
date: 2016-10-29 11:51

## 1.创建JavaWeb项目
File --> New --> Project...
![](2016-10-29-11-51-37.jpg)

设置工程名字：
![](2016-10-29-11-51-51.jpg)

创建完成后工程结构如下：
![](2016-10-29-11-52-03.jpg)


## 2.设置Web项目
2.1 在WEB-INF 目录下点击右键，New --> Directory，创建 classes 和 lib 两个目录
classes目录用于存放编译后的class文件，lib用于存放依赖的jar包
![](2016-10-29-11-52-19.jpg)


2.2 File --> Project Structure...，进入 Project Structure窗口，点击 Modules --> 选中项目“JavaWeb” --> 切换到 Paths 选项卡 --> 勾选 “Use module compile output path”，将 “Output path” 和 “Test output path” 都改为之前创建的classes目录
即将后面编译的class文件默认生成到classes目录下
![](2016-10-29-11-52-27.jpg)


2.3 点击 Modules --> 选中项目“JavaWeb” --> 切换到 Dependencies 选项卡 --> 点击右边的“+”，选择 “JARs or directories...”，选择创建的lib目录
![](2016-10-29-11-52-38.jpg)

选择Jar Directory
![](2016-10-29-11-52-48.jpg)


2.4 配置打包方式Artifacts：点击 Artifacts选项卡，IDEA会为该项目自动创建一个名为“JavaWeb:war exploded”的打包方式，表示 打包成war包，并且是文件展开性的，输出路径为当前项目下的 out 文件夹，保持默认即可。另外勾选下“Build on make”，表示编译的时候就打包部署，勾选“Show content of elements”，表示显示详细的内容列表。
![](2016-10-29-11-53-01.jpg)



## 3.配置Tomcat
3.1 Run -> Edit Configurations，进入“Run Configurations”窗口，点击"+"-> Tomcat Server -> Local，创建一个新的Tomcat容器
![](2016-10-29-11-53-13.jpg)


3.2 在"Name"处输入新的服务名，点击“Application server”后面的“Configure...”，弹出Tomcat Server窗口，选择本地安装的Tomcat目录 -> OK
![](2016-10-29-11-53-23.jpg)


3.3 在“Run Configurations”窗口的“Server”选项板中，去掉勾选“After launch”，设置“HTTP port”和“JMX port”，点击 Apply -> OK，至此Tomcat配置完成。
![](2016-10-29-11-53-30.jpg)



## 4.JavaWeb测试
4.1 Run -> Edit Configurations，进入“Run Configurations”窗口，选择之前配置好的Tomcat，点击“Deployment”选项卡，点击“+” -> “Artifact”-> 选择创建的web项目的Artifact...修改“Application context”-> Apply -> OK
![](2016-10-29-11-53-40.jpg)

说明：此处的Application context是指定本工程的根目录

4.2 在index.jsp文件中的body之间添加要显示的内容，然后点击“运行”的绿色三角
打开浏览器，输入：localhost:8080/JavaWeb
![](2016-10-29-11-53-50.jpg)


至此，intellij idea创建并设置javaweb工程全部完成，下面是在其中编写并运行Servlet。

## 5.Servlet简单实现
5.1. 编写servlet源文件
在src目录下新建HelloServlet.java，并编写一下代码并进行编译：
![](2016-10-29-11-54-02.jpg)

编译后会发现在classes目录下生成了HelloServlet.class文件

![](2016-10-29-11-54-16.jpg)


5.2. 部署servlet
方法一：
在WEB-INF目录下web.xml文件的标签中添加如下内容：

![](2016-10-29-11-54-27.jpg)


方法二：
在HelloServlet文件的类前面加上：@WebServlet("/hello")

![](2016-10-29-11-54-34.jpg)


5.3. 运行servlet
点击运行按钮

![](2016-10-29-11-54-41.jpg)


控制台出现successfully则tomcat服务启动成功！打开浏览器输入：localhost:8080/JavaWeb/HelloWorld即可查看servlet运行状态了.

![](2016-10-29-11-54-51.jpg)



## 6.接受Get和Post请求的Servlet
创建一个Client类，定义两个基本方法。

![](2016-10-29-11-54-58.jpg)


下面，我们来实现这两个方法，先看看GET，比较简单：

![](2016-10-29-11-55-11.jpg)

![](2016-10-29-11-55-19.jpg)

注释都很详细了，只是要说一点，GET方式提交的参数是绑定在URL中的，所以这部分要单独处理，进行转码，参数是Map类型，那么我们遍历这个Map获取参数，并拼装成?,&的格式就行了。下面来看POST，这个复杂一点：

![](2016-10-29-11-56-28.jpg)


这中间就是设置POST方式时要开启两个选项，不能忘了。而且POST方式提交参数，参数是在请求体中发送的，就是和GET的一个很重要的区别。模拟好了两个方法，下面我们来写Servlet，这就很简单了，我们使用RequestServlet：

![](2016-10-29-11-56-40.jpg)


好了，我们来测试GET请求，写主函数：

![](2016-10-29-11-57-01.jpg)

在控制台，我们就得到了如下的输出： 

![](2016-10-29-11-57-08.jpg)

因为我们打印了还原出的参数形式，这里没有用中文，所以看不出编码效果，中文效果大家可以自行测试。 POST方式就是修改主函数中调用的方法，这里不再测试了。 至此我们已经可以脱离浏览器进行GET/POST请求了，基本上网络传输的方式我们都可以来看看服务器返回的原始数据了，设置好URL和所需参数，直接运行就行了。 Servlet的原理很简单，这是比较直观的实现，要比直接上来就B\S清楚很多。

## 常见问题
1.Tomcat权限问题？
---
问题描述：
>下午9:11:27 All files are up-to-date
下午9:11:27 All files are up-to-date
下午9:11:27 Error running Tomcat 8.0.18: Cannot run program "/Users/horse_leo/Documents/apache-tomcat-8.0.18/bin/catalina.sh" (in directory "/Users/horse_leo/Documents/apache-tomcat-8.0.18/bin"): error=13, Permission denied

提示的主要问题是权限不足
解决方案:
>打开终端，进入tomcat\bin目录，然后执行chmod 777 *.sh

2.HttpServlet找不到？
---
解决方案:
>到/tomcat/lib下导入servlet-api.jar

3.Tomcat中文乱码？
---
问题描述：
>用GET方式测试时，参数是英文没有问题，可是出现中文时，也转码了，但没有配置的Tomcat依然读取的是乱码

解决方案
配置Tomcat的server.xml：

![](2016-10-29-11-57-37.jpg)

加一个URIEncodeing选项就可以了，这样走GET请求编码就正常了，这也是Ajax走GET提交时不设置依然是中文乱码的一个原因，这一般情况想不到。

## 参考目录
1. [Intellij idea创建javaWeb以及Servlet简单实现](http://blog.csdn.net/yhao2014/article/details/45740111) 
1. [Java后台模拟生成GET/POST请求servlet](http://langgufu.iteye.com/blog/2159634)
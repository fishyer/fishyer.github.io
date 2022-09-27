---
link: https://www.notion.so/git-e6477f03936b498ca3f9ecafafeb271f
notionID: e6477f03-936b-498c-a3f9-ecafafeb271f
---

#Git

## 产品和设计为什么要使用git？

备注：这里产品设计其实泛指非研发人员

1. 进行版本管理
    * 带来的好处就是版本可追溯、可回溯。
2. git的机制带来了许多便利，其中着重讲亮点：
    * git是分布式的，也就意味着每个人的本地克隆都是一份完整的数据，即使线上数据被毁，通过任何一人的本地克隆数据都可以立即完整恢复项目数据
    * git是以快照的方式锁定版本，版本和版本之间通过索引链接，所以能够做非常快速和高效（相对传统版本控制工具如svn最大的不同）
3. 适当拓展边界，将非常有助于团队各方增进了解和协作
    * 非研发人员，看到git，看到命令行的第一反应就是被吓到，千万不要有这种退缩心理，学着接受新事物，给自己一个学习机会  

## 如何操作？

**前置条件：** 如果使用Windows平台，请先安装模拟类Linux环境的命令行工具[Git For Windows](https://git-for-windows.github.io/)  

**说明：** 
* 以下操作，除特别声明，均在命令行内完成  
* 在以下步骤中`~`代表的是用户跟目录的地址，在windows平台下该目录地址为C:\Users\Administrator\
* 在以下步骤中`$`代表的是命令行，实际需输入的命令为`$`之后的内容  

1. 配置ssh config文件（出于安全考虑，禁掉了默认的ssh端口22）
打开~/.ssh/config文件（如果没有，请自行创建该文件），复制以下内容，并保存
```
  host git.isoubu.net
  hostname git.isoubu.net
  port 13252
```

2. 生成ssh key值
```
命令行输入以下命令（`$只是用来说明这是命令行操作，实际输入为ssh-keygen -t rsa`），一路回车即可
$ ssh-keygen -t rsa
```

3. 登录GitLab，配置[ssh key](http://git.isoubu.net/profile/keys)
    * 复制第2步生成的公钥~/.ssh/id_rsa.pub内容到web界面的Key字段所在输入框内，点击添加（Add Key）

4. 找到待克隆到本地的项目，复制ssh链接，如下图
![Screen_Shot_2017-02-22_at_2.57.06_PM](/uploads/f18511a19f4ee80166eaad0179e548cb/Screen_Shot_2017-02-22_at_2.57.06_PM.png)

5. 通过命令克隆项目文件到本地
```
$ git clone git@git.isoubu.net:product/design.git
```
6. 无密登录环境搭建完毕，接下来可以使用git做项目同步推送和拉取了  

**附：**
git常用命令
具体命令可通过`git help [具体命令]`查看
```
git pull 拉取远程项目
git status 查看当前工作目录状态
git add 添加文件（生成快照）
git commit 提交更新
git push 推送更新到远程服务器
```

## 参考目录

- [Git文档](https://git-scm.com/book/en/v2)
- [Git交互学习](https://try.github.io/)
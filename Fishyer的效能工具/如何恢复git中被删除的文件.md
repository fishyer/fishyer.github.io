---
link: https://www.notion.so/git-8244186f488342ee9cb0ea62149ce390
notionID: 8244186f-4883-42ee-9cb0-ea62149ce390
---

#! https://zhuanlan.zhihu.com/p/433125477

#Git

## 背景

就是在git仓库里面，一不小心删掉了某个文件:“标注笔记法”，想要恢复它

## 具体步骤

1. 查看被删除文件,获取文件路径
```shell
git log --summary | grep "标注笔记法"
```
输出结果：
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202111141440768.png)

2. 根据文件路径，确定影响该文件的所有commit记录
```shell
git log --oneline --follow -- "00-Inbox/标注笔记法.md"
```
输出结果：
![](https://yupic.oss-cn-shanghai.aliyuncs.com/202111141441470.png)

3. 选择最后一条commit记录ID，检出文件，记得ID后加^
```shell
git checkout 138fa18^ -- "00-Inbox/标注笔记法.md"
```

好了，文件已经恢复到原来的文件路径下了

## 常见问题
  
  ## 1.防止git log输出结果时的数量限制
1. 如果一次修改记录过多，有可能git log 命令会提示错误，可以配置一下
```shell
git config merge.renameLimit 99999
git config diff.renameLimit 99999 
```

## 2. git log中文字符不要显示为unicode
```shell
git config --global core.quotepath false
```

## 参考资料
1. [Git：如何在项目提交历史中查找已删除的文件？ BookSet](https://www.bookset.io/questions/7203515)
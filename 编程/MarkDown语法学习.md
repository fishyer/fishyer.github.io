tags: 教程

#1.标题
##1.1.第一点

#2.引用
>这是被引用的文字

#3.分割线
- - - - --

#4.列表
1. 第一步
2. 第二步
3. 第三步

#5.代码
```
    private void initData() {
        data = new ArrayList<>();
        data.add(new QuestionGroup("注册", getContentList(0)));
        data.add(new QuestionGroup("账户", getContentList(1)));
        data.add(new QuestionGroup("抢单", getContentList(2)));
        data.add(new QuestionGroup("交易", getContentList(3)));
        data.add(new QuestionGroup("其他", getContentList(4)));
        adapter.setData(data);
    }
```
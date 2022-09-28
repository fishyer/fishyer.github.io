# 3种消息传递机制的比较：Handler、BroadcastReceiver、EventBus

> 摘要：本文主要写了Handler、BroadcastReceiver、EventBus这三种消息传递机制的使用方法，这里强烈推荐使用最后一种，理由如下：
1.完全解耦，发送者和接受者几乎没关联，删除其中一个对另外一个没影响（这一点Handler就不行）。
2.传参数方便，同时支持一个发送者发送多条消息、一个接受者接受多条消息。

## 1.Handler

(1).发送：
```
public Handler parentHandler;//此Handle的赋值在目的地
// 发送Handle通知
Message msg = new Message();
msg.what = PRAISE;
msg.obj = comment_id;
parentHandler.sendMessage(msg);
```

(2).接受：
```
// 接受Handle通知
Handler messageHandler = new Handler() {
    public void handleMessage(Message msg) {
        if (msg.what == B1_commentAdapter.PRAISE) {
            comment_id = (String) msg.obj;
            //具体的实现方法
            praiseComment(comment_id);
        }
    }
};

adapter.parentHandler = messageHandler;//在目的地为Handle赋值
```

## 2.BroadcastReceiver
(1).发送：
```
//发送Receiver通知
private void sendMessage() {
    Intent intent = new Intent();
    intent.setAction("action.refreshMsgNumber");
    mContext.sendBroadcast(intent);
}
```
(2).接收：
```
//注册
private void initReceiver() {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction("action.refreshMsgNumber");
    getActivity().registerReceiver(mRefreshBroadcastReceiver, intentFilter);
}
//解注册
@Override
public void onDestroy() {
    super.onDestroy();
    getActivity().unregisterReceiver(mRefreshBroadcastReceiver);
}
// 接受Receiver通知
private BroadcastReceiver mRefreshBroadcastReceiver = new BroadcastReceiver() {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action.equals("action.refreshMsgNumber"))
        {
            //具体实现方法
            refreshMsgNumber();
        }
    }
};
```

## 3.EventBus
【资源】
1.需要依赖eventbus:
```
compile 'org.greenrobot:eventbus:3.0.0'
```
【方法】
(1).在Activity和Fragment的基类中定义:
ThreadMode表示在哪个线程接受事件，有四种策略:POSTING(发送线程)、MAIN(主线程)、BACKGROUND(后台线程)、ASYNC(异步线程)，一般在主线程中接受。
```
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EventBus.getDefault().register(this);
    }

    @Override
    public void onDestroy() {
        EventBus.getDefault().unregister(this);
        super.onDestroy();
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEvent(Object object) {
    }
```
(1).发送：
```
// 发送Eventbus事件
EventBus.getDefault().post(new MsgChangedEvent(count));
```
(2).接受：
```
    public void onEvent(Object object) {
        if (object instanceof MsgChangedEvent) {
            MsgChangedEvent event = (MsgChangedEvent) object;
            int msgCount = event.getMsgCount();
            doSomeThing();
        }
    }
```

## 参考资料
1. [Android中开源库EventBus使用详解](http://www.2cto.com/kf/201312/262981.html)
2. [Android解耦库EventBus的使用和源码分析](http://blog.csdn.net/yuanzeyao/article/details/38174537)
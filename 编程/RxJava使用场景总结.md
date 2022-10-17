#1.包装缓慢的旧代码
---
```
    /**
     * defer
     * <p>
     * 包装缓慢的旧代码
     */
    @Test
    public void test9() {
        //这样的话，还是会阻塞主线程
        Observable.just(blockMethod("A"))
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(var -> LogUtil.print(var.toString()));
        //使用defer的话，就不会阻塞主线程
        Observable.defer(() -> Observable.just(blockMethod("B")))
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(var -> LogUtil.print(var.toString()));
    }

    public String blockMethod(String msg) {
        String result = "block:" + msg;
        LogUtil.print(result);
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return result;
    }
```

#2.线程切换
---
```
    /**
     * subscribeOn
     * <p>
     * 线程切换
     */
    @Test
    public void test1() {
        Observable.just(1, 2, 3, 4)
                .subscribeOn(Schedulers.io()) // 指定 just() 发生在 IO 线程
                .observeOn(AndroidSchedulers.mainThread()) // 指定 subscribe() 的回调发生在主线程
                .subscribe(var -> LogUtil.print("number:" + var));
    }
```

#3.同步的数据变换
---
```
    /**
     * map
     * <p>
     * 同步的数据变换
     */
    @Test
    public void test2() {
        Observable.just("Hello, world!")
                .map(s -> s + " -Dan")
                .subscribe(s -> LogUtil.print(s));
    }
```

#4.异步的数据变换
---
```
    /**
     * flatMap
     * <p>
     * 异步的数据变换
     */
    @Test
    public void test3() {
        Observable.just("Hello, world!")
                .flatMap(s -> Observable.just(s + " -Dan"))
                .subscribe(s -> LogUtil.print(s));
    }
```


#5.取数据的优先级
---
```
    /**
     * concat
     * <p>
     * 取数据时，先查找内存，再查找文件缓存，最后才查找网络
     */
    @Test
    public void test4() {
        String memory = "内存";
        String file = "文件";
        String net = "网络";
        Observable<String> memoryTask = Observable.create(subscriber -> {
            if (!TextUtils.isEmpty(memory)) {
                subscriber.onNext(memory);
            } else {
                subscriber.onCompleted();
            }
        });
        Observable<String> fileTask = Observable.create(subscriber -> {
            if (!TextUtils.isEmpty(file)) {
                subscriber.onNext(file);
            } else {
                subscriber.onCompleted();
            }
        });
        Observable<String> netTask = Observable.just(net);
        //特别提醒：这里的memoryTask、fileTask千万别用just创建，否则的话会直接返回memoryTask的值(哪怕memory为空)
        Observable.concat(memoryTask, fileTask, netTask)
                .first()
                .subscribe(str -> LogUtil.print(str));
    }
```


#6.等待多个请求完成
---
```
    /**
     * zip
     * <p>
     * 等待多个请求完成
     */
    @Test
    public void test5() {
        LogUtil.print("开始请求");
        Observable<String> getA = Observable.create(subscriber -> {
            try {
                Thread.sleep(1000);
                LogUtil.print("A");
                subscriber.onNext("A");
                subscriber.onCompleted();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
        Observable<String> getB = Observable.create(subscriber -> {
            try {
                Thread.sleep(2000);
                LogUtil.print("B");
                subscriber.onNext("B");
                subscriber.onCompleted();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
        Observable.zip(getA, getB, (a, b) -> zipAB(a, b))
                .subscribe(var -> LogUtil.print(var));
    }

    private String zipAB(String a, String b) {
        return a + "和" + b;
    }
```


#7.合并多个输入框的最新数据
---
```
    /**
     * combineLatest
     * <p>
     * 合并多个输入框的最新数据
     */
    @Test
    public void test52() {
        LogUtil.print("开始请求");
        Observable<String> userNameEt = Observable.just("YTR");
        Observable<String> passwordEt = Observable.just("123456", "");
        Observable.combineLatest(userNameEt, passwordEt, (username, password) -> validate(username, password))
                .subscribe(var -> LogUtil.print(var + ""));
    }

    private Boolean validate(String username, String password) {
        LogUtil.print("username=" + username + "\tpassword=" + password);
        if (TextUtils.isEmpty(username)) {
            return false;
        }
        if (TextUtils.isEmpty(password)) {
            return false;
        }
        return true;
    }
```

#8.获取输入框的最新数据
---
```
    /**
     * debounce
     * <p>
     * 获取输入框的最新数据
     */
    @Test
    public void test82() {
        LogUtil.print("开始");
        Observable<Integer> mockEt = Observable.create(subscriber -> {
            try {
                subscriber.onNext(1);
                Thread.sleep(500);
                subscriber.onNext(2);
                Thread.sleep(1500);
                subscriber.onNext(3);
                subscriber.onCompleted();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
        mockEt.debounce(1, TimeUnit.SECONDS)//取1秒之内的最后一次
                .subscribe(var -> LogUtil.print(var.toString()));//输出2、3
    }
```


#9.防止连续点击
---
```
    /**
     * throttleFirst
     * <p>
     * 防止连续点击
     */
    @Test
    public void test8() {
        LogUtil.print("开始");
        Observable<Integer> mockBtn = Observable.create(subscriber -> {
            try {
                subscriber.onNext(1);
                Thread.sleep(500);
                subscriber.onNext(2);
                Thread.sleep(1500);
                subscriber.onNext(3);
                subscriber.onCompleted();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
        mockBtn.throttleFirst(1, TimeUnit.SECONDS)//取1秒之内的第一次
                .subscribe(var -> LogUtil.print(var.toString()));//输出1、3
    }
```



#10.定时操作
---
```
    /**
     * interval
     * <p>
     * 定时操作
     */
    @Test
    public void test7() {
        LogUtil.print("开始");
        //延迟2秒后，每隔3秒发送一次
        Observable.interval(2, 3, TimeUnit.SECONDS)
                .subscribe(var -> LogUtil.print(var.toString()));
    }
```

#11.复杂的数据变换
---
```
    /**
     * filter、distinct、take、reduce
     * <p>
     * 复杂的数据变换
     */
    @Test
    public void test6() {
        Observable.just("1", "2", "2", "3", "4", "5")
                .map(Integer::parseInt)//转换为int
                .filter(s -> s > 1)//取大于1
                .distinct()//去重
                .take(2)//取前两位
                .reduce((integer, integer2) -> integer.intValue() + integer2.intValue())//迭代计算
                .subscribe(var -> LogUtil.print(var.toString()));//输出：5
    }
```
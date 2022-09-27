---
link: https://www.notion.so/Java-07f648d269244dfb8215cd1a027fcae1
notionID: 07f648d2-6924-4dfb-8215-cd1a027fcae1
---
#Java 

## 1.new Thread的弊端
执行一个异步任务你还只是如下new Thread吗？
```
new Thread(new Runnable() {

    @Override
    public void run() {
         // TODO Auto-generated method stub
    }
}).start();
```
那你就out太多了，new Thread的弊端如下：
1. 每次new Thread新建对象性能差。
2. 线程缺乏统一管理，可能无限制新建线程，相互之间竞争，及可能占用过多系统资源导致死机或oom。
3. 缺乏更多功能，如定时执行、定期执行、线程中断。

相比new Thread，Java提供的四种线程池的好处在于：
1. 重用存在的线程，减少对象创建、消亡的开销，性能佳。
2. 可有效控制最大并发线程数，提高系统资源的使用率，同时避免过多资源竞争，避免堵塞。
3. 提供定时执行、定期执行、单线程、并发数控制等功能。

## 2.Java 自带线程池
Java通过Executors提供四种线程池，分别为：
1. newCachedThreadPool创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程。
2. newFixedThreadPool 创建一个定长线程池，可控制线程最大并发数，超出的线程会在队列中等待。
3. newScheduledThreadPool 创建一个定长线程池，支持定时及周期性任务执行。
4. newSingleThreadExecutor 创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序(FIFO, LIFO, 优先级)执行。

主要方法：
>1.void execute(Runnable command):
在未来某个时间执行给定命令。该命令可能在新的线程、已入池的线程或者正调用的线程中执行，这由Executor决定。

>2.void shutdown():
启动一次顺序关闭，执行以前提交的任务，但不接受新任务。如果已经关闭，则调用没有其它作用。

### 2.1.newCachedThreadPool
创建一个可缓存的线程池。必要的时候创建新线程来处理请求，也会重用线程池中已经处于可用状态的线程。如果线程池的大小超过了处理任务所需要的线程，那么就会回收部分空闲（60秒不执行任务）的线程；当任务数增加时，此线程池又可以智能的添加新线程来处理任务。此线程池不会对线程池大小做限制，线程池大小完全依赖于操作系统（或者说JVM）能够创建的最大线程大小。
>此类型线程池特别适合于耗时短，不需要考虑同步的场合。

测试代码：
```
    /**
     * 可缓存线程池
     */
    private static void testCachedThreadPool() {
        System.out.println("这是可缓存线程池：");
        ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
        for (int i = 0; i < 10; i++) {
            final int index = i;
            try {
                Thread.sleep(index * 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            cachedThreadPool.execute(new Runnable() {

                @Override
                public void run() {
                    print(index + "");
                }
            });
        }
    }
```

输出结果：
```
这是可缓存线程池：
1464230153368:	pool-1-thread-1:	0
1464230154372:	pool-1-thread-1:	1
1464230156376:	pool-1-thread-1:	2
1464230159380:	pool-1-thread-1:	3
1464230163384:	pool-1-thread-1:	4
1464230168386:	pool-1-thread-1:	5
1464230174391:	pool-1-thread-1:	6
1464230181395:	pool-1-thread-1:	7
1464230189397:	pool-1-thread-1:	8
1464230198400:	pool-1-thread-1:	9
```

### 2.2.newFixedThreadPool
创建固定大小的线程池，以无界队列方式运行。线程池满且线程都为活动状态的时候如果有新任务提交进来，它们会等待直到有线程可用。线程池的大小一旦达到最大值就会保持不变，如果某个线程因为执行异常而结束，那么线程池会补充一个新线程。显式调用shutdown将关闭线程池。
>此类型线程池比较符合常用场合。

测试代码：

```
    /**
     * 定长线程池
     */
    private static void testFixedThreadPool() {
        System.out.println("这是定长线程池：");
        ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
        for (int i = 0; i < 10; i++) {
            final int index = i;
            fixedThreadPool.execute(new Runnable() {

                @Override
                public void run() {
                    try {
                        print(index + "");
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
            });
        }
    }
```

输出结果：
```
这是定长线程池：
1464229952132:	pool-1-thread-1:	0
1464229952133:	pool-1-thread-2:	1
1464229952133:	pool-1-thread-3:	2
1464229953136:	pool-1-thread-3:	3
1464229953136:	pool-1-thread-1:	4
1464229953136:	pool-1-thread-2:	5
1464229954138:	pool-1-thread-1:	6
1464229954138:	pool-1-thread-2:	8
1464229954138:	pool-1-thread-3:	7
1464229955139:	pool-1-thread-1:	9
```

### 2.3.newScheduledThreadPool
创建可定时运行（初始延时），运行频率（每隔多长时间运行，还是运行成功一次之后再隔多长时间再运行）的线程池。
>此类型线程池适合定时以及周期性执行任务的场合

特别注意：
1.初始延迟2秒后，每间隔3秒运行一次线程:
```
schedulePool.scheduleAtFixedRate(new MyThread(), 2, 3, TimeUnit.SECONDS);
```
2.初始延迟2秒后，每运行成功后再等3秒运行一次线程:
```
schedulePool.scheduleWithFixedDelay(new MyThread(), 2, 3, TimeUnit.SECONDS);
```

测试代码：

```
    /**
     * 周期线程池
     */
    private static void testScheduledThreadPool() {
        System.out.println("这是周期线程池：");
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        scheduledThreadPool.scheduleAtFixedRate(new Runnable() {

            @Override
            public void run() {
                print("delay 3 seconds");
            }
        }, 2, 3, TimeUnit.SECONDS);
    }
```

输出结果：
```
这是周期线程池：
1464231196776:	pool-1-thread-1:	delay 3 seconds
1464231199776:	pool-1-thread-1:	delay 3 seconds
1464231202775:	pool-1-thread-2:	delay 3 seconds
1464231205777:	pool-1-thread-1:	delay 3 seconds
1464231208775:	pool-1-thread-3:	delay 3 seconds
1464231211775:	pool-1-thread-3:	delay 3 seconds
1464231214776:	pool-1-thread-3:	delay 3 seconds
1464231217777:	pool-1-thread-3:	delay 3 seconds
1464231220776:	pool-1-thread-3:	delay 3 seconds
```

### 2.4.newSingleThreadExecutor
创建一个单线程的线程池，以无界队列方式运行。这个线程池只有一个线程在工作（如果这个唯一的线程因为异常结束，那么会有一个新的线程来替代它。）此线程池能够保证所有任务的执行顺序按照任务的提交顺序执行，同一时段只有一个任务在运行。
>此类型线程池特别适合于需要保证执行顺序的场合。
测试代码：

```
    /**
     * 单线程池
     */
    private static void testSingleThreadExecutor() {
        System.out.println("这是单线程池：");
        ExecutorService singleThreadExecutor = Executors.newSingleThreadExecutor();
        for (int i = 0; i < 10; i++) {
            final int index = i;
            singleThreadExecutor.execute(new Runnable() {

                @Override
                public void run() {
                    try {
                        print(index + "");
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
            });
        }
    }
```
输出结果：
```
这是单线程池：
1464230560509:	pool-1-thread-1:	0
1464230561514:	pool-1-thread-1:	1
1464230562519:	pool-1-thread-1:	2
1464230563524:	pool-1-thread-1:	3
1464230564529:	pool-1-thread-1:	4
1464230565534:	pool-1-thread-1:	5
1464230566536:	pool-1-thread-1:	6
1464230567541:	pool-1-thread-1:	7
1464230568546:	pool-1-thread-1:	8
1464230569551:	pool-1-thread-1:	9
```

## 3.自定义线程池
### 3.1. 四种自带线程池的实际构造方法
1.CachedThreadPool：
```
    public static ExecutorService newCachedThreadPool() {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>());
    }
```
2.FixedThreadPool：
```
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```
3.ScheduledThreadPool:
```
    public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
        return new ScheduledThreadPoolExecutor(corePoolSize);
    }
```
跳转至：
```
    public ScheduledThreadPoolExecutor(int corePoolSize) {
        super(corePoolSize, Integer.MAX_VALUE,
              DEFAULT_KEEPALIVE_MILLIS, MILLISECONDS,
              new DelayedWorkQueue());
    }
```
4.SingleThreadExecutor：
```
    public static ExecutorService newSingleThreadExecutor() {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>()));
    }
```

### 3.2.ThreadPoolExecutor构造方法
```
    public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```
参数解释：
>1. **corePoolSize（线程池的基本大小）：**
>当提交一个任务到线程池时，线程池会创建一个线程来执行任务，即使其他空闲的基本线程能够执行新任务也会创建线程，等到需要执行的任务数大于线程池基本大小时就不再创建。如果调用了线程池的prestartAllCoreThreads方法，线程池会提前创建并启动所有基本线程。
>2. **maximumPoolSize（线程池最大大小）：**
>线程池允许创建的最大线程数。如果队列满了，并且已创建的线程数小于最大线程数，则线程池会再创建新的线程执行任务。值得注意的是如果使用了无界的任务队列这个参数就没什么效果。
>3. **keepAliveTime（线程活动保持时间）：**
>线程池的工作线程空闲后，保持存活的时间。所以如果任务很多，并且每个任务执行的时间比较短，可以调大这个时间，提高线程的利用率。
>4. **unit（线程活动保持时间的单位）：**
>可选的单位有天（DAYS），小时（HOURS），分钟（MINUTES），毫秒(MILLISECONDS)，微秒(MICROSECONDS, 千分之一毫秒)和毫微秒(NANOSECONDS, 千分之一微秒)。
>5. **workQueue（任务队列）：**
>用于保存等待执行的任务的阻塞队列。 可以选择以下几个阻塞队列。
  1. ArrayBlockingQueue：
是一个基于数组结构的有界阻塞队列，此队列按 FIFO（先进先出）原则对元素进行排序。
  2. LinkedBlockingQueue：
一个基于链表结构的阻塞队列，此队列按FIFO （先进先出） 排序元素，吞吐量通常要高于ArrayBlockingQueue。静态工厂方法Executors.newFixedThreadPool()使用了这个队列。
  3. SynchronousQueue：
 一个不存储元素的阻塞队列。每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于LinkedBlockingQueue，静态工厂方法Executors.newCachedThreadPool使用了这个队列。
  4. PriorityBlockingQueue：
一个具有优先级的无限阻塞队列。
6. **threadFactory（线程工厂）:**
用于设置创建线程的工厂，可以通过线程工厂给每个创建出来的线程设置更有意义的名字。
7. **handler（饱和策略）:**
当队列和线程池都满了，说明线程池处于饱和状态，那么必须采取一种策略处理提交的新任务。这个策略默认情况下是AbortPolicy，表示无法处理新任务时抛出异常。以下是JDK1.5提供的四种策略。
  1. AbortPolicy：直接抛出异常。
  2. CallerRunsPolicy：只用调用者所在线程来运行任务。
  3. DiscardOldestPolicy：丢弃队列里最近的一个任务，并执行当前任务。
  4. DiscardPolicy：不处理，丢弃掉。当然也可以根据应用场景需要来实现RejectedExecutionHandler接口自定义策略。如记录日志或持久化不能处理的任务。

### 3.3.简单的自定义线程池
核心有两个线程，最大线程数量可无限，存活时间60s

测试代码：
```
    /**
     * 自定义线程池
     */
    private static void testCustomThreadPool() {
        System.out.println("这是自定义线程池：");
        ExecutorService customThreadExecutor = new ThreadPoolExecutor(
                2, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<Runnable>());
        for (int i = 0; i < 10; i++) {
            final int index = i;
            customThreadExecutor.execute(new Runnable() {

                @Override
                public void run() {
                    try {
                        print(index + "");
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
            });
        }
    }
```

输出结果：
```
这是自定义线程池：
1464235380782:	pool-1-thread-1:	0
1464235380783:	pool-1-thread-2:	1
1464235381787:	pool-1-thread-2:	2
1464235381787:	pool-1-thread-1:	3
1464235382790:	pool-1-thread-2:	5
1464235382790:	pool-1-thread-1:	4
1464235383793:	pool-1-thread-1:	7
1464235383793:	pool-1-thread-2:	6
1464235384798:	pool-1-thread-1:	8
1464235384798:	pool-1-thread-2:	9
```




-------
参考目录：
1. [Java：多线程，线程池，用Executors静态工厂生成常用线程池](http://www.cnblogs.com/nayitian/p/3261678.html)
2. [Java(Android)线程池](http://www.androidchina.net/1302.html)
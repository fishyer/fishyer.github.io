---
link: https://www.notion.so/ScheduleAtFixedRate-Schedule-9c732e7cd288425097711d8b3a8dcb06
notionID: 9c732e7c-d288-4250-9771-1d8b3a8dcb06
---
#Java

## 1.代码
```
/**
 * schedule和scheduleAtFixedRate的区别在于:
 * 如果指定开始执行的时间在当前系统运行时间之前，
 * scheduleAtFixedRate会把已经过去的时间也作为周期执行，
 * 而schedule不会把过去的时间算上。
 */
public void test() throws Exception {
    print("[START]");

    Timer timer = new Timer();
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Long time = System.currentTimeMillis() - 25 * 1000;//指定时间：当前时间之前的25秒
    String d = format.format(time);
    Date date = format.parse(d);
    print("date=" + date);
    timer.scheduleAtFixedRate(new TimerTask() {
        public void run() {
            print("ScheduleAtFixedRate");
        }
    }, date, 10 * 1000);//指定时间之后，每隔10秒执行一次

    timer.schedule(new TimerTask() {
        public void run() {
            print("Schedule");
        }
    }, date, 10 * 1000);//执行时间之后，每隔10秒执行一次

    print("[END]");
}

private void print(String msg) {
    Log.e("test", msg);
}
```

## 2.运行结果
![](./_image/2016-10-29-10-53-33.jpg)

## 3.结果分析
间隔时间是10s，
指定开始时间是23:36:04，
程序执行时间是23:36:29，

我在23:36:29执行这个程序，所以立刻打印3次ScheduleAtFixedRate，：
```
ScheduleAtFixedRate    //23:36:04（过去的，立刻执行）
ScheduleAtFixedRate    //23:36:14（过去的，立刻执行）
ScheduleAtFixedRate    //23:36:24（过去的，立刻执行）
ScheduleAtFixedRate    //23:36:34（每隔10s执行）
ScheduleAtFixedRate    //23:36:44（每隔10s执行）
```

**注意：下一次执行是在23:36:34 而不是 23:36:39。就是说是从指定的开始时间开始计时，而不是从执行时间开始计时。**

我在23:36:29执行这个程序，所以立刻打印1次Schedule，随后每隔10s打印一次Schedule：
```
ScheduleAtFixedRate    //23:36:29（立刻执行）
ScheduleAtFixedRate    //23:36:39（每隔10s执行）
```
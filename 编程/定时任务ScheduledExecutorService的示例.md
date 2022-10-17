```
// 定时任务
private ScheduledExecutorService scheduledExecutorService;

/**
 * 开始轮播图切换
 */
private void startPlay() {
    scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
    scheduledExecutorService.scheduleAtFixedRate(new AutoPlayTask(), 1, 4,
            TimeUnit.SECONDS);
}

/**
 * 停止轮播图切换
 */
private void stopPlay() {
    scheduledExecutorService.shutdown();
}


/**
 * 发送轮播图切换任务
 */
private class AutoPlayTask implements Runnable {

    @Override
    public void run() {
        // TODO Auto-generated method stub
        synchronized (autoPlayViewPager) {
            if (!urls.isEmpty()) {
                currentPageIndex02 = (currentPageIndex02 + 1) % urls.size();
                handler.obtainMessage().sendToTarget();
            }

        }
    }

}

/**
 * 执行轮播图切换任务
 */
private Handler handler = new Handler() {

    @Override
    public void handleMessage(Message msg) {
        // TODO Auto-generated method stub
        super.handleMessage(msg);
        if (urls != null) {
            autoPlayViewPager.setCurrentItem(currentPageIndex02);
        }
    }

};
```
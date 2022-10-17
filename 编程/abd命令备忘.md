#1.获取服务信息：
adb shell dumpsys，默认打印出当前系统所有service信息，在后面可加上具体的服务名
需要列出当前运行的服务，可运行：
>adb shell dumpsys | findstr DUMP

#2.获取设备分辨率：
>adb shell dumpsys display | findstr DisplayDeviceInfo

DisplayDeviceInfo{"内置屏幕": 1080 x 1920, 55.0 fps, density 480, 464.949 x 468.923 dpi...

#3.获取设备电池信息：
>adb shell dumpsys battery

Current Battery Service state:
  AC powered: false
  USB powered: true
  Wireless powered: false
  status: 2 #电池状态
  health: 2
  present: true
  level: 34 #电量
  scale: 100
  voltage: 3848
  current now: -427943
  temperature: 280 #电池温度
  technology: Li-ion

#4.获取cpu信息：
>adb shell dumpsys cpuinfo

#5.获取内存信息：
>adb shell dumpsys meminfo

要获取具体应用的内存信息，可加上包名
adb shell dumpsys meminfo PACKAGE_NAME

#6.获取Activity信息：
>adb shell dumpsys activity

加上-h可以获取帮助信息

#7.获取当前界面的UI信息：
>adb shell dumpsys activity top

#8.获取当前界面的Activity：
>adb shell dumpsys activity top | findstr ACTIVITY

#9.获取package信息：
>adb shell dumpsys package
加上-h可以获取帮助信息

#10.获取某个包的信息：
>adb shell dumpsys package PACKAGE_NAME

#11.获取通知信息：
>adb shell dumpsys notification

NotificationRecord(0x44217920: pkg=com.sohu.newsclient useron=0x7f0201b5 / com.tencent.news:drawable/icon
   pri=0 score=0
   contentIntent=PendingIntent{4294d748: PendingIntentRecord{44088e90 com.tencent.news startActivity}}
   deleteIntent=null
   tickerText=null
   contentView=android.widget.RemoteViews@441fc810
   defaults=0x00000001 flags=0x00000010
   sound=null
   vibrate=null
   led=0x00000000 onMs=0 offMs=0
   extras={
     android.title=农业部:中国超级稻亩产超1吨
     android.subText=null
     android.showChronometer=false
     android.icon=2130837941
     android.text=农业部今日通报称,经专家测产,袁隆平领衔培育的中国“超级稻”亩产过千公斤,创造1026.7公斤新纪录。详情>>
     android.progress=0
     android.progressMax=0
     android.showWhen=true
     android.infoText=null
     android.progressIndeterminate=false
     android.scoreModified=false
   }

#12.获取wifi信息：
>adb shell dumpsys wifi
可以获取到当前连接的wifi名、搜索到的wifi列表、wifi强度等

#13.获取电源管理信息：
>adb shell dumpsys power
可以获取到是否处于锁屏状态：mWakefulness=Asleep或者mScreenOn=false
亮度值：mScreenBrightness=255
屏幕休眠时间：Screen off timeout: 60000 ms
屏幕分辨率：mDisplayWidth=1440，mDisplayHeight=2560
等

#14.获取电话信息：
>adb shell dumpsys telephony.registry
可以获取到电话状态，例如
mCallState值为0，表示待机状态、1表示来电未接听状态、2表示电话占线状态
mCallForwarding=false #是否启用呼叫转移
mDataConnectionState=2 #0：无数据连接 1：正在创建数据连接 2：已连接
mDataConnectionPossible=true  #是否有数据连接
mDataConnectionApn=   #APN名称
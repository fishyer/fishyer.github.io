## 04-常用Linux命令备忘




### 打开端口

```
-   firewall-cmd --zone=public --add-port=8385/tcp --permanent && firewall-cmd --reload && firewall-cmd --zone=public --list-ports
-   firewall-cmd --zone=public --add-port=8386/tcp --permanent && firewall-cmd --reload && firewall-cmd --zone=public --list-ports
-   fishyer
-   firewall-cmd --zone=public --add-port=8384/tcp --permanent && firewall-cmd --reload && firewall-cmd --zone=public --list-ports
-   firewall-cmd --zone=public --add-port=9870/tcp --permanent && firewall-cmd --reload && firewall-cmd --zone=public --list-ports
```

### 后台启动服务



### 查找并杀掉指定进程
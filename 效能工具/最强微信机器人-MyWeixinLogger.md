#! https://zhuanlan.zhihu.com/p/569537120

# 最强微信机器人-MyWeixinLogger

把微信聊天消息当做最强输入端，一切消息都可以视为后续做笔记的素材

~~这是一个Vercel+Flask的云服务~~

这是一个VPS+fastApi的云服务
- Vercel不方便看日志于是放弃了，VSCode+远程开发，Remote-SSH插件真的太香了，直接就在服务器上编程，实现了编程上的所见即所得
- 用fastApi重写了一遍，之前的flask版本的代码太乱了，而且flask的文档也不太好，fastApi的文档写的很好，而且代码也很简洁，所以就用fastApi重写了一遍

服务Api文档： https://server.fishyer.com/docs
源码仓库： [fishyer/MyWeixinLogger](https://github.com/fishyer/MyWeixinLogger ) 

## 预览效果

在微信的随手转发
![](https://yupic.oss-cn-shanghai.aliyuncs.com/test/202209292351224.jpg?x-oss-process=image/resize,m_lfit,w_400,h_400)

在Obsidian的沉淀笔记
![](https://yupic.oss-cn-shanghai.aliyuncs.com/test/202209292352929.png?x-oss-process=image/resize,m_lfit,w_600,h_600)


## 目前支持

基于葫芦笔记的WebHook，已经实现微信聊天消息转发给:
1. 飞书群组
2. TG频道
3. Obsidian本地md文件（基于Local REST API插件+SakuraFrp内网穿透）
4. Cubox书签

## 将来也许

以后还可能添加更多的转发，就看有没有相关的Api支持了

比如转发到
1. Diigo
2. Readwise
3. Flomo
4. Notion等等

## 配置文件

在src路径下，添加config.yaml文件

路径：/src/config.yaml
![](https://yupic.oss-cn-shanghai.aliyuncs.com/test/202209290803522.png)

文件内容：
```yaml
# [Cubox-扩展中心和自动化](https://cubox.pro/my/settings/extensions ) 
cuboxToken: 87tx1fXXXXXXXX
# [手把手教你用飞书 Webhook 打造一个消息推送 Bot - 少数派](https://sspai.com/post/68578 ) 
feishuToken: b82250ce-23e0-4874-b539-da93XXXXXXXX
# 可以不用，可通过TG机器人获取 @get_id_bot https://t.me/get_id_bot
tgChatId: '51XXXXXXXX'
# 主要是发到自己的私人TG频道，@RawDataBot https://t.me/raw_data_bot
tgPrivateChannel: '-10015XXXXXXXX'
# 这是一个公开频道，可将私聊中的消息，选择性的转发到这里，可以生成RSS链接
# https://rsshub.fishyer.com/telegram/channel/{这里填频道别名} 
tgRssChannel: '-10016XXXXXXXX'
# 这是TG机器人的token,可找 https://t.me/BotFather 输入命令 /mybots 获取
tgToken: 532879XXXX:AAEsGh2NRytXNaUPTYDWetB2jlhXXXXXXXX
# 这是Obsidian-REST的Token，参考[自动导入标注到 Obsidian · 不使用同步助手方案 | 简悦周报](https://simpread.zhubai.love/posts/2128393555537739776 ) 
obdianToken: 902c0bd59f1d31a9058bfb0ea0ab88454c1a833b3f87c2b661feXXXXXXXXXXX
```

本来Vercel是支持配置环境变量的，但是我更喜欢一切配置均以文件形式保存，这样可以有版本回溯的能力

而且，它本来是做配置的，结果快要被我当成本地缓存来用了，存了临时的消息列表

## 本地运行/远程部署


上面的配置文件写好了的话，就应该可以本地运行了。但是要部署到Vercel的话，反正有些问题，老是各种依赖找不到，所以我就放弃了，直接在VPS上运行了

直接在本机的VSCode-Remote-SSH插件里面运行，或者直接在服务器上运行都可以,然后配置一下服务器上的nginx的端口转发就好了
```
python FastApiApplication.py
```
然后就在 http://0.0.0.0:8001 启动服务了

最好是设置为后台运行
```
nohup python src/FastApiApplication.py > log/bg.log 2>&1 &
```

## Nginx端口转发以及https配置

为了可以在外网用 https://server.fishyer.com 的方式来访问了，不用再加8001的端口号，需要我们配置一下nginx的端口转发，当然了，防火墙的8001端口也记得开启一下

```
firewall-cmd --zone=public --add-port=8001/tcp --permanent && firewall-cmd --reload && firewall-cmd --zone=public --list-ports
```

域名绑定ip的话，则是要在Cloudflare上面配置一下，然后在VPS上面配置一下Cloudflare的DNS解析，这里就不多说了

```conf
location / {
    proxy_pass  http://127.0.0.1:8001; # 转发规则
    proxy_set_header Host $proxy_host; # 修改转发请求头，让8080端口的应用可以受到真实的请求
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

完整版如下：
```conf
server
{
    listen 80;
	listen 443 ssl http2;
    server_name server.fishyer.com;
    index index.php index.html index.htm default.php default.htm default.html;
    root /www/wwwroot/MyVPSProject/server.fishyer.com;

    #SSL-START SSL相关配置，请勿删除或修改下一行带注释的404规则
    #error_page 404/404.html;
    ssl_certificate    /www/server/panel/vhost/cert/server.fishyer.com/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/server.fishyer.com/privkey.pem;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;
		#SSL-END

    #ERROR-PAGE-START  错误页配置，可以注释、删除或修改
    #error_page 404 /404.html;
    #error_page 502 /502.html;
    #ERROR-PAGE-END

    location / {
      proxy_pass  http://127.0.0.1:8001; # 转发规则
      proxy_set_header Host $proxy_host; # 修改转发请求头，让8080端口的应用可以受到真实的请求
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    #PHP-INFO-START  PHP引用配置，可以注释或修改
    include enable-php-00.conf;
    #PHP-INFO-END

    #REWRITE-START URL重写规则引用,修改后将导致面板设置的伪静态规则失效
    include /www/server/panel/vhost/rewrite/server.fishyer.com.conf;
    #REWRITE-END

    #禁止访问的文件或目录
    location ~ ^/(\.user.ini|\.htaccess|\.git|\.svn|\.project|LICENSE|README.md)
    {
        return 404;
    }

    #一键申请SSL证书验证目录相关设置
    location ~ \.well-known{
        allow all;
    }

    #禁止在证书验证目录放入敏感文件
    if ( $uri ~ "^/\.well-known/.*\.(php|jsp|py|js|css|lua|ts|go|zip|tar\.gz|rar|7z|sql|bak)$" ) {
        return 403;
    }

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
    {
        expires      30d;
        error_log /dev/null;
        access_log /dev/null;
    }

    location ~ .*\.(js|css)?$
    {
        expires      12h;
        error_log /dev/null;
        access_log /dev/null;
    }
    access_log  /www/wwwlogs/server.fishyer.com.log;
    error_log  /www/wwwlogs/server.fishyer.com.error.log;
}
```

在niginx的根配置`/www/server/nginx/conf/nginx.conf`,添加单个项目的.conf文件
```
include /www/wwwroot/server.fisheyr.com.conf;
```

## 一个很烦的BUG-消息重复

最开始，我以为是flask在DEBUG模式上重复加载的问题，于是换到了fastApi


结果发现在fastApi上还是存在这个问题，后来才发现，是葫芦笔记的WebHook本身就有问题，会重复发送，有时候1条，有时候2条，有时候3条

问题定位到了，但是怎么解决呢？最开始我是想着用一个缓存的100条最近消息来判断重复，结果发现对葫芦笔记的这个重复无效，因为它的重复消息都是几乎同时发来的，我还以为是缓存失败了，还把缓存换成了redis，但问题依然存在

没办法了，我只好上了redis的分布式锁，来保证同一时间只有一个实例在处理消息，这样就可以保证消息不会重复了，哈哈，有点杀鸡用牛刀了
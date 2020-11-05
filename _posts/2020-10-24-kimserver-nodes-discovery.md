---
layout: post
title:  "[kimserver] 分布式系统 - 节点发现"
categories: kimserver
tags: kimserver nodes discovery
author: wenfh2020
---

[kimserver](https://github.com/wenfh2020/kimserver) 节点发现，是通过中心服务进行管理，中心管理思路清晰，逻辑相对简单，而且有很多成熟的方案，例如 zookeeper。




* content
{:toc}

---

## 1. 中心管理

有中心的服务集群，节点关系比较直观，没那么复杂，方便管理。

### 1.1. 节点关系

B 图的节点关系逻辑相对 A 要简单。带中心管理服务集群就是 B 图的节点管理模式。

![通信解耦](/images/2020-05-21-20-02-12.png){:data-action="zoom"}

---

### 1.2. 观察者模式

中心和服务节点之间的关系是`观察者模式`。

* 服务节点启动需要向中心注册。
* 服务节点通过中心观察其它服务的变化：当有新服务注册到中心或者服务下线，节点配置更新，服务节点（观察者）会收到中心通知。

![节点管理](/images/2020-10-24-10-11-56.png){:data-action="zoom"}

---

> 🔥 文章来源：[《[kimserver] 分布式系统 - 节点发现》](https://wenfh2020.com/2020/10/24/kimserver-nodes-discovery/)
>
> 👍 大家觉得文章对你有些作用！ 如果想 <font color=green>赞赏</font>，可以用微信扫描下面的二维码，感谢!
<div align=center><img src="/images/2020-08-06-15-49-47.png" width="120"/></div>
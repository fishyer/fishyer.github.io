## 1.打开PowerShell
collapsed:: true
	- windows+R
	- 输入powershell
- ## 2.开启WSL
  collapsed:: true
	- wsl --set-default-version 2
	- wsl --install
	- 安装过程中好像要创建ubuntu管理员账号
		- ubuntu账号
			- yutianran
				- fish1314
		- cat /etc/os-release
			- PRETTY_NAME="Ubuntu 24.04.1 LTS"
			- NAME="Ubuntu"
			- VERSION_ID="24.04"
			- VERSION="24.04.1 LTS (Noble Numbat)"
			- VERSION_CODENAME=noble
			- ID=ubuntu
			- ID_LIKE=debian
			- HOME_URL="[https://www.ubuntu.com/](https://www.ubuntu.com/)"
			- SUPPORT_URL="[https://help.ubuntu.com/](https://help.ubuntu.com/)"
			- BUG_REPORT_URL="[https://bugs.launchpad.net/ubuntu/](https://bugs.launchpad.net/ubuntu/)"
			- PRIVACY_POLICY_URL="[https://www.ubuntu.com/legal/terms-and-policies/privacy-policy](https://www.ubuntu.com/legal/terms-and-policies/privacy-policy)"
			- UBUNTU_CODENAME=noble
			- LOGO=ubuntu-logo
- ## 3.在Windows的PowerShell中查看WSL是否开启成功
  collapsed:: true
	- wsl -l -v
		- NAME            STATE           VERSION
		- Ubuntu-24.04    Running         2
- ## 4.在VSCode中安装WSL插件
  collapsed:: true
	- WSL:在新窗口中连接到WSL
	- 建议代码文件在放到WSL的文件目录下
		- \\wsl.localhost\Ubuntu-24.04\home\yutianran
	- 不建议代码文件放在Windows的文件目录下，因为会影响文件读写效率
		- C:\Users\v-yutianran
- ## 5.在WSL虚拟机里面配置开发环境
  collapsed:: true
	- 安装zsh和ohmyzsh
	- 配置git
		- /home/yutianran/.gitconfig
		  > [user]
		  > 	name = yutianran
		  > 	email = [v-yutianran@ztgame.com](mailto:v-yutianran@ztgame.com)
		  > [color]
		  > 	ui = auto
		  > [http]
		  > 	proxy = [http://172.31.144.1:7890](http://172.31.144.1:7890/)
		  > [https]
		  > 	proxy = [http://172.31.144.1:7890](http://172.31.144.1:7890/)
		  >
			- 参考这个自己改一下git用户信息和网络代理信息,不配置git网络代理的话，安装一些工具会报错比如nvm
			- ubuntu中获取Windows宿主机的局域网IP
				- cat /etc/resolv.conf | grep nameserver | awk '{ print $2 }'
					- 172.31.144.1
	- 配置ssh
		- 生成ssh秘钥
			- ssh-keygen -t ed25519 -C "[v-yutianran@ztgame.com](mailto:v-yutianran@ztgame.com)"
			- ssh-keygen -t ed25519 -C "[yutianran666@gmail.com](mailto:yutianran666@gmail.com)"
		- 测试ssh服务是否可以连接，不能就先启动一下ssh服务
			- ssh -p 22 yutianran@127.0.0.1
			- ssh -p 22 root@127.0.0.1
		- 先配置ssh免密码登录
			- ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 11642 [yutianran@1.tcp.vip.cpolar.top](mailto:yutianran@1.tcp.vip.cpolar.top)
	- 配置node环境
		- 安装nvm
			- curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh) | bash
		- 安装nrm
			-
- ## 6.推荐一个跨平台的SSH终端工具：Xterminal
- ## Reference
  collapsed:: true
	- node配置
		- [coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)
		- nvm install 20.12.2
		- nvm use 20.12.2
		- npm install -g nrm
			- npm config set registry [https://registry.npmmirror.com/](https://registry.npmmirror.com/)
			- npm config get registry
		- npm install -g pnpm
	- git配置
		- [Git](https://gitforwindows.org/index.html)[ for Windows](https://gitforwindows.org/index.html)
		- git config --global [user.name](http://user.name/) "yutianran"
		- git config --global user.email "[v-yutianran@ztgame.com](mailto:v-yutianran@ztgame.com)"
		- git config --global color.ui auto
		- ssh-keygen -t ed25519 -C "[v-yutianran@ztgame.com](mailto:v-yutianran@ztgame.com)"
- ## FAQ
  collapsed:: true
	- 1.为什么我的WSL部署的服务，可以在Windows上通过 [http://localhost:3000/](http://localhost:3000/) 访问，但是无法通过 [http://192.168.93.27:3000/](http://192.168.93.27:3000/) 访问
		- ubuntu获取本机ip
			- ip a
				- 172.31.151.16
					- 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
						- link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
						- inet 127.0.0.1/8 scope host lo
							- valid_lft forever preferred_lft forever
						- inet6 ::1/128 scope host
							- valid_lft forever preferred_lft forever
					- 2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
						- link/ether 00:15:5d:89:10:7f brd ff:ff:ff:ff:ff:ff
						- inet 172.31.151.16/20 brd 172.31.159.255 scope global eth0
							- valid_lft forever preferred_lft forever
						- inet6 fe80::215:5dff:fe89:107f/64 scope link
							- valid_lft forever preferred_lft forever
		- 在Windows PowerShell以管理员身份执行端口转发
			- ifconfig
				- 192.168.93.27
					- Windows IP 配置
					- 以太网适配器 以太网:
						- 连接特定的 DNS 后缀 . . . . . . . :
							- 本地链接 IPv6 地址. . . . . . . . : fe80::2f3a:d8e2:2514:1cf9%8
							- IPv4 地址 . . . . . . . . . . . . : 192.168.93.27
							- 子网掩码  . . . . . . . . . . . . : 255.255.255.0
							- 默认网关. . . . . . . . . . . . . : 192.168.93.1
					- 以太网适配器 vEthernet (WSL):
						- 连接特定的 DNS 后缀 . . . . . . . :
							- 本地链接 IPv6 地址. . . . . . . . : fe80::c34c:30e4:4099:b255%26
							- IPv4 地址 . . . . . . . . . . . . : 172.31.144.1
							- 子网掩码  . . . . . . . . . . . . : 255.255.240.0
							- 默认网关. . . . . . . . . . . . . :
			- netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.31.151.16
			- netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=172.31.151.16
			- netsh interface portproxy add v4tov4 listenport=9000 listenaddress=0.0.0.0 connectport=9000 connectaddress=172.31.151.16
			- netsh interface portproxy add v4tov4 listenport=9003 listenaddress=0.0.0.0 connectport=9003 connectaddress=192.168.182.130
			- [http://192.168.93.27:](http://192.168.93.27:8000/)[8000](http://192.168.93.27:8000/)
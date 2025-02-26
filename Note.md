# 📝 开发环境命令笔记

## 目录

-   [📝 开发环境命令笔记](#-开发环境命令笔记)
    -   [🔑 1. 身份认证](#-1-身份认证)
        -   [1.1 登录认证命令](#11-登录认证命令)
    -   [📦 2. 代码管理](#-2-代码管理)
        -   [2.1 代码仓库克隆命令](#21-代码仓库克隆命令)
    -   [📊 3. 环境结构图解](#-3-环境结构图解)
        -   [3.1 命令关系图](#31-命令关系图)
        -   [3.2 网络环境对比](#32-网络环境对比)
        -   [3.3 命令类型树状图](#33-命令类型树状图)
        -   [3.4 开发环境总览](#34-开发环境总览)

## 🔑 1. 身份认证

### 1.1 登录认证命令

| 环境         | 命令                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **内网环境** | `bash<br>curl -X POST 'http://192.168.95.213:9205/auth/login' \<br>  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \<br>  -H 'Accept: application/json, text/plain, */*' \<br>  -H 'Content-Type: application/json' \<br>  -d '{"phone":"17621803113","password":"458e540a6057052681d188dfd3e9516a"}'<br>`  |
| **外网环境** | `bash<br>curl -X POST 'http://103.115.46.227:29205/auth/login' \<br>  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \<br>  -H 'Accept: application/json, text/plain, */*' \<br>  -H 'Content-Type: application/json' \<br>  -d '{"phone":"17621803113","password":"458e540a6057052681d188dfd3e9516a"}'<br>` |

## 📦 2. 代码管理

### 2.1 代码仓库克隆命令

| 环境                | 命令                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **内网 Git 服务器** | `bash<br>git clone -b feat-1.6.3-ytr git@git.devcloud.ztgame.com:ailab/se/ai-imagine/ai-imagine.git react_mojing<br>` |
| **外网 Git 服务器** | `bash<br>git clone -b feat-1.6.3-ytr git@103.115.46.227:20022/se/ai-imagine/ai-imagine.git react_mojing<br>`          |

## 📊 3. 环境结构图解

### 3.1 命令关系图

```mermaid
graph TD
    A[开发环境命令笔记] --> B[身份认证]
    A --> C[代码管理]

    B --> D[登录认证命令]
    D --> D1[内网环境]
    D --> D2[外网环境]

    C --> F[代码仓库克隆命令]
    F --> F1[内网Git服务器]
    F --> F2[外网Git服务器]

    classDef title fill:#f9f9f9,stroke:#333,stroke-width:2px
    classDef auth fill:#e1f5fe,stroke:#01579b,stroke-width:1px
    classDef code fill:#e8f5e9,stroke:#1b5e20,stroke-width:1px
    classDef authCmd fill:#e3f2fd,stroke:#0d47a1,stroke-width:1px
    classDef codeCmd fill:#e8f5e9,stroke:#1b5e20,stroke-width:1px

    class A title
    class B auth
    class C code
    class D authCmd
    class F codeCmd
```

### 3.2 网络环境对比

```mermaid
flowchart LR
    subgraph 内网环境
    A[登录API] --> B["http://192.168.95.213:9205"]
    C[Git仓库] --> D["git.devcloud.ztgame.com"]
    end

    subgraph 外网环境
    E[登录API] --> F["http://103.115.46.227:29205"]
    G[Git仓库] --> H["103.115.46.227:20022"]
    end

    style 内网环境 fill:#e6f7ff,stroke:#1890ff,stroke-width:2px
    style 外网环境 fill:#f6ffed,stroke:#52c41a,stroke-width:2px

    style A fill:#bbdefb,stroke:#1976d2
    style C fill:#bbdefb,stroke:#1976d2
    style E fill:#c8e6c9,stroke:#388e3c
    style G fill:#c8e6c9,stroke:#388e3c
```

### 3.3 命令类型树状图

```mermaid
mindmap
  root((命令笔记))
    身份认证
      内网登录
        ::icon(🔒)
      外网登录
        ::icon(🌐)
    代码管理
      内网仓库克隆
        ::icon(💻)
      外网仓库克隆
        ::icon(📡)
```

### 3.4 开发环境总览

```mermaid
graph TB
    subgraph 开发环境总览
        subgraph 内网访问
            A[内网API: 192.168.95.213:9205]
            B[内网Git: git.devcloud.ztgame.com]
        end

        subgraph 外网访问
            C[外网API: 103.115.46.227:29205]
            D[外网Git: 103.115.46.227:20022]
        end

        subgraph 主要操作
            E[身份认证]
            F[代码获取]
        end

        E --> A
        E --> C
        F --> B
        F --> D
    end

    style 内网访问 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style 外网访问 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style 主要操作 fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
```

# Supabase 认证系统

基于纯原生 HTML/CSS/JS + Supabase 的用户认证与角色权限系统，支持 GitHub Pages 部署。

## 功能

- 邮箱注册 / 登录 / 登出
- 基于角色的页面访问控制（user / admin）
- 注册触发器自动创建 profile，默认 role=user
- RLS 行级安全策略
- 响应式设计，移动端适配
- 会话保持，刷新不丢失登录状态

## 文件结构

```
├── login.html      登录页
├── register.html   注册页
├── user.html       普通用户主页
├── admin.html      管理员后台
├── auth.js         Supabase 认证封装
├── style.css       统一样式
├── schema.sql      数据库建表与策略
└── README.md       本文件
```

## 一、Supabase 配置

### 1. 创建项目

前往 [supabase.com](https://supabase.com) 注册并创建一个新项目。

### 2. 获取 URL 和 anon key

进入项目后，左侧菜单 **Settings → API**，复制：
- **Project URL**
- **anon public** key

打开 `auth.js`，将顶部的占位符替换为你的实际值：

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

### 3. 执行建表 SQL

左侧菜单 **SQL Editor → New query**，将 `schema.sql` 的内容完整粘贴进去，点击 **Run** 执行。

这会创建：
- `profiles` 表（存储用户角色）
- `auth.users` 插入触发器（自动创建 profile，默认 role=user）
- RLS 策略（用户只读自己的 profile，admin 可读全部）

### 4. 设置管理员

在 Supabase 后台 **Table Editor → profiles**，找到你自己的记录，将 `role` 字段从 `user` 改为 `admin` 即可。

> 管理员角色只能通过后台手动设置，前端没有自助升级入口。

### 5. （可选）关闭邮箱确认

如果不想让用户验证邮箱，进入 **Authentication → Providers → Email**，关闭 **Confirm email** 开关，注册后即可直接登录。

## 二、GitHub Pages 部署

### 1. 创建仓库

在 GitHub 新建一个仓库（如 `supabase-auth-app`），将本项目所有文件推送到仓库根目录。

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的用户名/supabase-auth-app.git
git push -u origin main
```

### 2. 启用 Pages

仓库页面 → **Settings → Pages**：
- Source 选择 **Deploy from a branch**
- Branch 选择 **main**，目录选 **/ (root)**
- 点击 **Save**

等待 1-2 分钟后，页面会显示部署地址，形如 `https://你的用户名.github.io/supabase-auth-app/`。

### 3. 配置 Supabase 域名白名单

在 Supabase 后台 **Authentication → URL Configuration**，将你的 GitHub Pages 地址添加到 **Redirect URLs**，确保登录回调正常工作。

## 三、本地预览

直接用浏览器打开 `login.html` 即可，或用任意静态服务器：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/login.html`。

## 安全说明

- 密码由 Supabase Auth 自动加密存储，前端不做任何明文处理
- anon key 是公开的，配合 RLS 策略保证数据安全
- 所有受保护页面均有鉴权拦截，未登录自动跳转登录页

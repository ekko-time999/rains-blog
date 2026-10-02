# Rains Blog

Rains Theatre 主题个人博客，包含静态页面、前端路由、Express API 和 SQLite 数据访问。

## 当前稳定版本

- 正式端口：`3000`
- 测试端口：按需要通过 `PORT` 环境变量指定
- Node.js：建议使用 Node 22 LTS
- 数据库：SQLite + `better-sqlite3`

## 本地运行

```powershell
npm install
$env:PORT=3000
node server.js
```

然后打开 `http://127.0.0.1:3000/`。

## 本地验收

服务启动后，可以运行关键接口和页面的冒烟测试：

```powershell
npm run test:smoke
```

测试默认访问 `http://127.0.0.1:3002`。如果服务运行在其他端口，可以指定地址：

```powershell
$env:SMOKE_BASE_URL="http://127.0.0.1:3003"
npm run test:smoke
```

## 目录说明

- `server.js`：Express 服务和公开 API
- `js/`：前端路由、页面逻辑和 API 客户端
- `pages/`：SPA 页面片段
- `css/`：视觉样式
- `data/`：运行时 SQLite 数据库，不提交到 Git

## 运行时配置

- `PORT`：HTTP 服务端口，默认 `3000`
- `DB_PATH`：SQLite 数据库文件路径，默认 `data/rains.db`

生产环境应通过进程管理器或系统环境变量设置这些值，不要把服务器专用配置写进代码。

运行时数据库包含内容和留言等状态，发布前应单独备份。干净部署所需的数据库迁移脚本仍需继续整理，不能把生产数据库直接当作代码文件分发。

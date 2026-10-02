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

## 目录说明

- `server.js`：Express 服务和公开 API
- `js/`：前端路由、页面逻辑和 API 客户端
- `pages/`：SPA 页面片段
- `css/`：视觉样式
- `data/`：运行时 SQLite 数据库，不提交到 Git

运行时数据库包含内容和留言等状态，发布前应单独备份。干净部署所需的数据库迁移脚本仍需继续整理，不能把生产数据库直接当作代码文件分发。

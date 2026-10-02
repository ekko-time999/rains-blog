# 部署记录

## 运行环境

- Node.js 22 LTS
- `better-sqlite3` 必须在目标服务器重新安装，不能复制其他操作系统的 `node_modules`
- 生产服务通过环境变量设置 `PORT`，需要迁移数据库时可设置 `DB_PATH`

## 发布前检查

1. 备份 `data/rains.db`。
2. 安装依赖并确认原生模块与目标 Node ABI 匹配。
3. 启动候选端口并检查 `/api/health`。
4. 在候选端口运行 `npm run test:smoke`，确认 12 项检查全部通过。
5. 验证公开文章只返回 `published`，私密文章和草稿返回 404。
6. 验证归档、私藏筛选、文章详情和首页。
7. 通过后再切换反向代理或正式端口。

## 候选版本验收示例

```powershell
$env:PORT=3003
$env:DB_PATH="E:\Rains\data\rains.db"
node server.js
```

另开终端执行：

```powershell
$env:SMOKE_BASE_URL="http://127.0.0.1:3003"
npm run test:smoke
```

## 域名接入

域名解析到服务器后，由 Nginx 或 Caddy 负责 HTTPS 和反向代理，将请求转发到 Node 服务端口。数据库备份与代码发布分开管理。

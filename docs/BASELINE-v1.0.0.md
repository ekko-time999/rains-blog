# Rains Blog v1.0.0 基线验收

## 基线信息

- 基线标签：`v1.0.0`
- 基线提交：`868d441`
- 验收地址：`http://localhost:3002`
- 验收范围：页面、公开 API、归档、私藏分类和公开内容边界

## 验收结果

### 接口

| 接口 | 预期 | 结果 |
|---|---:|---|
| `/api/health` | 200 | 通过 |
| `/api/posts` | 200 | 通过，3 篇 published |
| `/api/posts/equity-penetration-system` | 200 | 通过 |
| `/api/posts/private-article` | 404 | 通过 |
| `/api/posts/draft-article` | 404 | 通过 |
| `/api/posts/archive` | 200 | 通过，3 篇 |
| `/api/projects` | 200 | 通过 |
| `/api/friends` | 200 | 通过 |
| `/api/recommendations` | 200 | 通过，10 条 |
| `/api/recommendations?type=musical` | 200 | 通过 |
| `/api/messages` | 200 | 通过 |

接口回归：**11/11 通过**。

### 页面

以下页面均返回 200：

`/`、`/posts.html`、`/post.html?slug=equity-penetration-system`、`/projects.html`、`/friends.html`、`/recommendations.html`、`/about.html`、`/audience.html`、`/archive.html`。

页面回归：**9/9 通过**。

### 私藏分类

| 分类 | 数量 |
|---|---:|
| 音乐剧 | 5 |
| 电影 | 2 |
| 书籍 | 1 |
| 软件 | 2 |

私藏总数为 10 条，其中有外部链接 4 条、无外部链接 6 条。

## 基线结论

当前版本可作为后续 `feature/code-quality` 优化分支的回归基线。后续步骤不得降低上述接口状态、页面状态、公开内容边界或私藏分类结果。

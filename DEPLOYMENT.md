# V0.1 静态发布流程

## 1. 推送到 GitHub

在本地初始化并推送仓库：

```bash
git init
git add .
git commit -m "chore: prepare v0.1 static release"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

如果仓库已经存在，只需要正常提交并推送本轮改动。

## 2. 开启 GitHub Actions 写权限

进入 GitHub 仓库：

```text
Settings -> Actions -> General -> Workflow permissions
```

选择：

```text
Read and write permissions
```

保存后，`.github/workflows/refresh-snapshot.yml` 就可以每 4 小时自动提交新的 `data/market-snapshot.js`。

## 3. 手动验证快照刷新

进入：

```text
Actions -> Refresh market snapshot -> Run workflow
```

检查 workflow 是否成功：

- `Check scripts` 通过。
- `Refresh snapshot` 成功生成快照。
- 如果快照有变化，会出现提交 `chore: refresh market snapshot`。
- 如果没有变化，会输出 `No snapshot changes to commit.`。

## 4. 连接 Vercel

在 Vercel 新建项目：

- Import Git Repository：选择该 GitHub 仓库。
- Framework Preset：选择 `Other` 或保持默认静态识别。
- Build Command：可留空，或填 `npm run check`。
- Output Directory：留空，使用项目根目录。

部署完成后，Vercel 会在每次 GitHub 有新提交时自动重新部署。

## 5. 上线后检查

打开 Vercel 域名，确认：

- 全球市场总览正常显示。
- 自选股列表正常显示。
- 股票、ETF、外汇、期货详情图正常显示。
- 页面底部数据说明正常显示。
- 顶部同步时间会随 `data/market-snapshot.js` 更新。

## 6. V0.1 边界

V0.1 仍是静态站：

- 不包含后端。
- 不包含登录。
- 自选股仍保存在当前设备的 `localStorage`。
- 数据刷新通过 GitHub Actions 生成静态快照。
- 后续可以再演进到 serverless 快照服务、云端自选、通知和扫描器。

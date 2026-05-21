# Market Radar 部署流程

本项目采用 **静态前端 + 静态快照文件** 的发布方式。V0.2 不需要后端、数据库或登录系统。

## 1. 本地上线前检查

```bash
npm run check
git diff --check
```

`git diff --check` 中如果只出现 Windows 换行提示，例如 `LF will be replaced by CRLF`，不影响上线。

本地预览：

```bash
npm run dev
```

打开：

```text
http://localhost:4173
```

## 2. 提交并推送 GitHub

已有远端仓库：

```text
https://github.com/naizihu/market-radar-static.git
```

常规提交流程：

```bash
git add app.js styles.css index.html package.json README.md DEPLOYMENT.md
git commit -m "feat: release v0.2 chart polish"
git pull --rebase origin main
git push origin main
```

如果 `git pull --rebase` 过程中出现冲突，先解决冲突，再继续：

```bash
git rebase --continue
git push origin main
```

## 3. Vercel 自动部署

Vercel 项目绑定 GitHub 仓库后，每次 `main` 分支有新提交都会自动部署。

推荐配置：

- Framework Preset：`Other`
- Build Command：留空或填写 `npm run check`
- Output Directory：留空，使用项目根目录
- Node 版本：Vercel 默认即可，项目要求 `>=20`

部署后检查：

- 页面可以直接通过 Vercel 域名访问。
- 手机访问不应要求登录 Vercel。
- 全球市场总览、市场宽度、股票详情图、数据说明正常显示。
- 当前价格红线与价格标签、抵扣价标注、宽度图对齐正常。

## 4. GitHub Actions 自动刷新快照

工作流文件：

```text
.github/workflows/refresh-snapshot.yml
```

触发方式：

- 定时：每 4 小时运行一次。
- 手动：GitHub 页面进入 `Actions -> Refresh market snapshot -> Run workflow`。

工作流逻辑：

1. 拉取最新 `main`。
2. 运行 `npm run check`。
3. 运行 `npm run snapshot:force`。
4. 如果 `data/market-snapshot.js` 有变化，自动提交：

```text
chore: refresh market snapshot
```

5. Vercel 检测到该提交后自动重新部署。

## 5. GitHub Actions 权限

仓库需要允许 Actions 写入内容：

```text
Settings -> Actions -> General -> Workflow permissions -> Read and write permissions
```

如果权限不足，刷新任务可能能生成快照，但无法自动提交。

## 6. 上线后验收

部署成功后建议按顺序检查：

1. 打开 Vercel 域名，确认页面无需登录即可访问。
2. 检查顶部“上次同步”时间。
3. 检查全球市场总览卡片和趋势小图。
4. 检查等权 / 权重 MA20 宽度图。
5. 点击市场卡片或自选股，确认详情图切换正常。
6. 检查 MA、RSI、OBV、Volume、抵扣价和当前价线。
7. 手机端打开同一域名，确认布局可读。
8. 手动触发一次 `Refresh market snapshot`，确认绿色成功。

## 7. V0.2 边界

V0.2 仍是静态发布版：

- 不包含后端。
- 不包含登录。
- 自选股保存在当前设备的 `localStorage`。
- 数据刷新通过 GitHub Actions 生成静态快照。
- UI 仍保留 V0.3 的继续优化空间。

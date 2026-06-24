# Market Radar 部署流程

本项目采用 **静态前端 + 静态快照文件** 的发布方式。V0.3 不需要后端、数据库或登录系统。

## 1. 本地上线前检查

```bash
npm run check
git diff --check
```

`git diff --check` 如果只出现 Windows 换行提示，例如 `LF will be replaced by CRLF`，不影响上线。

本地预览：

```bash
npm run dev
```

打开：

```text
http://localhost:4173
```

建议上线前再确认：

- 页面能加载。
- 全球市场总览不为空。
- 市场状态雷达不挤压。
- 等权 / 权重 MA20 宽度图正常。
- 股票详情图能切换。
- 数据说明能显示快照健康、缺失标的和刷新口径。

## 2. 提交并推送 GitHub

远端仓库：

```text
https://github.com/naizihu/market-radar-static.git
```

推荐提交流程：

```bash
git add app.js styles.css index.html package.json README.md DEPLOYMENT.md scripts/fetch-market-data.mjs scripts/serve.mjs data/market-snapshot.js data/sector-map.json
git commit -m "feat: release v0.3 trust and breadth insights"
git pull --rebase origin main
git push origin main
```

如果 `git pull --rebase` 出现冲突，先解决冲突，再继续：

```bash
git rebase --continue
git push origin main
```

## 3. Vercel 自动部署

Vercel 项目绑定 GitHub 仓库后，每次 `main` 分支有新提交都会自动部署。

推荐配置：

- Framework Preset：`Other`
- Build Command：留空或 `npm run check`
- Output Directory：留空，使用项目根目录
- Node 版本：项目要求 `>=20`

部署后检查：

- 页面可以直接通过 Vercel 域名或自定义域名访问。
- 手机访问不应要求登录 Vercel。
- 全球市场总览、市场宽度、股票详情图、数据说明正常显示。

## 4. GitHub Actions 自动刷新快照

工作流文件：

```text
.github/workflows/refresh-snapshot.yml
```

触发方式：

- 定时：每 4 小时运行一次。
- 手动：GitHub 页面进入 `Actions -> Refresh market snapshot -> Run workflow`。

工作流逻辑：

1. 拉取仓库。
2. 同步最新 `main`。
3. 运行 `npm run check`。
4. 运行 `npm run snapshot:force`。
5. 如果 `data/market-snapshot.js` 有变化，自动提交：

```text
chore: refresh market snapshot
```

6. 推送到 GitHub。
7. Vercel 检测到该提交后自动重新部署。

## 5. Actions 防失败设计

当前 workflow 已经加入几项保护：

- `permissions: contents: write`：允许 Actions 写入快照提交。
- `concurrency`：同一时间只允许一个刷新任务写快照，避免互相覆盖。
- `git fetch origin main` + `git reset --hard origin/main`：刷新前同步远端最新代码。
- `git pull --rebase origin main`：提交快照后推送前再次同步，降低 push rejected 风险。
- 如果快照无变化，输出 `No snapshot changes to commit.`，任务仍算成功。

如果失败，优先看这两个步骤：

- `Refresh snapshot`：取数或快照生成失败。
- `Commit snapshot if changed`：提交或推送失败。

## 6. GitHub Actions 权限

仓库需要允许 Actions 写入内容：

```text
Settings -> Actions -> General -> Workflow permissions -> Read and write permissions
```

如果权限不足，任务可能能生成快照，但无法自动提交。

## 7. 上线后验收

部署成功后建议按顺序检查：

1. 打开线上域名，确认页面无需登录即可访问。
2. 检查顶部“上次同步”和新鲜度状态。
3. 检查全球市场总览卡片和趋势小图。
4. 检查市场状态雷达摘要与信号卡片。
5. 检查等权 / 权重 MA20 宽度图。
6. 展开行业宽度和样本明细，确认可读。
7. 点击市场卡片或自选股，确认详情图切换正常。
8. 手动触发一次 `Refresh market snapshot`，确认 workflow 绿色成功。
9. 等 Vercel 自动重新部署后，再刷新线上页面确认同步时间更新。

## 8. V0.3 边界

V0.3 仍是静态发布版：

- 不包含后端。
- 不包含登录。
- 自选股保存在当前设备的 `localStorage`。
- 数据刷新通过 GitHub Actions 生成静态快照。
- UI 仍保留后续 V0.4 的移动端和图表体验优化空间。

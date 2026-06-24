# Market Radar V0.3

一个静态发布版的股票与全球市场追踪网页应用。当前版本目标不是最终形态，而是先上线一个能访问、能自动刷新、能持续小步迭代的个人市场雷达。

## 当前亮点

- **全球市场总览**：按美股、A股 / 港股、亚太、利率、外汇、期货、加密资产分组展示。
- **主流 ETF / 指数代理**：美股使用 SPY、QQQ、DIA、IWM；创业板使用 159915.SZ，科创50 使用 588000.SS，A50 使用 2822.HK。
- **自选股追踪**：默认覆盖美股七巨头、腾讯、贵州茅台，支持本机 `localStorage` 添加和删除自选。
- **详情图表**：近一年日 K、MA20 / MA60 / MA120 / MA200、Volume、RSI、OBV、MA20 / MA60 / MA120 抵扣价。
- **市场宽度**：S&P 500 与沪深300的等权和权重 MA20 宽度，展示近一年交易日。
- **行业宽度解释**：S&P 500 使用 GICS 一级行业；沪深300优先中证官方行业，缺失时用本地申万一级行业补表。
- **市场状态雷达**：使用固定规则分析风险偏好、流动性压力、商品线索、宽度质量和区域强弱，不调用 AI。
- **数据可信度提示**：展示快照新鲜度、错误日志、缺失标的、宽度覆盖和刷新频率。
- **静态快照架构**：前端只读取 `data/market-snapshot.js`，GitHub Actions 每 4 小时刷新，Vercel 自动部署。

## 数据源与口径

- **行情数据**：Yahoo Finance chart API，拉取近 2 年日线 OHLCV。
- **股票 / ETF / 指数**：优先使用 Yahoo Finance 可取标的；不可直接稳定取得的指数使用主流 ETF 代理，并在界面标注代理符号。
- **外汇**：DXY、EUR/USD、USD/JPY、GBP/USD、USD/CNY、AUD/USD。
- **期货**：黄金、WTI 原油、铜、白银。
- **加密资产**：BTC、ETH。
- **S&P 500 成分股**：完整成分股用于宽度；权重宽度使用 SPY / 主流持仓权重口径。
- **沪深300 成分股**：完整成分股用于宽度；权重宽度使用 510300 ETF 持仓权重口径。
- **行业分类**：美股使用 GICS 一级；A 股优先中证官方行业，缺失时使用本地申万一级补表。

外汇与部分指数的成交量口径不稳定，因此详情图不会为这些标的绘制误导性的 Volume / OBV 信号。

## 指标参数

- 市场卡片趋势图：近 1 年日线。
- 自选卡片价格 / 成交量迷你图：近 1 年日线。
- 详情主图：默认近 1 年日 K，可通过 `+ / - / 重置` 缩放。
- MA：MA20 / MA50 / MA60 / MA120 / MA200，使用近 2 年完整快照历史计算。
- RSI：14 日 RSI。
- OBV：带 20 日均线，仅成交量可靠标的启用。
- Volume：当前可视窗口内高于 80 分位的柱子标绿色。
- 抵扣价：MA20 / MA60 / MA120 使用不含最新 K 线的第 20 / 60 / 120 根前置 K 线。
- 市场宽度：近 1 年交易日，`>80` 为极热，`<20` 为极冷。
- 宽度背离 / 修复：以近 21 个交易日作为一个月窗口。
- 快照刷新：计划每 4 小时整点刷新。

## 本地运行

```bash
npm run check
npm run dev
```

默认本地地址：

```text
http://localhost:4173
```

如果浏览器打不开本地页面，优先确认 `npm run dev` 是否仍在运行。当前本地服务监听 `0.0.0.0`，通常可以通过 `http://localhost:4173` 或 `http://127.0.0.1:4173` 访问。

## 刷新快照

```bash
npm run snapshot
npm run snapshot:market
npm run snapshot:force
```

- `snapshot`：遵守 4 小时新鲜度，未过期时不强制刷新。
- `snapshot:market`：轻量刷新市场、自选、期货、外汇、加密行情，保留上一版完整宽度。适合本地快速更新，避免完整成分股刷新卡住。
- `snapshot:force`：强制刷新完整快照，包括宽度数据。适合 GitHub Actions 或需要完整重算时使用。

脚本会记录失败标的和失败原因；单个标的超时不会阻断整个快照，页面会隐藏缺失标的而不是展示假数据。

## 发布方式

推荐流程是 GitHub + Vercel：

1. 提交并推送代码到 GitHub。
2. Vercel 监听 GitHub `main` 分支提交并自动部署静态站。
3. GitHub Actions 每 4 小时运行 `Refresh market snapshot`。
4. 如果快照有变化，Actions 自动提交 `data/market-snapshot.js`。
5. Vercel 检测到快照提交后自动重新部署。

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## GitHub Actions 刷新安全性

当前 workflow 已包含：

- `contents: write`：允许 Actions 提交刷新后的快照。
- `concurrency`：避免多个刷新任务同时写入。
- `git fetch origin main` + `git reset --hard origin/main`：刷新前同步远端最新 main。
- `git pull --rebase origin main`：提交快照后推送前再次同步，降低 push rejected 风险。
- 无快照变化时输出 `No snapshot changes to commit.` 并成功退出。

## V0.4 预留方向

- 移动端专属布局，例如指标区 Tab 化、卡片密度优化。
- 图表 hover、缩放和辅助线继续精修。
- 宽度行业下钻到二级行业。
- 自选股分组、排序、标签和云端同步。
- Serverless 快照服务、告警通知、扫描器、持仓分析。

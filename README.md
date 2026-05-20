# Market Radar V0.1

一个静态股票市场追踪网页应用。V0.1 的目标是先上线、跨设备可访问，并保留后续继续迭代 UI、指标、信号和数据源的空间。

## 当前能力

- 全球市场总览：美股 ETF、A/HK/亚太、利率、外汇、期货、加密资产。
- 自选股列表：默认包含美股 7 巨头、腾讯、贵州茅台，并支持本机 `localStorage` 自选。
- 股票详情：近一年日 K、MA20/60/120/200、RSI、可用成交量资产的 OBV。
- 市场宽度：S&P 500 与沪深300成分股 MA20 宽度，包含等权和权重口径。
- 数据快照：前端读取 `data/market-snapshot.js`，默认 4 小时刷新一次。

## 数据源

- Yahoo Finance chart API：股票、ETF、指数、外汇、期货、加密资产日线 OHLCV。
- 公开成分股清单：S&P 500 与沪深300成分股列表。
- ETF/基金持仓页面：S&P 500 权重优先使用 SPY 官方 holdings，失败时回退 IVV；沪深300权重使用 510300 ETF 持仓。

外汇通常没有可靠成交量，因此 OBV 在外汇上会显示为不适用，这是预期行为。

## 本地运行

```bash
npm run check
npm run dev
```

打开终端输出的本地地址，默认是：

```text
http://localhost:4173
```

如果本机只有 `node` 但没有 `npm`，可以使用等价命令：

```bash
node --check app.js
node --check scripts/fetch-market-data.mjs
node --check scripts/serve.mjs
node scripts/serve.mjs
```

## 刷新快照

```bash
npm run snapshot
npm run snapshot:force
```

`snapshot` 会尊重 4 小时新鲜度，`snapshot:force` 会强制重新拉取并改写 `data/market-snapshot.js`。

## 发布

推荐使用 GitHub + Vercel：

1. 推送仓库到 GitHub。
2. 在 Vercel 导入该仓库。
3. 保持静态站部署，Build Command 可留空或使用 `npm run check`。
4. GitHub Actions 每 4 小时刷新快照并提交，Vercel 检测到提交后自动重新部署。

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

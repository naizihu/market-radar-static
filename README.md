# Market Radar V0.2

一个静态发布版的股票与全球市场追踪网页应用。V0.2 的目标不是最终形态，而是先上线一个能访问、能自动刷新、能继续小步迭代的市场雷达。

## 当前亮点

- **全球市场总览**：按美股、A 股 / 港股、亚太、利率、外汇、期货、加密资产分组展示。
- **自选股追踪**：默认覆盖美股七巨头、腾讯、贵州茅台，并支持本机 `localStorage` 自选股添加与删除。
- **详情图表**：近一年日 K、MA20 / MA60 / MA120 / MA200、RSI、OBV、Volume、MA20 / MA60 / MA120 抵扣价。
- **市场宽度**：S&P 500 与沪深300的等权和权重 MA20 宽度，展示近一年交易日。
- **市场状态雷达**：使用固定规则分析风险偏好、股指强弱、美元 / 利率压力、商品、加密资产和宽度温度，不调用 AI。
- **静态快照架构**：前端只读取 `data/market-snapshot.js`，GitHub Actions 每 4 小时刷新快照，Vercel 自动重新部署。

## 数据源

- **行情数据**：Yahoo Finance chart API，拉取近 2 年日线 OHLCV。
- **股票 / ETF / 指数**：优先使用 Yahoo Finance 原始标的，缺失时使用主流 ETF 代理并在界面标注。
- **外汇**：DXY、EUR/USD、USD/JPY、GBP/USD、USD/CNY、AUD/USD 等核心外汇对。
- **期货**：黄金、WTI 原油、铜、白银。
- **加密资产**：BTC、ETH。
- **成分股宽度**：S&P 500 与沪深300成分股；等权宽度每只股票 1 票，权重宽度使用 SPY / 510300 持仓权重。

外汇与部分指数的成交量口径不稳定，因此详情图不会为这些标的绘制误导性的 Volume / OBV 信号。

## 指标口径

- 市场卡片趋势图：近 1 年日线。
- 自选股迷你价格 / 成交量图：近 1 年日线。
- 详情主图：默认近 1 年日 K，可通过 `+ / - / 重置` 缩放。
- MA：MA20 / MA50 / MA60 / MA120 / MA200，使用近 2 年完整快照历史计算。
- RSI：14 日 RSI。
- OBV：带 20 日均线，仅在成交量可靠标的启用。
- Volume：当前可视窗口内高于 80 分位的柱子标绿色。
- 抵扣价：MA20 / MA60 / MA120 使用不含最新 K 线的第 20 / 60 / 120 根前置 K 线。
- 市场宽度：近 1 年交易日，`>80` 为极热，`<20` 为极冷。
- 快照刷新：默认每 4 小时。

## 本地运行

```bash
npm run check
npm run dev
```

默认本地地址：

```text
http://localhost:4173
```

如果本机 Node 已安装但 PowerShell 找不到 `npm`，先确认 Node.js 已加入 PATH。当前项目的 `npm run check` 使用 stdin 方式检查脚本语法，避免 Windows 沙箱下 `node --check app.js` 的路径权限问题。

## 刷新快照

```bash
npm run snapshot
npm run snapshot:force
```

- `snapshot`：遵守 4 小时新鲜度。
- `snapshot:force`：强制重新拉取并改写 `data/market-snapshot.js`。

## 发布方式

推荐流程是 GitHub + Vercel：

1. 提交并推送代码到 GitHub。
2. Vercel 监听 GitHub 提交并自动部署静态站。
3. GitHub Actions 每 4 小时运行 `Refresh market snapshot`。
4. 如果快照有变化，Actions 自动提交 `data/market-snapshot.js`。
5. Vercel 检测到快照提交后自动重新部署。

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## V0.3 预留方向

- 图表交互继续精修：更好的 hover、缩放、移动端布局和指标层级。
- 市场状态雷达扩展：更多固定规则、更多分类解释，不依赖 AI。
- 自选股体验：分组、排序、云端同步。
- 数据质量：更多行情源补全、成分股和权重源校验。
- 后端演进：serverless 快照服务、告警通知、扫描器、持仓分析。

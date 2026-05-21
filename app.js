const marketDefinitions = [
  { code: "SPX", name: "美国", index: "S&P 500", price: 5238.4, region: "美股" },
  { code: "QQQ", name: "美国", index: "QQQ", price: 443.6, region: "美股ETF" },
  { code: "IXIC", name: "美国", index: "纳斯达克", price: 16340.9, region: "美股" },
  { code: "RUT", name: "美国", index: "罗素2000", price: 2065.8, region: "美股" },
  { code: "SSEC", name: "中国", index: "上证指数", price: 3138.2, region: "A股" },
  { code: "CSI300", name: "中国", index: "沪深300", price: 3658.2, region: "A股" },
  { code: "CSI500", name: "中国", index: "中证500", price: 5486.7, region: "A股" },
  { code: "HSI", name: "香港", index: "恒生指数", price: 18792.5, region: "港股" },
  { code: "HSTECH", name: "香港", index: "恒生科技", price: 3928.4, region: "港股" },
  { code: "N225", name: "日本", index: "Nikkei 225", price: 38876.5, region: "亚太" },
  { code: "KOSPI", name: "韩国", index: "KOSPI", price: 2714.4, region: "亚太" },
  { code: "ASX200", name: "澳大利亚", index: "ASX 200", price: 7824.6, region: "亚太" },
  { code: "TNX", name: "美国", index: "10年美国国债", price: 4.35, region: "利率" },
  { code: "DXY", name: "美国", index: "美元指数", price: 105.2, region: "外汇" },
  { code: "BTC", name: "加密资产", index: "BTC", price: 65000, region: "Crypto" },
  { code: "ETH", name: "加密资产", index: "ETH", price: 3200, region: "Crypto" },
];

const futuresDefinitions = [
  { code: "GC", name: "黄金期货", index: "COMEX Gold", price: 2368.4, unit: "美元/盎司", volatility: 0.9 },
  { code: "CL", name: "原油期货", index: "WTI Crude", price: 78.35, unit: "美元/桶", volatility: 1.6 },
  { code: "HG", name: "铜期货", index: "COMEX Copper", price: 4.62, unit: "美元/磅", volatility: 1.2 },
];

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", region: "北美", base: 184.25, volatility: 1.35 },
  { symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ", region: "北美", base: 421.8, volatility: 1.1 },
  { symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ", region: "北美", base: 905.42, volatility: 2.3 },
  { symbol: "TSLA", name: "Tesla", exchange: "NASDAQ", region: "北美", base: 177.9, volatility: 2.8 },
  { symbol: "BABA", name: "Alibaba", exchange: "NYSE", region: "亚太", base: 78.3, volatility: 1.9 },
  { symbol: "TM", name: "Toyota", exchange: "NYSE", region: "亚太", base: 231.4, volatility: 1.05 },
  { symbol: "ASML", name: "ASML Holding", exchange: "AMS", region: "欧洲", base: 911.6, volatility: 1.45 },
  { symbol: "SAP", name: "SAP SE", exchange: "XETRA", region: "欧洲", base: 187.25, volatility: 0.9 },
  { symbol: "RIO", name: "Rio Tinto", exchange: "LSE", region: "欧洲", base: 67.8, volatility: 1.25 },
  { symbol: "VALE", name: "Vale S.A.", exchange: "B3", region: "拉美", base: 12.3, volatility: 2.1 },
  { symbol: "NPN", name: "Naspers", exchange: "JSE", region: "非洲", base: 176.2, volatility: 1.7 },
  { symbol: "ARAMCO", name: "Saudi Aramco", exchange: "TADAWUL", region: "中东", base: 7.62, volatility: 0.82 },
].map((stock, index) => enrichInstrument(stock, index, 280));

const markets = marketDefinitions.map((market, index) =>
  enrichInstrument({ ...market, base: market.price, volatility: 0.85 + index * 0.12 }, index + 20, 120),
);

const futures = futuresDefinitions.map((future, index) =>
  enrichInstrument({ ...future, base: future.price }, index + 45, 120),
);

configureMarketUniverse();
configureDefaultStocks();

const stockCatalog = [
  { symbol: "AMZN", name: "Amazon", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 185.4, volatility: 1.6 },
  { symbol: "META", name: "Meta Platforms", exchange: "NASDAQ", region: "北美", base: 493.2, volatility: 1.8 },
  { symbol: "GOOGL", name: "Alphabet", exchange: "NASDAQ", region: "北美", base: 171.6, volatility: 1.25 },
  { symbol: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ", region: "北美", base: 158.4, volatility: 2.35 },
  { symbol: "JPM", name: "JPMorgan Chase", exchange: "NYSE", region: "北美", base: 201.7, volatility: 0.95 },
  { symbol: "PDD", name: "PDD Holdings", exchange: "NASDAQ", region: "亚太", base: 138.2, volatility: 2.1 },
  { symbol: "0700.HK", name: "Tencent", exchange: "HKEX", region: "亚太", base: 382.6, volatility: 1.65 },
  { symbol: "9988.HK", name: "Alibaba HK", exchange: "HKEX", region: "亚太", base: 77.4, volatility: 1.8 },
  { symbol: "600519.SS", name: "Kweichow Moutai", exchange: "SSE", region: "A\u80a1", base: 1550, volatility: 2.1 },
];

const expandedStockCatalog = [
  ["BRK-B", "Berkshire Hathaway", "NYSE", "\u5317\u7f8e"],
  ["AVGO", "Broadcom", "NASDAQ", "\u5317\u7f8e"],
  ["LLY", "Eli Lilly", "NYSE", "\u5317\u7f8e"],
  ["UNH", "UnitedHealth", "NYSE", "\u5317\u7f8e"],
  ["V", "Visa", "NYSE", "\u5317\u7f8e"],
  ["MA", "Mastercard", "NYSE", "\u5317\u7f8e"],
  ["XOM", "Exxon Mobil", "NYSE", "\u5317\u7f8e"],
  ["COST", "Costco", "NASDAQ", "\u5317\u7f8e"],
  ["WMT", "Walmart", "NYSE", "\u5317\u7f8e"],
  ["HD", "Home Depot", "NYSE", "\u5317\u7f8e"],
  ["PG", "Procter & Gamble", "NYSE", "\u5317\u7f8e"],
  ["JNJ", "Johnson & Johnson", "NYSE", "\u5317\u7f8e"],
  ["ORCL", "Oracle", "NYSE", "\u5317\u7f8e"],
  ["NFLX", "Netflix", "NASDAQ", "\u5317\u7f8e"],
  ["CRM", "Salesforce", "NYSE", "\u5317\u7f8e"],
  ["BAC", "Bank of America", "NYSE", "\u5317\u7f8e"],
  ["KO", "Coca-Cola", "NYSE", "\u5317\u7f8e"],
  ["PEP", "PepsiCo", "NASDAQ", "\u5317\u7f8e"],
  ["MCD", "McDonald's", "NYSE", "\u5317\u7f8e"],
  ["CSCO", "Cisco", "NASDAQ", "\u5317\u7f8e"],
  ["ADBE", "Adobe", "NASDAQ", "\u5317\u7f8e"],
  ["QCOM", "Qualcomm", "NASDAQ", "\u5317\u7f8e"],
  ["TXN", "Texas Instruments", "NASDAQ", "\u5317\u7f8e"],
  ["INTU", "Intuit", "NASDAQ", "\u5317\u7f8e"],
  ["AMAT", "Applied Materials", "NASDAQ", "\u5317\u7f8e"],
  ["GE", "GE Aerospace", "NYSE", "\u5317\u7f8e"],
  ["CAT", "Caterpillar", "NYSE", "\u5317\u7f8e"],
  ["DIS", "Disney", "NYSE", "\u5317\u7f8e"],
  ["NKE", "Nike", "NYSE", "\u5317\u7f8e"],
  ["TMO", "Thermo Fisher", "NYSE", "\u5317\u7f8e"],
  ["PFE", "Pfizer", "NYSE", "\u5317\u7f8e"],
  ["MRK", "Merck", "NYSE", "\u5317\u7f8e"],
  ["BABA", "Alibaba ADR", "NYSE", "\u5317\u7f8e"],
  ["TM", "Toyota ADR", "NYSE", "\u5317\u7f8e"],
  ["ASML", "ASML Holding", "NASDAQ", "\u5317\u7f8e"],
  ["SAP", "SAP", "NYSE", "\u5317\u7f8e"],
  ["RIO", "Rio Tinto ADR", "NYSE", "\u5317\u7f8e"],
  ["VALE", "Vale ADR", "NYSE", "\u5317\u7f8e"],
  ["3690.HK", "Meituan", "HKEX", "\u6e2f\u80a1"],
  ["9618.HK", "JD.com HK", "HKEX", "\u6e2f\u80a1"],
  ["1810.HK", "Xiaomi", "HKEX", "\u6e2f\u80a1"],
  ["1299.HK", "AIA", "HKEX", "\u6e2f\u80a1"],
  ["0939.HK", "CCB", "HKEX", "\u6e2f\u80a1"],
  ["1398.HK", "ICBC", "HKEX", "\u6e2f\u80a1"],
  ["3988.HK", "Bank of China", "HKEX", "\u6e2f\u80a1"],
  ["0005.HK", "HSBC", "HKEX", "\u6e2f\u80a1"],
  ["0388.HK", "HKEX", "HKEX", "\u6e2f\u80a1"],
  ["2318.HK", "Ping An HK", "HKEX", "\u6e2f\u80a1"],
  ["0883.HK", "CNOOC", "HKEX", "\u6e2f\u80a1"],
  ["0941.HK", "China Mobile", "HKEX", "\u6e2f\u80a1"],
  ["1211.HK", "BYD HK", "HKEX", "\u6e2f\u80a1"],
  ["2020.HK", "ANTA Sports", "HKEX", "\u6e2f\u80a1"],
  ["1024.HK", "Kuaishou", "HKEX", "\u6e2f\u80a1"],
  ["9999.HK", "NetEase HK", "HKEX", "\u6e2f\u80a1"],
  ["9868.HK", "XPeng HK", "HKEX", "\u6e2f\u80a1"],
  ["0981.HK", "SMIC", "HKEX", "\u6e2f\u80a1"],
  ["300750.SZ", "CATL", "SZSE", "A\u80a1"],
  ["002594.SZ", "BYD A", "SZSE", "A\u80a1"],
  ["601318.SS", "Ping An A", "SSE", "A\u80a1"],
  ["601398.SS", "ICBC A", "SSE", "A\u80a1"],
  ["600036.SS", "China Merchants Bank", "SSE", "A\u80a1"],
  ["000858.SZ", "Wuliangye", "SZSE", "A\u80a1"],
  ["000333.SZ", "Midea", "SZSE", "A\u80a1"],
  ["002475.SZ", "Luxshare", "SZSE", "A\u80a1"],
  ["300059.SZ", "East Money", "SZSE", "A\u80a1"],
  ["601899.SS", "Zijin Mining", "SSE", "A\u80a1"],
  ["601857.SS", "PetroChina", "SSE", "A\u80a1"],
  ["600938.SS", "CNOOC A", "SSE", "A\u80a1"],
  ["601012.SS", "LONGi", "SSE", "A\u80a1"],
  ["600276.SS", "Hengrui Medicine", "SSE", "A\u80a1"],
  ["300760.SZ", "Mindray", "SZSE", "A\u80a1"],
  ["600030.SS", "CITIC Securities", "SSE", "A\u80a1"],
  ["600887.SS", "Yili", "SSE", "A\u80a1"],
].map(([symbol, name, exchange, region]) => ({ symbol, name, exchange, region, base: 100, volatility: 1.4 }));

const breadthSeries = {
  sp500: createFallbackBreadth("S&P 500", createBreadthSeries(64, 8, 0, 240)),
  csi300: createFallbackBreadth("沪深300", createBreadthSeries(48, 12, 9, 240)),
  weighted: {
    sp500: createFallbackBreadth("S&P 500", createBreadthSeries(62, 9, 5, 240)),
    csi300: createFallbackBreadth("CSI 300", createBreadthSeries(46, 13, 14, 240)),
  },
};

const userWatchlistKey = "marketTracker.watchlist.v1";
const customWatchSymbols = new Set();

const dataMeta = {
  source: "local-fallback",
  generatedAt: null,
  refreshIntervalHours: 4,
};

const state = {
  selectedSymbol: "AAPL",
  range: 240,
  chartWindow: 240,
  showMA: true,
  showRSI: true,
  showOBV: true,
  chartHover: null,
  query: "",
};

const els = {
  stockList: document.querySelector("#stockList"),
  stockSearch: document.querySelector("#stockSearch"),
  addWatchButton: document.querySelector("#addWatchButton"),
  marketClock: document.querySelector("#marketClock"),
  syncStatus: document.querySelector("#syncStatus"),
  overviewStats: document.querySelector("#overviewStats"),
  marketCards: document.querySelector("#marketCards"),
  sp500BreadthChart: document.querySelector("#sp500BreadthChart"),
  csi300BreadthChart: document.querySelector("#csi300BreadthChart"),
  sp500BreadthValue: document.querySelector("#sp500BreadthValue"),
  csi300BreadthValue: document.querySelector("#csi300BreadthValue"),
  sp500BreadthCoverage: document.querySelector("#sp500BreadthCoverage"),
  csi300BreadthCoverage: document.querySelector("#csi300BreadthCoverage"),
  sp500BreadthSamples: document.querySelector("#sp500BreadthSamples"),
  csi300BreadthSamples: document.querySelector("#csi300BreadthSamples"),
  advancers: document.querySelector("#advancers"),
  decliners: document.querySelector("#decliners"),
  avgChange: document.querySelector("#avgChange"),
  signalCount: document.querySelector("#signalCount"),
  selectedExchange: document.querySelector("#selectedExchange"),
  selectedName: document.querySelector("#selectedName"),
  selectedSymbol: document.querySelector("#selectedSymbol"),
  selectedPrice: document.querySelector("#selectedPrice"),
  selectedChange: document.querySelector("#selectedChange"),
  priceChart: document.querySelector("#priceChart"),
  indicatorGrid: document.querySelector("#indicatorGrid"),
  signalList: document.querySelector("#signalList"),
  riskBadge: document.querySelector("#riskBadge"),
  toggleMA: document.querySelector("#toggleMA"),
  toggleRSI: document.querySelector("#toggleRSI"),
  toggleOBV: document.querySelector("#toggleOBV"),
  zoomInButton: document.querySelector("#zoomInButton"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
  zoomResetButton: document.querySelector("#zoomResetButton"),
};

const defaultStockSymbols = new Set(stocks.map((stock) => stock.symbol));

applyMarketSnapshot(window.MARKET_SNAPSHOT);
loadSavedWatchlist();

function enrichInstrument(instrument, seed, length) {
  const history = createHistory(instrument.base, instrument.volatility, seed, length);
  const volumeHistory = createVolumeHistory(seed, length);
  const ohlcv = history.map((close, index) => {
    const open = index === 0 ? close : history[index - 1];
    const spread = Math.max(0.04, Math.abs(close - open) * 0.35);
    return {
      date: null,
      open,
      high: Math.max(open, close) + spread,
      low: Math.min(open, close) - spread,
      close,
      volume: volumeHistory[index] || 0,
    };
  });
  return {
    ...instrument,
    previousClose: history[history.length - 2],
    price: history[history.length - 1],
    history,
    volumeHistory,
    ohlcv,
  };
}

function configureMarketUniverse() {
  const marketUniverse = [
    { code: "SPY", name: "\u7f8e\u56fd", index: "SPY", price: 523.8, region: "\u7f8e\u80a1ETF" },
    { code: "QQQ", name: "\u7f8e\u56fd", index: "QQQ", price: 443.6, region: "\u7f8e\u80a1ETF" },
    { code: "DIA", name: "\u7f8e\u56fd", index: "DIA", price: 390.4, region: "\u7f8e\u80a1ETF" },
    { code: "RUT", name: "\u7f8e\u56fd", index: "\u7f57\u7d202000", price: 2065.8, region: "\u7f8e\u80a1" },
    { code: "SSEC", name: "\u4e2d\u56fd", index: "\u4e0a\u8bc1\u6307\u6570", price: 3138.2, region: "A\u80a1" },
    { code: "CSI300", name: "\u4e2d\u56fd", index: "\u6caa\u6df1300", price: 3658.2, region: "A\u80a1" },
    { code: "CSI500", name: "\u4e2d\u56fd", index: "\u4e2d\u8bc1500", price: 5486.7, region: "A\u80a1" },
    { code: "HSI", name: "\u9999\u6e2f", index: "\u6052\u751f\u6307\u6570", price: 18792.5, region: "\u6e2f\u80a1" },
    { code: "HSTECH", name: "\u9999\u6e2f", index: "\u6052\u751f\u79d1\u6280", price: 3928.4, region: "\u6e2f\u80a1" },
    { code: "N225", name: "\u65e5\u672c", index: "Nikkei 225", price: 38876.5, region: "\u4e9a\u592a" },
    { code: "KOSPI", name: "\u97e9\u56fd", index: "KOSPI", price: 2714.4, region: "\u4e9a\u592a" },
    { code: "ASX200", name: "\u6fb3\u5927\u5229\u4e9a", index: "ASX 200", price: 7824.6, region: "\u4e9a\u592a" },
    { code: "TNX", name: "\u7f8e\u56fd", index: "10\u5e74\u7f8e\u56fd\u56fd\u503a", price: 4.35, region: "\u5229\u7387" },
    { code: "DXY", name: "\u7f8e\u56fd", index: "\u7f8e\u5143\u6307\u6570", price: 105.2, region: "\u5916\u6c47" },
    { code: "EURUSD", name: "\u6b27\u5143", index: "EUR/USD", price: 1.08, region: "\u5916\u6c47", precision: 4 },
    { code: "USDJPY", name: "\u65e5\u5143", index: "USD/JPY", price: 155.2, region: "\u5916\u6c47", precision: 2 },
    { code: "GBPUSD", name: "\u82f1\u9551", index: "GBP/USD", price: 1.27, region: "\u5916\u6c47", precision: 4 },
    { code: "USDCNY", name: "\u4eba\u6c11\u5e01", index: "USD/CNY", price: 7.25, region: "\u5916\u6c47", precision: 4 },
    { code: "AUDUSD", name: "\u6fb3\u5143", index: "AUD/USD", price: 0.66, region: "\u5916\u6c47", precision: 4 },
    { code: "BTC", name: "\u52a0\u5bc6\u8d44\u4ea7", index: "BTC", price: 65000, region: "Crypto" },
    { code: "ETH", name: "\u52a0\u5bc6\u8d44\u4ea7", index: "ETH", price: 3200, region: "Crypto" },
  ];
  const futureUniverse = [
    { code: "GC", name: "\u9ec4\u91d1\u671f\u8d27", index: "COMEX Gold", price: 2368.4, unit: "\u7f8e\u5143/\u76ce\u53f8", volatility: 0.9 },
    { code: "CL", name: "\u539f\u6cb9\u671f\u8d27", index: "WTI Crude", price: 78.35, unit: "\u7f8e\u5143/\u6876", volatility: 1.6 },
    { code: "HG", name: "\u94dc\u671f\u8d27", index: "COMEX Copper", price: 4.62, unit: "\u7f8e\u5143/\u78c5", volatility: 1.2 },
    { code: "SI", name: "\u767d\u94f6\u671f\u8d27", index: "COMEX Silver", price: 29.2, unit: "\u7f8e\u5143/\u76ce\u53f8", volatility: 1.4 },
  ];

  markets.splice(
    0,
    markets.length,
    ...marketUniverse.map((market, index) =>
      enrichInstrument({ ...market, base: market.price, volatility: 0.85 + index * 0.08 }, index + 20, 120),
    ),
  );
  futures.splice(
    0,
    futures.length,
    ...futureUniverse.map((future, index) => enrichInstrument({ ...future, base: future.price }, index + 45, 120)),
  );
}

function configureDefaultStocks() {
  const defaultUniverse = [
    { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 184.25, volatility: 1.35 },
    { symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 421.8, volatility: 1.1 },
    { symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 905.42, volatility: 2.3 },
    { symbol: "AMZN", name: "Amazon", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 185.4, volatility: 1.6 },
    { symbol: "GOOGL", name: "Alphabet", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 171.6, volatility: 1.25 },
    { symbol: "META", name: "Meta Platforms", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 493.2, volatility: 1.8 },
    { symbol: "TSLA", name: "Tesla", exchange: "NASDAQ", region: "\u5317\u7f8e", base: 177.9, volatility: 2.8 },
    { symbol: "0700.HK", name: "Tencent", exchange: "HKEX", region: "\u6e2f\u80a1", base: 382.6, volatility: 1.65 },
    { symbol: "600519.SS", name: "Kweichow Moutai", exchange: "SSE", region: "A\u80a1", base: 1550, volatility: 2.1 },
  ];

  stocks.splice(0, stocks.length, ...defaultUniverse.map((stock, index) => enrichInstrument(stock, index, 280)));
}

function applyMarketSnapshot(snapshot) {
  if (!snapshot || !snapshot.instruments) return;
  dataMeta.source = snapshot.source || "Yahoo Finance";
  dataMeta.generatedAt = snapshot.generatedAt || null;
  dataMeta.refreshIntervalHours = snapshot.refreshIntervalHours || 4;

  hydrateGroup(stocks, snapshot.instruments);
  hydrateGroup(markets, snapshot.instruments);
  hydrateGroup(futures, snapshot.instruments);

  if (snapshot.breadth?.sp500) {
    breadthSeries.sp500 = normalizeBreadthGroup(snapshot.breadth.sp500, "S&P 500");
  }
  if (snapshot.breadth?.csi300) {
    breadthSeries.csi300 = normalizeBreadthGroup(snapshot.breadth.csi300, "沪深300");
  }
  if (snapshot.breadth?.weighted?.sp500) {
    breadthSeries.weighted.sp500 = normalizeBreadthGroup(snapshot.breadth.weighted.sp500, "S&P 500");
  }
  if (snapshot.breadth?.weighted?.csi300) {
    breadthSeries.weighted.csi300 = normalizeBreadthGroup(snapshot.breadth.weighted.csi300, "沪深300");
  }
}

function hydrateGroup(group, snapshotInstruments) {
  group.forEach((instrument) => {
    const incoming = snapshotInstruments[instrument.symbol] || snapshotInstruments[instrument.code];
    if (!incoming?.history?.length) {
      instrument.isSnapshotData = false;
      return;
    }
    instrument.price = incoming.price;
    instrument.previousClose = incoming.previousClose;
    instrument.history = incoming.history;
    instrument.volumeHistory = incoming.volumeHistory?.length
      ? incoming.volumeHistory
      : createVolumeHistory(instrument.symbol?.length || instrument.code?.length || 1, incoming.history.length);
    instrument.ohlcv = incoming.ohlcv?.length ? incoming.ohlcv : buildOhlcvFromHistory(instrument.history, instrument.volumeHistory);
    instrument.sourceSymbol = incoming.sourceSymbol;
    instrument.isProxy = Boolean(incoming.isProxy);
    instrument.proxyNote = incoming.proxyNote || null;
    instrument.lastMarketTime = incoming.lastMarketTime;
    instrument.isSnapshotData = true;
  });
}

function snapshotOnlyMode() {
  return Boolean(dataMeta.generatedAt);
}

function buildOhlcvFromHistory(history, volumes = []) {
  return history.map((close, index) => {
    const open = index === 0 ? close : history[index - 1];
    const spread = Math.max(0.04, Math.abs(close - open) * 0.35);
    return {
      date: null,
      open,
      high: Math.max(open, close) + spread,
      low: Math.min(open, close) - spread,
      close,
      volume: volumes[index] || 0,
    };
  });
}

function createHistory(base, volatility, seed, length) {
  const points = [];
  let price = base * (0.96 + seed * 0.0015);
  for (let i = 0; i < length; i += 1) {
    const wave = Math.sin((i + seed * 9) / 8) * volatility * 0.45;
    const drift = Math.cos((i + seed * 4) / 24) * volatility * 0.18;
    const noise = (pseudoRandom(i + seed * 17) - 0.5) * volatility;
    price = Math.max(0.01, price + wave + drift + noise);
    points.push(Number(price.toFixed(2)));
  }
  return points;
}

function createVolumeHistory(seed, length) {
  const values = [];
  const base = 30 + seed * 3;
  for (let i = 0; i < length; i += 1) {
    const wave = Math.sin((i + seed) / 6) * base * 0.2;
    const noise = pseudoRandom(i + seed * 23) * base * 0.45;
    const spike = i % (19 + (seed % 7)) === 0 ? base * (1.2 + pseudoRandom(seed + i) * 1.1) : 0;
    values.push(Math.round(base + wave + noise + spike));
  }
  return values;
}

function createBreadthSeries(base, swing, seed, length) {
  const values = [];
  for (let i = 0; i < length; i += 1) {
    const wave = Math.sin((i + seed) / 7) * swing;
    const slow = Math.cos((i + seed * 2) / 19) * swing * 0.55;
    const noise = (pseudoRandom(i + seed * 31) - 0.5) * 6;
    values.push(clamp(Number((base + wave + slow + noise).toFixed(1)), 0, 100));
  }
  return values;
}

function createFallbackBreadth(label, values) {
  const series = values.map((value) => ({ value, above: null, effective: null }));
  return {
    label,
    method: "equal_weight_above_ma20",
    coverage: {
      total: 0,
      effective: 0,
      aboveMa20: 0,
      missing: 0,
    },
    series,
    benchmarkSeries: [],
    samples: [],
    missingSamples: [],
  };
}

function normalizeBreadthGroup(input, label) {
  if (Array.isArray(input)) return createFallbackBreadth(label, input);
  return {
    label: input.label || label,
    method: input.method || "equal_weight_above_ma20",
    coverage: input.coverage || {},
    series: (input.series || []).map((point) =>
      typeof point === "number" ? { value: point, above: null, effective: null } : point,
    ),
    benchmarkSeries: input.benchmarkSeries || [],
    samples: input.samples || [],
    missingSamples: input.missingSamples || [],
  };
}

function pseudoRandom(value) {
  const raw = Math.sin(value * 999) * 10000;
  return raw - Math.floor(raw);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 100 ? 2 : 3,
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value > 100 ? 1 : 2,
  }).format(value);
}

function formatMarketPrice(value, instrument) {
  const decimals = Number.isInteger(instrument?.precision) ? instrument.precision : instrument?.isProxy || value < 100 ? 2 : 1;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatChartAxisValue(value, instrument) {
  const decimals = Number.isInteger(instrument?.precision) ? instrument.precision : value < 10 ? 4 : value < 100 ? 2 : 1;
  return value.toFixed(decimals);
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getChange(instrument) {
  return ((instrument.price - instrument.previousClose) / instrument.previousClose) * 100;
}

function getPeriodChange(instrument, days = 7) {
  const compare = instrument.history.at(-days - 1) || instrument.history[0];
  return ((instrument.price - compare) / compare) * 100;
}

function movingAverage(values, windowSize) {
  return values.map((_, index) => {
    if (index < windowSize - 1) return null;
    const slice = values.slice(index - windowSize + 1, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / windowSize;
  });
}

function calculateRSI(values, period = 14) {
  return values.map((_, index) => {
    if (index < period) return null;
    let gains = 0;
    let losses = 0;
    for (let i = index - period + 1; i <= index; i += 1) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      if (diff < 0) losses += Math.abs(diff);
    }
    if (losses === 0) return 100;
    const relativeStrength = gains / period / (losses / period);
    return 100 - 100 / (1 + relativeStrength);
  });
}

function getMASet(values) {
  const last = values.length - 1;
  const ma20Deduction = values.at(-21) || null;
  return {
    ma20: movingAverage(values, 20)[last],
    ma50: movingAverage(values, 50)[last],
    ma60: movingAverage(values, 60)[last],
    ma120: movingAverage(values, 120)[last],
    ma200: movingAverage(values, 200)[last],
    ma20Deduction,
    ma60Deduction: values.at(-61) || null,
    ma120Deduction: values.at(-121) || null,
  };
}

function calculateOBV(prices, volumes) {
  return prices.reduce((obv, price, index) => {
    if (index === 0) return [0];
    const previous = obv[index - 1];
    if (price > prices[index - 1]) return [...obv, previous + volumes[index]];
    if (price < prices[index - 1]) return [...obv, previous - volumes[index]];
    return [...obv, previous];
  }, []);
}

function getVolumeProfile(instrument) {
  const volumes = instrument?.volumeHistory || [];
  const recent = volumes.slice(-126).filter(Number.isFinite);
  const nonZeroCount = recent.filter((value) => value > 0).length;
  const hasVolume = recent.length >= 20 && nonZeroCount >= Math.min(20, recent.length * 0.7);
  if (!hasVolume) return { usable: false, referenceOnly: false, reason: "\u6210\u4ea4\u91cf\u6570\u636e\u4e0d\u8db3" };
  if (instrument?.detailType === "future") return { usable: true, referenceOnly: true, reason: "\u671f\u8d27\u6210\u4ea4\u91cf\u4ec5\u4f5c\u53c2\u8003\u53e3\u5f84" };
  if (instrument?.detailType === "market") {
    const symbol = instrument.symbol || instrument.code;
    const reliableMarketCodes = new Set(["SPY", "QQQ", "DIA", "BTC", "ETH"]);
    if (reliableMarketCodes.has(symbol)) return { usable: true, referenceOnly: false, reason: "ETF/\u52a0\u5bc6\u8d44\u4ea7\u6210\u4ea4\u91cf\u53ef\u7528" };
    return { usable: false, referenceOnly: false, reason: "\u6307\u6570\u6216\u5916\u6c47\u6210\u4ea4\u91cf\u53e3\u5f84\u4e0d\u7a33\u5b9a" };
  }
  return { usable: true, referenceOnly: false, reason: "\u4e2a\u80a1\u6210\u4ea4\u91cf\u53ef\u7528" };
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio));
  return sorted[index];
}

function getBias(price, ma) {
  if (!ma) return null;
  return ((price - ma) / ma) * 100;
}

function relationTextLegacy(subject, base, subjectLabel, baseLabel) {
  if (!subject || !base) return "数据不足";
  const diff = ((subject - base) / base) * 100;
  return `${subjectLabel} ${diff >= 0 ? "高于" : "低于"} ${baseLabel} ${formatPercent(Math.abs(diff))}`;
}

function getRuleAnalysesLegacy(stock, indicators) {
  const price = stock.price;
  const volumeProfile = getVolumeProfile(stock);
  const obv = volumeProfile.usable ? calculateOBV(stock.history, stock.volumeHistory) : [];
  const obvMa = volumeProfile.usable ? movingAverage(obv, 20).at(-1) : null;
  const obvLast = volumeProfile.usable ? obv.at(-1) : null;
  const bias20 = getBias(price, indicators.ma20);
  const rsiValue = indicators.rsi ?? 50;
  const rsiState =
    rsiValue >= 70 ? "RSI 超买，短线追高风险升高。" : rsiValue <= 30 ? "RSI 超卖，可能出现技术修复。" : "RSI 处于中性区，动能没有进入极端状态。";

  return [
    {
      type: price > indicators.ma20 ? "buy" : "sell",
      title: price > indicators.ma20 ? "股价在 MA20 上方" : "股价低于 MA20",
      text: price > indicators.ma20 ? "短期趋势维持强势，回踩 MA20 时可观察承接。" : "短期趋势偏弱，需要重新站回 MA20 才能改善。",
    },
    {
      type: price > indicators.ma20Deduction ? "buy" : "sell",
      title: price > indicators.ma20Deduction ? "MA20 抵扣偏多" : "MA20 抵扣承压",
      text:
        price > indicators.ma20Deduction
          ? "股价高于 MA20 抵扣价，表示均线更容易持续向上。"
          : "股价低于 MA20 抵扣价，表示 MA20 后续可能走平或下弯。",
    },
    {
      type: indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120 ? "buy" : "neutral",
      title: indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120 ? "多头均线排列" : "均线排列未完全多头",
      text:
        indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120
          ? "MA20 高于 MA60，MA60 高于 MA120，趋势结构偏多。"
          : "MA20、MA60、MA120 尚未形成完整多头排列。",
    },
    {
      type: price > indicators.ma200 ? "buy" : "sell",
      title: price > indicators.ma200 ? "长期趋势向好" : "长期趋势承压",
      text: price > indicators.ma200 ? "股价高于 MA200，长期趋势保持向上。" : "股价低于 MA200，长期趋势仍需修复。",
    },
    {
      type: rsiValue >= 70 ? "sell" : rsiValue <= 30 ? "buy" : "neutral",
      title: `RSI ${indicators.rsi ? indicators.rsi.toFixed(1) : "--"}`,
      text: rsiState,
    },
    ...(volumeProfile.usable
      ? [
          {
            type: obvLast > obvMa ? "buy" : "sell",
            title: volumeProfile.referenceOnly ? "OBV 参考口径" : obvLast > obvMa ? "OBV 量能确认" : "OBV 量能背离",
            text: volumeProfile.referenceOnly
              ? `OBV 使用当前成交量口径计算，仅作辅助参考。${obvLast > obvMa ? "当前高于20日均值。" : "当前低于20日均值。"}`
              : obvLast > obvMa
                ? "OBV 高于20日均值，资金流入对价格有确认。"
                : "OBV 低于20日均值，价格上涨的量能确认不足。",
          },
        ]
      : [
          {
            type: "neutral",
            title: "OBV 暂不适用",
            text: volumeProfile.reason,
          },
        ]),
    {
      type: bias20 === null ? "neutral" : Math.abs(bias20) > 8 ? "sell" : bias20 > 0 ? "buy" : "neutral",
      title: `MA20 乖离率 ${bias20 === null ? "--" : formatPercent(bias20)}`,
      text: bias20 === null ? "数据不足。" : Math.abs(bias20) > 8 ? "价格偏离 MA20 过大，短线波动风险上升。" : "价格与 MA20 距离可控，趋势延续性更健康。",
    },
  ];
}

function detectSignals(stock) {
  const prices = stock.history;
  const ma20 = movingAverage(prices, 20);
  const ma60 = movingAverage(prices, 60);
  const ma120 = movingAverage(prices, 120);
  const rsi = calculateRSI(prices);
  const last = prices.length - 1;
  const prev = last - 1;
  const signals = [];

  if (ma20[prev] && ma60[prev] && ma20[last] && ma60[last]) {
    if (ma20[prev] <= ma60[prev] && ma20[last] > ma60[last]) {
      signals.push({
        type: "buy",
        title: "MA20 上穿 MA60",
        text: "中短期趋势开始转强，可继续观察成交与价格确认。",
      });
    }
    if (ma20[prev] >= ma60[prev] && ma20[last] < ma60[last]) {
      signals.push({
        type: "sell",
        title: "MA20 跌破 MA60",
        text: "中短期趋势转弱，需留意回撤延续。",
      });
    }
  }

  if (ma60[last] && ma120[last] && ma60[last] > ma120[last] && prices[last] > ma20[last]) {
    signals.push({
      type: "buy",
      title: "多头均线排列",
      text: "价格位于 MA20 上方，MA60 高于 MA120，趋势结构偏强。",
    });
  }

  if (prices.at(-21) && prices[last] > prices.at(-21)) {
    signals.push({
      type: "buy",
      title: "MA20 抵扣偏多",
      text: "当前价高于 MA20 抵扣价，若价格稳定，MA20 更容易继续上行。",
    });
  }

  if (rsi[last] !== null && rsi[last] >= 70) {
    signals.push({
      type: "sell",
      title: "RSI 超买",
      text: `RSI 已到 ${rsi[last].toFixed(1)}，短线回撤风险升高。`,
    });
  }

  if (rsi[last] !== null && rsi[last] <= 30) {
    signals.push({
      type: "buy",
      title: "RSI 超卖",
      text: `RSI 已到 ${rsi[last].toFixed(1)}，可能出现技术性修复。`,
    });
  }

  if (!signals.length) {
    signals.push({
      type: "neutral",
      title: "未触发强信号",
      text: "MA20/60/120 与 RSI 当前偏中性，等待价格突破或指标进入极值区。",
    });
  }

  return {
    ...getMASet(prices),
    rsi: rsi[last],
    signals,
  };
}

function getSelectedStock() {
  const stock = stocks.find((item) => item.symbol === state.selectedSymbol);
  if (stock) return stock;
  const market = markets.find((item) => item.code === state.selectedSymbol);
  if (market) return normalizeDetailInstrument(market, "market");
  const future = futures.find((item) => item.code === state.selectedSymbol);
  if (future) return normalizeDetailInstrument(future, "future");
  return stocks[0];
}

function normalizeDetailInstrument(instrument, type) {
  return {
    ...instrument,
    symbol: instrument.code,
    name: instrument.index,
    exchange: type === "future" ? instrument.unit : instrument.region,
    detailType: type,
  };
}

function formatDetailValue(value, instrument) {
  if (instrument?.detailType || instrument?.code) return formatMarketPrice(value, instrument);
  return formatCurrency(value);
}

function formatOneDecimalValue(value, instrument) {
  if (!Number.isFinite(value)) return "--";
  if (instrument?.detailType || instrument?.code) return value.toFixed(1);
  return `$${value.toFixed(1)}`;
}

function renderStockListLegacy() {
  const query = state.query.trim().toLowerCase();
  const filtered = stocks.filter((stock) => {
    if (snapshotOnlyMode() && !stock.isSnapshotData) return false;
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query) ||
      stock.exchange.toLowerCase().includes(query)
    );
  });
  updateAddWatchButton();

  els.stockList.innerHTML = filtered
    .map((stock) => {
      const change = getChange(stock);
      const weekChange = getPeriodChange(stock, 7);
      const monthChange = getPeriodChange(stock, 21);
      const activeClass = stock.symbol === state.selectedSymbol ? " is-active" : "";
      return `
        <button class="stock-button${activeClass}" data-symbol="${stock.symbol}">
          <span class="stock-name">
            <strong>${stock.symbol}</strong>
            <span>${stock.name}</span>
          </span>
          <span class="stock-price">
            <strong>${formatCurrency(stock.price)}</strong>
            <span class="${change >= 0 ? "change-up" : "change-down"}">今日 ${formatPercent(change)}</span>
            <span class="${weekChange >= 0 ? "change-up" : "change-down"}">7日 ${formatPercent(weekChange)}</span>
          </span>
          ${
            !customWatchSymbols.has(stock.symbol)
              ? ""
              : `<span class="custom-tag">自选</span><span class="remove-watch" data-remove-symbol="${stock.symbol}" role="button" aria-label="删除${stock.symbol}">删除</span>`
          }
          <span class="mini-charts">
            <canvas class="mini-price" data-chart="${stock.symbol}" width="150" height="54" aria-label="${stock.symbol}近100日走势"></canvas>
            <canvas class="mini-volume" data-volume="${stock.symbol}" width="150" height="54" aria-label="${stock.symbol}近100日成交量"></canvas>
          </span>
        </button>
      `;
    })
    .join("");

  drawStockMiniCharts(filtered);
}

function findCatalogMatch() {
  const query = state.query.trim().toLowerCase();
  if (!query) return null;
  return getSearchableStocks().find((stock) => {
    const inWatchlist = stocks.some((item) => item.symbol === stock.symbol);
    const hasSnapshot = !snapshotOnlyMode() || Boolean(window.MARKET_SNAPSHOT?.instruments?.[stock.symbol]);
    return (
      !inWatchlist &&
      hasSnapshot &&
      (stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query))
    );
  });
}

function getSearchableStocks() {
  const blocked = new Set([...markets.map((item) => item.code), ...futures.map((item) => item.code)]);
  const snapshotItems = Object.entries(window.MARKET_SNAPSHOT?.instruments || {})
    .filter(([symbol]) => !blocked.has(symbol))
    .map(([symbol, instrument]) => ({
      symbol,
      name: instrument.shortName || instrument.longName || symbol,
      exchange: instrument.exchangeName || "Yahoo",
      region: inferRegion(symbol),
      base: instrument.price || 100,
      volatility: 1.4,
    }));
  return [...stockCatalog, ...expandedStockCatalog, ...snapshotItems].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.symbol === item.symbol) === index,
  );
}

function inferRegion(symbol) {
  if (symbol.endsWith(".HK") || symbol.endsWith(".SS") || symbol.endsWith(".SZ")) return "亚太";
  return "北美";
}

function updateAddWatchButton() {
  const match = findCatalogMatch();
  if (!match) {
    els.addWatchButton.textContent = state.query.trim() ? "未找到可添加股票" : "加入自选";
    els.addWatchButton.disabled = true;
    return;
  }
  els.addWatchButton.textContent = `加入 ${match.symbol}`;
  els.addWatchButton.disabled = false;
}

function drawStockMiniCharts(list) {
  list.forEach((stock) => {
    const priceCanvas = els.stockList.querySelector(`[data-chart="${stock.symbol}"]`);
    const volumeCanvas = els.stockList.querySelector(`[data-volume="${stock.symbol}"]`);
    if (priceCanvas) drawMiniLine(priceCanvas, stock.history.slice(-240));
    if (volumeCanvas) drawMiniVolume(volumeCanvas, stock.volumeHistory.slice(-240));
  });
}

function drawMiniLine(canvas, values, color = "#8ee0ad") {
  syncCanvasToDisplaySize(canvas);
  const ctx = canvas.getContext("2d");
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 3;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = pad + ((canvas.width - pad * 2) / (values.length - 1)) * index;
    const y = pad + (canvas.height - pad * 2) - ((value - min) / (max - min || 1)) * (canvas.height - pad * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawMiniVolume(canvas, values) {
  syncCanvasToDisplaySize(canvas);
  const ctx = canvas.getContext("2d");
  const max = Math.max(...values);
  const highVolumeLine = percentile(values, 0.9);
  const barWidth = canvas.width / values.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  values.forEach((value, index) => {
    const height = (value / max) * (canvas.height - 3);
    ctx.fillStyle = value >= highVolumeLine ? "#8ee0ad" : "rgba(255, 250, 240, 0.42)";
    ctx.fillRect(index * barWidth, canvas.height - height, Math.max(1, barWidth - 0.5), height);
  });
}

function renderOverviewLegacy() {
  const changes = stocks.map(getChange);
  const advancers = changes.filter((change) => change >= 0).length;
  const decliners = stocks.length - advancers;
  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const allSignals = stocks.flatMap((stock) => detectSignals(stock).signals.filter((signal) => signal.type !== "neutral"));
  const upRatio = (advancers / stocks.length) * 100;
  const strongTrend = stocks.filter((stock) => stock.price > (getMASet(stock.history).ma200 || Infinity)).length;
  const highVolume = stocks.filter((stock) => stock.volumeHistory.at(-1) >= percentile(stock.volumeHistory.slice(-126), 0.9)).length;
  const best = [...stocks].sort((a, b) => getChange(b) - getChange(a))[0];
  const worst = [...stocks].sort((a, b) => getChange(a) - getChange(b))[0];

  els.advancers.textContent = advancers;
  els.decliners.textContent = decliners;
  els.avgChange.textContent = formatPercent(avgChange);
  els.avgChange.className = avgChange >= 0 ? "change-up" : "change-down";
  els.signalCount.textContent = allSignals.length;
  els.overviewStats.innerHTML = `
    ${metricBlock("上涨股票", advancers)}
    ${metricBlock("下跌股票", decliners)}
    ${metricBlock("上涨占比", `${upRatio.toFixed(0)}%`, upRatio >= 50)}
    ${metricBlock("平均涨跌幅", formatPercent(avgChange), avgChange >= 0)}
    ${metricBlock("MA200上方", `${strongTrend}/${stocks.length}`, strongTrend >= stocks.length / 2)}
    ${metricBlock("异常放量", highVolume, highVolume > 0)}
    ${metricBlock("最强", `${best.symbol} ${formatPercent(getChange(best))}`, getChange(best) >= 0)}
    ${metricBlock("最弱", `${worst.symbol} ${formatPercent(getChange(worst))}`, getChange(worst) >= 0)}
    ${metricBlock("活跃信号", allSignals.length)}
  `;

  renderMarketCards();
  drawBreadthChart();
}

function metricBlockLegacy(label, value, positive = null) {
  const className = positive === null ? "" : positive ? "change-up" : "change-down";
  return `
    <div class="metric-block">
      <span>${label}</span>
      <strong class="${className}">${value}</strong>
    </div>
  `;
}

function renderMarketCardsLegacy() {
  const marketCards = markets
    .filter((market) => !snapshotOnlyMode() || market.isSnapshotData)
    .map((market) =>
      createMarketCard({
        eyebrow: market.name,
        title: market.index,
        price: formatMarketPrice(market.price, market),
        change: getChange(market),
        weekChange: getPeriodChange(market, 7),
        meta: market.isProxy ? `${market.region} · ETF代理 ${market.sourceSymbol}` : market.region,
        history: market.history,
        chartKey: market.code,
      }),
    )
    .join("");

  const futureCards = futures
    .filter((future) => !snapshotOnlyMode() || future.isSnapshotData)
    .map((future) =>
      createMarketCard({
        eyebrow: future.name,
        title: future.index,
        price: formatMarketPrice(future.price, future),
        change: getChange(future),
        weekChange: getPeriodChange(future, 7),
        meta: future.unit,
        isFuture: true,
        history: future.history,
        chartKey: future.code,
      }),
    )
    .join("");

  els.marketCards.innerHTML = `${marketCards}${futureCards}`;
}

function createMarketCardLegacy({ eyebrow, title, price, change, weekChange, monthChange, meta, history, chartKey, isFuture = false }) {
  const chartId = `market-${chartKey}`;
  queueMicrotask(() => {
    const canvas = document.querySelector(`[data-market-chart="${chartId}"]`);
    if (canvas && history?.length) drawMiniLine(canvas, history.slice(-126), isFuture ? "#c27a1a" : "#057b77");
  });
  return `
    <article class="market-card ${isFuture ? "future-card" : ""}${state.selectedSymbol === chartKey ? " is-active" : ""}" data-detail-symbol="${chartKey}" role="button" tabindex="0">
      <div>
        <span class="market-label">${eyebrow}</span>
        <strong>${title}</strong>
        <em>${meta}</em>
        <canvas class="market-sparkline" data-market-chart="${chartId}" width="180" height="34" aria-label="${title}近6个月趋势"></canvas>
      </div>
      <div class="market-values">
        <strong>${price}</strong>
        <span class="${change >= 0 ? "change-up" : "change-down"}">今日 ${formatPercent(change)}</span>
        <span class="${weekChange >= 0 ? "change-up" : "change-down"}">7日 ${formatPercent(weekChange)}</span>
      </div>
    </article>
  `;
}

function drawBreadthChartLegacy() {
  drawSingleBreadthChart(els.sp500BreadthChart, breadthSeries.sp500, "#057b77");
  drawSingleBreadthChart(els.csi300BreadthChart, breadthSeries.csi300, "#c27a1a");
  els.sp500BreadthValue.textContent = `${breadthSeries.sp500.at(-1).toFixed(1)}%`;
  els.csi300BreadthValue.textContent = `${breadthSeries.csi300.at(-1).toFixed(1)}%`;
}

function drawSingleBreadthChartLegacy(canvas, values, color) {
  const ctx = canvas.getContext("2d");
  const pad = { left: 42, right: 16, top: 18, bottom: 28 };
  const width = canvas.width - pad.left - pad.right;
  const height = canvas.height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(22, 138, 84, 0.055)";
  ctx.fillRect(pad.left, pad.top, width, height * 0.2);
  ctx.fillStyle = "rgba(200, 76, 60, 0.055)";
  ctx.fillRect(pad.left, pad.top + height * 0.8, width, height * 0.2);

  ctx.strokeStyle = "#e6dccb";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6d7474";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "right";
  [0, 25, 50, 75, 100].forEach((level) => {
    const y = pad.top + height - (level / 100) * height;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(canvas.width - pad.right, y);
    ctx.stroke();
    ctx.fillText(String(level), pad.left - 10, y + 4);
  });

  drawLine(ctx, values, 0, 100, pad, width, height, color, 3);
  ctx.textAlign = "left";
  ctx.font = "900 12px Inter, sans-serif";
  ctx.fillStyle = "#168a54";
  ctx.fillText(">80 极热", pad.left + 6, pad.top + 15);
  ctx.fillStyle = "#c84c3c";
  ctx.fillText("<20 极冷", pad.left + 6, pad.top + height - 6);
}

function relationText(subject, base, subjectLabel, baseLabel) {
  if (!subject || !base) return "数据不足";
  const diff = ((subject - base) / base) * 100;
  return `${subjectLabel} ${diff >= 0 ? "高于" : "低于"} ${baseLabel} ${formatPercent(Math.abs(diff))}`;
}

function getRuleAnalyses(stock, indicators) {
  const price = stock.price;
  const volumeProfile = getVolumeProfile(stock);
  const obv = volumeProfile.usable ? calculateOBV(stock.history, stock.volumeHistory) : [];
  const obvMa = volumeProfile.usable ? movingAverage(obv, 20).at(-1) : null;
  const obvLast = volumeProfile.usable ? obv.at(-1) : null;
  const bias20 = getBias(price, indicators.ma20);
  const rsiValue = indicators.rsi ?? 50;
  const deductionGap = indicators.ma20Deduction ? getBias(price, indicators.ma20Deduction) : null;

  return [
    {
      type: price > indicators.ma20 ? "buy" : "sell",
      title: price > indicators.ma20 ? "股价在 MA20 上方" : "股价低于 MA20",
      text: price > indicators.ma20 ? "短期趋势维持强势，回踩 MA20 时可观察承接。" : "短期趋势偏弱，需要重新站回 MA20 才能改善。",
    },
    {
      type: deductionGap === null ? "neutral" : deductionGap >= 0 ? "buy" : "sell",
      title: deductionGap === null ? "MA20 抵扣数据不足" : deductionGap >= 0 ? "MA20 抵扣偏多" : "MA20 抵扣承压",
      text:
        deductionGap === null
          ? "历史 K 线不足，暂时无法判断 MA20 后续运行方向。"
          : deductionGap >= 0
            ? "当前价高于 MA20 抵扣价，若价格稳定，MA20 更容易继续上行。"
            : "当前价低于 MA20 抵扣价，MA20 后续可能走平或下弯。",
    },
    {
      type: indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120 ? "buy" : "neutral",
      title: indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120 ? "多头均线排列" : "均线排列未完全多头",
      text:
        indicators.ma20 > indicators.ma60 && indicators.ma60 > indicators.ma120
          ? "MA20 高于 MA60，MA60 高于 MA120，趋势结构偏多。"
          : "MA20、MA60、MA120 尚未形成完整多头排列。",
    },
    {
      type: price > indicators.ma200 ? "buy" : "sell",
      title: price > indicators.ma200 ? "长期趋势向好" : "长期趋势承压",
      text: price > indicators.ma200 ? "股价高于 MA200，长期趋势保持向上。" : "股价低于 MA200，长期趋势仍需修复。",
    },
    {
      type: rsiValue >= 70 ? "sell" : rsiValue <= 30 ? "buy" : "neutral",
      title: `RSI ${indicators.rsi ? indicators.rsi.toFixed(1) : "--"}`,
      text: rsiValue >= 70 ? "RSI 超买，短线追高风险升高。" : rsiValue <= 30 ? "RSI 超卖，可能出现技术修复。" : "RSI 处于中性区，动能没有进入极端状态。",
    },
    ...(volumeProfile.usable
      ? [
          {
            type: obvLast > obvMa ? "buy" : "sell",
            title: volumeProfile.referenceOnly ? "OBV 参考口径" : obvLast > obvMa ? "OBV 量能确认" : "OBV 量能背离",
            text: volumeProfile.referenceOnly
              ? `OBV 使用当前成交量口径计算，仅作辅助参考。${obvLast > obvMa ? "当前高于20日均值。" : "当前低于20日均值。"}`
              : obvLast > obvMa
                ? "OBV 高于20日均值，资金流入对价格有确认。"
                : "OBV 低于20日均值，价格上涨的量能确认不足。",
          },
        ]
      : [
          {
            type: "neutral",
            title: "OBV 暂不适用",
            text: volumeProfile.reason,
          },
        ]),
    {
      type: bias20 === null ? "neutral" : Math.abs(bias20) > 8 ? "sell" : bias20 > 0 ? "buy" : "neutral",
      title: `MA20 乖离率 ${bias20 === null ? "--" : formatPercent(bias20)}`,
      text: bias20 === null ? "数据不足。" : Math.abs(bias20) > 8 ? "价格偏离 MA20 过大，短线波动风险上升。" : "价格与 MA20 距离可控，趋势延续性更健康。",
    },
  ];
}

function drawVolumeUnavailableNote(ctx, reason, left, y) {
  ctx.fillStyle = "rgba(109, 116, 116, 0.78)";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`OBV 暂不适用：${reason}`, left, y);
}

function renderDetailsLegacy() {
  const stock = getSelectedStock();
  const change = getChange(stock);
  const indicators = detectSignals(stock);
  const analyses = getRuleAnalyses(stock, indicators);
  const riskType = analyses.some((signal) => signal.type === "sell")
    ? "sell"
    : analyses.some((signal) => signal.type === "buy")
      ? "buy"
      : "neutral";

  els.selectedExchange.textContent = stock.exchange;
  els.selectedName.textContent = stock.name;
  els.selectedSymbol.textContent = stock.symbol;
  els.selectedPrice.textContent = formatDetailValue(stock.price, stock);
  els.selectedChange.textContent = formatPercent(change);
  els.selectedChange.className = change >= 0 ? "change-up" : "change-down";
  els.riskBadge.textContent = riskType === "buy" ? "偏多" : riskType === "sell" ? "风险" : "中性";
  els.riskBadge.className = `risk-badge ${riskType}`;

  els.indicatorGrid.innerHTML = [
    ["MA20", indicators.ma20, relationText(stock.price, indicators.ma20, "当前价", "MA20")],
    ["MA60", indicators.ma60, relationText(indicators.ma60, indicators.ma20, "MA60", "MA20")],
    ["MA120", indicators.ma120, relationText(indicators.ma120, indicators.ma50, "MA120", "MA50")],
    ["MA200", indicators.ma200, relationText(indicators.ma200, stock.price, "MA200", "当前价")],
  ]
    .map(([label, value, relation]) => `
      <div class="indicator-card">
        <span>${label}</span>
        <strong>${value ? formatDetailValue(value, stock) : "--"}</strong>
        <em class="${relation.includes("高于") ? "change-up" : "change-down"}">${relation}</em>
      </div>
    `)
    .join("");

  const deductionGap = indicators.ma20Deduction
    ? ((stock.price - indicators.ma20Deduction) / indicators.ma20Deduction) * 100
    : null;
  els.indicatorGrid.insertAdjacentHTML(
    "beforeend",
    `
      <div class="indicator-card wide">
        <span>MA20 抵扣价</span>
        <strong>${indicators.ma20Deduction ? formatDetailValue(indicators.ma20Deduction, stock) : "--"}</strong>
        <em class="${deductionGap === null || deductionGap >= 0 ? "change-up" : "change-down"}">
          ${deductionGap === null ? "数据不足" : `当前价 ${deductionGap >= 0 ? "高于" : "低于"} ${formatPercent(Math.abs(deductionGap))}`}
        </em>
      </div>
    `,
  );

  els.signalList.innerHTML = `
    <div class="analysis-title">固定规则分析结果</div>
    ${analyses
      .map((signal) => `
      <div class="signal-item ${signal.type}">
        <strong>${signal.title}</strong>
        <p>${signal.text}</p>
      </div>
    `)
      .join("")}
    <div class="rule-note">
      <strong>规则备注</strong>
      <p>以上判断由固定指标规则生成：价格相对 MA20、MA20 抵扣价、MA20/MA60/MA120 排列、价格相对 MA200、RSI 70/30、OBV 相对20日均值、MA20 乖离率。</p>
    </div>
  `;

  drawPriceChart(stock);
}

function drawPriceChart(stock) {
  const canvas = els.priceChart;
  syncCanvasToDisplaySize(canvas);
  const ctx = canvas.getContext("2d");
  const volumeProfile = getVolumeProfile(stock);
  const shouldShowOBV = state.showOBV && volumeProfile.usable;
  const viewLength = Math.min(state.chartWindow, stock.history.length);
  const prices = stock.history.slice(-viewLength);
  const candles = (stock.ohlcv?.length ? stock.ohlcv : buildOhlcvFromHistory(stock.history, stock.volumeHistory)).slice(-viewLength);
  const ma20 = movingAverage(stock.history, 20).slice(-viewLength);
  const ma60 = movingAverage(stock.history, 60).slice(-viewLength);
  const ma120 = movingAverage(stock.history, 120).slice(-viewLength);
  const ma200 = movingAverage(stock.history, 200).slice(-viewLength);
  const rsi = calculateRSI(stock.history).slice(-viewLength);
  const obv = shouldShowOBV ? calculateOBV(stock.history, stock.volumeHistory).slice(-viewLength) : [];
  const volumes = (stock.volumeHistory || []).slice(-viewLength);
  const allValues = [
    ...prices,
    ...candles.map((row) => row.high).filter(Number.isFinite),
    ...candles.map((row) => row.low).filter(Number.isFinite),
    ...(state.showMA ? ma20.filter(Boolean) : []),
    ...(state.showMA ? ma60.filter(Boolean) : []),
    ...(state.showMA ? ma120.filter(Boolean) : []),
    ...(state.showMA ? ma200.filter(Boolean) : []),
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = Math.max(rawMax - rawMin, Math.abs(rawMax) * 0.02, 1);
  const min = rawMin - range * 0.06;
  const max = rawMax + range * 0.14;
  const panelGap = 18;
  const volumeH = 50;
  const rsiH = state.showRSI ? 48 : 0;
  const obvH = shouldShowOBV ? 40 : state.showOBV ? 18 : 0;
  const lowerPanelsHeight = volumeH + (rsiH ? panelGap + rsiH : 0) + (obvH ? panelGap + obvH : 0);
  const pad = { left: 58, right: 32, top: 44, bottom: lowerPanelsHeight + 34 };
  const chartH = canvas.height - pad.top - pad.bottom;
  const chartW = canvas.width - pad.left - pad.right;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(167, 153, 133, 0.22)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(109, 116, 116, 0.62)";
  ctx.font = "700 12px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (chartH / 4) * i;
    const value = max - ((max - min) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(canvas.width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatChartAxisValue(value, stock), pad.left - 10, y + 4);
  }

  drawCandles(ctx, candles, min, max, pad, chartW, chartH);
  if (state.showMA) {
    drawLine(ctx, ma20, min, max, pad, chartW, chartH, "#3268a8", 2);
    drawLine(ctx, ma60, min, max, pad, chartW, chartH, "#c27a1a", 2);
    drawLine(ctx, ma120, min, max, pad, chartW, chartH, "#6a4fb0", 2);
    drawLine(ctx, ma200, min, max, pad, chartW, chartH, "#6d7474", 2);
  }

  const lastPrice = prices[prices.length - 1];
  const lastY = scaleY(lastPrice, min, max, pad.top, chartH);
  ctx.strokeStyle = "rgba(200, 76, 60, 0.44)";
  ctx.lineWidth = 1.15;
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.moveTo(pad.left, lastY);
  ctx.lineTo(canvas.width - pad.right, lastY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawCurrentPriceLabel(ctx, lastPrice, lastY, pad, chartH, stock);

  ctx.fillStyle = "#1f2426";
  ctx.textAlign = "left";
  ctx.font = "900 13px Inter, sans-serif";
  ctx.fillText("Price", pad.left, 22);
  if (state.showMA) {
    const legends = [
      ["MA20", "#3268a8", 62],
      ["MA60", "#c27a1a", 118],
      ["MA120", "#6a4fb0", 174],
      ["MA200", "#6d7474", 238],
    ];
    legends.forEach(([label, color, x]) => {
      ctx.fillStyle = color;
      ctx.fillText(label, pad.left + x, 22);
    });
  }

  drawDeductionLines(ctx, [
    { period: 20, value: stock.history.at(-21), color: "rgba(31, 36, 38, 0.58)" },
    { period: 60, value: stock.history.at(-61), color: "rgba(31, 36, 38, 0.48)" },
    { period: 120, value: stock.history.at(-121), color: "rgba(31, 36, 38, 0.4)" },
  ], prices.length, pad, chartW, chartH, stock);

  drawPriceHover(ctx, stock, prices, min, max, pad, chartW, chartH);

  let panelTop = pad.top + chartH + 24;
  drawVolumePanel(ctx, volumes, volumeProfile, pad.left, panelTop, chartW, volumeH);
  panelTop += volumeH + panelGap;

  if (state.showRSI) {
    drawRsiPanel(ctx, rsi, pad.left, panelTop, chartW);
    panelTop += rsiH + panelGap;
  }

  if (shouldShowOBV) {
    drawObvPanel(ctx, obv, pad.left, panelTop, chartW, volumeProfile.referenceOnly);
  } else if (state.showOBV) {
    drawVolumeUnavailableNote(ctx, volumeProfile.reason, pad.left, panelTop + 12);
  }
}

function drawCandles(ctx, candles, min, max, pad, chartW, chartH) {
  if (!candles.length) return;
  const denominator = Math.max(1, candles.length - 1);
  const candleW = Math.max(2, (chartW / candles.length) * 0.58);
  candles.forEach((row, index) => {
    const open = Number.isFinite(row.open) ? row.open : row.close;
    const close = row.close;
    const high = Number.isFinite(row.high) ? row.high : Math.max(open, close);
    const low = Number.isFinite(row.low) ? row.low : Math.min(open, close);
    if (!Number.isFinite(close)) return;
    const x = pad.left + (chartW / denominator) * index;
    const openY = scaleY(open, min, max, pad.top, chartH);
    const closeY = scaleY(close, min, max, pad.top, chartH);
    const highY = scaleY(high, min, max, pad.top, chartH);
    const lowY = scaleY(low, min, max, pad.top, chartH);
    const up = close >= open;

    ctx.strokeStyle = up ? "#168a54" : "#c84c3c";
    ctx.fillStyle = up ? "rgba(22, 138, 84, 0.62)" : "rgba(200, 76, 60, 0.62)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();
    ctx.fillRect(x - candleW / 2, Math.min(openY, closeY), candleW, Math.max(1, Math.abs(openY - closeY)));
  });
}

function drawCurrentPriceLabel(ctx, price, y, pad, chartH, instrument) {
  if (!Number.isFinite(price)) return;
  const label = formatOneDecimalValue(price, instrument);
  const labelW = Math.max(46, Math.ceil(ctx.measureText(label).width) + 14);
  const labelH = 20;
  const labelX = Math.max(4, pad.left - labelW - 8);
  const labelY = clamp(y - labelH / 2, pad.top + 2, pad.top + chartH - labelH - 2);

  ctx.save();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255, 253, 247, 0.94)";
  ctx.strokeStyle = "rgba(200, 76, 60, 0.42)";
  ctx.lineWidth = 1;
  ctx.fillRect(labelX, labelY, labelW, labelH);
  ctx.strokeRect(labelX, labelY, labelW, labelH);
  ctx.fillStyle = "rgba(200, 76, 60, 0.78)";
  ctx.font = "800 11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, labelX + labelW / 2, labelY + 14);
  ctx.restore();
}

function drawDeductionLines(ctx, lines, length, pad, chartW, chartH, instrument) {
  ctx.font = "800 11px Inter, sans-serif";
  const visibleLines = lines
    .filter((line) => Number.isFinite(line.value) && length > line.period)
    .map((line) => {
      const index = Math.max(0, length - line.period - 1);
      const x = pad.left + (chartW / Math.max(1, length - 1)) * index;
      const label = formatOneDecimalValue(line.value, instrument);
      const width = Math.ceil(ctx.measureText(label).width) + 8;
      return { ...line, x, label, width };
    });

  visibleLines.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 1.35;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(line.x, pad.top);
    ctx.lineTo(line.x, pad.top + chartH);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  const labelY = 22;
  const minGap = 8;
  const labels = visibleLines
    .map((line) => ({
      ...line,
      labelX: clamp(line.x - line.width / 2, pad.left, pad.left + chartW - line.width),
    }))
    .sort((a, b) => a.labelX - b.labelX);

  for (let i = 1; i < labels.length; i += 1) {
    const previousRight = labels[i - 1].labelX + labels[i - 1].width + minGap;
    if (labels[i].labelX < previousRight) labels[i].labelX = previousRight;
  }
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    labels[i].labelX = Math.min(labels[i].labelX, pad.left + chartW - labels[i].width);
    if (i > 0 && labels[i - 1].labelX + labels[i - 1].width + minGap > labels[i].labelX) {
      labels[i - 1].labelX = labels[i].labelX - labels[i - 1].width - minGap;
    }
  }

  labels.forEach((line) => {
    ctx.fillStyle = line.color;
    ctx.font = "800 11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(line.label, Math.max(pad.left, line.labelX + 4), labelY);
  });
}

function drawPriceHover(ctx, stock, prices, min, max, pad, chartW, chartH) {
  const hover = state.chartHover;
  if (!hover) return;
  if (hover.x < pad.left || hover.x > pad.left + chartW || hover.y < pad.top || hover.y > pad.top + chartH) return;

  const index = clamp(Math.round(((hover.x - pad.left) / chartW) * (prices.length - 1)), 0, prices.length - 1);
  const close = prices[index];
  const x = pad.left + (chartW / Math.max(1, prices.length - 1)) * index;

  ctx.save();
  ctx.strokeStyle = "rgba(31, 36, 38, 0.38)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, hover.y);
  ctx.lineTo(pad.left + chartW, hover.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, pad.top);
  ctx.lineTo(x, pad.top + chartH);
  ctx.stroke();
  ctx.setLineDash([]);

  const label = formatOneDecimalValue(close, stock);
  const labelW = 54;
  const labelX = 2;
  const labelY = clamp(hover.y - 12, pad.top + 14, pad.top + chartH - 10);
  ctx.fillStyle = "rgba(255, 253, 247, 0.92)";
  ctx.strokeStyle = "rgba(109, 116, 116, 0.28)";
  ctx.lineWidth = 1;
  ctx.fillRect(labelX, labelY - 14, labelW, 22);
  ctx.strokeRect(labelX, labelY - 14, labelW, 22);
  ctx.fillStyle = "rgba(31, 36, 38, 0.82)";
  ctx.font = "800 11px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, labelX + 7, labelY + 1);
  ctx.restore();
}

function drawVolumePanel(ctx, values, volumeProfile, left, top, chartW, height) {
  ctx.strokeStyle = "rgba(167, 153, 133, 0.16)";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + chartW, top);
  ctx.moveTo(left, top + height);
  ctx.lineTo(left + chartW, top + height);
  ctx.stroke();
  ctx.fillStyle = "rgba(109, 116, 116, 0.78)";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Volume", left, top - 8);

  const usableValues = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!volumeProfile.usable || usableValues.length < 10) {
    ctx.fillStyle = "rgba(109, 116, 116, 0.72)";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.fillText(`Volume 暂不适用：${volumeProfile.reason}`, left + 8, top + height / 2 + 4);
    return;
  }

  const max = Math.max(...usableValues);
  const highVolumeLine = percentile(usableValues, 0.8);
  const barWidth = Math.max(1, chartW / values.length);
  values.forEach((value, index) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const barH = Math.max(1, (value / max) * (height - 8));
    const x = left + index * barWidth;
    const y = top + height - barH;
    ctx.fillStyle = value >= highVolumeLine ? "rgba(80, 178, 128, 0.48)" : "rgba(109, 116, 116, 0.26)";
    ctx.fillRect(x, y, Math.max(1, barWidth * 0.68), barH);
  });
}

function drawLine(ctx, values, min, max, pad, chartW, chartH, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  values.forEach((value, index) => {
    if (value === null || value === undefined) return;
    const x = pad.left + (chartW / (values.length - 1)) * index;
    const y = scaleY(value, min, max, pad.top, chartH);
    if (index === 0 || values[index - 1] === null) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function scaleY(value, min, max, top, height) {
  if (max === min) return top + height / 2;
  return top + height - ((value - min) / (max - min)) * height;
}

function drawRsiPanel(ctx, values, left, top, chartW) {
  const height = 48;
  ctx.fillStyle = "#f7f1e6";
  ctx.fillRect(left, top, chartW, height);
  ctx.strokeStyle = "#e0d5c5";
  ctx.strokeRect(left, top, chartW, height);

  [30, 70].forEach((level) => {
    const y = top + height - (level / 100) * height;
    ctx.strokeStyle = level === 70 ? "#c84c3c" : "#168a54";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  drawLine(ctx, values, 0, 100, { left, top }, chartW, height, "#6a4fb0", 2);
  ctx.fillStyle = "#6d7474";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("RSI", left, top - 8);
}

function drawObvPanel(ctx, values, left, top, chartW, referenceOnly = false) {
  const height = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const obvMa20 = movingAverage(values, 20);
  ctx.fillStyle = "#f7f1e6";
  ctx.fillRect(left, top, chartW, height);
  ctx.strokeStyle = "#e0d5c5";
  ctx.strokeRect(left, top, chartW, height);
  drawLine(ctx, values, min, max, { left, top }, chartW, height, "#057b77", 2);
  drawLine(ctx, obvMa20, min, max, { left, top }, chartW, height, "rgba(5, 123, 119, 0.34)", 2);
  ctx.fillStyle = "#6d7474";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(referenceOnly ? "OBV 参考" : "OBV", left, top - 8);
}

function drawVolumeUnavailableNote(ctx, reason, left, y) {
  ctx.fillStyle = "rgba(109, 116, 116, 0.78)";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`OBV 暂不适用：${reason}`, left, y);
}

function renderDetails() {
  const stock = getSelectedStock();
  const change = getChange(stock);
  const indicators = detectSignals(stock);
  const analyses = getRuleAnalyses(stock, indicators);
  const riskType = analyses.some((signal) => signal.type === "sell")
    ? "sell"
    : analyses.some((signal) => signal.type === "buy")
      ? "buy"
      : "neutral";

  els.selectedExchange.textContent = stock.exchange;
  els.selectedName.textContent = stock.name;
  els.selectedSymbol.textContent = stock.symbol;
  els.selectedPrice.textContent = formatDetailValue(stock.price, stock);
  els.selectedChange.textContent = formatPercent(change);
  els.selectedChange.className = change >= 0 ? "change-up" : "change-down";
  els.riskBadge.textContent = riskType === "buy" ? "偏多" : riskType === "sell" ? "风险" : "中性";
  els.riskBadge.className = `risk-badge ${riskType}`;

  els.indicatorGrid.innerHTML = [
    ["MA20", indicators.ma20, relationText(stock.price, indicators.ma20, "当前价", "MA20")],
    ["MA60", indicators.ma60, relationText(indicators.ma60, indicators.ma20, "MA60", "MA20")],
    ["MA120", indicators.ma120, relationText(indicators.ma120, indicators.ma50, "MA120", "MA50")],
    ["MA200", indicators.ma200, relationText(indicators.ma200, stock.price, "MA200", "当前价")],
  ]
    .map(([label, value, relation]) => `
      <div class="indicator-card">
        <span>${label}</span>
        <strong>${value ? formatDetailValue(value, stock) : "--"}</strong>
        <em class="${relation.includes("高于") ? "change-up" : "change-down"}">${relation}</em>
      </div>
    `)
    .join("");

  const deductionGap = indicators.ma20Deduction
    ? ((stock.price - indicators.ma20Deduction) / indicators.ma20Deduction) * 100
    : null;
  els.indicatorGrid.insertAdjacentHTML(
    "beforeend",
    `
      <div class="indicator-card wide">
        <span>MA20 抵扣价</span>
        <strong>${indicators.ma20Deduction ? formatDetailValue(indicators.ma20Deduction, stock) : "--"}</strong>
        <em class="${deductionGap === null || deductionGap >= 0 ? "change-up" : "change-down"}">
          ${deductionGap === null ? "数据不足" : `当前价 ${deductionGap >= 0 ? "高于" : "低于"} ${formatPercent(Math.abs(deductionGap))}`}
        </em>
      </div>
    `,
  );

  els.signalList.innerHTML = `
    <div class="analysis-title">固定规则分析结果</div>
    ${analyses
      .map((signal) => `
      <div class="signal-item ${signal.type}">
        <strong>${signal.title}</strong>
        <p>${signal.text}</p>
      </div>
    `)
      .join("")}
    <div class="rule-note">
      <strong>规则备注</strong>
      <p>以上判断由固定指标规则生成：价格相对 MA20、MA20 抵扣价、MA20/MA60/MA120 排列、价格相对 MA200、RSI 70/30、OBV 相对20日均值、MA20 乖离率。</p>
    </div>
  `;

  drawPriceChart(stock);
}

function drawVolumeUnavailableNote(ctx, reason, left, y) {
  ctx.fillStyle = "rgba(109, 116, 116, 0.78)";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`OBV 暂不适用：${reason}`, left, y);
}

function tickInstrument(instrument, index, scale = 1) {
  const last = instrument.history[instrument.history.length - 1];
  const direction = Math.sin(Date.now() / 2500 + index) * instrument.volatility * 0.11 * scale;
  const random = (Math.random() - 0.48) * instrument.volatility * 0.22 * scale;
  const next = Math.max(0.01, last + direction + random);
  const lastVolume = instrument.volumeHistory.at(-1) || 50;
  const volumeSpike = Math.abs(random) > instrument.volatility * 0.09 * scale ? lastVolume * 1.55 : 0;
  const nextVolume = Math.max(1, Math.round(lastVolume * (0.88 + Math.random() * 0.24) + volumeSpike));
  instrument.previousClose = instrument.history[instrument.history.length - 2];
  instrument.price = Number(next.toFixed(2));
  instrument.history.push(instrument.price);
  instrument.volumeHistory.push(nextVolume);
  if (instrument.history.length > 300) instrument.history.shift();
  if (instrument.volumeHistory.length > 300) instrument.volumeHistory.shift();
}

function tickPrices() {
  stocks.forEach((stock, index) => tickInstrument(stock, index));
  markets.forEach((market, index) => tickInstrument(market, index + 40, 8));
  futures.forEach((future, index) => tickInstrument(future, index + 80, future.price > 100 ? 2.5 : 0.08));

  pushBreadthTick(breadthSeries.sp500, (Math.random() - 0.48) * 4);
  pushBreadthTick(breadthSeries.csi300, (Math.random() - 0.5) * 4.5);
}

function pushBreadthTick(group, delta) {
  const values = getBreadthValues(group);
  const next = clamp((values.at(-1) || 50) + delta, 0, 100);
  group.series.push({ value: next, above: null, effective: null });
  if (group.series.length > 240) group.series.shift();
}

function renderAll() {
  ensureStaticCopy();
  const nowText = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
  const syncTime = dataMeta.generatedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dataMeta.generatedAt))
    : nowText;
  els.marketClock.textContent = nowText;
  els.syncStatus.textContent = `上次同步 ${syncTime}`;
  renderStockList();
  renderOverview();
  renderDetails();
}

function createMarketCard({ eyebrow, title, price, change, weekChange, monthChange, meta, history, chartKey, isFuture = false }) {
  const chartId = `market-${chartKey}`;
  const resolvedMonthChange = Number.isFinite(monthChange) ? monthChange : getSeriesChange(history, 21);
  queueMicrotask(() => {
    const canvas = document.querySelector(`[data-market-chart="${chartId}"]`);
    if (canvas && history?.length) drawMiniLine(canvas, history.slice(-240), "#057b77");
  });
  return `
    <article class="market-card ${isFuture ? "future-card" : ""}${state.selectedSymbol === chartKey ? " is-active" : ""}" data-detail-symbol="${chartKey}" role="button" tabindex="0">
      <div>
        <span class="market-label">${eyebrow}</span>
        <strong>${title}</strong>
        <em>${meta}</em>
        <canvas class="market-sparkline" data-market-chart="${chartId}" width="180" height="34" aria-label="${title}\u8fd11\u5e74\u8d8b\u52bf"></canvas>
      </div>
      <div class="market-values">
        <strong>${price}</strong>
        <span class="${change >= 0 ? "change-up" : "change-down"}">\u4eca\u65e5 ${formatPercent(change)}</span>
        <span class="${weekChange >= 0 ? "change-up" : "change-down"}">7\u65e5 ${formatPercent(weekChange)}</span>
        <span class="${resolvedMonthChange >= 0 ? "change-up" : "change-down"}">1\u6708 ${formatPercent(resolvedMonthChange)}</span>
      </div>
    </article>
  `;
}

function getSeriesChange(history, days) {
  if (!Array.isArray(history) || history.length < 2) return 0;
  const latest = history.at(-1);
  const compare = history.at(-days - 1) ?? history[0];
  return Number.isFinite(latest) && Number.isFinite(compare) && compare ? ((latest - compare) / compare) * 100 : 0;
}

function ensureStaticCopyLegacy() {
  const notes = document.querySelector(".data-note-grid");
  if (notes && !notes.dataset.updated) {
    notes.dataset.updated = "true";
    notes.innerHTML = `
      <div class="data-note">
        <strong>股票与自选</strong>
        <p>Yahoo Finance 日线 OHLCV，快照拉取近2年历史；详情主图默认展示近一年并支持缩放，侧边迷你图展示近6个月。</p>
      </div>
      <div class="data-note">
        <strong>国家、期货与资产</strong>
        <p>指数优先取 Yahoo 指数本体，缺失时切换主流 ETF 代理；黄金、原油、铜、10年美债、美元指数、BTC、ETH 统一进入4小时静态快照。</p>
      </div>
      <div class="data-note">
        <strong>技术指标</strong>
        <p>MA20/50/60/120/200、RSI、OBV、乖离率使用完整快照历史计算，显示窗口缩放不会截断指标计算。</p>
      </div>
      <div class="data-note">
        <strong>市场宽度</strong>
        <p>S&P 500 与沪深300采用完整成分股等权计算，每只股票1票；近一年交易日约240个点，缺失行情不模拟并从有效分母排除。</p>
      </div>
      <div class="data-note">
        <strong>刷新粒度</strong>
        <p>当前为4小时静态快照。前端只读取生成好的快照文件，不在浏览器内批量请求成分股行情。</p>
      </div>
    `;
  }
}

els.stockList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-watch");
  if (removeButton) {
    event.stopPropagation();
    removeWatchSymbol(removeButton.dataset.removeSymbol);
    return;
  }
  const button = event.target.closest(".stock-button");
  if (!button) return;
  state.selectedSymbol = button.dataset.symbol;
  renderAll();
});

els.marketCards.addEventListener("click", (event) => {
  const card = event.target.closest("[data-detail-symbol]");
  if (!card) return;
  state.selectedSymbol = card.dataset.detailSymbol;
  state.chartWindow = 240;
  renderAll();
});

els.marketCards.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-detail-symbol]");
  if (!card) return;
  event.preventDefault();
  state.selectedSymbol = card.dataset.detailSymbol;
  state.chartWindow = 240;
  renderAll();
});

function removeWatchSymbol(symbol) {
  if (!customWatchSymbols.has(symbol) || defaultStockSymbols.has(symbol)) return;
  const index = stocks.findIndex((stock) => stock.symbol === symbol);
  if (index === -1) return;
  stocks.splice(index, 1);
  customWatchSymbols.delete(symbol);
  saveCustomWatchlist();
  if (state.selectedSymbol === symbol) {
    state.selectedSymbol = stocks[0]?.symbol || "";
  }
  renderAll();
}

els.stockSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderStockList();
});

function loadSavedWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(userWatchlistKey) || "[]");
    saved.forEach((symbol) => addWatchSymbol(symbol, { persist: false }));
  } catch {
    localStorage.removeItem(userWatchlistKey);
  }
}

function saveCustomWatchlist() {
  localStorage.setItem(userWatchlistKey, JSON.stringify([...customWatchSymbols]));
}

function addWatchSymbol(symbol, options = {}) {
  const { persist = true } = options;
  const existing = stocks.find((stock) => stock.symbol === symbol);
  if (existing) return existing;
  const match = getSearchableStocks().find((stock) => stock.symbol === symbol);
  if (!match) return null;
  const added = enrichInstrument(match, stocks.length + 90, 280);
  hydrateGroup([added], window.MARKET_SNAPSHOT?.instruments || {});
  if (snapshotOnlyMode() && !added.isSnapshotData) return null;
  stocks.push(added);
  customWatchSymbols.add(symbol);
  if (persist) saveCustomWatchlist();
  return added;
}

els.addWatchButton.addEventListener("click", () => {
  const match = findCatalogMatch();
  if (!match) return;
  const added = addWatchSymbol(match.symbol);
  if (!added) return;
  state.selectedSymbol = added.symbol;
  state.query = "";
  els.stockSearch.value = "";
  renderAll();
});

els.toggleMA.addEventListener("change", (event) => {
  state.showMA = event.target.checked;
  renderDetails();
});

els.toggleRSI.addEventListener("change", (event) => {
  state.showRSI = event.target.checked;
  renderDetails();
});

els.toggleOBV.addEventListener("change", (event) => {
  state.showOBV = event.target.checked;
  renderDetails();
});

els.zoomInButton.addEventListener("click", () => {
  state.chartWindow = Math.max(60, Math.round(state.chartWindow * 0.7));
  renderDetails();
});

els.zoomOutButton.addEventListener("click", () => {
  const stock = getSelectedStock();
  state.chartWindow = Math.min(stock.history.length, Math.round(state.chartWindow * 1.35));
  renderDetails();
});

els.zoomResetButton.addEventListener("click", () => {
  state.chartWindow = 240;
  renderDetails();
});

els.priceChart.addEventListener("mousemove", (event) => {
  const rect = els.priceChart.getBoundingClientRect();
  state.chartHover = {
    x: ((event.clientX - rect.left) / rect.width) * els.priceChart.width,
    y: ((event.clientY - rect.top) / rect.height) * els.priceChart.height,
  };
  drawPriceChart(getSelectedStock());
});

els.priceChart.addEventListener("mouseleave", () => {
  state.chartHover = null;
  drawPriceChart(getSelectedStock());
});

let breadthResizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(breadthResizeTimer);
  breadthResizeTimer = window.setTimeout(drawBreadthChart, 120);
});

function renderStockList() {
  const query = state.query.trim().toLowerCase();
  const filtered = stocks.filter((stock) => {
    if (snapshotOnlyMode() && !stock.isSnapshotData) return false;
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query) ||
      stock.exchange.toLowerCase().includes(query)
    );
  });
  updateAddWatchButton();

  els.stockList.innerHTML = filtered
    .map((stock) => {
      const change = getChange(stock);
      const weekChange = getPeriodChange(stock, 7);
      const monthChange = getPeriodChange(stock, 21);
      const activeClass = stock.symbol === state.selectedSymbol ? " is-active" : "";
      const customActions = customWatchSymbols.has(stock.symbol)
        ? `<span class="custom-tag">\u81ea\u9009</span><span class="remove-watch" data-remove-symbol="${stock.symbol}" role="button" aria-label="\u5220\u9664 ${stock.symbol}">\u5220\u9664</span>`
        : "";
      return `
        <button class="stock-button${activeClass}" data-symbol="${stock.symbol}">
          <span class="stock-name">
            <strong>${stock.symbol}</strong>
            <span>${stock.name}</span>
          </span>
          <span class="stock-price">
            <strong>${formatCurrency(stock.price)}</strong>
            <span class="${change >= 0 ? "change-up" : "change-down"}">\u4eca\u65e5 ${formatPercent(change)}</span>
            <span class="${weekChange >= 0 ? "change-up" : "change-down"}">7\u65e5 ${formatPercent(weekChange)}</span>
            <span class="${monthChange >= 0 ? "change-up" : "change-down"}">1\u6708 ${formatPercent(monthChange)}</span>
          </span>
          ${customActions}
          <span class="mini-charts">
            <canvas class="mini-price" data-chart="${stock.symbol}" width="150" height="54" aria-label="${stock.symbol} \u8fd11\u5e74\u4ef7\u683c"></canvas>
            <canvas class="mini-volume" data-volume="${stock.symbol}" width="150" height="54" aria-label="${stock.symbol} \u8fd11\u5e74\u6210\u4ea4\u91cf"></canvas>
          </span>
        </button>
      `;
    })
    .join("");

  drawStockMiniCharts(filtered);
}

function renderOverview() {
  const radar = getMarketRadarMetrics();
  els.overviewStats.innerHTML = `
    <div class="radar-heading">
      <span>MARKET RADAR</span>
      <strong>市场状态雷达</strong>
    </div>
    ${radar.map((item) => metricBlock(item.label, item.value, item.positive, item.detail)).join("")}
  `;

  renderMarketCards();
  drawBreadthChart();
}

function getMarketRadarMetrics() {
  const marketMap = new Map([...markets, ...futures].map((item) => [item.code, item]));
  const equities = ["SPY", "QQQ", "DIA", "RUT", "SSEC", "CSI300", "CSI500", "HSI", "HSTECH", "N225", "KOSPI", "ASX200"]
    .map((code) => marketMap.get(code))
    .filter(Boolean);
  const futuresGroup = ["GC", "CL", "HG", "SI"].map((code) => marketMap.get(code)).filter(Boolean);
  const crypto = ["BTC", "ETH"].map((code) => marketMap.get(code)).filter(Boolean);
  const dxy = marketMap.get("DXY");
  const tnx = marketMap.get("TNX");

  const equityMonth = averagePeriodChange(equities, 21);
  const cryptoMonth = averagePeriodChange(crypto, 21);
  const futuresBest = strongestByPeriod(futuresGroup, 21);
  const equityBest = strongestByPeriod(equities, 21);
  const equityWorst = weakestByPeriod(equities, 21);
  const breadthNow = averageLatestBreadth([breadthSeries.sp500, breadthSeries.csi300]);
  const riskOn = equityMonth >= 0 && cryptoMonth >= 0 && (!dxy || getPeriodChange(dxy, 21) <= 1.5);
  const pressureParts = [];
  if (dxy) pressureParts.push(`DXY ${formatPercent(getPeriodChange(dxy, 21))}`);
  if (tnx) pressureParts.push(`10Y ${formatPercent(getPeriodChange(tnx, 21))}`);

  return [
    {
      label: "风险偏好",
      value: riskOn ? "偏强" : "谨慎",
      positive: riskOn,
      detail: `股指1月 ${formatPercent(equityMonth)} / 加密 ${formatPercent(cryptoMonth)}`,
    },
    {
      label: "股指强弱",
      value: equityBest && equityWorst ? `${equityBest.index} / ${equityWorst.index}` : "--",
      positive: equityMonth >= 0,
      detail: equityBest && equityWorst ? `1月最强 ${formatPercent(getPeriodChange(equityBest, 21))}，最弱 ${formatPercent(getPeriodChange(equityWorst, 21))}` : "",
    },
    {
      label: "美元/利率",
      value: pressureParts.length ? pressureParts.join(" · ") : "--",
      positive: dxy ? getPeriodChange(dxy, 21) <= 0 : null,
      detail: "观察美元与长端利率对风险资产的压力",
    },
    {
      label: "商品强弱",
      value: futuresBest ? `${futuresBest.index} ${formatPercent(getPeriodChange(futuresBest, 21))}` : "--",
      positive: futuresBest ? getPeriodChange(futuresBest, 21) >= 0 : null,
      detail: "黄金、原油、铜、白银 1月表现",
    },
    {
      label: "加密资产",
      value: formatPercent(cryptoMonth),
      positive: cryptoMonth >= 0,
      detail: "BTC / ETH 1月平均表现",
    },
    {
      label: "宽度温度",
      value: Number.isFinite(breadthNow) ? `${breadthNow.toFixed(1)}%` : "--",
      positive: Number.isFinite(breadthNow) ? breadthNow >= 50 : null,
      detail: Number.isFinite(breadthNow) ? (breadthNow >= 80 ? "极热区，留意拥挤" : breadthNow <= 20 ? "极冷区，留意修复" : "处于中性区间") : "宽度数据不足",
    },
  ];
}

function averagePeriodChange(items, days) {
  const values = items.map((item) => getPeriodChange(item, days)).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function strongestByPeriod(items, days) {
  return [...items].sort((a, b) => getPeriodChange(b, days) - getPeriodChange(a, days))[0] || null;
}

function weakestByPeriod(items, days) {
  return [...items].sort((a, b) => getPeriodChange(a, days) - getPeriodChange(b, days))[0] || null;
}

function averageLatestBreadth(groups) {
  const values = groups.map((group) => getBreadthValues(group).at(-1)).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function hasKeyMaEvent(stock) {
  const { ma20, ma200 } = getMASet(stock.history);
  const previousPrice = stock.history.at(-2);
  const previousMa20 = movingAverage(stock.history, 20).at(-2);
  const previousMa200 = movingAverage(stock.history, 200).at(-2);
  const nearMa20 = ma20 ? Math.abs(stock.price - ma20) / ma20 <= 0.01 : false;
  const nearMa200 = ma200 ? Math.abs(stock.price - ma200) / ma200 <= 0.015 : false;
  const crossMa20 = ma20 && previousMa20 ? (previousPrice - previousMa20) * (stock.price - ma20) <= 0 : false;
  const crossMa200 = ma200 && previousMa200 ? (previousPrice - previousMa200) * (stock.price - ma200) <= 0 : false;
  return nearMa20 || nearMa200 || crossMa20 || crossMa200;
}

function metricBlock(label, value, positive = null, detail = "") {
  const className = positive === null ? "" : positive ? "change-up" : "change-down";
  return `
    <div class="metric-block">
      <span>${label}</span>
      <strong class="${className}">${value}</strong>
      ${detail ? `<em>${detail}</em>` : ""}
    </div>
  `;
}

function renderMarketCards() {
  const marketByCode = new Map(markets.filter((market) => !snapshotOnlyMode() || market.isSnapshotData).map((market) => [market.code, market]));
  const groupDefs = [
    ["\u7f8e\u80a1", ["SPY", "QQQ", "DIA", "RUT"]],
    ["A\u80a1 / \u6e2f\u80a1", ["SSEC", "CSI300", "CSI500", "HSI", "HSTECH"]],
    ["\u4e9a\u592a", ["N225", "KOSPI", "ASX200"]],
    ["\u5229\u7387", ["TNX"]],
    ["\u5916\u6c47", ["DXY", "EURUSD", "USDJPY", "GBPUSD", "USDCNY", "AUDUSD"]],
    ["\u52a0\u5bc6\u8d44\u4ea7", ["BTC", "ETH"]],
  ];
  const marketGroups = groupDefs
    .map(([title, codes]) => {
      const cards = codes
        .map((code) => marketByCode.get(code))
        .filter(Boolean)
        .map((market) =>
          createMarketCard({
            eyebrow: market.name,
            title: market.index,
            price: formatMarketPrice(market.price, market),
            change: getChange(market),
            weekChange: getPeriodChange(market, 7),
            monthChange: getPeriodChange(market, 21),
            meta: market.isProxy ? `${market.region} · ETF\u4ee3\u7406 ${market.sourceSymbol}` : market.region,
            history: market.history,
            chartKey: market.code,
          }),
        )
        .join("");
      return cards ? `<div class="market-group"><h3>${title}</h3><div class="market-group-grid">${cards}</div></div>` : "";
    })
    .join("");

  const futureCards = futures
    .filter((future) => !snapshotOnlyMode() || future.isSnapshotData)
    .map((future) =>
      createMarketCard({
        eyebrow: future.name,
        title: future.index,
        price: formatMarketPrice(future.price, future),
        change: getChange(future),
        weekChange: getPeriodChange(future, 7),
        monthChange: getPeriodChange(future, 21),
        meta: future.unit,
        isFuture: true,
        history: future.history,
        chartKey: future.code,
      }),
    )
    .join("");

  els.marketCards.innerHTML = `${marketGroups}<div class="market-group"><h3>\u671f\u8d27</h3><div class="market-group-grid">${futureCards}</div></div>`;
}

function drawBreadthChart() {
  ensureBreadthMarkup();
  drawSingleBreadthChart(els.sp500BreadthChart, breadthSeries.sp500, "#057b77");
  drawSingleBreadthChart(els.csi300BreadthChart, breadthSeries.csi300, "#c27a1a");
  drawSingleBreadthChart(els.sp500WeightedBreadthChart, breadthSeries.weighted.sp500, "#246bb2");
  drawSingleBreadthChart(els.csi300WeightedBreadthChart, breadthSeries.weighted.csi300, "#8f5a11");
  renderBreadthMeta("sp500", breadthSeries.sp500, els.sp500BreadthValue, els.sp500BreadthCoverage, els.sp500BreadthSamples);
  renderBreadthMeta("csi300", breadthSeries.csi300, els.csi300BreadthValue, els.csi300BreadthCoverage, els.csi300BreadthSamples);
  renderBreadthMeta(
    "weighted-sp500",
    breadthSeries.weighted.sp500,
    els.sp500WeightedBreadthValue,
    els.sp500WeightedBreadthCoverage,
    els.sp500WeightedBreadthSamples,
  );
  renderBreadthMeta(
    "weighted-csi300",
    breadthSeries.weighted.csi300,
    els.csi300WeightedBreadthValue,
    els.csi300WeightedBreadthCoverage,
    els.csi300WeightedBreadthSamples,
  );
}

function ensureBreadthMarkup() {
  const title = document.querySelector(".breadth-chart-panel .panel-heading h2");
  if (title) title.textContent = "\u7b49\u6743\u6210\u5206\u80a1MA20\u5bbd\u5ea6";
  if (!els.sp500BreadthCoverage) {
    els.sp500BreadthCoverage = insertAfter(els.sp500BreadthChart, "div", "sp500BreadthCoverage", "coverage-strip");
  }
  if (!els.sp500BreadthSamples) {
    els.sp500BreadthSamples = insertAfter(els.sp500BreadthCoverage, "details", "sp500BreadthSamples", "breadth-samples");
  }
  if (!els.csi300BreadthCoverage) {
    els.csi300BreadthCoverage = insertAfter(els.csi300BreadthChart, "div", "csi300BreadthCoverage", "coverage-strip");
  }
  if (!els.csi300BreadthSamples) {
    els.csi300BreadthSamples = insertAfter(els.csi300BreadthCoverage, "details", "csi300BreadthSamples", "breadth-samples");
  }
  if (!els.weightedBreadthSection) {
    const section = document.createElement("section");
    section.id = "weightedBreadthSection";
    section.className = "breadth-chart-panel";
    section.setAttribute("aria-label", "权重成分股MA20宽度");
    section.innerHTML = `
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Weighted Breadth</p>
          <h2>\u6743\u91cd\u6210\u5206\u80a1MA20\u5bbd\u5ea6</h2>
        </div>
        <span>\u533a\u95f4 0 - 100</span>
      </div>
      <div class="breadth-chart-grid">
        <div class="breadth-chart-card">
          <div class="chart-title"><strong>S&P 500</strong><span id="sp500WeightedBreadthValue">--</span></div>
          <canvas id="sp500WeightedBreadthChart" width="560" height="240" aria-label="S&P 500 weighted MA20 breadth"></canvas>
          <div id="sp500WeightedBreadthCoverage" class="coverage-strip"></div>
          <details id="sp500WeightedBreadthSamples" class="breadth-samples"></details>
        </div>
        <div class="breadth-chart-card">
          <div class="chart-title"><strong>\u6caa\u6df1300</strong><span id="csi300WeightedBreadthValue">--</span></div>
          <canvas id="csi300WeightedBreadthChart" width="560" height="240" aria-label="CSI 300 weighted MA20 breadth"></canvas>
          <div id="csi300WeightedBreadthCoverage" class="coverage-strip"></div>
          <details id="csi300WeightedBreadthSamples" class="breadth-samples"></details>
        </div>
      </div>
    `;
    document.querySelector(".breadth-chart-panel")?.insertAdjacentElement("afterend", section);
    els.weightedBreadthSection = section;
    els.sp500WeightedBreadthChart = section.querySelector("#sp500WeightedBreadthChart");
    els.csi300WeightedBreadthChart = section.querySelector("#csi300WeightedBreadthChart");
    els.sp500WeightedBreadthValue = section.querySelector("#sp500WeightedBreadthValue");
    els.csi300WeightedBreadthValue = section.querySelector("#csi300WeightedBreadthValue");
    els.sp500WeightedBreadthCoverage = section.querySelector("#sp500WeightedBreadthCoverage");
    els.csi300WeightedBreadthCoverage = section.querySelector("#csi300WeightedBreadthCoverage");
    els.sp500WeightedBreadthSamples = section.querySelector("#sp500WeightedBreadthSamples");
    els.csi300WeightedBreadthSamples = section.querySelector("#csi300WeightedBreadthSamples");
  }
}

function insertAfter(anchor, tagName, id, className) {
  const element = document.createElement(tagName);
  element.id = id;
  element.className = className;
  anchor?.insertAdjacentElement("afterend", element);
  return element;
}

function drawSingleBreadthChart(canvas, group, color) {
  const values = getBreadthValues(group);
  if (!canvas || !values.length) return;
  const targetHeight = clamp(Math.round((canvas.clientWidth || canvas.parentElement?.clientWidth || 560) / 2.25), 210, 280);
  canvas.style.height = `${targetHeight}px`;
  syncCanvasToDisplaySize(canvas);
  const ctx = canvas.getContext("2d");
  const pad = { left: 42, right: 16, top: 18, bottom: 28 };
  const width = canvas.width - pad.left - pad.right;
  const height = canvas.height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(22, 138, 84, 0.055)";
  ctx.fillRect(pad.left, pad.top, width, height * 0.2);
  ctx.fillStyle = "rgba(200, 76, 60, 0.055)";
  ctx.fillRect(pad.left, pad.top + height * 0.8, width, height * 0.2);

  ctx.strokeStyle = "#e6dccb";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6d7474";
  ctx.font = "800 12px Inter, sans-serif";
  ctx.textAlign = "right";
  [0, 25, 50, 75, 100].forEach((level) => {
    const y = pad.top + height - (level / 100) * height;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(canvas.width - pad.right, y);
    ctx.stroke();
    ctx.fillText(String(level), pad.left - 10, y + 4);
  });

  const benchmark = (group.benchmarkSeries || []).slice(-values.length);
  if (benchmark.length > 1) {
    drawLine(ctx, benchmark, 0, 100, pad, width, height, "rgba(31, 36, 38, 0.18)", 2);
  }
  drawLine(ctx, values, 0, 100, pad, width, height, color, 3);
  ctx.textAlign = "left";
  ctx.font = "900 12px Inter, sans-serif";
  ctx.fillStyle = "#168a54";
  ctx.fillText(">80 \u6781\u70ed", pad.left + 6, pad.top + 15);
  ctx.fillStyle = "#c84c3c";
  ctx.fillText("<20 \u6781\u51b7", pad.left + 6, pad.top + height - 6);
}

function syncCanvasToDisplaySize(canvas) {
  const styles = window.getComputedStyle(canvas);
  const cssWidth = Math.round(canvas.clientWidth || canvas.parentElement?.clientWidth || canvas.width);
  const cssHeight = Math.round(parseFloat(styles.height) || canvas.clientHeight || canvas.height);
  if (cssWidth > 0 && cssHeight > 0 && (canvas.width !== cssWidth || canvas.height !== cssHeight)) {
    canvas.width = cssWidth;
    canvas.height = cssHeight;
  }
}

function getBreadthValues(group) {
  return (group.series || []).map((point) => (typeof point === "number" ? point : point.value)).filter(Number.isFinite);
}

function renderBreadthMeta(key, group, valueEl, coverageEl, samplesEl) {
  const values = getBreadthValues(group);
  if (valueEl) valueEl.textContent = values.length ? `${values.at(-1).toFixed(1)}%` : "--";
  const coverage = group.coverage || {};
  const method = group.method || "";
  const isWeighted = method.includes("weighted") || method.includes("market_cap");
  if (coverageEl) {
    coverageEl.innerHTML = `
      <span>\u5168\u90e8\u6837\u672c <strong>${coverage.total ?? "--"}</strong></span>
      <span>\u6709\u6548\u6837\u672c <strong>${coverage.effective ?? "--"}</strong></span>
      <span>MA20\u4e0a\u65b9 <strong>${coverage.aboveMa20 ?? "--"}</strong></span>
      <span>\u7f3a\u5931\u6837\u672c <strong>${coverage.missing ?? "--"}</strong></span>
    `;
  }
  if (samplesEl) {
    samplesEl.innerHTML = `
      <summary>\u67e5\u770b\u5168\u90e8\u6837\u672c\u660e\u7ec6</summary>
      <div class="sample-table ${isWeighted ? "has-weight" : ""}" role="table" aria-label="${key} breadth samples">
        <div class="sample-row sample-head" role="row">
          <span>\u4ee3\u7801</span><span>\u540d\u79f0</span><span>\u5f53\u524d\u4ef7</span><span>MA20</span>${isWeighted ? "<span>\u6743\u91cd</span>" : ""}<span>\u72b6\u6001</span>
        </div>
        ${(group.samples || []).map((sample) => renderBreadthSample(sample, isWeighted)).join("")}
      </div>
    `;
  }
}

function renderBreadthSampleLegacy(sample, showWeight = false) {
  const statusClass = sample.status === "MA20上方" ? "change-up" : sample.status === "MA20下方" ? "change-down" : "";
  return `
    <div class="sample-row" role="row">
      <span>${sample.symbol}</span>
      <span>${sample.name || sample.sourceSymbol || sample.symbol}</span>
      <span>${sample.price ? formatNumber(sample.price) : "--"}</span>
      <span>${sample.ma20 ? formatNumber(sample.ma20) : "--"}</span>
      ${showWeight ? `<span>${Number.isFinite(sample.weight) ? `${sample.weight.toFixed(2)}%` : "--"}</span>` : ""}
      <span class="${statusClass}">${sample.status || "\u6570\u636e\u4e0d\u8db3"}</span>
    </div>
  `;
}

function renderBreadthSample(sample, showWeight = false) {
  const statusClass = sample.status === "MA20上方" ? "change-up" : sample.status === "MA20下方" ? "change-down" : "";
  return `
    <div class="sample-row" role="row">
      <span>${sample.symbol}</span>
      <span>${sample.name || sample.sourceSymbol || sample.symbol}</span>
      <span>${sample.price ? formatNumber(sample.price) : "--"}</span>
      <span>${sample.ma20 ? formatNumber(sample.ma20) : "--"}</span>
      ${showWeight ? `<span>${Number.isFinite(sample.weight) ? `${sample.weight.toFixed(2)}%` : "--"}</span>` : ""}
      <span class="${statusClass}">${sample.status || "数据不足"}</span>
    </div>
  `;
}

function ensureStaticCopy() {
  const notes = document.querySelector(".data-note-grid");
  if (notes && !notes.dataset.updated) {
    notes.dataset.updated = "true";
    notes.innerHTML = `
      <div class="data-note">
        <strong>\u80a1\u7968\u4e0e\u81ea\u9009</strong>
        <p>Yahoo Finance \u65e5\u7ebf OHLCV\uff0c\u5feb\u7167\u4fdd\u7559\u8fd12\u5e74\uff1b\u81ea\u9009\u5361\u7247\u663e\u793a\u5f53\u524d\u4ef7\u3001\u4eca\u65e5\u30017\u65e5\u30011\u6708\u53d8\u5316\uff0c\u4ef7\u683c\u4e0e\u6210\u4ea4\u91cf\u8ff7\u4f60\u56fe\u90fd\u53d6\u8fd11\u5e74\u3002\u6210\u4ea4\u91cf\u67f1\u6309\u8fd11\u5e74\u7a97\u53e3\u8ba1\u7b97\uff0c\u9ad8\u4e8e\u8be5\u7a97\u53e380\u5206\u4f4d\u6807\u7eff\u8272\u3002</p>
      </div>
      <div class="data-note">
        <strong>\u6307\u6570\u4e0eETF\u4ee3\u7406</strong>
        <p>\u5168\u7403\u5e02\u573a\u5361\u7247\u663e\u793a\u5f53\u524d\u4ef7\u3001\u4eca\u65e5\u30017\u65e5\u30011\u6708\u53d8\u5316\uff1b\u8d8b\u52bf\u5c0f\u56fe\u7edf\u4e00\u53d6\u8fd11\u5e74\u65e5\u7ebf\u3002\u6307\u6570\u4f18\u5148\u53d6 Yahoo \u6307\u6570\u672c\u4f53\uff0c\u7f3a\u5931\u65f6\u5207\u6362\u4e3b\u6d41 ETF \u4ee3\u7406\u5e76\u6807\u6ce8\u4ee3\u7406\u7b26\u53f7\u3002</p>
      </div>
      <div class="data-note">
        <strong>\u671f\u8d27\u3001\u5229\u7387\u3001\u5916\u6c47\u3001\u52a0\u5bc6</strong>
        <p>\u671f\u8d27\u3001\u5229\u7387\u3001\u5916\u6c47\u3001BTC\u3001ETH \u4f7f\u7528 Yahoo Finance \u8fd12\u5e74\u65e5\u7ebf\uff1b\u8be6\u60c5\u56fe\u9ed8\u8ba4\u663e\u793a\u8fd11\u5e74\u65e5K\uff0c\u53ef\u7528 + / - / \u91cd\u7f6e\u7f29\u653e\u3002\u5916\u6c47\u4e0e\u6307\u6570\u6210\u4ea4\u91cf\u53e3\u5f84\u4e0d\u7a33\u5b9a\u65f6\u4e0d\u753b Volume/OBV \u5047\u4fe1\u53f7\u3002</p>
      </div>
      <div class="data-note">
        <strong>\u6280\u672f\u6307\u6807</strong>
        <p>\u8be6\u60c5\u4e3b\u56fe\u9ed8\u8ba4\u8fd11\u5e74\u5e76\u53ef\u7f29\u653e\uff1bMA20/50/60/120/200 \u7528\u8fd12\u5e74\u5b8c\u6574\u5feb\u7167\u5386\u53f2\u8ba1\u7b97\uff0c\u56fe\u4e0a\u53ea\u5c55\u793a\u5f53\u524d\u7a97\u53e3\uff1bRSI \u4e3a14\u65e5\uff1bOBV \u5e2620\u65e5\u5747\u7ebf\uff1bVolume \u9ad8\u4e8e\u5f53\u524d\u53ef\u89c6\u7a97\u53e380\u5206\u4f4d\u6807\u7eff\u8272\u3002</p>
      </div>
      <div class="data-note">
        <strong>\u5e02\u573a\u5bbd\u5ea6</strong>
        <p>S\u0026amp;P 500 \u4e0e\u6caa\u6df1300\u5bbd\u5ea6\u5c55\u793a\u8fd11\u5e74\u4ea4\u6613\u65e5\u3002\u7b49\u6743\u5bbd\u5ea6\u4e3a\u7ad9\u4e0aMA20\u6570\u91cf / \u6709\u6548\u6837\u672c\u6570\uff1b\u6743\u91cd\u5bbd\u5ea6\u6309 SPY/510300 \u6301\u4ed3\u6743\u91cd\u52a0\u603b\u3002\u0026gt;80 \u4e3a\u6781\u70ed\uff0c\u0026lt;20 \u4e3a\u6781\u51b7\uff1b\u62b5\u6263\u4ef7\u53d6\u4e0d\u542b\u6700\u65b0K\u7ebf\u7684\u7b2c20/60/120\u6839\u524d\u7f6eK\u7ebf\uff0c\u5feb\u7167\u6bcf4\u5c0f\u65f6\u5237\u65b0\u3002</p>
      </div>
    `;
  }
}

renderAll();

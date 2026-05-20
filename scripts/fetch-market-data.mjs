import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(rootDir, "data", "market-snapshot.js");
const refreshIntervalHours = 4;
const force = process.argv.includes("--force");
const fullBreadth = !process.argv.includes("--skip-full-breadth");
const sparkBatchSize = 20;

const constituentSources = {
  sp500: [
    "https://yfiua.github.io/index-constituents/constituents-sp500.csv",
    "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv",
  ],
  csi300: "https://yfiua.github.io/index-constituents/constituents-csi300.csv",
};

const weightedSources = {
  sp500: [
    "https://www.ssga.com/us/en/intermediary/etfs/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx",
    "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf/1467271812596.ajax?fileType=csv&fileName=IVV_holdings&dataType=fund",
  ],
  csi300: "https://stock.finance.sina.com.cn/fundInfo/view/FundInfo_CGMX.php?symbol=510300",
};

const instruments = [
  instrument("AAPL", "AAPL"),
  instrument("MSFT", "MSFT"),
  instrument("NVDA", "NVDA"),
  instrument("AMZN", "AMZN"),
  instrument("GOOGL", "GOOGL"),
  instrument("META", "META"),
  instrument("TSLA", "TSLA"),
  instrument("0700.HK", "0700.HK"),
  instrument("600519.SS", "600519.SS"),
  instrument("SPY", "SPY"),
  instrument("QQQ", "QQQ"),
  instrument("DIA", "DIA"),
  instrument("RUT", "^RUT"),
  instrument("SSEC", "000001.SS"),
  instrument("CSI300", "000300.SS"),
  instrument("CSI500", "000905.SS", [
    { symbol: "510500.SS", note: "中证500指数Yahoo日线不足，使用主流中证500ETF代理" },
  ]),
  instrument("HSI", "^HSI"),
  instrument("HSTECH", "^HSTECH", [
    { symbol: "3033.HK", note: "恒生科技指数Yahoo不可用时，使用主流恒生科技ETF代理" },
  ]),
  instrument("N225", "^N225"),
  instrument("KOSPI", "^KS11"),
  instrument("ASX200", "^AXJO"),
  instrument("TNX", "^TNX"),
  instrument("DXY", "DX-Y.NYB", [
    { symbol: "UUP", note: "美元指数Yahoo符号不可用时，使用主流美元指数ETF代理" },
  ]),
  instrument("EURUSD", "EURUSD=X"),
  instrument("USDJPY", "JPY=X"),
  instrument("GBPUSD", "GBPUSD=X"),
  instrument("USDCNY", "CNY=X"),
  instrument("AUDUSD", "AUDUSD=X"),
  instrument("BTC", "BTC-USD"),
  instrument("ETH", "ETH-USD"),
  instrument("GC", "GC=F"),
  instrument("CL", "CL=F"),
  instrument("HG", "HG=F"),
  instrument("SI", "SI=F"),
  instrument("AMD", "AMD"),
  instrument("JPM", "JPM"),
  instrument("PDD", "PDD"),
  instrument("9988.HK", "9988.HK"),
];

const additionalStockInstruments = [
  "BRK-B",
  "AVGO",
  "LLY",
  "UNH",
  "V",
  "MA",
  "XOM",
  "COST",
  "WMT",
  "HD",
  "PG",
  "JNJ",
  "ORCL",
  "NFLX",
  "CRM",
  "BAC",
  "KO",
  "PEP",
  "MCD",
  "CSCO",
  "ADBE",
  "QCOM",
  "TXN",
  "INTU",
  "AMAT",
  "GE",
  "CAT",
  "DIS",
  "NKE",
  "TMO",
  "PFE",
  "MRK",
  "BABA",
  "TM",
  "ASML",
  "SAP",
  "RIO",
  "VALE",
  "NPN.JO",
  "2222.SR",
  "3690.HK",
  "9618.HK",
  "1810.HK",
  "1299.HK",
  "0939.HK",
  "1398.HK",
  "3988.HK",
  "0005.HK",
  "0388.HK",
  "2318.HK",
  "0883.HK",
  "0941.HK",
  "1211.HK",
  "2020.HK",
  "1024.HK",
  "9999.HK",
  "9868.HK",
  "0981.HK",
  "300750.SZ",
  "002594.SZ",
  "601318.SS",
  "601398.SS",
  "600036.SS",
  "000858.SZ",
  "000333.SZ",
  "002475.SZ",
  "300059.SZ",
  "601899.SS",
  "601857.SS",
  "600938.SS",
  "601012.SS",
  "600276.SS",
  "300760.SZ",
  "600030.SS",
  "600887.SS",
];

const instrumentCodes = new Set(instruments.map((item) => item.appCode));
for (const symbol of additionalStockInstruments) {
  if (!instrumentCodes.has(symbol)) {
    instruments.push(instrument(symbol, symbol));
    instrumentCodes.add(symbol);
  }
}

function instrument(appCode, primarySymbol, fallbacks = []) {
  return { appCode, primarySymbol, fallbacks };
}

async function main() {
  if (!force && (await isFresh(outFile))) {
    console.log(`Snapshot is fresh; keeping existing file. Use --force to refresh.`);
    return;
  }

  const previousSnapshot = await readExistingSnapshot(outFile);
  const entries = await Promise.allSettled(instruments.map((item) => fetchWithFallback(item)));
  const snapshot = {
    source: "Yahoo Finance chart API",
    generatedAt: new Date().toISOString(),
    refreshIntervalHours,
    instruments: {},
    breadth: {},
    errors: [],
  };

  for (const entry of entries) {
    if (entry.status === "fulfilled") {
      snapshot.instruments[entry.value.appCode] = entry.value;
    } else {
      snapshot.errors.push(entry.reason?.message || String(entry.reason));
    }
  }

  if (!Object.keys(snapshot.instruments).length) {
    throw new Error("No instruments were fetched; keeping the previous snapshot unchanged.");
  }

  if (fullBreadth) {
    const sp500Breadth = await withPreviousBreadthSetFallback(
      "sp500",
      previousSnapshot,
      snapshot.errors,
      () =>
        buildConstituentBreadthSet({
          label: "S&P 500",
          sourceUrl: constituentSources.sp500,
          weightSourceUrl: weightedSources.sp500,
          benchmarkCode: "SPY",
          benchmarkInstrument: snapshot.instruments.SPY,
          weightMode: "fund_weight",
        }),
    );
    const csi300Breadth = await withPreviousBreadthSetFallback(
      "csi300",
      previousSnapshot,
      snapshot.errors,
      () =>
        buildConstituentBreadthSet({
          label: "沪深300",
          sourceUrl: constituentSources.csi300,
          weightSourceUrl: weightedSources.csi300,
          benchmarkCode: "CSI300",
          benchmarkInstrument: snapshot.instruments.CSI300,
          weightMode: "etf_holding_weight",
        }),
    );
    snapshot.breadth.sp500 = sp500Breadth.equal;
    snapshot.breadth.csi300 = csi300Breadth.equal;
    snapshot.breadth.weighted = {
      sp500: normalizeWeightedBreadthCoverage(sp500Breadth.weighted),
      csi300: normalizeWeightedBreadthCoverage(csi300Breadth.weighted),
    };
  } else {
    snapshot.breadth.sp500 = buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], snapshot.instruments, "S&P 500");
    snapshot.breadth.csi300 = buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], snapshot.instruments, "沪深300");
    snapshot.breadth.weighted = {
      sp500: buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], snapshot.instruments, "S&P 500"),
      csi300: buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], snapshot.instruments, "沪深300"),
    };
  }

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `window.MARKET_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`, "utf8");
  console.log(`Wrote ${Object.keys(snapshot.instruments).length} instruments to ${outFile}`);
  if (snapshot.errors.length) {
    console.log(`Fetch warnings:\n- ${snapshot.errors.join("\n- ")}`);
  }
}

async function isFresh(path) {
  try {
    const text = await readFile(path, "utf8");
    const match = text.match(/"generatedAt":\s*"([^"]+)"/);
    if (!match) return false;
    const ageMs = Date.now() - new Date(match[1]).getTime();
    return ageMs >= 0 && ageMs < refreshIntervalHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

async function readExistingSnapshot(path) {
  try {
    const text = await readFile(path, "utf8");
    const jsonText = text.replace(/^window\.MARKET_SNAPSHOT\s*=\s*/, "").replace(/;\s*$/, "");
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

async function fetchWithFallback(item) {
  const attempts = [{ symbol: item.primarySymbol, note: null }, ...item.fallbacks];
  const errors = [];

  for (const attempt of attempts) {
    try {
      return await fetchInstrument(item.appCode, attempt.symbol, {
        primarySymbol: item.primarySymbol,
        proxyNote: attempt.note,
      });
    } catch (error) {
      errors.push(`${attempt.symbol}: ${error.message}`);
    }
  }

  throw new Error(`${item.appCode}: ${errors.join("; ")}`);
}

async function fetchInstrument(appCode, yahooSymbol, options = {}) {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`);
  url.searchParams.set("range", "2y");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includePrePost", "false");
  url.searchParams.set("events", "div,splits");

  const payload = await requestJson(url.toString());
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp || [];
  if (!result || !quote || !timestamps.length) throw new Error(`${appCode}/${yahooSymbol}: empty chart result`);

  const rows = timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      open: cleanNumber(quote.open?.[index]),
      high: cleanNumber(quote.high?.[index]),
      low: cleanNumber(quote.low?.[index]),
      close: cleanNumber(quote.close?.[index]),
      volume: Math.max(0, Math.round(quote.volume?.[index] || 0)),
    }))
    .filter((row) => row.close !== null);

  if (rows.length < 30) throw new Error(`${appCode}/${yahooSymbol}: not enough daily rows`);
  const meta = result.meta || {};
  const closes = rows.map((row) => row.close);
  const volumes = rows.map((row) => row.volume);
  const previousClose = closes.at(-2) || closes.at(-1);

  return {
    appCode,
    sourceSymbol: yahooSymbol,
    primarySymbol: options.primarySymbol || yahooSymbol,
    isProxy: yahooSymbol !== (options.primarySymbol || yahooSymbol),
    proxyNote: options.proxyNote || null,
    currency: meta.currency || null,
    shortName: meta.shortName || null,
    longName: meta.longName || null,
    exchangeName: meta.exchangeName || null,
    timezone: meta.exchangeTimezoneName || null,
    lastMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : rows.at(-1).date,
    price: closes.at(-1),
    previousClose,
    history: closes,
    volumeHistory: volumes,
    ohlcv: rows,
  };

  const weighted = {
    label,
    method: weightMode === "market_cap_proxy" ? "market_cap_proxy_above_ma20" : "index_weight_above_ma20",
    sourceUrl,
    weightSourceUrl,
    benchmarkCode,
    generatedAt: new Date().toISOString(),
    coverage: {
      total: samples.length,
      effective: weightedValidSamples.length,
      aboveMa20: weightedValidSamples.filter((sample) => sample.price >= sample.ma20).length,
      missing: samples.length - weightedValidSamples.length,
      effectiveWeight: Number(effectiveWeight.toFixed(4)),
      aboveWeight: Number(aboveWeight.toFixed(4)),
    },
    series: weightedSeries,
    benchmarkSeries: weightedBenchmarkSeries,
    samples,
    missingSamples: samples
      .filter((sample) => !Number.isFinite(sample.weight) || !Number.isFinite(sample.price) || !Number.isFinite(sample.ma20))
      .map((sample) => sample.symbol),
  };

  return { equal, weighted };
}

async function requestJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 market-snapshot/1.0",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    const command = [
      "$ProgressPreference='SilentlyContinue';",
      `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`,
      `Invoke-RestMethod -Uri '${url}' -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} | ConvertTo-Json -Depth 100 -Compress`,
    ].join(" ");
    const output = execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(output);
  }
}

async function requestText(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 market-snapshot/1.0",
        "Accept": "text/csv,text/plain,*/*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch {
    const command = [
      "$ProgressPreference='SilentlyContinue';",
      `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`,
      `Invoke-WebRequest -Uri '${url}' -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} | Select-Object -ExpandProperty Content`,
    ].join(" ");
    return execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
}

async function requestBuffer(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 market-snapshot/1.0",
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } catch {
    const command = [
      "$ProgressPreference='SilentlyContinue';",
      `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`,
      `$tmp=[IO.Path]::GetTempFileName();`,
      `Invoke-WebRequest -Uri '${url}' -OutFile $tmp -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'};`,
      `[Convert]::ToBase64String([IO.File]::ReadAllBytes($tmp));`,
      `Remove-Item $tmp -Force;`,
    ].join(" ");
    const output = execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 40 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return Buffer.from(output.trim(), "base64");
  }
}

function cleanNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(4));
}

async function withPreviousBreadthFallback(key, previousSnapshot, errors, builder) {
  try {
    const result = await builder();
    if (result?.coverage?.total && result?.series?.length) return result;
    throw new Error(`${key}: empty constituent breadth`);
  } catch (error) {
    errors.push(`${key} breadth: ${error.message}`);
    const previous = previousSnapshot?.breadth?.[key];
    if (previous?.series?.length) return previous;
    return key === "sp500"
      ? buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], previousSnapshot?.instruments || {}, "S&P 500")
      : buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], previousSnapshot?.instruments || {}, "沪深300");
  }
}

async function withPreviousBreadthSetFallback(key, previousSnapshot, errors, builder) {
  try {
    const result = await builder();
    if (!result?.equal?.coverage?.total || !result?.equal?.series?.length) {
      throw new Error(`${key}: empty equal-weight constituent breadth`);
    }
    if (result?.weighted?.series?.length) return result;

    const previousWeighted = previousSnapshot?.breadth?.weighted?.[key];
    errors.push(`${key} weighted breadth: empty weight series; kept previous weighted breadth`);
    return {
      equal: result.equal,
      weighted: previousWeighted?.series?.length
        ? previousWeighted
        : { ...result.equal, method: "weighted_above_ma20_fallback" },
    };
  } catch (error) {
    errors.push(`${key} breadth: ${error.message}`);
    const equal = previousSnapshot?.breadth?.[key];
    const weighted = previousSnapshot?.breadth?.weighted?.[key];
    if (equal?.series?.length && weighted?.series?.length) return { equal, weighted };
    const legacy =
      key === "sp500"
        ? buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], previousSnapshot?.instruments || {}, "S&P 500")
        : buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], previousSnapshot?.instruments || {}, "沪深300");
    return { equal: legacy, weighted: { ...legacy, method: "weighted_above_ma20_fallback" } };
  }
}

async function buildConstituentBreadthSet({ label, sourceUrl, weightSourceUrl, benchmarkCode, benchmarkInstrument, weightMode }) {
  const { constituents, resolvedSourceUrl } = await fetchConstituents(sourceUrl);
  if (!constituents.length) throw new Error(`${label}: no constituents`);
  const weights = await fetchConstituentWeights(weightSourceUrl, weightMode);
  const weightedConstituents = attachWeights(constituents, weights);

  const histories = await fetchSparkHistories(constituents);
  const computedSamples = constituents.map((item) => buildBreadthSample(item, histories.get(item.sourceSymbol)));
  computedSamples.forEach((sample, index) => {
    sample.weight = weightedConstituents[index]?.weight ?? null;
  });
  const validSamples = computedSamples.filter((sample) => sample.status !== "数据不足");
  const aboveCount = validSamples.filter((sample) => sample.status === "MA20上方").length;
  const series = buildEqualWeightSeries(computedSamples, 240);
  const weightedSeries = buildWeightedSeries(computedSamples, 240);
  const benchmarkSeries = normalizePriceTrend((benchmarkInstrument?.history || []).slice(-series.length));
  const weightedBenchmarkSeries = normalizePriceTrend((benchmarkInstrument?.history || []).slice(-weightedSeries.length));
  const samples = stripSampleHistories(computedSamples);
  const weightedValidSamples = computedSamples.filter(
    (sample) => Number.isFinite(sample.weight) && Number.isFinite(sample.price) && Number.isFinite(sample.ma20),
  );
  const dataValidWeightedSamples = computedSamples.filter((sample) => Number.isFinite(sample.price) && Number.isFinite(sample.ma20));
  const weightMissingSamples = dataValidWeightedSamples.filter((sample) => !Number.isFinite(sample.weight));
  const effectiveWeight = weightedValidSamples.reduce((sum, sample) => sum + sample.weight, 0);
  const aboveWeight = weightedValidSamples
    .filter((sample) => sample.price >= sample.ma20)
    .reduce((sum, sample) => sum + sample.weight, 0);

  const equal = {
    label,
    method: "equal_weight_above_ma20",
    sourceUrl: resolvedSourceUrl,
    benchmarkCode,
    generatedAt: new Date().toISOString(),
    coverage: {
      total: samples.length,
      effective: validSamples.length,
      aboveMa20: aboveCount,
      missing: samples.length - validSamples.length,
    },
    series,
    benchmarkSeries,
    samples,
    missingSamples: samples.filter((sample) => sample.status === "数据不足").map((sample) => sample.symbol),
  };
  const weighted = {
    label,
    method: weightMode === "market_cap_proxy" ? "market_cap_proxy_above_ma20" : "index_weight_above_ma20",
    sourceUrl: resolvedSourceUrl,
    weightSourceUrl,
    benchmarkCode,
    generatedAt: new Date().toISOString(),
    coverage: {
      total: samples.length,
      effective: dataValidWeightedSamples.length,
      aboveMa20: dataValidWeightedSamples.filter((sample) => sample.price >= sample.ma20).length,
      missing: samples.length - dataValidWeightedSamples.length,
      weightCovered: weightedValidSamples.length,
      weightMissing: weightMissingSamples.length,
      effectiveWeight: Number(effectiveWeight.toFixed(4)),
      aboveWeight: Number(aboveWeight.toFixed(4)),
    },
    series: weightedSeries,
    benchmarkSeries: weightedBenchmarkSeries,
    samples,
    missingSamples: samples.filter((sample) => sample.status === "数据不足").map((sample) => sample.symbol),
    missingWeightSamples: weightMissingSamples.map((sample) => sample.symbol),
  };

  return { equal, weighted };
}

function normalizeWeightedBreadthCoverage(group) {
  if (!group?.samples?.length) return group;
  const dataValidSamples = group.samples.filter((sample) => Number.isFinite(sample.price) && Number.isFinite(sample.ma20));
  const weightedValidSamples = dataValidSamples.filter((sample) => Number.isFinite(sample.weight));
  const missingSamples = group.samples.filter((sample) => !Number.isFinite(sample.price) || !Number.isFinite(sample.ma20));
  const missingWeightSamples = dataValidSamples.filter((sample) => !Number.isFinite(sample.weight));
  const effectiveWeight = weightedValidSamples.reduce((sum, sample) => sum + sample.weight, 0);
  const aboveWeight = weightedValidSamples
    .filter((sample) => sample.price >= sample.ma20)
    .reduce((sum, sample) => sum + sample.weight, 0);

  return {
    ...group,
    coverage: {
      ...(group.coverage || {}),
      total: group.samples.length,
      effective: dataValidSamples.length,
      aboveMa20: dataValidSamples.filter((sample) => sample.price >= sample.ma20).length,
      missing: missingSamples.length,
      weightCovered: weightedValidSamples.length,
      weightMissing: missingWeightSamples.length,
      effectiveWeight: Number(effectiveWeight.toFixed(4)),
      aboveWeight: Number(aboveWeight.toFixed(4)),
    },
    missingSamples: missingSamples.map((sample) => sample.symbol),
    missingWeightSamples: missingWeightSamples.map((sample) => sample.symbol),
  };
}

async function fetchConstituents(urls) {
  const attempts = Array.isArray(urls) ? urls : [urls];
  const errors = [];
  for (const url of attempts) {
    try {
      const text = await requestText(url);
      const constituents = parseCsv(text)
        .map((row) => ({
          symbol: row.Symbol,
          name: row.Name || row.Security || row.Symbol,
          sourceSymbol: toYahooSymbol(row.Symbol),
        }))
        .filter((item) => item.symbol && item.sourceSymbol);
      if (constituents.length) return { constituents, resolvedSourceUrl: url };
      errors.push(`${url}: empty constituent list`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }
  throw new Error(`constituent sources failed: ${errors.join("; ")}`);
}

async function fetchConstituentWeights(urls, mode) {
  const attempts = Array.isArray(urls) ? urls : [urls];
  for (const url of attempts) {
    try {
      const weights = url.endsWith(".xlsx")
        ? parseSpyXlsxWeights(await requestBuffer(url))
        : parseWeightsText(await requestText(url), mode);
      if (weights.size) return weights;
    } catch {
      // Continue to the next weight source. The caller records weight coverage.
    }
  }
  return new Map();
}

function parseWeightsText(text, mode) {
  if (mode === "fund_weight") return parseIsharesWeights(text);
  if (mode === "etf_holding_weight") return parseEtfHoldingWeights(text);
  if (mode === "market_cap_proxy") return parseLeguleguMarketCapWeights(text);
  return new Map();
}

function parseIsharesWeights(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.replace(/^\uFEFF/, "").startsWith("Ticker,"));
  if (headerIndex < 0) return new Map();
  const rows = parseCsv(lines.slice(headerIndex).join("\n"));
  const weights = new Map();
  for (const row of rows) {
    const ticker = row.Ticker?.replace(/^"|"$/g, "");
    const assetClass = row["Asset Class"] || "";
    const rawWeight = parseWeight(row["Weight (%)"]);
    if (!ticker || !Number.isFinite(rawWeight) || !/equity/i.test(assetClass)) continue;
    weights.set(normalizeWeightKey(ticker), rawWeight);
  }
  return weights;
}

function parseSpyXlsxWeights(buffer) {
  const entries = readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml")?.toString("utf8") || "");
  const sheet = entries.get("xl/worksheets/sheet1.xml")?.toString("utf8") || "";
  const rows = parseXlsxRows(sheet, sharedStrings);
  const weights = new Map();
  const headerIndex = rows.findIndex((row) => row.includes("Ticker") && row.includes("Weight"));
  if (headerIndex < 0) return weights;

  const header = rows[headerIndex];
  const tickerIndex = header.indexOf("Ticker");
  const weightIndex = header.indexOf("Weight");
  for (const row of rows.slice(headerIndex + 1)) {
    const ticker = row[tickerIndex]?.replace(/\./g, "-");
    const weight = parseWeight(row[weightIndex]);
    if (!ticker || !/^[A-Z][A-Z0-9-]*$/.test(ticker) || !Number.isFinite(weight)) continue;
    weights.set(normalizeWeightKey(ticker), weight);
  }
  return weights;
}

function readZipEntries(buffer) {
  const entries = new Map();
  const eocdOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocdOffset < 0) return entries;
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16);

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(centralOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralOffset + 28);
    const extraLength = buffer.readUInt16LE(centralOffset + 30);
    const commentLength = buffer.readUInt16LE(centralOffset + 32);
    const localOffset = buffer.readUInt32LE(centralOffset + 42);
    const fileName = buffer.toString("utf8", centralOffset + 46, centralOffset + 46 + fileNameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    if (method === 0) entries.set(fileName, compressed);
    if (method === 8) entries.set(fileName, inflateRawSync(compressed));
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function parseSharedStrings(xml) {
  return [...xml.matchAll(/<si\b[\s\S]*?<\/si>/g)].map((match) =>
    [...match[0].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1])).join(""),
  );
}

function parseXlsxRows(sheetXml, sharedStrings) {
  return [...sheetXml.matchAll(/<row\b[\s\S]*?<\/row>/g)].map((rowMatch) => {
    const values = [];
    for (const cellMatch of rowMatch[0].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const columnIndex = getColumnIndex(attrs.match(/\br="([A-Z]+)\d+"/)?.[1]);
      const value = getXlsxCellValue(attrs, body, sharedStrings);
      if (columnIndex >= 0) values[columnIndex] = value;
    }
    return values.map((value) => value ?? "");
  });
}

function getXlsxCellValue(attrs, body, sharedStrings) {
  if (attrs.includes('t="s"')) {
    const index = Number(body.match(/<v>(.*?)<\/v>/)?.[1]);
    return sharedStrings[index] || "";
  }
  if (attrs.includes('t="inlineStr"')) {
    return decodeXml([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join(""));
  }
  return decodeXml(body.match(/<v>(.*?)<\/v>/)?.[1] || "");
}

function getColumnIndex(column = "") {
  return [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseLeguleguMarketCapWeights(html) {
  const weights = new Map();
  const rows = html.match(/<tr class="index-basic-composition-item"[\s\S]*?<\/tr>/g) || [];
  for (const row of rows) {
    const codeMatch = row.match(/(\d{6})\.(SH|SZ)/);
    const capMatch = row.match(/<td class="marketCapItem">([\s\S]*?)<\/td>/);
    const code = codeMatch ? `${codeMatch[1]}.${codeMatch[2]}`.replace(".SH", ".SS") : null;
    const marketCap = parseWeight(stripHtml(capMatch?.[1] || ""));
    if (!code || !Number.isFinite(marketCap)) continue;
    weights.set(normalizeWeightKey(code), marketCap);
  }
  return weights;
}

function parseEtfHoldingWeights(html) {
  const sinaWeights = parseSinaEtfHoldingWeights(html);
  if (sinaWeights.size) return sinaWeights;
  return parseInvestingEtfWeights(html);
}

function parseSinaEtfHoldingWeights(html) {
  const weights = new Map();
  const rows = html.match(/<tr class="f005">[\s\S]*?<\/tr>/g) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td\b[\s\S]*?<\/td>/g)].map((match) => stripHtml(match[0]));
    const code = cells[1];
    const weight = parseWeight(cells[4]);
    if (!/^\d{6}$/.test(code) || !Number.isFinite(weight)) continue;
    weights.set(normalizeWeightKey(toChinaYahooSymbol(code)), weight);
  }
  return weights;
}

function parseInvestingEtfWeights(html) {
  const weights = new Map();
  const rows = html.match(/<tr class="datatable-v2_row__hkEus[\s\S]*?<\/tr>/g) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td\b[\s\S]*?<\/td>/g)].map((match) => stripHtml(match[0]));
    const codeIndex = cells.findIndex((cell) => /^\d{6}$/.test(cell));
    if (codeIndex < 0) continue;
    const code = toChinaYahooSymbol(cells[codeIndex]);
    const weight = parseWeight(cells[codeIndex + 1]);
    if (!code || !Number.isFinite(weight)) continue;
    weights.set(normalizeWeightKey(code), weight);
  }
  return weights;
}

function attachWeights(constituents, weights) {
  const matched = constituents.map((item) => ({
    ...item,
    rawWeight: weights.get(normalizeWeightKey(item.symbol)) ?? weights.get(normalizeWeightKey(item.sourceSymbol)) ?? null,
  }));
  const total = matched.reduce((sum, item) => sum + (Number.isFinite(item.rawWeight) ? item.rawWeight : 0), 0);
  return matched.map((item) => ({
    ...item,
    weight: total && Number.isFinite(item.rawWeight) ? Number((item.rawWeight / total) * 100) : null,
  }));
}

function normalizeWeightKey(symbol) {
  return String(symbol || "")
    .toUpperCase()
    .replace(".SH", ".SS")
    .replace(/[^A-Z0-9]/g, "");
}

function toChinaYahooSymbol(code) {
  if (!/^\d{6}$/.test(code)) return null;
  return `${code}.${code.startsWith("6") ? "SS" : "SZ"}`;
}

function stripHtml(value) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseWeight(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/["%,\s]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseCsv(text) {
  const rows = [];
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift() || "");
  for (const line of lines) {
    const values = splitCsvLine(line);
    if (!values.length) continue;
    rows.push(Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
  }
  return rows;
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function toYahooSymbol(symbol) {
  if (!symbol) return "";
  return symbol.replace(/\./g, (match, offset, full) => {
    const suffix = full.slice(offset + 1);
    return suffix === "SS" || suffix === "SZ" || suffix === "HK" ? "." : "-";
  });
}

async function fetchSparkHistories(constituents) {
  const histories = new Map();
  for (let index = 0; index < constituents.length; index += sparkBatchSize) {
    const batch = constituents.slice(index, index + sparkBatchSize);
    const symbols = batch.map((item) => item.sourceSymbol).join(",");
    const url = new URL("https://query1.finance.yahoo.com/v7/finance/spark");
    url.searchParams.set("symbols", symbols);
    url.searchParams.set("range", "2y");
    url.searchParams.set("interval", "1d");
    const payload = await requestJson(url.toString());
    for (const result of payload.spark?.result || []) {
      const response = result.response?.[0];
      const closes = (response?.indicators?.quote?.[0]?.close || [])
        .map(cleanNumber)
        .filter((value) => value !== null);
      if (closes.length) histories.set(result.symbol, closes);
    }
  }
  return histories;
}

function buildBreadthSample(item, history = []) {
  const cleanHistory = history.filter((value) => Number.isFinite(value));
  if (cleanHistory.length < 20) {
    return {
      symbol: item.symbol,
      name: item.name,
      sourceSymbol: item.sourceSymbol,
      price: null,
      ma20: null,
      status: "数据不足",
      history: [],
    };
  }
  const price = cleanHistory.at(-1);
  const ma20 = average(cleanHistory.slice(-20));
  return {
    symbol: item.symbol,
    name: item.name,
    sourceSymbol: item.sourceSymbol,
    price: Number(price.toFixed(2)),
    ma20: Number(ma20.toFixed(2)),
    status: price >= ma20 ? "MA20上方" : "MA20下方",
    history: cleanHistory.slice(-260),
  };
}

function buildEqualWeightSeries(samples, maxPoints) {
  const output = [];
  const maxLength = Math.min(maxPoints, Math.max(...samples.map((sample) => sample.history.length), 0));
  for (let offset = maxLength; offset > 0; offset -= 1) {
    let above = 0;
    let counted = 0;
    for (const sample of samples) {
      const history = sample.history;
      const end = history.length - offset + 1;
      if (end < 20) continue;
      const price = history[end - 1];
      const ma20 = average(history.slice(end - 20, end));
      counted += 1;
      if (price >= ma20) above += 1;
    }
    output.push({
      value: counted ? Number(((above / counted) * 100).toFixed(1)) : null,
      above,
      effective: counted,
    });
  }
  return output.filter((point) => point.value !== null);
}

function buildWeightedSeries(samples, maxPoints) {
  const output = [];
  const maxLength = Math.min(maxPoints, Math.max(...samples.map((sample) => sample.history.length), 0));
  for (let offset = maxLength; offset > 0; offset -= 1) {
    let aboveWeight = 0;
    let totalWeight = 0;
    for (const sample of samples) {
      const history = sample.history;
      const end = history.length - offset + 1;
      if (end < 20 || !Number.isFinite(sample.weight)) continue;
      const price = history[end - 1];
      const ma20 = average(history.slice(end - 20, end));
      totalWeight += sample.weight;
      if (price >= ma20) aboveWeight += sample.weight;
    }
    output.push({
      value: totalWeight ? Number(((aboveWeight / totalWeight) * 100).toFixed(1)) : null,
      aboveWeight: Number(aboveWeight.toFixed(4)),
      effectiveWeight: Number(totalWeight.toFixed(4)),
    });
  }
  return output.filter((point) => point.value !== null);
}

function stripSampleHistories(samples) {
  return samples.map(({ history, ...sample }) => sample);
}

function normalizePriceTrend(values) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((value) => Number((((value - min) / (max - min || 1)) * 100).toFixed(1)));
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildLegacyBreadth(appCodes, snapshotInstruments, label) {
  const series = buildBreadthSeries(appCodes, snapshotInstruments).map((value) => ({
    value,
    above: null,
    effective: null,
  }));
  const samples = appCodes.map((code) => {
    const instrument = snapshotInstruments[code];
    const history = instrument?.history || [];
    const ma20 = history.length >= 20 ? average(history.slice(-20)) : null;
    return {
      symbol: code,
      name: code,
      sourceSymbol: instrument?.sourceSymbol || code,
      price: instrument?.price || null,
      ma20: ma20 ? Number(ma20.toFixed(2)) : null,
      status: ma20 && instrument?.price >= ma20 ? "MA20上方" : ma20 ? "MA20下方" : "数据不足",
      history: history.slice(-260),
    };
  });
  const effective = samples.filter((sample) => sample.status !== "数据不足").length;
  const aboveMa20 = samples.filter((sample) => sample.status === "MA20上方").length;
  const publicSamples = stripSampleHistories(samples);
  return {
    label,
    method: "equal_weight_above_ma20",
    generatedAt: new Date().toISOString(),
    coverage: {
      total: samples.length,
      effective,
      aboveMa20,
      missing: samples.length - effective,
    },
    series,
    benchmarkSeries: [],
    samples: publicSamples,
    missingSamples: publicSamples.filter((sample) => sample.status === "数据不足").map((sample) => sample.symbol),
  };
}

function buildBreadthSeries(appCodes, snapshotInstruments) {
  const histories = appCodes
    .map((code) => snapshotInstruments[code]?.history)
    .filter((history) => Array.isArray(history) && history.length >= 25);
  if (!histories.length) return [];

  const minLength = Math.min(100, ...histories.map((history) => history.length));
  const output = [];
  for (let offset = minLength; offset > 0; offset -= 1) {
    let above = 0;
    let counted = 0;
    for (const history of histories) {
      const end = history.length - offset + 1;
      if (end < 20) continue;
      const window = history.slice(end - 20, end);
      const ma20 = window.reduce((sum, value) => sum + value, 0) / window.length;
      counted += 1;
      if (history[end - 1] > ma20) above += 1;
    }
    output.push(counted ? Number(((above / counted) * 100).toFixed(1)) : 0);
  }
  return output;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

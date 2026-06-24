import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";

const rootDir = process.env.MARKET_RADAR_ROOT
  ? resolve(process.env.MARKET_RADAR_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(rootDir, "data", "market-snapshot.js");
const refreshIntervalHours = 4;
const force = process.argv.includes("--force");
const fullBreadth = !process.argv.includes("--skip-full-breadth");
const offlineFallback = process.argv.includes("--offline-fallback");
const marketOnly = process.argv.includes("--market-only");
const sparkBatchSize = 20;
const instrumentTimeoutMs = Number(process.env.MARKET_RADAR_INSTRUMENT_TIMEOUT_MS || 25000);
const breadthTimeoutMs = Number(process.env.MARKET_RADAR_BREADTH_TIMEOUT_MS || 120000);
const powershellTimeoutMs = Number(process.env.MARKET_RADAR_POWERSHELL_TIMEOUT_MS || 90000);
const snapshotGeneratedAt = new Date();

const constituentSources = {
  sp500: [
    "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv",
    "https://yfiua.github.io/index-constituents/constituents-sp500.csv",
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
  instrument("IWM", "IWM"),
  instrument("SSEC", "000001.SS"),
  instrument("CSI300", "000300.SS"),
  instrument("CSI500", "000905.SS", [
    { symbol: "510500.SS", note: "中证500指数Yahoo日线不足，使用主流中证500ETF代理" },
  ]),
  instrument("CHINEXT", "159915.SZ"),
  instrument("STAR50", "588000.SS"),
  instrument("A50", "2822.HK"),
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

const marketOnlyAppCodes = new Set([
  "SPY",
  "QQQ",
  "DIA",
  "IWM",
  "SSEC",
  "CSI300",
  "CSI500",
  "CHINEXT",
  "STAR50",
  "A50",
  "HSI",
  "HSTECH",
  "N225",
  "KOSPI",
  "ASX200",
  "TNX",
  "DXY",
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "USDCNY",
  "AUDUSD",
  "BTC",
  "ETH",
  "GC",
  "CL",
  "HG",
  "SI",
]);

function instrument(appCode, primarySymbol, fallbacks = []) {
  return { appCode, primarySymbol, fallbacks };
}

async function main() {
  if (!force && (await isFresh(outFile))) {
    console.log(`Snapshot is fresh; keeping existing file. Use --force to refresh.`);
    return;
  }

  const previousSnapshot = await readExistingSnapshot(outFile);
  if (offlineFallback) {
    if (!previousSnapshot?.instruments || !Object.keys(previousSnapshot.instruments).length) {
      throw new Error("Offline fallback requested but no previous snapshot is available.");
    }
    const fallbackSnapshot = buildOfflineFallbackSnapshot(previousSnapshot, [
      {
        scope: "instrument",
        source: "local snapshot",
        reason: "offline fallback requested; kept previous market data",
      },
    ]);
    await writeSnapshotFile(fallbackSnapshot);
    console.log(`Wrote V0.3-compatible offline fallback snapshot from ${fallbackSnapshot.generatedAt}.`);
    return;
  }

  const instrumentsToFetch = marketOnly ? instruments.filter((item) => marketOnlyAppCodes.has(item.appCode)) : instruments;
  console.log(
    `[snapshot] mode=${marketOnly ? "market-only" : fullBreadth ? "full" : "skip-breadth"} instruments=${instrumentsToFetch.length}`,
  );
  console.log("[snapshot] fetching instruments...");
  const entries = await Promise.allSettled(
    instrumentsToFetch.map((item) =>
      runWithTimeout(
        () => fetchWithFallback(item),
        instrumentTimeoutMs,
        `${item.appCode}: instrument fetch timed out after ${Math.round(instrumentTimeoutMs / 1000)}s`,
      ),
    ),
  );
  const snapshot = {
    source: "Yahoo Finance chart API",
    generatedAt: snapshotGeneratedAt.toISOString(),
    snapshotVersion: buildSnapshotVersion(snapshotGeneratedAt),
    refreshIntervalHours,
    instruments: marketOnly && previousSnapshot?.instruments ? { ...previousSnapshot.instruments } : {},
    breadth: {},
    errors: [],
    errorLog: [],
  };

  for (const entry of entries) {
    if (entry.status === "fulfilled") {
      snapshot.instruments[entry.value.appCode] = entry.value;
    } else {
      recordSnapshotError(snapshot, {
        scope: "instrument",
        reason: entry.reason?.message || String(entry.reason),
      });
    }
  }

  if (!Object.keys(snapshot.instruments).length) {
    if (previousSnapshot?.instruments && Object.keys(previousSnapshot.instruments).length) {
      const fallbackSnapshot = buildOfflineFallbackSnapshot(previousSnapshot, snapshot.errorLog);
      await writeSnapshotFile(fallbackSnapshot);
      console.log(
        `No instruments were fetched; wrote a V0.3-compatible fallback snapshot from the previous data timestamp ${fallbackSnapshot.generatedAt}.`,
      );
      return;
    }
    throw new Error("No instruments were fetched and no previous snapshot is available.");
  }

  if (fullBreadth && !marketOnly) {
    console.log("[snapshot] building full constituent breadth...");
    const sp500Breadth = await withPreviousBreadthSetFallback(
      "sp500",
      previousSnapshot,
      snapshot,
      () =>
        buildConstituentBreadthSet({
          label: "S&P 500",
          sourceUrl: constituentSources.sp500,
          weightSourceUrl: weightedSources.sp500,
          benchmarkCode: "SPY",
          benchmarkInstrument: snapshot.instruments.SPY,
          weightMode: "fund_weight",
          sectorMarket: "sp500",
        }),
    );
    const csi300Breadth = await withPreviousBreadthSetFallback(
      "csi300",
      previousSnapshot,
      snapshot,
      () =>
        buildConstituentBreadthSet({
          label: "沪深300",
          sourceUrl: constituentSources.csi300,
          weightSourceUrl: weightedSources.csi300,
          benchmarkCode: "CSI300",
          benchmarkInstrument: snapshot.instruments.CSI300,
          weightMode: "etf_holding_weight",
          sectorMarket: "csi300",
        }),
    );
    snapshot.breadth.sp500 = sp500Breadth.equal;
    snapshot.breadth.csi300 = csi300Breadth.equal;
    snapshot.breadth.weighted = {
      sp500: normalizeWeightedBreadthCoverage(sp500Breadth.weighted),
      csi300: normalizeWeightedBreadthCoverage(csi300Breadth.weighted),
    };
  } else {
    console.log("[snapshot] keeping previous breadth where available...");
    const previousBreadthSnapshot = buildOfflineFallbackSnapshot(previousSnapshot || {}, []);
    if (previousBreadthSnapshot?.breadth?.sp500?.coverage?.total > 100 && previousBreadthSnapshot?.breadth?.csi300?.coverage?.total > 100) {
      snapshot.breadth = previousBreadthSnapshot.breadth;
      recordSnapshotError(snapshot, {
        scope: "breadth",
        group: "all",
        source: "previous snapshot",
        reason: "full breadth refresh skipped; kept previous complete breadth sets",
      });
    } else {
      snapshot.breadth.sp500 = buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], snapshot.instruments, "S&P 500", "sp500");
      snapshot.breadth.csi300 = buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], snapshot.instruments, "沪深300", "csi300");
      snapshot.breadth.weighted = {
        sp500: buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], snapshot.instruments, "S&P 500", "sp500"),
        csi300: buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], snapshot.instruments, "沪深300", "csi300"),
      };
    }
  }

  snapshot.health = buildSnapshotHealth(snapshot);

  await writeSnapshotFile(snapshot);
  console.log(`Wrote ${Object.keys(snapshot.instruments).length} instruments to ${outFile}`);
  if (snapshot.errors.length) {
    console.log(`Fetch warnings:\n- ${snapshot.errors.join("\n- ")}`);
  }
}

async function writeSnapshotFile(snapshot) {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `window.MARKET_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`, "utf8");
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

function buildSnapshotVersion(date) {
  const stamp = date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 15);
  const hash = Math.abs(Math.sin(date.getTime()) * 1_000_000_000)
    .toString(36)
    .slice(0, 6)
    .padEnd(6, "0");
  return `${stamp}-${hash}`;
}

function recordSnapshotError(snapshot, entry) {
  const normalized = {
    scope: entry.scope || "unknown",
    symbol: entry.symbol || null,
    group: entry.group || null,
    source: entry.source || null,
    reason: entry.reason || "unknown error",
  };
  snapshot.errorLog.push(normalized);
  snapshot.errors.push(
    [normalized.scope, normalized.symbol || normalized.group, normalized.source, normalized.reason]
      .filter(Boolean)
      .join(": "),
  );
}

function buildSnapshotHealth(snapshot) {
  const instrumentTotal = instruments.length;
  const instrumentSuccess = Object.keys(snapshot.instruments || {}).length;
  const breadthGroups = [
    snapshot.breadth?.sp500,
    snapshot.breadth?.csi300,
    snapshot.breadth?.weighted?.sp500,
    snapshot.breadth?.weighted?.csi300,
  ].filter(Boolean);
  const summarizeGroup = (group) => ({
    label: group?.label || null,
    method: group?.method || null,
    total: group?.coverage?.total ?? 0,
    effective: group?.coverage?.effective ?? 0,
    missing: group?.coverage?.missing ?? 0,
    aboveMa20: group?.coverage?.aboveMa20 ?? 0,
    weightCovered: group?.coverage?.weightCovered ?? null,
    weightMissing: group?.coverage?.weightMissing ?? null,
    effectiveWeight: group?.coverage?.effectiveWeight ?? null,
    latestBreadth: Array.isArray(group?.series) && group.series.length ? group.series.at(-1)?.value ?? null : null,
  });

  return {
    generatedAt: snapshot.generatedAt,
    snapshotVersion: snapshot.snapshotVersion,
    refreshIntervalHours: snapshot.refreshIntervalHours,
    instruments: {
      total: instrumentTotal,
      success: instrumentSuccess,
      failed: Math.max(0, instrumentTotal - instrumentSuccess),
    },
    breadth: {
      groups: breadthGroups.length,
      sp500: summarizeGroup(snapshot.breadth?.sp500),
      csi300: summarizeGroup(snapshot.breadth?.csi300),
      weightedSp500: summarizeGroup(snapshot.breadth?.weighted?.sp500),
      weightedCsi300: summarizeGroup(snapshot.breadth?.weighted?.csi300),
    },
    errors: {
      count: snapshot.errorLog?.length || 0,
    },
  };
}

function buildOfflineFallbackSnapshot(previousSnapshot, fetchErrors = []) {
  const generatedAt = previousSnapshot.generatedAt || snapshotGeneratedAt.toISOString();
  const snapshot = {
    ...previousSnapshot,
    generatedAt,
    snapshotVersion: buildSnapshotVersion(snapshotGeneratedAt),
    refreshIntervalHours,
    instruments: previousSnapshot.instruments || {},
    breadth: previousSnapshot.breadth || {},
    errors: Array.isArray(previousSnapshot.errors) ? [...previousSnapshot.errors] : [],
    errorLog: Array.isArray(previousSnapshot.errorLog) ? [...previousSnapshot.errorLog] : [],
  };

  for (const entry of fetchErrors) {
    recordSnapshotError(snapshot, {
      ...entry,
      scope: entry.scope || "instrument",
      source: entry.source || "Yahoo Finance chart API",
    });
  }

  const ensureBreadthGroup = (group, weighted = false, sectorMarket = "generic") => {
    if (!group) return group;
    const samples = Array.isArray(group.samples)
      ? group.samples.map((sample) => {
          const sectorInfo = resolveSector({ ...sample, sectorMarket }, null, sectorMarket);
          return {
            ...sample,
            sectorMarket,
            sector: sectorInfo.sector,
            sectorSource: sectorInfo.sectorSource,
          };
        })
      : [];
    return {
      ...group,
      samples,
      sectorBreadth: buildSectorBreadth(samples, weighted),
      divergence: group.divergence || analyzeBreadthDivergence(group.series || [], group.benchmarkSeries || []),
    };
  };

  snapshot.breadth.sp500 = ensureBreadthGroup(snapshot.breadth.sp500, false, "sp500");
  snapshot.breadth.csi300 = ensureBreadthGroup(snapshot.breadth.csi300, false, "csi300");
  if (snapshot.breadth.weighted) {
    snapshot.breadth.weighted.sp500 = ensureBreadthGroup(snapshot.breadth.weighted.sp500, true, "sp500");
    snapshot.breadth.weighted.csi300 = ensureBreadthGroup(snapshot.breadth.weighted.csi300, true, "csi300");
  }

  snapshot.health = buildSnapshotHealth(snapshot);
  return snapshot;
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

async function fetchSparkHistories(constituents) {
  const histories = new Map();
  const failed = [];
  let cursor = 0;
  const workerCount = Math.min(10, constituents.length);

  async function worker() {
    while (cursor < constituents.length) {
      const item = constituents[cursor];
      cursor += 1;
      try {
        const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.sourceSymbol)}`);
        url.searchParams.set("range", "2y");
        url.searchParams.set("interval", "1d");
        url.searchParams.set("includePrePost", "false");
        const response = await fetch(url.toString(), {
          headers: {
            "User-Agent": "Mozilla/5.0 market-snapshot/1.0",
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const result = payload.chart?.result?.[0];
        const quote = result?.indicators?.quote?.[0];
        const closes = (quote?.close || []).map(cleanNumber).filter((value) => Number.isFinite(value));
        histories.set(item.sourceSymbol, closes);
      } catch {
        failed.push(item);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  if (failed.length) {
    console.log(`Yahoo Node fetch failed for ${failed.length} constituent histories; using PowerShell batch fallback.`);
    const fallbackHistories = fetchSparkHistoriesWithPowerShell(failed);
    for (const item of failed) {
      histories.set(item.sourceSymbol, fallbackHistories.get(item.sourceSymbol) || []);
    }
  }
  return histories;
}

function fetchSparkHistoriesWithPowerShell(items) {
  const histories = new Map();
  const shell = process.platform === "win32" ? "powershell" : "pwsh";
  const chunkSize = 80;
  for (let start = 0; start < items.length; start += chunkSize) {
    const chunk = items.slice(start, start + chunkSize);
    console.log(`PowerShell history fallback ${Math.min(start + chunk.length, items.length)}/${items.length}`);
    const symbolList = chunk
      .map((item) => `'${String(item.sourceSymbol).replace(/'/g, "''")}'`)
      .join(",");
    const command = [
      "$ProgressPreference='SilentlyContinue';",
      `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;`,
      `$symbols=@(${symbolList});`,
      "$out=@();",
      "foreach($s in $symbols){",
      "try {",
      "$u='https://query1.finance.yahoo.com/v8/finance/chart/'+[uri]::EscapeDataString($s)+'?range=2y&interval=1d&includePrePost=false';",
      "$r=Invoke-RestMethod -Uri $u -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} -TimeoutSec 12;",
      "$closes=@($r.chart.result[0].indicators.quote[0].close | Where-Object { $_ -ne $null });",
      "$out += [pscustomobject]@{symbol=$s; closes=$closes};",
      "} catch {",
      "$out += [pscustomobject]@{symbol=$s; closes=@()};",
      "}",
      "}",
      "$out | ConvertTo-Json -Depth 100 -Compress",
    ].join(" ");
    try {
      const output = execFileSync(shell, ["-NoProfile", "-Command", command], {
        encoding: "utf8",
        maxBuffer: 60 * 1024 * 1024,
        timeout: powershellTimeoutMs,
        stdio: ["ignore", "pipe", "pipe"],
      });
      const rows = JSON.parse(output || "[]");
      for (const row of Array.isArray(rows) ? rows : [rows]) {
        histories.set(row.symbol, (row.closes || []).map(cleanNumber).filter((value) => Number.isFinite(value)));
      }
    } catch {
      for (const item of chunk) histories.set(item.sourceSymbol, []);
    }
  }
  return histories;
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
      `Invoke-RestMethod -Uri '${url}' -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} -TimeoutSec 20 | ConvertTo-Json -Depth 100 -Compress`,
    ].join(" ");
    const output = execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      timeout: powershellTimeoutMs,
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
      `Invoke-WebRequest -Uri '${url}' -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} -TimeoutSec 20 | Select-Object -ExpandProperty Content`,
    ].join(" ");
    return execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      timeout: powershellTimeoutMs,
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
      `Invoke-WebRequest -Uri '${url}' -OutFile $tmp -Headers @{'User-Agent'='Mozilla/5.0 market-snapshot/1.0'} -TimeoutSec 20;`,
      `[Convert]::ToBase64String([IO.File]::ReadAllBytes($tmp));`,
      `Remove-Item $tmp -Force;`,
    ].join(" ");
    const output = execFileSync("powershell", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      maxBuffer: 40 * 1024 * 1024,
      timeout: powershellTimeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return Buffer.from(output.trim(), "base64");
  }
}

function cleanNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(4));
}

async function withPreviousBreadthFallback(key, previousSnapshot, snapshot, builder) {
  try {
    const result = await builder();
    if (result?.coverage?.total && result?.series?.length) return result;
    throw new Error(`${key}: empty constituent breadth`);
  } catch (error) {
    recordSnapshotError(snapshot, { scope: "breadth", group: key, reason: error.message });
    const previous = previousSnapshot?.breadth?.[key];
    if (previous?.series?.length) return previous;
    return key === "sp500"
      ? buildLegacyBreadth(["AAPL", "MSFT", "NVDA", "TSLA"], previousSnapshot?.instruments || {}, "S&P 500")
      : buildLegacyBreadth(["BABA", "0700.HK", "9988.HK"], previousSnapshot?.instruments || {}, "沪深300");
  }
}

async function withPreviousBreadthSetFallback(key, previousSnapshot, snapshot, builder) {
  try {
    const result = await runWithTimeout(builder, breadthTimeoutMs, `${key}: constituent breadth timed out after ${Math.round(breadthTimeoutMs / 1000)}s`);
    if (!result?.equal?.coverage?.total || !result?.equal?.series?.length) {
      throw new Error(`${key}: empty equal-weight constituent breadth`);
    }
    if (result?.weighted?.series?.length) return result;

    const previousWeighted = previousSnapshot?.breadth?.weighted?.[key];
    recordSnapshotError(snapshot, {
      scope: "weight",
      group: key,
      reason: "empty weight series; kept previous weighted breadth",
    });
    return {
      equal: result.equal,
      weighted: previousWeighted?.series?.length
        ? previousWeighted
        : { ...result.equal, method: "weighted_above_ma20_fallback" },
    };
  } catch (error) {
    recordSnapshotError(snapshot, { scope: "breadth", group: key, reason: error.message });
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

function runWithTimeout(builder, timeoutMs, message) {
  let timer = null;
  const buildPromise = Promise.resolve()
    .then(builder)
    .catch((error) => {
      throw error;
    });
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([buildPromise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
    buildPromise.catch(() => {});
  });
}

async function buildConstituentBreadthSet({
  label,
  sourceUrl,
  weightSourceUrl,
  benchmarkCode,
  benchmarkInstrument,
  weightMode,
  sectorMarket = "generic",
}) {
  const { constituents, resolvedSourceUrl } = await fetchConstituents(sourceUrl, sectorMarket);
  if (!constituents.length) throw new Error(`${label}: no constituents`);
  const weights = await fetchConstituentWeights(weightSourceUrl, weightMode);
  const weightedConstituents = attachWeights(constituents, weights);

  const histories = await fetchSparkHistories(constituents);
  const computedSamples = constituents.map((item) => buildBreadthSample(item, histories.get(item.sourceSymbol), sectorMarket));
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
  const sectorBreadth = buildSectorBreadth(samples, false);
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
    sectorBreadth,
    divergence: analyzeBreadthDivergence(series, benchmarkSeries),
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
    sectorBreadth: buildSectorBreadth(samples, true),
    divergence: analyzeBreadthDivergence(weightedSeries, weightedBenchmarkSeries),
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
    sectorBreadth: buildSectorBreadth(group.samples, true),
    divergence: group.divergence || analyzeBreadthDivergence(group.series || [], group.benchmarkSeries || []),
    missingSamples: missingSamples.map((sample) => sample.symbol),
    missingWeightSamples: missingWeightSamples.map((sample) => sample.symbol),
  };
}

async function fetchConstituents(urls, sectorMarket = "generic") {
  const attempts = Array.isArray(urls) ? urls : [urls];
  const errors = [];
  const candidates = [];
  for (const url of attempts) {
    try {
      const text = await requestText(url);
      const constituents = parseCsv(text)
        .map((row) => {
          const sourceSymbol = toYahooSymbol(row.Symbol);
          const sectorInfo = resolveSector(
            {
              ...row,
              symbol: row.Symbol,
              name: row.Name || row.Security || row.Symbol,
              sourceSymbol,
              sectorMarket,
            },
            getRawSectorFromRow(row, sectorMarket),
            sectorMarket,
          );
          return {
            symbol: row.Symbol,
            name: row.Name || row.Security || row.Symbol,
            sector: sectorInfo.sector,
            sectorSource: sectorInfo.sectorSource,
            sectorMarket,
            sourceSymbol,
          };
        })
        .filter((item) => item.symbol && item.sourceSymbol);
      if (constituents.length) {
        candidates.push({ constituents, resolvedSourceUrl: url, sectorCoverage: countClassifiedSectors(constituents) });
        continue;
      }
      errors.push(`${url}: empty constituent list`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }
  if (candidates.length) {
    candidates.sort(
      (a, b) =>
        b.sectorCoverage - a.sectorCoverage ||
        b.constituents.length - a.constituents.length,
    );
    return candidates[0];
  }
  throw new Error(`constituent sources failed: ${errors.join("; ")}`);
}

function countClassifiedSectors(constituents) {
  return constituents.filter((item) => !isUnclassifiedSector(item.sector)).length;
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

function getRawSectorFromRow(row = {}, sectorMarket = "generic") {
  if (sectorMarket === "sp500") {
    return row["GICS Sector"] || row.Sector || row.Industry || row["Sub Industry"] || "";
  }
  if (sectorMarket === "csi300") {
    return (
      row["CSI Industry"] ||
      row["Index Industry"] ||
      row["中证行业"] ||
      row["申万行业"] ||
      row["中信行业"] ||
      row["行业"] ||
      row["行业分类"] ||
      row.Industry ||
      row.Sector ||
      ""
    );
  }
  return (
    row["GICS Sector"] ||
    row.Sector ||
    row["CSI Industry"] ||
    row["Index Industry"] ||
    row["中证行业"] ||
    row["申万行业"] ||
    row["中信行业"] ||
    row.Industry ||
    row["Sub Industry"] ||
    row["行业"] ||
    row["行业分类"] ||
    ""
  );
}

let sectorMapCache = null;

function getLocalSectorMap() {
  if (sectorMapCache) return sectorMapCache;
  try {
    const text = readFileSync(resolve(rootDir, "data", "sector-map.json"), "utf8");
    sectorMapCache = JSON.parse(text).sectors || {};
  } catch {
    sectorMapCache = {};
  }
  return sectorMapCache;
}

function normalizeSectorKey(symbol = "") {
  return String(symbol)
    .trim()
    .toUpperCase()
    .replace(/\.SH$/, ".SS")
    .replace(/\.SHE$/, ".SZ")
    .replace(/\.SHA$/, ".SS");
}

function hasMojibakeText(value = "") {
  const suspiciousCodes = new Set([0x951b, 0x93c1, 0x93c8, 0x93b6, 0x6dc7, 0x752f, 0x690b, 0x934b, 0x9422, 0x741b, 0x7039, 0x93b4, 0x6d60]);
  return [...String(value)].some((char) => suspiciousCodes.has(char.codePointAt(0)));
}

function getSectorFromRow(row) {
  const sectorMarket = row.sectorMarket || row.market || "generic";
  return resolveSector(
    {
      ...row,
      symbol: row.Symbol,
      name: row.Name || row.Security || row.Symbol,
      sourceSymbol: toYahooSymbol(row.Symbol),
      sectorMarket,
    },
    getRawSectorFromRow(row, sectorMarket),
    sectorMarket,
  ).sector;
}

function enrichSector(item = {}) {
  return resolveSector(item, null, item.sectorMarket || "generic").sector;
}

function enrichSectorSource(item = {}) {
  return resolveSector(item, null, item.sectorMarket || "generic").sectorSource;
}

function isUnclassifiedSector(sector) {
  return !sector || sector === "未分类";
}

const legacyUnifiedChinaSectors = new Set([
  "信息技术",
  "金融",
  "医疗保健",
  "可选消费",
  "必需消费",
  "通信服务",
  "工业",
  "能源",
  "材料",
  "公用事业",
  "房地产",
  "国防军工",
]);

function normalizeSector(sector, sectorMarket = "generic") {
  const value = String(sector || "").trim();
  if (!value || value === "-" || value.toLowerCase() === "n/a" || hasMojibakeText(value)) return "未分类";
  if (sectorMarket === "sp500") return normalizeGicsSector(value);
  if (sectorMarket === "csi300") return normalizeChinaIndustry(value);
  return normalizeGenericSector(value);
}

function normalizeGicsSector(sector) {
  const value = String(sector || "").trim();
  const lower = value.toLowerCase();
  if (lower.includes("information technology") || /信息技术|科技|软件|半导体|电子|计算机/.test(value)) return "Information Technology";
  if (lower.includes("financial") || /金融|银行|证券|保险|信托|期货|资本/.test(value)) return "Financials";
  if (lower.includes("health care") || /医疗保健|医药|医疗|生物|制药|健康/.test(value)) return "Health Care";
  if (lower.includes("consumer discretionary") || /可选消费|汽车|家电|旅游|酒店|零售|电商/.test(value)) return "Consumer Discretionary";
  if (lower.includes("consumer staples") || /主要消费|必需消费|食品|饮料|白酒|农业|乳业|养殖/.test(value)) return "Consumer Staples";
  if (lower.includes("communication") || /通信服务|通信|传媒|互联网|游戏|运营商/.test(value)) return "Communication Services";
  if (lower.includes("industrial") || /工业|机械|军工|航空|航天|运输|建筑|工程|国防/.test(value)) return "Industrials";
  if (lower.includes("energy") || /能源|石油|煤炭|油气/.test(value)) return "Energy";
  if (lower.includes("materials") || /材料|化工|钢铁|有色|金属|稀土|黄金/.test(value)) return "Materials";
  if (lower.includes("utilities") || /公用|电力|燃气|水务/.test(value)) return "Utilities";
  if (lower.includes("real estate") || /地产|房地产|物业|园区/.test(value)) return "Real Estate";
  return value;
}

function normalizeChinaIndustry(sector) {
  const value = String(sector || "").trim();
  const lower = value.toLowerCase();
  if (/银行/.test(value)) return "银行";
  if (/非银|证券|保险|多元金融|信托|期货|资本|金融服务/.test(value)) return "非银金融";
  if (/食品饮料|食品|饮料|白酒|乳业|调味/.test(value)) return "食品饮料";
  if (/电力设备|新能源|光伏|电池|锂电|储能/.test(value)) return "电力设备";
  if (/电子|半导体|元件|消费电子|芯片|集成电路/.test(value)) return "电子";
  if (/医药生物|医药|医疗|生物|制药|健康/.test(value)) return "医药生物";
  if (/国防军工|军工|国防|航空|航天|中航|航发|成飞|沈飞/.test(value)) return "国防军工";
  if (/汽车|整车|零部件|客车|轮胎/.test(value)) return "汽车";
  if (/基础化工|化工|化学制品|化学原料/.test(value)) return "基础化工";
  if (/有色金属|有色|稀土|黄金|锂|金属/.test(value)) return "有色金属";
  if (/计算机|软件|信息服务|云计算/.test(value) || lower.includes("computer")) return "计算机";
  if (/通信|运营商|光模块|卫通/.test(value)) return "通信";
  if (/机械设备|机械|设备|机电|液压/.test(value)) return "机械设备";
  if (/交通运输|港口|航空|铁路|物流|快递|高速|航运/.test(value)) return "交通运输";
  if (/公用事业|公用|电力|燃气|水务|核电/.test(value)) return "公用事业";
  if (/石油石化|石油|石化|油气|炼化/.test(value)) return "石油石化";
  if (/煤炭/.test(value)) return "煤炭";
  if (/建筑材料|建材|水泥|玻璃|材料/.test(value)) return "建筑材料";
  if (/建筑装饰|建筑|工程|基建|交建|中冶|能建/.test(value)) return "建筑装饰";
  if (/农林牧渔|农业|养殖|饲料|种业/.test(value)) return "农林牧渔";
  if (/家用电器|家电|白电/.test(value)) return "家用电器";
  if (/轻工制造|轻工|包装|家具/.test(value)) return "轻工制造";
  if (/商贸零售|商贸|零售|百货|小商品/.test(value)) return "商贸零售";
  if (/社会服务|旅游|酒店|餐饮|教育/.test(value)) return "社会服务";
  if (/传媒|游戏|互联网|影视|广告/.test(value)) return "传媒";
  if (/环保/.test(value)) return "环保";
  if (/房地产|地产|物业|园区/.test(value)) return "房地产";
  if (/钢铁/.test(value)) return "钢铁";
  if (/美容护理|美容|护理|化妆/.test(value)) return "美容护理";
  if (/纺织服饰|纺织|服饰|鞋服/.test(value)) return "纺织服饰";
  if (legacyUnifiedChinaSectors.has(value)) return value;
  return value;
}

function normalizeGenericSector(sector) {
  const value = String(sector || "").trim();
  const lower = value.toLowerCase();
  if (lower.includes("information technology") || /信息|科技|软件|半导体|电子|计算机/.test(value)) return "信息技术";
  if (lower.includes("financial") || /金融|银行|证券|保险|信托|期货|资本/.test(value)) return "金融";
  if (lower.includes("health care") || /医药|医疗|生物|制药|健康/.test(value)) return "医疗保健";
  if (lower.includes("consumer discretionary") || /可选消费|汽车|家电|旅游|酒店|零售|电商/.test(value)) return "可选消费";
  if (lower.includes("consumer staples") || /主要消费|必需消费|食品|饮料|白酒|农业|乳业|养殖/.test(value)) return "必需消费";
  if (lower.includes("communication") || /通信|传媒|互联网|游戏|运营商/.test(value)) return "通信服务";
  if (lower.includes("industrial") || /工业|机械|军工|航空|航天|运输|建筑|工程/.test(value)) return "工业";
  if (lower.includes("energy") || /能源|石油|煤炭|油气/.test(value)) return "能源";
  if (lower.includes("materials") || /材料|化工|钢铁|有色|金属|稀土|黄金/.test(value)) return "材料";
  if (lower.includes("utilities") || /公用|电力|燃气|水务/.test(value)) return "公用事业";
  if (lower.includes("real estate") || /地产|房地产|物业|园区/.test(value)) return "房地产";
  return value;
}

function getManualSector(item = {}, sectorMarket = "generic") {
  const sectorMap = getLocalSectorMap();
  const candidates = [item.symbol, item.sourceSymbol, item.Symbol, item.Ticker]
    .filter(Boolean)
    .map(normalizeSectorKey);
  for (const candidate of candidates) {
    const mapped = normalizeSector(sectorMap[candidate], sectorMarket);
    if (!isUnclassifiedSector(mapped)) return mapped;
  }
  return "未分类";
}

function resolveSector(item = {}, rawSector = null, sectorMarket = item.sectorMarket || "generic") {
  const rawValue = rawSector ?? item.sector;
  const sourceSector = normalizeSector(rawValue, sectorMarket);
  const manualSector = getManualSector(item, sectorMarket);
  const isLegacyCsiSource = sectorMarket === "csi300" && legacyUnifiedChinaSectors.has(sourceSector);
  const inferred = normalizeSector(inferSectorFromConstituent(item, sectorMarket), sectorMarket);

  if (isLegacyCsiSource && !isUnclassifiedSector(manualSector)) {
    return { sector: manualSector, sectorSource: "manual_map" };
  }
  if (isLegacyCsiSource && !isUnclassifiedSector(inferred)) {
    return { sector: inferred, sectorSource: "rule_infer" };
  }
  if (!isUnclassifiedSector(sourceSector)) {
    return { sector: sourceSector, sectorSource: item.sectorSource || "source_field" };
  }
  if (!isUnclassifiedSector(manualSector)) {
    return { sector: manualSector, sectorSource: "manual_map" };
  }
  if (!isUnclassifiedSector(inferred)) return { sector: inferred, sectorSource: "rule_infer" };
  return { sector: "未分类", sectorSource: "unknown" };
}

function inferSectorFromConstituent(item = {}, sectorMarket = item.sectorMarket || "generic") {
  const name = String(item.name || item.Name || item.Security || item.shortName || "");
  if (sectorMarket === "sp500") {
    if (/bank|financial|insurance|capital|exchange|broker/i.test(name)) return "Financials";
    if (/health|medical|pharma|biotech|therapeutics|life sciences/i.test(name)) return "Health Care";
    if (/software|semiconductor|technology|systems|data|chip|electronics/i.test(name)) return "Information Technology";
    if (/media|telecom|communication|entertainment|interactive/i.test(name)) return "Communication Services";
    if (/retail|auto|hotel|restaurant|travel|apparel|consumer/i.test(name)) return "Consumer Discretionary";
    if (/food|beverage|grocery|staples|tobacco|household/i.test(name)) return "Consumer Staples";
    if (/energy|oil|gas|pipeline|petroleum/i.test(name)) return "Energy";
    if (/chemical|materials|steel|mining|gold|metal|paper|packaging/i.test(name)) return "Materials";
    if (/utility|electric|water|renewable/i.test(name)) return "Utilities";
    if (/real estate|reit|property/i.test(name)) return "Real Estate";
    if (/industrial|aerospace|defense|transport|rail|airline|machinery|construction|logistics/i.test(name)) return "Industrials";
  }
  if (/银行/.test(name)) return "银行";
  if (/证券|保险|金融|信托|期货|资本|人保|太保|人寿|银河|中金|申万/.test(name)) return "非银金融";
  if (/医药|医疗|生物|制药|健康|药业|莱士|同仁堂|爱美客|新产业/.test(name)) return "医药生物";
  if (/酒|食品|饮料|海大|五粮液|古井|金龙鱼|今世缘/.test(name)) return "食品饮料";
  if (/农业|养殖|饲料|新希望/.test(name)) return "农林牧渔";
  if (/宁德|电池|锂能|光伏|储能|阳光电源|隆基|正泰|晶盛|通威|特变/.test(name)) return "电力设备";
  if (/半导体|电子|芯片|光电|电路|华大九天|传音|瑞芯微|豪威|沪硅|东山|鹏鼎|华勤|工业富联|三环/.test(name)) return "电子";
  if (/软件|计算机|中科曙光|金山办公|指南针|软通|三六零|科大讯飞|大华/.test(name)) return "计算机";
  if (/通信|光模块|卫通|中际旭创|新易盛|亿联网络/.test(name)) return "通信";
  if (/军工|航空|航天|中航|航发|成飞|沈飞|光启|中国动力/.test(name)) return "国防军工";
  if (/汽车|客车|赛力斯|福耀|拓普|德赛西威|轮胎|潍柴/.test(name)) return "汽车";
  if (/石油|石化|油气|荣盛|恒力|东方盛虹|中远海能/.test(name)) return "石油石化";
  if (/煤/.test(name)) return "煤炭";
  if (/化工|化学|龙佰|卫星|华鲁|巨化|新和成|合盛/.test(name)) return "基础化工";
  if (/有色|金属|黄金|锂|天齐|山金/.test(name)) return "有色金属";
  if (/水泥|玻璃|建材|海螺|巨石|北新/.test(name)) return "建筑材料";
  if (/建筑|工程|交建|中冶|能建|中国化学|四川路桥/.test(name)) return "建筑装饰";
  if (/港|铁路|航空|运输|圆通|京沪|宁沪|青岛港|宁波港|中远海控|东航|国航/.test(name)) return "交通运输";
  if (/电力|燃气|水务|核电|广核|华电|新奥|华电新能/.test(name)) return "公用事业";
  if (/机械|液压|通号|中微|盛美/.test(name)) return "机械设备";
  if (/家电|三花/.test(name)) return "家用电器";
  if (/零售|小商品/.test(name)) return "商贸零售";
  if (/传媒|游戏|昆仑/.test(name)) return "传媒";
  if (/美容|爱美客/.test(name)) return "美容护理";
  if (/服饰|华利/.test(name)) return "纺织服饰";
  return "未分类";
}
function buildBreadthSample(item, history = [], sectorMarket = item.sectorMarket || "generic") {
  const cleanHistory = history.filter((value) => Number.isFinite(value));
  const sectorInfo = resolveSector({ ...item, sectorMarket }, null, sectorMarket);
  if (cleanHistory.length < 20) {
    return {
      symbol: item.symbol,
      name: item.name,
      sector: sectorInfo.sector,
      sectorSource: sectorInfo.sectorSource,
      sectorMarket,
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
    sector: sectorInfo.sector,
    sectorSource: sectorInfo.sectorSource,
    sectorMarket,
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

function buildSectorBreadth(samples, weighted = false) {
  const groups = new Map();
  for (const sample of samples) {
    const sectorInfo = resolveSector(sample, null, sample.sectorMarket || "generic");
    const sector = sectorInfo.sector;
    if (!groups.has(sector)) {
      groups.set(sector, {
        sector,
        total: 0,
        effective: 0,
        aboveMa20: 0,
        missing: 0,
        weightCovered: 0,
        weightMissing: 0,
        effectiveWeight: 0,
        aboveWeight: 0,
        sourceCounts: { source_field: 0, manual_map: 0, rule_infer: 0, unknown: 0 },
      });
    }
    const group = groups.get(sector);
    group.total += 1;
    group.sourceCounts[sectorInfo.sectorSource] = (group.sourceCounts[sectorInfo.sectorSource] || 0) + 1;
    const hasData = Number.isFinite(sample.price) && Number.isFinite(sample.ma20);
    if (!hasData) {
      group.missing += 1;
      continue;
    }
    group.effective += 1;
    const above = sample.price >= sample.ma20;
    if (above) group.aboveMa20 += 1;
    if (weighted) {
      if (Number.isFinite(sample.weight)) {
        group.weightCovered += 1;
        group.effectiveWeight += sample.weight;
        if (above) group.aboveWeight += sample.weight;
      } else {
        group.weightMissing += 1;
      }
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      breadth: group.effective ? Number(((group.aboveMa20 / group.effective) * 100).toFixed(1)) : null,
      effectiveWeight: Number(group.effectiveWeight.toFixed(4)),
      aboveWeight: Number(group.aboveWeight.toFixed(4)),
      weightedBreadth: group.effectiveWeight ? Number(((group.aboveWeight / group.effectiveWeight) * 100).toFixed(1)) : null,
    }))
    .sort((a, b) => {
      if (isUnclassifiedSector(a.sector) !== isUnclassifiedSector(b.sector)) {
        return isUnclassifiedSector(a.sector) ? 1 : -1;
      }
      return b.effective - a.effective || a.sector.localeCompare(b.sector);
    });
}

function analyzeBreadthDivergence(series, benchmarkSeries) {
  const values = series.map((point) => point.value).filter(Number.isFinite);
  const benchmark = (benchmarkSeries || []).filter(Number.isFinite);
  if (values.length < 22 || benchmark.length < 22) {
    return { type: "neutral", label: "数据不足", detail: "近21个交易日样本不足，暂不判断背离或修复。" };
  }
  const breadthDelta = values.at(-1) - values.at(-22);
  const indexDelta = benchmark.at(-1) - benchmark.at(-22);
  if (indexDelta > 0 && breadthDelta <= -5) {
    return {
      type: "divergence",
      label: "宽度背离",
      detail: `近21个交易日指数趋势上行，但宽度下降 ${Math.abs(breadthDelta).toFixed(1)} 个百分点。`,
    };
  }
  if (indexDelta <= 3 && breadthDelta >= 5) {
    return {
      type: "repair",
      label: "宽度修复",
      detail: `近21个交易日指数未明显走强，但宽度回升 ${breadthDelta.toFixed(1)} 个百分点。`,
    };
  }
  return {
    type: "neutral",
    label: "宽度同步",
    detail: `近21个交易日宽度变化 ${breadthDelta.toFixed(1)} 个百分点，未触发背离或修复。`,
  };
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

function buildLegacyBreadth(appCodes, snapshotInstruments, label, sectorMarket = "generic") {
  const series = buildBreadthSeries(appCodes, snapshotInstruments).map((value) => ({
    value,
    above: null,
    effective: null,
  }));
  const samples = appCodes.map((code) => {
    const instrument = snapshotInstruments[code];
    const history = instrument?.history || [];
    const ma20 = history.length >= 20 ? average(history.slice(-20)) : null;
    const sectorInfo = resolveSector({
      symbol: code,
      sourceSymbol: instrument?.sourceSymbol || code,
      name: instrument?.name || code,
      sectorMarket,
    }, null, sectorMarket);
    return {
      symbol: code,
      name: instrument?.name || code,
      sector: sectorInfo.sector,
      sectorSource: sectorInfo.sectorSource,
      sectorMarket,
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
    sectorBreadth: buildSectorBreadth(publicSamples, false),
    divergence: { type: "neutral", label: "数据不足", detail: "代表样本宽度不判断背离或修复。" },
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

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

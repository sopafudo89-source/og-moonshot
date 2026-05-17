import { DEX_CACHE_SECONDS } from '@/lib/config';

export type TokenData = {
  contract: string;
  name: string;
  symbol: string;
  imageUrl: string;
  priceUsd: number;
  priceFormatted: string;
  change24h: number;
  change24hFormatted: string;
  fdv: number;
  fdvFormatted: string;
  liquidity: number;
  liquidityFormatted: string;
  volume24h: number;
  volume24hFormatted: string;
  buys24h: number;
  sells24h: number;
};

type AnyPair = Record<string, any>;

const DEFAULT_TOKEN_IMAGE =
  'https://dd.dexscreener.com/ds-data/tokens/solana/So11111111111111111111111111111111111111112.png';

const memoryCache = new Map<string, { expiresAt: number; data: TokenData }>();

let tokenProfilesCache: any[] | null = null;
let tokenProfilesCacheExpiresAt = 0;

function normalizeAddress(value?: string | null) {
  return String(value || '').trim().toLowerCase();
}

function toNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatUsd(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '$0';

  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;

  if (value >= 1) return `$${value.toFixed(2)}`;

  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.000001) return `$${value.toFixed(8)}`;

  return `$${value.toExponential(2)}`;
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
    next: {
      revalidate: DEX_CACHE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`DexScreener request failed: ${response.status} ${url}`);
  }

  return response.json();
}

function normalizePairsFromResponse(data: any): AnyPair[] {
  if (Array.isArray(data)) return data.filter(Boolean);
  if (Array.isArray(data?.pairs)) return data.pairs.filter(Boolean);
  if (data?.pair) return [data.pair];
  return [];
}

function dedupePairs(pairs: AnyPair[]) {
  const seen = new Set<string>();
  const result: AnyPair[] = [];

  for (const pair of pairs) {
    const key =
      String(pair?.pairAddress || '') ||
      `${pair?.chainId || ''}:${pair?.dexId || ''}:${pair?.baseToken?.address || ''}:${pair?.quoteToken?.address || ''}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(pair);
  }

  return result;
}

function chooseMainPair(pairs: AnyPair[]) {
  return [...pairs].sort((a, b) => {
    const aLiq = toNumber(a?.liquidity?.usd);
    const bLiq = toNumber(b?.liquidity?.usd);
    return bLiq - aLiq;
  })[0];
}

function findImageInPairs(pairs: AnyPair[]) {
  const pairWithImage = pairs.find((pair) => {
    return Boolean(pair?.info?.imageUrl);
  });

  return pairWithImage?.info?.imageUrl || '';
}

async function getTokenProfileImage(contract: string) {
  try {
    const now = Date.now();

    if (!tokenProfilesCache || now > tokenProfilesCacheExpiresAt) {
      const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
        headers: {
          accept: 'application/json',
        },
        next: {
          revalidate: 300,
        },
      });

      if (!response.ok) return '';

      const data = await response.json();
      tokenProfilesCache = Array.isArray(data) ? data : [];
      tokenProfilesCacheExpiresAt = now + 5 * 60 * 1000;
    }

    const target = normalizeAddress(contract);

    const profile = tokenProfilesCache.find((item) => {
      return (
        normalizeAddress(item?.tokenAddress) === target ||
        normalizeAddress(item?.address) === target
      );
    });

    return profile?.icon || profile?.imageUrl || '';
  } catch {
    return '';
  }
}

async function getPairs(contract: string) {
  const urls = [
    `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(contract)}`,
    `https://api.dexscreener.com/token-pairs/v1/solana/${encodeURIComponent(contract)}`,
  ];

  const settled = await Promise.allSettled(urls.map((url) => fetchJson(url)));

  const allPairs: AnyPair[] = [];

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      allPairs.push(...normalizePairsFromResponse(item.value));
    }
  }

  return dedupePairs(allPairs);
}

export async function getTokenData(contract: string): Promise<TokenData> {
  const cleanContract = String(contract || '').trim();

  if (!cleanContract) {
    throw new Error('Contract is empty');
  }

  const cacheKey = normalizeAddress(cleanContract);
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const pairs = await getPairs(cleanContract);

  if (!pairs.length) {
    throw new Error(`Token not found on DexScreener: ${cleanContract}`);
  }

  const mainPair = chooseMainPair(pairs);

  const name =
    mainPair?.baseToken?.name ||
    mainPair?.baseToken?.symbol ||
    'Unknown Token';

  const symbol =
    mainPair?.baseToken?.symbol ||
    'TOKEN';

  const priceUsd = toNumber(mainPair?.priceUsd);
  const change24h = toNumber(mainPair?.priceChange?.h24);
  const fdv = toNumber(mainPair?.fdv || mainPair?.marketCap);
  const liquidity = toNumber(mainPair?.liquidity?.usd);
  const volume24h = toNumber(mainPair?.volume?.h24);
  const buys24h = toNumber(mainPair?.txns?.h24?.buys);
  const sells24h = toNumber(mainPair?.txns?.h24?.sells);

  const pairImage = mainPair?.info?.imageUrl || '';
  const anyPairImage = findImageInPairs(pairs);
  const profileImage = await getTokenProfileImage(cleanContract);

  const imageUrl =
    pairImage ||
    anyPairImage ||
    profileImage ||
    DEFAULT_TOKEN_IMAGE;

  const data: TokenData = {
    contract: cleanContract,
    name,
    symbol,
    imageUrl,
    priceUsd,
    priceFormatted: formatUsd(priceUsd),
    change24h,
    change24hFormatted: formatPercent(change24h),
    fdv,
    fdvFormatted: formatUsd(fdv),
    liquidity,
    liquidityFormatted: formatUsd(liquidity),
    volume24h,
    volume24hFormatted: formatUsd(volume24h),
    buys24h,
    sells24h,
  };

  memoryCache.set(cacheKey, {
    expiresAt: Date.now() + DEX_CACHE_SECONDS * 1000,
    data,
  });

  return data;
}

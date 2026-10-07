import { DEX_CACHE_SECONDS } from './config';
import { formatPct, formatUsd, safeContract } from './utils';

type DexToken = {
  address?: string;
  name?: string;
  symbol?: string;
};

type DexPair = {
  chainId?: string;
  url?: string;
  baseToken?: DexToken;
  quoteToken?: DexToken;
  priceUsd?: string;
  priceChange?: { h24?: number; h6?: number; h1?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  volume?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  info?: { imageUrl?: string; header?: string; openGraph?: string };
};

export type TokenData = {
  found: boolean;
  contract: string;
  name: string;
  symbol: string;
  imageUrl: string;
  dexUrl: string;
  priceUsd: string;
  priceFormatted: string;
  change24h: number;
  change24hFormatted: string;
  fdvFormatted: string;
  liquidityFormatted: string;
  volume24hFormatted: string;
  buys24h: number;
  sells24h: number;
};

const FALLBACK_IMAGE = 'https://placehold.co/800x800/120426/dc5cff.png?text=TOKEN';

function chooseMainPair(pairs: DexPair[]): DexPair | null {
  if (!pairs.length) return null;
  return pairs
    .slice()
    .sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0))[0];
}

function selectToken(pair: DexPair, contract: string): DexToken {
  const normalized = contract.toLowerCase();
  if (pair.baseToken?.address?.toLowerCase() === normalized) return pair.baseToken;
  if (pair.quoteToken?.address?.toLowerCase() === normalized) return pair.quoteToken;
  return pair.baseToken || pair.quoteToken || {};
}

export async function getTokenData(rawContract: string): Promise<TokenData> {
  const contract = safeContract(rawContract);
  if (!contract) return fallbackToken('', false);

  const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(contract)}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'MoonshotDynamicPreview/1.0',
      },
      next: { revalidate: DEX_CACHE_SECONDS },
    });

    if (!response.ok) return fallbackToken(contract, false);

    const data = (await response.json()) as { pairs?: DexPair[] };
    const pairs = Array.isArray(data.pairs)
      ? data.pairs.filter((pair) => pair.chainId === 'solana')
      : [];

    const mainPair = chooseMainPair(pairs);
    if (!mainPair) return fallbackToken(contract, false);

    const token = selectToken(mainPair, contract);
    const name = token.name || 'Solana Token';
    const symbol = token.symbol || 'TOKEN';
    const price = mainPair.priceUsd || '0';
    const change24h = Number(mainPair.priceChange?.h24 || 0);

    return {
      found: true,
      contract,
      name,
      symbol,
      imageUrl: mainPair.info?.imageUrl || mainPair.info?.openGraph || FALLBACK_IMAGE,
      dexUrl: mainPair.url || '',
      priceUsd: price,
      priceFormatted: formatUsd(price, 4),
      change24h,
      change24hFormatted: formatPct(change24h),
      fdvFormatted: formatUsd(mainPair.marketCap || mainPair.fdv),
      liquidityFormatted: formatUsd(mainPair.liquidity?.usd),
      volume24hFormatted: formatUsd(mainPair.volume?.h24),
      buys24h: Number(mainPair.txns?.h24?.buys || 0),
      sells24h: Number(mainPair.txns?.h24?.sells || 0),
    };
  } catch {
    return fallbackToken(contract, false);
  }
}

export function fallbackToken(contract: string, found = false): TokenData {
  return {
    found,
    contract,
    name: 'Solana Token',
    symbol: 'TOKEN',
    imageUrl: FALLBACK_IMAGE,
    dexUrl: '',
    priceUsd: '0',
    priceFormatted: 'N/A',
    change24h: 0,
    change24hFormatted: '0.00%',
    fdvFormatted: 'N/A',
    liquidityFormatted: 'N/A',
    volume24hFormatted: 'N/A',
    buys24h: 0,
    sells24h: 0,
  };
}

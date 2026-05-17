export const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const LANDING_BASE_URL = (process.env.LANDING_BASE_URL || PUBLIC_BASE_URL).replace(/\/$/, '');

export const DEX_CACHE_SECONDS = Number(process.env.DEX_CACHE_SECONDS || 300);
export const OG_CACHE_SECONDS = Number(process.env.OG_CACHE_SECONDS || 3600);

export const DEFAULT_CONTRACT = '9QSjVAg5rDfBZPhvKwZcB63St3r6bqohP3Adurkjpump';

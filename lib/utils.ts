export function safeContract(value: string | null | undefined): string {
  return String(value || '').trim().replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
}

export function shortAddress(address: string, size = 5): string {
  if (!address) return '';
  if (address.length <= size * 2) return address;
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function formatUsd(value: unknown, digits = 2): string {
  const num = Number(value || 0);
  if (!Number.isFinite(num) || num <= 0) return 'N/A';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(digits)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(digits)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  if (num < 0.01) return `$${num.toPrecision(3)}`;
  return `$${num.toFixed(digits)}`;
}

export function formatPct(value: unknown): string {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0.00%';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

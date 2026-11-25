// Token Launch Radar — entrypoint for make.fun bounty token-radar-01
// Dashboard web: token launch radar with DefiLlama snapshot, pre-token filter,
// implied-value ranking, board/detail/filtered views, and farm steps.

import { fetch } from 'undici';

const DASHBOARD_URL = './index.html';
const DEFILLAMA_API = 'https://api.llama.fi/protocols';
const VERSION = '1.1.0';

interface Protocol {
  name: string;
  symbol: string | null;
  category: string | null;
  tvl: number | null;
  chains: string[] | null;
  description: string | null;
}

interface RadarEntry {
  name: string;
  category: string | null;
  tvl: number;
  impliedValue: number;
  chains: string[];
  isPreToken: boolean;
  farmSteps: string[];
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  CDP: 1.4,
  Lending: 1.3,
  Dex: 1.2,
  Yield: 1.1,
  Options: 1.1,
  Derivatives: 1.1,
  NFT: 1.0,
  Gaming: 1.0,
  Social: 0.9,
  Payments: 0.9,
  Other: 0.8,
};

function isPreToken(p: Protocol): boolean {
  if (p.symbol && p.symbol !== '-') return false;
  if (p.category === 'L2' || p.category === 'Bridge' || p.category === 'Wrapped') return false;
  if (p.name.toLowerCase().includes('wrapped')) return false;
  if (p.name.toLowerCase().includes('staked')) return false;
  return true;
}

function impliedValue(p: Protocol): number {
  const tvl = p.tvl || 0;
  const w = CATEGORY_WEIGHTS[p.category || 'Other'] || 0.8;
  const chainMult = p.chains && p.chains.length > 1 ? 1.15 : 1.0;
  return Math.round(tvl * w * chainMult);
}

// Ranked list accessor used by dashboard board/detail views
export function topEntries(limit: number): RadarEntry[] {
  return radar.slice(0, limit);
}

function farmSteps(name: string, chain: string | null): string[] {
  return [
    `Kunjungi situs resmi ${name} dan siapkan dompet Web3 (Phantom / Solflare).`,
    `Hubungkan dompet ke jaringan ${chain || 'Solana'}.`,
    'Berikan likuiditas atau stake aset yang didukung protokol.',
    'Aktifkan secara teratur untuk mencetak poin / potensi airdrop.',
    'Pantau pengumuman token resmi dari tim protokol.',
  ];
}

async function loadProtocols(): Promise<Protocol[]> {
  const res = await fetch(DEFILLAMA_API, { cache: 'no-store' });
  const raw = await res.json();
  return raw.map((p: any) => ({
    name: p.name,
    symbol: p.symbol,
    category: p.category,
    tvl: p.tvl,
    chains: p.chains,
    description: p.description,
  }));
}

function buildRadar(protocols: Protocol[]): RadarEntry[] {
  return protocols
    .filter(isPreToken)
    .map(p => ({
      name: p.name,
      category: p.category,
      tvl: p.tvl || 0,
      impliedValue: impliedValue(p),
      chains: p.chains || [],
      isPreToken: true,
      farmSteps: farmSteps(p.name, p.chains?.[0] || null),
    }))
    .sort((a, b) => b.impliedValue - a.impliedValue);
}

const radar: RadarEntry[] = [];

export async function initRadar(): Promise<void> {
  try {
    const protocols = await loadProtocols();
    const entries = buildRadar(protocols);
    radar.length = 0;
    radar.push(...entries);
    console.log(`Token Launch Radar: ${entries.length} pre-token protocols ranked`);
  } catch (err) {
    console.error('Gagal memuat snapshot DefiLlama:', err);
  }
}

export { radar, DASHBOARD_URL, isPreToken, impliedValue, buildRadar };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    radar,
    DASHBOARD_URL,
    isPreToken,
    impliedValue,
    buildRadar,
    initRadar,
  };
}

initRadar().catch(() => {
  // Module load should not crash the dashboard
});

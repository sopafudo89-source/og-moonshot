import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { OG_CACHE_SECONDS } from '@/lib/config';
import { getTokenData } from '@/lib/dexscreener';
import { safeContract } from '@/lib/utils';

export const runtime = 'edge';

const SIZE = {
  width: 1200,
  height: 675,
};

function MoonshotLogo({ src }: { src: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 64,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Moonshot"
        width={270}
        height={64}
        style={{
          width: 270,
          height: 64,
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const contract = safeContract(url.searchParams.get('contract'));
  const token = await getTokenData(contract);

  const tokenName = token.name || 'your token';
  const tokenImage = token.imageUrl;
  const logoUrl = new URL('/moonshot-logo.png', request.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: '#090019',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 24% 45%, rgba(143, 44, 255, 0.55), transparent 32%), radial-gradient(circle at 62% 25%, rgba(94, 38, 190, 0.32), transparent 28%), linear-gradient(100deg, #100020 0%, #080014 60%, #05000d 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            opacity: 0.13,
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: -160,
            top: 20,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: 'rgba(149, 36, 255, 0.22)',
            filter: 'blur(45px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: '100%',
            height: '100%',
            padding: '92px 88px 72px 88px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 390,
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 330,
                height: 330,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0b0315',
                border: '6px solid #b13cff',
                boxShadow:
                  '0 0 28px rgba(177,60,255,0.95), 0 0 70px rgba(142,44,255,0.75)',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tokenImage}
                alt={tokenName}
                width={318}
                height={318}
                style={{
                  width: 318,
                  height: 318,
                  objectFit: 'cover',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 650,
              marginLeft: 55,
              marginTop: -12,
            }}
          >
            <MoonshotLogo src={logoUrl} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 28,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 56,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: -1.4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: '#ffb429',
                    marginRight: 17,
                  }}
                >
                  Vote
                </div>

                <div
                  style={{
                    display: 'flex',
                    color: '#ffffff',
                  }}
                >
                  for your token
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 56,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: -1.4,
                  color: '#ffffff',
                }}
              >
                to get&nbsp;
                <div
                  style={{
                    display: 'flex',
                    color: '#ffb429',
                  }}
                >
                  listed!
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 22,
                fontSize: 17,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              Your vote could be the reason why it goes to the moon!
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 32,
                width: 235,
                height: 64,
                borderRadius: 12,
                background: 'linear-gradient(180deg, #ffd45b 0%, #ff8a00 100%)',
                boxShadow: '0 18px 42px rgba(255,138,0,0.25)',
                border: '1px solid rgba(255,226,155,0.35)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#170b00',
                }}
              >
                VOTE NOW
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              position: 'absolute',
              right: 92,
              bottom: 55,
              fontSize: 14,
              color: 'rgba(255,255,255,0.42)',
            }}
          >
            Vote {tokenName} to list on Moonshot
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        'Cache-Control': `public, s-maxage=${OG_CACHE_SECONDS}, stale-while-revalidate=${OG_CACHE_SECONDS}`,
      },
    },
  );
}
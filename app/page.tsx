import { DEFAULT_CONTRACT } from '@/lib/config';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1>Moonshot Dynamic Preview Service</h1>
        <p>Use /vote?contract=TOKEN_ADDRESS for X/Twitter posts.</p>
        <p>
          <a href={`/vote?contract=${DEFAULT_CONTRACT}`}>Open example</a>
        </p>
      </div>
    </main>
  );
}

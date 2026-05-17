# Moonshot Dynamic X/Twitter Previews

Next.js + Vercel проект для динамических preview-карточек под ссылки вида:

```txt
https://vote.mydomain.com/vote?contract=TOKEN_ADDRESS
```

## Что делает

- `/vote?contract=TOKEN` отдаёт динамические meta-теги для X/Twitter.
- `/api/og?contract=TOKEN` генерирует OG-картинку 1200×675 в стиле Moonshot.
- Данные токена тянутся с DexScreener.
- Обычный пользователь после открытия `/vote?...` автоматически редиректится на основной статический ленд.

## Настройка

Создай `.env.local` по примеру:

```env
PUBLIC_BASE_URL=https://vote.mydomain.com
LANDING_BASE_URL=https://landing-domain.com
DEX_CACHE_SECONDS=300
OG_CACHE_SECONDS=3600
```

Где:

- `PUBLIC_BASE_URL` — домен Next/Vercel, который будет вставляться в посты.
- `LANDING_BASE_URL` — домен твоего основного статического ленда.

## Локальный запуск

```bash
npm install
npm run dev
```

Проверка:

```txt
http://localhost:3000/vote?contract=9QSjVAg5rDfBZPhvKwZcB63St3r6bqohP3Adurkjpump
http://localhost:3000/api/og?contract=9QSjVAg5rDfBZPhvKwZcB63St3r6bqohP3Adurkjpump
```

## Проверка для Twitterbot

```powershell
curl.exe -L -A "Twitterbot/1.0" "https://vote.mydomain.com/vote?contract=9QSjVAg5rDfBZPhvKwZcB63St3r6bqohP3Adurkjpump"
```

В ответе должны быть:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://vote.mydomain.com/api/og?contract=...">
```

## Деплой на Vercel

1. Залить проект в GitHub.
2. Import Project в Vercel.
3. Добавить Environment Variables:
   - `PUBLIC_BASE_URL`
   - `LANDING_BASE_URL`
   - `DEX_CACHE_SECONDS`
   - `OG_CACHE_SECONDS`
4. Привязать домен `vote.mydomain.com`.
5. В постах использовать ссылку:

```txt
https://vote.mydomain.com/vote?contract=TOKEN_ADDRESS
```

## Примечание

Для массового постинга лучше сначала открыть `/api/og?contract=...` для части токенов, чтобы Vercel/CDN прогрел кэш. Но это не обязательно.

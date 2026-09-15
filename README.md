# ClearSignal website

Landing site only — fully separate from Telegram bot / trading / indicator code at the repo root.

```
website/     ← all site files live here
indicator_system/, telegram_side/, …  ← trading (untouched)
```

Static HTML. No server on your Mac after you push.

## Local preview

Do **not** Live-Preview the repo root. The trading bots write `logs/` continuously, and Live Server will reload the page on every log line.

```bash
cd website && python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

If you use the Live Server extension, this repo sets `liveServer.settings.root` to `/website` and ignores `logs/` / `state/`. **Restart Live Server** after pulling that setting (stop the current :5500 session and start again from `website/index.html`).

## Publish

GitHub Actions deploys this folder to Pages on every push that touches `website/` (workflow: `.github/workflows/deploy-website.yml`).

One-time setup:

1. Repo → **Settings → Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Push (or run the workflow manually). URL:
   `https://afrexk0.github.io/telegram-crypto-bot/`

Local rebuild after copy / template edits:

```bash
cd website && python3 build.py
```

If the repo name or owner changes, edit `siteUrl` in `assets/js/config.js` and `SITE_URL` in `build.py`, then rebuild.

## Stripe (cards, Apple Pay)

This host cannot create Checkout Sessions (needs a secret key). Use **Payment Links**:

1. [Stripe Dashboard → Payment Links](https://dashboard.stripe.com/payment-links)
2. Create four one-time products (not subscriptions — access is 7/30 days, no auto-renew):
   - Premium weekly · $12
   - Premium monthly · $35
   - Elite weekly · $20
   - Elite monthly · $60
3. After payment, redirect to:
   `https://afrexk0.github.io/telegram-crypto-bot/success.html?plan=PREMIUM_MONTH`
   (and the matching `PREMIUM_WEEK` / `ELITE_WEEK` / `ELITE_MONTH`)
4. Paste each Payment Link URL into `assets/js/config.js` → `stripe`.
5. Push. Until those strings are non-empty, the site offers **USDT only** for that plan.

Activation after Stripe is still Telegram. Card data never touches GitHub Pages.

## Crypto transfer (USDT on Polygon)

Same wallet and verifier as the Telegram MetaMask flow:

- Network: Polygon (137)
- Token: USDT `0xc2132d05d31c914a87c6611c10748aeb04b58e8f`
- Wallet: set in `config.js` (`crypto.wallet`)

User sends the exact amount, then pastes the tx hash in `@clearsignal_trading_bot`.

## Languages

EN (root of this folder), `/de/`, `/fr/`, `/it/`. Copy lives in `i18n.py`. Rebuild HTML after edits.

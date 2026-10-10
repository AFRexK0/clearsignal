/**
 * Public site config — no secrets here.
 *
 * Whop: create one checkout link per plan in your Whop dashboard
 * (Monthly + Yearly for each tier), then paste the URLs into `whop` below.
 * Set each plan's post-purchase redirect to:
 *   {SITE_URL}success.html?plan=PREMIUM_MONTH
 * (or PREMIUM_YEAR / ELITE_MONTH / ELITE_YEAR)
 *
 * Crypto: USDT on Polygon is verified by the existing Telegram bot.
 * After the on-chain transfer, the user pastes the tx hash in Telegram.
 *
 * `amount` is the USDT price and must match the price shown on the site
 * (data-price-month / data-price-year in index.html). Yearly prices are set
 * by hand, not calculated from the monthly price.
 */
window.CS_CONFIG = {
  siteUrl: "https://afrexk0.github.io/telegram-crypto-bot/",
  brand: "ClearSignal",
  telegramBot: "https://t.me/clearsignal_trading_bot",
  telegramBotStart: "https://t.me/clearsignal_trading_bot?start=subscribe",
  telegramPaymentLink: "https://t.me/clearsignal_trading_bot?start=subscribe",
  freeChannel: "https://t.me/clearsignal_trading",
  support: "https://t.me/clearsignal_trading_bot",
  crypto: {
    network: "polygon",
    chainId: 137,
    chainIdHex: "0x89",
    chainName: "Polygon",
    rpcUrls: ["https://polygon-rpc.com", "https://polygon.drpc.org"],
    explorer: "https://polygonscan.com",
    nativeSymbol: "POL",
    usdt: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    usdtDecimals: 6,
    wallet: "0xcD48fcB4F444727010BAA0199652933702917291",
  },
  plans: {
    PREMIUM_MONTH: { tier: "premium", amount: 39, days: 30, billing: "month" },
    PREMIUM_YEAR: { tier: "premium", amount: 390, days: 365, billing: "year" },
    ELITE_MONTH: { tier: "elite", amount: 78, days: 30, billing: "month" },
    ELITE_YEAR: { tier: "elite", amount: 780, days: 365, billing: "year" },
  },
  whop: {
    PREMIUM_MONTH: "",
    PREMIUM_YEAR: "",
    ELITE_MONTH: "",
    ELITE_YEAR: "",
  },
};

/**
 * Public site config — no secrets here.
 *
 * Stripe: create Payment Links in the Stripe Dashboard (one per plan),
 * then paste the URLs below. Success URL should be:
 *   {SITE_URL}success.html?plan=PREMIUM_MONTH
 * (or PREMIUM_WEEK / ELITE_WEEK / ELITE_MONTH)
 *
 * Crypto: USDT on Polygon is verified by the existing Telegram bot.
 * After the on-chain transfer, the user pastes the tx hash in Telegram.
 */
window.CS_CONFIG = {
  siteUrl: "https://afrexk0.github.io/telegram-crypto-bot/",
  brand: "ClearSignal",
  telegramBot: "https://t.me/clearsignal_trading_bot",
  telegramBotStart: "https://t.me/clearsignal_trading_bot?start=subscribe",
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
    PREMIUM_WEEK: { tier: "premium", amount: 12, days: 7, billing: "week" },
    PREMIUM_MONTH: { tier: "premium", amount: 35, days: 30, billing: "month" },
    ELITE_WEEK: { tier: "elite", amount: 20, days: 7, billing: "week" },
    ELITE_MONTH: { tier: "elite", amount: 60, days: 30, billing: "month" },
  },
  stripe: {
    PREMIUM_WEEK: "",
    PREMIUM_MONTH: "",
    ELITE_WEEK: "",
    ELITE_MONTH: "",
  },
};

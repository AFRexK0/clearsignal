/**
 * Public site config — no secrets here.
 *
 * Whop: one checkout link per tier (Signal Room + Signal Circle).
 * Each Whop page handles both monthly and yearly selection.
 * Post-purchase redirect should send back to the site with the plan.
 *
 * Crypto: USDT on Polygon is verified by the existing Telegram bot.
 * After the on-chain transfer, the user pastes the tx hash in Telegram.
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
    SIGNAL_ROOM_MONTH: { tier: "signal_room", tierLabel: "Signal Room", amount: 39, days: 30, billing: "month" },
    SIGNAL_ROOM_YEAR: { tier: "signal_room", tierLabel: "Signal Room", amount: 390, days: 365, billing: "year" },
    SIGNAL_CIRCLE_MONTH: { tier: "signal_circle", tierLabel: "Signal Circle", amount: 78, days: 30, billing: "month" },
    SIGNAL_CIRCLE_YEAR: { tier: "signal_circle", tierLabel: "Signal Circle", amount: 780, days: 365, billing: "year" },
  },
  whop: {
    SIGNAL_ROOM_MONTH: "https://whop.com/clearsignal-dd13/products/crypto-signals-for-beginner-intermediate-traders/",
    SIGNAL_ROOM_YEAR: "https://whop.com/clearsignal-dd13/products/crypto-signals-for-beginner-intermediate-traders/",
    SIGNAL_CIRCLE_MONTH: "",
    SIGNAL_CIRCLE_YEAR: "",
  },
};

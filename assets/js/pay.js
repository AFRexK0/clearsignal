(function () {
  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");
  const directTelegramBtn = document.getElementById("pay-direct-telegram");
  const whopBtn = document.getElementById("pay-whop");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const planButtons = document.querySelectorAll("[data-plan-tier]");

  let selectedPlan = "PREMIUM_MONTH";

  const refreshCheckoutLabel = () => {
    const sub = document.getElementById("checkout-sub");
    const config = window.CS_CONFIG || {};
    const planMeta = config.plans && config.plans[selectedPlan];
    if (!sub) return;

    if (planMeta) {
      sub.textContent = `${planMeta.amount} USDT · ${planMeta.days} days access`;
    } else {
      sub.textContent = "Choose a payment method";
    }
  };

  const openUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openTelegramPurchase = () => {
    const cfg = window.CS_CONFIG || {};
    const base = cfg.telegramPaymentLink || cfg.telegramBotStart || "https://t.me/clearsignal_trading_bot?start=subscribe";
    const url = new URL(base, window.location.href);
    url.searchParams.set("start", "subscribe");
    url.searchParams.set("plan", selectedPlan);

    if (modal) modal.hidden = true;
    openUrl(url.toString());
  };

  const openWhopCheckout = () => {
    const cfg = window.CS_CONFIG || {};
    const link = cfg.whop && cfg.whop[selectedPlan];

    if (link) {
      if (modal) modal.hidden = true;
      openUrl(link);
      return;
    }

    if (toast) {
      toast.textContent = "Whop checkout link is not configured yet. Add it in config.js or use Telegram.";
      toast.classList.add("is-visible");
      setTimeout(() => toast.classList.remove("is-visible"), 2500);
    }
  };

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (modal) modal.hidden = true;
    });
  });

  planButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      selectedPlan = btn.dataset.plan || btn.dataset.planTier.toUpperCase() + "_MONTH";
      refreshCheckoutLabel();
      if (modal) modal.hidden = false;
    });
  });

  if (whopBtn) {
    whopBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openWhopCheckout();
    });
  }

  if (directTelegramBtn) {
    directTelegramBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openTelegramPurchase();
    });
  }

  refreshCheckoutLabel();
})();

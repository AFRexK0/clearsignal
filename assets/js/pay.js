(function () {
  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");
  const directTelegramBtn = document.getElementById("pay-direct-telegram");
  const whopBtn = document.getElementById("pay-whop");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const planButtons = document.querySelectorAll("[data-plan-tier]");

  let selectedPlan = "SIGNAL_ROOM_MONTH";

  const getSelectedPlan = () => selectedPlan;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2500);
  };

  const refreshCheckoutLabel = () => {
    const sub = document.getElementById("checkout-sub");
    const plan = getSelectedPlan();
    const config = window.CS_CONFIG || {};
    const planMeta = config.plans && config.plans[plan];
    if (!sub) return;
    if (planMeta) {
      sub.textContent = `${planMeta.tierLabel || planMeta.tier} · ${planMeta.amount} USDT · ${planMeta.days} days access`;
      return;
    }
    sub.textContent = "Choose a payment method";
  };

  const openUrl = (url) => {
    if (!url) return false;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  };

  const openTelegramPurchase = () => {
    const cfg = window.CS_CONFIG || {};
    const plan = getSelectedPlan();
    const base = cfg.telegramPaymentLink || cfg.telegramBotStart || "https://t.me/clearsignal_trading_bot?start=subscribe";
    const url = new URL(base, window.location.href);
    url.searchParams.set("start", "subscribe");
    url.searchParams.set("plan", plan);

    if (modal) modal.hidden = true;
    openUrl(url.toString());
  };

  const openWhopCheckout = () => {
    const cfg = window.CS_CONFIG || {};
    const plan = getSelectedPlan();
    const link = cfg.whop && cfg.whop[plan];

    if (link) {
      if (modal) modal.hidden = true;
      openUrl(link);
      return;
    }

    const message = (window.CS_I18N && window.CS_I18N.pay && window.CS_I18N.pay.noStripe)
      || "Whop checkout link is not configured yet. Use Telegram.";
    showToast(message);
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

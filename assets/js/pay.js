(function () {
  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");
  const directTelegramBtn = document.getElementById("pay-direct-telegram");
  const whopBtn = document.getElementById("pay-whop");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const planButtons = document.querySelectorAll("[data-plan-tier]");

  let selectedPlan = "PREMIUM_MONTH";

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
      sub.textContent = `${planMeta.amount} USDT · ${planMeta.days} days access`;
      return;
    }
    sub.textContent = "Choose a payment method";
  };

  const openTelegramPurchase = () => {
    const cfg = window.CS_CONFIG || {};
    const plan = getSelectedPlan();
    const base = cfg.telegramPaymentLink || cfg.telegramBotStart || "https://t.me/clearsignal_trading_bot?start=subscribe";
    let url;
    try {
      url = new URL(base);
    } catch {
      url = new URL("https://t.me/clearsignal_trading_bot");
      url.searchParams.set("start", "subscribe");
    }
    url.searchParams.set("plan", plan);
    if (modal) {
      modal.hidden = true;
    }
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const openWhopCheckout = () => {
    const cfg = window.CS_CONFIG || {};
    const plan = getSelectedPlan();
    const link = cfg.whop && cfg.whop[plan];
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      if (modal) modal.hidden = true;
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
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedPlan = btn.dataset.plan || (btn.dataset.planTier.toUpperCase() + "_" + (window.CS_BILLING && window.CS_BILLING() || "MONTH"));
      refreshCheckoutLabel();
      if (modal) {
        modal.hidden = false;
      }
    });
  });

  if (whopBtn) {
    whopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openWhopCheckout();
    });
  }

  if (directTelegramBtn) {
    directTelegramBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openTelegramPurchase();
    });
  }

  refreshCheckoutLabel();
})();

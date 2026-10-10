(function () {
  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");
  const directTelegramBtn = document.getElementById("pay-direct-telegram");
  const whopBtn = document.getElementById("pay-whop");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const planButtons = document.querySelectorAll("[data-plan-tier]");

  const getSelectedPlan = () => {
    const selected = document.querySelector("[data-plan-tier][data-plan]");
    if (selected && selected.dataset.plan) return selected.dataset.plan;
    return "PREMIUM_MONTH";
  };

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
    const url = new URL(base, window.location.href);
    url.searchParams.set("start", "subscribe");
    if (plan) {
      url.searchParams.set("plan", plan);
    }
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
    btn.addEventListener("click", () => {
      const selectedPlan = btn.dataset.plan || "PREMIUM_MONTH";
      document.querySelectorAll("[data-plan-tier]").forEach((el) => {
        el.dataset.plan = el.dataset.plan || el.dataset.planTier.toUpperCase() + "_MONTH";
      });
      btn.dataset.plan = selectedPlan;
      refreshCheckoutLabel();
      if (modal) {
        modal.hidden = false;
      }
    });
  });

  if (whopBtn) {
    whopBtn.addEventListener("click", openWhopCheckout);
  }

  if (directTelegramBtn) {
    directTelegramBtn.addEventListener("click", openTelegramPurchase);
  }

  refreshCheckoutLabel();
})();

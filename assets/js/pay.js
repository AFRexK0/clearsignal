(function () {
  const cfg = window.CS_CONFIG || {};
  const i18n = (window.CS_I18N && window.CS_I18N.pay) || {};

  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");

  // The HTML uses premium/elite; config.js uses SIGNAL_ROOM / SIGNAL_CIRCLE.
  const TIER_ALIAS = { PREMIUM: "SIGNAL_ROOM", ELITE: "SIGNAL_CIRCLE" };
  const normalizePlan = (key) => {
    const m = String(key || "").toUpperCase().match(/^(.*)_(MONTH|YEAR)$/);
    if (!m) return "SIGNAL_ROOM_MONTH";
    return `${TIER_ALIAS[m[1]] || m[1]}_${m[2]}`;
  };

  let selectedPlan = "SIGNAL_ROOM_MONTH";
  const getPlanMeta = () => (cfg.plans && cfg.plans[selectedPlan]) || null;

  const showToast = (message) => {
    if (!toast) { window.alert(message); return; }
    toast.textContent = message;
    toast.classList.add("is-visible");
    Object.assign(toast.style, {
      position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)",
      zIndex: "2147483647", opacity: "1", visibility: "visible", display: "block",
      background: "#111", color: "#fff", padding: "12px 18px", borderRadius: "10px",
      border: "1px solid rgba(255,255,255,.25)", pointerEvents: "none", maxWidth: "90vw",
    });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.style.opacity = "0";
      toast.style.visibility = "hidden";
    }, 3500);
  };

  const openUrl = (url) => {
    if (!url) return false;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  };

  const openModal = () => { if (modal) { modal.hidden = false; modal.style.display = ""; } };
  const closeModal = () => { if (modal) modal.hidden = true; };

  const refreshCheckoutLabel = () => {
    const sub = document.getElementById("checkout-sub");
    const meta = getPlanMeta();
    if (!sub) return;
    sub.textContent = meta
      ? `${meta.tierLabel || meta.tier} · ${meta.billing === "year" ? "Yearly" : "Monthly"} · ${meta.amount} USDT · ${meta.days} days access`
      : "Choose a payment method";
  };

  /* Card: Whop-hosted checkout */
  const openWhopCheckout = () => {
    const link = cfg.whop && cfg.whop[selectedPlan];
    if (link) {
      closeModal();
      openUrl(link);
      return;
    }
    showToast(i18n.noWhop || "Card checkout for this plan is not available yet. Choose Crypto · Telegram bot instead.");
  };

  /* Crypto: handled entirely inside the Telegram bot */
  const openTelegramPurchase = () => {
    const base =
      cfg.telegramPaymentLink || cfg.telegramBotStart || "https://t.me/clearsignal_trading_bot?start=subscribe";
    const url = new URL(base, window.location.href);
    url.searchParams.set("start", "subscribe");
    url.searchParams.set("plan", selectedPlan);
    closeModal();
    openUrl(url.toString());
  };

  document.addEventListener("click", (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;

    const planBtn = t.closest("[data-plan-tier]");
    if (planBtn) {
      event.preventDefault();
      selectedPlan = normalizePlan(planBtn.dataset.plan || `${planBtn.dataset.planTier}_MONTH`);
      refreshCheckoutLabel();
      openModal();
      return;
    }

    if (t.closest("[data-close-modal]") || t === modal) { closeModal(); return; }

    if (t.closest("#pay-whop")) { event.preventDefault(); openWhopCheckout(); return; }
    if (t.closest("#pay-crypto")) { event.preventDefault(); openTelegramPurchase(); }
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  refreshCheckoutLabel();
})();

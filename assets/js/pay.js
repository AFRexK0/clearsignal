(function () {
  const cfg = window.CS_CONFIG || {};
  const i18n = window.CS_I18N || {};
  const t = (k, fallback) => k.split(".").reduce((o, p) => (o || {})[p], i18n) || fallback || k;

  const modal = document.getElementById("checkout");
  const titleEl = document.getElementById("checkout-title");
  const subEl = document.getElementById("checkout-sub");
  const stripeBtn = document.getElementById("pay-stripe");
  const cryptoBtn = document.getElementById("pay-crypto");
  const cryptoBox = document.getElementById("crypto-box");
  const addrEl = document.getElementById("pay-address");
  const amtEl = document.getElementById("pay-amount");
  const netEl = document.getElementById("pay-network");
  const statusEl = document.getElementById("pay-status");
  const mmBtn = document.getElementById("pay-metamask");
  const tgBtn = document.getElementById("pay-telegram");
  const toast = document.getElementById("toast");

  let currentPlan = "PREMIUM_MONTH";

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    setTimeout(() => toast.classList.remove("on"), 2400);
  }

  function copy(text) {
    navigator.clipboard.writeText(text).then(
      () => showToast(t("pay.copied", "Copied")),
      () => showToast(text)
    );
  }

  function planMeta(key) {
    return (cfg.plans && cfg.plans[key]) || cfg.plans.PREMIUM_MONTH;
  }

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function openCheckout(planKey) {
    currentPlan = planKey;
    const meta = planMeta(planKey);
    const label = t(`plans.${planKey}.name`, planKey.replace("_", " · "));
    if (titleEl) titleEl.textContent = t("pay.title", "Checkout") + " — " + label;
    if (subEl) {
      subEl.textContent = t("pay.sub", "{amount} USDT · {days} days")
        .replace("{amount}", meta.amount)
        .replace("{days}", meta.days);
    }
    if (addrEl) addrEl.textContent = cfg.crypto.wallet;
    if (amtEl) amtEl.textContent = String(meta.amount) + " USDT";
    if (netEl) netEl.textContent = cfg.crypto.chainName + " · USDT";
    if (cryptoBox) cryptoBox.classList.remove("on");
    stripeBtn?.classList.remove("is-on");
    cryptoBtn?.classList.remove("is-on");
    setStatus("");
    const stripeUrl = cfg.stripe && cfg.stripe[planKey];
    if (stripeBtn) {
      stripeBtn.disabled = false;
      stripeBtn.querySelector("strong").textContent = t("pay.card", "Card · Stripe");
      stripeBtn.querySelector("span").textContent = stripeUrl
        ? t("pay.cardHint", "Apple Pay, cards, Link")
        : t("pay.cardSoon", "Add Payment Links in config.js");
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      if (!plan || plan === "FREE") {
        window.location.href = cfg.freeChannel;
        return;
      }
      openCheckout(plan);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) =>
    el.addEventListener("click", closeCheckout)
  );
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeCheckout();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeCheckout();
  });

  stripeBtn?.addEventListener("click", () => {
    stripeBtn.classList.add("is-on");
    cryptoBtn?.classList.remove("is-on");
    cryptoBox?.classList.remove("on");
    const url = cfg.stripe && cfg.stripe[currentPlan];
    if (!url) {
      setStatus(t("pay.noStripe", "Stripe Payment Links are not configured yet. Pay with USDT or open Telegram."), "err");
      return;
    }
    window.location.href = url;
  });

  cryptoBtn?.addEventListener("click", () => {
    cryptoBtn.classList.add("is-on");
    stripeBtn?.classList.remove("is-on");
    cryptoBox?.classList.add("on");
    setStatus(t("pay.cryptoHint", "Send the exact USDT amount on Polygon, then activate in Telegram."));
  });

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.dataset.copy;
      const node = document.querySelector(sel);
      if (node) copy(node.textContent.trim());
    });
  });

  tgBtn?.addEventListener("click", () => {
    window.open(cfg.telegramBotStart, "_blank", "noopener");
  });

  function encodeTransfer(to, units) {
    const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
    const amt = BigInt(units).toString(16).padStart(64, "0");
    return "0xa9059cbb" + addr + amt;
  }

  async function ensurePolygon() {
    const eth = window.ethereum;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: cfg.crypto.chainIdHex }],
      });
    } catch (err) {
      if (err && (err.code === 4902 || err.code === -32603)) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: cfg.crypto.chainIdHex,
              chainName: "Polygon",
              nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
              rpcUrls: cfg.crypto.rpcUrls,
              blockExplorerUrls: [cfg.crypto.explorer],
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  mmBtn?.addEventListener("click", async () => {
    const eth = window.ethereum;
    if (!eth) {
      setStatus(t("pay.noWallet", "No wallet found. Use MetaMask, Rabby, or copy the address."), "err");
      return;
    }
    const meta = planMeta(currentPlan);
    const units = BigInt(meta.amount) * 10n ** BigInt(cfg.crypto.usdtDecimals);
    try {
      setStatus(t("pay.connecting", "Connecting wallet…"));
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      await ensurePolygon();
      setStatus(t("pay.confirm", "Confirm the USDT transfer in your wallet…"));
      const tx = await eth.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: cfg.crypto.usdt,
            data: encodeTransfer(cfg.crypto.wallet, units),
            value: "0x0",
          },
        ],
      });
      const url = `${cfg.crypto.explorer}/tx/${tx}`;
      setStatus(t("pay.sent", "Sent. Open Telegram and paste this hash to activate: ") + tx, "ok");
      const hashNode = document.getElementById("pay-hash");
      if (hashNode) {
        hashNode.hidden = false;
        hashNode.querySelector("code").textContent = tx;
        hashNode.querySelector("a").href = url;
      }
    } catch (err) {
      const msg = (err && (err.message || err.data?.message)) || t("pay.rejected", "Transaction cancelled.");
      setStatus(msg, "err");
    }
  });

  window.CS_OPEN_CHECKOUT = openCheckout;
})();

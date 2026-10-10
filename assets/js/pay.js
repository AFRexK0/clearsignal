(function () {
  const cfg = window.CS_CONFIG || {};
  const i18n = (window.CS_I18N && window.CS_I18N.pay) || {};

  const modal = document.getElementById("checkout");
  const toast = document.getElementById("toast");
  const whopBtn = document.getElementById("pay-whop");
  const cryptoBtn = document.getElementById("pay-crypto");
  const telegramBtn = document.getElementById("pay-telegram");
  const walletBtn = document.getElementById("pay-metamask");
  const cryptoBox = document.getElementById("crypto-box");
  const statusEl = document.getElementById("pay-status");
  const hashRow = document.getElementById("pay-hash");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const planButtons = document.querySelectorAll("[data-plan-tier]");

  // The HTML uses premium/elite; config.js uses SIGNAL_ROOM / SIGNAL_CIRCLE.
  const TIER_ALIAS = { PREMIUM: "SIGNAL_ROOM", ELITE: "SIGNAL_CIRCLE" };
  const normalizePlan = (key) => {
    const m = String(key || "").toUpperCase().match(/^(.*)_(MONTH|YEAR)$/);
    if (!m) return "SIGNAL_ROOM_MONTH";
    return `${TIER_ALIAS[m[1]] || m[1]}_${m[2]}`;
  };

  let selectedPlan = "SIGNAL_ROOM_MONTH";
  const getPlanMeta = () => (cfg.plans && cfg.plans[selectedPlan]) || null;

  /* ——— helpers ——— */
  const showToast = (message) => {
    if (!toast) { window.alert(message); return; }
    toast.textContent = message;
    toast.classList.add("is-visible");
    // Inline styles so the toast shows above the modal even if the CSS doesn't
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

  const setStatus = (message) => {
    if (statusEl) statusEl.textContent = message || "";
  };

  const openUrl = (url) => {
    if (!url) return false;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  };

  const showCryptoBox = (show) => {
    if (!cryptoBox) return;
    cryptoBox.hidden = !show;
    cryptoBox.classList.toggle("is-open", show);
    cryptoBox.style.display = show ? "block" : "none";
  };

  const showHashRow = (show) => {
    if (!hashRow) return;
    hashRow.hidden = !show;
    hashRow.style.display = show ? "flex" : "none";
  };

  const openModal = () => {
    if (!modal) return;
    modal.hidden = false;
    modal.style.display = "";
  };
  const closeModal = () => {
    if (modal) modal.hidden = true;
  };

  const refreshCheckoutLabel = () => {
    const sub = document.getElementById("checkout-sub");
    const meta = getPlanMeta();
    if (!sub) return;
    sub.textContent = meta
      ? `${meta.tierLabel || meta.tier} · ${meta.billing === "year" ? "Yearly" : "Monthly"} · ${meta.amount} USDT · ${meta.days} days access`
      : "Choose a payment method";
  };

  const fillCryptoDetails = () => {
    const meta = getPlanMeta();
    const c = cfg.crypto || {};
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set("pay-network", `USDT · ${c.chainName || "Polygon"} (chain ${c.chainId || 137})`);
    set("pay-amount", meta ? String(meta.amount) : "");
    set("pay-address", c.wallet || "");
  };

  /* ——— Whop ——— */
  const openWhopCheckout = () => {
    const link = cfg.whop && cfg.whop[selectedPlan];
    if (link) {
      closeModal();
      openUrl(link);
      return;
    }
    showToast(i18n.noWhop || "Whop link for this plan is not configured yet. Use USDT or Telegram.");
  };

  /* ——— Telegram ——— */
  const openTelegramPurchase = () => {
    const base =
      cfg.telegramPaymentLink || cfg.telegramBotStart || "https://t.me/clearsignal_trading_bot?start=subscribe";
    const url = new URL(base, window.location.href);
    url.searchParams.set("start", "subscribe");
    url.searchParams.set("plan", selectedPlan);
    closeModal();
    openUrl(url.toString());
  };

  /* ——— Copy buttons ——— */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
      return ok;
    }
  };

  /* ——— Wallet (MetaMask etc.) USDT transfer ——— */
  const encodeTransfer = (to, amountUnits) => {
    const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
    const amt = amountUnits.toString(16).padStart(64, "0");
    return "0xa9059cbb" + addr + amt;
  };

  const ensurePolygon = async (eth) => {
    const c = cfg.crypto;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: c.chainIdHex }] });
    } catch (err) {
      if (err && (err.code === 4902 || err.code === -32603)) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: c.chainIdHex,
            chainName: c.chainName,
            nativeCurrency: { name: c.nativeSymbol, symbol: c.nativeSymbol, decimals: 18 },
            rpcUrls: c.rpcUrls,
            blockExplorerUrls: [c.explorer],
          }],
        });
      } else {
        throw err;
      }
    }
  };

  const sendWithWallet = async () => {
    const eth = window.ethereum;
    const meta = getPlanMeta();
    const c = cfg.crypto || {};
    if (!eth) {
      setStatus(i18n.noWallet || "No injected wallet. Copy the address or install MetaMask.");
      showToast(i18n.noWallet || "No wallet found");
      return;
    }
    if (!meta) return;

    try {
      setStatus(i18n.connecting || "Connecting wallet…");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      await ensurePolygon(eth);

      setStatus(i18n.confirm || "Confirm the USDT transfer…");
      const units = BigInt(meta.amount) * 10n ** BigInt(c.usdtDecimals || 6);
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [{
          from: accounts[0],
          to: c.usdt,
          data: encodeTransfer(c.wallet, units),
          value: "0x0",
        }],
      });

      setStatus((i18n.sent || "Sent. Paste this hash in Telegram: ") + txHash);
      if (hashRow) {
        showHashRow(true);
        const code = hashRow.querySelector("code");
        const link = hashRow.querySelector("a");
        if (code) code.textContent = txHash;
        if (link) link.href = `${c.explorer}/tx/${txHash}`;
      }
    } catch (err) {
      if (err && err.code === 4001) {
        setStatus(i18n.rejected || "Transaction cancelled.");
      } else {
        setStatus((err && err.message) || "Wallet error.");
      }
    }
  };

  /* ——— Wire up (one delegated, capture-phase listener) ——— */
  document.addEventListener("click", (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;

    const planBtn = t.closest("[data-plan-tier]");
    if (planBtn) {
      event.preventDefault();
      selectedPlan = normalizePlan(planBtn.dataset.plan || `${planBtn.dataset.planTier}_MONTH`);
      console.log("[pay.js] plan selected:", selectedPlan);
      refreshCheckoutLabel();
      showCryptoBox(false);
      setStatus("");
      showHashRow(false);
      openModal();
      return;
    }

    if (t.closest("[data-close-modal]")) { closeModal(); return; }
    if (t === modal) { closeModal(); return; }

    if (t.closest("#pay-whop")) { event.preventDefault(); console.log("[pay.js] whop"); openWhopCheckout(); return; }
    if (t.closest("#pay-crypto")) { event.preventDefault(); console.log("[pay.js] crypto"); fillCryptoDetails(); showCryptoBox(true); return; }
    if (t.closest("#pay-telegram")) { event.preventDefault(); console.log("[pay.js] telegram"); openTelegramPurchase(); return; }
    if (t.closest("#pay-metamask")) { event.preventDefault(); console.log("[pay.js] wallet"); sendWithWallet(); return; }

    const copyBtn = t.closest("[data-copy]");
    if (copyBtn) {
      event.preventDefault();
      const target = document.querySelector(copyBtn.dataset.copy);
      if (target) copyText(target.textContent.trim()).then((ok) => showToast(ok ? (i18n.copied || "Copied") : "Copy failed"));
    }
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  console.log("[pay.js] v2 loaded");
  showCryptoBox(false);
  showHashRow(false);
  refreshCheckoutLabel();
})();

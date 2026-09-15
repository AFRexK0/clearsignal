(function () {
  const docEl = document.documentElement;
  docEl.classList.add("js");

  const nav = document.querySelector(".nav");
  const links = document.querySelector(".nav-links");
  const menuBtn = document.querySelector(".menu-btn");
  const billing = document.querySelector(".billing");
  const billingBtns = [...document.querySelectorAll("[data-billing]")];
  const priceAmounts = [...document.querySelectorAll("[data-price-week]")];
  const planBtns = document.querySelectorAll("[data-plan-tier]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-on", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  menuBtn?.addEventListener("click", () => links?.classList.toggle("open"));
  links?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );

  /* ——— Scroll reveals: fire only when entering the viewport ——— */
  const reveals = [...document.querySelectorAll(".reveal")];

  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    document.querySelectorAll(".price-grid, .feature-grid, .engines, .pay-methods, .faq").forEach((grid) => {
      [...grid.querySelectorAll(":scope > .reveal")].forEach((el, i) => {
        el.style.setProperty("--d", i * 70 + "ms");
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        // Start a touch before the element is fully on screen
        rootMargin: "0px 0px -12% 0px",
      }
    );

    reveals.forEach((el) => io.observe(el));
  }

  /* ——— FAQ open / close ——— */
  document.querySelectorAll(".faq details").forEach((details) => {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".faq-body");
    if (!summary || !body) return;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (reduceMotion) {
        details.open = !details.open;
        body.style.gridTemplateRows = details.open ? "1fr" : "0fr";
        return;
      }
      if (details.open) {
        body.style.gridTemplateRows = "0fr";
        const done = (ev) => {
          if (ev.propertyName !== "grid-template-rows") return;
          details.open = false;
          body.removeEventListener("transitionend", done);
        };
        body.addEventListener("transitionend", done);
      } else {
        details.open = true;
        body.style.gridTemplateRows = "0fr";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            body.style.gridTemplateRows = "1fr";
          });
        });
      }
    });
  });

  /* ——— Billing toggle: sliding pill + price face swap ——— */
  let billingMode = "month";
  let swapping = false;

  const ensurePill = () => {
    if (!billing || billing.querySelector(".billing-pill")) return;
    const pill = document.createElement("span");
    pill.className = "billing-pill";
    pill.setAttribute("aria-hidden", "true");
    billing.prepend(pill);
  };

  const movePill = () => {
    const pill = billing?.querySelector(".billing-pill");
    const active = billing?.querySelector("[data-billing].is-on");
    if (!pill || !active || !billing) return;
    const br = billing.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    pill.style.width = ar.width + "px";
    pill.style.transform = `translateX(${ar.left - br.left - 4}px)`;
  };

  const formatPrice = (el) =>
    billingMode === "week"
      ? `$${el.dataset.priceWeek}<small> /wk</small>`
      : `$${el.dataset.priceMonth}<small> /mo</small>`;

  const swapAmount = (el) =>
    new Promise((resolve) => {
      const next = formatPrice(el);
      if (reduceMotion) {
        el.innerHTML = next;
        resolve();
        return;
      }

      let face = el.querySelector(".amount-face");
      if (!face) {
        face = document.createElement("span");
        face.className = "amount-face";
        face.innerHTML = el.innerHTML;
        el.textContent = "";
        el.appendChild(face);
      }

      const incoming = document.createElement("span");
      incoming.className = "amount-face amount-face--in";
      incoming.innerHTML = next;
      el.appendChild(incoming);

      // Force layout so the enter transition runs
      void incoming.offsetWidth;
      face.classList.add("amount-face--out");
      incoming.classList.add("amount-face--show");

      const finish = () => {
        face.remove();
        incoming.classList.remove("amount-face--in", "amount-face--show");
        resolve();
      };
      incoming.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 500);
    });

  const applyBilling = async (animateAmounts) => {
    billingBtns.forEach((b) => b.classList.toggle("is-on", b.dataset.billing === billingMode));
    movePill();

    planBtns.forEach((btn) => {
      const tier = btn.dataset.planTier;
      if (!tier || tier === "free") return;
      btn.dataset.plan = `${tier.toUpperCase()}_${billingMode === "week" ? "WEEK" : "MONTH"}`;
    });

    document.querySelectorAll("[data-save]").forEach((el) => {
      el.hidden = billingMode !== "month";
      el.classList.toggle("is-shown", billingMode === "month");
    });

    if (!animateAmounts) {
      priceAmounts.forEach((el) => {
        el.innerHTML = `<span class="amount-face">${formatPrice(el)}</span>`;
      });
      return;
    }

    if (swapping) return;
    swapping = true;
    await Promise.all(priceAmounts.map(swapAmount));
    swapping = false;
  };

  ensurePill();
  applyBilling(false);
  requestAnimationFrame(movePill);
  window.addEventListener("resize", movePill);
  window.addEventListener("load", movePill);

  billingBtns.forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.billing === billingMode) return;
      billingMode = b.dataset.billing;
      applyBilling(true);
    })
  );

  window.CS_BILLING = () => billingMode;
})();

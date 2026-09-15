#!/usr/bin/env python3
"""Generate static GitHub Pages HTML from template.html + i18n.py."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

from i18n import LANGS

ROOT = Path(__file__).resolve().parent
SITE_URL = "https://afrexk0.github.io/telegram-crypto-bot/"
TELEGRAM_BOT = "https://t.me/clearsignal_trading_bot"
FREE_CHANNEL = "https://t.me/clearsignal_trading"
PLACEHOLDER = re.compile(r"\{\{([a-zA-Z0-9_.]+)\}\}")


def lookup(data: dict, path: str):
    cur = data
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def js_i18n(data: dict) -> dict:
    return {"pay": data.get("pay") or {}, "plans": data.get("plans") or {}}


def json_ld(lang: str, data: dict, canonical: str) -> str:
    faqs = []
    faq = data["faq"]
    for i in range(1, 9):
        faqs.append(
            {
                "@type": "Question",
                "name": faq[f"q{i}"],
                "acceptedAnswer": {"@type": "Answer", "text": faq[f"a{i}"]},
            }
        )
    payload = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "name": "ClearSignal",
                "url": SITE_URL,
                "logo": SITE_URL + "assets/img/favicon.svg",
                "sameAs": [TELEGRAM_BOT, FREE_CHANNEL],
            },
            {
                "@type": "WebSite",
                "name": "ClearSignal",
                "url": canonical,
                "inLanguage": lang,
                "description": data["meta"]["description"],
            },
            {
                "@type": "SoftwareApplication",
                "name": "ClearSignal",
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Telegram",
                "offers": [
                    {
                        "@type": "Offer",
                        "name": "Premium monthly",
                        "price": "35",
                        "priceCurrency": "USD",
                    },
                    {
                        "@type": "Offer",
                        "name": "Elite monthly",
                        "price": "60",
                        "priceCurrency": "USD",
                    },
                ],
            },
            {"@type": "FAQPage", "mainEntity": faqs},
        ],
    }
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def render(template: str, ctx: dict) -> str:
    def repl(match: re.Match) -> str:
        key = match.group(1)
        val = lookup(ctx, key)
        if val is None:
            return match.group(0)
        if key.endswith("_html") or key in {"json_ld", "i18n_json"}:
            return str(val)
        return html.escape(str(val), quote=True)

    return PLACEHOLDER.sub(repl, template)


def page_url(code: str) -> str:
    rel = LANGS[code]["dir"]
    return SITE_URL + rel


def write_success(code: str, data: dict) -> None:
    prefix = "../" if code != "en" else ""
    home = "../" if code != "en" else "./"
    html_out = f"""<!DOCTYPE html>
<html lang="{code}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(data["success"]["title"])} · ClearSignal</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="{prefix}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{prefix}assets/css/site.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <main class="section">
    <div class="wrap" style="max-width:640px;padding-top:80px">
      <p class="kicker">ClearSignal</p>
      <h1>{html.escape(data["success"]["title"])}</h1>
      <p class="lede">{html.escape(data["success"]["body"])}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="{TELEGRAM_BOT}?start=subscribe">{html.escape(data["success"]["cta"])}</a>
        <a class="btn btn-ghost" href="{home}">{html.escape(data["success"]["home"])}</a>
      </div>
    </div>
  </main>
</body>
</html>
"""
    dest_dir = ROOT if code == "en" else ROOT / code
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / "success.html").write_text(html_out, encoding="utf-8")


def main() -> None:
    template = (ROOT / "template.html").read_text(encoding="utf-8")
    urls = {code: page_url(code) for code in LANGS}

    for code, meta in LANGS.items():
        data = meta["data"]
        asset_prefix = "../" if code != "en" else ""
        home_href = "./" if code == "en" else "../"
        path = {
            "en": home_href if code != "en" else "./",
            "de": ("de/" if code == "en" else "../de/"),
            "fr": ("fr/" if code == "en" else "../fr/"),
            "it": ("it/" if code == "en" else "../it/"),
        }
        if code == "de":
            path["de"] = "./"
        if code == "fr":
            path["fr"] = "./"
        if code == "it":
            path["it"] = "./"
        if code == "en":
            path["en"] = "./"

        ctx = {
            **data,
            "lang": code,
            "asset_prefix": asset_prefix,
            "canonical": urls[code],
            "hreflang_en": urls["en"],
            "hreflang_de": urls["de"],
            "hreflang_fr": urls["fr"],
            "hreflang_it": urls["it"],
            "og_locale": meta["locale"],
            "og_image": SITE_URL + "assets/img/favicon.svg",
            "home_href": "./" if code == "en" else "../",
            "path_en": "../" if code != "en" else "./",
            "path_de": "./" if code == "de" else ("de/" if code == "en" else "../de/"),
            "path_fr": "./" if code == "fr" else ("fr/" if code == "en" else "../fr/"),
            "path_it": "./" if code == "it" else ("it/" if code == "en" else "../it/"),
            "lang_en_class": "is-active" if code == "en" else "",
            "lang_de_class": "is-active" if code == "de" else "",
            "lang_fr_class": "is-active" if code == "fr" else "",
            "lang_it_class": "is-active" if code == "it" else "",
            "telegram_bot": TELEGRAM_BOT,
            "free_channel": FREE_CHANNEL,
            "json_ld": json_ld(code, data, urls[code]),
            "i18n_json": json.dumps(js_i18n(data), ensure_ascii=False),
        }
        out = render(template, ctx)
        dest_dir = ROOT if code == "en" else ROOT / code
        dest_dir.mkdir(parents=True, exist_ok=True)
        (dest_dir / "index.html").write_text(out, encoding="utf-8")
        write_success(code, data)
        print("wrote", dest_dir / "index.html")

    sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    for code in LANGS:
        sitemap.append("  <url>")
        sitemap.append(f"    <loc>{urls[code]}</loc>")
        sitemap.append("    <changefreq>weekly</changefreq>")
        sitemap.append("    <priority>0.8</priority>")
        for alt in LANGS:
            sitemap.append(
                f'    <xhtml:link rel="alternate" hreflang="{alt}" href="{urls[alt]}"/>'
            )
        sitemap.append(
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{urls["en"]}"/>'
        )
        sitemap.append("  </url>")
    sitemap.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap), encoding="utf-8")

    robots = f"""User-agent: *
Allow: /

Sitemap: {SITE_URL}sitemap.xml
"""
    (ROOT / "robots.txt").write_text(robots, encoding="utf-8")

    (ROOT / "404.html").write_text(
        f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Not found · ClearSignal</title>
  <link rel="canonical" href="{SITE_URL}">
  <link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
  <main class="section">
    <div class="wrap" style="max-width:640px;padding-top:80px">
      <p class="kicker">ClearSignal</p>
      <h1>Page not found</h1>
      <p class="lede">That URL is not part of the site.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="{SITE_URL}">Back to ClearSignal</a>
      </div>
    </div>
  </main>
</body>
</html>
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

# astro-noindex

Build-time noindex protection for Astro sites.

`astro-noindex` is a **static-first Astro integration** that automatically injects a
`<meta name="robots" content="noindex, nofollow">` tag into generated HTML **for non-production builds**.

It is designed to prevent **staging, preview, and development sites** from being indexed by search engines — without relying on runtime logic, middleware, or adapters.

---

## Why this plugin exists

Accidental indexing of staging or preview sites is a common and expensive SEO mistake.

Examples:
- `staging.example.com` indexed in Google
- Cloudflare preview URLs appearing in search
- Test deployments outranking production pages
- Duplicate content penalties

`astro-noindex` solves this **once, permanently, and safely** at build time.

---

## What it does (v1)

On `astro build`, the plugin:

- Checks the configured `site` hostname
- Compares it against an explicit allow-list
- If the hostname is **not allowed**:
  - Injects `<meta name="robots" content="noindex, nofollow">`
  - Applies it to **all generated HTML files**
- Never overrides an existing `robots` meta tag
- Never runs at runtime

---

## What it does NOT do

- ❌ No runtime middleware
- ❌ No Astro internals
- ❌ No server adapters
- ❌ No environment variable guessing
- ❌ No automatic subdomain inference

Everything is **explicit and deterministic**.

---

## Installation

```bash
npm install astro-noindex
```

---

## Usage

Add the integration to your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroNoIndex from "astro-noindex";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    astroNoIndex({
      allow: ["example.com", "www.example.com"]
    })
  ]
});
```

---

## How allow-listing works

Only **exact hostnames** listed in `allow` are indexable.

| Site hostname | Result |
|--------------|-------|
| `example.com` | ✅ Indexed |
| `www.example.com` | ✅ Indexed |
| `staging.example.com` | ❌ noindex |
| `preview.example.com` | ❌ noindex |
| `localhost` | ❌ noindex |
| `site` undefined | ❌ noindex |

This explicit behaviour is intentional and safe.

---

## Example output

For non-allowed sites, generated HTML will include:

```html
<meta name="robots" content="noindex, nofollow">
```

Inserted inside `<head>`.

---

## Respecting user intent

If a page already contains:

```html
<meta name="robots" content="index, follow">
```

`astro-noindex` **does nothing**.

Your explicit SEO decisions always win.

---

## Output guarantees

- Static-only
- Deterministic
- One-time injection
- Public-safe HTML
- Adapter-agnostic

---

## Versioning

- **v1.x** — static HTML mutation only

---

## License

MIT

---

## Author

Built and maintained by **Velohost**  
https://velohost.co.uk/

Project homepage:  
https://velohost.co.uk/plugins/astro-noindex/

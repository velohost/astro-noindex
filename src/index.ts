import type { AstroIntegration } from "astro";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type NoIndexOptions = {
  /**
   * Exact hostnames that are allowed to be indexed.
   *
   * Examples:
   * - "example.com"
   * - "www.example.com"
   *
   * Any hostname NOT explicitly listed here
   * will receive a noindex directive.
   */
  allow: string[];
};

/**
 * astro-noindex
 *
 * Build-time noindex protection for Astro.
 *
 * v1 behaviour:
 * - Runs after build completes
 * - Mutates generated HTML files only
 * - Injects <meta name="robots" content="noindex, nofollow">
 * - Never overrides existing robots meta tags
 * - Fully static and adapter-agnostic
 */
export default function astroNoIndex(
  options: NoIndexOptions
): AstroIntegration {
  /**
   * Decided once during config setup.
   * Used later during astro:build:done.
   */
  let shouldInject = true;

  return {
    name: "astro-noindex",

    hooks: {
      /**
       * Decide whether indexing is allowed.
       *
       * This runs early and exactly once.
       */
      "astro:config:setup"({ config }) {
        const site = config.site;
        let hostname: string | null = null;

        if (typeof site === "string") {
          try {
            hostname = new URL(site).hostname;
          } catch {
            hostname = null;
          }
        }

        /**
         * Indexing is allowed ONLY if the hostname
         * exactly matches one of the allowed values.
         *
         * No subdomain inference.
         * No guessing.
         * Explicit is safer.
         */
        const isAllowed =
          hostname !== null &&
          options.allow.includes(hostname);

        shouldInject = !isAllowed;
      },

      /**
       * Post-build HTML mutation.
       *
       * This runs only if shouldInject === true.
       */
      "astro:build:done"({ dir }) {
        if (!shouldInject) return;

        const outDir = fileURLToPath(dir);

        walk(outDir, filePath => {
          if (!filePath.endsWith(".html")) return;

          const html = fs.readFileSync(filePath, "utf-8");

          /**
           * Respect user intent:
           * If a robots meta tag already exists,
           * do not override it.
           */
          if (/<meta\s+name=["']robots["']/i.test(html)) {
            return;
          }

          /**
           * Inject immediately after <head>.
           */
          const updated = html.replace(
            /<head([^>]*)>/i,
            `<head$1>\n    <meta name="robots" content="noindex, nofollow">`
          );

          if (updated !== html) {
            fs.writeFileSync(filePath, updated, "utf-8");
          }
        });

        console.log("[astro-noindex] injected noindex into HTML output");
      }
    }
  };
}

/**
 * Recursively walk a directory.
 *
 * This is safe because:
 * - Astro output is static
 * - We only mutate .html files
 */
function walk(dir: string, cb: (file: string) => void): void {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, cb);
    } else {
      cb(fullPath);
    }
  }
}

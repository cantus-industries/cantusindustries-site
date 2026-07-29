# cantusindustries.com

Single-page static site plus one serverless function (the desk agent).
Built to `cantus-website-spec.md` v1.1.

```
index.html                      the entire site (inline CSS/JS, no CDNs)
netlify.toml                    publish + functions config
package.json                    one dependency: @netlify/blobs
netlify/functions/ask.mjs       the desk agent proxy (six-layer defense)
netlify/functions/corpus.md     the agent's only source of truth
```

## Deploy

1. Push this directory to a repo (or drag-drop to Netlify — but functions
   require a repo-linked or CLI deploy, so prefer `netlify deploy`).
2. In Netlify site settings → Environment variables:
   - `ANTHROPIC_API_KEY` — **a dedicated key for this site only**, with a
     monthly spend cap set in the Anthropic console.
   - `ALLOWED_ORIGIN` — `https://cantusindustries.com` (tightens the origin
     check; optional but recommended).
   - `TURNSTILE_SECRET_KEY` — see launch gating below.
3. Point the domain at the site. Done — the page works with or without the
   agent.

## Before going live — owner checklist

- [ ] Confirm the diagnostic price ($3,500 is the spec placeholder) — it
      appears in `index.html`, `corpus.md`, and the meta description.
- [ ] Add the Cal.com/Calendly URL: replace the two `mailto:` CTA hrefs in
      `index.html` if you want call-booking instead of email-first.
- [ ] **Agent launch gate (spec §6.5):** the agent must pass a red-team pass
      (prompt injection, off-topic bait, price fishing, system-prompt
      extraction) before public launch. Until then, either leave
      `ANTHROPIC_API_KEY` unset — the panel degrades to "offline, email us"
      — or run the red-team and keep the transcript.
- [ ] Turnstile: create a free Cloudflare Turnstile widget for the domain,
      set `TURNSTILE_SECRET_KEY` in Netlify, and add the client widget to
      the ask panel. **Until both halves are configured, the function
      accepts requests without bot verification** — the rate limits and the
      300/day circuit breaker still bound the cost (~$1/day worst case).

## Cost model

Question cost ≈ $0.003 at claude-haiku-4-5 rates with the corpus prompt-
cached. Hard ceiling: 300 model calls/day → ~$1/day, ~$30/month absolute
worst case. Cached questions (including the three example chips after first
use) cost nothing.

## Updating the agent's knowledge

Edit `netlify/functions/corpus.md` (append real visitor Q&A to the FAQ
section) and redeploy. Corpus changes are deploys, not runtime mutations —
that is deliberate.

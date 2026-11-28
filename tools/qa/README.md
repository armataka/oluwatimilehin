# Before every push

Build and start the site, then run both checks (Python 3 with Playwright and Chromium):

```
npm run build && CASE_PASSWORD=pw PORT=3100 npx next start &
python3 tools/qa/sweep.py         # every page, light and dark, desktop and phone, locked and unlocked: errors, failed requests, overflow
python3 tools/qa/interactions.py  # bubbles, hovers, footer, theme, sound, coin, gate, loop, lightbox, steps, rail, navigation
python3 tools/qa/hover_consistency.py  # every text hover on every page must match Email/LinkedIn exactly (except the name)
```

All three should report no failures (one 401 from the deliberate wrong password is expected).

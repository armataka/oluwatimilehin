# Before every push

Build and start the site, then run both checks (Python 3 with Playwright and Chromium):

```
npm run build && CASE_PASSWORD=pw PORT=3100 npx next start &
python3 tools/qa/sweep.py         # every page, light and dark, desktop and phone, locked and unlocked: errors, failed requests, overflow
python3 tools/qa/interactions.py  # bubbles, hovers, footer, theme, sound, coin, gate, loop, lightbox, steps, rail, navigation
python3 tools/qa/hover_consistency.py  # every text hover must match Email/LinkedIn as you see it: colour, gap under the text, the slide part-way through, not cut off (except the name)
```

All three should report no failures (one 401 from the deliberate wrong password is expected).

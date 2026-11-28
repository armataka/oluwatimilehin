# Every page, light and dark, desktop and phone, locked and unlocked: page errors, console errors, failed requests, overflow,
# and the pointer: everything you can click shows the hand (no question mark, no arrow).
# Needs the site running on :3100 with CASE_PASSWORD=pw.
import asyncio, json
from playwright.async_api import async_playwright
U='http://localhost:3100'
PAGES=['/', '/me', '/kit', '/work/tama', '/work/kita', '/work/brydge', '/system', '/system/loaders']
async def run(p, vp, scheme, unlocked):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport=vp, color_scheme=scheme, device_scale_factor=1, has_touch=vp['width']<500)
    issues=[]
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: issues.append(('pageerror', pg.url, str(e)[:200])))
    pg.on('console', lambda m: issues.append(('console', pg.url, m.text[:200])) if m.type in ('error','warning') else None)
    pg.on('response', lambda r: issues.append(('http', r.status, r.url[:120])) if r.status >= 400 else None)
    if unlocked: await pg.request.post(U+'/api/unlock', data={'password':'pw'})
    for path in PAGES:
        await pg.goto(U+path); await pg.wait_for_timeout(3300)
        await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); await pg.wait_for_timeout(600)
        ov = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
        if ov > 1: issues.append(('overflow-x', path, ov))
        # elements wider than the viewport or off-screen to the right
        wide = await pg.evaluate("""[...document.querySelectorAll('.sheet *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0 && r.right>innerWidth+1 && getComputedStyle(e).position!=='fixed'}).slice(0,5).map(e=>e.className.toString().slice(0,40)+' '+Math.round(e.getBoundingClientRect().right))""")
        if wide: issues.append(('beyond-right', path, wide))
        cur = await pg.evaluate("""[...document.querySelectorAll('a, button, [role=radio], [role=button], [tabindex]:not([tabindex="-1"]), summary, label[for]')]
          .filter(e => e.getBoundingClientRect().width && !e.disabled && getComputedStyle(e).cursor !== 'pointer')
          .slice(0, 5).map(e => (e.innerText || e.getAttribute('aria-label') || e.className).toString().trim().split('\\n')[0].slice(0, 30) + ': ' + getComputedStyle(e).cursor)""")
        if cur: issues.append(('cursor', path, cur))
    await b.close()
    return issues
async def main():
    async with async_playwright() as p:
        for vp in [{'width':1440,'height':900},{'width':390,'height':844}]:
            for scheme in ['light','dark']:
                for unlocked in [False, True]:
                    iss = await run(p, vp, scheme, unlocked)
                    print(vp['width'], scheme, 'unlocked' if unlocked else 'locked', '->', len(iss))
                    for i in iss[:12]: print('   ', i)
asyncio.run(main())

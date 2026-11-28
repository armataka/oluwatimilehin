# Every piece of text that reacts to the pointer must react exactly like Email and LinkedIn: a quiet underline at
# rest (the same colour, the same 1px) that pulls away on hover, and nothing else changes colour. The one exception
# is the name's dotted underline. Needs the site running on :3100 with CASE_PASSWORD=pw.
import asyncio, sys
from playwright.async_api import async_playwright
U = 'http://localhost:3100'
PAGES = ['/', '/me', '/kit', '/work/tama', '/work/kita', '/work/brydge', '/system']
SNAP = r"""(el) => {
  // the element and every descendant that holds text: colour, underline, decoration, opacity
  const nodes = [el, ...el.querySelectorAll('*')].filter(n => n === el || [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()));
  return nodes.map(n => { const s = getComputedStyle(n); return {
    tag: n.tagName + '.' + (n.className && n.className.baseVal === undefined ? n.className : ''), color: s.color,
    bgImage: s.backgroundImage.startsWith('linear-gradient') ? s.backgroundImage : '', bgSize: s.backgroundSize,
    deco: s.textDecorationLine + ' ' + s.textDecorationColor, opacity: s.opacity } });
}"""
FIND = r"""() => [...document.querySelectorAll('a, button, [role=radio], [tabindex]')].filter(e => {
  const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
  if (e.closest('.tip, .lb, .loader')) return false;
  const cs = getComputedStyle(e); if (cs.pointerEvents === 'none' || +cs.opacity === 0) return false;   // hidden: can't be pointed at
  return (e.innerText || '').trim().length > 0;          // text, not icon-only controls
}).map((e, i) => { e.dataset.qa = i; return i })"""
async def main():
    fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        pg = await ctx.new_page()
        await pg.request.post(U + '/api/unlock', data={'password': 'pw'})
        # the reference: Email on the home page
        await pg.goto(U + '/'); await pg.wait_for_timeout(2500)
        email = pg.locator('.links a').first
        await pg.mouse.move(2, 2); await pg.wait_for_timeout(700); ref_rest = (await email.evaluate(SNAP))[0]
        bb = await email.bounding_box(); await pg.mouse.move(bb['x'] + 6, bb['y'] + 6); await pg.wait_for_timeout(900)
        ref_hover = (await email.evaluate(SNAP))[0]
        print('reference (Email): rest', ref_rest['bgSize'], ref_rest['bgImage'][:60], '| hover', ref_hover['bgSize'])
        seen = set()
        for path in PAGES:
            await pg.goto(U + path); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelectorAll('[data-r], .prose > *').forEach(e=>e.classList.add('in')); document.documentElement.classList.remove('loading')")
            # open the footer so its text is reachable too
            ids = await pg.evaluate(FIND)
            for i in ids:
                el = pg.locator(f'[data-qa="{i}"]')
                label = (await el.inner_text()).strip().split('\n')[0][:28]
                key = (label, await el.evaluate("e => e.className.toString()"))
                if key in seen: continue
                seen.add(key)
                if await el.evaluate("e => !!e.closest('.say, .pron') || e.classList.contains('say-name')"): continue   # the exception: the name's pronunciation
                if await el.evaluate("e => e.matches('.coin, .btn, [role=radio], .loop-ticks button')"): continue   # objects and buttons, not text links
                if await el.evaluate("e => !!e.closest('.under')"): continue   # footer: checked separately below
                await el.scroll_into_view_if_needed(); await pg.mouse.move(2, 2); await pg.wait_for_timeout(650)
                rest = await el.evaluate(SNAP)
                box = await el.bounding_box()
                await pg.mouse.move(box['x'] + min(8, box['width'] / 2), box['y'] + box['height'] / 2); await pg.wait_for_timeout(900)
                hov = await el.evaluate(SNAP)
                problems = []
                if not any(n['bgImage'] for n in rest): problems.append('no underline at rest')
                for a, h in zip(rest, hov):
                    if a['color'] != h['color']: problems.append(f"colour changes {a['tag'][:20]} {a['color']} -> {h['color']}")
                    if a['bgImage'] and a['bgImage'] != ref_rest['bgImage']: problems.append(f"underline colour differs from Email: {a['bgImage'][16:60]}")
                    if a['bgImage'] and not (a['bgSize'] == ref_rest['bgSize'] and h['bgSize'] == ref_hover['bgSize']): problems.append(f"underline doesn't pull away like Email: {a['bgSize']} -> {h['bgSize']}")
                    if a['deco'].split(' ')[0] != h['deco'].split(' ')[0]: problems.append('text-decoration changes')
                if problems:
                    fails += 1; print(f'FAIL {path:12s} "{label}": ' + '; '.join(dict.fromkeys(problems)))
        # footer text links
        await pg.goto(U + '/'); await pg.wait_for_timeout(2500); await pg.mouse.move(700, 400); await pg.mouse.wheel(0, 80); await pg.wait_for_timeout(700)
        for sel in ['.under a', '.more']:
            for k in range(await pg.locator(sel).count()):
                el = pg.locator(sel).nth(k)
                if not await el.is_visible(): continue
                rest = await el.evaluate(SNAP); box = await el.bounding_box()
                await pg.mouse.move(box['x'] + 6, box['y'] + box['height'] / 2); await pg.wait_for_timeout(900); hov = await el.evaluate(SNAP)
                if any(a['color'] != h['color'] for a, h in zip(rest, hov)) or not any(n['bgImage'] for n in rest):
                    fails += 1; print(f'FAIL footer "{(await el.inner_text()).strip()[:28]}": not the Email hover')
        await b.close()
    print('hover consistency:', 'all match Email' if not fails else f'{fails} differ'); sys.exit(1 if fails else 0)
asyncio.run(main())

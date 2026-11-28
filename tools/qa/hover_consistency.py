# Every piece of text that reacts to the pointer must react exactly like Email and LinkedIn, the way you'd see it:
#   the same underline at rest (colour, 1px, the same distance under the baseline),
#   the same slide when you point at it (property, 0.6s, easing, and the same position part-way through),
#   pulling away fully (100% -> 0%), actually visible (not cut off by a box that clips), and no colour change on any text.
# The one exception is the name's dotted underline. Runs with animation ON: the first version of this check turned
# motion off and compared only the start and end, so an underline that vanished instantly still passed.
# Needs the site running on :3100 with CASE_PASSWORD=pw.
import asyncio, json, sys
from playwright.async_api import async_playwright
U = 'http://localhost:3100'
PAGES = ['/', '/me', '/kit', '/work/tama', '/work/kita', '/work/brydge', '/system']
MID = 120   # ms into the slide when the part-way sample is taken

# for an element: every text-holding node (colour), and the node(s) carrying the underline (gradient background)
SNAP = r"""(el) => {
  const nodes = [el, ...el.querySelectorAll('*')];
  const text = nodes.filter(n => [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()));
  const ul = nodes.filter(n => getComputedStyle(n).backgroundImage.startsWith('linear-gradient'));
  const gap = (n) => {   // px from the text baseline to the top of the 1px line
    const m = document.createElement('span'); m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    n.appendChild(m); const base = m.getBoundingClientRect().top; m.remove();
    const rects = [...n.getClientRects()]; const r = rects[rects.length - 1];
    return +(r.bottom - 1 - base).toFixed(1) };
  const clipped = (n) => {   // the line is there in the styles but an ancestor that clips its overflow cuts it off
    const rects = [...n.getClientRects()]; const r = rects[rects.length - 1];
    for (let a = n.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a); if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const ar = a.getBoundingClientRect(); if (r.bottom > ar.bottom - parseFloat(s.borderBottomWidth) + .5) return a.tagName + '.' + a.className }
    return '' };
  return {
    text: text.map(n => ({ tag: n.tagName + '.' + n.className, color: getComputedStyle(n).color, deco: getComputedStyle(n).textDecorationLine })),
    ul: ul.map(n => { const s = getComputedStyle(n);
      const props = s.transitionProperty.split(',').map(x => x.trim()), durs = s.transitionDuration.split(','), eases = s.transitionTimingFunction.split(/,(?![^(]*\))/);
      const i = props.findIndex(p => p === 'background-size' || p === 'all' || p === 'background');
      return { tag: n.tagName + '.' + n.className, image: s.backgroundImage, size: s.backgroundSize, gap: gap(n), clip: clipped(n),
        slide: i < 0 ? 'none' : (durs[i % durs.length] || '').trim() + ' ' + (eases[i % eases.length] || '').trim() } }) };
}"""
# the underline's width part-way through the slide: point at it, wait MID ms, read the width
PART = r"""(el, ms) => new Promise(res => setTimeout(() => res([el, ...el.querySelectorAll('*')]
  .filter(n => getComputedStyle(n).backgroundImage.startsWith('linear-gradient')).map(n => parseFloat(getComputedStyle(n).backgroundSize))), ms))"""
FIND = r"""() => [...document.querySelectorAll('a, button, [role=radio], [tabindex]')].filter(e => {
  const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
  if (e.closest('.tip, .lb, .loader')) return false;
  const cs = getComputedStyle(e); if (cs.pointerEvents === 'none' || +cs.opacity === 0) return false;   // hidden: can't be pointed at
  return (e.innerText || '').trim().length > 0;          // text, not icon-only controls
}).map((e, i) => { e.dataset.qa = i; return i })"""
TRACK = {'configured': True, 'playing': True, 'title': 'A song with a fairly long title', 'artist': 'Some Artist', 'url': 'https://open.spotify.com/track/x'}

async def point(pg, el):
    box = await el.bounding_box()
    await pg.mouse.move(box['x'] + min(8, box['width'] / 2), box['y'] + box['height'] / 2)

async def measure(pg, el):
    await pg.mouse.move(2, 2); await pg.wait_for_timeout(800)
    rest = await el.evaluate(SNAP)
    await point(pg, el); part = await el.evaluate(PART, MID)   # stays pointed at
    await pg.wait_for_timeout(900); hov = await el.evaluate(SNAP)
    return rest, part, hov

def compare(ref, rest, part, hov, footer=False):
    (r_rest, r_part, r_hov) = ref; p = []
    if not rest['ul']: return ['no underline at rest']
    for a, h in zip(rest['text'], hov['text']):
        if a['color'] != h['color']: p.append(f"text colour changes {a['color']} -> {h['color']}")
        if a['deco'] != h['deco']: p.append('text-decoration changes')
    R = r_rest['ul'][0]
    for i, u in enumerate(rest['ul']):
        if u['clip']: p.append(f"underline is cut off (hidden by {u['clip'][:30]})")
        if not footer and u['image'] != R['image']: p.append('underline colour differs from Email')
        if u['slide'] != R['slide']: p.append(f"slide differs: {u['slide']} (Email {R['slide']})")
        if abs(u['gap'] - R['gap']) > .5: p.append(f"underline sits {u['gap']}px under the text (Email {R['gap']}px)")
        if u['size'] != R['size'] or hov['ul'][i]['size'] != r_hov['ul'][0]['size']: p.append(f"doesn't pull away like Email: {u['size']} -> {hov['ul'][i]['size']}")
        if i < len(part) and abs(part[i] - r_part[0]) > 20: p.append(f"{MID}ms in, underline at {part[i]:.0f}% (Email {r_part[0]:.0f}%): not the same slide")
    return list(dict.fromkeys(p))

async def main():
    fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
        await ctx.route('**/api/now-playing', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(TRACK)))
        pg = await ctx.new_page()
        await pg.request.post(U + '/api/unlock', data={'password': 'pw'})
        await pg.goto(U + '/'); await pg.wait_for_timeout(2600)
        ref = await measure(pg, pg.locator('.links a').first)
        R = ref[0]['ul'][0]
        print(f"reference (Email): gap {R['gap']}px, slide {R['slide']}, {MID}ms in {ref[1][0]:.0f}%, rest {R['size']} -> hover {ref[2]['ul'][0]['size']}")
        seen = set()
        for path in PAGES:
            await pg.goto(U + path); await pg.wait_for_timeout(2600)
            await pg.evaluate("document.querySelectorAll('[data-r], .prose > *').forEach(e=>e.classList.add('in')); document.documentElement.classList.remove('loading')")
            await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); await pg.wait_for_timeout(900)   # shows the end-of-page nudge
            for i in await pg.evaluate(FIND):
                el = pg.locator(f'[data-qa="{i}"]')
                if not await el.is_visible(): continue
                label = (await el.inner_text()).strip().split('\n')[0][:28]
                key = (label, await el.evaluate("e => e.className.toString()"))
                if key in seen: continue
                seen.add(key)
                if await el.evaluate("e => !!e.closest('.say, .pron') || e.classList.contains('say-name')"): continue   # the exception: the name's pronunciation
                if await el.evaluate("e => e.matches('.coin, .btn, [role=radio], .loop-ticks button')"): continue   # objects and buttons, not text links
                if await el.evaluate("e => !!e.closest('.under')"): continue   # footer: below, with the footer open
                await el.scroll_into_view_if_needed()
                probs = compare(ref, *(await measure(pg, el)))
                if probs: fails += 1; print(f'FAIL {path:12s} "{label}": ' + '; '.join(probs))
        # the footer, open, with a track playing so its link shows
        await pg.goto(U + '/'); await pg.wait_for_timeout(2600); await pg.mouse.move(700, 400); await pg.mouse.wheel(0, 80); await pg.wait_for_timeout(900)
        links = pg.locator('.under a'); n = await links.count(); checked = 0
        for k in range(n):
            el = links.nth(k)
            if not await el.is_visible(): continue
            rest = await el.evaluate(SNAP); await point(pg, el); part = await el.evaluate(PART, MID); await pg.wait_for_timeout(900); hov = await el.evaluate(SNAP)
            await pg.mouse.move(700, 200); await pg.wait_for_timeout(50)
            probs = compare(ref, rest, part, hov, footer=True); checked += 1
            if probs: fails += 1; print(f'FAIL footer "{(await el.inner_text()).strip()[:28]}": ' + '; '.join(probs))
        if not checked: fails += 1; print('FAIL footer: no track link found to check')
        await b.close()
    print('hover consistency:', 'all match Email' if not fails else f'{fails} differ'); sys.exit(1 if fails else 0)
asyncio.run(main())

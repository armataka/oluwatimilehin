# Clicks and hovers through the site and checks each result. Needs the site running on :3100 with CASE_PASSWORD=pw.
import asyncio
from playwright.async_api import async_playwright
U='http://localhost:3100'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs=[]; res=[]
        ctx = await b.new_context(viewport={'width':1440,'height':900}, device_scale_factor=1)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append((pg.url, str(e)[:160])))
        pg.on('response', lambda r: errs.append(('http', r.status, r.url[:100])) if r.status >= 400 else None)
        ok = lambda name, cond, extra='': res.append(('PASS' if cond else 'FAIL', name, extra))
        await pg.goto(U+'/'); await pg.wait_for_timeout(3400)
        # name bubble
        nm = await pg.locator('.say-name').bounding_box(); await pg.mouse.move(nm['x']+20, nm['y']+8); await pg.wait_for_timeout(500)
        ok('name bubble opens', await pg.evaluate("getComputedStyle(document.querySelector('.say .tip')).opacity") == '1')
        await pg.mouse.move(5,5); await pg.wait_for_timeout(400)
        ok('name bubble closes', await pg.evaluate("getComputedStyle(document.querySelector('.say .tip')).opacity") == '0')
        # email tooltip
        em = await pg.locator('.tipw').bounding_box(); await pg.mouse.move(em['x']+10, em['y']+8); await pg.wait_for_timeout(1000)
        ok('email box shows', await pg.evaluate("getComputedStyle(document.querySelector('.tipw .tip')).opacity") == '1')
        ok('email underline pulls away', (await pg.evaluate("getComputedStyle(document.querySelector('.tipw')).backgroundSize")).startswith('0%'))
        await pg.mouse.move(5,5); await pg.wait_for_timeout(400)
        # row hover
        r = await pg.locator('.row').first.bounding_box(); await pg.mouse.move(r['x']+300, r['y']+20); await pg.wait_for_timeout(800)
        ok('row name underline pulls away', (await pg.evaluate("getComputedStyle(document.querySelector('.row .nm')).backgroundSize")).startswith('0%'))
        ok('row thumb in colour', await pg.evaluate("getComputedStyle(document.querySelector('.row .thumb')).filter") == 'none')
        # theme switch through the footer
        await pg.mouse.move(700,400); await pg.mouse.wheel(0,80); await pg.wait_for_timeout(600)
        ok('footer opens', await pg.evaluate("document.documentElement.classList.contains('under-open')"))
        await pg.click('.theme button[aria-label="Dark"]'); await pg.wait_for_timeout(300)
        ok('dark theme applies', await pg.evaluate("getComputedStyle(document.querySelector('.sheet')).backgroundColor") == 'rgb(17, 17, 16)')
        await pg.click('.theme button[aria-label="Light"]'); await pg.wait_for_timeout(300)
        ok('light theme applies', await pg.evaluate("getComputedStyle(document.querySelector('.sheet')).backgroundColor") == 'rgb(255, 255, 255)')
        await pg.click('.snd'); await pg.wait_for_timeout(200)
        ok('sound toggles off', await pg.evaluate("localStorage.getItem('sound')") == 'off')
        await pg.click('.snd'); await pg.wait_for_timeout(200)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(500)
        ok('footer closes', not await pg.evaluate("document.documentElement.classList.contains('under-open')"))
        # coin flip
        c = await pg.locator('.coin').bounding_box(); await pg.mouse.move(c['x']+75, c['y']+75); await pg.wait_for_timeout(600); await pg.mouse.click(c['x']+75, c['y']+75); await pg.wait_for_timeout(1200)
        ry = await pg.evaluate("getComputedStyle(document.querySelector('.coin-body')).transform")
        ok('coin flips', ry != 'none', ry[:40])
        # navigate to a project from the row
        await pg.click('.row >> nth=0'); await pg.wait_for_timeout(3000)
        ok('row opens TAMA', pg.url.endswith('/work/tama'))
        # gate: wrong then right password
        await pg.fill('.gate input', 'nope'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1200)
        ok('wrong password shows a message', len((await pg.locator('.g-msg').inner_text()).strip()) > 0)
        await pg.fill('.gate input', 'pw'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(3000)
        ok('right password unlocks', await pg.locator('.gate').count() == 0 and await pg.locator('.loop').count() > 0)
        # loop: click a tick, then open the lightbox
        await pg.evaluate("document.querySelectorAll('[data-r], .prose > *').forEach(e=>e.classList.add('in'))")
        await pg.locator('.loop').scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
        await pg.locator('.loop-ticks button').nth(2).click(); await pg.wait_for_timeout(900)
        ok('loop tick selects screen 3', '03' in await pg.locator('.loop-cap').inner_text())
        await pg.locator('.loop-stage img.on').click(); await pg.wait_for_timeout(700)
        ok('lightbox opens', await pg.evaluate("document.getElementById('lb').classList.contains('open')"))
        await pg.mouse.click(30, 30); await pg.wait_for_timeout(600)
        ok('lightbox closes', not await pg.evaluate("document.getElementById('lb').classList.contains('open')"))
        # steps fill and stay
        st = pg.locator('.steps'); await st.scroll_into_view_if_needed(); await pg.mouse.wheel(0, 900); await pg.wait_for_timeout(900)
        n1 = await pg.locator('.step.on').count(); await pg.mouse.wheel(0, -1800); await pg.wait_for_timeout(900); n2 = await pg.locator('.step.on').count()
        ok('steps fill and stay', n1 > 0 and n2 == n1, f'{n1}/{n2}')
        # rail
        await pg.wait_for_timeout(300); rl = await pg.locator('#rail a').count()
        ok('rail lists sections', rl > 3, str(rl))
        await pg.locator('#rail a').nth(3).click(); await pg.wait_for_timeout(1500)
        ok('rail jumps to a section', await pg.evaluate("scrollY") > 500)
        # previous / next
        await pg.locator('.pn a').first.click(); await pg.wait_for_timeout(3000)
        ok('Next goes to Kita', pg.url.endswith('/work/kita'))
        # nav
        await pg.click('.nav a[href="/me"]'); await pg.wait_for_timeout(3000)
        ok('nav goes to Me', pg.url.endswith('/me'))
        ok('Me clock ticks', len((await pg.locator('time[data-clock]').inner_text()).strip()) >= 4)
        await pg.click('.nav a[href="/kit"]'); await pg.wait_for_timeout(3000)
        ok('nav goes to Kit', pg.url.endswith('/kit'))
        await pg.click('.brand'); await pg.wait_for_timeout(3000)
        ok('logo goes home', pg.url.rstrip('/') == U)
        for r_ in res: print(*r_)
        print('errors', errs); await b.close()
asyncio.run(main())

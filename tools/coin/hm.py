import asyncio, math, numpy as np
from playwright.async_api import async_playwright
from PIL import Image
from scipy.ndimage import gaussian_filter
N=2048; TAU=math.tau
def pt(r,a): return f"{100+r*math.cos(a):.2f} {100+r*math.sin(a):.2f}"
beads=''.join(f'<circle cx="{100+88.5*math.cos(i/64*TAU):.2f}" cy="{100+88.5*math.sin(i/64*TAU):.2f}" r="1.5" fill="#fff"/>' for i in range(64))
rays=''.join(f'M{pt(31,i/60*TAU)}L{pt(60 if i%2 else 66,i/60*TAU)}' for i in range(60))
def star(cx,cy,r): return ' '.join(f"{cx+(r*.42 if i%2 else r)*math.cos(-math.pi/2+i*math.pi/5):.2f},{cy+(r*.42 if i%2 else r)*math.sin(-math.pi/2+i*math.pi/5):.2f}" for i in range(10))
defs='<defs><path id="lg" d="M100 100m-77.5 0a77.5 77.5 0 1 1 155 0a77.5 77.5 0 1 1-155 0"/><clipPath id="core"><circle cx="100" cy="100" r="66"/></clipPath></defs>'
css='<style>text{font-family:"DejaVu Serif","Liberation Serif",serif;font-weight:700}</style>'
def svg(body,bg='#000'): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="{N}" height="{N}" style="background:{bg}">{defs}{css}{body}</svg>'
def legend(t): return f'<text font-size="10.4" letter-spacing="1.1" fill="#fff"><textPath href="#lg" textLength="478" lengthAdjust="spacing">{t}</textPath></text>'
L={
 'rim': svg('<circle cx="100" cy="100" r="100" fill="#fff"/><circle cx="100" cy="100" r="92.5" fill="#000"/>'),
 'beads': svg(beads),
 'ring': svg('<circle cx="100" cy="100" r="68" fill="none" stroke="#fff" stroke-width="1.5"/>'),
 'legF': svg(legend('OLUWATIMILEHIN ★ PRODUCT DESIGNER ★ MMXXVI ★ ')),
 'legB': svg(legend('GOD IS BEHIND ME ★ LEGAL TENDER FOR GOOD WORK ★ ')),
 'bust': svg('<g clip-path="url(#core)"><image href="bust.svg" x="22" y="27" width="156" height="156"/></g>','transparent'),
 'rays': svg(f'<path d="{rays}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>'),
 'disc': svg('<circle cx="100" cy="100" r="29" fill="#fff"/>'),
 'num': svg(f'<text x="100" y="121" font-size="58" text-anchor="middle" fill="#fff">1</text>'),
 'backtxt': svg(f'<text x="100" y="150" font-size="8.6" letter-spacing="1.8" text-anchor="middle" fill="#fff">ONE TIMI</text><text x="100" y="57" font-size="8" letter-spacing="1.2" text-anchor="middle" fill="#fff">2026</text><polygon points="{star(50,100,5)}" fill="#fff"/><polygon points="{star(150,100,5)}" fill="#fff"/>'),
}
async def main():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':N,'height':N})
        for k,v in L.items():
            open(f'{k}.html','w').write(f'<body style="margin:0;background:transparent">{v}')
            await pg.goto(f'file:///home/claude/coin3d/{k}.html'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'l_{k}.png', omit_background=True)
        await b.close()
asyncio.run(main())
g=lambda k: np.asarray(Image.open(f'l_{k}.png').convert('RGBA')).astype(np.float32)/255
m=lambda k: g(k)[...,0]
bl=gaussian_filter
bust=g('bust'); a=bust[...,3]; lum=(bust[...,:3]@np.array([.3,.59,.11],dtype=np.float32))
Image.fromarray((np.dstack([lum,lum,lum,a])*255).astype(np.uint8)).resize((512,512)).save('bust_prev.png')
dome=np.clip(bl(a,26)*1.5-.25,0,1)*a
relief=dome*.50 + a*.10 + bl((lum-.5)*a,2.2)*.34
def common(leg): return np.maximum.reduce([bl(m('rim'),3)*1.0, bl(m('beads'),5)*1.25*.8, bl(m('ring'),2.5)*.55, bl(m(leg),2.4)*.78])
front=np.maximum(common('legF'), bl(relief,1.6))
num=m('num'); back=np.maximum.reduce([common('legB'), bl(m('rays'),2.6)*.42, bl(m('disc'),4)*.30+bl(num,3)*.52+np.clip(bl(num,14)*1.2,0,1)*num*.12, bl(m('backtxt'),2.2)*.7])
for n,h in [('front',front),('back',back)]:
    h=np.clip(h,0,1); Image.fromarray((h*65535).astype(np.uint16)).save(f'h_{n}.png'); Image.fromarray((h*255).astype(np.uint8)).resize((640,640)).save(f'p_{n}.png')

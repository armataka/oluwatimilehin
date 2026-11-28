'use client';
// Candidate pixel loaders, drawn on the same square-pixel grid as the site's Pixelarticons (one unit = 3px).
// Each draws in the text colour, so it's black on the light theme and white on the dark one.
import { useEffect, useRef } from 'react';

type Put = (x: number, y: number, w?: number, h?: number) => void;
type Draw = (t: number, put: Put) => void;

function Pixels({ w, h, draw, unit = 3 }: { w: number; h: number; draw: Draw; unit?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!, dpr = Math.max(1, Math.round(devicePixelRatio || 1));
    c.width = w * unit * dpr; c.height = h * unit * dpr;
    const s = unit * dpr;
    let raf = 0; const t0 = performance.now();
    const frame = (now: number) => {
      g.clearRect(0, 0, c.width, c.height);
      g.fillStyle = getComputedStyle(c).color;
      draw(now - t0, (x, y, ww = 1, hh = 1) => g.fillRect(Math.round(x) * s, Math.round(y) * s, ww * s, hh * s));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [w, h, draw, unit]);
  return <canvas ref={ref} style={{ width: w * unit, height: h * unit, display: 'block', imageRendering: 'pixelated' }} aria-hidden="true" />;
}

/* ---------------------------------------------------------------- Tetris: pieces fall, stack and clear */
const PIECES: Record<string, number[][]> = {
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  L: [[0, 0], [0, 1], [1, 1], [2, 1]],
  J: [[2, 0], [0, 1], [1, 1], [2, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
};
// a sequence that leaves no holes: two rows from four squares, a row from two bars, then L + J + T and a bar
const SEQ: [string, number][] = [['O', 0], ['O', 2], ['O', 4], ['O', 6], ['I', 0], ['I', 4], ['L', 0], ['J', 5], ['O', 3], ['I', 0], ['I', 4]];
const COLS = 8, ROWS = 12, CELL = 2, FALL = 34, FLASH = 360;
function tetrisFrames() {
  // precompute: for each piece, where it lands, and which rows it completes
  const frames: { piece: string; x: number; land: number; board: boolean[][]; clears: number[] }[] = [];
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (const [p, x] of SEQ) {
    const cells = PIECES[p];
    let y = 0;
    const fits = (yy: number) => cells.every(([cx, cy]) => yy + cy < ROWS && !board[yy + cy][x + cx]);
    while (fits(y + 1)) y++;
    const before = board.map((r) => r.slice());
    const after = board.map((r) => r.slice());
    cells.forEach(([cx, cy]) => { after[y + cy][x + cx] = true; });
    const clears = after.map((r, i) => (r.every(Boolean) ? i : -1)).filter((i) => i >= 0);
    frames.push({ piece: p, x, land: y, board: before, clears });
    board = after.filter((r) => !r.every(Boolean));
    while (board.length < ROWS) board.unshift(Array(COLS).fill(false));
  }
  return frames;
}
const TF = tetrisFrames();
const tetris: Draw = (t, put) => {
  // frame outline
  put(0, 0, 1, ROWS * CELL + 2); put(COLS * CELL + 1, 0, 1, ROWS * CELL + 2); put(0, ROWS * CELL + 1, COLS * CELL + 2, 1);
  const durs = TF.map((f) => (f.land + 1) * FALL + (f.clears.length ? FLASH : 0) + 60);
  const total = durs.reduce((a, b) => a + b, 0);
  let k = t % total, i = 0;
  while (k > durs[i]) { k -= durs[i]; i++; }
  const f = TF[i], fallT = (f.land + 1) * FALL;
  const cell = (cx: number, cy: number) => put(1 + cx * CELL, 1 + cy * CELL, CELL - (CELL > 1 ? 0 : 0), CELL);
  f.board.forEach((r, y) => r.forEach((on, x) => { if (on) cell(x, y); }));
  const y = Math.min(f.land, Math.floor(k / FALL));
  const flashing = k > fallT && f.clears.length && Math.floor((k - fallT) / 90) % 2 === 0;
  PIECES[f.piece].forEach(([cx, cy]) => { if (!(k > fallT && f.clears.includes(y + cy) && !flashing)) cell(f.x + cx, y + cy); });
  if (k > fallT && f.clears.length && flashing) f.clears.forEach((ry) => { for (let x = 0; x < COLS; x++) cell(x, ry); });
};

/* ---------------------------------------------------------------- Pac-Man: chomps along a row of dots */
const PAC = 9;
function pacMask(open: number) {
  const m: boolean[][] = [];
  for (let y = 0; y < PAC; y++) { m.push([]); for (let x = 0; x < PAC; x++) {
    const dx = x - 4, dy = y - 4, inC = dx * dx + dy * dy <= 4.6 * 4.6 - 1;
    const mouth = dx > 0 && Math.abs(dy) <= dx * open;
    m[y].push(inC && !mouth);
  } }
  return m;
}
const PACS = [pacMask(0), pacMask(0.45), pacMask(1)];
const pacman: Draw = (t, put) => {
  const W = 46, speed = 0.022, x = ((t * speed) % (W + PAC)) - PAC;
  for (let px = 3; px < W; px += 6) if (px > x + 6 || px < x - 40) put(px, 4, 2, 2);   // dots ahead are still there
  const fr = PACS[[0, 1, 2, 1][Math.floor(t / 80) % 4]];
  fr.forEach((r, yy) => r.forEach((on, xx) => { if (on) put(x + xx, yy, 1, 1); }));
};

/* ---------------------------------------------------------------- the coin, in pixels: it spins, then becomes the real coin */
const coin: Draw = (t, put) => {
  const R = 7, widths = [7, 6, 4, 1, 4, 6];
  const w = widths[Math.floor(t / 110) % widths.length];
  for (let y = -R; y <= R; y++) {
    const half = Math.floor(Math.sqrt(Math.max(0, R * R - y * y)) * (w / R) + 0.35);
    if (half <= 0) { put(R + 2, y + R + 1, 1, 1); continue; }
    for (let x = -half; x <= half; x++) {
      const edge = Math.abs(x) >= half - 0 || Math.abs(y) >= R - 0;
      const inner = w > 4 && Math.abs(x) <= half - 2 && Math.abs(y) <= R - 2;
      const one = w > 4 && ((x === 0 && Math.abs(y) <= 3) || (x === -1 && y === -2) || (y === 3 && Math.abs(x) <= 1));
      if (edge || (!inner) || one) put(R + 2 + x, y + R + 1, 1, 1);
    }
  }
};

/* ---------------------------------------------------------------- Snake: goes round, eats, grows, starts again */
const snakePath = (() => { const p: number[][] = []; const n = 7; for (let i = 0; i < n; i++) p.push([i, 0]); for (let i = 1; i < n; i++) p.push([n - 1, i]); for (let i = n - 2; i >= 0; i--) p.push([i, n - 1]); for (let i = n - 2; i > 0; i--) p.push([0, i]); return p; })();
const snake: Draw = (t, put) => {
  const step = Math.floor(t / 70), L = snakePath.length;
  const len = 3 + (Math.floor(step / L) % 6) * 2;
  for (let i = 0; i < len; i++) { const [x, y] = snakePath[((step - i) % L + L) % L]; put(1 + x * 3, 1 + y * 3, 2, 2); }
  const food = snakePath[(Math.floor(step / L) * 11 + 9) % L];
  if (Math.floor(t / 200) % 2 === 0) put(1 + food[0] * 3, 1 + food[1] * 3, 2, 2);
};

/* ---------------------------------------------------------------- Pong: two paddles and a ball */
const pong: Draw = (t, put) => {
  const W = 30, H = 18, s = t / 1000;
  const bx = Math.abs(((s * 26) % (2 * (W - 6))) - (W - 6)) + 3, by = Math.abs(((s * 17) % (2 * (H - 2))) - (H - 2));
  const lp = Math.max(0, Math.min(H - 6, by - 2 + Math.sin(s * 3) * 1.5)), rp = Math.max(0, Math.min(H - 6, by - 3 + Math.cos(s * 2.6) * 1.5));
  put(0, lp, 1, 6); put(W - 1, rp, 1, 6); put(bx, by, 2, 2);
  for (let y = 0; y < H; y += 3) put(W / 2, y, 1, 1);
};

export const LOADERS = [
  { id: 'tetris', name: 'Tetris', w: COLS * CELL + 2, h: ROWS * CELL + 2, draw: tetris, note: 'Pieces fall, stack and clear rows. The most game-like and the busiest; it needs about 3 seconds to read as Tetris.' },
  { id: 'pacman', name: 'Pac-Man', w: 46, h: 9, draw: pacman, note: 'Chomps along a row of dots, mouth in three frames. Instantly recognisable; wide rather than square.' },
  { id: 'coin', name: 'The coin, in pixels', w: 18, h: 17, draw: coin, note: 'An 8-bit coin spinning edge-on and back. Ties the loader to the coin on the home page: it can spin, then become the real coin.' },
  { id: 'snake', name: 'Snake', w: 21, h: 21, draw: snake, note: 'Nokia snake going round a square, growing each lap. Calm, square and loops forever.' },
  { id: 'pong', name: 'Pong', w: 31, h: 18, draw: pong, note: 'Two paddles and a ball. The oldest of them, and the quietest.' },
] as const;

export function PixelLoader({ id }: { id: (typeof LOADERS)[number]['id'] }) {
  const l = LOADERS.find((x) => x.id === id)!;
  return <Pixels w={l.w} h={l.h} draw={l.draw} />;
}

/** The candidates, each in both themes. */
export function LoaderGallery() {
  return (
    <>
      {LOADERS.map((l) => (
        <section key={l.id} className="sys-blk">
          <h2 className="t-heading">{l.name}</h2>
          <p className="use">{l.note}</p>
          <div className="sys-pair">
            {(['light', 'dark'] as const).map((m) => (
              <div key={m} className={`sys-mode ${m}`} style={{ display: 'grid', placeItems: 'center', minHeight: 168 }}>
                <Pixels w={l.w} h={l.h} draw={l.draw} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

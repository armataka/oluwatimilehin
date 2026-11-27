// A damped spring, sampled into a CSS linear() easing so transitions can overshoot and settle.
export function spring(zeta = 0.72, omega = 13) {
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const x = (t: number) => 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  let end = 0.2;
  while (end < 4 && !(Math.abs(x(end) - 1) < 0.0015 && Math.abs(x(end + 0.05) - 1) < 0.0015)) end += 0.01;
  const n = 48;
  const pts = Array.from({ length: n + 1 }, (_, i) => +x((end * i) / n).toFixed(4));
  pts[n] = 1;
  return { css: `linear(${pts.join(', ')})`, ms: Math.round(end * 1000) };
}

function drawCapsule(ctx, x0, y0, r0, x1, y1, r1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);

  if (len < 1e-6 || Math.abs(r1 - r0) >= len) {
    const mx = (x0 + x1) * 0.5;
    const my = (y0 + y1) * 0.5;
    ctx.beginPath();
    ctx.arc(mx, my, Math.max(r0, r1), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const dr = r1 - r0;
  const invLen2 = 1 / (len * len);
  const h = Math.sqrt(len * len - dr * dr);

  const nx = (dx * dr - dy * h) * invLen2;
  const ny = (dy * dr + dx * h) * invLen2;

  const mxn = (dx * dr + dy * h) * invLen2;
  const myn = (dy * dr - dx * h) * invLen2;

  const p0aX = x0 + nx * r0;
  const p0aY = y0 + ny * r0;
  const p1aX = x1 + nx * r1;
  const p1aY = y1 + ny * r1;

  const p0bX = x0 + mxn * r0;
  const p0bY = y0 + myn * r0;
  const p1bX = x1 + mxn * r1;
  const p1bY = y1 + myn * r1;

  const a0 = Math.atan2(p0aY - y0, p0aX - x0);
  const a0b = Math.atan2(p0bY - y0, p0bX - x0);
  const a1 = Math.atan2(p1aY - y1, p1aX - x1);
  const a1b = Math.atan2(p1bY - y1, p1bX - x1);

  ctx.beginPath();
  ctx.moveTo(p0aX, p0aY);
  ctx.lineTo(p1aX, p1aY);
  ctx.arc(x1, y1, r1, a1, a1b, false);
  ctx.lineTo(p0bX, p0bY);
  ctx.arc(x0, y0, r0, a0b, a0, false);
  ctx.closePath();
  ctx.fill();
}

function drawCapsule(ctx, x0, y0, r0, x1, y1, r1) {
  const d = Math.hypot(x1 - x0, y1 - y0);

  if (d <= Math.abs(r0 - r1)) {
    ctx.beginPath();
    const r = Math.max(r0, r1);
    const x = r0 >= r1 ? x0 : x1;
    const y = r0 >= r1 ? y0 : y1;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    return;
  }

  const theta = Math.atan2(y1 - y0, x1 - x0);
  const alpha = Math.acos((r0 - r1) / d);

  const a1 = theta + alpha;
  const a2 = theta - alpha;

  ctx.beginPath();
  ctx.arc(x0, y0, r0, a1, a2, false);
  ctx.arc(x1, y1, r1, a2, a1, false);
  ctx.closePath();
}
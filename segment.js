function drawCapsule(ctx, x0, y0, r0, x1, y1, r1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);

  if (len < 1e-6 || Math.abs(r0 - r1) >= len) {
    const mx = (x0 + x1) * 0.5;
    const my = (y0 + y1) * 0.5;
    ctx.beginPath();
    ctx.arc(mx, my, Mat.max(r0, r1), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const nx = -dy / len;
  const ny = dx / len;

  const p0aX = x0 + nx * r0;
  const p0aY = y0 + ny * r0;
  const p0bX = x0 - nx * r0;
  const p0bY = y0 - ny * r0;

  const p1aX = x1 + nx * r1;
  const p1aY = y1 + ny * r1;
  const p1bX = x1 - nx * r1;
  const p1bY = y1 - ny * r1;

  const angle0 = Math.atan2(p0aY - y0, p0aX - x0);
  const angle0b = Math.atan2(p0bY - y0, p0bX - x0);
  const angle1 = Math.atan2(p1aY - y1, p1aX - x1);
  const angle1b = Math.atan2(p1bY - y1, p1bX - x1);

  ctx.beginPath();
  ctx.moveTo(p0aX, p0aY);
  ctx.lineTo(p1aX, p1aY);
  ctx.arc(x1, y1, r1, angle1, angle1b, false);
  ctx.lineTo(p0bX, p0bY);
  ctx.arc(x0, y0, r0, angle0b, angle0, false);
  ctx.closePath();
  ctx.fill();
}

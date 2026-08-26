export function setup(canvas, height) {
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = height;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    ctx,
    get width() {
      return w;
    },
    get height() {
      return h;
    },
    resize,
  };
}

export function token(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function onThemeChange(fn) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", fn);
}

export function clear(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

export function line(ctx, x1, y1, x2, y2, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width || 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function label(ctx, text, x, y, colour, align, size) {
  ctx.fillStyle = colour;
  ctx.font = (size || 10) + 'px "JetBrains Mono", monospace';
  ctx.textAlign = align || "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

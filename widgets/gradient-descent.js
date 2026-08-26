import { setup, token, onThemeChange, clear, line, label } from "../lib/canvas.js";

const f = (x) => 0.12 * x * x * x * x - 0.9 * x * x + 0.4 * x + 3;
const df = (x) => 0.48 * x * x * x - 1.8 * x + 0.4;

const X_MIN = -3.2;
const X_MAX = 3.2;
const Y_MIN = 0;
const Y_MAX = 7;

export default function mount(root) {
  root.innerHTML = `
    <div class="controls">
      <label class="control">learning rate
        <input type="range" id="gd-lr" min="0.01" max="1.2" step="0.01" value="0.15">
        <output id="gd-lr-out">0.15</output>
      </label>
      <label class="control">start x
        <input type="range" id="gd-x0" min="-3" max="3" step="0.1" value="-2.6">
        <output id="gd-x0-out">-2.6</output>
      </label>
      <button id="gd-step">step</button>
      <button id="gd-run">run 40</button>
      <button id="gd-reset">reset</button>
    </div>
    <canvas id="gd-canvas"></canvas>
    <p class="readout" id="gd-readout"></p>`;

  const canvas = root.querySelector("#gd-canvas");
  const view = setup(canvas, 230);
  const lr = root.querySelector("#gd-lr");
  const lrOut = root.querySelector("#gd-lr-out");
  const x0 = root.querySelector("#gd-x0");
  const x0Out = root.querySelector("#gd-x0-out");
  const readout = root.querySelector("#gd-readout");

  let path = [];

  function reset() {
    path = [Number(x0.value)];
    draw();
  }

  function step() {
    const x = path[path.length - 1];
    if (!Number.isFinite(x) || Math.abs(x) > 50) return false;
    const next = x - Number(lr.value) * df(x);
    path.push(next);
    if (path.length > 200) path.shift();
    draw();
    return true;
  }

  function toPx(x, y, width, height) {
    const padL = 30;
    const padB = 24;
    const padT = 12;
    const padR = 10;
    return [
      padL + ((x - X_MIN) / (X_MAX - X_MIN)) * (width - padL - padR),
      height - padB - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (height - padB - padT),
    ];
  }

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);

    const ink3 = token("--ink-3");
    const lineC = token("--line");
    const accent = token("--accent");
    const warn = token("--warn");

    for (let gy = 1; gy <= 6; gy++) {
      const [, py] = toPx(0, gy, width, height);
      line(ctx, 30, py, width - 10, py, lineC, 1);
      label(ctx, String(gy), 24, py, ink3, "right", 9);
    }
    for (let gx = -3; gx <= 3; gx++) {
      const [px] = toPx(gx, 0, width, height);
      const [, py0] = toPx(0, Y_MIN, width, height);
      label(ctx, String(gx), px, py0 + 12, ink3, "center", 9);
    }

    ctx.strokeStyle = token("--ink-2");
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const x = X_MIN + (i / 240) * (X_MAX - X_MIN);
      const [px, py] = toPx(x, f(x), width, height);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const diverged = path.some((x) => !Number.isFinite(x) || Math.abs(x) > 6);
    const trailC = diverged ? warn : accent;

    ctx.strokeStyle = trailC;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    path.forEach((x, i) => {
      const cx = Math.max(X_MIN, Math.min(X_MAX, x));
      const [px, py] = toPx(cx, f(cx), width, height);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;

    path.forEach((x, i) => {
      const cx = Math.max(X_MIN, Math.min(X_MAX, x));
      const [px, py] = toPx(cx, f(cx), width, height);
      const last = i === path.length - 1;
      ctx.fillStyle = trailC;
      ctx.globalAlpha = last ? 1 : 0.25;
      ctx.beginPath();
      ctx.arc(px, py, last ? 5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    const x = path[path.length - 1];
    const slope = df(x);
    if (diverged) {
      readout.innerHTML = `<span class="warn">diverged</span> &middot; learning rate <b>${Number(lr.value).toFixed(2)}</b> overshoots the basin &middot; step <b>${path.length - 1}</b>`;
    } else {
      readout.innerHTML = `x <b>${x.toFixed(4)}</b> &middot; f(x) <b>${f(x).toFixed(4)}</b> &middot; slope <b>${slope.toFixed(4)}</b> &middot; step <b>${path.length - 1}</b>`;
    }
  }

  lr.addEventListener("input", () => {
    lrOut.textContent = Number(lr.value).toFixed(2);
  });
  x0.addEventListener("input", () => {
    x0Out.textContent = Number(x0.value).toFixed(1);
    reset();
  });
  root.querySelector("#gd-step").addEventListener("click", step);
  root.querySelector("#gd-reset").addEventListener("click", reset);
  root.querySelector("#gd-run").addEventListener("click", () => {
    for (let i = 0; i < 40; i++) if (!step()) break;
  });

  window.addEventListener("resize", draw);
  onThemeChange(draw);
  reset();
}

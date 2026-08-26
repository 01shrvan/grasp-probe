import { setup, token, onThemeChange, clear, line, label } from "../lib/canvas.js";

function scoreFor(token1, token2) {
  let h = 2166136261;
  const s = token1 + "|" + token2;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 * 4 - 1;
}

function softmax(scores, temperature) {
  const t = Math.max(temperature, 0.01);
  const scaled = scores.map((s) => s / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export default function mount(root) {
  root.innerHTML = `
    <div class="controls">
      <input type="text" id="sm-text" value="the cat sat on the mat" aria-label="Sentence">
    </div>
    <div class="controls">
      <label class="control">query token
        <select id="sm-query"></select>
      </label>
      <label class="control">temperature
        <input type="range" id="sm-temp" min="0.1" max="4" step="0.1" value="1">
        <output id="sm-temp-out">1.0</output>
      </label>
    </div>
    <canvas id="sm-canvas"></canvas>
    <p class="readout" id="sm-readout"></p>`;

  const canvas = root.querySelector("#sm-canvas");
  const view = setup(canvas, 200);
  const textInput = root.querySelector("#sm-text");
  const querySel = root.querySelector("#sm-query");
  const temp = root.querySelector("#sm-temp");
  const tempOut = root.querySelector("#sm-temp-out");
  const readout = root.querySelector("#sm-readout");

  let tokens = [];

  function refreshTokens() {
    tokens = textInput.value.trim().split(/\s+/).filter(Boolean).slice(0, 12);
    const prev = querySel.value;
    querySel.innerHTML = tokens
      .map((t, i) => `<option value="${i}">${t}</option>`)
      .join("");
    if (prev && Number(prev) < tokens.length) querySel.value = prev;
  }

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);
    if (!tokens.length) return;

    const qi = Number(querySel.value) || 0;
    const t = Number(temp.value);
    const scores = tokens.map((tk) => scoreFor(tokens[qi], tk));
    const weights = softmax(scores, t);

    const ink = token("--ink");
    const ink3 = token("--ink-3");
    const lineC = token("--line");
    const accent = token("--accent");

    const padL = 8;
    const padR = 8;
    const baseline = height - 34;
    const top = 16;
    const usable = width - padL - padR;
    const slot = usable / tokens.length;
    const barW = Math.min(slot * 0.62, 46);

    line(ctx, padL, baseline, width - padR, baseline, lineC, 1);

    const uniform = 1 / tokens.length;
    const uy = baseline - uniform * (baseline - top) * 1.6;
    ctx.save();
    ctx.setLineDash([3, 3]);
    line(ctx, padL, uy, width - padR, uy, ink3, 1);
    ctx.restore();
    label(ctx, "uniform", width - padR, uy - 8, ink3, "right", 9);

    weights.forEach((w, i) => {
      const cx = padL + slot * i + slot / 2;
      const h = w * (baseline - top) * 1.6;
      const y = baseline - h;
      ctx.fillStyle = i === qi ? accent : token("--line-2");
      ctx.fillRect(cx - barW / 2, y, barW, h);
      label(ctx, w.toFixed(2), cx, y - 9, ink3, "center", 9);
      label(ctx, tokens[i], cx, baseline + 14, i === qi ? accent : ink, "center", 10);
    });

    const maxW = Math.max(...weights);
    const entropy = -weights.reduce((a, w) => a + (w > 0 ? w * Math.log(w) : 0), 0);
    readout.innerHTML = `sum <b>${weights.reduce((a, b) => a + b, 0).toFixed(4)}</b> &middot; max <b>${maxW.toFixed(3)}</b> &middot; entropy <b>${entropy.toFixed(3)}</b> of max <b>${Math.log(tokens.length).toFixed(3)}</b>`;
  }

  textInput.addEventListener("input", () => {
    refreshTokens();
    draw();
  });
  querySel.addEventListener("change", draw);
  temp.addEventListener("input", () => {
    tempOut.textContent = Number(temp.value).toFixed(1);
    draw();
  });
  window.addEventListener("resize", draw);
  onThemeChange(draw);

  refreshTokens();
  draw();
}

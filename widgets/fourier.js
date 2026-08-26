import { setup, token, onThemeChange, clear, line, label } from "../lib/canvas.js";

const HARMONICS = 6;

export default function mount(root) {
  const sliders = Array.from({ length: HARMONICS }, (_, i) => {
    const n = i + 1;
    const square = n % 2 === 1 ? (1 / n).toFixed(3) : "0";
    return `<label class="control">a<sub>${n}</sub>
      <input type="range" class="fo-amp" data-n="${n}" min="-1" max="1" step="0.01" value="${square}">
    </label>`;
  }).join("");

  root.innerHTML = `
    <div class="controls">${sliders}</div>
    <div class="controls">
      <button id="fo-square">square wave</button>
      <button id="fo-saw">sawtooth</button>
      <button id="fo-clear">clear</button>
      <label class="control"><input type="checkbox" id="fo-parts" checked> show components</label>
    </div>
    <canvas id="fo-canvas"></canvas>
    <p class="readout" id="fo-readout"></p>`;

  const canvas = root.querySelector("#fo-canvas");
  const view = setup(canvas, 220);
  const amps = Array.from(root.querySelectorAll(".fo-amp"));
  const parts = root.querySelector("#fo-parts");
  const readout = root.querySelector("#fo-readout");

  function values() {
    return amps.map((a) => Number(a.value));
  }

  function setValues(fn) {
    amps.forEach((a, i) => {
      a.value = fn(i + 1).toFixed(3);
    });
    draw();
  }

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);

    const ink3 = token("--ink-3");
    const lineC = token("--line");
    const accent = token("--accent");
    const mid = height / 2;
    const amp = height / 2 - 18;
    const a = values();

    line(ctx, 0, mid, width, mid, lineC, 1);
    label(ctx, "0", 4, mid - 8, ink3, "left", 9);

    if (parts.checked) {
      a.forEach((v, i) => {
        if (Math.abs(v) < 0.005) return;
        const n = i + 1;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 0; px <= width; px++) {
          const t = (px / width) * Math.PI * 2;
          const y = mid - v * Math.sin(n * t) * amp;
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    ctx.strokeStyle = token("--ink");
    ctx.lineWidth = 2;
    ctx.beginPath();
    let peak = 0;
    for (let px = 0; px <= width; px++) {
      const t = (px / width) * Math.PI * 2;
      let y = 0;
      a.forEach((v, i) => {
        y += v * Math.sin((i + 1) * t);
      });
      peak = Math.max(peak, Math.abs(y));
      const py = mid - y * amp;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const active = a.filter((v) => Math.abs(v) >= 0.005).length;
    readout.innerHTML = `<b>${active}</b> of ${HARMONICS} harmonics active &middot; peak amplitude <b>${peak.toFixed(3)}</b>`;
  }

  amps.forEach((a) => a.addEventListener("input", draw));
  parts.addEventListener("change", draw);
  root.querySelector("#fo-square").addEventListener("click", () =>
    setValues((n) => (n % 2 === 1 ? 1 / n : 0)),
  );
  root.querySelector("#fo-saw").addEventListener("click", () =>
    setValues((n) => (n % 2 === 1 ? 1 / n : -1 / n)),
  );
  root.querySelector("#fo-clear").addEventListener("click", () => setValues(() => 0));

  window.addEventListener("resize", draw);
  onThemeChange(draw);
  draw();
}

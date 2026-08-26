import { setup, token, onThemeChange, clear, label } from "../lib/canvas.js";

function trace(n) {
  const steps = [];
  const stack = [];
  function fact(k) {
    stack.push({ k, value: null });
    steps.push({ stack: stack.map((f) => ({ ...f })), action: `call fact(${k})` });
    let result;
    if (k <= 1) {
      result = 1;
    } else {
      result = k * fact(k - 1);
    }
    stack[stack.length - 1].value = result;
    steps.push({
      stack: stack.map((f) => ({ ...f })),
      action: k <= 1 ? `base case, return 1` : `return ${k} × ${result / k} = ${result}`,
    });
    stack.pop();
    return result;
  }
  fact(n);
  steps.push({ stack: [], action: "stack empty" });
  return steps;
}

export default function mount(root) {
  root.innerHTML = `
    <div class="controls">
      <label class="control">n
        <input type="range" id="re-n" min="1" max="7" step="1" value="4">
        <output id="re-n-out">4</output>
      </label>
      <button id="re-prev">back</button>
      <button id="re-next">step</button>
      <button id="re-auto">play</button>
    </div>
    <canvas id="re-canvas"></canvas>
    <p class="readout" id="re-readout"></p>`;

  const canvas = root.querySelector("#re-canvas");
  const view = setup(canvas, 240);
  const nInput = root.querySelector("#re-n");
  const nOut = root.querySelector("#re-n-out");
  const readout = root.querySelector("#re-readout");

  let steps = [];
  let at = 0;
  let timer = null;

  function rebuild() {
    steps = trace(Number(nInput.value));
    at = 0;
    draw();
  }

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);
    const step = steps[at];
    if (!step) return;

    const ink = token("--ink");
    const ink3 = token("--ink-3");
    const accent = token("--accent");
    const soft = token("--accent-soft");
    const line2 = token("--line-2");

    const frameH = 28;
    const gap = 4;
    const boxW = Math.min(width - 20, 320);
    const left = 10;
    const bottom = height - 12;

    step.stack.forEach((frame, i) => {
      const y = bottom - (i + 1) * (frameH + gap);
      const top = i === step.stack.length - 1;
      ctx.fillStyle = top ? soft : "transparent";
      ctx.fillRect(left, y, boxW, frameH);
      ctx.strokeStyle = top ? accent : line2;
      ctx.lineWidth = 1;
      ctx.strokeRect(left + 0.5, y + 0.5, boxW - 1, frameH - 1);
      label(ctx, `fact(${frame.k})`, left + 12, y + frameH / 2, top ? accent : ink, "left", 11);
      label(
        ctx,
        frame.value === null ? "waiting" : `= ${frame.value}`,
        left + boxW - 12,
        y + frameH / 2,
        frame.value === null ? ink3 : ink,
        "right",
        11,
      );
    });

    label(ctx, "call stack", left, 14, ink3, "left", 9);
    readout.innerHTML = `step <b>${at}</b> of ${steps.length - 1} &middot; ${step.action} &middot; depth <b>${step.stack.length}</b>`;
  }

  function next() {
    if (at < steps.length - 1) at++;
    draw();
    return at < steps.length - 1;
  }

  nInput.addEventListener("input", () => {
    nOut.textContent = nInput.value;
    clearInterval(timer);
    timer = null;
    rebuild();
  });
  root.querySelector("#re-next").addEventListener("click", next);
  root.querySelector("#re-prev").addEventListener("click", () => {
    if (at > 0) at--;
    draw();
  });
  root.querySelector("#re-auto").addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      return;
    }
    timer = setInterval(() => {
      if (!next()) {
        clearInterval(timer);
        timer = null;
      }
    }, 500);
  });

  window.addEventListener("resize", draw);
  onThemeChange(draw);
  rebuild();
}

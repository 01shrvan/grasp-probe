import { setup, token, onThemeChange, clear, label } from "../lib/canvas.js";

function buildTrace(input) {
  const a = input.slice();
  const frames = [{ array: a.slice(), i: 1, j: 1, moved: -1, done: false }];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
      frames.push({ array: a.slice(), i, j: j + 1, moved: j + 1, done: false });
    }
    a[j + 1] = key;
    frames.push({ array: a.slice(), i, j: j + 1, moved: j + 1, done: false });
  }
  frames.push({ array: a.slice(), i: a.length, j: -1, moved: -1, done: true });
  return frames;
}

export default function mount(root) {
  root.innerHTML = `
    <div class="controls">
      <button id="so-step">step</button>
      <button id="so-play">play</button>
      <button id="so-reset">shuffle</button>
    </div>
    <canvas id="so-canvas"></canvas>
    <p class="readout" id="so-readout"></p>`;

  const canvas = root.querySelector("#so-canvas");
  const view = setup(canvas, 170);
  const readout = root.querySelector("#so-readout");

  let frames = [];
  let at = 0;
  let timer = null;

  function shuffle() {
    const values = [];
    for (let i = 0; i < 12; i++) values.push(Math.floor(Math.random() * 90) + 10);
    frames = buildTrace(values);
    at = 0;
    draw();
  }

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);
    const frame = frames[at];
    if (!frame) return;

    const ink3 = token("--ink-3");
    const accent = token("--accent");
    const sortedC = token("--accent-soft");
    const bar = token("--line-2");

    const padL = 6;
    const baseline = height - 26;
    const top = 14;
    const slot = (width - padL * 2) / frame.array.length;
    const barW = Math.min(slot * 0.7, 34);
    const maxV = Math.max(...frame.array);

    frame.array.forEach((v, idx) => {
      const cx = padL + slot * idx + slot / 2;
      const h = (v / maxV) * (baseline - top);
      const y = baseline - h;
      let fill = bar;
      if (frame.done) fill = accent;
      else if (idx < frame.i) fill = sortedC;
      if (idx === frame.moved && !frame.done) fill = accent;
      ctx.fillStyle = fill;
      ctx.fillRect(cx - barW / 2, y, barW, h);
      label(ctx, String(v), cx, baseline + 12, ink3, "center", 9);
    });

    if (frame.done) {
      readout.innerHTML = `<b>sorted</b> in ${frames.length - 1} moves`;
    } else {
      readout.innerHTML = `step <b>${at}</b> of ${frames.length - 1} &middot; inserting index <b>${frame.i}</b> &middot; landed at <b>${frame.moved}</b>`;
    }
  }

  function step() {
    if (at < frames.length - 1) at++;
    draw();
    return at < frames.length - 1;
  }

  root.querySelector("#so-step").addEventListener("click", step);
  root.querySelector("#so-reset").addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    shuffle();
  });
  root.querySelector("#so-play").addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      return;
    }
    timer = setInterval(() => {
      if (!step()) {
        clearInterval(timer);
        timer = null;
      }
    }, 260);
  });

  window.addEventListener("resize", draw);
  onThemeChange(draw);
  shuffle();
}

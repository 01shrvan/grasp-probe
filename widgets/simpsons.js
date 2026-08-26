import { setup, token, onThemeChange, clear, line, label } from "../lib/canvas.js";

const GROUPS = [
  { name: "Department A", n: 40, xBase: 0.18, yBase: 0.68, slope: 0.55 },
  { name: "Department B", n: 40, xBase: 0.62, yBase: 0.28, slope: 0.55 },
];

function makePoints(seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return GROUPS.map((g, gi) => {
    const pts = [];
    for (let i = 0; i < g.n; i++) {
      const x = g.xBase + rand() * 0.22;
      const y = g.yBase + (x - g.xBase) * g.slope + (rand() - 0.5) * 0.12;
      pts.push({ x, y, g: gi });
    }
    return pts;
  });
}

function fit(points) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  points.forEach((p) => {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) * (p.x - mx);
  });
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

export default function mount(root) {
  root.innerHTML = `
    <div class="controls">
      <label class="control"><input type="checkbox" id="si-groups" checked> separate the departments</label>
      <button id="si-reshuffle">new sample</button>
    </div>
    <canvas id="si-canvas"></canvas>
    <p class="readout" id="si-readout"></p>`;

  const canvas = root.querySelector("#si-canvas");
  const view = setup(canvas, 250);
  const groupsOn = root.querySelector("#si-groups");
  const readout = root.querySelector("#si-readout");

  let seed = 12345;
  let groups = makePoints(seed);

  function draw() {
    const { ctx, width, height } = view;
    clear(ctx, width, height);

    const ink = token("--ink");
    const ink3 = token("--ink-3");
    const lineC = token("--line");
    const accent = token("--accent");
    const warn = token("--warn");

    const padL = 34;
    const padR = 12;
    const padT = 12;
    const padB = 30;
    const px = (x) => padL + x * (width - padL - padR);
    const py = (y) => height - padB - y * (height - padT - padB);

    line(ctx, padL, py(0), width - padR, py(0), lineC, 1);
    line(ctx, padL, py(0), padL, padT, lineC, 1);
    label(ctx, "hours studied", (width + padL) / 2, height - 10, ink3, "center", 9);
    ctx.save();
    ctx.translate(12, (height - padB + padT) / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, "pass rate", 0, 0, ink3, "center", 9);
    ctx.restore();

    const all = groups.flat();
    const showGroups = groupsOn.checked;

    all.forEach((p) => {
      ctx.fillStyle = showGroups ? (p.g === 0 ? accent : warn) : ink3;
      ctx.globalAlpha = showGroups ? 0.75 : 0.55;
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    const aggregate = fit(all);
    const perGroup = groups.map(fit);

    if (showGroups) {
      perGroup.forEach((f, gi) => {
        const pts = groups[gi];
        const xs = pts.map((p) => p.x);
        const x1 = Math.min(...xs);
        const x2 = Math.max(...xs);
        line(
          ctx,
          px(x1),
          py(f.intercept + f.slope * x1),
          px(x2),
          py(f.intercept + f.slope * x2),
          gi === 0 ? accent : warn,
          2,
        );
        label(ctx, GROUPS[gi].name, px(x2) - 4, py(f.intercept + f.slope * x2) - 12, gi === 0 ? accent : warn, "right", 9);
      });
    } else {
      ctx.save();
      ctx.setLineDash([5, 4]);
      line(
        ctx,
        px(0.15),
        py(aggregate.intercept + aggregate.slope * 0.15),
        px(0.88),
        py(aggregate.intercept + aggregate.slope * 0.88),
        ink,
        2,
      );
      ctx.restore();
      label(ctx, "everyone, pooled", px(0.88) - 4, py(aggregate.intercept + aggregate.slope * 0.88) - 12, ink, "right", 9);
    }

    const sign = (v) => (v >= 0 ? "+" : "");
    if (showGroups) {
      readout.innerHTML = `within A <b>${sign(perGroup[0].slope)}${perGroup[0].slope.toFixed(2)}</b> &middot; within B <b>${sign(perGroup[1].slope)}${perGroup[1].slope.toFixed(2)}</b> &middot; pooled <span class="warn">${sign(aggregate.slope)}${aggregate.slope.toFixed(2)}</span>`;
    } else {
      readout.innerHTML = `pooled slope <b>${sign(aggregate.slope)}${aggregate.slope.toFixed(2)}</b> &middot; tick the box to split by department`;
    }
  }

  groupsOn.addEventListener("change", draw);
  root.querySelector("#si-reshuffle").addEventListener("click", () => {
    seed = Math.floor(Math.random() * 1000000);
    groups = makePoints(seed);
    draw();
  });

  window.addEventListener("resize", draw);
  onThemeChange(draw);
  draw();
}

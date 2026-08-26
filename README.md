# grasp-probe

A one-day experiment, not a product.

## The question

Grasp proposes generating interactive explainers for technical concepts, then
mechanically verifying them. The whole architecture assumes the generated
widgets are *good*. Nobody has checked that.

This probe checks it. Six concepts, one generation pass each, plain prompt, no
repair loop, no gates, no retries, no infrastructure.

## The question being answered

Not "do they run". They will run.

> **Would you rather read these than a good blog post?**

## Method discipline

One pass per concept. No refinement. Hand-tuned widgets would prove nothing
about a pipeline that cannot hand-tune.

## Outcomes decided in advance

| Result | Meaning | Action |
| --- | --- | --- |
| Good | Correctness is the remaining risk | Build Grasp as planned |
| Correct but mediocre | Taste is the bottleneck, not correctness | Redirect: the gates guard the easy half |
| Bad | The medium does not generate | Stop |

Predicted before running: **correct but mediocre**.

## Running it

```
npx serve .
```

ES modules need a server; `file://` will not load them.

To produce the single-file version:

```
node build.mjs
```

Writes `dist/probe.html` with everything inlined.

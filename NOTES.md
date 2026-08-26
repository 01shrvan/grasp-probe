# Findings

Six concepts, one generation pass each, no repair loop, no gates, no retries.

## Verdict

**Correct but mediocre — as predicted before running.** More precisely, and worse
for the plan than predicted:

> **The oracle gate is anti-correlated with pedagogical value across this sample.**

Every concept where a reference implementation exists produced correct arithmetic
on the first pass. Nothing needed repairing. The gate would have caught nothing.
Meanwhile the most valuable widget of the six has no oracle at all.

## Evidence

Arithmetic was checked by hand against the emitted readouts.

| Concept | Oracle | Runs | Maths correct first pass | Would a gate have fired |
| --- | --- | --- | --- | --- |
| Softmax | yes | yes | yes — sums to 1.0000, entropy 1.340 of max 1.792 | no |
| Insertion sort | yes | yes | yes — 54-step trace terminates sorted | no |
| Gradient descent | partial | yes | yes — f(-2.6)=1.3597, f'(-2.6)=-3.3565 exact | no |
| Fourier | yes | yes | yes — 3 odd harmonics, peak 0.930 | no |
| Recursion | no | yes | yes — depth and unwind order correct | n/a |
| Simpson's paradox | no | yes | yes — within +0.44 / +0.36, pooled -0.80 | n/a |

Six for six on first-pass correctness. Zero repairs. Zero gate activations.

## The finding that matters

**The softmax widget fakes the thing it claims to teach.** Its arithmetic is
flawless — softmax, temperature scaling, entropy, all exactly right, and it would
sail through any oracle. But the "attention scores" it feeds into that softmax
come from a string hash, because real attention needs real embeddings and a
one-shot generation has none.

So a learner leaves believing they have seen how attention works. They have seen
how softmax behaves on arbitrary numbers.

**An oracle gate passes this with full marks while the explainer teaches
something false.** That is exactly the failure mode the plan predicted it could
not catch, and it appeared unprompted on the first widget of six.

## The second finding

The best widget of the six is **Simpson's paradox** — toggle the split, watch the
slope sign flip. Its teaching value is entirely in the interaction design and
nothing to do with computation. It is tier 2. It cannot be oracle-checked at all.

## Smaller defects no oracle would catch

- Insertion sort reads `landed at -1` on step 0, before any insertion has happened.
- The softmax bar chart scales bar height by an arbitrary 1.6 factor, so bars can
  exceed the plotted "uniform" reference line without explanation.

Both are presentation defects. Both are invisible to a correctness gate.

## What this says about the plan

The six-week build allocates weeks 2, 3 and 5 to verification — static gate,
render gate, property gate, oracle gate, presentation gate, eval harness. On this
evidence, that machinery guards a door nobody is trying to open.

The real defect rate is in **framing and presentation**, which the plan gates
weakest, and in **what the widget chooses to represent**, which it does not gate
at all.

Recommendation: **redirect, do not build as planned.** The scarce thing is
generation taste, not verification. The presentation gate — the smallest and
least-developed part of the design — is the part that earns its place.

## Caveat, stated plainly

Correctness here was verified from emitted values and source. **Visual and
pedagogical quality has not been assessed by a human yet.** The screenshot tool
in this environment returns blank images, so the "would you rather read this than
a blog post" question is still open and is the user's to answer.

import test from "node:test";
import assert from "node:assert/strict";
import { PhaseGrid } from "../src/grid.js";
import { lensMixer } from "../src/lens.js";
import { config } from "../src/config.js";

test("neighbor averages wrap correctly", () => {
  const grid = new PhaseGrid(3);
  grid.plasma.fill(0);
  const center = grid.idx(1, 1, 1);
  const neighbors = [
    grid.idx(0, 1, 1),
    grid.idx(2, 1, 1),
    grid.idx(1, 0, 1),
    grid.idx(1, 2, 1),
    grid.idx(1, 1, 0),
    grid.idx(1, 1, 2)
  ];
  neighbors.forEach((idx, i) => {
    grid.plasma[idx] = i + 1; // 1..6
  });

  const avg = grid.neighborAvg(center, grid.plasma);
  assert.ok(Math.abs(avg - 3.5) < 1e-5);
});

test("forgiveness damping responds to dispersion spikes", () => {
  const grid = new PhaseGrid(2);
  grid.plasma.fill(1);
  grid.liquid.fill(1);
  grid.solid.fill(0);
  grid.parity.fill(0);

  const originalRandom = Math.random;
  Math.random = () => 0; // force Path B selection

  grid.step({ bias: null, lens: { pathB: config.harmonicClamp[1], damping: 0.4 } });

  Math.random = originalRandom;

  assert.ok(grid.liquid[0] >= 0);
  assert.ok(grid.liquid[0] < 1);
  assert.ok(grid.solid[0] < 0.5);
});

test("lens mixer clamps pathB and returns damping", () => {
  const result = lensMixer({ energy: 0.9, dispersion: 0.9, biasAmplitude: 0.2 });
  assert.ok(result.pathB <= config.harmonicClamp[1]);
  assert.ok(result.pathB >= config.harmonicClamp[0]);
  assert.ok(result.damping > 0);
  assert.ok(result.damping <= 1);
});

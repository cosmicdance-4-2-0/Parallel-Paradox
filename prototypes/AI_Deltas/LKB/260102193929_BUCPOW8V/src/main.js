import { runSession } from './runner.js';

function parseOverrides() {
  const overrides = {};
  if (process.env.LKB_STEPS) overrides.steps = Number(process.env.LKB_STEPS);
  if (process.env.LKB_GRID) overrides.gridSize = Number(process.env.LKB_GRID);
  if (process.env.LKB_PATH_B) overrides.phases = { basePathB: Number(process.env.LKB_PATH_B) };
  if (process.env.LKB_FORGIVENESS) overrides.phases = { ...(overrides.phases || {}), forgiveness: Number(process.env.LKB_FORGIVENESS) };
  return overrides;
}

function main() {
  const overrides = parseOverrides();
  const result = runSession({ config: overrides });
  console.log(JSON.stringify({ status: 'ok', result }, null, 2));
}

main();

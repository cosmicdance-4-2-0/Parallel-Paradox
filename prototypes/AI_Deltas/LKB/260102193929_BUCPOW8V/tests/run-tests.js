import { run as smoke } from './smoke.test.js';
import { run as lens } from './lens.test.js';

function runTest(name, fn) {
  try {
    const label = fn();
    console.log(`PASS ${name} (${label})`);
    return true;
  } catch (err) {
    console.error(`FAIL ${name}:`, err.message);
    return false;
  }
}

const results = [
  runTest('smoke', smoke),
  runTest('lens', lens)
];

if (results.some((ok) => !ok)) {
  process.exitCode = 1;
}

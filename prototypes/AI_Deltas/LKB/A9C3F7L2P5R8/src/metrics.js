export const computeCoherence = (liquidField) => {
  let sum = 0;
  for (const v of liquidField) sum += v;
  const mean = sum / liquidField.length;
  let variance = 0;
  for (const v of liquidField) variance += (v - mean) ** 2;
  variance /= liquidField.length;
  const normalized = Math.max(0, 1 - variance);
  return normalized;
};

export const entropyProxy = (liquidField) => {
  // Bucket into 5 bins to keep it cheap and stable.
  const bins = new Array(5).fill(0);
  for (const v of liquidField) {
    const idx = Math.min(4, Math.max(0, Math.floor(v * 5)));
    bins[idx] += 1;
  }
  const total = liquidField.length || 1;
  let entropy = 0;
  for (const count of bins) {
    if (count === 0) continue;
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy / Math.log2(5); // normalize to [0,1]
};

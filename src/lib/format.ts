export const fmt = (n: number) =>
  n >= 1e12 ? (n/1e12).toFixed(2) + "T" :
  n >= 1e9  ? (n/1e9 ).toFixed(2) + "B" :
  n >= 1e6  ? (n/1e6 ).toFixed(2) + "M" :
  n >= 1e3  ? (n/1e3 ).toFixed(2) + "K" :
  Math.floor(n).toLocaleString();

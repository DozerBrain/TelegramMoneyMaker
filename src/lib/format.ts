// src/lib/format.ts

// FORMATTER WITH ALPHABET NOTATION (aa, ab, ac, ...)
// Used in Idle/Tycoon games for huge numbers.

export function formatMoneyShort(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  if (value < 1000) return value.toString(); // no format for small numbers

  const sign = value < 0 ? "-" : "";
  value = Math.abs(value);

  // All named suffixes up to 10^33
  const NAMED = [
    "K",   // 10^3
    "M",   // 10^6
    "B",   // 10^9
    "T",   // 10^12
    "Qa",  // 10^15 Quadrillion
    "Qi",  // 10^18 Quintillion
    "Sx",  // 10^21 Sextillion
    "Sp",  // 10^24 Septillion
    "Oc",  // 10^27 Octillion
    "No",  // 10^30 Nonillion
    "Dc",  // 10^33 Decillion
  ];

  // Determine the power
  const exponent = Math.floor(Math.log10(value));
  const index = Math.floor(exponent / 3) - 1; // K starts at 10^3

  // If index is inside known names, use them
  if (index < NAMED.length) {
    const suffix = NAMED[index];
    const short = value / Math.pow(10, (index + 1) * 3);
    return sign + formatNumber(short) + suffix;
  }

  // OTHERWISE → Alphabet notation
  // Example:
  // index = 11 → aa
  // index = 12 → ab
  // index = 37 → az
  // index = 38 → ba
  // infinite scaling

  let n = index - NAMED.length; 
  let suffix = "";

  while (true) {
    suffix = String.fromCharCode(97 + (n % 26)) + suffix;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }

  suffix = suffix.toUpperCase(); // "aa" → "AA", "ab" → "AB"

  const short = value / Math.pow(10, (index + 1) * 3);
  return sign + formatNumber(short) + suffix;
}

// clean 12.00 → 12, 12.50 → 12.5
function formatNumber(num: number): string {
  let s = num.toFixed(2);
  if (s.endsWith("00")) s = s.slice(0, -3);
  else if (s.endsWith("0")) s = s.slice(0, -1);
  return s;
}

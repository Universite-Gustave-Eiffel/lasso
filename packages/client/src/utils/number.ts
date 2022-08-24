import { isNil, isNaN } from "lodash";

/**
 * Simple function that take an input and try to convert it as a number.
 */
export function castToNumber(value: unknown): number | null | undefined {
  if (isNil(value)) return value;

  if (typeof value === "boolean") return +value;
  if (value === "") return null;

  const stringValue = "" + value;
  const castValue = +stringValue;

  return isNaN(castValue) || Math.abs(castValue) === Infinity ? null : castValue;
}

/**
 * Given a number, shorten it in string.
 * Example 1234 -> 1.2K
 */
export function shortNumber(value: unknown): string {
  let num = castToNumber(value);
  if (isNil(num)) return "";

  if (Math.abs(num) < 1000) {
    return `${num}`;
  }

  const sign = num < 0 ? "-" : "";
  const suffixes: Record<string, number> = {
    K: 6,
    M: 9,
    B: 12,
    T: 16,
  };

  num = Math.abs(num);
  const size = Math.floor(num).toString().length;

  const exponent = size % 3 === 0 ? size - 3 : size - (size % 3);
  let shortNumber = "" + Math.round(10 * (num / Math.pow(10, exponent))) / 10;

  for (var suffix in suffixes) {
    if (exponent < suffixes[suffix]) {
      shortNumber += suffix;
      break;
    }
  }

  return sign + shortNumber;
}

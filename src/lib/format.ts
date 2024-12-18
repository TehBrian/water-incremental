import currency from "currency.js";

export function if1(count: number, singular: string, plural: string) {
  return count == 1 ? singular : plural;
}

export function sIf1(count: number) {
  return if1(count, "", "s");
}

export function curr(value: number | currency) {
  if (value instanceof currency) {
    value = value.value;
  }
  if (value % 1 === 0) {
    // whole number.
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function if1(count: number, singular: string, plural: string) {
  return count == 1 ? singular : plural;
}

export function sIf1(count: number) {
  return if1(count, '', 's');
}

export function currency(value: number) {
  if (value % 1 === 0) {
    // whole number.
    return value.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

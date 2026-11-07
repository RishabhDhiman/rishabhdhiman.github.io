const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2022-04" -> "Apr 2022"; anything not YYYY-MM is returned as-is. */
export function monthYear(value: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return value;
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export const isIsoMonth = (value: string) => /^\d{4}-\d{2}$/.test(value);

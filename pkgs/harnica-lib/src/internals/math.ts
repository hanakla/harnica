/** Normalize value to 0 to 11 range. Possible to normalize negative value
 * @deprecated
 */
export function normalizeKeyValue(value: number) {
  return ((value % 12) + 12) % 12;
}

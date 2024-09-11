export function getInversionChordKeyValues(
  [...keys]: number[],
  inversion: number,
) {
  if (inversion < 0) {
    for (let i = 0; i < -inversion; i++) keys.unshift(keys.pop()! - 12);
  } else {
    for (let i = 0; i < inversion; i++) keys.push(keys.shift()! + 12);
  }

  return keys;
}

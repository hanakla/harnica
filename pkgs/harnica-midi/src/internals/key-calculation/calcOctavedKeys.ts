export function calcOctavedKeys(keyValues: number[], addOctave: number) {
  return keyValues.map((keyValue) => keyValue + addOctave * 12);
}

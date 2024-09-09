export function replaceStrings(
  str: string,
  replaces: Array<{ str: string; range: [number, number] }>
) {
  // replacesを開始位置で降順にソート
  replaces.sort((a, b) => b.range[0] - a.range[0]);

  return replaces.reduce((result, replace) => {
    const [start, end] = replace.range;
    return result.slice(0, start) + replace.str + result.slice(end);
  }, str);
}

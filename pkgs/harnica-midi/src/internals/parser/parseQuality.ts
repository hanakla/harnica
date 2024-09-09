import { NoteQuality } from "./types";

export function parseQuality(qualityStr: string) {
  const qualities: NoteQuality[] = [];

  const tonicPattern = /^(maj|[Mm]|(?:[-+](?!\d)))/;
  const qualityPattern =
    /(sus[24])|(omit[35])|([b♭#♯+-]5)|((?:dim|aug|add)[-+b♭#♯]?(?:\d+)?)|([-+b#M]?(?:[5679]|69|11|13))/g;

  const tonicMatch = qualityStr.match(tonicPattern);
  if (tonicMatch) {
    // prettier-ignore
    const normalized = (
      tonicMatch[0] == "maj" ? "M"
      : tonicMatch[0] == "-" ? "m"
      : tonicMatch[0]
    ) as 'M' | 'm';

    qualities.push(["quality", normalized]);
    qualityStr = qualityStr.slice(tonicMatch[0].length);
  }

  let tensionMatch: RegExpExecArray | null;
  while ((tensionMatch = qualityPattern.exec(qualityStr)) !== null) {
    const [allMatch, sus, omit, tune] = tensionMatch;

    if (sus) {
      qualities.push(["sus", sus.slice(3)]);
    } else if (omit != null) {
      qualities.push(["omit", omit.slice(4)]);
    } else if (allMatch.startsWith("dim")) {
      qualities.push(["dim", allMatch.slice(3)]);
    } else if (allMatch.startsWith("aug")) {
      qualities.push(["aug", allMatch.slice(3)]);
    } else if (allMatch.startsWith("add")) {
      qualities.push(["add", allMatch.slice(3)]);
    } else if (tune != null) {
      const sign = tune
        .match(/[-+b♭#♯]/)![0]
        .replace(/[♯+]/g, "#")
        .replace(/[♭-]/g, "b") as "#" | "b";
      qualities.push(["tune", sign, "5"]);
    } else {
      qualities.push(["tension", allMatch]);
    }
  }

  return qualities;
}

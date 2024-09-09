export const DEFAULT_KEY = "C";
export const DEFAULT_OCTAVE = 3;

export const DEGREE_TO_KEYVALUE_MAP: Record<string, number> = {
  Ib: -1, // is VII
  "I-": -1,
  I: 0,
  "I#": 1,

  IIb: 1,
  "II-": 1,
  II: 2,
  "II#": 3,

  IIIb: 3,
  "III-": 3,
  III: 4,
  "III#": 5, // is IV

  IVb: 4, // is III
  "IV-": 4,
  IV: 5,
  "IV#": 6,

  Vb: 6,
  "V-": 6,
  V: 7,
  "V#": 8,

  VIb: 8,
  "VI-": 8,
  VI: 9,
  "VI#": 10,

  VIIb: 10,
  "VII-": 10,
  VII: 11,
  "VII#": 12, // is I
};

export const KEYVALUE_TO_DEGREE_MAP: Record<number, string> = {
  0: "I",
  1: "I#",
  2: "II",
  3: "II#",
  4: "III",
  5: "IV",
  6: "IV#",
  7: "V",
  8: "V#",
  9: "VI",
  10: "VI#",
  11: "VII",
  12: "I",
};

export const ALPHA_TO_KEYVALUE_MAP: Record<string, number> = {
  Cb: -1,
  "C-": -1,
  C: 0,
  "C#": 1,
  Db: 1,
  "D-": 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  "E-": 3,
  E: 4,
  "E#": 5,
  Fb: 4,
  "F-": 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  "G-": 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  "A-": 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  "B-": 10,
  B: 11,
  "B#": 12,
};

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const TENSION_NOTE_MAP = {
  "3": 4,
  /** dominant 5th */
  "5": 7,
  /** major 6th */
  "6": 9,
  /** major 7th */
  "7": 11,
  /** major 9th */
  "9": 14,
  /** major 11th */
  "11": 17,
  /** major 13th */
  "13": 21,
};

export const TENSION_NOTE_MAP_KEYS = Object.keys(TENSION_NOTE_MAP);

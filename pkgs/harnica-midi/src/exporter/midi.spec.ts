import { describe, expect, it } from "vitest";
import { progressionToMidi } from "./midi";

const toBase64 = (buffer: ArrayBuffer) => {
  return Buffer.from(buffer).toString("base64");
};

describe("midi", () => {
  describe("toMidi", () => {
    it("works?", () => {
      const midi = progressionToMidi("C4", "C");
      expect(midi.mime).toBe("audio/midi");
      expect(toBase64(midi.buffer)).toMatchSnapshot();
    });

    it("works? 2", () => {
      const midi = progressionToMidi("C4 | Dm4 _ _ | Am/E", "C");
      expect(midi.mime).toBe("audio/midi");
      expect(toBase64(midi.buffer)).toMatchSnapshot();
    });
  });
});

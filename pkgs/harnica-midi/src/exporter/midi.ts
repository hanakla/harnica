import { default as MidiWriter } from "midi-writer-js";
import { parseChordProgression } from "@/internals/parser/chord-parser-2";
import { DEFAULT_BEATS } from "@/internals/constants";

export function progressionToMidi(
  prog: string,
  defaultKey: string,
  beats: number = DEFAULT_BEATS,
) {
  const track = new MidiWriter.Track();
  const chordProgression = parseChordProgression(prog, defaultKey, beats);
  chordProgression.forEach((note) => {
    if (note.type === "bpmChange") {
      const midiNote2 = new MidiWriter.TempoEvent({
        bpm: note.bpmChange.bpm,
        tick: 0, //note.time.duration.tick,
      });

      track.addEvent(midiNote2);
    }

    if (note.type !== "chord") return;

    const midiNote = new MidiWriter.NoteEvent({
      pitch: note.chord.keys,
      duration: note.time.duration.tick,
    });

    track.addEvent(midiNote);
  });

  const writer = new MidiWriter.Writer([track]);
  return dataUriToArrayBuffer(writer.dataUri());
}

const dataUriToArrayBuffer = (dataUri: string) => {
  const byteString = atob(dataUri.split(",")[1]);
  const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
  const ia: number[] = [];

  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return {
    mime: mimeString,
    buffer: new Uint8Array(ia),
  };
};

// Example usage:
// const progression =
//   // "VIIm _ | Im7 | Vsus4 | IIaug | _ | # | C#m7 | Cm7 | Csus4 | Dsus2/B# | Comit9 | Ddim";
//   "C# | D# | Em | F#m | G#m | A#m | Bdim";
// const key: NoteMods = "C";
// const track = generateMidiFile(progression, key);

// const writer = new MidiWriter.Writer([track]);
// writer.stdout();

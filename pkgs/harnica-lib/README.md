# Harnica

`Harnica` is a TypeScript implementation of music theory (hype)  
It can be parsing / building chord note and suggesting next/related chord.

## API Summary

- `parseChordProgression(progStr: string, defaultKey?: string, sigBeats?: number, baseOctave?: number): NoteFragmentType[]`
  Parsing chord progression by `progStr`
  Ex. `'Key=C C | D | E'`, or degree `'Key=C I | II | III'`
- `progressionToMidi(progStr: string, defaultKey: string, beats?: number): { mime: string, buffer: Uint8Array }`
  Generate MIDI binary by chord progression (`progStr`)
- `parseStringAsSingleChordNote(str: string, defaultKey?: string, baseOctabe?: number): NoteFragment.ChordNote | null`
- `analysis.getRelationBetweenNotes(fromNote: NoteFragment.ChordNote, toNote: NoteFragment.ChordNote): Maybe<RelationResult>`
  Get the relationship on the chord progression
- `analysis.getChordFunctionOnKey(chord: string, key: string): Maybe<ChordFunctionMatch>`
  Get chord's function (likes tonic, dominant, sub dominant) on `key`
- `analysis.getAsFunctionOnScales(chord: string, key: string): Maybe<{ [keyName: string]: Array<keyof ChordFunctionMatch> }>`
  Get the function on a different scale of codes
- `suggests.*`
  Suggestion functions

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUpdate } from "react-use";
import { AmplitudeEnvelope, Oscillator, Sampler, Synth } from "tone";
import { Destination } from "tone";
import { Transport } from "tone";
import { Frequency, Time } from "tone/build/esm/core/type/Units";
import { StoreApi, create } from "zustand";
import { persist } from "zustand/middleware";
import { useLocalStorage } from "@/utils/hooks";

type ToneStore = {
  volume: number;
  muted: boolean;
  bpm: number;
  enableMetronome: boolean;
  get: StoreApi<ToneStore>["getState"];
  set: StoreApi<ToneStore>["setState"];
};
const useToneStore = create<ToneStore>()(
  persist(
    (set, get) => ({
      volume: 0,
      muted: false,
      bpm: 120,
      enableMetronome: true,
      get,
      set,
    }),
    {
      name: "toneStore",
      partialize(state) {
        return {
          volume: state.volume,
          bpm: state.bpm,
          // muted: state.muted,
          enableMetronome: state.enableMetronome,
        };
      },
    },
  ),
);

export function useToneInit() {
  const [tone, setToneInstance] = useState<Sampler | null>(null);

  useEffect(() => {
    Transport.stop();
    Transport.cancel();

    Destination.volume.value = 0;

    const tone = new Sampler(
      {
        E1: "e1.ogg",
        E2: "e2.ogg",
        E3: "e3.ogg",
        E4: "e4.ogg",
        E5: "e5.ogg",
      },
      {
        baseUrl: "/public/audios/piano/",
        onload: () => {
          console.log("init", tone);
        },
      },
    ).connect(Destination);

    setToneInstance(tone);
  }, []);

  return tone;
}

export const ToneContext = createContext<Sampler | null>(null);
export function useTone() {
  const tone = useContext(ToneContext);

  const toneStore = useToneStore();
  const [volume, setVolume] = useLocalStorage("volume", 0);

  const metronomeVolumes = useRef({
    accent: 0,
    normal: 0,
  });

  useEffect(() => {
    if (!tone) return;

    tone.volume.value = volume;
    metronomeVolumes.current.accent = accentClickSound!.volume;
    metronomeVolumes.current.normal = clickSound!.volume;
    toneStore.set({ volume });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  return useMemo(
    () => ({
      get muted() {
        return toneStore.get().muted;
      },
      set muted(value: boolean) {
        toneStore.set({ muted: value });

        if (tone) {
          tone.volume.value = value ? -Infinity : toneStore.get().volume;
        }
      },
      get volume() {
        return toneStore.get().volume;
      },
      set volume(value: number) {
        toneStore.set({ volume: value });
        setVolume(value);
        Destination.volume.value = value;
        if (tone) tone.volume.value = value;
      },
      get bpm() {
        return toneStore.get().bpm;
      },
      set bpm(value: number) {
        toneStore.set({ bpm: value });
        Transport.bpm.value = value;
      },
      get enableMetronome() {
        return toneStore.get().enableMetronome;
      },
      set enableMetronome(value: boolean) {
        if (!value) {
          metronomeVolumes.current.accent = accentClickSound!.volume;
          metronomeVolumes.current.normal = clickSound!.volume;
          accentClickSound!.volume = -Infinity;
          clickSound!.volume = -Infinity;
        } else {
          accentClickSound!.volume = metronomeVolumes.current.accent;
          clickSound!.volume = metronomeVolumes.current.normal;
        }

        toneStore.set({ enableMetronome: value });
      },
      triggerAttackRelease: ((...args) => {
        tone?.triggerAttackRelease(...args);
      }) as Sampler["triggerAttackRelease"],
    }),
    [tone, setVolume, toneStore],
  );
}

function createClickSound(duration: Time, velocity: number, pitch: string) {
  const sampler = new Sampler(
    {
      C3: "tick.ogg",
    },
    {
      baseUrl: "/public/audios/",
      onload: () => {
        console.log("loaded");
      },
    },
  );

  sampler.volume.value = velocity * 0.1;

  const env = new AmplitudeEnvelope({
    attack: 0.001,
    decay: duration,
    sustain: 0,
    release: 0.001,
  }).toDestination();

  sampler.connect(env);

  const self = {
    set volume(value: number) {
      console.log("set volume", value);
      sampler.volume.value = value;
    },
    get volume() {
      return sampler.volume.value;
    },
    start: (time: Time) => {
      sampler.triggerAttackRelease(pitch, "1n", time);
      env.triggerAttack(time);
      return self;
    },
    stop: (time: Time) => {
      sampler.triggerRelease(pitch, time);
      env.triggerRelease(time);
      return self;
    },
  };

  return self;
}

export const clickSound =
  typeof window !== "undefined" ? createClickSound(0.05, -4, "C3") : null!;
export const accentClickSound =
  typeof window !== "undefined" ? createClickSound(0.1, 4, "E3") : null!;

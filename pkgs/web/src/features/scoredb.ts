import { nanoid } from "nanoid";
import { connectIdb } from "@/infra/idb";

type ScoreData = {
  bpm: number;
  title: string;
  score: string;
};

export const scoredb = {
  saveScore: async ({ title, score, bpm }: ScoreData) => {
    const db = await connectIdb();

    return db.add("scores", {
      uid: nanoid(),
      title,
      score,
      meta: {
        bpm,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
  updateScore: async (uid: string, { title, score, bpm }: ScoreData) => {
    const db = await connectIdb();
    const $tx = db.transaction("scores", "readwrite");
    const scoreStore = $tx.objectStore("scores");

    const scoreData = await scoreStore.get(uid);
    if (!scoreData) throw new Error("Score not found");

    await scoreStore.put({
      ...scoreData,
      title,
      score,
      meta: {
        bpm,
      },
      updatedAt: new Date(),
    });

    $tx.commit();
    await $tx.done;
  },
};

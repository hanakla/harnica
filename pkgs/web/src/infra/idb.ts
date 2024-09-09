import { DBSchema, openDB } from "idb";

type ScoreRecord = {
  uid: string;
  title: string;
  score: string;
  meta: {
    bpm: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

interface VirseDBSchema extends DBSchema {
  [IDBTableName.scores]: {
    key: string;
    value: ScoreRecord;
    indexes: {
      uid: string;
    };
  };
}

export const IDBTableName = {
  scores: "scores",
} as const;

export type IDBTableName = (typeof IDBTableName)[keyof typeof IDBTableName];

export async function connectIdb() {
  return openDB<VirseDBSchema>("harnica", 1, {
    upgrade(db, oldVersion) {
      if (oldVersion === 0) {
        db.createObjectStore("scores", { keyPath: "uid" });
      }
    },
  });
}

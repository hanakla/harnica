export type Maybe<T> =
  | { ok: true; data: T; error: null; throw?: undefined }
  | { ok: false; data: null; error: Error; throw: () => never };

export const maybe = {
  ok<T>(data: T): Maybe<T> {
    return { ok: true, data, error: null };
  },
  fail<T>(error: Error): Maybe<T> {
    return {
      ok: false,
      data: null,
      error,
      throw: () => {
        throw error;
      },
    };
  },
};

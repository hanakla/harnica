import { getAsFunctionOnScales } from "./getAsFunctionOnScales";

describe("getAsOnScales", () => {
  it("works", () => {
    const actual = getAsFunctionOnScales("I", "C");

    expect(actual).toMatchObject({
      data: {
        C: ["tonic"],
      },
    });
  });
});

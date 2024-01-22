import { _set, _isDefined } from "../lib/cjs/query-utils";

const objectSet = {
  one: {
    two: {
      free: "value",
      four: "value2",
    },
  },
};

describe("Utils", () => {
  it("should set value with path notation", () => {
    const object = _set({}, "one.two.free", "value");
    const addedAnotherKey = _set(object, "one.two.four", "value2");
    expect(addedAnotherKey).toEqual(objectSet);
  });

  it("should detect undefined or null", () => {
    expect(_isDefined(undefined)).toBe(false);
    expect(_isDefined(null)).toBe(false);
    expect(_isDefined(0)).toBe(true);
    expect(_isDefined(false)).toBe(true);
  });
});

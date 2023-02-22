import { _set, _union, _unionBy } from "../lib/cjs/query-utils";

const objectSet = {
  one: {
    two: {
      free: "value",
      four: "value2",
    },
  },
};

const array = ["value1", "value2"];

const obj1 = { key: "one", value: "value1" };
const obj2 = { key: "two", value: "value1" };
const obj3 = { key: "three", value: "value1" };
const obj4 = { key: "four", value: "value1" };
const obj5 = { key: "five", value: "value1" };

const objArray = [obj1, obj2, obj5, obj3, obj4];

describe("Empty operators", () => {
  it("Set", () => {
    const object = _set({}, "one.two.free", "value");
    const addedAnotherKey = _set(object, "one.two.four", "value2");
    expect(addedAnotherKey).toEqual(objectSet);
  });

  it("Union", () => {
    const arr1 = ["value1", "value1", "value2"];
    const arr2 = ["value2"];
    const union = _union(arr1, arr2);
    expect(union).toEqual(array);
  });

  it("UnionBy", () => {
    const arr1 = [obj1, obj2, obj5];
    const arr2 = [obj3, obj4, obj5, obj1, obj2];
    const union = _unionBy((b) => b.key, arr1, arr2);
    expect(union).toEqual(objArray);
  });
});

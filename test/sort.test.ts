import { SQBuilder } from "../builder/sq-builder";

const oneKey = "key";
const secondKey = "key2";
const getOneSort = (key: string) => ({ sort: { [key]: "asc" } });
const getDeepSort = (key: string, subKey: string) => ({
  sort: { [key]: { [subKey]: "asc" } },
});
const getFewSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "asc" }],
});

describe("Sorting query", () => {
  it("String", () => {
    const builtQuery = new SQBuilder().sort(oneKey).build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("Object", () => {
    const builtQuery = new SQBuilder().sort({ key: oneKey, type: "asc" }).build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("Order", () => {
    const builtQuery = new SQBuilder().sort({ key: oneKey, type: "desc" }).build();

    expect(builtQuery).not.toEqual(getOneSort(oneKey));
  });

  it("Same keys", () => {
    const builtQuery = new SQBuilder()
      .sort([
        { key: oneKey, type: "asc" },
        { key: oneKey, type: "asc" },
      ])
      .sort([oneKey, oneKey, oneKey])
      .build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("String array", () => {
    const builtQuery = new SQBuilder().sort([oneKey, secondKey]).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("Object array", () => {
    const builtQuery = new SQBuilder()
      .sort([
        { key: oneKey, type: "asc" },
        { key: secondKey, type: "asc" },
      ])
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("Chain", () => {
    const builtQuery = new SQBuilder()
      .sort(oneKey)
      .sort({ key: secondKey, type: "asc" })
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("Deep by key", () => {
    const builtQuery = new SQBuilder()
      .sort([{ key: `${oneKey}.${secondKey}`, type: "asc" }])
      .build();

    expect(builtQuery).toEqual(getDeepSort(oneKey, secondKey));
  });

  it("Merging", () => {
    const query1 = new SQBuilder().sort([oneKey]);
    const query2 = new SQBuilder().sort([secondKey]);

    const builtQuery = query1.joinSort(query2).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });
});

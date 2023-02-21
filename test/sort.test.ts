import { SQBuilder } from "../builder/sq-builder";

const oneKey = "key";
const secondKey = "key2";
const getOneSort = (key: string) => ({ sort: { [key]: "asc" } });
const getDeepSort = (key: string, subKey: string) => ({
  sort: { [key]: { [subKey]: "asc" } },
});
const getMoreSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "asc" }],
});

describe("Sorting query", () => {
  it("string", () => {
    const query = new SQBuilder().sort(oneKey).build();
    expect(query).toEqual(getOneSort(oneKey));
  });

  it("object", () => {
    const query = new SQBuilder().sort({ key: oneKey, type: "asc" }).build();
    expect(query).toEqual(getOneSort(oneKey));
  });

  it("order", () => {
    const query = new SQBuilder().sort({ key: oneKey, type: "desc" }).build();
    expect(query).not.toEqual(getOneSort(oneKey));
  });

  it("same keys", () => {
    const query = new SQBuilder()
      .sort([
        { key: oneKey, type: "asc" },
        { key: oneKey, type: "asc" },
      ])
      .sort([oneKey, oneKey, oneKey])
      .build();
    expect(query).toEqual(getOneSort(oneKey));
  });

  it("strings", () => {
    const query = new SQBuilder().sort([oneKey, secondKey]).build();
    expect(query).toEqual(getMoreSorts(oneKey, secondKey));
  });

  it("objects", () => {
    const query = new SQBuilder()
      .sort([
        { key: oneKey, type: "asc" },
        { key: secondKey, type: "asc" },
      ])
      .build();
    expect(query).toEqual(getMoreSorts(oneKey, secondKey));
  });

  it("morph", () => {
    const query = new SQBuilder()
      .sort(oneKey)
      .sort({ key: secondKey, type: "asc" })
      .build();

    expect(query).toEqual(getMoreSorts(oneKey, secondKey));
  });

  it("deep sort", () => {
    const query = new SQBuilder()
      .sort([{ key: `${oneKey}.${secondKey}`, type: "asc" }])
      .build();
    expect(query).toEqual(getDeepSort(oneKey, secondKey));
  });

  it("merging", () => {
    const query1 = new SQBuilder().sort([oneKey]);
    const query2 = new SQBuilder().sort([secondKey]);

    const merged = query1.joinSort(query2).build();

    expect(merged).toEqual(getMoreSorts(oneKey, secondKey));
  });
});

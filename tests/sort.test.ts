import SQBuilder from "../lib/cjs";

const oneKey = "key";
const secondKey = "key2";
const getOneSort = (key: string) => ({ sort: { [key]: "asc" } });
const getDeepSort = (key: string, subKey: string) => ({
  sort: { [key]: { [subKey]: "asc" } },
});
const getFewSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "asc" }],
});

const getFewDiffSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "desc" }],
});

describe("Sorting query", () => {
  it("String", () => {
    const builtQuery = new SQBuilder().sort(oneKey).build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("Object", () => {
    const builtQuery = new SQBuilder()
      .sort({ key: oneKey, type: "asc" })
      .build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("Order", () => {
    const builtQuery = new SQBuilder()
      .sort({ key: oneKey, type: "desc" })
      .build();

    expect(builtQuery).not.toEqual(getOneSort(oneKey));
  });

  it("Chain direction", () => {
    const builtQuery = new SQBuilder()
      .sort(oneKey)
      .asc()
      .sort(secondKey)
      .desc()
      .build();

    expect(builtQuery).toEqual(getFewDiffSorts(oneKey, secondKey));
  });

  it("Change all direction", () => {
    const builtQuery = new SQBuilder({ defaultSort: "desc" })
      .sort(oneKey)
      .desc()
      .sort(secondKey)
      .desc()
      .asc(true)
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
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

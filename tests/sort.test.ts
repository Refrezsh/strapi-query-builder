import SQBuilder from "../lib/cjs";

const oneKey = "key";
const secondKey = "key2";
const getOneSort = (key: string) => ({ sort: [{ [key]: "asc" }] });
const getDeepSort = (key: string, subKey: string) => ({
  sort: [{ [key]: { [subKey]: "asc" } }],
});
const getFewSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "asc" }],
});

const getFewDiffSorts = (key1: string, key2: string) => ({
  sort: [{ [key1]: "asc" }, { [key2]: "desc" }],
});

describe("Sort operator", () => {
  it("should sort by string", () => {
    const builtQuery = new SQBuilder().sort(oneKey).build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("should sort by object", () => {
    const builtQuery = new SQBuilder()
      .sortRaw({ key: oneKey, type: "asc" })
      .build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("should change order", () => {
    const builtQuery = new SQBuilder()
      .sortRaw({ key: oneKey, type: "desc" })
      .build();

    expect(builtQuery).not.toEqual(getOneSort(oneKey));
  });

  it("should sort by chain", () => {
    const builtQuery = new SQBuilder()
      .sort(oneKey)
      .asc()
      .sort(secondKey)
      .desc()
      .build();

    expect(builtQuery).toEqual(getFewDiffSorts(oneKey, secondKey));
  });

  it("should change root direction", () => {
    const builtQuery = new SQBuilder({ defaultSort: "desc" })
      .sort(oneKey)
      .desc()
      .sort(secondKey)
      .desc()
      .asc(true)
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should merge same keys", () => {
    const builtQuery = new SQBuilder()
      .sortsRaw([
        { key: oneKey, type: "asc" },
        { key: oneKey, type: "asc" },
      ])
      .sorts([oneKey, oneKey, oneKey])
      .build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("should sort by string array", () => {
    const builtQuery = new SQBuilder().sorts([oneKey, secondKey]).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should sort by object array", () => {
    const builtQuery = new SQBuilder()
      .sortsRaw([
        { key: oneKey, type: "asc" },
        { key: secondKey, type: "asc" },
      ])
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should sort by chain of different forms", () => {
    const builtQuery = new SQBuilder()
      .sort(oneKey)
      .sortRaw({ key: secondKey, type: "asc" })
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should create deep sort", () => {
    const builtQuery = new SQBuilder()
      .sortsRaw([{ key: `${oneKey}.${secondKey}`, type: "asc" }])
      .build();

    expect(builtQuery).toEqual(getDeepSort(oneKey, secondKey));
  });

  it("should join sort", () => {
    const query1 = new SQBuilder().sorts([oneKey]);
    const query2 = new SQBuilder().sort(secondKey);

    const builtQuery = query1.joinSort(query2).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });
});

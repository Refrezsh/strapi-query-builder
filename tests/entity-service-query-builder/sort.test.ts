import { EQBuilder } from "../../lib/cjs";

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
    const builtQuery = new EQBuilder().sortAsc(oneKey).build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("should sort desc order", () => {
    const builtQuery = new EQBuilder().sortDesc(oneKey).build();

    expect(builtQuery).not.toEqual(getOneSort(oneKey));
  });

  it("should sort by chain", () => {
    const builtQuery = new EQBuilder()
      .sortAsc(oneKey)
      .sortDesc(secondKey)
      .build();

    expect(builtQuery).toEqual(getFewDiffSorts(oneKey, secondKey));
  });

  it("should change root direction", () => {
    const builtQuery = new EQBuilder()
      .sortAsc(oneKey)
      .sortAsc(secondKey)
      .build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should merge same keys", () => {
    const builtQuery = new EQBuilder()
      .sortsAsc([oneKey, oneKey, oneKey])
      .build();

    expect(builtQuery).toEqual(getOneSort(oneKey));
  });

  it("should sort by string array", () => {
    const builtQuery = new EQBuilder().sortsAsc([oneKey, secondKey]).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });

  it("should create deep sort", () => {
    const builtQuery = new EQBuilder()
      .sortAsc(`${oneKey}.${secondKey}`)
      .build();

    expect(builtQuery).toEqual(getDeepSort(oneKey, secondKey));
  });

  it("should join sort", () => {
    const query1 = new EQBuilder().sortsAsc([oneKey]);
    const query2 = new EQBuilder().sortAsc(secondKey);

    const builtQuery = query1.joinSort(query2).build();

    expect(builtQuery).toEqual(getFewSorts(oneKey, secondKey));
  });
});

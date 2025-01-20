import { EQBuilder } from "../../lib/cjs";

const mainKey = "key1";
const mainKey2 = "key2";

const keyType1 = "keyType1";
const keyType2 = "ketType2";

describe("Dynamic zone operator", () => {
  it("should create proper query", () => {
    const builtQuery = new EQBuilder()
      .populateDynamic(mainKey, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      )
      .build();

    expect(builtQuery).toEqual(morphQuery);
  });

  it("should create multiple dynamic zones query", () => {
    const builtQuery = new EQBuilder()
      .populateDynamic(mainKey, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      )
      .populateDynamic(mainKey2, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey2, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      )
      .build();

    expect(builtQuery).toEqual(twoMorphQuery);
  });

  it("should select last population for same dynamic zones", () => {
    const builtQuery = new EQBuilder()
      .populateDynamic(mainKey, keyType1, () =>
        new EQBuilder().sortAsc(keyType2)
      )
      .populateDynamic(mainKey, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      )
      .populateDynamic(mainKey, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      )
      .build();

    expect(builtQuery).toEqual(morphQuery);
  });

  it("should join", () => {
    const query1 = new EQBuilder()
      .populateDynamic(mainKey, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      );

    const query2 = new EQBuilder()
      .populateDynamic(mainKey2, keyType1, () =>
        new EQBuilder().sortAsc(keyType1)
      )
      .populateDynamic(mainKey2, keyType2, () =>
        new EQBuilder()
          .field(keyType2)
          .in(keyType2, [keyType2])
          .eq(keyType2, keyType2)
      );

    const builtQuery = new EQBuilder()
      .joinPopulate(query1)
      .joinPopulate(query2)
      .build();

    expect(builtQuery).toEqual(twoMorphQuery);
  });
});

const morphQuery = {
  populate: {
    [mainKey]: {
      on: {
        [keyType1]: { sort: [{ [keyType1]: "asc" }] },
        [keyType2]: {
          fields: [keyType2],
          filters: {
            $and: [
              { [keyType2]: { $in: [keyType2] } },
              { [keyType2]: { $eq: keyType2 } },
            ],
          },
        },
      },
    },
  },
};

const twoMorphQuery = {
  populate: {
    [mainKey]: {
      on: {
        [keyType1]: { sort: [{ [keyType1]: "asc" }] },
        [keyType2]: {
          fields: [keyType2],
          filters: {
            $and: [
              { [keyType2]: { $in: [keyType2] } },
              { [keyType2]: { $eq: keyType2 } },
            ],
          },
        },
      },
    },
    [mainKey2]: {
      on: {
        [keyType1]: { sort: [{ [keyType1]: "asc" }] },
        [keyType2]: {
          fields: [keyType2],
          filters: {
            $and: [
              { [keyType2]: { $in: [keyType2] } },
              { [keyType2]: { $eq: keyType2 } },
            ],
          },
        },
      },
    },
  },
};

import SQBuilder from "../lib/cjs";

const mainKey = "key1";
const mainKey2 = "key2";

const keyType1 = "keyType1";
const keyType2 = "ketType2";

describe("Dynamic zone operator", () => {
  it("should create proper query", () => {
    const builtQuery = new SQBuilder()
      .populateDeep(mainKey, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType1);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .field(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .build();

    expect(builtQuery).toEqual(morphQuery);
  });

  it("should create multiple dynamic zones query", () => {
    const builtQuery = new SQBuilder()
      .populateDeep(mainKey, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType1);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .field(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .populateDeep(mainKey2, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType1);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .field(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .build();

    expect(builtQuery).toEqual(twoMorphQuery);
  });

  it("should select last population for same dynamic zones", () => {
    const builtQuery = new SQBuilder()
      .populateDeep(mainKey, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType2);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .field(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .populateDeep(mainKey, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType1);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .field(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .build();

    expect(builtQuery).toEqual(morphQuery);
  });

  it("should join", () => {
    const query1 = new SQBuilder().populateDeep(mainKey, (keyBuilder) => {
      keyBuilder
        .on(keyType1, (typeBuilder) => {
          typeBuilder.sort(keyType1);
        })
        .on(keyType2, (keyType2Builder) => {
          keyType2Builder
            .field(keyType2)
            .and()
            .filters(keyType2, (b) => b.in([keyType2]))
            .filters(keyType2, (b) => b.eq(keyType2));
        });
    });

    const query2 = new SQBuilder().populateDeep(mainKey2, (keyBuilder) => {
      keyBuilder
        .on(keyType1, (typeBuilder) => {
          typeBuilder.sort(keyType1);
        })
        .on(keyType2, (keyType2Builder) => {
          keyType2Builder
            .field(keyType2)
            .and()
            .filters(keyType2, (b) => b.in([keyType2]))
            .filters(keyType2, (b) => b.eq(keyType2));
        });
    });

    const builtQuery = new SQBuilder()
      .joinPopulation(query1)
      .joinPopulation(query2)
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

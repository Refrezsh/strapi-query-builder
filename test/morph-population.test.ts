import { SQBuilder } from "../builder/sq-builder";

const mainKey = "key1";

const keyType1 = "keyType1";
const keyType2 = "ketType2";

const morphQuery = {
  populate: {
    [mainKey]: {
      on: {
        [keyType1]: { sort: { [keyType1]: "asc" } },
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

describe("Populate morph ", () => {
  it("populate all", () => {
    const query = new SQBuilder()
      .populate(mainKey, (keyBuilder) => {
        keyBuilder
          .on(keyType1, (typeBuilder) => {
            typeBuilder.sort(keyType1);
          })
          .on(keyType2, (keyType2Builder) => {
            keyType2Builder
              .fields(keyType2)
              .and()
              .filters(keyType2, (b) => b.in([keyType2]))
              .filters(keyType2, (b) => b.eq(keyType2));
          });
      })
      .build();

    expect(query).toEqual(morphQuery);
  });
});

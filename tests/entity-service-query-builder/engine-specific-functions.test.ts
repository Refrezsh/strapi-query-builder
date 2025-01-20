import { EQBuilder } from "../../lib/cjs";

const key1 = "key1";
const key2 = "key2";
const populationQuery = {
  sort: [{ [key1]: "asc" }, { [key2]: "desc" }],
  fields: [key1, key2],
  filters: {
    $and: [{ [key1]: { $eq: key1 } }, { [key2]: { $contains: key2 } }],
  },
};

const fullQuery = {
  populate: {
    [key1]: populationQuery,
  },
};

const pubState = { publicationState: "preview" };

const locale = { locale: "uk" };

describe("Utils function", () => {
  it("should publication state works", () => {
    const builtQuery = new EQBuilder().publicationState("preview").build();

    expect(builtQuery).toEqual(pubState);
  });

  // TODO: Uncomment when query engine will be available
  // it("should be publication state omitted for query engine", () => {
  //   const builtQuery = new EQBuilder()
  //     .publicationState("preview")
  //     .build("queryEngine");
  //
  //   expect(builtQuery).toEqual({});
  // });

  it("should locale works for strapi service", () => {
    const builtQuery = new EQBuilder().locale("uk").build();

    expect(builtQuery).toEqual(locale);
  });

  // TODO: Uncomment when query engine will be available
  // it("should be locale omitted for query engine", () => {
  //   const builtQuery = new EQBuilder().locale("uk").build("queryEngine");
  //
  //   expect(builtQuery).toEqual({});
  // });
});

import SQBuilder from "../lib/cjs";

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
  it("should read only block modification", () => {
    const query = new SQBuilder()
      .populate(key1, (key1Builder) => {
        key1Builder
          .sort([key1])
          .sort({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2));
      })
      .readonly();

    query
      .sort("illegalKey")
      .field("illegalKey")
      .filters("key")
      .eq("value")
      .populate("key")
      .page(1)
      .pageSize(24)
      .pageStart(0)
      .pageLimit(24)
      .joinFilters(query)
      .joinFields(query)
      .joinSort(query)
      .joinPopulation(query)
      .joinPagination(query);

    expect(query.build()).toEqual(fullQuery);
  });

  it("should publication state works", () => {
    const builtQuery = new SQBuilder().publicationState("preview").build();

    expect(builtQuery).toEqual(pubState);
  });
  it("should be publication state omitted for query engine", () => {
    const builtQuery = new SQBuilder()
      .publicationState("preview")
      .build("queryEngine");

    expect(builtQuery).toEqual({});
  });

  it("should locale works for strapi service", () => {
    const builtQuery = new SQBuilder().locale("uk").build();

    expect(builtQuery).toEqual(locale);
  });
  it("should be locale omitted for query engine", () => {
    const builtQuery = new SQBuilder().locale("uk").build("queryEngine");

    expect(builtQuery).toEqual({});
  });

  it("should join queries", () => {
    const query1 = new SQBuilder()
      .sort({ key: key1, type: "asc" })
      .field(key1)
      .filters(key1)
      .eq(key1);

    const query2 = new SQBuilder()
      .sort({ key: key2, type: "desc" })
      .field(key2)
      .filters(key2)
      .contains(key2);

    const builtQuery = query1.joinAll(query2).build();

    expect(builtQuery).toEqual(populationQuery);
  });
});

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

describe("Readonly", () => {
  it("Is readonly", () => {
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
      .fields("illegalKey")
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
});

import SQBuilder from "../lib/cjs";

const getAllPopulate = { populate: "*" };
const populateAllQueryEngine = { populate: true };

const key1 = "key1";
const key2 = "key2";

const getKeyPopulation = { populate: { [key1]: true, [key2]: true } };

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

describe("Population operator", () => {
  it("should populate all", () => {
    const builtQuery = new SQBuilder().populateAll().build();

    expect(builtQuery).toEqual(getAllPopulate);
  });

  it("should populate all with true for query engine", () => {
    const builtQuery = new SQBuilder().populateAll().buildQueryEngine();

    expect(builtQuery).toEqual(populateAllQueryEngine);
  });

  it("should merge same keys", () => {
    const builtQuery = new SQBuilder()
      .populates([key1, key2])
      .populate(key1)
      .build();

    expect(builtQuery).toEqual(getKeyPopulation);
  });

  it("should create nested population", () => {
    const builtQuery = new SQBuilder()
      .populateDeep(key1, (key1Builder) => {
        key1Builder
          .sorts([key1])
          .sortRaw({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2));
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should skip illegal operators of population", () => {
    const builtQuery = new SQBuilder()
      .populateDeep(key1, (key1Builder) => {
        key1Builder
          .page(1, true)
          .pageSize(24)
          .locale("ua")
          .publicationState("preview")
          .sorts([key1])
          .sortRaw({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2))
          .build();
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should select last population of same keys", () => {
    const builtQuery = new SQBuilder()
      .populate(key1)
      .populateDeep(key1, (key1Builder) => {
        key1Builder
          .sorts([key1])
          .sortRaw({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2));
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should merge population", () => {
    const sortQuery = new SQBuilder()
      .sorts([key1])
      .sortRaw({ key: key2, type: "desc" });

    const fieldsQuery = new SQBuilder().fields([key1, key2]);

    const filtersQuery = new SQBuilder()
      .and()
      .filters(key1, (b) => b.eq(key1))
      .filters(key2, (b) => b.contains(key2));

    const builtQuery = new SQBuilder()
      .populate(key1)
      .populateDeep(key1, (key1Builder) => {
        key1Builder
          .joinSort(sortQuery)
          .joinFields(fieldsQuery)
          .joinFilters(filtersQuery);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });
});

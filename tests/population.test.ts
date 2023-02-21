import { SQBuilder } from "../lib/cjs";

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

describe("Populate query", () => {
  it("Populate all", () => {
    const builtQuery = new SQBuilder().populate("*").build();

    expect(builtQuery).toEqual(getAllPopulate);
  });

  it("Populate all query engine", () => {
    const builtQuery = new SQBuilder().populate("*").buildQueryEngine();

    expect(builtQuery).toEqual(populateAllQueryEngine);
  });

  it("Populate keys with same key", () => {
    const builtQuery = new SQBuilder()
      .populate([key1, key2])
      .populate(key1)
      .build();

    expect(builtQuery).toEqual(getKeyPopulation);
  });

  it("Complex populate", () => {
    const builtQuery = new SQBuilder()
      .populate(key1, (key1Builder) => {
        key1Builder
          .sort([key1])
          .sort({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2));
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("Illegal actions in complex populate", () => {
    const builtQuery = new SQBuilder()
      .populate(key1, (key1Builder) => {
        key1Builder
          .page(1)
          .sort([key1])
          .sort({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2))
          .build();
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("Key rewrite in complex populate", () => {
    const builtQuery = new SQBuilder()
      .populate(key1)
      .populate(key1, (key1Builder) => {
        key1Builder
          .sort([key1])
          .sort({ key: key2, type: "desc" })
          .fields([key1, key2])
          .and()
          .filters(key1, (b) => b.eq(key1))
          .filters(key2, (b) => b.contains(key2));
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("Complex merging in populate", () => {
    const sortQuery = new SQBuilder()
      .sort([key1])
      .sort({ key: key2, type: "desc" });

    const fieldsQuery = new SQBuilder().fields([key1, key2]);

    const filtersQuery = new SQBuilder()
      .and()
      .filters(key1, (b) => b.eq(key1))
      .filters(key2, (b) => b.contains(key2));

    const builtQuery = new SQBuilder()
      .populate(key1)
      .populate(key1, (key1Builder) => {
        key1Builder
          .joinSort(sortQuery)
          .joinFields(fieldsQuery)
          .joinFilters(filtersQuery);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });
});

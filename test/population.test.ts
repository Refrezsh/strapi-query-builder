import { SQBuilder } from "../builder/sq-builder";

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
  it("populate all", () => {
    const query = new SQBuilder().populate("*").build();

    expect(query).toEqual(getAllPopulate);
  });

  it("populate all query engine", () => {
    const query = new SQBuilder().populate("*").buildQueryEngine();

    expect(query).toEqual(populateAllQueryEngine);
  });

  it("populate keys with same key", () => {
    const query = new SQBuilder().populate([key1, key2]).populate(key1).build();

    expect(query).toEqual(getKeyPopulation);
  });

  it("complex populate", () => {
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
      .build();

    expect(query).toEqual(fullQuery);
  });

  it("illegal actions in complex populate", () => {
    const query = new SQBuilder()
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

    expect(query).toEqual(fullQuery);
  });

  it("key rewrite in complex populate", () => {
    const query = new SQBuilder()
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

    expect(query).toEqual(fullQuery);
  });

  it("complex merging in populate", () => {
    const sortQuery = new SQBuilder()
      .sort([key1])
      .sort({ key: key2, type: "desc" });

    const fieldsQuery = new SQBuilder().fields([key1, key2]);

    const filtersQuery = new SQBuilder()
      .and()
      .filters(key1, (b) => b.eq(key1))
      .filters(key2, (b) => b.contains(key2));

    const query = new SQBuilder()
      .populate(key1)
      .populate(key1, (key1Builder) => {
        key1Builder
          .joinSort(sortQuery)
          .joinFields(fieldsQuery)
          .joinFilters(filtersQuery);
      })
      .build();

    expect(query).toEqual(fullQuery);
  });
});

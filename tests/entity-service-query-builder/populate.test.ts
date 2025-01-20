import { EQBuilder } from "../../lib/cjs";

const getAllPopulate = { populate: "*" };
const populateAllQueryEngine = { populate: true };

const key1 = "key1" as const;
const key2 = "key2" as const;

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
    const builtQuery = new EQBuilder().populateAll().build();

    expect(builtQuery).toEqual(getAllPopulate);
  });

  // TODO: Uncomment when query engine realization will be complete
  // it("should populate all with true for query engine", () => {
  //   const builtQuery = new SQBuilder().populateAll().buildQueryEngine();
  //
  //   expect(builtQuery).toEqual(populateAllQueryEngine);
  // });

  it("should merge same keys", () => {
    const builtQuery = new EQBuilder()
      .populates([key1, key2])
      .populate(key1)
      .build();

    expect(builtQuery).toEqual(getKeyPopulation);
  });

  it("should create nested population", () => {
    const builtQuery = new EQBuilder()
      .populateRelation(key1, () => {
        return new EQBuilder()
          .sortAsc(key1)
          .sort(key2, "desc")
          .fields([key1, key2])
          .eq(key1, key1)
          .contains(key2, key2);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should skip illegal operators of population", () => {
    const builtQuery = new EQBuilder()
      .populateRelation(key1, () => {
        return new EQBuilder()
          .page(1, 26)
          .locale("ua")
          .publicationState("preview")
          .sortAsc(key1)
          .sort(key2, "desc")
          .fields([key1, key2])
          .eq(key1, key1)
          .contains(key2, key2);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should select last population of same keys", () => {
    const builtQuery = new EQBuilder()
      .populate(key1)
      .populateRelation(key1, () => {
        return new EQBuilder()
          .sortAsc(key1)
          .sort(key2, "desc")
          .fields([key1, key2])
          .eq(key1, key1)
          .contains(key2, key2);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });

  it("should merge population", () => {
    const sortQuery = new EQBuilder().sortsAsc([key1]).sortDesc(key2);

    const fieldsQuery = new EQBuilder().fields([key1, key2]);

    const filtersQuery = new EQBuilder().eq(key1, key1).contains(key2, key2);

    const builtQuery = new EQBuilder()
      .populate(key1)
      .populateRelation(key1, () => {
        return new EQBuilder()
          .joinSort(sortQuery)
          .joinFields(fieldsQuery)
          .joinFilters(filtersQuery);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });
});

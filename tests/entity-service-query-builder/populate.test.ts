import { SQBuilder } from "../../lib/cjs";

const getAllPopulate = { populate: "*" };

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
    const builtQuery = new SQBuilder().populateAll().build();

    expect(builtQuery).toEqual(getAllPopulate);
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
      .populateRelation(key1, () => {
        return new SQBuilder()
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
    const builtQuery = new SQBuilder()
      .populateRelation(key1, () => {
        return new SQBuilder()
          .page(1)
          .pageSize(26)
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
    const builtQuery = new SQBuilder()
      .populate(key1)
      .populateRelation(key1, () => {
        return new SQBuilder()
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
    const sortQuery = new SQBuilder().sortsAsc([key1]).sortDesc(key2);

    const fieldsQuery = new SQBuilder().fields([key1, key2]);

    const filtersQuery = new SQBuilder().eq(key1, key1).contains(key2, key2);

    const builtQuery = new SQBuilder()
      .populate(key1)
      .populateRelation(key1, () => {
        return new SQBuilder()
          .joinSort(sortQuery)
          .joinFields(fieldsQuery)
          .joinFilters(filtersQuery);
      })
      .build();

    expect(builtQuery).toEqual(fullQuery);
  });
});

import { SQBuilder, RQBuilder, QQBuilder } from "../../lib/cjs";

const attribute = "attribute";
const value = "value";

export const attributeFilters = [
  "$eq",
  "$eqi",
  "$ne",
  "$nei",
  "$in",
  "$notIn",
  "$lt",
  "$lte",
  "$gt",
  "$gte",
  "$between",
  "$contains",
  "$notContains",
  "$containsi",
  "$notContainsi",
  "$startsWith",
  "$endsWith",
  "$null",
  "$notNull",
] as const;

const getResult = (type: string, negate = false, queryEngine = false) =>
  negate
    ? {
        [queryEngine ? "where" : "filters"]: {
          $and: [{ attribute: { $not: { [type]: value } } }],
        },
      }
    : {
        [queryEngine ? "where" : "filters"]: {
          $and: [{ attribute: { [type]: value } }],
        },
      };

const getTwoResults = (type: string, negateRoot = false, queryEngine = false) =>
  negateRoot
    ? {
        [queryEngine ? "where" : "filters"]: {
          $not: {
            $and: [
              { attribute: { [type]: value } },
              { attribute: { [type]: value } },
            ],
          },
        },
      }
    : {
        [queryEngine ? "where" : "filters"]: {
          $and: [
            { attribute: { [type]: value } },
            { attribute: { [type]: value } },
          ],
        },
      };

describe("Filters operator", () => {
  it("should create filter query for all operators", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new SQBuilder().filter(attribute, atr, value).build();
      expect(builtQuery).toEqual(getResult(atr));
    }
  });

  it("should create query for single attribute and all operators of SQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new SQBuilder()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr));
    }
  });

  it("should create query for single attribute and all operators of RQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new RQBuilder()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr));
    }
  });

  it("should create query for single attribute and all operators of QQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new QQBuilder()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr, false, true));
    }
  });

  it("should create query with not for single attribute and all operators SQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new SQBuilder()
        .filterNot(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true));
    }
  });

  it("should create query with not for single attribute and all operators RQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new RQBuilder()
        .filterNot(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true));
    }
  });

  it("should create query with not for single attribute and all operators QQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new QQBuilder()
        .filterNot(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true, true));
    }
  });

  it("should add not operator to root query SQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new SQBuilder()
        .not()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr, true));
    }
  });

  it("should add not operator to root query QQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new QQBuilder()
        .not()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr, true, true));
    }
  });

  it("should add not operator to root query RQBuilder", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new RQBuilder()
        .not()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr, true, false));
    }
  });

  it("should join filters", () => {
    const query = new SQBuilder().eq(attribute, value);
    const builtQuery = new SQBuilder().joinFilters(query).build();

    expect(builtQuery).toEqual(getResult("$eq"));
  });
});

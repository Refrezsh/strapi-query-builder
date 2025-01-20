import { EQBuilder } from "../../lib/cjs";

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

const getResult = (type: string, negate = false) =>
  negate
    ? { filters: { $and: [{ attribute: { $not: { [type]: value } } }] } }
    : { filters: { $and: [{ attribute: { [type]: value } }] } };

const getTwoResults = (type: string, negateRoot = false) =>
  negateRoot
    ? {
        filters: {
          $not: {
            $and: [
              { attribute: { [type]: value } },
              { attribute: { [type]: value } },
            ],
          },
        },
      }
    : {
        filters: {
          $and: [
            { attribute: { [type]: value } },
            { attribute: { [type]: value } },
          ],
        },
      };

describe("Filters operator", () => {
  it("should create filter query for all operators", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new EQBuilder().filter(attribute, atr, value).build();
      expect(builtQuery).toEqual(getResult(atr));
    }
  });

  it("should create query for single attribute and all operators", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new EQBuilder()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr));
    }
  });

  it("should create query with not for single attribute and all operators", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new EQBuilder()
        .filterNot(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true));
    }
  });

  it("should add not operator to root query", () => {
    for (const atr of attributeFilters) {
      const builtQuery = new EQBuilder()
        .not()
        .and()
        .filter(attribute, atr, value)
        .filter(attribute, atr, value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(atr, true));
    }
  });

  it("should join filters", () => {
    const query = new EQBuilder().eq(attribute, value);
    const builtQuery = new EQBuilder().joinFilters(query).build();

    expect(builtQuery).toEqual(getResult("$eq"));
  });
});

import SQBuilder from "../lib/cjs";

const attribute = "attribute";
const value = "value";

export const attributeFilters = [
  "$eq",
  "$eqi",
  "$ne",
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
];

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
      const fnAttr = atr.replace("$", "");
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      const builtQuery = new SQBuilder()
        .filters(attribute)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(atr));
    }
  });

  it("should not duplicate filter query for all operators", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      const builtQuery = new SQBuilder()
        .filters(attribute)
        [fnAttr](value)
        [fnAttr](value)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(attr));
    }
  });

  it("should create query for single attribute and all operators", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      const builtQuery = new SQBuilder()
        .and()
        .filters(attribute)
        [fnAttr](value)
        .filters(attribute)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(attr));
    }
  });

  it("should create query with not for single attribute and all operators", () => {
    for (const atr of attributeFilters) {
      const fnAttr = atr.replace("$", "");
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      const builtQuery = new SQBuilder()
        .filters(attribute)
        .not()
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true));
    }
  });

  it("should add not operator to root query", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      const builtQuery = new SQBuilder()
        .not()
        .and()
        .filters(attribute)
        [fnAttr](value)
        .filters(attribute)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getTwoResults(attr, true));
    }
  });

  it("should join filters", () => {
    const query = new SQBuilder().filters(attribute).eq(value);
    const builtQuery = new SQBuilder().joinFilters(query).build();

    expect(builtQuery).toEqual(getResult("$eq"));
  });
});

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
    ? { filters: { attribute: { $not: { [type]: value } } } }
    : { filters: { attribute: { [type]: value } } };

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

describe("Filters - one level", () => {
  it("Attributes", () => {
    for (const atr of attributeFilters) {
      const fnAttr = atr.replace("$", "");
      // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
      const builtQuery = new SQBuilder()
        .filters(attribute)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(atr));
    }
  });

  it("Attributes duplicates", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
      const builtQuery = new SQBuilder()
        .filters(attribute)
        [fnAttr](value)
        [fnAttr](value)
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(attr));
    }
  });

  it("Two attributes with same key", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
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

  it("Attribute negation", () => {
    for (const atr of attributeFilters) {
      const fnAttr = atr.replace("$", "");
      // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
      const builtQuery = new SQBuilder()
        .filters(attribute)
        .not()
        [fnAttr](value)
        .build();

      expect(builtQuery).toEqual(getResult(atr, true));
    }
  });

  it("Root negation", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
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

  it("Merge filters", () => {
    const type = attributeFilters[0];
    const fnAttr = type.replace("$", "");

    // @ts-ignore FIXME Why is it impossible (It's works but ts can't inherit function type from class by key)
    const query = new SQBuilder().filters(attribute)[fnAttr](value);
    const builtQuery = new SQBuilder().joinFilters(query).build();

    expect(builtQuery).toEqual(getResult(type));
  });
});

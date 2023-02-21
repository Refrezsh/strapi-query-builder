import { SQBuilder } from "../builder/sq-builder";

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

const getResult = (type) => ({ filters: { attribute: { [type]: value } } });
const getTwoResults = (type) => ({
  filters: {
    $and: [{ attribute: { [type]: value } }, { attribute: { [type]: value } }],
  },
});

describe("Filters - one level", () => {
  it("Attributes", () => {
    for (const atr of attributeFilters) {
      const fnAttr = atr.replace("$", "");
      const query = new SQBuilder().filters(attribute)[fnAttr](value).build();
      expect(query).toEqual(getResult(atr));
    }
  });

  it("Attributes duplicates", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      const query = new SQBuilder()
        .filters(attribute)
        [fnAttr](value)
        [fnAttr](value)
        [fnAttr](value)
        .build();
      expect(query).toEqual(getResult(attr));
    }
  });

  it("Two attributes with same key", () => {
    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      const query = new SQBuilder()
        .and()
        .filters(attribute)
        [fnAttr](value)
        .filters(attribute)
        [fnAttr](value)
        .build();
      expect(query).toEqual(getTwoResults(attr));
    }
  });
});

import { SQBuilder } from "../lib/cjs";
import { attributeFilters } from "./filters-one-level.test";

const emptyObject = {};
const attribute = "attr";

describe("Empty operators", () => {
  it("Logical empty", () => {
    const query = new SQBuilder().or().and().not().build();
    expect(query).toEqual(emptyObject);
  });

  it("Filters empty", () => {
    const query = new SQBuilder().filters(attribute).filters(attribute).build();
    expect(query).toEqual(emptyObject);
  });

  it("Attribute filters empty", () => {
    const query = new SQBuilder();

    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "");
      query[fnAttr](attribute);
    }

    expect(query.build()).toEqual(emptyObject);
  });
});

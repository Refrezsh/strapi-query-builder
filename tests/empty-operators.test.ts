import SQBuilder from "../lib/cjs";
import { attributeFilters } from "./filters-one-level.test";

const emptyObject = {};
const attribute = "attr";

describe("Empty operators", () => {
  it("should be empty for logical filters", () => {
    const query = new SQBuilder().or().and().not().build();
    expect(query).toEqual(emptyObject);
  });

  it("should be empty for filters without selected operator", () => {
    const query = new SQBuilder().filters(attribute).filters(attribute).build();
    expect(query).toEqual(emptyObject);
  });

  it("should be empty for all operators without filters request", () => {
    const query = new SQBuilder<any, any>();

    for (const attr of attributeFilters) {
      const fnAttr = attr.replace("$", "") as keyof SQBuilder<any, any>;
      // @ts-ignore TODO: Typescript won't iterate by keyof SQBuilder
      query[fnAttr](attribute);
    }

    expect(query.build()).toEqual(emptyObject);
  });
});

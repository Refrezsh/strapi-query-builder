import EQBuilder from "../../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Join functions", () => {
  it("should join filters", () => {
    const secondBuilder = new EQBuilder<TestModel>().fields([
      "options",
      "name",
    ]);

    const query = new EQBuilder<TestModel>()
      .field("id")
      .joinFields(secondBuilder)
      .build();

    const typedQuery: { fields: ["id", "options", "name"] } = query;
    expect(typedQuery);
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.fields[1]).toEqual("options");
    expect(typedQuery.fields[2]).toEqual("name");
  });
});

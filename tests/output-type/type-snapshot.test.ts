import EQBuilder from "../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("type snapshot", () => {
  it("should create right type", () => {
    const query = new EQBuilder<TestModel>()
      .field("name")
      .field("id")
      .fields(["options", "description"])
      .sortAsc("name")
      .sortsAsc(["options"])
      .eq("name", "test")
      .filterDeep(() =>
        new EQBuilder<TestModel>()
          .eq("name", "value")
          .notEq("options", "test32332")
          .filterDeep(() =>
            new EQBuilder<TestModel>()
              .notEq("description", "test32332")
              .eq("nested.name", "value")
          )
      )
      .build();

    const assignedQuery: {
      fields: ["name", "id", "options", "description"];
      sort: [{ name: "asc" }, { options: "asc" }];
      filters: {
        $and: [
          { name: { $eq: "test" } },
          {
            $and: [
              { name: { $eq: "value" } },
              { options: { $not: { $eq: "test32332" } } },
              {
                $and: [
                  { description: { $not: { $eq: "test32332" } } },
                  { nested: { name: { $eq: "value" } } }
                ];
              }
            ];
          }
        ];
      };
    } = query;

    expect(assignedQuery).toBeDefined();
  });
});

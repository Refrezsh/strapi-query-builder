import EQBuilder from "../../src/experimental";
import { NestedModel, TestModel } from "./fields-typing.test";

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
      .populateDynamic("nested", "component.1", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new EQBuilder<NestedModel>().notEq("id", "value3")
      )
      .populateRelation("nestedList", () =>
        new EQBuilder<NestedModel>().eq("name", "value2").field("name")
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
      populate: {
        nested: {
          on: {
            "component.1": { filters: { $and: [{ id: { $eq: "value" } }] } };
            "component.2": {
              filters: { $and: [{ id: { $not: { $eq: "value3" } } }] };
            };
          };
        };
        nestedList: {
          fields: ["name"];
          filters: { $and: [{ name: { $eq: "value2" } }] };
        };
      };
    } = query;

    expect(assignedQuery).toBeDefined();
  });
});

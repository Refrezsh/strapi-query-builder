import {
  NestedModel,
  TestModel,
} from "../entity-service-query-builder/types-tests/fields-typing.test";
import { RQBuilder } from "../../lib/cjs";

describe("type snapshot", () => {
  it("should create right type", () => {
    const query = new RQBuilder<TestModel>()
      .field("name")
      .field("id")
      .fields(["options", "description"] as const)
      .sortAsc("name")
      .sortsAsc(["options"] as const)
      .eq("name", "test")
      .filterDeep(() =>
        new RQBuilder<TestModel>()
          .eq("name", "value")
          .notEq("options", "test32332")
          .filterDeep(() =>
            new RQBuilder<TestModel>()
              .notEq("description", "test32332")
              .eq("nested.name", "value")
          )
      )
      .populateDynamic("nested", "component.1", () =>
        new RQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new RQBuilder<NestedModel>().notEq("id", "value3")
      )
      .populateRelation("nestedList", () =>
        new RQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .build();

    const assignedQuery: {
      fields: ["name", "id", "options", "description"];
      sort: ["name:asc", "options:asc"];
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
    expect(assignedQuery.fields[0]).toBe("name");
    expect(assignedQuery.fields[1]).toBe("id");
    expect(assignedQuery.fields[2]).toBe("options");
    expect(assignedQuery.fields[3]).toBe("description");

    expect(assignedQuery.sort[0]).toBe("name:asc");
    expect(assignedQuery.sort[1]).toBe("options:asc");

    expect(assignedQuery.filters.$and[0].name.$eq).toBe("test");
    expect(assignedQuery.filters.$and[1].$and[0].name.$eq).toBe("value");
    expect(assignedQuery.filters.$and[1].$and[1].options.$not.$eq).toBe(
      "test32332"
    );
    expect(
      assignedQuery.filters.$and[1].$and[2].$and[0].description.$not.$eq
    ).toBe("test32332");
    expect(assignedQuery.filters.$and[1].$and[2].$and[1].nested.name.$eq).toBe(
      "value"
    );

    expect(
      assignedQuery.populate.nested.on["component.1"].filters.$and[0].id.$eq
    ).toBe("value");
    expect(
      assignedQuery.populate.nested.on["component.2"].filters.$and[0].id.$not
        .$eq
    ).toBe("value3");
    expect(assignedQuery.populate.nestedList.fields[0]).toBe("name");
    expect(assignedQuery.populate.nestedList.filters.$and[0].name.$eq).toBe(
      "value2"
    );
  });
});

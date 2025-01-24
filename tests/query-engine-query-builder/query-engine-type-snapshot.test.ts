import { QQBuilder } from "../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../entity-service-query-builder/types-tests/fields-typing.test";

describe("Query engine type snapshot", () => {
  it("should create right type", () => {
    const query = new QQBuilder<TestModel>()
      .field("name")
      .field("id")
      .fields(["options", "description"] as const)
      .sortAsc("name")
      .sortsAsc(["options"] as const)
      .eq("name", "test")
      .filterDeep(() =>
        new QQBuilder<TestModel>()
          .eq("name", "value")
          .notEq("options", "test32332")
          .filterDeep(() =>
            new QQBuilder<TestModel>()
              .notEq("description", "test32332")
              .eq("nested.name", "value")
          )
      )
      .filterRelation("nestedList", () =>
        new QQBuilder<NestedModel>().contains("deepNestedList.deepProp", "test")
      )
      .populateDynamic("nested", "component.1", () =>
        new QQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new QQBuilder<NestedModel>().notEq("id", "value3")
      )
      .populateRelation("nestedList", () =>
        new QQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .populate("nestedListOptionalNullableUndefined")
      .start(1)
      .limit(30)
      .build();

    const assignedQuery: {
      select: ["name", "id", "options", "description"];
      orderBy: [{ name: "asc" }, { options: "asc" }];
      where: {
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
          },
          {
            nestedList: {
              $and: [{ deepNestedList: { deepProp: { $contains: "test" } } }];
            };
          }
        ];
      };
      populate: {
        nested: {
          on: {
            "component.1": { where: { $and: [{ id: { $eq: "value" } }] } };
            "component.2": {
              where: { $and: [{ id: { $not: { $eq: "value3" } } }] };
            };
          };
        };
        nestedList: {
          select: ["name"];
          where: { $and: [{ name: { $eq: "value2" } }] };
        };
        nestedListOptionalNullableUndefined: true;
      };
      offset: 1;
      limit: 30;
    } = query;

    expect(assignedQuery).toBeDefined();
    expect(assignedQuery.select[0]).toBe("name");
    expect(assignedQuery.select[1]).toBe("id");
    expect(assignedQuery.select[2]).toBe("options");
    expect(assignedQuery.select[3]).toBe("description");

    expect(assignedQuery.orderBy[0].name).toBe("asc");
    expect(assignedQuery.orderBy[1].options).toBe("asc");

    expect(assignedQuery.where.$and[0].name.$eq).toBe("test");
    expect(assignedQuery.where.$and[1].$and[0].name.$eq).toBe("value");
    expect(assignedQuery.where.$and[1].$and[1].options.$not.$eq).toBe(
      "test32332"
    );
    expect(
      assignedQuery.where.$and[1].$and[2].$and[0].description.$not.$eq
    ).toBe("test32332");
    expect(assignedQuery.where.$and[1].$and[2].$and[1].nested.name.$eq).toBe(
      "value"
    );

    expect(
      assignedQuery.where.$and[2].nestedList.$and[0].deepNestedList.deepProp
        .$contains
    ).toEqual("test");

    expect(
      assignedQuery.populate.nested.on["component.1"].where.$and[0].id.$eq
    ).toBe("value");
    expect(
      assignedQuery.populate.nested.on["component.2"].where.$and[0].id.$not.$eq
    ).toBe("value3");
    expect(assignedQuery.populate.nestedList.select[0]).toBe("name");
    expect(assignedQuery.populate.nestedList.where.$and[0].name.$eq).toBe(
      "value2"
    );
    expect(assignedQuery.populate.nestedListOptionalNullableUndefined).toBe(
      true
    );

    expect(assignedQuery.offset).toBe(1);
    expect(assignedQuery.limit).toBe(30);
  });
});

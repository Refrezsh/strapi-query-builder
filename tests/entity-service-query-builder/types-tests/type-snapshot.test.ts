import { SQBuilder } from "../../../lib/cjs";
import { NestedModel, TestModel } from "./fields-typing.test";

describe("SQBuilder type snapshot", () => {
  it("should create right type", () => {
    const query = new SQBuilder<TestModel>()
      .field("name")
      .field("id")
      .fields(["options", "description"] as const)
      .sortAsc("name")
      .sortsAsc(["options"] as const)
      .eq("name", "test")
      .filterDeep(() =>
        new SQBuilder<TestModel>()
          .eq("name", "value")
          .notEq("options", "test32332")
          .filterDeep(() =>
            new SQBuilder<TestModel>()
              .notEq("description", "test32332")
              .eq("nested.name", "value")
          )
      )
      .filterRelation("nestedList", () =>
        new SQBuilder<NestedModel>().contains("deepNestedList.deepProp", "test")
      )
      .populateDynamic("nested", "component.1", () =>
        new SQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new SQBuilder<NestedModel>().notEq("id", "value3")
      )
      .populateRelation("nestedList", () =>
        new SQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .populate("nestedListOptionalNullableUndefined")
      .publicationState("preview")
      .locale("en")
      .page(1)
      .pageSize(30)
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
        nestedListOptionalNullableUndefined: true;
      };
      publicationState: "preview";
      locale: "en";
      page: 1;
      pageSize: 30;
    } = query;

    expect(assignedQuery).toBeDefined();
    expect(assignedQuery.fields[0]).toBe("name");
    expect(assignedQuery.fields[1]).toBe("id");
    expect(assignedQuery.fields[2]).toBe("options");
    expect(assignedQuery.fields[3]).toBe("description");

    expect(assignedQuery.sort[0].name).toBe("asc");
    expect(assignedQuery.sort[1].options).toBe("asc");

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
      assignedQuery.filters.$and[2].nestedList.$and[0].deepNestedList.deepProp
        .$contains
    ).toEqual("test");

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
    expect(assignedQuery.populate.nestedListOptionalNullableUndefined).toBe(
      true
    );
    expect(assignedQuery.publicationState).toEqual("preview");
    expect(assignedQuery.locale).toEqual("en");
    expect(assignedQuery.page).toEqual(1);
    expect(assignedQuery.pageSize).toEqual(30);
  });
});

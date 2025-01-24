import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("RQBuilder fields", () => {
  it("should produce single type with constant types and right value", () => {
    const singleType = new RQBuilder<TestModel>().field("id").build();
    const singleTypeId: "id" = singleType.fields[0];
    expect(singleTypeId).toEqual("id");
  });

  it("should product multiple type with chain", () => {
    const multipleTypes = new RQBuilder<TestModel>()
      .field("id")
      .field("name")
      .field("description")
      .build();
    const multipleTypeID: "id" = multipleTypes.fields[0];
    const multipleTypeName: "name" = multipleTypes.fields[1];
    const multipleTypeDescription: "description" = multipleTypes.fields[2];

    expect(multipleTypeID).toEqual("id");
    expect(multipleTypeName).toEqual("name");
    expect(multipleTypeDescription).toEqual("description");
  });

  it("should merge same keys and work with fields", () => {
    const withUnionTypes = new RQBuilder<TestModel>()
      .field("id")
      .fields(["name", "description"] as const)
      .field("options")
      .build();
    const withUnionTypeID: "id" = withUnionTypes.fields[0];
    const withUnionTypeName: "name" = withUnionTypes.fields[1];
    const withUnionTypeDescription: "description" = withUnionTypes.fields[2];
    const withUnionTypeOptions: "options" = withUnionTypes.fields[3];

    expect(withUnionTypeID).toEqual("id");
    expect(withUnionTypeName).toEqual("name");
    expect(withUnionTypeDescription).toEqual("description");
    expect(withUnionTypeOptions).toEqual("options");
  });

  it("should work with primitive arrays", () => {
    const primitiveFilters: {
      fields: ["notNestedEnumeration"];
      filters: { $and: [{ notNestedEnumeration: { $eq: "value" } }] };
    } = new RQBuilder<TestModel>()
      .field("notNestedEnumeration")
      .eq("notNestedEnumeration", "value")
      .build();

    expect(primitiveFilters).toBeDefined();
    expect(primitiveFilters.fields[0]).toEqual("notNestedEnumeration");
    expect(primitiveFilters.filters.$and[0].notNestedEnumeration.$eq).toEqual(
      "value"
    );
  });
});

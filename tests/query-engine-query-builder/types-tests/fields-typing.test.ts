import { QQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("QQBuilder select", () => {
  it("should produce single type with constant types and right value", () => {
    const singleType = new QQBuilder<TestModel>().field("id").build();
    const singleTypeId: "id" = singleType.select[0];
    expect(singleTypeId).toEqual("id");
  });

  it("should product multiple type with chain", () => {
    const multipleTypes = new QQBuilder<TestModel>()
      .field("id")
      .field("name")
      .field("description")
      .build();
    const multipleTypeID: "id" = multipleTypes.select[0];
    const multipleTypeName: "name" = multipleTypes.select[1];
    const multipleTypeDescription: "description" = multipleTypes.select[2];

    expect(multipleTypeID).toEqual("id");
    expect(multipleTypeName).toEqual("name");
    expect(multipleTypeDescription).toEqual("description");
  });

  it("should merge same keys and work with select", () => {
    const withUnionTypes = new QQBuilder<TestModel>()
      .field("id")
      .fields(["name", "description"] as const)
      .field("options")
      .build();
    const withUnionTypeID: "id" = withUnionTypes.select[0];
    const withUnionTypeName: "name" = withUnionTypes.select[1];
    const withUnionTypeDescription: "description" = withUnionTypes.select[2];
    const withUnionTypeOptions: "options" = withUnionTypes.select[3];

    expect(withUnionTypeID).toEqual("id");
    expect(withUnionTypeName).toEqual("name");
    expect(withUnionTypeDescription).toEqual("description");
    expect(withUnionTypeOptions).toEqual("options");
  });

  it("should work with primitive arrays", () => {
    const primitiveFilters: {
      select: ["notNestedEnumeration"];
      where: { $and: [{ notNestedEnumeration: { $eq: "value" } }] };
    } = new QQBuilder<TestModel>()
      .field("notNestedEnumeration")
      .eq("notNestedEnumeration", "value")
      .build();

    expect(primitiveFilters).toBeDefined();
    expect(primitiveFilters.select[0]).toEqual("notNestedEnumeration");
    expect(primitiveFilters.where.$and[0].notNestedEnumeration.$eq).toEqual(
      "value"
    );
  });
});

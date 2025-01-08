import EQBuilder from "../../src/experimental";

export interface TestModel {
  id: string;
  name: string;
  description: string;
  options: string;
  nested: {
    name: string;
  };
}

describe("Fields types", () => {
  it("should produce single type with constant types and right value", () => {
    const singleType = new EQBuilder<TestModel>().field("id").build();
    const singleTypeId: "id" = singleType.fields[0];
    expect(singleTypeId).toEqual("id");
  });

  it("should product multiple type with chain", () => {
    const multipleTypes = new EQBuilder<TestModel>()
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
    const withUnionTypes = new EQBuilder<TestModel>()
      .field("id")
      .fields(["name", "description"])
      .field("options")
      .field("id")
      .build();
    const withUnionTypeName: "name" = withUnionTypes.fields[0];
    const withUnionTypeDescription: "description" = withUnionTypes.fields[1];
    const withUnionTypeOptions: "options" = withUnionTypes.fields[2];
    const withUnionTypeID: "id" = withUnionTypes.fields[3];

    expect(withUnionTypes.fields.includes("description")).toEqual(true);
    expect(withUnionTypes.fields.includes("name")).toEqual(true);
    expect(withUnionTypes.fields.includes("options")).toEqual(true);
    expect(withUnionTypes.fields.includes("id")).toEqual(true);
  });
});

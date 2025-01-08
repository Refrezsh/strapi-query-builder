import EQBuilder from "../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Sort types", () => {
  it("should produce single nested asc sort", () => {
    const nestedType = new EQBuilder<TestModel>()
      .sortAsc("nested.name")
      .sortAsc("nested.name")
      .sortAsc("nested.name")
      .build();

    const nestedTypeAscending: "asc" = nestedType.sort[0].nested.name;
    expect(nestedTypeAscending).toBe("asc");
  });

  it("should produce asc sort with nested and default keys", () => {
    const combinedWithOtherSort = new EQBuilder<TestModel>()
      .sortAsc("nested.name")
      .sortAsc("name")
      .sortAsc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "asc" =
      combinedWithOtherSort.sort[0].nested.name;
    const combinedWithOtherSortAscendingName: "asc" =
      combinedWithOtherSort.sort[1].name;
    const combinedWithOtherSortAscendingOptions: "asc" =
      combinedWithOtherSort.sort[2].options;

    expect(combinedWithOtherSortAscendingNested).toBe("asc");
    expect(combinedWithOtherSortAscendingName).toBe("asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("asc");
  });

  it("should sort wit list of key and single sort keys", () => {
    const nestedSortWithKeys = new EQBuilder<TestModel>()
      .sortsAsc(["nested.name", "name"])
      .sortAsc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "asc" =
      nestedSortWithKeys.sort[0].nested.name;
    const combinedWithOtherSortAscendingName: "asc" =
      nestedSortWithKeys.sort[1].name;
    const combinedWithOtherSortAscendingOptions: "asc" =
      nestedSortWithKeys.sort[2].options;

    expect(combinedWithOtherSortAscendingNested).toBe("asc");
    expect(combinedWithOtherSortAscendingName).toBe("asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("asc");
  });

  it("should create cross type", () => {
    const withFields = new EQBuilder<TestModel>()
      .sortAsc("name")
      .field("options")
      .build();
    const withFieldsOptions: "options" = withFields.fields[0];
    const withFieldSort: "asc" = withFields.sort[0].name;
    expect(withFieldsOptions).toBe("options");
    expect(withFieldSort).toBe("asc");
  });
});

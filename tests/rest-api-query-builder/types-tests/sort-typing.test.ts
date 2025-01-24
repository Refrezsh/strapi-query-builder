import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("Sort types", () => {
  it("should produce single nested asc sort", () => {
    const nestedType = new RQBuilder<TestModel>()
      .sortAsc("nested.name")
      .build();

    const nestedTypeAscending: "nested.name:asc" = nestedType.sort[0];
    expect(nestedTypeAscending).toBe("nested.name:asc");
  });

  it("should produce asc sort with nested and default keys", () => {
    const combinedWithOtherSort = new RQBuilder<TestModel>()
      .sortAsc("nested.name")
      .sortAsc("name")
      .sortDesc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "nested.name:asc" =
      combinedWithOtherSort.sort[0];
    const combinedWithOtherSortAscendingName: "name:asc" =
      combinedWithOtherSort.sort[1];
    const combinedWithOtherSortAscendingOptions: "options:desc" =
      combinedWithOtherSort.sort[2];

    expect(combinedWithOtherSortAscendingNested).toBe("nested.name:asc");
    expect(combinedWithOtherSortAscendingName).toBe("name:asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("options:desc");
  });

  it("should sort with list of key and single sort keys", () => {
    const nestedSortWithKeys = new RQBuilder<TestModel>()
      .sortsAsc(["nested.name", "name"] as const)
      .sortDesc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "nested.name:asc" =
      nestedSortWithKeys.sort[0];
    const combinedWithOtherSortAscendingName: "name:asc" =
      nestedSortWithKeys.sort[1];
    const combinedWithOtherSortAscendingOptions: "options:desc" =
      nestedSortWithKeys.sort[2];

    expect(combinedWithOtherSortAscendingNested).toBe("nested.name:asc");
    expect(combinedWithOtherSortAscendingName).toBe("name:asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("options:desc");
  });

  it("should create cross type", () => {
    const withFields = new RQBuilder<TestModel>()
      .sortsDesc(["name"])
      .field("options")
      .build();
    const withFieldsOptions: "options" = withFields.fields[0];
    const withFieldSort: "name:desc" = withFields.sort[0];
    expect(withFieldsOptions).toBe("options");
    expect(withFieldSort).toBe("name:desc");
  });
});

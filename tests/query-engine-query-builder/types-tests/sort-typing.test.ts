import { QQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("QQBuilder orderBy", () => {
  it("should produce single nested asc orderBy", () => {
    const nestedType = new QQBuilder<TestModel>()
      .sortAsc("nested.name")
      .build();

    const nestedTypeAscending: "asc" = nestedType.orderBy[0].nested.name;
    expect(nestedTypeAscending).toBe("asc");
  });

  it("should produce asc orderBy with nested and default keys", () => {
    const combinedWithOtherSort = new QQBuilder<TestModel>()
      .sortAsc("nested.name")
      .sortAsc("name")
      .sortDesc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "asc" =
      combinedWithOtherSort.orderBy[0].nested.name;
    const combinedWithOtherSortAscendingName: "asc" =
      combinedWithOtherSort.orderBy[1].name;
    const combinedWithOtherSortAscendingOptions: "desc" =
      combinedWithOtherSort.orderBy[2].options;

    expect(combinedWithOtherSortAscendingNested).toBe("asc");
    expect(combinedWithOtherSortAscendingName).toBe("asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("desc");
  });

  it("should orderBy with list of key and single orderBy keys", () => {
    const nestedSortWithKeys = new QQBuilder<TestModel>()
      .sortsAsc(["nested.name", "name"] as const)
      .sortDesc("options")
      .build();

    const combinedWithOtherSortAscendingNested: "asc" =
      nestedSortWithKeys.orderBy[0].nested.name;
    const combinedWithOtherSortAscendingName: "asc" =
      nestedSortWithKeys.orderBy[1].name;
    const combinedWithOtherSortAscendingOptions: "desc" =
      nestedSortWithKeys.orderBy[2].options;

    expect(combinedWithOtherSortAscendingNested).toBe("asc");
    expect(combinedWithOtherSortAscendingName).toBe("asc");
    expect(combinedWithOtherSortAscendingOptions).toBe("desc");
  });

  it("should create cross type", () => {
    const withFields = new QQBuilder<TestModel>()
      .sortsDesc(["name"])
      .field("options")
      .build();
    const withFieldsOptions: "options" = withFields.select[0];
    const withFieldSort: "desc" = withFields.orderBy[0].name;
    expect(withFieldsOptions).toBe("options");
    expect(withFieldSort).toBe("desc");
  });
});

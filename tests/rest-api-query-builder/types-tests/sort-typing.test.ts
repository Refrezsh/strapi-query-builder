import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("Sort types", () => {
  it("should produce single nested asc sort", () => {
    const nestedType = new RQBuilder<TestModel>()
      .sortAsc("nested.name")
      .build();

    // @ts-expect-error
    const nestedTypeAscending: "nested.name:asc" = nestedType.sort[0];
    expect(nestedTypeAscending).toBe("nested.name:asc");
  });

  it("should produce asc sort with nested and default keys", () => {
    const combinedWithOtherSort = new RQBuilder<TestModel>()
      .sortAsc("nested.name")
      .sortAsc("name")
      .sortDesc("options")
      .build();

    // @ts-expect-error
    const combinedWithOtherSortAscendingNested: "nested.name:asc" =
      // @ts-expect-error
      combinedWithOtherSort.sort[0];
    // @ts-expect-error
    const combinedWithOtherSortAscendingName: "name:asc" =
      // @ts-expect-error
      combinedWithOtherSort.sort[1];
    // @ts-expect-error
    const combinedWithOtherSortAscendingOptions: "options:desc" =
      // @ts-expect-error
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

    // @ts-expect-error
    const combinedWithOtherSortAscendingNested: "nested.name:asc" =
      // @ts-expect-error
      nestedSortWithKeys.sort[0];
    // @ts-expect-error
    const combinedWithOtherSortAscendingName: "name:asc" =
      // @ts-expect-error
      nestedSortWithKeys.sort[1];
    // @ts-expect-error
    const combinedWithOtherSortAscendingOptions: "options:desc" =
      // @ts-expect-error
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
    // @ts-expect-error
    const withFieldSort: "name:desc" = withFields.sort[0];
    expect(withFieldsOptions).toBe("options");
    expect(withFieldSort).toBe("name:desc");
  });
});

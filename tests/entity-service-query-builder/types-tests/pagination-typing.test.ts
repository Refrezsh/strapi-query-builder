import EQBuilder from "../../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Pagination types", () => {
  it("should crate page pagination", () => {
    const query = new EQBuilder<TestModel>().page(1, 26).build();
    const typedQuery: { page: 1; pageSize: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.page).toEqual(1);
    expect(typedQuery.pageSize).toEqual(26);
  });

  it("should create limit pagination", () => {
    const query = new EQBuilder<TestModel>().pageLimit(1, 26).build();
    const typedQuery: { start: 1; limit: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.start).toEqual(1);
    expect(typedQuery.limit).toEqual(26);
  });

  it("should override page by limit pagination", () => {
    const query = new EQBuilder<TestModel>()
      .page(2, 25)
      .pageLimit(1, 26)
      .build();
    const typedQuery: { start: 1; limit: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.start).toEqual(1);
    expect(typedQuery.limit).toEqual(26);
  });

  it("should override limit by page pagination", () => {
    const query = new EQBuilder<TestModel>()
      .pageLimit(1, 26)
      .page(2, 25)
      .build();
    const typedQuery: { page: 2; pageSize: 25 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.page).toEqual(2);
    expect(typedQuery.pageSize).toEqual(25);
  });
});

import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("RQBuilder pagination", () => {
  it("should crate page query", () => {
    const query = new RQBuilder<TestModel>().page(1).build();
    const typedQuery: { pagination: { page: 1 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.page).toEqual(1);

    // @ts-ignore
    expect(typedQuery.pageSize).toBeUndefined();
  });

  it("should crate pageSize query", () => {
    const query = new RQBuilder<TestModel>().pageSize(26).build();
    const typedQuery: { pagination: { pageSize: 26 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.pageSize).toEqual(26);

    // @ts-ignore
    expect(typedQuery.page).toBeUndefined();
  });

  it("should crate page and pageSize query", () => {
    const query = new RQBuilder<TestModel>().page(1).pageSize(26).build();
    const typedQuery: { pagination: { page: 1; pageSize: 26 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.page).toEqual(1);
    expect(typedQuery.pagination.pageSize).toEqual(26);
  });

  it("should create start query", () => {
    const query = new RQBuilder<TestModel>().start(1).build();
    const typedQuery: { pagination: { start: 1 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.start).toEqual(1);

    // @ts-ignore
    expect(typedQuery.limit).toBeUndefined();
  });

  it("should create limit query", () => {
    const query = new RQBuilder<TestModel>().limit(10).build();
    const typedQuery: { pagination: { limit: 10 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.limit).toEqual(10);

    // @ts-ignore
    expect(typedQuery.start).toBeUndefined();
  });

  it("should create start and limit query", () => {
    const query = new RQBuilder<TestModel>().start(1).limit(10).build();
    const typedQuery: { pagination: { start: 1; limit: 10 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.start).toEqual(1);
    expect(typedQuery.pagination.limit).toEqual(10);
  });

  it("should override page by limit pagination", () => {
    const query = new RQBuilder<TestModel>()
      .page(2)
      .pageSize(26)
      .start(1)
      .limit(26)
      .build();
    const typedQuery: { pagination: { start: 1; limit: 26 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.start).toEqual(1);
    expect(typedQuery.pagination.limit).toEqual(26);
  });

  it("should override limit by page pagination", () => {
    const query = new RQBuilder<TestModel>()
      .start(1)
      .limit(26)
      .page(2)
      .pageSize(25)
      .build();
    const typedQuery: { pagination: { page: 2; pageSize: 25 } } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pagination.page).toEqual(2);
    expect(typedQuery.pagination.pageSize).toEqual(25);
  });
});

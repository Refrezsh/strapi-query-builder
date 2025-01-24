import { SQBuilder } from "../../../lib/cjs";
import { TestModel } from "./fields-typing.test";

describe("SQBuilder pagination", () => {
  it("should crate page query", () => {
    const query = new SQBuilder<TestModel>().page(1).build();
    const typedQuery: { page: 1 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.page).toEqual(1);

    // @ts-ignore
    expect(typedQuery.pageSize).toBeUndefined();
  });

  it("should crate pageSize query", () => {
    const query = new SQBuilder<TestModel>().pageSize(26).build();
    const typedQuery: { pageSize: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.pageSize).toEqual(26);

    // @ts-ignore
    expect(typedQuery.page).toBeUndefined();
  });

  it("should crate page and pageSize query", () => {
    const query = new SQBuilder<TestModel>().page(1).pageSize(26).build();
    const typedQuery: { page: 1; pageSize: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.page).toEqual(1);
    expect(typedQuery.pageSize).toEqual(26);
  });

  it("should create start query", () => {
    const query = new SQBuilder<TestModel>().start(1).build();
    const typedQuery: { start: 1 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.start).toEqual(1);

    // @ts-ignore
    expect(typedQuery.limit).toBeUndefined();
  });

  it("should create limit query", () => {
    const query = new SQBuilder<TestModel>().limit(10).build();
    const typedQuery: { limit: 10 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.limit).toEqual(10);

    // @ts-ignore
    expect(typedQuery.start).toBeUndefined();
  });

  it("should create start and limit query", () => {
    const query = new SQBuilder<TestModel>().start(1).limit(10).build();
    const typedQuery: { start: 1; limit: 10 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.start).toEqual(1);
    expect(typedQuery.limit).toEqual(10);
  });

  it("should override page by limit pagination", () => {
    const query = new SQBuilder<TestModel>()
      .page(2)
      .pageSize(26)
      .start(1)
      .limit(26)
      .build();
    const typedQuery: { start: 1; limit: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.start).toEqual(1);
    expect(typedQuery.limit).toEqual(26);
  });

  it("should override limit by page pagination", () => {
    const query = new SQBuilder<TestModel>()
      .start(1)
      .limit(26)
      .page(2)
      .pageSize(25)
      .build();
    const typedQuery: { page: 2; pageSize: 25 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.page).toEqual(2);
    expect(typedQuery.pageSize).toEqual(25);
  });
});

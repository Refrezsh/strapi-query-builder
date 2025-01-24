import { QQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("QQBuilder pagination", () => {
  it("should create start query", () => {
    const query = new QQBuilder<TestModel>().start(1).build();
    const typedQuery: { offset: 1 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.offset).toEqual(1);

    // @ts-ignore
    expect(typedQuery.limit).toBeUndefined();
  });

  it("should create limit query", () => {
    const query = new QQBuilder<TestModel>().limit(10).build();
    const typedQuery: { limit: 10 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.limit).toEqual(10);

    // @ts-ignore
    expect(typedQuery.start).toBeUndefined();
  });

  it("should create start and limit query", () => {
    const query = new QQBuilder<TestModel>().start(1).limit(10).build();
    const typedQuery: { offset: 1; limit: 10 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.offset).toEqual(1);
    expect(typedQuery.limit).toEqual(10);
  });

  it("should override limit by other limit pagination", () => {
    const query = new QQBuilder<TestModel>()
      .start(2)
      .limit(10)
      .start(1)
      .limit(26)
      .build();
    const typedQuery: { offset: 1; limit: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.offset).toEqual(1);
    expect(typedQuery.limit).toEqual(26);
  });
});

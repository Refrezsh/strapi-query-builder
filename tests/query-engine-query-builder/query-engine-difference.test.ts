import { QQBuilder } from "../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../entity-service-query-builder/types-tests/fields-typing.test";

describe("Query Engine Query Builder", () => {
  it("should create select fields", () => {
    const query = new QQBuilder<TestModel>()
      .field("id")
      .fields(["name", "description"] as const)
      .build();

    const typedQuery: { select: ["id", "name", "description"] } = query;

    expect(typedQuery.select[0]).toBe("id");
    expect(typedQuery.select[1]).toBe("name");
    expect(typedQuery.select[2]).toBe("description");
  });

  it("should create order by", () => {
    const query = new QQBuilder<TestModel>()
      .sortAsc("name")
      .sortDesc("description")
      .build();

    const typedQuery: { orderBy: [{ name: "asc" }, { description: "desc" }] } =
      query;

    expect(typedQuery.orderBy[0].name).toBe("asc");
    expect(typedQuery.orderBy[1].description).toBe("desc");
  });

  it("should create where filters", () => {
    const query: {
      where: {
        $and: [
          { name: { $eq: "value" } },
          { $or: [{ description: { $contains: "value" } }] },
          { nestedList: { $and: [{ id: { $eq: "1" } }] } }
        ];
      };
    } = new QQBuilder<TestModel>()
      .eq("name", "value")
      .filterDeep(() =>
        new QQBuilder<TestModel>().or().contains("description", "value")
      )
      .filterRelation("nestedList", () =>
        new QQBuilder<NestedModel>().eq("id", "1")
      )
      .build();

    const typedQuery = query;

    expect(typedQuery.where.$and[0].name.$eq).toBe("value");
    expect(typedQuery.where.$and[1].$or[0].description.$contains).toBe("value");
    expect(typedQuery.where.$and[2].nestedList.$and[0].id.$eq).toBe("1");
  });

  it("should create offset", () => {
    const query = new QQBuilder<TestModel>().start(10).build();
    const typedQuery: { offset: 10 } = query;
    expect(typedQuery.offset).toBe(10);

    // @ts-ignore
    expect(typedQuery["limit"]).toBeUndefined();
  });

  it("should create limit", () => {
    const query = new QQBuilder<TestModel>().limit(40).build();
    const typedQuery: { limit: 40 } = query;
    expect(typedQuery.limit).toBe(40);

    // @ts-ignore
    expect(typedQuery["offset"]).toBeUndefined();
  });

  it("should combine limit and offset in any direction", () => {
    const limitOffset = new QQBuilder<TestModel>().limit(20).start(5).build();
    const typedLimitOffset: { offset: 5; limit: 20 } = limitOffset;
    expect(typedLimitOffset.offset).toBe(5);
    expect(typedLimitOffset.limit).toBe(20);

    const offsetLimit = new QQBuilder<TestModel>().start(5).limit(20).build();
    const typedOffsetLimit: { offset: 5; limit: 20 } = offsetLimit;
    expect(typedOffsetLimit.offset).toBe(5);
    expect(typedOffsetLimit.limit).toBe(20);
  });
});

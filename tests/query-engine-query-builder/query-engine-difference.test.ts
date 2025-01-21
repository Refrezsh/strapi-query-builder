import { QQBuilder } from "../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../entity-service-query-builder/types-tests/fields-typing.test";

describe("Query Engine Query Builder", () => {
  it("should create select fields", () => {
    const query = new QQBuilder<TestModel>()
      .field("id")
      .fields(["name", "description"])
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

  it("should create offset pagination", () => {
    const query = new QQBuilder<TestModel>().pageLimit(10, 25).build();
    const typedQuery: { offset: 10; limit: 25 } = query;
    expect(typedQuery.offset).toBe(10);
    expect(typedQuery.limit).toBe(25);
  });
});

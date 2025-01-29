import {
  NestedModel,
  TestModel,
} from "../entity-service-query-builder/types-tests/fields-typing.test";
import { RQBuilder } from "../../lib/cjs";

describe("Rest API Query Builder", () => {
  it("should create startsWithi and notStartsWithi", () => {
    const query = new RQBuilder<TestModel>()
      .startsWithi("name", "value")
      .build();

    // @ts-expect-error
    const queryTyped: {
      filters: { $and: [{ name: { $startsWithi: "value" } }] };
    } = query;

    expect(queryTyped.filters.$and[0].name.$startsWithi).toBe("value");
  });

  it("should create not startsWithi", () => {
    const queryWithNot = new RQBuilder<TestModel>()
      .notStartsWithi("name", "value")
      .build();

    // @ts-expect-error
    const queryTyped: {
      filters: { $and: [{ name: { $not: { $startsWithi: "value" } } }] };
    } = queryWithNot;

    expect(queryTyped.filters.$and[0].name.$not.$startsWithi).toBe("value");
  });

  it("should create endsWithi and notStartsWithi", () => {
    const query = new RQBuilder<TestModel>().endsWithi("name", "value").build();

    // @ts-expect-error
    const queryTyped: {
      filters: { $and: [{ name: { $endsWithi: "value" } }] };
    } = query;

    expect(queryTyped.filters.$and[0].name.$endsWithi).toBe("value");
  });

  it("should create not endsWithi", () => {
    const queryWithNot = new RQBuilder<TestModel>()
      .notEndsWithi("name", "value")
      .build();

    // @ts-expect-error
    const queryTyped: {
      filters: { $and: [{ name: { $not: { $endsWithi: "value" } } }] };
    } = queryWithNot;

    expect(queryTyped.filters.$and[0].name.$not.$endsWithi).toBe("value");
  });

  it("should create pagination withCount by default", () => {
    const query = new RQBuilder<TestModel>().page(1).build();
    // @ts-expect-error
    const queryTyped: { pagination: { page: 1; withCount: true } } = query;
    expect(queryTyped.pagination.page).toBe(1);
    expect(queryTyped.pagination.withCount).toBe(true);
  });

  it("should create pagination withCount as false", () => {
    const query = new RQBuilder<TestModel>()
      .page(1, false)
      .pageSize(40)
      .build();

    // @ts-expect-error
    const queryTyped: {
      pagination: { page: 1; withCount: false; pageSize: 40 };
    } = query;
    expect(queryTyped.pagination.page).toBe(1);
    expect(queryTyped.pagination.withCount).toBe(false);
    expect(queryTyped.pagination.pageSize).toBe(40);
  });

  it("should create offset pagination withCount by default", () => {
    const query = new RQBuilder<TestModel>().start(1).build();
    // @ts-expect-error
    const queryTyped: { pagination: { start: 1; withCount: true } } = query;
    expect(queryTyped.pagination.start).toBe(1);
    expect(queryTyped.pagination.withCount).toBe(true);
  });

  it("should create offset pagination withCount as false", () => {
    const query = new RQBuilder<TestModel>().start(1, false).limit(40).build();

    // @ts-expect-error
    const queryTyped: {
      pagination: { start: 1; withCount: false; limit: 40 };
    } = query;
    expect(queryTyped.pagination.start).toBe(1);
    expect(queryTyped.pagination.withCount).toBe(false);
    expect(queryTyped.pagination.limit).toBe(40);
  });

  it("should create sort as strings", () => {
    const query = new RQBuilder<TestModel>()
      .sortDesc("id")
      .sortAsc("name")
      .sortsAsc(["options", "nested.id"] as const)
      .build();

    // @ts-expect-error
    const queryTyped: {
      sort: ["id:desc", "name:asc", "options:asc", "nested.id:asc"];
    } = query;

    expect(queryTyped.sort.length).toBe(4);
    expect(queryTyped.sort.includes("id:desc")).toBe(true);
    expect(queryTyped.sort.includes("name:asc")).toBe(true);
    expect(queryTyped.sort.includes("options:asc")).toBe(true);
    expect(queryTyped.sort.includes("nested.id:asc")).toBe(true);
  });

  it("should create populate with single keys, as key with sub-populate", () => {
    const query = new RQBuilder<TestModel>()
      .populate("nested")
      .populateRelation("nestedList", () =>
        new RQBuilder<NestedModel>().field("name")
      )
      .build();

    const queryTyped: {
      populate: { nested: { populate: "*" }; nestedList: { fields: ["name"] } };
    } = query;

    expect(queryTyped.populate.nested.populate).toBe("*");
    expect(queryTyped.populate.nestedList.fields[0]).toBe("name");
  });
});

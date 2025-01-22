import { RQBuilder } from "../../lib/cjs";
import { TestModel } from "../entity-service-query-builder/types-tests/fields-typing.test";

describe("Rest API Query Builder", () => {
  it("should create startsWithi and notStartsWithi", () => {
    const query = new RQBuilder<TestModel>()
      .startsWithi("name", "value")
      .build();

    const queryTyped: {
      filters: { $and: [{ name: { $startsWithi: "value" } }] };
    } = query;

    expect(queryTyped.filters.$and[0].name.$startsWithi).toBe("value");
  });

  it("should create not startsWithi", () => {
    const queryWithNot = new RQBuilder<TestModel>()
      .notStartsWithi("name", "value")
      .build();

    const queryTyped: {
      filters: { $and: [{ name: { $not: { $startsWithi: "value" } } }] };
    } = queryWithNot;

    expect(queryTyped.filters.$and[0].name.$not.$startsWithi).toBe("value");
  });

  it("should create endsWithi and notStartsWithi", () => {
    const query = new RQBuilder<TestModel>().endsWithi("name", "value").build();

    const queryTyped: {
      filters: { $and: [{ name: { $endsWithi: "value" } }] };
    } = query;

    expect(queryTyped.filters.$and[0].name.$endsWithi).toBe("value");
  });

  it("should create not endsWithi", () => {
    const queryWithNot = new RQBuilder<TestModel>()
      .notEndsWithi("name", "value")
      .build();

    const queryTyped: {
      filters: { $and: [{ name: { $not: { $endsWithi: "value" } } }] };
    } = queryWithNot;

    expect(queryTyped.filters.$and[0].name.$not.$endsWithi).toBe("value");
  });
});

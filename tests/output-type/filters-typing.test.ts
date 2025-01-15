import EQBuilder from "../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Filter types", () => {
  it("should create single eq", () => {
    const eqFilter = new EQBuilder<TestModel>().eq("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eq: "1" } } = eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eq).toBe("1");
  });

  it("should create empty filters", () => {
    const eqFilter: {} = new EQBuilder<TestModel>()
      .or()
      .not()
      .and()
      .not()
      .and()
      .build();

    expect(Object.keys(eqFilter).length).toBe(0);
  });

  it("should update root logical to $or", () => {
    const eqFilter = new EQBuilder<TestModel>().or().eq("nested", "1").build();

    const filters = eqFilter.filters.$or;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eq: "1" } } = eqFilter.filters.$or[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eq).toBe("1");
  });

  it("should update root logical to $not $or", () => {
    const eqFilter = new EQBuilder<TestModel>()
      .not()
      .or()
      .eq("nested", "1")
      .build();

    const filters = eqFilter.filters.$not.$or;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eq: "1" } } = eqFilter.filters.$not.$or[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eq).toBe("1");
  });

  it("should leave $and after filters chain", () => {
    const eqFilter = new EQBuilder<TestModel>()
      .not()
      .or()
      .or()
      .and()
      .eq("nested", "1")
      .build();

    const filters = eqFilter.filters.$not.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eq: "1" } } = eqFilter.filters.$not.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eq).toBe("1");
  });

  it("should produce multiple filters with $or, $not and nested keys", () => {
    const dynamic: string = "nice";

    const eqFilter: {
      filters: {
        $not: {
          $or: [
            { name: { $eq: "1" } },
            { options: { $eq: "2" } },
            { description: { $eq: "3" } },
            { nested: { name: { $eq: string } } }
          ];
        };
      };
    } = new EQBuilder<TestModel>()
      .not()
      .or()
      .eq("name", "1")
      .eq("options", "2")
      .eq("description", "3")
      .eq("nested.name", dynamic)
      .build();

    const filters = eqFilter.filters.$not.$or;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(4);

    const nameFilter = filters[0];
    expect(nameFilter).toBeDefined();
    expect(nameFilter.name.$eq).toBe("1");

    const optionsFilter = filters[1];
    expect(optionsFilter).toBeDefined();
    expect(optionsFilter.options.$eq).toBe("2");

    const descriptionFilter = filters[2];
    expect(descriptionFilter).toBeDefined();
    expect(descriptionFilter.description.$eq).toBe("3");

    const dynamicFilter = filters[3];
    expect(dynamicFilter).toBeDefined();
    expect(dynamicFilter.nested.name.$eq).toBe(dynamic);
  });

  it("should produce type for deep filters", () => {
    const nestedBuilder = new EQBuilder<TestModel>().filterDeep(() => {
      return new EQBuilder<TestModel>().or().eq("name", "1").eq("name", "2");
    });
  });
});

import EQBuilder from "../../../src/experimental";
import { NestedModel, TestModel } from "./fields-typing.test";

describe("Filter types", () => {
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
    const nestedBuilder = new EQBuilder<TestModel>()
      .or()
      .eq("options", "1")
      .filterDeep(() =>
        new EQBuilder<TestModel>()
          .or()
          .notEq("name", "1")
          .eq("nested.name", "2")
      )
      .build();

    const filters: {
      $or: [
        { options: { $eq: "1" } },
        {
          $or: [
            { name: { $not: { $eq: "1" } } },
            { nested: { name: { $eq: "2" } } }
          ];
        }
      ];
    } = nestedBuilder.filters;

    const singleFilter = filters.$or[0];
    expect(singleFilter).toBeDefined();
    expect(singleFilter.options.$eq).toBe("1");

    const deepNestedFilters = filters.$or[1];
    const nameFilter = deepNestedFilters.$or[0];
    expect(nameFilter).toBeDefined();
    expect(nameFilter.name.$not.$eq).toBe("1");

    const nestedNameFilter = deepNestedFilters.$or[1];
    expect(nestedNameFilter).toBeDefined();
    expect(nestedNameFilter.nested.name.$eq).toBe("2");
  });

  it("should produce type for relation filter", () => {
    const nestedFilter = new EQBuilder<TestModel>()
      .filterRelation("nested", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .build();

    const filters: {
      $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
    } = nestedFilter.filters;

    const nestedFilters = filters.$and[0];
    expect(nestedFilters).toBeDefined();
    expect(nestedFilters.nested.$and.length).toBe(1);

    const relationFilter = nestedFilters.nested.$and[0];
    expect(relationFilter).toBeDefined();
    expect(relationFilter.id.$eq).toBe("value");
  });

  it("should create single eq", () => {
    const eqFilter = new EQBuilder<TestModel>().eq("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eq: "1" } } = eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eq).toBe("1");
  });

  it("should create single not eq", () => {
    const eqFilter = new EQBuilder<TestModel>().notEq("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $not: { $eq: "1" } } } =
      eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$not.$eq).toBe("1");
  });

  it("should create single eqi", () => {
    const eqFilter = new EQBuilder<TestModel>().eqi("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $eqi: "1" } } = eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$eqi).toBe("1");
  });

  it("should create single not eqi", () => {
    const eqFilter = new EQBuilder<TestModel>().notEqi("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $not: { $eqi: "1" } } } =
      eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$not.$eqi).toBe("1");
  });

  it("should create single ne", () => {
    const eqFilter = new EQBuilder<TestModel>().ne("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $ne: "1" } } = eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$ne).toBe("1");
  });

  it("should create single nei", () => {
    const eqFilter = new EQBuilder<TestModel>().nei("nested", "1").build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { $nei: "1" } } = eqFilter.filters.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.$nei).toBe("1");
  });

  it("should create single in", () => {
    const eqFilter = new EQBuilder<TestModel>()
      .in("nested.id", [1, 2, 3])
      .build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $in: number[] } } } =
      eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$in[0]).toBe(1);
    expect(idFilter.nested.id.$in[1]).toBe(2);
    expect(idFilter.nested.id.$in[2]).toBe(3);
  });

  it("should create single notIn", () => {
    const eqFilter = new EQBuilder<TestModel>().notIn("id", [1, 2, 3]).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { id: { $notIn: number[] } } = eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.id.$notIn[0]).toBe(1);
    expect(idFilter.id.$notIn[1]).toBe(2);
    expect(idFilter.id.$notIn[2]).toBe(3);
  });

  it("should create single lt", () => {
    const eqFilter = new EQBuilder<TestModel>().lt("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $lt: 1 } } } = eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$lt).toBe(1);
  });

  it("should create single not lt", () => {
    const eqFilter = new EQBuilder<TestModel>().notLt("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $lt: 1 } } } } =
      eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$lt).toBe(1);
  });

  it("should create single lt", () => {
    const eqFilter = new EQBuilder<TestModel>().lte("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $lte: 1 } } } = eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$lte).toBe(1);
  });

  it("should create single not lte", () => {
    const eqFilter = new EQBuilder<TestModel>().notLte("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $lte: 1 } } } } =
      eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$lte).toBe(1);
  });

  it("should create single gt", () => {
    const eqFilter = new EQBuilder<TestModel>().gt("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $gt: 1 } } } = eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$gt).toBe(1);
  });

  it("should create single not gt", () => {
    const eqFilter = new EQBuilder<TestModel>().notGt("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $gt: 1 } } } } =
      eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$gt).toBe(1);
  });

  it("should create single gte", () => {
    const eqFilter = new EQBuilder<TestModel>().gte("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $gte: 1 } } } = eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$gte).toBe(1);
  });

  it("should create single not gte", () => {
    const eqFilter = new EQBuilder<TestModel>().notGte("nested.id", 1).build();

    const filters = eqFilter.filters.$and;
    expect(filters).toBeDefined();
    expect(filters.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $gte: 1 } } } } =
      eqFilter.filters.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$gte).toBe(1);
  });
});

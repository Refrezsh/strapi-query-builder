import { QQBuilder } from "../../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("QQBuilder filter", () => {
  it("should create empty where", () => {
    const eqFilter: {} = new QQBuilder<TestModel>()
      .or()
      .not()
      .and()
      .not()
      .and()
      .build();

    expect(Object.keys(eqFilter).length).toBe(0);
  });

  it("should update root logical to $or", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .or()
      .eq("nested.id", "1")
      .build();

    const where = eqFilter.where.$or;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $eq: "1" } } } = eqFilter.where.$or[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$eq).toBe("1");
  });

  it("should update root logical to $not $or", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .not()
      .or()
      .eq("nested.name", "1")
      .build();

    const where = eqFilter.where.$not.$or;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { name: { $eq: "1" } } } =
      eqFilter.where.$not.$or[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.name.$eq).toBe("1");
  });

  it("should leave $and after where chain", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .not()
      .or()
      .or()
      .and()
      .eq("nested.id", "1")
      .build();

    const where = eqFilter.where.$not.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $eq: "1" } } } =
      eqFilter.where.$not.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$eq).toBe("1");
  });

  it("should produce multiple where with $or, $not and nested keys", () => {
    const dynamic: string = "nice";

    const eqFilter: {
      where: {
        $not: {
          $or: [
            { name: { $eq: "1" } },
            { options: { $eq: "2" } },
            { description: { $eq: "3" } },
            { nested: { name: { $eq: string } } }
          ];
        };
      };
    } = new QQBuilder<TestModel>()
      .not()
      .or()
      .eq("name", "1")
      .eq("options", "2")
      .eq("description", "3")
      .eq("nested.name", dynamic)
      .build();

    const where = eqFilter.where.$not.$or;
    expect(where).toBeDefined();
    expect(where.length).toBe(4);

    const nameFilter = where[0];
    expect(nameFilter).toBeDefined();
    expect(nameFilter.name.$eq).toBe("1");

    const optionsFilter = where[1];
    expect(optionsFilter).toBeDefined();
    expect(optionsFilter.options.$eq).toBe("2");

    const descriptionFilter = where[2];
    expect(descriptionFilter).toBeDefined();
    expect(descriptionFilter.description.$eq).toBe("3");

    const dynamicFilter = where[3];
    expect(dynamicFilter).toBeDefined();
    expect(dynamicFilter.nested.name.$eq).toBe(dynamic);
  });

  it("should produce type for deep where", () => {
    const nestedBuilder = new QQBuilder<TestModel>()
      .or()
      .eq("options", "1")
      .filterDeep(() =>
        new QQBuilder<TestModel>()
          .or()
          .notEq("name", "1")
          .eq("nested.name", "2")
      )
      .build();

    const where: {
      $or: [
        { options: { $eq: "1" } },
        {
          $or: [
            { name: { $not: { $eq: "1" } } },
            { nested: { name: { $eq: "2" } } }
          ];
        }
      ];
    } = nestedBuilder.where;

    const singleFilter = where.$or[0];
    expect(singleFilter).toBeDefined();
    expect(singleFilter.options.$eq).toBe("1");

    const deepNestedFilters = where.$or[1];
    const nameFilter = deepNestedFilters.$or[0];
    expect(nameFilter).toBeDefined();
    expect(nameFilter.name.$not.$eq).toBe("1");

    const nestedNameFilter = deepNestedFilters.$or[1];
    expect(nestedNameFilter).toBeDefined();
    expect(nestedNameFilter.nested.name.$eq).toBe("2");
  });

  it("should produce type for relation filter", () => {
    const nestedFilter = new QQBuilder<TestModel>()
      .filterRelation("nested", () =>
        new QQBuilder<NestedModel>().eq("id", "value")
      )
      .build();

    const where: {
      $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
    } = nestedFilter.where;

    const nestedFilters = where.$and[0];
    expect(nestedFilters).toBeDefined();
    expect(nestedFilters.nested.$and.length).toBe(1);

    const relationFilter = nestedFilters.nested.$and[0];
    expect(relationFilter).toBeDefined();
    expect(relationFilter.id.$eq).toBe("value");
  });

  it("should create single eq", () => {
    const eqFilter = new QQBuilder<TestModel>().eq("nested.name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { name: { $eq: "1" } } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.name.$eq).toBe("1");
  });

  it("should create single not eq", () => {
    const eqFilter = new QQBuilder<TestModel>().notEq("nested.id", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $eq: "1" } } } } =
      eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$eq).toBe("1");
  });

  it("should create single eqi", () => {
    const eqFilter = new QQBuilder<TestModel>().eqi("nested.name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { name: { $eqi: "1" } } } =
      eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.name.$eqi).toBe("1");
  });

  it("should create single not eqi", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notEqi("nested.id", "1")
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $eqi: "1" } } } } =
      eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$eqi).toBe("1");
  });

  it("should create single ne", () => {
    const eqFilter = new QQBuilder<TestModel>().ne("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $ne: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$ne).toBe("1");
  });

  it("should create single nei", () => {
    const eqFilter = new QQBuilder<TestModel>().nei("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $nei: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$nei).toBe("1");
  });

  it("should create single in", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .in("nested.id", [1, 2, 3])
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $in: number[] } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$in[0]).toBe(1);
    expect(idFilter.nested.id.$in[1]).toBe(2);
    expect(idFilter.nested.id.$in[2]).toBe(3);
  });

  it("should create single notIn", () => {
    const eqFilter = new QQBuilder<TestModel>().notIn("id", [1, 2, 3]).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { id: { $notIn: number[] } } = eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.id.$notIn[0]).toBe(1);
    expect(idFilter.id.$notIn[1]).toBe(2);
    expect(idFilter.id.$notIn[2]).toBe(3);
  });

  it("should create single lt", () => {
    const eqFilter = new QQBuilder<TestModel>().lt("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $lt: 1 } } } = eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$lt).toBe(1);
  });

  it("should create single not lt", () => {
    const eqFilter = new QQBuilder<TestModel>().notLt("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $lt: 1 } } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$lt).toBe(1);
  });

  it("should create single lt", () => {
    const eqFilter = new QQBuilder<TestModel>().lte("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $lte: 1 } } } = eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$lte).toBe(1);
  });

  it("should create single not lte", () => {
    const eqFilter = new QQBuilder<TestModel>().notLte("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $lte: 1 } } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$lte).toBe(1);
  });

  it("should create single gt", () => {
    const eqFilter = new QQBuilder<TestModel>().gt("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $gt: 1 } } } = eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$gt).toBe(1);
  });

  it("should create single not gt", () => {
    const eqFilter = new QQBuilder<TestModel>().notGt("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $gt: 1 } } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$gt).toBe(1);
  });

  it("should create single gte", () => {
    const eqFilter = new QQBuilder<TestModel>().gte("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $gte: 1 } } } = eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$gte).toBe(1);
  });

  it("should create single not gte", () => {
    const eqFilter = new QQBuilder<TestModel>().notGte("nested.id", 1).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $gte: 1 } } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$gte).toBe(1);
  });

  it("should create single between", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .between("nested.id", [1, 2])
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $between: number[] } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$between[0]).toBe(1);
    expect(idFilter.nested.id.$between[1]).toBe(2);
  });

  it("should create single not between", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notBetween("nested.id", [1, 2])
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { nested: { id: { $not: { $between: number[] } } } } =
      eqFilter.where.$and[0];

    expect(idFilter).toBeDefined();
    expect(idFilter.nested.id.$not.$between[0]).toBe(1);
    expect(idFilter.nested.id.$not.$between[1]).toBe(2);
  });

  it("should create single contains", () => {
    const eqFilter = new QQBuilder<TestModel>().contains("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $contains: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$contains).toBe("1");
  });

  it("should create single not contains", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notContains("name", "1")
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $notContains: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$notContains).toBe("1");
  });

  it("should create single containsi", () => {
    const eqFilter = new QQBuilder<TestModel>().containsi("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $containsi: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$containsi).toBe("1");
  });

  it("should create single not containsi", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notContainsi("name", "1")
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $notContainsi: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$notContainsi).toBe("1");
  });

  it("should create single startsWith", () => {
    const eqFilter = new QQBuilder<TestModel>().startsWith("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $startsWith: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$startsWith).toBe("1");
  });

  it("should create single not startsWith", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notStartsWith("name", "1")
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $not: { $startsWith: "1" } } } =
      eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$not.$startsWith).toBe("1");
  });

  it("should create single endsWith", () => {
    const eqFilter = new QQBuilder<TestModel>().endsWith("name", "1").build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $endsWith: "1" } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$endsWith).toBe("1");
  });

  it("should create single not endsWith", () => {
    const eqFilter = new QQBuilder<TestModel>()
      .notEndsWith("name", "1")
      .build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $not: { $endsWith: "1" } } } =
      eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$not.$endsWith).toBe("1");
  });

  it("should create single null", () => {
    const eqFilter = new QQBuilder<TestModel>().null("name", true).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $null: true } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$null).toBe(true);
  });

  it("should create single not null", () => {
    const eqFilter = new QQBuilder<TestModel>().notNull("name", false).build();

    const where = eqFilter.where.$and;
    expect(where).toBeDefined();
    expect(where.length).toBe(1);

    const idFilter: { name: { $notNull: false } } = eqFilter.where.$and[0];
    expect(idFilter).toBeDefined();
    expect(idFilter.name.$notNull).toBe(false);
  });
});

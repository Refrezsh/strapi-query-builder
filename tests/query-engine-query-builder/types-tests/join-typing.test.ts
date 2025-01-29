import { QQBuilder } from "../../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("Join functions", () => {
  it("should join select", () => {
    const secondBuilder = new QQBuilder<TestModel>().fields([
      "options",
      "name",
    ] as const);

    const query = new QQBuilder<TestModel>()
      .field("id")
      .joinFields(secondBuilder)
      .build();

    const typedQuery: { select: ["id", "options", "name"] } = query;
    expect(typedQuery);
    expect(typedQuery.select[0]).toEqual("id");
    expect(typedQuery.select[1]).toEqual("options");
    expect(typedQuery.select[2]).toEqual("name");
  });

  it("should join sorts", () => {
    const secondBuilder = new QQBuilder<TestModel>().sortAsc("nested.id");

    const query = new QQBuilder<TestModel>()
      .sortAsc("name")
      .joinSort(secondBuilder)
      .build();

    // @ts-expect-error
    const typedQuery: {
      orderBy: [{ name: "asc" }, { nested: { id: "asc" } }];
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.orderBy[0].name).toEqual("asc");
    expect(typedQuery.orderBy[1].nested.id).toEqual("asc");
  });

  it("should join filters without merging root logical", () => {
    const secondBuilder = new QQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new QQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new QQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder)
      .build();

    // @ts-expect-error
    const typedQuery: {
      where: {
        $and: [
          { description: { $eq: "value" } },
          { nested: { $not: { $or: [{ id: { $eq: "1" } }] } } }
        ];
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.where.$and[0].description.$eq).toEqual("value");
    expect(typedQuery.where.$and[1].nested.$not.$or[0].id.$eq).toEqual("1");
  });

  it("should join filters with merging root logical", () => {
    const secondBuilder = new QQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new QQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new QQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder, true, true)
      .build();

    // @ts-expect-error
    const typedQuery: {
      where: {
        $not: {
          $or: [
            { description: { $eq: "value" } },
            { nested: { $not: { $or: [{ id: { $eq: "1" } }] } } }
          ];
        };
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.where.$not.$or[0].description.$eq).toEqual("value");
    expect(typedQuery.where.$not.$or[1].nested.$not.$or[0].id.$eq).toEqual("1");
  });

  it("should join populate", () => {
    const secondBuilder = new QQBuilder<TestModel>().populateDynamic(
      "nestedList",
      "component.1",
      () => new QQBuilder<NestedModel>().field("name")
    );

    const query = new QQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().field("id")
      )
      .joinPopulate(secondBuilder)
      .build();

    const typedQuery: {
      populate: {
        nested: { select: ["id"] };
        nestedList: { on: { "component.1": { select: ["name"] } } };
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.populate.nested.select[0]).toEqual("id");
    expect(typedQuery.populate.nestedList.on["component.1"].select[0]).toEqual(
      "name"
    );
  });

  it("should join populate with populateAll override", () => {
    const secondBuilder = new QQBuilder<TestModel>().populateAll();

    const query = new QQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().field("id")
      )
      .joinPopulate(secondBuilder)
      .build();

    const typedQuery: {
      populate: true;
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.populate).toEqual(true);
  });

  it("should join pagination on query", () => {
    const secondQuery = new QQBuilder<TestModel>().start(1).limit(26);
    const query = new QQBuilder<TestModel>()
      .field("id")
      .joinPagination(secondQuery)
      .build();

    const typedQuery: {
      select: ["id"];
      offset: number | undefined;
      limit: number | undefined;
    } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.select[0]).toEqual("id");
    expect(typedQuery.offset).toBe(1);
    expect(typedQuery.limit).toBe(26);
  });

  it("should join and override pagination on query", () => {
    const secondQuery = new QQBuilder<TestModel>().start(1).limit(26);
    const query = new QQBuilder<TestModel>()
      .field("id")
      .start(1)
      .limit(40)
      .joinPagination(secondQuery)
      .build();

    const typedQuery: {
      select: ["id"];
      offset: number | undefined;
      limit: number | undefined;
    } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.select[0]).toEqual("id");
    expect(typedQuery.offset).toBe(1);
    expect(typedQuery.limit).toBe(26);
  });

  it("should join all", () => {
    const joinQuery = new QQBuilder<TestModel>()
      .field("id")
      .sortAsc("id")
      .eq("id", "1")
      .filterRelation("nested", () =>
        new QQBuilder<NestedModel>().eq("name", "value")
      )
      .populate("nested")
      .start(2)
      .limit(26);

    const query = new QQBuilder<TestModel>()
      .field("description")
      .sortAsc("options")
      .eq("notNestedEnumeration", "test")
      .filterDeep(() =>
        new QQBuilder<TestModel>().or().eq("name", "test").eq("name", "test2")
      )
      .populateRelation("nestedList", () =>
        new QQBuilder<NestedModel>().field("name")
      )
      .joinQuery(joinQuery)
      .build();

    // @ts-expect-error
    const typedQuery: {
      select: ["description", "id"];
      orderBy: [{ options: "asc" }, { id: "asc" }];
      where: {
        $and: [
          { notNestedEnumeration: { $eq: "test" } },
          { $or: [{ name: { $eq: "test" } }, { name: { $eq: "test2" } }] },
          { id: { $eq: "1" } },
          { nested: { $and: [{ name: { $eq: "value" } }] } }
        ];
      };
      populate: {
        nestedList: {
          select: ["name"];
        };
        nested: true;
      };
      offset: 2;
      limit: 26;
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.select[0]).toEqual("description");
    expect(typedQuery.select[1]).toEqual("id");

    expect(typedQuery.orderBy[0].options).toEqual("asc");
    expect(typedQuery.orderBy[1].id).toEqual("asc");

    expect(typedQuery.where.$and[0].notNestedEnumeration.$eq).toEqual("test");
    expect(typedQuery.where.$and[1].$or[0].name.$eq).toEqual("test");
    expect(typedQuery.where.$and[1].$or[1].name.$eq).toEqual("test2");
    expect(typedQuery.where.$and[2].id.$eq).toEqual("1");
    expect(typedQuery.where.$and[3].nested.$and[0].name.$eq).toEqual("value");

    expect(typedQuery.populate.nestedList.select[0]).toEqual("name");
    expect(typedQuery.populate.nested).toEqual(true);
    expect(typedQuery.offset).toBe(2);
    expect(typedQuery.limit).toBe(26);
  });
});

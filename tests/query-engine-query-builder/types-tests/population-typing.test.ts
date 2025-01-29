import { QQBuilder } from "../../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("population types", () => {
  it("should create right populateRelation type", () => {
    const population = new QQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new QQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .build();

    expect(population).toBeDefined();

    const populateWithType: {
      populate: {
        nested: {
          select: ["id"];
        };
        nestedList: {
          select: ["name"];
        };
      };
    } = population;

    expect(populateWithType.populate.nested).toBeDefined();
    expect(populateWithType.populate.nested.select[0]).toBe("id");
    // @ts-expect-error
    expect(populateWithType.populate.nested.where.$and[0].id.$eq).toBe("value");

    expect(populateWithType.populate.nestedList).toBeDefined();
    expect(populateWithType.populate.nestedList.select[0]).toBe("name");
    // @ts-expect-error
    expect(populateWithType.populate.nestedList.where.$and[0].name.$eq).toBe(
      "value2"
    );
  });

  it("should populate all", () => {
    const populate = new QQBuilder<TestModel>().populateAll().build();
    const typedQuery: { populate: true } = populate;
    expect(typedQuery.populate).toBe(true);
  });

  it("should override prev populates wen populate all", () => {
    const population = new QQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new QQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .populateAll()
      .build();

    const populateWithType: { populate: true } = population;
    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate).toBe(true);
  });

  it("should add populate all for key", () => {
    const populate = new QQBuilder<TestModel>()
      .populate("nested")
      .populate("nestedList")
      .build();
    const populateWithType: {
      populate: { nested: true; nestedList: true };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested).toBe(true);
    expect(populateWithType.populate.nestedList).toBe(true);
  });

  it("should add populate all for keys", () => {
    const populate = new QQBuilder<TestModel>()
      .populates(["nested", "nestedList"])
      .build();
    const populateWithType: {
      populate: { nested: true; nestedList: true };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested).toBe(true);
    expect(populateWithType.populate.nestedList).toBe(true);
  });

  it("should merge same keys", () => {
    const populate = new QQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nested", () =>
        new QQBuilder<NestedModel>().notEq("name", "value2")
      )
      .build();

    const populateWithType: {
      populate: {
        nested: {};
      };
    } = populate;

    expect(populateWithType).toBeDefined();
    // @ts-expect-error
    expect(populateWithType.populate.nested.where.$and[0].name.$not.$eq).toBe(
      "value2"
    );
  });

  it("should create right populateDynamic type", () => {
    const dynamicZone = new QQBuilder<TestModel>()
      .populateDynamic("nested", "component.1", () =>
        new QQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new QQBuilder<NestedModel>().notEq("id", "value1")
      )
      .populateDynamic("nested", "component.2", () =>
        new QQBuilder<NestedModel>().notEq("id", "value3")
      )
      .build();

    // @ts-expect-error
    const typedTest: {
      populate: {
        nested: {
          on: {
            "component.1": { where: { $and: [{ id: { $eq: "value" } }] } };
            "component.2": {
              where: { $and: [{ id: { $not: { $eq: "value3" } } }] };
            };
          };
        };
      };
    } = dynamicZone;

    expect(typedTest).toBeDefined();
    expect(
      typedTest.populate.nested.on["component.1"].where.$and[0].id.$eq
    ).toBe("value");
    expect(
      typedTest.populate.nested.on["component.2"].where.$and[0].id.$not.$eq
    ).toBe("value3");
  });
});

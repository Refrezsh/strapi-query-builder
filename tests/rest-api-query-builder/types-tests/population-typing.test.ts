import { RQBuilder } from "../../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("population types", () => {
  it("should create right populateRelation type", () => {
    const population = new RQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new RQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .build();

    expect(population).toBeDefined();

    // @ts-expect-error
    const populateWithType: {
      populate: {
        nested: {
          fields: ["id"];
          filters: { $and: [{ id: { $eq: "value" } }] };
        };
        nestedList: {
          fields: ["name"];
          filters: { $and: [{ name: { $eq: "value2" } }] };
        };
      };
    } = population;

    expect(populateWithType.populate.nested).toBeDefined();
    expect(populateWithType.populate.nested.fields[0]).toBe("id");
    expect(populateWithType.populate.nested.filters.$and[0].id.$eq).toBe(
      "value"
    );

    expect(populateWithType.populate.nestedList).toBeDefined();
    expect(populateWithType.populate.nestedList.fields[0]).toBe("name");
    expect(populateWithType.populate.nestedList.filters.$and[0].name.$eq).toBe(
      "value2"
    );
  });

  it("should populate all", () => {
    const populate = new RQBuilder<TestModel>().populateAll().build();
    const typedQuery: { populate: "*" } = populate;
    expect(typedQuery.populate).toBe("*");
  });

  it("should override prev populates wen populate all", () => {
    const population = new RQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new RQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .populateAll()
      .build();

    const populateWithType: { populate: "*" } = population;
    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate).toBe("*");
  });

  it("should add populate all for key", () => {
    const populate = new RQBuilder<TestModel>()
      .populate("nested")
      .populate("nestedList")
      .build();
    const populateWithType: {
      populate: { nested: { populate: "*" }; nestedList: { populate: "*" } };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested.populate).toBe("*");
    expect(populateWithType.populate.nestedList.populate).toBe("*");
  });

  it("should add populate all for keys", () => {
    const populate = new RQBuilder<TestModel>()
      .populates(["nested", "nestedList"])
      .build();
    const populateWithType: {
      populate: { nested: { populate: "*" }; nestedList: { populate: "*" } };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested.populate).toBe("*");
    expect(populateWithType.populate.nestedList.populate).toBe("*");
  });

  it("should merge same keys", () => {
    const populate = new RQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().notEq("name", "value2")
      )
      .build();

    // @ts-expect-error
    const populateWithType: {
      populate: {
        nested: { filters: { $and: [{ name: { $not: { $eq: "value2" } } }] } };
      };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested.filters.$and[0].name.$not.$eq).toBe(
      "value2"
    );
  });

  it("should create right populateDynamic type", () => {
    const dynamicZone = new RQBuilder<TestModel>()
      .populateDynamic("nested", "component.1", () =>
        new RQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new RQBuilder<NestedModel>().notEq("id", "value1")
      )
      .populateDynamic("nested", "component.2", () =>
        new RQBuilder<NestedModel>().notEq("id", "value3")
      )
      .build();

    // @ts-expect-error
    const typedTest: {
      populate: {
        nested: {
          on: {
            "component.1": { filters: { $and: [{ id: { $eq: "value" } }] } };
            "component.2": {
              filters: { $and: [{ id: { $not: { $eq: "value3" } } }] };
            };
          };
        };
      };
    } = dynamicZone;

    expect(typedTest).toBeDefined();
    expect(
      typedTest.populate.nested.on["component.1"].filters.$and[0].id.$eq
    ).toBe("value");
    expect(
      typedTest.populate.nested.on["component.2"].filters.$and[0].id.$not.$eq
    ).toBe("value3");
  });
});

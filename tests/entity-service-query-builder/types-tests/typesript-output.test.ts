import { DeepModel, NestedModel, TestModel } from "./fields-typing.test";
import { SQBuilder, ApplyEntityQuery } from "../../../lib/cjs";

describe("Typescript output computed type", () => {
  it("should gives only simple attributes for empty query input", () => {
    const query = new SQBuilder().build();
    const typed1 = {} as ApplyEntityQuery<TestModel, {}>;

    typed1.id = "test";
    typed1.name = "test";
    typed1.description = "test";
    typed1.options = "test";
    typed1.notNestedEnumeration = ["hello"];
    typed1.someOptional = undefined;
    typed1.notNestedEnumerationOptional = undefined;
    typed1.optionalAndNullable = "test";
    typed1.optionalNullableUndefined = undefined;
    typed1.nullableUndefined = null;

    // Not populated
    // @ts-expect-error
    typed1.nested = {};
    // @ts-expect-error
    typed1.nestedList = [];
    // @ts-expect-error
    typed1.nestedOptionalList = [];
    // @ts-expect-error
    typed1.cyclicRelationList = [];
    // @ts-expect-error
    typed1.cyclicRelation = {};
    // @ts-expect-error
    typed1.nestedList = [];
    // @ts-expect-error
    typed1.nestedOptionalNullable = null;
    // @ts-expect-error
    typed1.nestedOptionalNullableUndefined = undefined;
    // @ts-expect-error
    typed1.nestedNullableUndefined = undefined;
    // @ts-expect-error
    typed1.nestedListOptionalNullableUndefined = undefined;
  });

  it("should gives only selected fields", () => {
    const query = new SQBuilder<TestModel>()
      .field("id")
      .field("name")
      .field("optionalNullableUndefined")
      .build();
    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.id = "test";
    typed1.name = "test";
    typed1.optionalNullableUndefined = undefined;
    // Not selected in fields
    // @ts-expect-error
    typed1.description = "test";
    // @ts-expect-error
    typed1.options = "test";
    // @ts-expect-error
    typed1.notNestedEnumeration = ["hello"];
    // @ts-expect-error
    typed1.someOptional = undefined;
    // @ts-expect-error
    typed1.notNestedEnumerationOptional = undefined;
    // @ts-expect-error
    typed1.optionalAndNullable = "test";
    // @ts-expect-error
    typed1.nullableUndefined = null;

    // Not populated
    // @ts-expect-error
    typed1.nested = {};
    // @ts-expect-error
    typed1.nestedList = [];
    // @ts-expect-error
    typed1.nestedOptionalList = [];
    // @ts-expect-error
    typed1.cyclicRelationList = [];
    // @ts-expect-error
    typed1.cyclicRelation = {};
    // @ts-expect-error
    typed1.nestedList = [];
    // @ts-expect-error
    typed1.nestedOptionalNullable = null;
    // @ts-expect-error
    typed1.nestedOptionalNullableUndefined = undefined;
    // @ts-expect-error
    typed1.nestedNullableUndefined = undefined;
    // @ts-expect-error
    typed1.nestedListOptionalNullableUndefined = undefined;
  });

  it("should gives only selected field and populate all", () => {
    const query = new SQBuilder<TestModel>().field("id").populateAll().build();
    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.id = "test";

    const t = typed1.nestedOptionalList;
    const t2 = typed1.nestedList;

    // Not selected in field
    // @ts-expect-error
    typed1.name = "test";
    // @ts-expect-error
    typed1.description = "test";
    // @ts-expect-error
    typed1.options = "test";
    // @ts-expect-error
    typed1.notNestedEnumeration = ["hello"];
    // @ts-expect-error
    typed1.someOptional = undefined;
    // @ts-expect-error
    typed1.notNestedEnumerationOptional = undefined;
    // @ts-expect-error
    typed1.optionalAndNullable = "test";
    // @ts-expect-error
    typed1.optionalNullableUndefined = undefined;
    // @ts-expect-error
    typed1.nullableUndefined = null;

    // Not populates own relation fields
    typed1.nested = { id: "test", name: "test" };
    // @ts-expect-error
    typed1.nested.deepNested = {};
    // @ts-expect-error
    typed1.nested.deepNestedList = [];

    // Check complex optional relation
    typed1.nestedList = [{ id: "test", name: "test" }];
    typed1.nestedList = [
      // @ts-expect-error
      { id: "test", name: "test", deepNested: {}, deepNestedList: [] },
    ];

    typed1.nestedOptionalList = [];
    typed1.nestedOptionalList = [{ id: "test", name: "test" }];
    typed1.nestedOptionalList = [
      // @ts-expect-error
      { id: "test", name: "test", deepNested: {}, deepNestedList: [] },
    ];
  });

  it("should only populate simple attributes without fields", () => {
    const query = new SQBuilder<TestModel>()
      .fields([])
      .populate("nested")
      .build();

    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    // @ts-expect-error
    typed1.id = "test";
    // @ts-expect-error
    typed1.nested = { id: "test" };
    typed1.nested = { id: "test", name: "test" };
  });

  it("should only populate using deep field selection", () => {
    const query = new SQBuilder<TestModel>()
      .fields([])
      .populateRelation("nested", () =>
        new SQBuilder<NestedModel>().field("id")
      )
      .build();

    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.nested = { id: "test" };
    // @ts-expect-error
    typed1.nested = { id: "test", name: "test" };
  });

  it("should only populate using another deep level populateAll field selection", () => {
    const query = new SQBuilder<TestModel>()
      .fields([])
      .populateRelation("nested", () =>
        new SQBuilder<NestedModel>().field("id").populateAll()
      )
      .build();

    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.nested = { id: "test" };
    // @ts-expect-error
    typed1.nested = { id: "test", name: "test" };

    // Check deep nested
    // @ts-expect-error
    typed1.nested.deepNested = {};
    // @ts-expect-error
    typed1.nested.deepNested = { id: "v" };
    typed1.nested.deepNested = { id: "v", deepProp: "test" };

    // Check deep nested optionalList
    typed1.nested.deepNestedList = [];
    // @ts-expect-error
    typed1.nested.deepNestedList = [{ id: "v" }];
    typed1.nested.deepNestedList = [{ id: "v", deepProp: "test" }];
  });

  it("should only populate using another deep level populate key field selection", () => {
    const query = new SQBuilder<TestModel>()
      .fields([])
      .populateRelation("nested", () =>
        new SQBuilder<NestedModel>().field("id").populate("deepNestedList")
      )
      .build();

    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.nested = { id: "test" };
    // @ts-expect-error
    typed1.nested = { id: "test", name: "test" };

    // Check deep nested
    // @ts-expect-error
    typed1.nested.deepNested = {};
    // @ts-expect-error
    typed1.nested.deepNested = { id: "v" };
    // @ts-expect-error
    typed1.nested.deepNested = { id: "v", deepProp: "test" };

    // Check deep nested optionalList
    typed1.nested.deepNestedList = [];
    // @ts-expect-error
    typed1.nested.deepNestedList = [{ id: "v" }];
    typed1.nested.deepNestedList = [{ id: "v", deepProp: "test" }];
  });

  it("should only populate using another deep level full populate field selection", () => {
    const query = new SQBuilder<TestModel>()
      .fields([])
      .populateRelation("nested", () =>
        new SQBuilder<NestedModel>()
          .field("id")
          .populateRelation("deepNestedList", () =>
            new SQBuilder<DeepModel>().field("deepProp")
          )
      )
      .build();

    const typed1 = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed1.nested = { id: "test" };
    // @ts-expect-error
    typed1.nested = { id: "test", name: "test" };

    // Check deep nested
    // @ts-expect-error
    typed1.nested.deepNested = {};
    // @ts-expect-error
    typed1.nested.deepNested = { id: "v" };
    // @ts-expect-error
    typed1.nested.deepNested = { id: "v", deepProp: "test" };

    // Check deep nested optionalList
    typed1.nested.deepNestedList = [];
    // @ts-expect-error
    typed1.nested.deepNestedList = [{ id: "v" }];
    // @ts-expect-error
    typed1.nested.deepNestedList = [{ id: "v", deepProp: "test" }];
    typed1.nested.deepNestedList = [{ deepProp: "test" }];
  });

  it("should apply with full query", () => {
    const query = new SQBuilder<TestModel>()
      .field("id")
      .field("name")
      .sortAsc("name")
      .eq("name", "test")
      .populate("nested")
      .page(1)
      .pageSize(26)
      .build();

    const typed = {} as ApplyEntityQuery<TestModel, typeof query>;

    typed.id = "test";
    typed.name = "test";
    // @ts-expect-error
    typed.options = "there is no options";

    // @ts-expect-error
    typed.nested = {};
    // @ts-expect-error
    typed.nested = { id: "test" };
    typed.nested = { id: "test", name: "test" };
  });
});

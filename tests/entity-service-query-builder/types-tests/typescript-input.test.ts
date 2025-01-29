import { NestedModel, TestModel } from "./fields-typing.test";
import { SQBuilder } from "../../../lib/cjs";

describe("SQBuilder Type-script input check", () => {
  it("should autocomplete fields selection only for primitive attributes includes string[] and optional (null | undefined) primitive values", () => {
    const query = new SQBuilder<TestModel>()
      .field("id")
      .field("name")
      .field("description")
      .field("options")
      .field("notNestedEnumeration")
      .field("someOptional")
      .field("notNestedEnumerationOptional")
      .field("optionalAndNullable")
      .field("optionalNullableUndefined")
      .field("nullableUndefined")
      // @ts-expect-error
      .field("nested") // Must be TS error, nested not part of the simple attributes
      .build();

    // @ts-expect-error
    const typedQuery: {
      fields: [
        "id",
        "name",
        "description",
        "options",
        "notNestedEnumeration",
        "someOptional",
        "notNestedEnumerationOptional",
        "optionalAndNullable",
        "optionalNullableUndefined",
        "nullableUndefined"
      ];
    } = query;

    expect(typedQuery.fields.length).toBe(11);
  });

  it("should autocomplete relation keys for relation models populate, includes optionality (undefined | null) on first level", () => {
    const query = new SQBuilder<TestModel>()
      .populate("nested")
      .populate("nestedList")
      .populate("nestedOptional")
      .populate("nestedOptionalList")
      .populate("cyclicRelationList")
      .populate("cyclicRelation")
      .populate("nestedOptionalNullable")
      .populate("nestedOptionalNullableUndefined")
      .populate("nestedNullableUndefined")
      .populate("nestedListOptionalNullableUndefined")
      // @ts-expect-error
      .populate("name") // Must be ts error, name is part of simple attributes
      .build();

    const typedQuery: {
      populate: {
        nested: true;
        nestedList: true;
        nestedOptional: true;
        nestedOptionalList: true;
        cyclicRelationList: true;
        cyclicRelation: true;
        nestedOptionalNullable: true;
        nestedOptionalNullableUndefined: true;
        nestedNullableUndefined: true;
        nestedListOptionalNullableUndefined: true;
      };
    } = query;

    expect(Object.values(typedQuery.populate).length).toBe(11);
  });

  it("should autocomplete relation keys for relation models populate, includes optionality (undefined | null) on deep levels", () => {
    const query = new SQBuilder<TestModel>()
      .populateRelation(
        "nested",
        () =>
          new SQBuilder<NestedModel>()
            .populate("deepNested")
            .populate("deepNestedList")
            // @ts-expect-error
            .populate("id") // Must be TS error, id is not Relation
            // @ts-expect-error
            .populate("deepNestedList.id") // Must be ts Error, deepNestedList.id is not relation
      )
      .build();

    const typedQuery: {
      populate: {
        nested: { populate: { deepNested: true; deepNestedList: true } };
      };
    } = query;

    expect(typedQuery.populate.nested.populate.deepNested).toBe(true);
    expect(typedQuery.populate.nested.populate.deepNestedList).toBe(true);
  });

  it("should autocomplete filters operator with dot notation, on this level and Relation levels except Relation own keys, scan only for 2 levels for stability", () => {
    const query = new SQBuilder<TestModel>()
      .eq("id", "v")
      .eq("name", "v")
      .eq("description", "v")
      .eq("notNestedEnumeration", "v")
      .eq("someOptional", "v")
      .eq("notNestedEnumerationOptional", "v")
      .eq("optionalAndNullable", "v")
      .eq("optionalNullableUndefined", "v")
      .eq("nullableUndefined", "v")
      .eq("nested.id", "v")
      .eq("nested.name", "v")
      // @ts-expect-error
      .eq("nestedOptional", "mustBeTSError") // nestedOptional is Relation
      .filterRelation(
        "nested",
        () =>
          new SQBuilder<NestedModel>()
            .eq("deepNested.deepProp", "v")
            .eq("deepNested.id", "v")
            .eq("deepNestedList.deepProp", "v")
            .eq("deepNestedList.id", "v")
            // @ts-expect-error
            .eq("deepNested", "mustBeTSError") // deepNested is Relation
            // @ts-expect-error
            .eq("deepNestedList", "mustBeTSError") // deepNestedList is Relation
      )
      .build();

    // @ts-expect-error
    expect(query.filters.$and.length).toBe(13);
  });

  it("should autocomplete sorts operator with dot notation, on this level and Relation levels except Relation own keys, scan only for 2 levels for stability", () => {
    const query = new SQBuilder<TestModel>()
      .sortAsc("id")
      .sortAsc("nestedList.id")
      .sortAsc("cyclicRelationList.notNestedEnumerationOptional")
      // @ts-expect-error
      .sortAsc("nested") // Must be TS error, we can't sort by just nested only nested.id
      // @ts-expect-error
      .sortAsc("nested.deepNested.id") // Must be TS error, default depth is 2, so we can't get so, so deep =)
      .build();

    // @ts-expect-error
    expect(query.sort.length).toBe(5);
  });
});

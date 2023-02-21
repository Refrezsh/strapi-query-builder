// <editor-fold desc="Sort Types">
import { SQBuilder } from "./sq-builder";

type StrapiSortInputQuery<Model extends object> =
  | StrapiSort<Model>
  | StrapiSort<Model>[]
  | GetStrictOrWeak<
      Model,
      FieldPath<Model> | FieldPath<Model>[],
      FieldPath<Model> | FieldPath<Model>[] | string | string[]
    >;

type StrapiSortOptions = "desc" | "asc";

type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

interface StrapiSort<Model extends object> {
  key: SortKey<Model>;
  type: StrapiSortOptions;
}
// </editor-fold>

// <editor-fold desc="Pagination Types">
interface StrapiPagination {
  page?: number;
  pageSize?: number;
}

interface StrapiOffsetPagination {
  start?: number;
  limit?: number;
}

type UnionInputPagination = StrapiPagination | StrapiOffsetPagination;
// </editor-fold>

// <editor-fold desc="Filter types">
type FilterLogicalType = "$and" | "$or" | "$not";
type FilterAttributeType =
  | "$eq"
  | "$eqi"
  | "$ne"
  | "$in"
  | "$notIn"
  | "$lt"
  | "$lte"
  | "$gt"
  | "$gte"
  | "$between"
  | "$contains"
  | "$notContains"
  | "$containsi"
  | "$notContainsi"
  | "$startsWith"
  | "$endsWith"
  | "$null"
  | "$notNull";

type SingleAttributeType = string | number | boolean;
type MultipleAttributeType = string[] | number[];

type FilterInputCallback<Model extends object, Data extends object> = (
  builder: SQBuilder<Model, Data>
) => void;

type FilterKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type AttributeValues = string | string[] | number | number[] | boolean;

interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {}
> {
  key?: FilterKey<Model>;
  type?: FilterAttributeType;
  value?: AttributeValues;
  negate?: boolean;
  nested?: StrapiRawFilters<NestedModel>;
}

interface StrapiRawFilters<Model extends object> {
  rootLogical: FilterLogicalType;
  negate?: boolean;
  attributeFilters: StrapiAttributesFilter<Model>[];
}
// </editor-fold>

// <editor-fold desc="Population Types">
type StrapiPopulationInputQuery<Model extends object> =
  | GetStrictOrWeak<
      Model,
      GetRelations<Model> | GetRelations<Model>[],
      GetRelations<Model> | GetRelations<Model>[] | string | string[]
    >
  | "*";

type PopulationKey<Model extends object> =
  | GetStrictOrWeak<Model, GetRelations<Model>, GetRelations<Model> | string>
  | "*";

type MorphOnPopulation<PopulateModel extends object> = {
  [key: string]: Omit<QueryRawInfo<PopulateModel, object>, "pagination">;
};

type DefaultPopulation<PopulateModel extends object> = Omit<
  QueryRawInfo<PopulateModel, object>,
  "pagination"
>;

type PopulationNestedQuery<PopulateModel extends object> =
  | DefaultPopulation<PopulateModel>
  | MorphOnPopulation<PopulateModel>;

interface StrapiPopulation<
  ParentModel extends object,
  PopulateModel extends object
> {
  key: PopulationKey<ParentModel>;
  nestedQuery?: PopulationNestedQuery<PopulateModel>;
}

type PopulationInputCallback<PopulationModel extends object> = (
  builder: SQBuilder<PopulationModel, any>
) => void;
// </editor-fold>

//<editor-fold desc="Fields Types">
type StrapiFieldsInputQuery<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model> | GetAttributes<Model>[],
  GetAttributes<Model> | GetAttributes<Model>[] | string | string[]
>;

type StrapiFields<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>[],
  GetAttributes<Model>[] | string[]
>;
//</editor-fold>

// <editor-fold desc="Query shapes">
type QueryTypes = "strapiService" | "entityService" | "queryEngine";

interface BuilderConfig {
  defaultSort?: StrapiSortOptions;
}

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSort<Model>[];
  filters: StrapiRawFilters<Model>;
  pagination?: StrapiPagination;
  offsetPagination?: StrapiOffsetPagination;
  population: StrapiPopulation<Model, any>[];
  fields: StrapiFields<Model>;
  data?: Data;
}

type StrapiFiltersType<Model extends object> = {
  [key in
    | string
    | FilterLogicalType
    | FilterAttributeType
    | FieldPath<Model>
    | GetAttributes<Model>
    | GetRelations<Model>]:
    | number
    | string
    | number[]
    | string[]
    | StrapiFiltersType<Model>
    | StrapiFiltersType<Model>[];
};

interface StrapiEntityQuery<Model extends object, Data extends object> {
  filters?: StrapiFiltersType<Model>;
  fields?: StrapiFields<Model>;
  data?: Data;
  pagination?: UnionInputPagination;
  [key: string]: any;
}
// </editor-fold>

/**
 * @description Utils types for getting nested keys and values type
 * inspired by https://github.com/react-hook-form/react-hook-form/blob/274d8fb950f9944547921849fb6b3ee6e879e358/src/types/utils.ts#L119
 * @description Array will be typed as first object in type array
 * @description Nested object works perfectly
 * @description There is 1 level limitation on Cyclic deps
 */
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
  ? false
  : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

type IsSameType<T1, T2> = T1 extends T2 ? true : false;

type PathImpl<
  Key extends string | number,
  Value,
  BaseType
> = Value extends Primitive
  ? `${Key}`
  : IsSameType<Value, BaseType> extends true
  ? `${Key}` | `${Key}.${keyof Value & string}`
  : `${Key}` | `${Key}.${Path<Value>}`;

type Path<Model> = Model extends ReadonlyArray<infer Value>
  ? IsTuple<Model> extends true
    ? {
        [K in TupleKey<Model>]-?: PathImpl<K & string, Model[K], Model>;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: PathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

type FieldPath<TFieldValues extends object> = Path<TFieldValues>;

type ArrayPathImpl<
  Key extends string | number,
  Value,
  BaseType
> = Value extends Primitive
  ? never
  : Value extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : IsSameType<Value, BaseType> extends true
    ? `${Key}CyclicDepsFounded`
    : `${Key}` | `${Key}.${ArrayPath<Value>}`
  : `${Key}.${ArrayPath<Value>}`;

type ArrayPath<Model> = Model extends ReadonlyArray<infer V>
  ? IsTuple<Model> extends true
    ? {
        [Key in TupleKey<Model>]-?: ArrayPathImpl<
          Key & string,
          Model[Key],
          Model
        >;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: ArrayPathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

/**
 * @description Typing utils
 */
type ModelPrimitive = string | number | boolean | symbol | bigint;

/**
 * @description Predicate to select primitive keys
 */
type IsAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? `${Key}` : never;

/**
 * @description Predicate to select not primitive keys
 */
type IsNotAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? never : `${Key}`;

/**
 * @description Get one or another type by id in Model
 */
type GetStrictOrWeak<Model extends object, Strict, Weak> = Model extends {
  id: infer U;
}
  ? Strict
  : Weak;

/**
 * @description Get attribute keys one level of model
 */
type GetAttributes<Model extends object> = {
  [Key in keyof Model]-?: IsAttribute<Key & string, Model[Key]>;
}[keyof Model];

/**
 * @description Get relation keys one level of model
 */
type GetRelations<Model extends object> = {
  [Key in keyof Model]-?: IsNotAttribute<Key & string, Model[Key]>;
}[keyof Model];

// <editor-fold desc="Field types">
export type StrapiSingleFieldInput<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>,
  GetAttributes<Model> | string
>;

export type StrapiFields<Model extends object> = Set<
  StrapiSingleFieldInput<Model>
>;
// </editor-fold>

// <editor-fold desc="Sort types">
export type StrapiSortOptions = "desc" | "asc";

export type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

export type StrapiSorts<Model extends object> = Map<
  SortKey<Model>,
  StrapiSortOptions
>;
// </editor-fold>

// <editor-fold desc="Filter types">
export type SingleAttributeType = string | number | boolean;
export type MultipleAttributeType = string[] | number[];
export type FilterLogicalType = "$and" | "$or" | "$not";
export type EntityFilterAttributes =
  | "$eq"
  | "$eqi"
  | "$ne"
  | "$nei"
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

export type GetAttributeType<Key extends EntityFilterAttributes> = Key extends
  | "$in"
  | "$notIn"
  | "$between"
  ? MultipleAttributeType
  : SingleAttributeType;

export type FilterOperatorKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

export type AttributeValues = string | string[] | number | number[] | boolean;

export interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {}
> {
  key?: FilterOperatorKey<Model>;
  type?: EntityFilterAttributes;
  value?: AttributeValues;
  negate?: boolean;
  nested?: StrapiRawFilters<NestedModel>;
}

export interface StrapiRawFilters<Model extends object> {
  rootLogical: FilterLogicalType;
  negate: boolean;
  attributeFilters: StrapiAttributesFilter<Model>[];
}
// </editor-fold>

// <editor-fold desc="Population Types">
type StrapiInputPopulateKey<Model extends object> = GetStrictOrWeak<
  Model,
  GetRelations<Model>,
  GetRelations<Model> | string
>;

type PopulateKey<Model extends object> =
  | GetStrictOrWeak<Model, GetRelations<Model>, GetRelations<Model> | string>
  | "*";

type MorphOnPopulate<PopulateModel extends object> = {
  [key: string]: DefaultPopulate<PopulateModel>;
};

type DefaultPopulate<PopulateModel extends object> = Omit<
  QueryRawInfo<PopulateModel, object>,
  "pagination"
>;

interface StrapiPopulate<
  ParentModel extends object,
  PopulateModel extends object
> {
  key: PopulateKey<ParentModel>;
  nestedQuery?: DefaultPopulate<PopulateModel>;
  dynamicQuery?: MorphOnPopulate<PopulateModel>;
}

type StrapiPopulations<
  ParentModel extends object,
  PopulateModel extends object
> = Map<PopulateKey<ParentModel>, StrapiPopulate<ParentModel, PopulateModel>>;
// </editor-fold>

// <editor-fold desc="Pagination Types">
interface StrapiPagination {
  page: number;
  pageSize: number;
  paginationType: "page" | "limit";
}
// </editor-fold>

// <editor-fold desc="Service specific types">
type PublicationStates = "live" | "preview";
// </editor-fold>

// <editor-fold desc="Query shapes">
type InternalBuilderConfig = {
  fields: unknown[];
  sort: unknown[];
  filters: unknown[];
  rootLogical: "$and" | "$or";
  negate: boolean;
  populateAll: boolean;
  populates: Record<string, any>;
  pagination: { page: number; pageSize: number };
  paginationType: "page" | "limit";
  publicationState: PublicationStates;
  locale: string;
  data: unknown;
};

type InitialBuildConfig = {
  fields: [];
  sort: [];
  filters: [];
  rootLogical: "$and";
  negate: false;
  populateAll: false;
  populates: {};
  pagination: never;
  paginationType: never;
  publicationState: never;
  locale: never;
  data: never;
};

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
  filters: StrapiRawFilters<Model>;
  population: StrapiPopulations<Model, any>;
  // Query specific
  pagination?: StrapiPagination;
  locale?: string;
  publicationState?: PublicationStates;
  data?: Data;
}
// </editor-fold>

// <editor-fold desc="Input type check utils">
type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint
  | string[]
  | number[]
  | boolean[];

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
  : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
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
    : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
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

type ModelPrimitive =
  | string
  | number
  | boolean
  | symbol
  | bigint
  | string[]
  | number[]
  | boolean[];

type IsAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? `${Key}` : never;

type IsNotAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? never : `${Key}`;

type GetStrictOrWeak<Model extends object, Strict, Weak> = Model extends {
  id: infer U;
}
  ? Strict
  : Weak;

type GetAttributes<Model extends object> = {
  [Key in keyof Model]-?: IsAttribute<Key & string, Model[Key]>;
}[keyof Model];

type GetRelations<Model extends object> = {
  [Key in keyof Model]-?: IsNotAttribute<Key & string, Model[Key]>;
}[keyof Model];
// </editor-fold>

// <editor-fold desc="Output type utils">
export type TransformNestedKeys<Keys extends readonly string[], V> = {
  [K in keyof Keys]: Keys[K] extends string
    ? TransformNestedKey<Keys[K], V>
    : never;
};

export type TransformNestedKey<
  K extends string,
  V
> = K extends `${infer Key}.${infer Rest}`
  ? { [P in Key]: TransformNestedKey<Rest, V> }
  : { [P in K]: V };

export type OnType<T> = T extends { on: infer O } ? O : {};

export type ParseList<F extends readonly unknown[]> = F["length"] extends 0
  ? never
  : F;

export type ParseFilters<
  Filters extends unknown[],
  RootLogical extends "$and" | "$or",
  Negate extends boolean
> = Filters["length"] extends 0
  ? never
  : Negate extends true
  ? { $not: { [K in RootLogical]: Filters } }
  : { [K in RootLogical]: Filters };

// </editor-fold>

declare global {
  interface QueryBuilderConfig {
    /**
     * @description Default recursion depth for the "key.subKey" type. Default is 2 levels max is 5 levels
     * @description The larger the number, the greater the load on the Typescript engine.
     */
    DefaultScanDepth: 2;
  }
}

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
  FiltersAndSortDotPath<Model>,
  FiltersAndSortDotPath<Model> | string
>;

export type StrapiSorts<Model extends object> = Map<
  SortKey<Model>,
  { key: SortKey<Model>; order: StrapiSortOptions }
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
  | "$notNull"
  | "$startsWithi"
  | "$endsWithi";

export type GetAttributeType<Key extends EntityFilterAttributes> = Key extends
  | "$in"
  | "$notIn"
  | "$between"
  ? MultipleAttributeType
  : SingleAttributeType;

export type FilterOperatorKey<Model extends object> = GetStrictOrWeak<
  Model,
  FiltersAndSortDotPath<Model>,
  FiltersAndSortDotPath<Model> | string
>;

export type FilterRelationKey<Model extends object> = GetStrictOrWeak<
  Model,
  GetRelations<Model>,
  GetRelations<Model> | string
>;

export type AttributeValues = string | string[] | number | number[] | boolean;

export interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {}
> {
  key?: FilterOperatorKey<Model> | FilterRelationKey<Model>;
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
export type StrapiInputPopulateKey<Model extends object> = GetStrictOrWeak<
  Model,
  GetRelations<Model>,
  GetRelations<Model> | string
>;

export type PopulateKey<Model extends object> =
  | GetStrictOrWeak<Model, GetRelations<Model>, GetRelations<Model> | string>
  | "*";

export type MorphOnPopulate<PopulateModel extends object> = {
  [key: string]: DefaultPopulate<PopulateModel> & { componentKey: string };
};

export type DefaultPopulate<PopulateModel extends object> = Omit<
  QueryRawInfo<PopulateModel, object>,
  "pagination"
>;

export interface StrapiPopulate<
  ParentModel extends object,
  PopulateModel extends object
> {
  key: PopulateKey<ParentModel>;
  nestedQuery?: DefaultPopulate<PopulateModel>;
  dynamicQuery?: MorphOnPopulate<PopulateModel>;
}

export type StrapiPopulations<
  ParentModel extends object,
  PopulateModel extends object
> = Map<PopulateKey<ParentModel>, StrapiPopulate<ParentModel, PopulateModel>>;
// </editor-fold>

// <editor-fold desc="Pagination Types">
export interface StrapiUnionPagination {
  page?: number;
  pageSize?: number;
  withCount?: boolean;
  paginationType: "page" | "limit";
}
// </editor-fold>

// <editor-fold desc="Service specific types">
export type PublicationStates = "live" | "preview";
// </editor-fold>

// <editor-fold desc="Query shapes">
export interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
  filters: StrapiRawFilters<Model>;
  population: StrapiPopulations<Model, any>;
  // Query specific
  pagination?: StrapiUnionPagination;
  locale?: string;
  publicationState?: PublicationStates;
  data?: Data;
}
// </editor-fold>

// <editor-fold desc="Input type check utils">
type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
  ? false
  : true;

type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

type IsSameType<T1, T2> = T1 extends T2 ? true : false;

type Decrement<T extends number> = T extends 5
  ? 4
  : T extends 4
  ? 3
  : T extends 3
  ? 2
  : T extends 2
  ? 1
  : T extends 1
  ? 0
  : never;

type PathImpl<
  Key extends string | number,
  Value,
  BaseType,
  Depth extends number
> = Depth extends 0 // Prevent infinite dependency
  ? never
  : [Value] extends [ModelPrimitive]
  ? Key
  : [Value] extends [ModelPrimitive | undefined]
  ? Key
  : [Value] extends [ModelPrimitive | null]
  ? Key
  : [Value] extends [ModelPrimitive | null | undefined]
  ? Key
  : IsSameType<Value, BaseType> extends true // Prevent cyclic dependency
  ? never
  : `${Key}.${Path<Value, Decrement<Depth>>}`;

type Path<
  Model,
  Depth extends number = QueryBuilderConfig["DefaultScanDepth"] extends number
    ? QueryBuilderConfig["DefaultScanDepth"]
    : 2
> = Model extends ReadonlyArray<infer Value>
  ? IsTuple<Model> extends true
    ? {
        [K in TupleKey<Model>]-?: PathImpl<K & string, Model[K], Model, Depth>;
      }[TupleKey<Model>]
    : {
        [Key in keyof Model[0]]-?: PathImpl<
          Key & string,
          Model[0][Key],
          Model,
          Depth
        >;
      }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: PathImpl<Key & string, Model[Key], Model, Depth>;
    }[keyof Model];

type FiltersAndSortDotPath<TFieldValues extends object> = Path<TFieldValues>;

type ModelPrimitive =
  | string
  | number
  | boolean
  | symbol
  | bigint
  | string[]
  | number[]
  | boolean[];

type IsAttribute<Key extends string | number, Value> = [Value] extends [
  ModelPrimitive
]
  ? Key
  : [Value] extends [ModelPrimitive | undefined]
  ? Key
  : [Value] extends [ModelPrimitive | null]
  ? Key
  : [Value] extends [ModelPrimitive | null | undefined]
  ? Key
  : never;

type IsNotAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive
  ? never
  : Value extends ModelPrimitive | undefined
  ? never
  : Value extends ModelPrimitive | null
  ? never
  : Value extends ModelPrimitive | null | undefined
  ? never
  : Key;

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
export type OnType<T> = T extends { on: infer O } ? O : {};

export type ParseList<F extends readonly unknown[]> = F["length"] extends 0
  ? undefined
  : F;
// </editor-fold>

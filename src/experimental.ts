import { _isDefined, _set } from "./query-utils";

export default class EQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends InternalBuilderConfig = {}
> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: new Map(),
    fields: new Set(),
    filters: {
      rootLogical: "$and",
      negate: false,
      attributeFilters: [],
    },
  };

  constructor() {}

  //<editor-fold desc="Fields">
  /**
   * @description Select specific fields
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().fields(["name", "type"]); // Produce { fields: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields keys
   */
  public fields<
    F extends readonly [
      StrapiSingleFieldInput<Model>,
      ...StrapiSingleFieldInput<Model>[]
    ]
  >(fields: F) {
    fields.forEach((f) => this._query.fields.add(f));
    return this as unknown as EQBuilder<Model, Data, UpdateConfig<Config, F>>;
  }

  /**
   * @description Select specific field
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().field("key"); // Produce { fields: ["key"] }
   * @param {StrapiSingleFieldInput} field Field key
   */
  public field<F extends StrapiSingleFieldInput<Model>>(field: F) {
    this._query.fields.add(field);
    return this as unknown as EQBuilder<Model, Data, UpdateConfig<Config, [F]>>;
  }
  //</editor-fold>

  //<editor-fold desc="Sorts">
  /**
   * @description Add ascending sort key
   * @description Same keys will be merged
   * @param {SortKey} sortKey Sort key
   * @example new EQBuilder<Model>().sortAsc("key"); // Produce: { sort: [{"key": "asc"}] }
   * @example new EQBuilder<Model>().sortAsc("parentKey.childKey"); // Produce: { sort: [{"parentKey": { "childKey": "asc" }}] }
   */
  public sortAsc<K extends SortKey<Model>>(sortKey: K) {
    this._query.sort.set(sortKey, "asc");
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], [TransformNestedKey<K, "asc">]>
    >;
  }

  /**
   * @description Add ascending sort keys
   * @description Same keys will be merged
   * @param {SortKey[]} sortKeys List of sort keys
   * @example new EQBuilder<Model>().sortsAsc(["key1", "key2"]); // Produce: { sort: [{"key1": "asc"}, {"key2": "asc"}] }
   * @example new EQBuilder<Model>().sortsAsc(["parentKey.childKey", "anotherKey"]); // Produce: { sort: [{"parentKey": { "childKey": "asc" }}, {"anotherKey": "asc"}] }
   */
  public sortsAsc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    sortKeys: K
  ) {
    sortKeys.forEach((key) => this._query.sort.set(key, "asc"));

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], TransformNestedKeys<K, "asc">>
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Filters">
  public or() {
    this._query.filters.rootLogical = "$or";
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], [], [], "$or">
    >;
  }

  public and() {
    this._query.filters.rootLogical = "$and";
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], [], [], "$and">
    >;
  }

  public not() {
    this._query.filters.negate = true;
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [],
        Config["rootLogical"] extends "$or" ? "$or" : "$and",
        true
      >
    >;
  }

  public filterDeep<DeepConfig extends InternalBuilderConfig>(
    builderFactory: BuilderCallback<Model, Data, DeepConfig>
  ) {
    const deepBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      nested: deepBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [
          ParseFilters<
            DeepConfig["filters"] extends readonly unknown[]
              ? DeepConfig["filters"]
              : [],
            DeepConfig["rootLogical"] extends "$and" | "$or"
              ? DeepConfig["rootLogical"]
              : "$and",
            DeepConfig["negate"] extends true ? true : false
          >
        ]
      >
    >;
  }

  /**
   * @description Add eq filter for attribute
   * @description Same keys will not be merged
   * @param {FilterKey} key Filter key
   * @param {SingleAttributeType} value Filter value
   */
  public eq<K extends FilterKey<Model>, V extends SingleAttributeType>(
    key: K,
    value: V
  ) {
    this._query.filters.attributeFilters.push({
      key: key,
      type: "$eq",
      value: value,
      negate: false,
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [
          {
            [P in keyof TransformNestedKey<K, { $eq: V }>]: TransformNestedKey<
              K,
              { $eq: V }
            >[P];
          }
        ]
      >
    >;
  }

  public notEq<K extends FilterKey<Model>, V extends SingleAttributeType>(
    key: K,
    value: V
  ) {
    this._query.filters.attributeFilters.push({
      key: key,
      type: "$eq",
      value: value,
      negate: true,
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [
          {
            [P in keyof TransformNestedKey<
              K,
              { $not: { $eq: V } }
            >]: TransformNestedKey<K, { $not: { $eq: V } }>[P];
          }
        ]
      >
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Build process">
  public build() {
    const builtQuery: any = {};

    const parsedFields = Array.from(this._query.fields);
    if (parsedFields.length > 0) {
      builtQuery.fields = parsedFields;
    }

    const parsedSort = EQBuilder._parseSort(this._query.sort);
    if (parsedSort.length > 0) {
      builtQuery.sort = parsedSort;
    }

    const parsedFilters = EQBuilder._parseFilters(this._query.filters);
    if (_isDefined(parsedFilters)) {
      builtQuery.filters = parsedFilters;
    }

    return builtQuery as Config extends {
      fields: infer Fields;
      sort: infer Sorts;
      filters: infer Filters;
      rootLogical: infer RootLogical;
      negate: infer Not;
    }
      ? {
          fields: ParseFields<Fields>;
          sort: ParseSorts<Sorts>;
          filters: ParseFilters<Filters, RootLogical, Not>;
        } extends infer Result
        ? {
            [K in keyof Result as Result[K] extends never
              ? never
              : K]: Result[K];
          }
        : never
      : {};
  }

  private static _parseSort<Md extends object>(sorts: StrapiSorts<Md>) {
    const sortQuery: any[] = new Array(sorts.size);

    let index = 0;
    for (const { 0: key, 1: order } of sorts) {
      sortQuery[index] = _set({}, key, order);
      index++;
    }

    return sortQuery;
  }

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>
  ): any | undefined {
    if (filter.nested !== undefined) {
      const nestedFilters = this._parseFilters(filter.nested);
      if (!_isDefined(nestedFilters)) return undefined;

      return !_isDefined(filter.key)
        ? nestedFilters
        : _set({}, filter.key, nestedFilters);
    }

    if (
      !_isDefined(filter.value) ||
      !_isDefined(filter.type) ||
      !_isDefined(filter.key)
    ) {
      return undefined;
    }

    const filterValue = {
      [filter.type]: filter.value,
    };

    return _set(
      {},
      filter.key,
      filter.negate ? { ["$not"]: filterValue } : filterValue
    );
  }

  private static _parseFilters<Md extends object>(
    rawFilters: StrapiRawFilters<Md>
  ): any | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;

    const parsedFilters: any[] = [];
    attributeFilters.forEach((attributeQuery) => {
      const parsedAttribute = EQBuilder._parseAttributeFilter(attributeQuery);
      if (!_isDefined(parsedAttribute)) return;
      parsedFilters.push(parsedAttribute);
    });

    if (parsedFilters.length === 0) return undefined;

    const filters = {
      [rootLogical]: parsedFilters,
    };
    return negateRoot ? { ["$not"]: filters } : filters;
  }

  protected getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }
  //</editor-fold>
}

// <editor-fold desc="Field types">
type StrapiSingleFieldInput<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>,
  GetAttributes<Model> | string
>;

type StrapiFields<Model extends object> = Set<StrapiSingleFieldInput<Model>>;
// </editor-fold>

// <editor-fold desc="Sort types">
type StrapiSortOptions = "desc" | "asc";

type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type StrapiSorts<Model extends object> = Map<SortKey<Model>, StrapiSortOptions>;
// </editor-fold>

// <editor-fold desc="Filter types">
type SingleAttributeType = string | number | boolean;
type FilterLogicalType = "$and" | "$or" | "$not";
type EntityFilterAttributes =
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

type FilterKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type BuilderCallback<
  Model extends object,
  Data extends object,
  Config extends InternalBuilderConfig
> = () => EQBuilder<Model, Data, Config>;

type AttributeValues = string | string[] | number | number[] | boolean;

interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {}
> {
  key?: FilterKey<Model>;
  type?: EntityFilterAttributes;
  value?: AttributeValues;
  negate?: boolean;
  nested?: StrapiRawFilters<NestedModel>;
}

interface StrapiRawFilters<Model extends object> {
  rootLogical: FilterLogicalType;
  negate: boolean;
  attributeFilters: StrapiAttributesFilter<Model>[];
}
// </editor-fold>

// <editor-fold desc="Query shapes">
type InternalBuilderConfig = {
  fields?: unknown[];
  sort?: unknown[];
  filters?: unknown;
  rootLogical?: "$and" | "$or";
  negate?: boolean;
};

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
  filters: StrapiRawFilters<Model>;
}
// </editor-fold>

// <editor-fold desc="Input type check utils">
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

type ModelPrimitive = string | number | boolean | symbol | bigint;

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
type Deduplicate<T extends readonly any[]> = T extends [infer F, ...infer Rest]
  ? F extends Rest[number]
    ? Deduplicate<Rest>
    : [F, ...Deduplicate<Rest>]
  : T;

type TransformNestedKeys<Keys extends readonly string[], V> = {
  [K in keyof Keys]: Keys[K] extends string
    ? TransformNestedKey<Keys[K], V>
    : never;
};

type TransformNestedKey<
  K extends string,
  V
> = K extends `${infer Key}.${infer Rest}`
  ? { [P in Key]: TransformNestedKey<Rest, V> }
  : { [P in K]: V };

type Flatten<T> = {
  [K in keyof T]: T[K];
};

type UpdateConfig<
  Config extends InternalBuilderConfig,
  NewFields extends readonly unknown[] = [],
  NewSorts extends readonly unknown[] = [],
  NewFilters extends readonly unknown[] = [],
  RootLogical extends "$and" | "$or" = Config["rootLogical"] extends
    | "$and"
    | "$or"
    ? Config["rootLogical"]
    : "$and",
  Negate extends boolean = Config["negate"] extends true ? true : false
> = Flatten<{
  fields: Deduplicate<
    [
      ...(Config["fields"] extends readonly unknown[] ? Config["fields"] : []),
      ...NewFields
    ]
  >;
  sort: Deduplicate<
    [
      ...(Config["sort"] extends readonly unknown[] ? Config["sort"] : []),
      ...NewSorts
    ]
  >;
  filters: [
    ...(Config["filters"] extends readonly unknown[] ? Config["filters"] : []),
    ...NewFilters
  ];
  rootLogical: RootLogical;
  negate: Negate;
}>;

type ParseFields<F> = F extends readonly unknown[]
  ? F["length"] extends 0
    ? never
    : F
  : never;

type ParseSorts<S> = S extends readonly unknown[]
  ? S["length"] extends 0
    ? never
    : S
  : never;

type ParseFilters<Filters, RootLogical, Negate> =
  Filters extends readonly unknown[]
    ? Filters["length"] extends 0
      ? never
      : Negate extends true
      ? {
          $not: RootLogical extends "$and" | "$or"
            ? { [K in RootLogical]: Filters }
            : never;
        }
      : RootLogical extends "$and" | "$or"
      ? { [K in RootLogical]: Filters }
      : never
    : never;
// </editor-fold>

// TODO: string[] number[] boolean[] is primitive type
// TODO: filter keys of relationTypes must be excluded to prevent errors when we trying to filter for example Category, we can only filter Category.id and etc.

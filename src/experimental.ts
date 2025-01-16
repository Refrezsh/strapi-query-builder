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
    population: new Map(),
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
  /**
   * @description Change root logical to or, default and
   * @example new EQBuilder<Model>().or(); // Produce { filters: { $or: [...] }}
   */
  public or() {
    this._query.filters.rootLogical = "$or";
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], [], [], {}, "$or">
    >;
  }

  /**
   * @description Change root logical to and, default and
   * @example new EQBuilder<Model>().and(); // Produce { filters: { $and: [...] }}
   */
  public and() {
    this._query.filters.rootLogical = "$and";
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<Config, [], [], [], {}, "$and">
    >;
  }

  /**
   * @description Negates the nested conditions
   * @example new EQBuilder<Model>().not(); // Produce { filters: { $not: { $and: [...] }}}
   */
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
        {},
        Config["rootLogical"] extends "$or" ? "$or" : "$and",
        true
      >
    >;
  }

  /**
   * @description Add deep filters for current model
   * @example
   * new EQBuilder<TestModel>()
   *     .eq("options", "value")
   *     .filterDeep(() =>
   *       new EQBuilder<TestModel>().or().eq("name", "value1").eq("name", "value2")
   *     )
   * // Produces
   * {
   *     filters: {
   *       $and: [
   *         { options: { $eq: "value" } },
   *         { $or: [{ name: { $eq: "value1" } }, { name: { $eq: "value2" } }] }
   *       ];
   *     };
   * }
   * @param {BuilderCallback} builderFactory
   */
  public filterDeep<DeepConfig extends InternalBuilderConfig>(
    builderFactory: BuilderCallback<Model, {}, DeepConfig>
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
   * @description Add related model filters
   * @example
   * new EQBuilder<TestModel>()
   *       .filterRelation("nested", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value")
   *       )
   * // Produces
   * {
   *       filters: {
   *         $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
   *       }
   * }
   * @param {FilterOperatorKey} attribute
   * @param {BuilderCallback} builderFactory
   */
  public filterRelation<
    RelationModel extends object,
    K extends FilterOperatorKey<Model>,
    RelationConfig extends InternalBuilderConfig
  >(
    attribute: K,
    builderFactory: BuilderCallback<RelationModel, {}, RelationConfig>
  ) {
    const relationBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      key: attribute,
      nested:
        relationBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [
          TransformNestedKey<
            K,
            ParseFilters<
              RelationConfig["filters"] extends readonly unknown[]
                ? RelationConfig["filters"]
                : [],
              RelationConfig["rootLogical"] extends "$and" | "$or"
                ? RelationConfig["rootLogical"]
                : "$and",
              RelationConfig["negate"] extends true ? true : false
            >
          >
        ]
      >
    >;
  }

  /**
   * @description Add eq filter for attribute
   * @description Same keys will not be merged
   * @description Allowed "key.dot" notation
   * @example new EQBuilder<Model>().eq("key", "value"); // Produce { filters: { $and: [{ key: { $eq: "value" }} ] }}
   * @param {FilterOperatorKey} key Filter key
   * @param {SingleAttributeType} value Filter value
   */
  public eq<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
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
      UpdateConfig<Config, [], [], [TransformNestedKey<K, { $eq: V }>]>
    >;
  }

  /**
   * @description Add $not $eq filter for attribute
   * @description Same keys will not be merged
   * @description Allowed "key.dot" notation
   * @example new EQBuilder<Model>().notEq("key", "value"); // Produce { filters: { $and: [{ key: { $not: { $eq: "value" } }} ] }}
   * @param {FilterOperatorKey} key Filter key
   * @param {SingleAttributeType} value Filter value
   */
  public notEq<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(key: K, value: V) {
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
        [TransformNestedKey<K, { $not: { $eq: V } }>]
      >
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Populate">
  public populateRelation<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    RelationConfig extends InternalBuilderConfig
  >(
    key: K,
    builderFactory: BuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();

    const populate: StrapiPopulate<Model, PopulateModel> = {
      key: key,
      nestedQuery: {
        fields: populateBuilder.getRawFields(),
        sort: populateBuilder.getRawSort(),
        population: populateBuilder.getRawPopulation(),
        filters: populateBuilder.getRawFilters(),
      },
    };

    this._addToPopulate(populate);
    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [],
        { [P in K]: BuildCallbackOutput<RelationConfig> }
      >
    >;
  }

  public populateDynamic<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    C extends string,
    RelationConfig extends InternalBuilderConfig
  >(
    key: K,
    componentTypeKey: C,
    builderFactory: BuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();
    const newQuery: MorphOnPopulate<PopulateModel> = {
      [componentTypeKey]: {
        fields: populateBuilder.getRawFields(),
        sort: populateBuilder.getRawSort(),
        population: populateBuilder.getRawPopulation(),
        filters: populateBuilder.getRawFilters(),
      },
    };

    const currentQuery = this._query.population.get(key);
    if (!_isDefined(currentQuery)) {
      this._addToPopulate({ key: key, dynamicQuery: newQuery });
    } else {
      const currentDynamic = currentQuery.dynamicQuery || {};
      this._addToPopulate({
        key: key,
        dynamicQuery: { ...currentDynamic, ...newQuery },
      });
    }

    return this as unknown as EQBuilder<
      Model,
      Data,
      UpdateConfig<
        Config,
        [],
        [],
        [],
        MergePopulate<
          Config["populates"] extends Record<string, any>
            ? Config["populates"]
            : {},
          {
            [P in K]: { on: { [D in C]: BuildCallbackOutput<RelationConfig> } };
          }
        >
      >
    >;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulate<Model, PopulateModel>
  ) {
    this._query.population.set(populate.key, populate);
  }
  //</editor-fold>

  //<editor-fold desc="Build process">
  public build() {
    const builtQuery = EQBuilder._buildQuery(this._query);
    return builtQuery as BuildOutput<Config>;
  }

  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>
  ) {
    const builtQuery: any = {};

    const parsedFields = Array.from(rawQuery.fields);
    if (parsedFields.length > 0) {
      builtQuery.fields = parsedFields;
    }

    const parsedSort = EQBuilder._parseSort(rawQuery.sort);
    if (parsedSort.length > 0) {
      builtQuery.sort = parsedSort;
    }

    const parsedFilters = EQBuilder._parseFilters(rawQuery.filters);
    if (_isDefined(parsedFilters)) {
      builtQuery.filters = parsedFilters;
    }

    const parsedPopulation = EQBuilder._parsePopulate(rawQuery.population);
    if (_isDefined(parsedPopulation)) {
      builtQuery.populate = parsedPopulation;
    }

    return builtQuery;
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

  private static _parsePopulate<Md extends object, Dt extends object>(
    populates: StrapiPopulations<Md, Dt>
  ): any | undefined {
    if (populates.size === 0) return undefined;

    const allPopulate = populates.get("*");
    if (_isDefined(allPopulate)) return "*";

    let parsedPopulates: any = {};

    populates.forEach((populate) => {
      if (populate.dynamicQuery) {
        const dynamicZoneQuery: any = {};
        Object.entries(populate.dynamicQuery).forEach(([key, query]) => {
          dynamicZoneQuery[key] = EQBuilder._buildQuery(query);
        });

        parsedPopulates[populate.key] = { on: dynamicZoneQuery };
      } else if (populate.nestedQuery) {
        parsedPopulates[populate.key] = EQBuilder._buildQuery(
          populate.nestedQuery
        );
      } else {
        parsedPopulates[populate.key] = true;
      }
    });

    return parsedPopulates;
  }
  //</editor-fold>

  //<editor-fold desc="Protected utils">
  protected getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }
  protected getRawFields(): StrapiFields<Model> {
    return this._query.fields;
  }
  protected getRawSort(): StrapiSorts<Model> {
    return this._query.sort;
  }
  protected getRawPopulation(): StrapiPopulations<Model, any> {
    return this._query.population;
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

type FilterOperatorKey<Model extends object> = GetStrictOrWeak<
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
  key?: FilterOperatorKey<Model>;
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

// <editor-fold desc="Query shapes">
type InternalBuilderConfig = {
  fields?: unknown[];
  sort?: unknown[];
  filters?: unknown[];
  rootLogical?: "$and" | "$or";
  negate?: boolean;
  populateAll?: boolean;
  populates?: unknown;
};

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
  filters: StrapiRawFilters<Model>;
  population: StrapiPopulations<Model, any>;
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

type MergePopulate<Existing, New> = Existing extends Record<string, any>
  ? New extends Record<string, any>
    ? {
        [P in keyof Existing | keyof New]: P extends keyof New
          ? P extends keyof Existing
            ? MergeOnKeys<Existing[P], New[P]>
            : New[P]
          : P extends keyof Existing
          ? Existing[P]
          : never;
      }
    : Existing
  : New;

type MergeOnKeys<Existing, New> = Existing extends { on: infer E }
  ? New extends { on: infer N }
    ? {
        on: {
          [D in keyof E | keyof N]: D extends keyof N
            ? N[D]
            : D extends keyof E
            ? E[D]
            : never;
        };
      }
    : Existing & New
  : New;

type UpdateConfig<
  Config extends InternalBuilderConfig,
  NewFields extends readonly unknown[] = [],
  NewSorts extends readonly unknown[] = [],
  NewFilters extends readonly unknown[] = [],
  NewPopulates extends Record<string, any> = {},
  RootLogical extends "$and" | "$or" = Config["rootLogical"] extends
    | "$and"
    | "$or"
    ? Config["rootLogical"]
    : "$and",
  Negate extends boolean = Config["negate"] extends true ? true : false,
  PopulateAll extends boolean = Config["populateAll"] extends true
    ? true
    : false
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
  populates: {
    [K in
      | keyof (Config["populates"] extends Record<string, any>
          ? Config["populates"]
          : {})
      | keyof NewPopulates]: K extends keyof NewPopulates
      ? NewPopulates[K]
      : K extends keyof (Config["populates"] extends Record<string, any>
          ? Config["populates"]
          : {})
      ? (Config["populates"] extends Record<string, any>
          ? Config["populates"]
          : {})[K]
      : never;
  };
  populateAll: PopulateAll;
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

type ParsePopulates<P, PopulateAll> = PopulateAll extends true
  ? "*"
  : P extends Record<string, any>
  ? keyof P extends never
    ? never
    : P
  : never;

type BuildCallbackOutput<Config> = Config extends {
  fields: infer Fields;
  sort: infer Sorts;
  filters: infer Filters;
  rootLogical: infer RootLogical;
  negate: infer Not;
  populates: infer Populates;
  populateAll: infer PopulateAll;
}
  ? {
      fields: ParseFields<Fields>;
      sort: ParseSorts<Sorts>;
      filters: ParseFilters<Filters, RootLogical, Not>;
      populate: ParsePopulates<Populates, PopulateAll>;
    } extends infer Result
    ? {
        [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
      }
    : never
  : {};

type BuildOutput<Config> = Config extends {
  fields: infer Fields;
  sort: infer Sorts;
  filters: infer Filters;
  rootLogical: infer RootLogical;
  negate: infer Not;
  populates: infer Populates;
  populateAll: infer PopulateAll;
}
  ? {
      fields: ParseFields<Fields>;
      sort: ParseSorts<Sorts>;
      filters: ParseFilters<Filters, RootLogical, Not>;
      populate: ParsePopulates<Populates, PopulateAll>;
    } extends infer Result
    ? {
        [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
      }
    : never
  : {};
// </editor-fold>

// TODO: filter keys of relationTypes must be excluded to prevent errors when we trying to filter for example Category, we can only filter Category.id and etc.

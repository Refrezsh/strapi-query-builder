import { _isDefined, _set } from "./query-utils";

export default class EQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends InternalBuilderConfig = InitialBuildConfig
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

  //<editor-fold desc="Fields">
  /**
   * @description Select specific fields
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().fields(["name", "type"]); // { fields: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields
   */
  public fields<
    F extends readonly [
      StrapiSingleFieldInput<Model>,
      ...StrapiSingleFieldInput<Model>[]
    ]
  >(fields: F) {
    fields.forEach((f) => this._query.fields.add(f));
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...F];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Select specific field
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().field("key"); // { fields: ["key"] }
   * @param {StrapiSingleFieldInput} field Single field
   */
  public field<F extends StrapiSingleFieldInput<Model>>(field: F) {
    this._query.fields.add(field);
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], F];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Sorts">
  /**
   * @description Add ascending sort key
   * @description Same keys will be merged
   * @param {SortKey} sortKey Sort key
   * @example new EQBuilder<Model>().sortAsc("key"); // { sort: [{"key": "asc"}] }
   * @example new EQBuilder<Model>().sortAsc("parentKey.childKey"); // { sort: [{"parentKey": { "childKey": "asc" }}]}
   */
  public sortAsc<K extends SortKey<Model>>(sortKey: K) {
    this._query.sort.set(sortKey, "asc");
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], TransformNestedKey<K, "asc">];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add descending sort key
   * @description Same keys will be merged
   * @param {SortKey} sortKey Sort key
   * @example new EQBuilder<Model>().sortAsc("key"); // { sort: [{"key": "desc"}] }
   * @example new EQBuilder<Model>().sortAsc("parentKey.childKey"); // { sort: [{"parentKey": { "childKey": "desc" }}]}
   */
  public sortDesc<K extends SortKey<Model>>(sortKey: K) {
    this._query.sort.set(sortKey, "desc");
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], TransformNestedKey<K, "desc">];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add ascending sort keys
   * @description Same keys will be merged
   * @param {SortKey[]} sortKeys List of sort keys
   * @example new EQBuilder<Model>().sortsAsc(["key1", "key2"]); // { sort: [{"key1": "asc"}, {"key2": "asc"}] }
   * @example new EQBuilder<Model>().sortsAsc(["parentKey.childKey", "anotherKey"]); // { sort: [{"parentKey": { "childKey": "asc" }}, {"anotherKey": "asc"}] }
   */
  public sortsAsc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    sortKeys: K
  ) {
    sortKeys.forEach((key) => this._query.sort.set(key, "asc"));

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...TransformNestedKeys<K, "asc">];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add descending sort keys
   * @description Same keys will be merged
   * @param {SortKey[]} sortKeys List of sort keys
   * @example new EQBuilder<Model>().sortsAsc(["key1", "key2"]); // { sort: [{"key1": "desc"}, {"key2": "desc"}] }
   * @example new EQBuilder<Model>().sortsAsc(["parentKey.childKey", "anotherKey"]); // { sort: [{"parentKey": { "childKey": "desc" }}, {"anotherKey": "desc"}] }
   */
  public sortsDesc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    sortKeys: K
  ) {
    sortKeys.forEach((key) => this._query.sort.set(key, "desc"));

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...TransformNestedKeys<K, "desc">];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Filters">
  /**
   * @description Change root logical to "$or"
   * @description Default - "$and"
   * @example new EQBuilder<Model>().or(); // { filters: { $or: [...] }}
   */
  public or() {
    this._query.filters.rootLogical = "$or";
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: "$or";
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Change root logical to "$and"
   * @description Default - "$and"
   * @example new EQBuilder<Model>().and(); // { filters: { $and: [...] }}
   */
  public and() {
    this._query.filters.rootLogical = "$and";
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: "$and";
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add "$not" before root logical
   * @description Default - false
   * @example new EQBuilder<Model>().not(); // { filters: { $not: { $and: [...] }}}
   */
  public not() {
    this._query.filters.negate = true;
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: true;
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
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
   * // {
   * //    filters: {
   * //      $and: [
   * //        { options: { $eq: "value" } },
   * //        { $or: [{ name: { $eq: "value1" } }, { name: { $eq: "value2" } }] }
   * //      ];
   * //    };
   * // }
   *
   * // Reads like model.options === "value" && (model.name === "value1" || model.name === "value2")
   * @param {BuilderCallback} builderFactory Fabric function that returns builder with filters for current model
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
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          ParseFilters<
            DeepConfig["filters"],
            DeepConfig["rootLogical"],
            DeepConfig["negate"]
          >
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add related model filters
   * @example
   * new EQBuilder<TestModel>()
   *       .filterRelation("nested", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value")
   *       )
   * // {
   * //      filters: {
   * //        $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
   * //      }
   * // }
   * @param {FilterOperatorKey} relationKey Key of relation model
   * @param {BuilderCallback} builderFactory Fabric function that returns builder with filters for relation model
   */
  public filterRelation<
    RelationModel extends object,
    K extends FilterOperatorKey<Model>,
    RelationConfig extends InternalBuilderConfig
  >(
    relationKey: K,
    builderFactory: BuilderCallback<RelationModel, {}, RelationConfig>
  ) {
    const relationBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      key: relationKey,
      nested:
        relationBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          TransformNestedKey<
            K,
            ParseFilters<
              RelationConfig["filters"],
              RelationConfig["rootLogical"],
              RelationConfig["negate"]
            >
          >
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add "$eq" filter for attribute
   * @description Same keys will not be merged
   * @description Allowed "key.dot" notation
   * @example new EQBuilder<Model>().eq("key", "value"); // { filters: { $and: [{ key: { $eq: "value" }} ] }}
   * @param {FilterOperatorKey} key Filter key
   * @param {SingleAttributeType} value Filter by value
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
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [...Config["filters"], TransformNestedKey<K, { $eq: V }>];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Add "$not" "$eq" filter for attribute
   * @description Same keys will not be merged
   * @description Allowed "key.dot" notation
   * @example new EQBuilder<Model>().notEq("key", "value"); // { filters: { $and: [{ key: { $not: { $eq: "value" } }} ] }}
   * @param {FilterOperatorKey} key Filter key
   * @param {SingleAttributeType} value Filter by value
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
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          TransformNestedKey<K, { $not: { $eq: V } }>
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Populate">
  /**
   * @description Populate all relations of model
   * @description If any other populate presented, it will be ignored
   * @example new EQBuilder<Model>().populateAll(); // { populate: "*" }
   */
  public populateAll() {
    this._addToPopulate({ key: "*" });
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: true;
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Populate all model by key
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey} key Populate key
   * @example new EQBuilder<Model>().populate("relation"); // { populate: { relation: true } }
   */
  public populate<K extends StrapiInputPopulateKey<Model>>(key: K) {
    this._addToPopulate({ key: key });
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? true
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Populate all models  by key list
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey[]} keys Populate key list
   * @example new EQBuilder<Model>().populates(["relation1", "relation2"]); // { populate: { relation1: true, relation2: true } }
   */
  public populates<K extends StrapiInputPopulateKey<Model>[]>(keys: K) {
    keys.forEach((k) => this._addToPopulate({ key: k }));
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K[number]]: P extends K[number]
            ? true
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Populate relation model, with specific deep config
   * @description Same keys will be overwritten by last operator
   * @param {StrapiInputPopulateKey} key Populate key
   * @param {BuilderCallback} builderFactory Fabric function that returns builder with filters, sort, fields and other deep populate builders for Relation Model
   * @example
   * new EQBuilder<TestModel>()
   *       .populateRelation("nested", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value").field("id")
   *       )
   * //     populate: {
   * //       nested: {
   * //         fields: ["id"];
   * //         filters: { $and: [{ id: { $eq: "value" } }] };
   * //       }
   * //     }
   */
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
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? BuildCallbackOutput<RelationConfig>
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Populate relation with dynamic zone.
   * @description Same relation model keys will be overwritten
   * @description Same dynamic zone component keys will be overwritten
   * @param {StrapiInputPopulateKey} key Relation model key
   * @param {string} componentKey Dynamic zone component key
   * @param {builderFactory} builderFactory Fabric function that returns builder with filters, sort, fields and other deep populate builders for Dynamic zone component
   * @example
   * new EQBuilder<TestModel>()
   *       .populateDynamic("nested", "component.1", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value")
   *       )
   *       .populateDynamic("nested", "component.2", () =>
   *         new EQBuilder<NestedModel>().notEq("id", "value3")
   *       )
   * //      populate: {
   * //       nested: {
   * //         on: {
   * //           "component.1": { filters: { $and: [{ id: { $eq: "value" } }] } };
   * //           "component.2": {
   * //             filters: { $and: [{ id: { $not: { $eq: "value3" } } }] };
   * //           };
   * //         };
   * //       };
   * //     };
   */
  public populateDynamic<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    C extends string,
    RelationConfig extends InternalBuilderConfig
  >(
    key: K,
    componentKey: C,
    builderFactory: BuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();
    const newQuery: MorphOnPopulate<PopulateModel> = {
      [componentKey]: {
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
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? {
                on: {
                  [D in keyof OnType<Config["populates"][P]> | C]: D extends C
                    ? BuildCallbackOutput<RelationConfig>
                    : D extends keyof OnType<Config["populates"][P]>
                    ? OnType<Config["populates"][P]>[D]
                    : never;
                };
              }
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulate<Model, PopulateModel>
  ) {
    this._query.population.set(populate.key, populate);
  }
  //</editor-fold>

  //<editor-fold desc="Pagination">
  /**
   * @description Pagination by page, when defining the page and pageSize parameters
   * @param {number} page Current page
   * @param {number} pageSize Page size
   * @example
   * new EQBuilder<TestModel>().page(1, 26) // { page: 1; pageSize: 26 }
   */
  public page<Page extends number, PageSize extends number>(
    page: Page,
    pageSize: PageSize
  ) {
    this._query.pagination = {
      page: page,
      pageSize: pageSize,
      paginationType: "page",
    };
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: { page: Page; pageSize: PageSize };
        paginationType: "page";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Pagination by offset, when defining the start and limit parameters
   * @param {number} start
   * @param {number} limit
   * @example new EQBuilder<TestModel>().pageLimit(0, 26) // { start: 0; limit: 26 }
   */
  public pageLimit<Start extends number, limit extends number>(
    start: Start,
    limit: limit
  ) {
    this._query.pagination = {
      page: start,
      pageSize: limit,
      paginationType: "limit",
    };
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: { page: Start; pageSize: limit };
        paginationType: "limit";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Join utils">
  /**
   * @description Attach fields from other query builder
   * @description Same keys will be merged
   * @param {EQBuilder} builder Embedded builder
   */
  public joinFields<DeepConfig extends InternalBuilderConfig>(
    builder: EQBuilder<Model, {}, DeepConfig>
  ) {
    builder.getRawFields().forEach((f) => this._query.fields.add(f));
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...DeepConfig["fields"]];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Attach sorts from other query builder
   * @description Same keys will be merged
   * @param {EQBuilder} builder Embedded builder
   */
  public joinSort<DeepConfig extends InternalBuilderConfig>(
    builder: EQBuilder<Model, {}, DeepConfig>
  ) {
    builder
      .getRawSort()
      .forEach((value, key) => this._query.sort.set(key, value));

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...DeepConfig["sort"]];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Attach filters from other query builder
   * @param {EQBuilder} builder Embedded builder
   * @param {boolean} joinRootLogical Override root logical ?
   * @param {boolean} joinRootNegate Override root negate ?
   */
  public joinFilters<
    DeepConfig extends InternalBuilderConfig,
    JoinRootLogical extends boolean = false,
    JoinRootNegate extends boolean = false
  >(
    builder: EQBuilder<Model, {}, DeepConfig>,
    joinRootLogical?: JoinRootLogical,
    joinRootNegate?: JoinRootNegate
  ) {
    const externalFilters = builder.getRawFilters();

    this._query.filters.attributeFilters =
      this._query.filters.attributeFilters.concat(
        externalFilters.attributeFilters as unknown as StrapiAttributesFilter<Model>[]
      );

    if (joinRootLogical) {
      this._query.filters.rootLogical = externalFilters.rootLogical;
    }

    if (joinRootNegate) {
      this._query.filters.negate = externalFilters.negate;
    }

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [...Config["filters"], ...DeepConfig["filters"]];
        rootLogical: JoinRootLogical extends true
          ? DeepConfig["rootLogical"]
          : Config["rootLogical"];
        negate: JoinRootNegate extends true
          ? DeepConfig["negate"]
          : Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Attach populates from other query builder
   * @description Same keys will be overwritten
   * @param {EQBuilder} builder Embedded builder
   */
  public joinPopulate<DeepConfig extends InternalBuilderConfig>(
    builder: EQBuilder<Model, {}, DeepConfig>
  ) {
    builder
      .getRawPopulation()
      .forEach((populate) =>
        this._query.population.set(
          populate.key as PopulateKey<Model>,
          populate as unknown as StrapiPopulate<Model, any>
        )
      );

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in
            | keyof Config["populates"]
            | keyof DeepConfig["populates"]]: P extends keyof DeepConfig["populates"]
            ? DeepConfig["populates"][P]
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Attach pagination from other query builder
   * @param {EQBuilder} builder Embedded builder
   */
  public joinPagination<DeepConfig extends InternalBuilderConfig>(
    builder: EQBuilder<Model, {}, DeepConfig>
  ) {
    const externalPagination = builder.getRawPagination();

    if (_isDefined(externalPagination)) {
      this._query.pagination = externalPagination;
    }

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: DeepConfig["pagination"];
        paginationType: DeepConfig["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }

  /**
   * @description Join query from other query builder to current query builder
   * @param {EQBuilder} builder Embedded builder
   */
  public joinQuery<DeepConfig extends InternalBuilderConfig>(
    builder: EQBuilder<Model, {}, DeepConfig>
  ) {
    this.joinPopulate(builder);
    this.joinFilters(builder);
    this.joinSort(builder);
    this.joinFields(builder);

    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...DeepConfig["fields"]];
        sort: [...Config["sort"], ...DeepConfig["sort"]];
        filters: [...Config["filters"], ...DeepConfig["filters"]];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in
            | keyof Config["populates"]
            | keyof DeepConfig["populates"]]: P extends keyof DeepConfig["populates"]
            ? DeepConfig["populates"][P]
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Service specific">
  /**
   * @description Set locale filter
   * @description Entity Service Specific
   * @param {string} code - Locale code
   * @example new EQBuilder<TestModel>().locale("ua") // { locale: "ua" }
   */
  public locale<L extends string>(code: L) {
    this._query.locale = code;
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: L;
      }
    >;
  }

  /**
   * @description Set publication state for draft & publish
   * @description Entity Service Specific
   * @param {PublicationStates} state Publication state
   * @example new EQBuilder<TestModel>().publicationState("live") // { publicationState: "live" }
   */
  public publicationState<P extends PublicationStates>(state: P) {
    this._query.publicationState = state;
    return this as unknown as EQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: P;
        locale: Config["locale"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Build process">
  /**
   * @description Build the current query into the final Strapi Entity Service format
   * @return Dynamically generated query type
   */
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

    const pagination = rawQuery.pagination;
    if (_isDefined(pagination)) {
      if (pagination.paginationType === "page") {
        builtQuery.page = pagination.page;
        builtQuery.pageSize = pagination.pageSize;
      } else {
        builtQuery.start = pagination.page;
        builtQuery.limit = pagination.pageSize;
      }
    }

    const publicationState = rawQuery.publicationState;
    if (_isDefined(publicationState)) {
      builtQuery.publicationState = publicationState;
    }

    const locale = rawQuery.locale;
    if (_isDefined(locale)) {
      builtQuery.locale = locale;
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
  protected getRawPagination(): StrapiPagination | undefined {
    return this._query.pagination;
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
};

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
  filters: StrapiRawFilters<Model>;
  population: StrapiPopulations<Model, any>;
  pagination?: StrapiPagination;
  locale?: string;
  publicationState?: PublicationStates;
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

type OnType<T> = T extends { on: infer O } ? O : {};

type ParseList<F extends readonly unknown[]> = F["length"] extends 0
  ? never
  : F;

type ParseFilters<
  Filters extends unknown[],
  RootLogical extends "$and" | "$or",
  Negate extends boolean
> = Filters["length"] extends 0
  ? never
  : Negate extends true
  ? { $not: { [K in RootLogical]: Filters } }
  : { [K in RootLogical]: Filters };

type ParsePopulates<
  P extends Record<string, any>,
  PopulateAll extends boolean
> = keyof P extends never ? never : PopulateAll extends true ? "*" : P;

type BuildCallbackOutput<Config extends InternalBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParsePopulates<Config["populates"], Config["populateAll"]>;
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;

type BuildOutput<Config extends InternalBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParsePopulates<Config["populates"], Config["populateAll"]>;
  page: Config["paginationType"] extends "page"
    ? Config["pagination"]["page"]
    : never;
  pageSize: Config["paginationType"] extends "page"
    ? Config["pagination"]["pageSize"]
    : never;
  start: Config["paginationType"] extends "limit"
    ? Config["pagination"]["page"]
    : never;
  limit: Config["paginationType"] extends "limit"
    ? Config["pagination"]["pageSize"]
    : never;
  publicationState: Config["publicationState"] extends PublicationStates
    ? Config["publicationState"]
    : never;
  locale: Config["locale"] extends string ? Config["locale"] : never;
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;

// </editor-fold>

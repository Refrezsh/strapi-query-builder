import {
  AttributeValues,
  BuilderConfig,
  DefaultPopulation,
  FieldPath,
  FilterAttributeType,
  FilterInputCallback,
  FilterKey,
  GetRelations,
  GetStrictOrWeak,
  MorphOnPopulation,
  MultipleAttributeType,
  PopulationInputCallback,
  PopulationKey,
  PopulationNestedQuery,
  QueryRawInfo,
  QueryTypes,
  SingleAttributeType,
  SortKey,
  StrapiAttributesFilter,
  StrapiEntityQuery,
  StrapiFields,
  StrapiFieldsInputQuery,
  StrapiFiltersType,
  StrapiOffsetPagination,
  StrapiPagination,
  StrapiPopulation,
  StrapiPopulationInputQuery,
  StrapiRawFilters,
  StrapiSort,
  StrapiSortInputQuery,
  StrapiSortOptions,
  UnionInputPagination,
} from "./sq-builder-types";

export default class Index<Model extends object, Data extends object = {}> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: [],
    filters: {
      rootLogical: "$and",
      attributeFilters: [],
    },
    population: [],
    fields: [] as StrapiFields<Model>,
  };

  private readonly _builderConfig: Required<BuilderConfig> = {
    defaultSort: "asc",
  };

  private _prevFilterKey?: FilterKey<Model>;
  private _nextAttributeNegate: boolean = false;
  private _prevPopulateKey?: PopulationKey<any>;
  private _isReadonly = false;

  constructor(builderConfig?: BuilderConfig) {
    if (builderConfig) {
      this._builderConfig = { ...this._builderConfig, ...builderConfig };
    }
  }

  //<editor-fold desc="Build functions">
  /**
   * @description Build Strapi query
   * @param {QueryTypes} queryType Default StrapiService
   * @return {StrapiEntityQuery} Built query
   */
  public build(
    queryType: QueryTypes = "strapiService"
  ): StrapiEntityQuery<Model, Data> {
    switch (queryType) {
      case "entityService": {
        return this.buildEntityService();
      }

      case "queryEngine": {
        return this.buildQueryEngine();
      }

      case "strapiService": {
        return this.buildStrapiService();
      }

      default: {
        return this.buildStrapiService();
      }
    }
  }

  /**
   * @description Build Strapi query for Strapi service
   * @return {StrapiEntityQuery} Built query
   */
  public buildStrapiService(): StrapiEntityQuery<Model, Data> {
    return Index._buildQuery(this._query, "strapiService");
  }

  /**
   * @description Build Strapi query for Entity service
   * @return {StrapiEntityQuery} Built query
   */
  public buildEntityService(): StrapiEntityQuery<Model, Data> {
    return Index._buildQuery(this._query, "entityService");
  }

  /**
   * @description Build Strapi query for Query service
   * @return {StrapiEntityQuery} Built query
   */
  public buildQueryEngine(): StrapiEntityQuery<Model, Data> {
    return Index._buildQuery(this._query, "queryEngine");
  }
  //</editor-fold>

  //<editor-fold desc="Filters functions">
  /**
   * @description Start filter query
   * @description If the attribute is empty, it expects a logical filter or a nested filter "with"
   * @param {FilterInputCallback| FilterKey} attribute Can be key or callback with same builder for visual filter grouping
   * @param {FilterInputCallback} thisCallback Provides same builder to group filters chains
   * @return {Index} This builder
   */
  public filters(
    attribute?: FilterInputCallback<Model, Data> | FilterKey<Model>,
    thisCallback?: FilterInputCallback<Model, any>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (typeof attribute === "function") {
      attribute(this);
      return this;
    }

    if (attribute !== undefined) {
      this._prevFilterKey = attribute;
    }

    if (thisCallback !== undefined && typeof thisCallback === "function") {
      thisCallback(this);
      return this;
    }

    return this;
  }

  /**
   * Add deep nested filters to current filters
   * Callback provide new builder
   * @param nestedCallback
   */
  public with<NestedModel extends object = {}>(
    nestedCallback: FilterInputCallback<NestedModel, any>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nestedBuilder = new Index<NestedModel, any>();
    nestedCallback(nestedBuilder);

    this._addToFilter(
      {
        key: this._prevFilterKey,
        nested:
          nestedBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
      },
      () => {
        this._prevFilterKey = undefined;
      }
    );

    return this;
  }

  //<editor-fold desc="Logical filters">
  /**
   * @description Negates current attribute or logical filter
   * @return {Index} This builder
   */
  public not(): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const target =
      this._prevFilterKey !== undefined ? "attribute" : "negateRoot";

    target === "negateRoot"
      ? (this._query.filters.negate = true)
      : (this._nextAttributeNegate = true);

    return this;
  }

  /**
   * @description Add logical OR filter.
   * @return {Index} This builder
   */
  public or(): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$or";
    return this;
  }

  /**
   * @description Add logical AND filter.
   * @return {Index} This builder
   */
  public and(): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$and";
    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Attributes filters">
  /**
   * @description Add "Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public eq(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$eq", value);
  }

  /**
   * @description Add "Equal insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public eqi(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$eqi", value);
  }

  /**
   * @description Add "Not Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public ne(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$ne", value);
  }

  /**
   * @description Add "In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {Index} This builder
   */
  public in(value: MultipleAttributeType): Index<Model, Data> {
    return this._addAttribute("$in", value);
  }

  /**
   * @description Add "Not In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {Index} This builder
   */
  public notIn(value: MultipleAttributeType): Index<Model, Data> {
    return this._addAttribute("$notIn", value);
  }

  /**
   * @description Add "Less Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public lt(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$lt", value);
  }

  /**
   * @description Add "Less Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public lte(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$lte", value);
  }

  /**
   * @description Add "Greater Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public gt(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$gt", value);
  }

  /**
   * @description Add "Greater Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public gte(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$gte", value);
  }

  /**
   * @description Add "Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public contains(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$contains", value);
  }

  /**
   * @description Add "Not Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public notContains(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$notContains", value);
  }

  /**
   * @description Add "Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public containsi(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$containsi", value);
  }

  /**
   * @description Add "Not Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public notContainsi(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$notContainsi", value);
  }

  /**
   * @description Add "Start with" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public startsWith(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$startsWith", value);
  }

  /**
   * @description Add "Ends with" attribute filter
   * @param {SingleAttributeType} value
   * @return {Index} This builder
   */
  public endsWith(value: SingleAttributeType): Index<Model, Data> {
    return this._addAttribute("$endsWith", value);
  }

  /**
   * @description Add "Is null" attribute filter
   * @param {boolean} value
   * @return {Index} This builder
   */
  public null(value: boolean): Index<Model, Data> {
    return this._addAttribute("$null", value);
  }

  /**
   * @description Add "Is not null" attribute filter
   * @param {boolean} value
   * @return {Index} This builder
   */
  public notNull(value: boolean): Index<Model, Data> {
    return this._addAttribute("$notNull", value);
  }

  /**
   * @description Add "Between" attribute filter
   * @param {MultipleAttributeType} value
   * @return {Index} This builder
   */
  public between(value: MultipleAttributeType): Index<Model, Data> {
    return this._addAttribute("$between", value);
  }
  //</editor-fold>

  //<editor-fold desc="Filter private actions">
  private _addAttribute(
    type: FilterAttributeType,
    value: AttributeValues
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevFilterKey !== undefined) {
      this._addToFilter(
        {
          key: this._prevFilterKey,
          type: type,
          value,
          negate: this._nextAttributeNegate,
        },
        () => {
          this._prevFilterKey = undefined;
          this._nextAttributeNegate = false;
        }
      );
    }

    return this;
  }

  private _addToFilter(
    filter: StrapiAttributesFilter<Model>,
    onAdded?: () => void
  ) {
    this._query.filters.attributeFilters.push(filter);
    onAdded && onAdded();
  }
  //</editor-fold>
  //</editor-fold>

  //<editor-fold desc="Population">
  /**
   * @description Add query populate
   * @description Can be as a simple key or take a callback for nested query
   * @param {StrapiPopulationInputQuery} populateQuery
   * @param {PopulationInputCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
   * @return {Index} This builder
   */
  public populate<PopulateModel extends object>(
    populateQuery: StrapiPopulationInputQuery<Model>,
    nestedCallback?: PopulationInputCallback<PopulateModel>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    let nestedBuilder: Index<PopulateModel, any> | undefined = undefined;

    const parsedPopulateQuery = Index._parsePopulation<
      Model,
      PopulateModel
    >(populateQuery);

    const singlePopulateQuery = parsedPopulateQuery[0];

    if (nestedCallback !== undefined && typeof nestedCallback === "function") {
      nestedBuilder = new Index<PopulateModel, any>({
        defaultSort: this._builderConfig.defaultSort,
      });
      nestedBuilder.setPrevPopulationKey(singlePopulateQuery.key);
      nestedCallback(nestedBuilder);
    }

    if (nestedBuilder) {
      const findMorph = nestedBuilder.getPopulationByKey<PopulateModel>(
        singlePopulateQuery.key as PopulationKey<PopulateModel>
      );

      const isMorphData =
        findMorph !== undefined &&
        !Index._isDefaultQueryPopulation(findMorph.nestedQuery);

      parsedPopulateQuery[0] = {
        key: singlePopulateQuery.key,
        nestedQuery: isMorphData
          ? findMorph.nestedQuery
          : {
              fields: nestedBuilder.getRawFields(),
              population: nestedBuilder.getRawPopulation(),
              sort: nestedBuilder.getRawSort(),
              filters: nestedBuilder.getRawFilters(),
            },
      };
    }

    for (const population of parsedPopulateQuery) {
      this._addToPopulate(population);
    }

    return this;
  }

  /**
   * @description Add populate fragments for dynamic zones
   * @param {string} componentTypeKey Component type key
   * @param {PopulationInputCallback} nestedCallback Dynamic component builder
   * @return {Index} This builder
   */
  public on<PopulateModel extends object>(
    componentTypeKey: string,
    nestedCallback: PopulationInputCallback<PopulateModel>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevPopulateKey === undefined) {
      return this;
    }

    const populationIndex = this._query.population.findIndex(
      (p) => p.key === this._prevPopulateKey
    );

    const nestedBuilder: Index<PopulateModel, any> = new Index<
      PopulateModel,
      any
    >({
      defaultSort: this._builderConfig.defaultSort,
    });

    nestedCallback(nestedBuilder);

    const newQuery: MorphOnPopulation<PopulateModel> = {};
    Object.assign(newQuery, {
      [componentTypeKey]: {
        fields: nestedBuilder.getRawFields(),
        population: nestedBuilder.getRawPopulation(),
        sort: nestedBuilder.getRawSort(),
        filters: nestedBuilder.getRawFilters(),
      },
    });

    if (populationIndex === -1) {
      this._query.population.push({
        key: this._prevPopulateKey as PopulationKey<Model>,
        nestedQuery: newQuery,
      });
    } else {
      const populationQuery = this._query.population[populationIndex];

      this._query.population[populationIndex] = {
        key: this._prevPopulateKey as PopulationKey<Model>,
        nestedQuery: { ...populationQuery.nestedQuery, ...newQuery },
      };
    }

    return this;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulation<Model, PopulateModel>
  ) {
    if (populate.key === "*") {
      this._query.population = [{ key: populate.key }];
      return;
    }

    const founded = this._query.population.findIndex((f) => {
      return f.key === populate.key;
    });

    if (founded === -1) {
      this._query.population.push(populate);
    } else {
      this._query.population[founded] = populate;
    }
  }

  private static _parsePopulation<
    ParentModel extends object,
    PopulateModel extends object
  >(
    populationQuery: StrapiPopulationInputQuery<ParentModel>
  ): StrapiPopulation<ParentModel, PopulateModel>[] {
    if (populationQuery === "*") {
      return [{ key: "*" }];
    }

    if (this._isArrayOfPopKeys(populationQuery)) {
      return populationQuery.map((s) => ({ key: s }));
    }

    if (this._isNotArrayOfPopKeys(populationQuery)) {
      return [{ key: populationQuery }];
    }
  }

  private static _isNotArrayOfPopKeys<ParentModel extends object>(
    query: StrapiPopulationInputQuery<ParentModel>
  ): query is PopulationKey<ParentModel> {
    return !Array.isArray(query);
  }

  private static _isArrayOfPopKeys<ParentModel extends object>(
    query:
      | GetRelations<ParentModel>
      | GetRelations<ParentModel>[]
      | string
      | string[]
  ): query is PopulationKey<ParentModel>[] {
    return Array.isArray(query);
  }

  private static _isDefaultQueryPopulation<PopulateModel extends object>(
    query: PopulationNestedQuery<PopulateModel>
  ): query is DefaultPopulation<PopulateModel> {
    return (
      "sort" in query ||
      "filters" in query ||
      "population" in query ||
      "fields" in query
    );
  }
  //</editor-fold>

  //<editor-fold desc="Fields">
  /**
   * @description Add filed selection to query
   * @description Same keys will be merged
   * @param {StrapiFieldsInputQuery} fields
   * @return {Index} This builder
   */
  public fields(fields: StrapiFieldsInputQuery<Model>): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nowFields = this._query.fields;

    this._query.fields = _union(
      nowFields,
      Array.isArray(fields) ? fields : [fields]
    ) as StrapiFields<Model>;

    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Sort">
  /**
   * @description Add sorting to query
   * @description Same keys will be merged
   * @param {StrapiSortInputQuery} sortQuery
   * @return {Index} This builder
   */
  public sort(sortQuery: StrapiSortInputQuery<Model>): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nowSortValue = this._query.sort;
    const parsedSortQuery = Index._parseSortObject<Model>(
      sortQuery,
      this._builderConfig.defaultSort
    );

    this._query.sort = _unionBy(
      Array.isArray(nowSortValue) ? nowSortValue : [nowSortValue],
      Array.isArray(parsedSortQuery) ? parsedSortQuery : [parsedSortQuery],
      (v) => v.key
    );
    return this;
  }

  private static _createSortObject<ModelInput extends object>(
    stringKey: SortKey<ModelInput>,
    defaultSort: StrapiSortOptions
  ): StrapiSort<ModelInput> {
    return { key: stringKey, type: defaultSort };
  }

  private static _createSortObjectArray<ModelInput extends object>(
    stringArray: SortKey<ModelInput>[],
    defaultSort: StrapiSortOptions
  ): StrapiSort<ModelInput>[] {
    return stringArray.map((s) => Index._createSortObject(s, defaultSort));
  }

  private static _parseSortObject<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>,
    defaultSort: StrapiSortOptions
  ): StrapiSort<ModelInput> | StrapiSort<ModelInput>[] {
    if (this._isSortArray(sortQuery)) {
      if (this._isArrayOfKeys(sortQuery)) {
        return Index._createSortObjectArray<ModelInput>(
          sortQuery,
          defaultSort
        );
      } else {
        return sortQuery;
      }
    } else {
      if (this._isSortObject(sortQuery)) {
        return sortQuery;
      }

      if (this._isSortKey(sortQuery)) {
        return Index._createSortObject(sortQuery, defaultSort);
      }
    }
  }

  private static _isSortObject<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>
  ): sortQuery is StrapiSort<ModelInput> {
    return typeof sortQuery === "object";
  }

  private static _isSortKey<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>
  ): sortQuery is SortKey<ModelInput> {
    return typeof sortQuery === "string";
  }

  private static _isSortArray<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>
  ): sortQuery is
    | StrapiSort<ModelInput>[]
    | GetStrictOrWeak<
        ModelInput,
        FieldPath<ModelInput>[],
        FieldPath<ModelInput>[] | string | string[]
      > {
    return Array.isArray(sortQuery);
  }

  private static _isArrayOfKeys<ModelInput extends object>(
    sortQuery:
      | StrapiSort<ModelInput>[]
      | GetStrictOrWeak<
          ModelInput,
          FieldPath<ModelInput>[],
          FieldPath<ModelInput>[] | string | string[]
        >
    // @ts-ignore
  ): sortQuery is SortKey<ModelInput>[] {
    return (
      this._isSortArray(sortQuery) &&
      sortQuery.every((s) => !!this._isSortKey(s))
    );
  }
  //</editor-fold>

  // <editor-fold desc="Pagination">
  /**
   * @description Add StrapiService like page
   * @param {number} page
   * @return {Index} This builder
   */
  public page(page: number): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.pagination = { ...this._query.pagination, page };
    return this;
  }

  /**
   * @description Add StrapiService like page size
   * @param {number} pageSize
   * @return {Index} This builder
   */
  public pageSize(pageSize: number): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.pagination = { ...this._query.pagination, pageSize };
    return this;
  }

  /**
   * @description Add Offset like page start
   * @param {number} start
   * @return {Index} This builder
   */
  public pageStart(start: number): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.offsetPagination = { ...this._query.offsetPagination, start };
    return this;
  }

  /**
   * @description Add Offset like page limit
   * @param {number} limit
   * @return {Index} This builder
   */
  public pageLimit(limit: number): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.offsetPagination = {
      ...this._query.offsetPagination,
      limit,
    };
    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Data">
  /**
   * @description Add Any input data to query
   * @param {object} dataObject
   * @return {Index} This builder
   */
  public data(dataObject: Data): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.data = dataObject;
    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Raw query utils">
  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {boolean} isReadonly
   * @return {Index} This builder
   */
  public readonly(isReadonly?: boolean): Index<Model, Data> {
    this._isReadonly = isReadonly === undefined ? true : isReadonly;
    return this;
  }

  /**
   * @description Get raw filters info
   * @return {StrapiRawFilters} Parsed filters
   */
  public getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }

  /**
   * @description Get fields selection data
   * @return {StrapiFields} Parsed fields data
   */
  public getRawFields(): StrapiFields<Model> {
    return this._query.fields;
  }

  /**
   * @description Get raw sort data
   * @return {StrapiSort[]} Parsed sort data
   */
  public getRawSort(): StrapiSort<Model>[] {
    return this._query.sort;
  }

  /**
   * @description Get population data
   * @return {StrapiPopulation} Parsed population data
   */
  public getRawPopulation(): StrapiPopulation<Model, any>[] {
    return this._query.population;
  }

  /**
   * @description Get full raw query
   * @return {QueryRawInfo} Parsed population data
   */
  public getRawQuery(): QueryRawInfo<Model, Data> {
    return this._query;
  }

  /**
   * @description Get raw pagination
   * @return {pagination?: StrapiPagination, offsetPagination?: StrapiOffsetPagination} Parsed sort data
   */
  public getRawPagination(): {
    pagination?: StrapiPagination;
    offsetPagination?: StrapiOffsetPagination;
  } {
    return {
      pagination: this._query.pagination,
      offsetPagination: this._query.offsetPagination,
    };
  }

  /**
   * @description Set builder prev population key
   * @description
   */
  public setPrevPopulationKey<PopulationModel extends object>(
    populationKey: PopulationKey<PopulationModel>
  ): void {
    this._prevPopulateKey = populationKey;
  }

  /**
   * @description Get builder prev population by key
   * @param {PopulationKey} populationKey
   * @return {StrapiPopulation | undefined} Population object
   */
  public getPopulationByKey<PopulationModel extends object>(
    populationKey: PopulationKey<Model>
  ): StrapiPopulation<Model, PopulationModel> | undefined {
    return this._query.population.find((p) => p.key === populationKey);
  }
  // </editor-fold>

  //<editor-fold desc="Merge utils">
  /**
   * @description Merge external builder pagination
   * @param {Index} builder External builder
   * @return {Index} This builder
   */
  public joinPagination<T extends object, F extends object>(
    builder: Index<T, F>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPagination = builder.getRawPagination();

    this._query.pagination = externalPagination.pagination;
    this._query.offsetPagination = externalPagination.offsetPagination;

    return this;
  }

  /**
   * @description Merge external builder population
   * @param {Index} builder External builder
   * @return {Index} This builder
   */
  public joinPopulation<T extends object, F extends object>(
    builder: Index<T, F>
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPopulation =
      builder.getRawPopulation() as unknown as StrapiPopulation<Model, any>[];

    this._query.population = _unionBy(
      this._query.population,
      externalPopulation,
      (p) => p.key
    );

    return this;
  }

  /**
   * @description Merge external builder filters
   * @param {Index} builder External builder
   * @param {boolean} mergeRootLogical If true, the main logic filter will be overwritten by the input
   * @return {Index} This builder
   */
  public joinFilters<T extends object, F extends object>(
    builder: Index<T, F>,
    mergeRootLogical: boolean = false
  ): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFilters = builder.getRawFilters();

    this._query.filters.attributeFilters =
      this._query.filters.attributeFilters.concat(
        externalFilters.attributeFilters as unknown as StrapiAttributesFilter<Model>[]
      );

    this._query.filters.negate = externalFilters.negate;

    if (mergeRootLogical) {
      this._query.filters.rootLogical = externalFilters.rootLogical;
    }

    return this;
  }

  /**
   * @description Merge external builder sorts
   * @param {Index} builder External builder
   * @return {Index} This builder
   */
  public joinSort(builder: Index<Model, Data>): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalSort = builder.getRawSort();

    this._query.sort = _unionBy(this._query.sort, externalSort, (s) => s.key);

    return this;
  }

  /**
   * @description Merge external builder fields
   * @param {Index} builder External builder
   * @return {Index} This builder
   */
  public joinFields(builder: Index<Model, Data>): Index<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFields = builder.getRawFields();

    this._query.fields = _union(
      this._query.fields,
      externalFields
    ) as StrapiFields<Model>;

    return this;
  }
  //</editor-fold>

  // <editor-fold desc="Query parsing utils">
  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>,
    queryType: QueryTypes = "strapiService"
  ): StrapiEntityQuery<Md, Dt> {
    const isQueryEngine = this._isQueryEngine(queryType);
    let parsedQuery: StrapiEntityQuery<Md, Dt> = {};

    // Parsed sort values the same in service, entity service and query engine
    const sort = Index._parseSort<Md>(rawQuery.sort);
    if (sort !== undefined) {
      parsedQuery[isQueryEngine ? "orderBy" : "sort"] = sort;
    }

    // Fields values the same in service, entity service and query engine
    if (rawQuery?.fields?.some((f) => !!f)) {
      parsedQuery[isQueryEngine ? "select" : "fields"] = rawQuery.fields;
    }

    // Filter values the same in service, entity service and query engine
    const filters = Index._parseFilters<Md>(rawQuery.filters);
    if (filters !== undefined) {
      parsedQuery[isQueryEngine ? "where" : "filters"] = filters;
    }

    // Populate calls build for nested query
    const populate = Index._parsePopulate(rawQuery.population, queryType);
    if (populate !== undefined) {
      parsedQuery.populate = populate;
    }

    // Pagination for strapi service, entity service and query engine is different
    const pagination = this._parsePagination(
      queryType,
      rawQuery.pagination,
      rawQuery.offsetPagination
    );
    if (pagination !== undefined) {
      parsedQuery.pagination = pagination;
    }

    // Data pass without any mods
    if (rawQuery?.data !== undefined) {
      parsedQuery.data = rawQuery.data;
    }

    return parsedQuery;
  }

  private static _isQueryEngine(queryType: QueryTypes) {
    return queryType === "queryEngine";
  }

  private static _parsePagination(
    queryType: QueryTypes,
    pagination?: StrapiPagination,
    offsetPagination?: StrapiOffsetPagination
  ): UnionInputPagination | undefined {
    if (offsetPagination !== undefined) {
      return offsetPagination;
    }

    if (pagination !== undefined && queryType !== "queryEngine") {
      return pagination;
    }
  }

  private static _parseSort<Md extends object>(sorts?: StrapiSort<Md>[]) {
    let sortQuery: any = undefined;

    if (sorts?.some((s) => !!s)) {
      const isOneSort = sorts.length === 1;

      if (isOneSort) {
        const firstSort = sorts[0];
        sortQuery = _set({}, firstSort.key, firstSort.type);
      } else {
        sortQuery = [];
        for (const sort of sorts) {
          sortQuery.push(_set({}, sort.key, sort.type));
        }
      }
    }

    return sortQuery;
  }

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>
  ): StrapiFiltersType<Md> | undefined {
    if (filter.nested !== undefined) {
      const nestedFilters = this._parseFilters(filter.nested);

      if (nestedFilters === undefined) {
        return undefined;
      }

      return filter.key === undefined
        ? nestedFilters
        : (_set({}, filter.key, nestedFilters) as StrapiFiltersType<Md>);
    }

    if (filter.value === undefined || filter.type === undefined) {
      return undefined;
    }

    return filter.negate
      ? (_set({}, filter.key, {
          ["$not"]: {
            [filter.type]: filter.value,
          },
        }) as StrapiFiltersType<Md>)
      : (_set({}, filter.key, {
          [filter.type]: filter.value,
        }) as StrapiFiltersType<Md>);
  }

  private static _parseFilters<Md extends object>(
    rawFilters?: StrapiRawFilters<Md>
  ): StrapiFiltersType<Md> | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;

    const parsedFilters: StrapiFiltersType<Md>[] = [];

    for (const attributeQuery of attributeFilters) {
      const parsedAttribute = Index._parseAttributeFilter(attributeQuery);
      if (parsedAttribute === undefined) {
        continue;
      }

      parsedFilters.push(parsedAttribute);
    }

    if (!parsedFilters.some((f) => !!f)) {
      return undefined;
    }

    const withNegate = <T>(data: T): any => {
      return negateRoot ? { ["$not"]: data } : data;
    };

    if (this._isMoreThanOneFilter(parsedFilters)) {
      return withNegate({
        [rootLogical]: parsedFilters,
      }) as StrapiFiltersType<Md>;
    } else {
      return withNegate(parsedFilters[0]);
    }
  }

  private static _isMoreThanOneFilter<Md extends object>(
    filters: StrapiFiltersType<Md>[]
  ): filters is StrapiFiltersType<Md>[] {
    return filters.length > 1;
  }

  private static _parsePopulate<Md extends object, Dt extends object>(
    populates?: StrapiPopulation<Md, Dt>[],
    queryType: QueryTypes = "strapiService"
  ): any | undefined {
    if (!populates?.some((f) => !!f)) {
      return undefined;
    }

    const isQueryEngine = this._isQueryEngine(queryType);

    let parsedPopulates: any = {};

    for (const populate of populates) {
      if (populate.key === "*") {
        parsedPopulates = isQueryEngine ? true : "*";
        break;
      }

      const isComplex = Index._isPopulateComplex(populate);

      if (isComplex) {
        const nestedQuery = populate.nestedQuery;

        const isDefaultQuery = this._isDefaultQueryPopulation(nestedQuery);

        if (isDefaultQuery) {
          Object.assign(parsedPopulates, {
            [populate.key]: Index._buildQuery(nestedQuery, queryType),
          });
        } else {
          const morphQuery = {};
          Object.entries(nestedQuery).forEach(([key, query]) => {
            const parsedQuery = Index._buildQuery(query, queryType);

            if (Object.keys(parsedQuery).length > 0) {
              Object.assign(morphQuery, {
                [key]: parsedQuery,
              });
            }
          });
          Object.assign(parsedPopulates, {
            [populate.key]: { on: morphQuery },
          });
        }
      } else {
        Object.assign(parsedPopulates, { [populate.key]: true });
      }
    }

    return parsedPopulates;
  }

  private static _isPopulateComplex<Md extends object, Dt extends object>(
    populate: StrapiPopulation<Md, Dt>
  ) {
    return populate.nestedQuery !== undefined;
  }
  // </editor-fold>
}

/**
 * Utils for obj and arrays
 */

function _set(obj: any = {}, path: string, value: any) {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  pathArray.reduce((acc, key, i) => {
    if (acc[key] === undefined) acc[key] = {};
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key];
  }, obj);

  return obj;
}

function _union(arr: any[], ...args) {
  return [...new Set(arr.concat(...args))];
}

function _unionBy(...arrays) {
  const iteratee = arrays.pop();
  if (Array.isArray(iteratee)) {
    return [];
  }
  return [...arrays].flat().filter(
    (
      (set) => (o) =>
        set.has(iteratee(o)) ? false : set.add(iteratee(o))
    )(new Set())
  );
}
